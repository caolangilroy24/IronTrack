import type {
  Exercise,
  LocalUser,
  LocalUserProfile,
  LocalStoragePayload,
  LocalUserImportOptions,
  LocalUserImportPlan,
  LocalUserStoragePayload,
  UserProfile,
  WorkoutLog,
  WorkoutTemplate,
} from "@/types/models";
import { seedExercises } from "@/data/seedExercises";
import { MUSCLE_GROUPS } from "@/types/models";
import { z } from "zod";

export const STORAGE_KEYS = {
  workoutTemplates: "workoutTemplates",
  exercises: "irontrack.exercises",
  workoutLogs: "workoutLogs",
  userProfile: "userProfile",
  activeUserId: "irontrack.activeUserId",
} as const;

export const LOCAL_USERS: LocalUser[] = [
  { id: "k-lin", name: "K-Lin" },
  { id: "maz", name: "Maz" },
  { id: "needlebeard", name: "NeedleBeard" },
  { id: "bigsteve", name: "BigSteve" },
];

const DEFAULT_ACTIVE_USER_ID = LOCAL_USERS[0].id;

const DEFAULT_USER_PROFILE: UserProfile = {
  themeColor: "orange",
};

const VALID_THEME_COLORS = new Set(["orange", "red", "blue", "purple"]);
const THEME_COLORS = ["orange", "red", "blue", "purple"] as const;
const muscleGroupSchema = z.enum(MUSCLE_GROUPS);
// we have not released yet so this can be removed in future but ensure all associated code also removed
type LegacyWorkoutTemplate = Omit<WorkoutTemplate, "muscleGroups"> & {
  tags?: unknown;
  muscleGroups?: unknown;
};

type LegacyExercise = Omit<Exercise, "muscleGroups"> & {
  muscleGroups?: unknown;
};

function isValidLocalUserId(userId: string): boolean {
  return LOCAL_USERS.some((user) => user.id === userId);
}

function getUserScopedKey(baseKey: string, userId: string): string {
  // Launch V1: Keep this user-id scoping strict and validated because profile separation is trust-based until authenticated accounts are added in Milestone 7.
  return `irontrack.users.${userId}.${baseKey}`;
}

const EXPORT_SIGNATURE_KEY = "lastExportSignature";

export function getUserExportSignature(userId: string): string | null {
  return localStorage.getItem(getUserScopedKey(EXPORT_SIGNATURE_KEY, userId));
}

export function saveUserExportSignature(
  userId: string,
  templates: WorkoutTemplate[],
  logs: WorkoutLog[],
): void {
  localStorage.setItem(
    getUserScopedKey(EXPORT_SIGNATURE_KEY, userId),
    JSON.stringify({ templates, logs }),
  );
}

export function isUserProfileStorageKey(
  key: string | null,
  userId: string,
): boolean {
  return key === getUserScopedKey(STORAGE_KEYS.userProfile, userId);
}

function normalizeMuscleGroups(value: unknown): Exercise["muscleGroups"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (muscleGroup): muscleGroup is Exercise["muscleGroups"][number] =>
      typeof muscleGroup === "string" &&
      MUSCLE_GROUPS.includes(muscleGroup as Exercise["muscleGroups"][number]),
  );
}

function normalizeWorkoutTemplate(
  template: WorkoutTemplate | LegacyWorkoutTemplate,
): WorkoutTemplate {
  const { tags, muscleGroups, ...rest } = template as LegacyWorkoutTemplate;

  return {
    ...rest,
    muscleGroups: normalizeMuscleGroups(muscleGroups ?? tags),
  } as WorkoutTemplate;
}

function normalizeExercise(exercise: Exercise | LegacyExercise): Exercise {
  const { muscleGroups, ...rest } = exercise as LegacyExercise;

  return {
    ...rest,
    muscleGroups: normalizeMuscleGroups(muscleGroups),
  } as Exercise;
}

const exerciseSchema: z.ZodType<Exercise> = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object") {
      return value;
    }

    return normalizeExercise(value as Exercise | LegacyExercise);
  },
  z.object({
    id: z.number(),
    name: z.string(),
    muscleGroups: z.array(muscleGroupSchema),
  }),
);

