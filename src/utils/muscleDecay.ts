import { getWorkoutLogs, getWorkoutTemplates } from "@/storage/localStorage";
import { MUSCLE_GROUPS } from "@/types/models";
import type { MuscleGroup, WorkoutLog, WorkoutTemplate } from "@/types/models";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DECAY_WINDOW_DAYS = 5;

export type MuscleDecayMap = Record<MuscleGroup, number>;

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function getElapsedDays(from: Date, to: Date): number {
  const elapsed = startOfDay(to).getTime() - startOfDay(from).getTime();

  return Math.max(0, Math.floor(elapsed / DAY_IN_MS));
}

function normalizeIntensity(daysSinceLastWorkout: number): number {
  const rawIntensity = 1 - daysSinceLastWorkout / DECAY_WINDOW_DAYS;

  return Math.max(0, Number(rawIntensity.toFixed(2)));
}

export function createEmptyMuscleDecayMap(): MuscleDecayMap {
  return Object.fromEntries(
    MUSCLE_GROUPS.map((muscleGroup) => [muscleGroup, 0]),
  ) as MuscleDecayMap;
}

export function calculateMuscleDecayMap(
  workoutLogs: WorkoutLog[],
  workoutTemplates: WorkoutTemplate[],
  now: Date = new Date(),
): MuscleDecayMap {
  const latestLogByMuscleGroup = new Map<MuscleGroup, Date>();
  const templateById = new Map(
    workoutTemplates.map((template) => [template.id, template]),
  );

  for (const workoutLog of workoutLogs) {
    const template = templateById.get(workoutLog.templateId);

    if (!template) {
      continue;
    }

    const workoutDate = new Date(workoutLog.date);

    if (Number.isNaN(workoutDate.getTime())) {
      continue;
    }

    for (const tag of template.tags) {
      const previousDate = latestLogByMuscleGroup.get(tag);

      if (!previousDate || workoutDate > previousDate) {
        latestLogByMuscleGroup.set(tag, workoutDate);
      }
    }
  }

  return MUSCLE_GROUPS.reduce<MuscleDecayMap>((decayMap, muscleGroup) => {
    const latestWorkoutDate = latestLogByMuscleGroup.get(muscleGroup);

    decayMap[muscleGroup] = latestWorkoutDate
      ? normalizeIntensity(getElapsedDays(latestWorkoutDate, now))
      : 0;

    return decayMap;
  }, createEmptyMuscleDecayMap());
}

export function getStoredMuscleDecayMap(
  now: Date = new Date(),
): MuscleDecayMap {
  return calculateMuscleDecayMap(getWorkoutLogs(), getWorkoutTemplates(), now);
}
