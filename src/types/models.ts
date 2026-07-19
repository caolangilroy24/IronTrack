export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Triceps",
  "Arms",
  "Abs",
  "Glutes",
  "Calves",
  "Forearms",
  "Quads",
  "Hamstrings",
  "Lower Back",
  "Upper Back",
  "Biceps",
  "Traps",
  "Neck",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export type ThemeColor = "orange" | "red" | "blue" | "purple";

export interface LocalUser {
  id: string;
  name: string;
}

export interface LocalUserProfile extends LocalUser {
  themeColor: ThemeColor;
}

export interface WorkoutTemplate {
  id: number;
  name: string; // e.g., "30-Min Chest & Shoulders"
  muscleGroups: MuscleGroup[]; // Muscle tags for Home Screen Heatmap (e.g., ["Chest", "Shoulders"])
  exercises: number[]; // Ordered array of Exercise IDs
}

export interface Exercise {
  id: number;
  name: string; // e.g., "Incline Dumbbell Press"
  muscleGroups: MuscleGroup[]; // Primary muscles targeted by the exercise
}

export interface LoggedSet {
  id: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutLog {
  id: number;
  templateId: number;
  date: string; // ISO Timestamp
  exercises: {
    exerciseId: number;
    sets: LoggedSet[];
  }[];
}

export interface UserProfile {
  themeColor: ThemeColor;
}

export interface LocalUserBackupRecord {
  id: string;
  name: string;
  workoutTemplates: WorkoutTemplate[];
  workoutLogs: WorkoutLog[];
  userProfile: UserProfile;
}

export interface LocalStoragePayload {
  activeUserId: string;
  users: LocalUserBackupRecord[];
  exercises: Exercise[];
}

export interface LocalUserStoragePayload {
  user: LocalUserBackupRecord;
  exercises: Exercise[];
}

export interface LocalUserImportPlan {
  targetUserId: string;
  targetUserName: string;
  missingWorkoutTemplates: WorkoutTemplate[];
  missingExercises: Exercise[];
}

export interface LocalUserImportOptions {
  deleteWorkoutTemplateIds?: number[];
  deleteExerciseIds?: number[];
}