const workoutTemplateSchema: z.ZodType<WorkoutTemplate> = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object") {
      return value;
    }

    return normalizeWorkoutTemplate(
      value as WorkoutTemplate | LegacyWorkoutTemplate,
    );
  },
  z.object({
    id: z.number(),
    name: z.string(),
    muscleGroups: z.array(muscleGroupSchema),
    exercises: z.array(z.number()),
  }),
);

const workoutSetSchema = z.object({
  id: z.number(),
  reps: z.number(),
  weight: z.number(),
  completed: z.boolean(),
});

const workoutLogSchema: z.ZodType<WorkoutLog> = z.object({
  id: z.number(),
  templateId: z.number(),
  date: z.string(),
  exercises: z.array(
    z.object({
      exerciseId: z.number(),
      sets: z.array(workoutSetSchema),
    }),
  ),
});

const themeColorSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.enum(THEME_COLORS),
);

const userProfileSchema: z.ZodType<UserProfile> = z.object({
  themeColor: themeColorSchema,
});

const localUserStoragePayloadSchema: z.ZodType<LocalUserStoragePayload> =
  z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      workoutTemplates: z.array(workoutTemplateSchema),
      workoutLogs: z.array(workoutLogSchema),
      userProfile: userProfileSchema,
    }),
    exercises: z.array(exerciseSchema),
  });

function normalizeImportJson(rawJson: string): string {
  return rawJson
    .replace(/^\uFEFF/, "")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

function sortByNumericId<T extends { id: number }>(items: T[]): T[] {
  return items.slice().sort((left, right) => left.id - right.id);
}

function sortWorkoutLogsByDate(logs: WorkoutLog[]): WorkoutLog[] {
  return logs.slice().sort((left, right) => {
    return new Date(right.date).getTime() - new Date(left.date).getTime();
  });
}

function getNextNumericId(items: Array<{ id: number }>): number {
  return items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
}

function mergeById<T extends { id: number }>(
  existingItems: T[],
  importedItems: T[],
): T[] {
  const mergedById = new Map<number, T>();

  existingItems.forEach((item) => {
    mergedById.set(item.id, item);
  });

  importedItems.forEach((item) => {
    mergedById.set(item.id, item);
  });

  return sortByNumericId(Array.from(mergedById.values()));
}

function mergeWorkoutLogs(
  existingLogs: WorkoutLog[],
  importedLogs: WorkoutLog[],
): WorkoutLog[] {
  const mergedLogs = existingLogs.slice();
  let nextLogId = getNextNumericId(existingLogs);

  importedLogs.forEach((importedLog) => {
    const existingLog = mergedLogs.find((log) => log.id === importedLog.id);

    if (!existingLog) {
      mergedLogs.push(importedLog);
      return;
    }

    if (JSON.stringify(existingLog) === JSON.stringify(importedLog)) {
      return;
    }

    mergedLogs.push({
      ...importedLog,
      id: nextLogId,
    });
    nextLogId += 1;
  });

  return sortWorkoutLogsByDate(mergedLogs);
}

function readArray<T>(key: string): T[] {
  const value = localStorage.getItem(key);

  if (!value) {
    return [];
  }

  return JSON.parse(value) as T[];
}

function saveArray<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function removeArray(key: string): void {
  localStorage.removeItem(key);
}

function readObject<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  return JSON.parse(value) as T;
}

function saveObject<T>(key: string, item: T): void {
  localStorage.setItem(key, JSON.stringify(item));
}

export function getActiveUserId(): string {
  const storedUserId = localStorage.getItem(STORAGE_KEYS.activeUserId);

  if (storedUserId && isValidLocalUserId(storedUserId)) {
    return storedUserId;
  }

  localStorage.setItem(STORAGE_KEYS.activeUserId, DEFAULT_ACTIVE_USER_ID);

  return DEFAULT_ACTIVE_USER_ID;
}

