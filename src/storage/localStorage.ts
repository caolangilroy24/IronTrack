import type {
  Exercise,
  LocalUser,
  LocalUserProfile,
  UserProfile,
  WorkoutLog,
  WorkoutTemplate,
} from "@/types/models";

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

export interface LocalStoragePayload {
  activeUserId: string;
  users: {
    id: string;
    name: string;
    workoutTemplates: WorkoutTemplate[];
    workoutLogs: WorkoutLog[];
    userProfile: UserProfile;
  }[];
  exercises: Exercise[];
}

function isValidLocalUserId(userId: string): boolean {
  return LOCAL_USERS.some((user) => user.id === userId);
}

function getUserScopedKey(baseKey: string, userId: string): string {
  return `irontrack.users.${userId}.${baseKey}`;
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

export function saveActiveUserId(userId: string): void {
  if (!isValidLocalUserId(userId)) {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.activeUserId, userId);
}

export function getLocalUsersWithTheme(): LocalUserProfile[] {
  return LOCAL_USERS.map((user) => ({
    ...user,
    themeColor: getUserProfile(user.id).themeColor,
  }));
}

export function getWorkoutTemplates(userId: string = getActiveUserId()): WorkoutTemplate[] {
  return readArray<WorkoutTemplate>(
    getUserScopedKey(STORAGE_KEYS.workoutTemplates, userId),
  );
}

export function saveWorkoutTemplates(
  templates: WorkoutTemplate[],
  userId: string = getActiveUserId(),
): void {
  saveArray(getUserScopedKey(STORAGE_KEYS.workoutTemplates, userId), templates);
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

export function deleteWorkoutTemplates(userId: string = getActiveUserId()): void {
  removeArray(getUserScopedKey(STORAGE_KEYS.workoutTemplates, userId));
}

export function getExercises(): Exercise[] {
  return readArray<Exercise>(STORAGE_KEYS.exercises);
}

export function saveExercises(exercises: Exercise[]): void {
  saveArray(STORAGE_KEYS.exercises, exercises);
}

export function deleteExercises(): void {
  removeArray(STORAGE_KEYS.exercises);
}

export function getWorkoutLogs(userId: string = getActiveUserId()): WorkoutLog[] {
  return readArray<WorkoutLog>(getUserScopedKey(STORAGE_KEYS.workoutLogs, userId));
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

export function getUserProfile(userId: string = getActiveUserId()): UserProfile {
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
