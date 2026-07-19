<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="manager-shell q-mx-auto column q-gutter-md">
      <q-card flat bordered class="bg-dark text-white">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-primary">Workout Templates</div>
          <div class="text-subtitle2 text-grey-5">
            Build and maintain reusable routines for fast workout starts.
          </div>
        </q-card-section>

        <q-separator dark />

        <q-card-section>
          <q-form class="column q-gutter-md" @submit.prevent="submitTemplate">
            <q-input
              v-model="form.name"
              filled
              dark
              color="deep-orange"
              label="Routine name"
              placeholder="30-Min Chest & Shoulders"
            />

            <div>
              <div class="text-subtitle2 text-grey-4 q-mb-sm">Muscle groups</div>
              <div class="row q-gutter-sm">
                <q-chip
                  v-for="muscleGroup in templateMuscleGroups"
                  :key="muscleGroup"
                  clickable
                  square
                  :color="form.muscleGroups.includes(muscleGroup) ? 'deep-orange' : 'grey-9'"
                  :text-color="form.muscleGroups.includes(muscleGroup) ? 'black' : 'white'"
                  @click="toggleMuscleGroup(muscleGroup)"
                >
                  {{ muscleGroup }}
                </q-chip>
              </div>
            </div>

            <q-select
              v-model="form.exercises"
              filled
              dark
              color="deep-orange"
              label="Exercises"
              multiple
              use-chips
              emit-value
              map-options
              :options="exerciseOptions"
            />

            <div class="row q-gutter-sm">
              <q-btn
                unelevated
                color="deep-orange"
                text-color="black"
                :label="
                  editingTemplateId === null
                    ? 'Save template'
                    : 'Update template'
                "
                type="submit"
                :disable="isSubmitDisabled"
              />
              <q-btn
                flat
                color="grey-5"
                label="Clear"
                :disable="isPristine"
                @click="resetForm"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="bg-dark text-white">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-subtitle1 text-weight-medium">Saved templates</div>
            <div class="text-caption text-grey-5">
              {{ templates.length }} routine{{
                templates.length === 1 ? "" : "s"
              }}
              in local storage
            </div>
          </div>
        </q-card-section>

        <q-separator dark />

        <q-card-section v-if="templates.length === 0" class="text-grey-5">
          No workout templates saved yet.
        </q-card-section>

        <q-card-section v-else class="column q-gutter-sm">
          <q-card
            v-for="template in templates"
            :key="template.id"
            flat
            bordered
            class="bg-grey-10 text-white"
          >
            <q-card-section
              class="row items-start justify-between q-col-gutter-md"
            >
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">
                  {{ template.name }}
                </div>
                <div class="row q-gutter-xs q-mt-sm">
                  <q-chip
                    v-for="muscleGroup in template.muscleGroups"
                    :key="`${template.id}-${muscleGroup}`"
                    dense
                    square
                    color="deep-orange"
                    text-color="black"
                  >
                    {{ muscleGroup }}
                  </q-chip>
                </div>
                <div class="text-caption text-grey-5 q-mt-sm">
                  {{ describeExercises(template.exercises) }}
                </div>
              </div>

              <div class="column q-gutter-sm">
                <q-btn
                  flat
                  color="deep-orange"
                  label="Edit"
                  @click="startEdit(template)"
                />
                <q-btn
                  flat
                  color="negative"
                  label="Delete"
                  @click="removeTemplate(template.id)"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { seedExercises } from "@/data/seedExercises";
import {
  deleteWorkoutTemplateById,
  getExercises,
  getWorkoutTemplates,
  saveExercises,
  saveWorkoutTemplate,
} from "@/storage/localStorage";
import { MUSCLE_GROUPS } from "@/types/models";
import type { Exercise, MuscleGroup, WorkoutTemplate } from "@/types/models";

type TemplateFormState = {
  name: string;
  muscleGroups: MuscleGroup[];
  exercises: number[];
};

const templateMuscleGroups: MuscleGroup[] = [
  "Chest",
  "Shoulders",
  "Triceps",
  "Back",
  "Legs",
  "Abs",
  "Arms",
  "Glutes",
  "Calves",
  "Forearms",
];

const editingTemplateId = ref<number | null>(null);
const templates = ref<WorkoutTemplate[]>(getWorkoutTemplates());
const exercises = ref<Exercise[]>(loadExercises());
const form = reactive<TemplateFormState>({
  name: "",
  muscleGroups: [],
  exercises: [],
});

const exerciseOptions = computed(() =>
  exercises.value.map((exercise) => ({
    label: exercise.name,
    value: exercise.id,
  })),
);

const isSubmitDisabled = computed(
  () =>
    form.name.trim().length === 0 ||
    form.muscleGroups.length === 0 ||
    form.exercises.length === 0,
);

const isPristine = computed(
  () =>
    editingTemplateId.value === null &&
    form.name.length === 0 &&
    form.muscleGroups.length === 0 &&
    form.exercises.length === 0,
);

function loadExercises(): Exercise[] {
  const storedExercises = getExercises();

  if (storedExercises.length > 0) {
    return storedExercises;
  }

  saveExercises(seedExercises);

  return seedExercises;
}

function toggleMuscleGroup(muscleGroup: MuscleGroup): void {
  if (!MUSCLE_GROUPS.includes(muscleGroup)) {
    return;
  }

  form.muscleGroups = form.muscleGroups.includes(muscleGroup)
    ? form.muscleGroups.filter((item) => item !== muscleGroup)
    : [...form.muscleGroups, muscleGroup];
}

function submitTemplate(): void {
  if (isSubmitDisabled.value) {
    return;
  }

  const template: WorkoutTemplate = {
    id: editingTemplateId.value ?? getNextTemplateId(),
    name: form.name.trim(),
    muscleGroups: [...form.muscleGroups],
    exercises: [...form.exercises],
  };

  templates.value = saveWorkoutTemplate(template).sort(
    (left, right) => left.id - right.id,
  );
  resetForm();
}

function startEdit(template: WorkoutTemplate): void {
  editingTemplateId.value = template.id;
  form.name = template.name;
  form.muscleGroups = [...template.muscleGroups];
  form.exercises = [...template.exercises];
}

function removeTemplate(id: number): void {
  templates.value = deleteWorkoutTemplateById(id);

  if (editingTemplateId.value === id) {
    resetForm();
  }
}

function resetForm(): void {
  editingTemplateId.value = null;
  form.name = "";
  form.muscleGroups = [];
  form.exercises = [];
}

function getNextTemplateId(): number {
  return (
    templates.value.reduce(
      (maxId, template) => Math.max(maxId, template.id),
      0,
    ) + 1
  );
}

function describeExercises(exerciseIds: number[]): string {
  const names = exerciseIds
    .map(
      (exerciseId) =>
        exercises.value.find((exercise) => exercise.id === exerciseId)?.name,
    )
    .filter((name): name is string => Boolean(name));

  return names.join(" • ");
}
</script>

<style scoped>
.manager-shell {
  max-width: 450px;
  min-height: 100vh;
}
</style>