export function getStoredActiveUserId(): string | null {
  const storedUserId = localStorage.getItem(STORAGE_KEYS.activeUserId);

  if (storedUserId && isValidLocalUserId(storedUserId)) {
    return storedUserId;
  }

  return null;
}

export function saveActiveUserId(userId: string): void {
  if (!isValidLocalUserId(userId)) {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.activeUserId, userId);
}

export function clearActiveUserId(): void {
  localStorage.removeItem(STORAGE_KEYS.activeUserId);
}

export function getLocalUsersWithTheme(): LocalUserProfile[] {
  return LOCAL_USERS.map((user) => ({
    ...user,
    themeColor: getUserProfile(user.id).themeColor,
  }));
}

export function getWorkoutTemplates(
  userId: string = getActiveUserId(),
): WorkoutTemplate[] {
  return readArray<WorkoutTemplate | LegacyWorkoutTemplate>(
    getUserScopedKey(STORAGE_KEYS.workoutTemplates, userId),
  ).map(normalizeWorkoutTemplate);
}

export function saveWorkoutTemplates(
  templates: WorkoutTemplate[],
  userId: string = getActiveUserId(),
): void {
  saveArray(
    getUserScopedKey(STORAGE_KEYS.workoutTemplates, userId),
    templates.map(normalizeWorkoutTemplate),
  );
}

export function saveWorkoutTemplate(
  template: WorkoutTemplate,
  userId: string = getActiveUserId(),
): WorkoutTemplate[] {
  const templates = getWorkoutTemplates(userId);
  const existingIndex = templates.findIndex((item) => item.id === template.id);

  if (existingIndex >= 0) {
    templates.splice(existingIndex, 1, template);
  } else {
    templates.push(template);
  }

  saveWorkoutTemplates(templates, userId);

  return templates;
}

export function deleteWorkoutTemplateById(
  id: number,
  userId: string = getActiveUserId(),
): WorkoutTemplate[] {
  const templates = getWorkoutTemplates(userId).filter(
    (template) => template.id !== id,
  );

  saveWorkoutTemplates(templates, userId);

  return templates;
}

export function deleteWorkoutTemplates(
  userId: string = getActiveUserId(),
): void {
  removeArray(getUserScopedKey(STORAGE_KEYS.workoutTemplates, userId));
}

export function getExercises(): Exercise[] {
  return readArray<Exercise | LegacyExercise>(STORAGE_KEYS.exercises).map(
    normalizeExercise,
  );
}

