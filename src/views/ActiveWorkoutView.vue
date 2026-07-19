<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="view-shell q-mx-auto column q-gutter-md">
      <q-card flat bordered class="bg-dark text-white">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-primary">Workout Logger</div>
          <div class="text-subtitle2 text-grey-5">
            Pick a template, complete sets with one tap, and save instantly.
          </div>
        </q-card-section>

        <q-separator dark />

        <q-card-section class="column q-gutter-md">
          <q-select
            v-model="selectedTemplateId"
            filled
            dark
            color="primary"
            label="Workout template"
            emit-value
            map-options
            :options="templateOptions"
            @update:model-value="handleTemplatePick"
          />

          <div
            v-if="selectedTemplateId !== null"
            class="text-caption text-grey-5"
          >
            {{ previousLogDescription }}
          </div>
        </q-card-section>
      </q-card>

      <q-card
        v-if="selectedTemplateId !== null"
        flat
        bordered
        class="bg-dark text-white"
      >
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-medium">Set Tracker</div>
          <q-chip square color="primary" text-color="white">
            {{ completedSetCount }} / {{ totalSetCount }}
          </q-chip>
        </q-card-section>

        <q-separator dark />

        <q-card-section class="column q-gutter-md">
          <q-card
            v-for="exerciseDraft in activeExerciseDrafts"
            :key="exerciseDraft.exerciseId"
            flat
            bordered
            class="bg-grey-10 text-white"
          >
            <q-card-section>
              <div class="text-subtitle2 text-weight-medium">
                {{ getExerciseName(exerciseDraft.exerciseId) }}
              </div>
            </q-card-section>

            <q-separator dark inset />

            <q-card-section class="column q-gutter-sm">
              <div
                v-for="setDraft in exerciseDraft.sets"
                :key="`${exerciseDraft.exerciseId}-${setDraft.id}`"
                class="row items-center q-col-gutter-sm"
              >
                <div class="col-2 text-caption text-grey-5">
                  Set {{ setDraft.id }}
                </div>

                <div class="col-4">
                  <q-input
                    v-model.number="setDraft.reps"
                    filled
                    dense
                    dark
                    color="primary"
                    type="number"
                    min="0"
                    label="Reps"
                    :placeholder="String(setDraft.targetReps)"
                  />
                </div>

                <div class="col-4">
                  <q-input
                    v-model.number="setDraft.weight"
                    filled
                    dense
                    dark
                    color="primary"
                    type="number"
                    min="0"
                    label="Weight"
                    :placeholder="String(setDraft.targetWeight)"
                  />
                </div>

                <div class="col-2 flex flex-center">
                  <q-checkbox
                    v-model="setDraft.completed"
                    color="primary"
                    keep-color
                    dense
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-btn
            unelevated
            color="primary"
            text-color="white"
            :label="saveButtonLabel"
            :icon="saveButtonIcon"
            :loading="isSaving"
            :disable="activeExerciseDrafts.length === 0 || isSaving"
            @click="finishWorkout"
          />
        </q-card-section>
      </q-card>

      <q-card v-else flat bordered class="bg-dark text-white">
        <q-card-section class="text-grey-5">
          Select a template to begin a workout session.
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Notify } from "quasar";
import { useRouter } from "vue-router";
import { seedExercises } from "@/data/seedExercises";
import {
  getExercises,
  getWorkoutLogs,
  getWorkoutTemplates,
  saveExercises,
  saveWorkoutLogs,
} from "@/storage/localStorage";
import type {
  Exercise,
  LoggedSet,
  WorkoutLog,
  WorkoutTemplate,
} from "@/types/models";

type DraftSet = {
  id: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
  targetReps: number;
  targetWeight: number;
};

type DraftExercise = {
  exerciseId: number;
  sets: DraftSet[];
};

const router = useRouter();
const templates = ref<WorkoutTemplate[]>(getWorkoutTemplates());
const exercises = loadExercises();
const selectedTemplateId = ref<number | null>(null);
const activeExerciseDrafts = ref<DraftExercise[]>([]);
const previousLogDate = ref<string | null>(null);
const isSaving = ref(false);
const saveConfirmed = ref(false);
const exerciseNameById = new Map<number, string>(
  exercises.map((exercise) => [exercise.id, exercise.name]),
);

const templateOptions = computed(() =>
  templates.value.map((template) => ({
    label: template.name,
    value: template.id,
  })),
);

