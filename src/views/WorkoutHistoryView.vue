<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="view-shell q-mx-auto column q-gutter-md">
      <q-card flat bordered class="bg-dark text-white">
        <q-card-section>
          <div class="text-h5 text-weight-bold text-primary">Workout History</div>
          <div class="text-subtitle2 text-grey-5">
            Completed sessions grouped by date with total volume and set counts.
          </div>
        </q-card-section>
      </q-card>

      <q-card
        v-if="groupedLogs.length === 0"
        flat
        bordered
        class="bg-dark text-white"
      >
        <q-card-section class="text-grey-5">
          No completed workouts yet. Start a session from the workout logger.
        </q-card-section>
      </q-card>

      <div
        v-for="group in groupedLogs"
        :key="group.dateKey"
        class="column q-gutter-sm"
      >
        <div class="text-subtitle2 text-grey-4 q-px-xs">
          {{ group.dateLabel }}
        </div>

        <q-card
          v-for="entry in group.logs"
          :key="entry.id"
          flat
          bordered
          class="bg-dark text-white"
        >
          <q-card-section
            class="row items-start justify-between q-col-gutter-md"
          >
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">
                {{ entry.templateName }}
              </div>
              <div class="text-caption text-grey-5">
                {{ formatTime(entry.date) }}
              </div>
            </div>

            <div class="column items-end">
              <q-chip square color="primary" text-color="white">
                {{ entry.totalVolume }} kg
              </q-chip>
              <div class="text-caption text-grey-5 q-mt-xs">
                {{ entry.performedSets }} set{{
                  entry.performedSets === 1 ? "" : "s"
                }}
              </div>
            </div>
          </q-card-section>

          <q-separator dark inset />

          <q-card-section class="q-pt-sm text-caption text-grey-4">
            {{ entry.exerciseSummary }}
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { seedExercises } from "@/data/seedExercises";
import {
  getExercises,
  getWorkoutLogs,
  getWorkoutTemplates,
  saveExercises,
} from "@/storage/localStorage";
import type { Exercise, WorkoutLog, WorkoutTemplate } from "@/types/models";

type EnrichedLog = WorkoutLog & {
  templateName: string;
  totalVolume: number;
  performedSets: number;
  exerciseSummary: string;
};

type HistoryGroup = {
  dateKey: string;
  dateLabel: string;
  logs: EnrichedLog[];
};

const templates = getWorkoutTemplates();
const logs = getWorkoutLogs()
  .slice()
  .sort((left, right) => {
    return new Date(right.date).getTime() - new Date(left.date).getTime();
  });
const exercises = loadExercises();

const templateNameById = new Map<number, string>(
  templates.map((template) => [template.id, template.name]),
);
const exerciseNameById = new Map<number, string>(
  exercises.map((exercise) => [exercise.id, exercise.name]),
);

const groupedLogs = computed<HistoryGroup[]>(() => {
  const groups = new Map<string, EnrichedLog[]>();

  logs.forEach((log) => {
    const date = new Date(log.date);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const dateKey = date.toISOString().slice(0, 10);
    const entry = enrichLog(log);
    const entries = groups.get(dateKey) ?? [];

    groups.set(dateKey, [...entries, entry]);
  });

  return Array.from(groups.entries())
    .sort(([leftDate], [rightDate]) => rightDate.localeCompare(leftDate))
    .map(([dateKey, entries]) => ({
      dateKey,
      dateLabel: formatGroupDate(dateKey),
      logs: entries,
    }));
});

function loadExercises(): Exercise[] {
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

function enrichLog(log: WorkoutLog): EnrichedLog {
  let totalVolume = 0;
  let performedSets = 0;

  const exerciseSummary = log.exercises
    .map((exerciseLog) => {
      const exerciseName =
        exerciseNameById.get(exerciseLog.exerciseId) ??
        `Exercise #${exerciseLog.exerciseId}`;
      const completedSetCount = exerciseLog.sets.filter(
        (set) => set.completed,
      ).length;

      exerciseLog.sets.forEach((set) => {
        if (set.completed) {
          performedSets += 1;
          totalVolume += Math.max(0, set.reps) * Math.max(0, set.weight);
        }
      });

      return `${exerciseName}: ${completedSetCount} set${completedSetCount === 1 ? "" : "s"}`;
    })
    .join(" • ");

  return {
    ...log,
    templateName:
      templateNameById.get(log.templateId) ?? `Template #${log.templateId}`,
    totalVolume: Math.round(totalVolume),
    performedSets,
    exerciseSummary,
  };
}

function formatGroupDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
</script>

<style scoped>
.view-shell {
  max-width: 500px;
  min-height: 100vh;
}
</style>
