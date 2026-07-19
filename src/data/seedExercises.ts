import type { Exercise } from "@/types/models";

export const seedExercises: Exercise[] = [
  {
    id: 1,
    name: "Bench Press",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
  },
  { id: 2, name: "Squat", muscleGroups: ["Legs", "Quads", "Glutes"] },
  {
    id: 3,
    name: "Incline Dumbbell Press",
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
  },
  {
    id: 4,
    name: "Pull-ups",
    muscleGroups: ["Back", "Biceps", "Forearms", "Upper Back"],
  },
  {
    id: 5,
    name: "Deadlift",
    muscleGroups: ["Lower Back", "Glutes", "Hamstrings", "Forearms"],
  },
  { id: 6, name: "Overhead Press", muscleGroups: ["Shoulders", "Triceps"] },
  {
    id: 7,
    name: "Barbell Row",
    muscleGroups: ["Back", "Biceps", "Upper Back", "Forearms"],
  },
  {
    id: 8,
    name: "Lat Pulldown",
    muscleGroups: ["Back", "Biceps", "Upper Back"],
  },
  { id: 9, name: "Leg Press", muscleGroups: ["Legs", "Quads", "Glutes"] },
  {
    id: 10,
    name: "Romanian Deadlift",
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
  },
  { id: 11, name: "Dumbbell Flyes", muscleGroups: ["Chest", "Shoulders"] },
  {
    id: 12,
    name: "Tricep Dips",
    muscleGroups: ["Triceps", "Chest", "Shoulders"],
  },
  { id: 13, name: "Bicep Curls", muscleGroups: ["Biceps", "Forearms", "Arms"] },
  { id: 14, name: "Lateral Raises", muscleGroups: ["Shoulders", "Traps"] },
  { id: 15, name: "Leg Curls", muscleGroups: ["Hamstrings"] },
  { id: 16, name: "Leg Extensions", muscleGroups: ["Quads"] },
  { id: 17, name: "Calf Raises", muscleGroups: ["Calves"] },
  { id: 18, name: "Plank", muscleGroups: ["Abs", "Lower Back"] },
  { id: 19, name: "Russian Twists", muscleGroups: ["Abs"] },
  { id: 20, name: "Hanging Leg Raises", muscleGroups: ["Abs"] },
];