const totalSetCount = computed(() =>
  activeExerciseDrafts.value.reduce(
    (setCount, exerciseDraft) => setCount + exerciseDraft.sets.length,
    0,
  ),
);

const completedSetCount = computed(() =>
  activeExerciseDrafts.value.reduce(
    (setCount, exerciseDraft) =>
      setCount +
      exerciseDraft.sets.filter((setDraft) => setDraft.completed).length,
    0,
  ),
);

const previousLogDescription = computed(() => {
  if (previousLogDate.value === null) {
    return "No previous log found. Using default 3x8 placeholders.";
  }

  return `Targets loaded from your last session on ${formatDate(previousLogDate.value)}.`;
});

const saveButtonLabel = computed(() => {
  if (isSaving.value) {
    return "Saving...";
  }

  if (saveConfirmed.value) {
    return "Saved";
  }

  return "Finish & Save Workout";
});

const saveButtonIcon = computed(() => {
  if (saveConfirmed.value) {
    return "check_circle";
  }

  return "save";
});

function handleTemplatePick(templateId: number | null): void {
  if (templateId === null) {
    activeExerciseDrafts.value = [];
    previousLogDate.value = null;
    return;
  }

  const template = templates.value.find((entry) => entry.id === templateId);

  if (!template) {
    return;
  }

  const previousLog = findLatestLogByTemplate(template.id);

  previousLogDate.value = previousLog?.date ?? null;
  activeExerciseDrafts.value = template.exercises.map((exerciseId) => {
    const previousExercise = previousLog?.exercises.find(
      (entry) => entry.exerciseId === exerciseId,
    );

    return {
      exerciseId,
      sets: buildDraftSets(previousExercise?.sets ?? []),
    };
  });
}

function buildDraftSets(previousSets: LoggedSet[]): DraftSet[] {
  if (previousSets.length === 0) {
    return [1, 2, 3].map((id) => ({
      id,
      reps: null,
      weight: null,
      completed: false,
      targetReps: 8,
      targetWeight: 0,
    }));
  }

  return previousSets.map((set, index) => ({
    id: index + 1,
    reps: null,
    weight: null,
    completed: false,
    targetReps: set.reps,
    targetWeight: set.weight,
  }));
}

function findLatestLogByTemplate(templateId: number): WorkoutLog | undefined {
  const logs = getWorkoutLogs()
    .filter((entry) => entry.templateId === templateId)
    .sort((left, right) => {
      return new Date(right.date).getTime() - new Date(left.date).getTime();
    });

  return logs[0];
}

async function finishWorkout(): Promise<void> {
  if (
    isSaving.value ||
    selectedTemplateId.value === null ||
    activeExerciseDrafts.value.length === 0
  ) {
    return;
  }

  isSaving.value = true;

  const existingLogs = getWorkoutLogs();

  const newLog: WorkoutLog = {
    id: getNextLogId(existingLogs),
    templateId: selectedTemplateId.value,
    date: new Date().toISOString(),
    exercises: activeExerciseDrafts.value.map((exerciseDraft) => ({
      exerciseId: exerciseDraft.exerciseId,
      sets: exerciseDraft.sets.map((setDraft) => ({
        id: setDraft.id,
        reps: normalizeNumber(setDraft.reps, setDraft.targetReps),
        weight: normalizeNumber(setDraft.weight, setDraft.targetWeight),
        completed: setDraft.completed,
      })),
    })),
  };

  saveWorkoutLogs([...existingLogs, newLog]);
  saveConfirmed.value = true;

  Notify.create({
    type: "positive",
    icon: "check_circle",
    color: "primary",
    textColor: "white",
    message: "Workout saved to local history.",
    timeout: 1100,
    position: "top",
  });

  await wait(850);
  await router.push("/");

  isSaving.value = false;
  saveConfirmed.value = false;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

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

function getNextLogId(logs: WorkoutLog[]): number {
  return logs.reduce((maxId, log) => Math.max(maxId, log.id), 0) + 1;
}

function normalizeNumber(value: number | null, fallback: number): number {
  if (value === null || Number.isNaN(value)) {
    return Math.max(0, fallback);
  }

  return Math.max(0, value);
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "unknown date";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getExerciseName(exerciseId: number): string {
  return exerciseNameById.get(exerciseId) ?? `Exercise #${exerciseId}`;
}
</script>

<style scoped>
.view-shell {
  max-width: 560px;
  min-height: 100vh;
}
</style>
