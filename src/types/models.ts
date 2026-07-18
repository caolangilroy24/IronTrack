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
  tags: MuscleGroup[]; // Muscle tags for Home Screen Heatmap (e.g., ["Chest", "Shoulders"])
  exercises: number[]; // Ordered array of Exercise IDs
}

export interface Exercise {
  id: number;
  name: string; // e.g., "Incline Dumbbell Press"
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