export function getInitializedExercises(): Exercise[] {
  const storedExercises = getExercises();
  const mergedById = new Map<number, Exercise>();

  seedExercises.forEach((exercise) => {
    mergedById.set(exercise.id, exercise);
  });

  storedExercises.forEach((exercise) => {
    mergedById.set(exercise.id, exercise);
  });

  const mergedExercises = Array.from(mergedById.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  saveExercises(mergedExercises);

  return mergedExercises;
}

export function saveExercises(exercises: Exercise[]): void {
  saveArray(STORAGE_KEYS.exercises, exercises.map(normalizeExercise));
}

export function deleteExercises(): void {
  removeArray(STORAGE_KEYS.exercises);
}

export function getWorkoutLogs(
  userId: string = getActiveUserId(),
): WorkoutLog[] {
  return readArray<WorkoutLog>(
    getUserScopedKey(STORAGE_KEYS.workoutLogs, userId),
  );
}

export function saveWorkoutLogs(
  logs: WorkoutLog[],
  userId: string = getActiveUserId(),
): void {
  saveArray(getUserScopedKey(STORAGE_KEYS.workoutLogs, userId), logs);
}

export function deleteWorkoutLogs(userId: string = getActiveUserId()): void {
  removeArray(getUserScopedKey(STORAGE_KEYS.workoutLogs, userId));
}

export function getUserProfile(
  userId: string = getActiveUserId(),
): UserProfile {
  return readObject<UserProfile>(
    getUserScopedKey(STORAGE_KEYS.userProfile, userId),
    DEFAULT_USER_PROFILE,
  );
}

export function saveUserProfile(
  profile: UserProfile,
  userId: string = getActiveUserId(),
): void {
  saveObject(getUserScopedKey(STORAGE_KEYS.userProfile, userId), profile);
}

export function deleteUserProfile(userId: string = getActiveUserId()): void {
  localStorage.removeItem(getUserScopedKey(STORAGE_KEYS.userProfile, userId));
}

export function getLocalStoragePayload(): LocalStoragePayload {
  const activeUserId = getActiveUserId();

  return {
    activeUserId,
    users: LOCAL_USERS.map((user) => ({
      id: user.id,
      name: user.name,
      workoutTemplates: getWorkoutTemplates(user.id),
      workoutLogs: getWorkoutLogs(user.id),
      userProfile: getUserProfile(user.id),
    })),
    exercises: getExercises(),
  };
}

export function getLocalUserStoragePayload(
  userId: string = getActiveUserId(),
): LocalUserStoragePayload {
  // Launch V1: Backup payload is plain JSON for portability; if host threat model changes, introduce encryption-at-rest for exported files.
  const localUser =
    LOCAL_USERS.find((user) => user.id === userId) ?? LOCAL_USERS[0];

  return {
    user: {
      id: localUser.id,
      name: localUser.name,
      workoutTemplates: getWorkoutTemplates(localUser.id),
      workoutLogs: getWorkoutLogs(localUser.id),
      userProfile: getUserProfile(localUser.id),
    },
    exercises: getExercises(),
  };
}

export function parseLocalUserStoragePayload(
  json: string,
): LocalUserStoragePayload | null {
  try {
    const parsed = JSON.parse(normalizeImportJson(json)) as unknown;
    const result = localUserStoragePayloadSchema.safeParse(parsed);

    if (!result.success) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export function getLocalUserImportPlan(
  payload: LocalUserStoragePayload,
): LocalUserImportPlan | null {
  if (!isValidLocalUserId(payload.user.id)) {
    return null;
  }

  const targetUser = LOCAL_USERS.find((user) => user.id === payload.user.id);

  if (!targetUser) {
    return null;
  }

  if (payload.user.name !== targetUser.name) {
    return null;
  }

  const existingTemplates = getWorkoutTemplates(targetUser.id);
  const existingExercises = getExercises();

  return {
    targetUserId: targetUser.id,
    targetUserName: targetUser.name,
    missingWorkoutTemplates: existingTemplates.filter(
      (template) =>
        !payload.user.workoutTemplates.some(
          (importedTemplate) => importedTemplate.id === template.id,
        ),
    ), // using just Id in this check might lead to false positives if the imported template has the same Id but different content, but this is a reasonable compromise for now
    missingExercises: existingExercises.filter(
      (exercise) =>
        !payload.exercises.some(
          (importedExercise) => importedExercise.id === exercise.id,
        ),
    ), // using just Id in this check might lead to false positives if the imported template has the same Id but different content, but this is a reasonable compromise for now
  };
}

export function applyLocalUserStorageImport(
  payload: LocalUserStoragePayload,
  options: LocalUserImportOptions = {},
): LocalUserImportPlan | null {
  const plan = getLocalUserImportPlan(payload);

  if (!plan) {
    return null;
  }

  const workoutTemplateDeleteSet = new Set(
    options.deleteWorkoutTemplateIds ?? [],
  );
  const exerciseDeleteSet = new Set(options.deleteExerciseIds ?? []);

  const mergedTemplates = mergeById(
    getWorkoutTemplates(plan.targetUserId).filter(
      (template) => !workoutTemplateDeleteSet.has(template.id),
    ),
    payload.user.workoutTemplates,
  );
  const mergedExercises = mergeById(
    getExercises().filter((exercise) => !exerciseDeleteSet.has(exercise.id)),
    payload.exercises,
  );
  const mergedLogs = mergeWorkoutLogs(
    getWorkoutLogs(plan.targetUserId),
    payload.user.workoutLogs,
  );

  saveWorkoutTemplates(mergedTemplates, plan.targetUserId);
  saveExercises(mergedExercises);
  saveWorkoutLogs(mergedLogs, plan.targetUserId);
  saveUserProfile(payload.user.userProfile, plan.targetUserId);

  return plan;
}
