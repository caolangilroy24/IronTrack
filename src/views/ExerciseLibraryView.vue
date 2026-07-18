<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="view-shell q-mx-auto column q-gutter-md">
      <q-card flat bordered class="bg-dark text-white">
        <q-card-section>
          <div class="text-h5 text-weight-bold text-primary">Exercise Library</div>
          <div class="text-subtitle2 text-grey-5">
            Search every exercise synced from seed data and local storage.
          </div>
        </q-card-section>

        <q-separator dark />

        <q-card-section>
          <q-input
            v-model="searchQuery"
            filled
            dark
            color="primary"
            label="Search exercises"
            placeholder="Bench, squat, row..."
            clearable
          >
            <template #prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="bg-dark text-white">
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-medium">All Exercises</div>
          <q-chip square color="primary" text-color="white">
            {{ filteredExercises.length }}
          </q-chip>
        </q-card-section>

        <q-separator dark />

        <q-list separator dark>
          <q-item v-for="exercise in filteredExercises" :key="exercise.id">
            <q-item-section avatar>
              <q-chip square dense color="grey-9" text-color="grey-3">
                #{{ exercise.id }}
              </q-chip>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ exercise.name }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="filteredExercises.length === 0">
            <q-item-section class="text-grey-5">
              No exercises match your current search.
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { seedExercises } from "@/data/seedExercises";
import { getExercises, saveExercises } from "@/storage/localStorage";
import type { Exercise } from "@/types/models";

const searchQuery = ref("");
const exercises = ref<Exercise[]>(loadExercises());

const filteredExercises = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  if (query.length === 0) {
    return exercises.value;
  }

  return exercises.value.filter((exercise) =>
    exercise.name.toLowerCase().includes(query),
  );
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
</script>

<style scoped>
.view-shell {
  max-width: 500px;
  min-height: 100vh;
}
</style>
