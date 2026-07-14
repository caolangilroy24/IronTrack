<template>
  <q-layout view="lHh Lpr lFf" class="bg-black text-white">
    <q-header bordered class="bg-dark text-white">
      <q-toolbar class="q-px-md q-py-sm">
        <div>
          <div class="text-overline text-deep-orange">IronTrack</div>
          <div class="text-subtitle1 text-weight-medium">{{ activeView.label }}</div>
        </div>

        <q-space />

        <q-btn flat round dense aria-label="Open navigation menu">
          <div class="column q-gutter-xs">
            <q-separator dark color="white" style="width: 18px" />
            <q-separator dark color="white" style="width: 18px" />
            <q-separator dark color="white" style="width: 18px" />
          </div>

          <q-menu dark class="bg-grey-10 text-white">
            <q-list separator style="min-width: 220px">
              <q-item
                v-for="view in views"
                :key="view.key"
                clickable
                v-close-popup
                @click="currentView = view.key"
              >
                <q-item-section>
                  <q-item-label>{{ view.label }}</q-item-label>
                  <q-item-label caption class="text-grey-5">
                    {{ view.caption }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container class="bg-black">
      <Dashboard v-if="currentView === 'dashboard'" />
      <RoutineTemplateManager v-else-if="currentView === 'templates'" />

      <q-page v-else class="bg-black text-white q-pa-md">
        <div class="q-mx-auto" style="max-width: 450px; min-height: 100vh">
          <q-card flat bordered class="bg-dark text-white">
            <q-card-section>
              <div class="text-overline text-deep-orange">Milestone 3</div>
              <div class="text-h5 text-weight-bold">{{ activeView.label }}</div>
              <div class="text-subtitle2 text-grey-5">
                {{ activeView.caption }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Dashboard from "@/components/Dashboard.vue";
import RoutineTemplateManager from "@/components/RoutineTemplateManager.vue";

type ViewKey = "dashboard" | "templates" | "exercises" | "workout-log" | "start-workout";

const views: { key: ViewKey; label: string; caption: string }[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    caption: "Recovery heatmap and theme controls.",
  },
  {
    key: "templates",
    label: "Workouts",
    caption: "Create, edit, and delete reusable routine templates.",
  },
  {
    key: "exercises",
    label: "Exercises",
    caption: "Exercise management will stay dictionary-based until a later milestone.",
  },
  {
    key: "workout-log",
    label: "Workout Log",
    caption: "The active logging screen is scheduled for Milestone 4.",
  },
  {
    key: "start-workout",
    label: "Start Workout",
    caption: "Workout launch flows will be added with the gym floor log engine.",
  },
];

const currentView = ref<ViewKey>("dashboard");
const activeView = computed(
  () => views.find((view) => view.key === currentView.value) ?? views[0],
);
</script>
