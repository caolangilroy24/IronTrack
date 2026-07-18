<template>
  <q-layout view="lHh Lpr lFf" class="bg-black text-white">
    <q-header bordered class="bg-dark text-white">
      <q-toolbar class="q-px-md q-py-sm">
        <div>
          <div class="brand-title text-primary">Láidir</div>
          <div class="text-subtitle1 text-weight-medium">{{ activeView.label }}</div>
        </div>

        <q-space />

        <q-btn-dropdown
          flat
          dense
          no-caps
          color="primary"
          class="q-mr-xs"
          :label="activeUserName"
          dropdown-icon="keyboard_arrow_down"
          aria-label="Select active user"
        >
          <q-list dark class="bg-grey-10 text-white" style="min-width: 170px">
            <q-item
              v-for="user in userOptions"
              :key="user.value"
              clickable
              v-close-popup
              @click="handleUserChange(user.value)"
            >
              <q-item-section>
                <q-item-label>{{ user.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

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
      <router-view :key="activeUserId" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { setCssVar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import {
  LOCAL_USERS,
  STORAGE_KEYS,
  getActiveUserId,
  getUserProfile,
  saveActiveUserId,
} from "@/storage/localStorage";
import { THEME_PALETTES } from "@/utils/themePalette";

type ViewKey = "dashboard" | "templates" | "exercises" | "history" | "workout";

const router = useRouter();
const route = useRoute();
const activeUserId = ref<string>(getActiveUserId());

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
    label: "Workout Logger",
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

const userOptions = computed(() =>
  LOCAL_USERS.map((user) => ({
    label: user.name,
    value: user.id,
  })),
);

const activeUserName = computed(
  () =>
    userOptions.value.find((user) => user.value === activeUserId.value)?.label ??
    "User",
);

function goTo(path: string): void {
  if (route.path !== path) {
    void router.push(path);
  }
}

function applyThemeFromProfile(): void {
  const palette = THEME_PALETTES[getUserProfile(activeUserId.value).themeColor];

  setCssVar("primary", palette.high);
  setCssVar("secondary", palette.med);
  setCssVar("accent", palette.low);
}

function handleUserChange(userId: string): void {
  saveActiveUserId(userId);
  activeUserId.value = getActiveUserId();
  applyThemeFromProfile();
}

function handleStorageSync(event: StorageEvent): void {
  if (
    event.key === STORAGE_KEYS.activeUserId ||
    event.key === `irontrack.users.${activeUserId.value}.${STORAGE_KEYS.userProfile}`
  ) {
    if (event.key === STORAGE_KEYS.activeUserId) {
      activeUserId.value = getActiveUserId();
    }

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

<style scoped>
.brand-title {
  font-family: "Avenir Next", "Segoe UI", sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
