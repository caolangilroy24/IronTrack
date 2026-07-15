<template>
  <q-layout view="lHh Lpr lFf" class="bg-black text-white">
    <q-header bordered class="bg-dark text-white">
      <q-toolbar class="q-px-md q-py-sm">
        <div>
          <div class="text-overline text-primary">IronTrack</div>
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
                @click="goTo(view.path)"
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
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { setCssVar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import { STORAGE_KEYS, getUserProfile } from "@/storage/localStorage";
import { THEME_PALETTES } from "@/utils/themePalette";

type ViewKey = "dashboard" | "templates" | "exercises" | "history" | "workout";

const router = useRouter();
const route = useRoute();

const views: { key: ViewKey; label: string; caption: string; path: string }[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    caption: "Recovery heatmap and theme controls.",
    path: "/",
  },
  {
    key: "templates",
    label: "Workouts",
    caption: "Create, edit, and delete reusable routine templates.",
    path: "/workouts",
  },
  {
    key: "exercises",
    label: "Exercises",
    caption: "Search every exercise available from seed data and local storage.",
    path: "/exercises",
  },
  {
    key: "history",
    label: "Workout History",
    caption: "Review completed sessions grouped by training date.",
    path: "/history",
  },
  {
    key: "workout",
    label: "Start Workout",
    caption: "Run the gym floor logging loop with template-based set targets.",
    path: "/workout",
  },
];

const activeView = computed(
  () =>
    views.find(
      (view) =>
        view.path === route.path ||
        (route.path === "/logs" && view.path === "/history"),
    ) ?? views[0],
);

function goTo(path: string): void {
  if (route.path !== path) {
    void router.push(path);
  }
}

function applyThemeFromProfile(): void {
  const palette = THEME_PALETTES[getUserProfile().themeColor];

  setCssVar("primary", palette.high);
  setCssVar("secondary", palette.med);
  setCssVar("accent", palette.low);
}

function handleStorageSync(event: StorageEvent): void {
  if (event.key === STORAGE_KEYS.userProfile) {
    applyThemeFromProfile();
  }
}

onMounted(() => {
  applyThemeFromProfile();
  window.addEventListener("storage", handleStorageSync);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageSync);
});
</script>
