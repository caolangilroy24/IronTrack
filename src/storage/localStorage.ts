import type {
  Exercise,
  UserProfile,
  WorkoutLog,
  WorkoutTemplate,
} from "@/types/models";

export const STORAGE_KEYS = {
  workoutTemplates: "irontrack.workoutTemplates",
  exercises: "irontrack.exercises",
  workoutLogs: "irontrack.workoutLogs",
  userProfile: "irontrack.userProfile",
} as const;

const DEFAULT_USER_PROFILE: UserProfile = {
  themeColor: "orange",
};

export interface LocalStoragePayload {
  workoutTemplates: WorkoutTemplate[];
  exercises: Exercise[];
  workoutLogs: WorkoutLog[];
  userProfile: UserProfile;
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

export function getWorkoutTemplates(): WorkoutTemplate[] {
  return readArray<WorkoutTemplate>(STORAGE_KEYS.workoutTemplates);
}

export function saveWorkoutTemplates(templates: WorkoutTemplate[]): void {
  saveArray(STORAGE_KEYS.workoutTemplates, templates);
}

export function saveWorkoutTemplate(template: WorkoutTemplate): WorkoutTemplate[] {
  const templates = getWorkoutTemplates();
  const existingIndex = templates.findIndex((item) => item.id === template.id);

  if (existingIndex >= 0) {
    templates.splice(existingIndex, 1, template);
  } else {
    templates.push(template);
  }

  saveWorkoutTemplates(templates);

  return templates;
}

export function deleteWorkoutTemplateById(id: number): WorkoutTemplate[] {
  const templates = getWorkoutTemplates().filter((template) => template.id !== id);

  saveWorkoutTemplates(templates);

  return templates;
}

export function deleteWorkoutTemplates(): void {
  removeArray(STORAGE_KEYS.workoutTemplates);
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

export function getWorkoutLogs(): WorkoutLog[] {
  return readArray<WorkoutLog>(STORAGE_KEYS.workoutLogs);
}

export function saveWorkoutLogs(logs: WorkoutLog[]): void {
  saveArray(STORAGE_KEYS.workoutLogs, logs);
}

export function deleteWorkoutLogs(): void {
  removeArray(STORAGE_KEYS.workoutLogs);
}

export function getUserProfile(): UserProfile {
  return readObject<UserProfile>(STORAGE_KEYS.userProfile, DEFAULT_USER_PROFILE);
}

export function saveUserProfile(profile: UserProfile): void {
  saveObject(STORAGE_KEYS.userProfile, profile);
}

export function deleteUserProfile(): void {
  localStorage.removeItem(STORAGE_KEYS.userProfile);
}

export function getLocalStoragePayload(): LocalStoragePayload {
  return {
    workoutTemplates: getWorkoutTemplates(),
    exercises: getExercises(),
    workoutLogs: getWorkoutLogs(),
    userProfile: getUserProfile(),
  };
}
