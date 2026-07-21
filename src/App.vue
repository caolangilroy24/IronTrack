<template>
  <q-layout view="lHh Lpr lFf" class="bg-black text-white">
    <!--
      Keeping this full-width header for future responsive laptop/desktop layouts.
      For now, navigation controls are moved into the in-frame mobile header below.
    <q-header bordered class="bg-dark text-white">
      <q-toolbar class="q-px-md q-py-sm">
        <div>
          <div class="brand-title text-primary">{{ APP_CONFIG.displayName }}</div>
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
    -->

    <q-page-container class="bg-black">
      <div class="phone-shell q-mx-auto">
        <div class="in-frame-header">
          <q-toolbar class="q-px-sm q-py-xs">
            <div class="brand-title brand-title--compact text-primary">
              {{ APP_CONFIG.displayName }}
            </div>

            <q-space />

            <q-btn
              flat
              dense
              no-caps
              color="primary"
              class="q-mr-xs active-user-pill"
              :label="activeUserName"
              aria-label="Active user"
            >
              <q-menu dark class="bg-grey-10 text-white">
                <q-list separator style="min-width: 180px">
                  <q-item
                    clickable
                    v-close-popup
                    @click="openStandaloneImportDialog"
                  >
                    <q-item-section>
                      <q-item-label>Import Data</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="handleExportData">
                    <q-item-section>
                      <q-item-label>Export Data</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="openLogoutDialog">
                    <q-item-section>
                      <q-item-label>Logout</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

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
        </div>

        <router-view v-if="hasActiveUser" :key="activeUserId ?? 'no-user'" />
      </div>
    </q-page-container>

    <app-dialog-shell
      v-model="isLoginDialogOpen"
      :persistent="dialogMode === 'login' && !isImportDialogStandalone"
      :show-close-button="dialogMode === 'import'"
      close-aria-label="Close import dialog"
      @hide="handleLoginDialogHide"
      @close="closeLoginDialog"
    >
      <template #header>
        <div class="brand-title text-primary">{{ APP_CONFIG.displayName }}</div>
        <div class="text-subtitle1 text-weight-bold q-mt-xs">
          {{ dialogMode === "login" ? "Login" : "Import Data" }}
        </div>
        <div class="text-caption text-grey-5 q-mt-xs">
          <template v-if="dialogMode === 'login'">
            Select your profile or import your backup to continue.
          </template>
          <template v-else>
            Add a backup JSON file or paste backup JSON to import data.
          </template>
        </div>
      </template>

      <q-select
        v-if="dialogMode === 'login'"
        v-model="selectedUserId"
        filled
        dark
        color="primary"
        label="Select user"
        emit-value
        map-options
        :options="loginUserOptions"
      />

      <div v-else class="column q-gutter-sm">
        <q-file
          v-model="importFile"
          filled
          dark
          color="primary"
          label="Upload backup JSON"
          accept=".json,application/json"
          @update:model-value="handleImportFile"
        />

        <q-input
          v-model="importJsonInput"
          filled
          dark
          type="textarea"
          color="primary"
          label="Or paste backup JSON"
          class="import-json-input"
          @update:model-value="validateImportInput"
        />

        <div
          v-if="importValidationMessage"
          class="text-caption text-negative"
        >
          {{ importValidationMessage }}
        </div>
      </div>

      <template #actions>
        <q-btn
          v-if="dialogMode === 'login'"
          flat
          color="grey-5"
          label="Import History"
          @click="openImportMode"
        />

        <q-btn
          v-else
          flat
          color="grey-5"
          :label="isImportDialogStandalone ? 'Close' : 'Login'"
          @click="isImportDialogStandalone ? closeLoginDialog() : openLoginMode()"
        />

        <q-btn
          v-if="dialogMode === 'login'"
          unelevated
          color="primary"
          text-color="white"
          label="Login"
          :disable="selectedUserId === null"
          @click="submitLogin"
        />

        <q-btn
          v-else
          unelevated
          color="primary"
          text-color="white"
          label="Import"
          :disable="!canSubmitImport"
          @click="submitImport"
        />
      </template>
    </app-dialog-shell>

    <app-dialog-shell
      v-model="isLogoutDialogOpen"
      :show-close-button="true"
      close-aria-label="Close account dialog"
      :show-body-section="accountDialogMode === 'export'"
      :show-body-separator="accountDialogMode === 'export'"
      body-class="q-pt-md q-pb-sm"
      @hide="closeAccountDialog"
      @close="closeAccountDialog"
    >
      <template #header>
        <div class="text-subtitle1 text-weight-bold">
          {{ accountDialogMode === "logout" ? "Logout" : "Export Data" }}
        </div>
        <div
          v-if="accountDialogMode === 'logout'"
          class="text-caption text-grey-5 q-mt-xs"
        >
          <template v-if="hasUnsavedProgress">
            You have unsaved progress. Would you like to export data before
            logging out?
          </template>
          <template v-else> Are you sure you want to log out? </template>
        </div>
        <div v-else class="text-caption text-grey-5 q-mt-xs">
          Generate a user-specific backup payload, then copy it or save it.
        </div>
      </template>

      <q-input
        :model-value="exportedUserJson"
        readonly
        filled
        dark
        type="textarea"
        label="User backup JSON"
        class="export-json-input"
      />

      <template #actions>
        <q-btn
          v-if="accountDialogMode === 'logout'"
          flat
          color="grey-5"
          label="Logout"
          @click="confirmLogout"
        />

        <q-btn
          v-else-if="accountDialogEntry === 'logout'"
          flat
          color="grey-5"
          label="Back to Logout"
          @click="returnToLogoutView"
        />

        <q-btn
          v-else
          flat
          color="grey-5"
          label="Close"
          @click="closeAccountDialog"
        />

        <div class="row items-center q-gutter-sm">
          <q-btn
            v-if="accountDialogMode === 'logout'"
            unelevated
            color="primary"
            text-color="white"
            label="Export Data"
            @click="openExportFromLogout"
          />

          <template v-else>
            <q-btn
              v-if="exportedUserJson.length > 0"
              flat
              color="primary"
              label="Copy"
              @click="copyExportJson"
            />
            <q-btn
              v-if="exportedUserJson.length > 0"
              flat
              color="primary"
              label="Save"
              @click="handleSaveExport"
            />
            <q-btn
              v-if="exportedUserJson.length === 0"
              unelevated
              color="primary"
              text-color="white"
              label="Export"
              @click="generateUserExportJson"
            />
          </template>
        </div>
      </template>
    </app-dialog-shell>

    <q-dialog
      v-model="isImportReviewDialogOpen"
      @hide="dismissImportReviewDialog"
    >
      <q-card class="login-card import-review-card bg-grey-10 text-white">
        <q-card-section class="q-pb-sm row items-start no-wrap">
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">Import Review</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Some local items are missing from the imported backup. Keep them
              or delete the selected ones before the import is merged.
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            color="grey-5"
            aria-label="Close import review dialog"
            @click="dismissImportReviewDialog"
          />
        </q-card-section>

        <q-separator dark />

        <q-card-section class="import-review-content q-py-sm">
          <q-expansion-item
            v-if="pendingImportPlan?.missingWorkoutTemplates.length"
            dense
            dark
            expand-separator
            icon="fitness_center"
            header-class="text-white"
            :label="`${pendingImportPlan.missingWorkoutTemplates.length} existing workout templates missing from import`"
          >
            <q-list separator dark>
              <q-item
                v-for="template in pendingImportPlan.missingWorkoutTemplates"
                :key="`missing-template-${template.id}`"
                dense
              >
                <q-item-section avatar>
                  <q-checkbox
                    v-model="selectedMissingTemplateIds"
                    dark
                    :val="template.id"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ template.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <q-expansion-item
            v-if="pendingImportPlan?.missingExercises.length"
            dense
            dark
            expand-separator
            icon="list_alt"
            header-class="text-white"
            :label="`${pendingImportPlan.missingExercises.length} existing exercises missing from import`"
          >
            <q-list separator dark>
              <q-item
                v-for="exercise in pendingImportPlan.missingExercises"
                :key="`missing-exercise-${exercise.id}`"
                dense
              >
                <q-item-section avatar>
                  <q-checkbox
                    v-model="selectedMissingExerciseIds"
                    dark
                    :val="exercise.id"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ exercise.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-card-section>

        <q-separator dark />

        <q-card-actions align="between">
          <q-btn
            flat
            color="grey-5"
            label="Delete Selected"
            :disable="selectedImportDeletionCount === 0"
            @click="deleteSelectedAndImport"
          />
          <q-btn
            unelevated
            color="primary"
            text-color="white"
            label="Keep Existing"
            @click="keepExistingAndImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { Notify, setCssVar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import AppDialogShell from "@/components/AppDialogShell.vue";
import {
  APP_CONFIG,
  INVALID_BACKUP_JSON_MESSAGE,
} from "@/config/appConfig";
import {
  applyLocalUserStorageImport,
  clearActiveUserId,
  getUserExportSignature,
  isUserProfileStorageKey,
  getLocalUserImportPlan,
  getLocalUserStoragePayload,
  LOCAL_USERS,
  parseLocalUserStoragePayload,
  saveUserExportSignature,
  STORAGE_KEYS,
  getWorkoutLogs,
  getWorkoutTemplates,
  getStoredActiveUserId,
  getUserProfile,
  saveActiveUserId,
} from "@/storage/localStorage";
import type {
  LocalUserImportPlan,
  LocalUserStoragePayload,
} from "@/types/models";
import {
  buildBackupFileName,
  downloadJsonFile,
  exportLocalUserStorageBackup,
} from "@/utils/exportBackup";
import { THEME_PALETTES } from "@/utils/themePalette";

type ViewKey = "dashboard" | "templates" | "exercises" | "history" | "workout";
type DialogMode = "login" | "import";
type AccountDialogMode = "logout" | "export";
type AccountDialogEntry = "logout" | "menu";

const router = useRouter();
const route = useRoute();
const activeUserId = ref<string | null>(getStoredActiveUserId());
const isLoginDialogOpen = ref(activeUserId.value === null);
const dialogMode = ref<DialogMode>("login");
const selectedUserId = ref<string | null>(null);
const importFile = ref<File | null>(null);
const importJsonInput = ref("");
const importValidationMessage = ref<string | null>(null);
const canSubmitImport = ref(false);
const isLogoutDialogOpen = ref(false);
const accountDialogMode = ref<AccountDialogMode>("logout");
const accountDialogEntry = ref<AccountDialogEntry>("logout");
const exportedUserJson = ref("");
const isImportDialogStandalone = ref(false);
const isImportReviewDialogOpen = ref(false);
const pendingImportPayload = ref<LocalUserStoragePayload | null>(null);
const pendingImportPlan = ref<LocalUserImportPlan | null>(null);
const selectedMissingTemplateIds = ref<number[]>([]);
const selectedMissingExerciseIds = ref<number[]>([]);

const views: { key: ViewKey; label: string; caption: string; path: string }[] =
  [
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
      caption:
        "Search every exercise available from seed data and local storage.",
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
      caption:
        "Run the gym floor logging loop with template-based set targets.",
      path: "/workout",
    },
  ];

const userOptions = computed(() =>
  LOCAL_USERS.map((user) => ({
    label: user.name,
    value: user.id,
  })),
);

const loginUserOptions = computed(() => [
  { label: "-", value: null },
  ...userOptions.value,
]);

const hasActiveUser = computed(() => activeUserId.value !== null);

const hasUnsavedProgress = computed(() => {
  if (activeUserId.value === null) {
    return false;
  }

  const templates = getWorkoutTemplates(activeUserId.value);
  const logs = getWorkoutLogs(activeUserId.value);
  const hasData = templates.length > 0 || logs.length > 0;
  const exportSignature = getUserExportSignature(activeUserId.value);

  if (!hasData) {
    return false;
  }

  if (!exportSignature) {
    return true;
  }

  const currentSignature = JSON.stringify({ templates, logs });

  return exportSignature !== currentSignature;
});

const activeUserName = computed(
  () =>
    userOptions.value.find((user) => user.value === activeUserId.value)
      ?.label ?? "-",
);

const selectedImportDeletionCount = computed(
  () =>
    selectedMissingTemplateIds.value.length +
    selectedMissingExerciseIds.value.length,
);

function goTo(path: string): void {
  if (route.path !== path) {
    void router.push(path);
  }
}

function applyThemeFromProfile(): void {
  if (activeUserId.value === null) {
    const fallbackPalette = THEME_PALETTES.orange;

    setCssVar("primary", fallbackPalette.high);
    setCssVar("secondary", fallbackPalette.med);
    setCssVar("accent", fallbackPalette.low);

    return;
  }

  const palette = THEME_PALETTES[getUserProfile(activeUserId.value).themeColor];

  setCssVar("primary", palette.high);
  setCssVar("secondary", palette.med);
  setCssVar("accent", palette.low);
}

function handleUserChange(userId: string): void {
  saveActiveUserId(userId);
  activeUserId.value = userId;
  applyThemeFromProfile();
}

function openLogoutDialog(): void {
  accountDialogEntry.value = "logout";
  accountDialogMode.value = "logout";
  exportedUserJson.value = "";
  isLogoutDialogOpen.value = true;
}

function handleExportData(): void {
  accountDialogEntry.value = "menu";
  accountDialogMode.value = "export";
  exportedUserJson.value = "";
  isLogoutDialogOpen.value = true;
}

function confirmLogout(): void {
  clearActiveUserId();
  activeUserId.value = null;
  selectedUserId.value = null;
  isLogoutDialogOpen.value = false;
  isImportDialogStandalone.value = false;
  isLoginDialogOpen.value = true;
  applyThemeFromProfile();
}

function closeAccountDialog(): void {
  isLogoutDialogOpen.value = false;
  accountDialogMode.value = "logout";
  accountDialogEntry.value = "logout";
  exportedUserJson.value = "";
}

function openExportFromLogout(): void {
  accountDialogMode.value = "export";
  exportedUserJson.value = "";
}

function returnToLogoutView(): void {
  if (accountDialogEntry.value !== "logout") {
    return;
  }

  accountDialogMode.value = "logout";
}

function generateUserExportJson(): void {
  if (activeUserId.value === null) {
    exportedUserJson.value = "";
    return;
  }

  exportedUserJson.value = exportLocalUserStorageBackup(activeUserId.value);

  const payload = getLocalUserStoragePayload(activeUserId.value);

  saveUserExportSignature(
    activeUserId.value,
    payload.user.workoutTemplates,
    payload.user.workoutLogs,
  );
}

function copyExportJson(): void {
  if (exportedUserJson.value.length === 0) {
    Notify.create({
      message: "Generate export data before copying.",
      color: "negative",
      textColor: "white",
    });
    return;
  }

  void navigator.clipboard
    .writeText(exportedUserJson.value)
    .then(() => {
      Notify.create({
        message: "Export copied to clipboard.",
        color: "primary",
        textColor: "white",
      });
      closeAccountDialog();
    })
    .catch(() => {
      Notify.create({
        message: "Unable to access clipboard. Please copy manually.",
        color: "negative",
        textColor: "white",
      });
    });
}

function handleSaveExport(): void {
  if (exportedUserJson.value.length === 0) {
    Notify.create({
      message: "Generate export data before saving.",
      color: "negative",
      textColor: "white",
    });
    return;
  }

  downloadJsonFile(exportedUserJson.value, buildBackupFileName());
  Notify.create({
    message: "Backup downloaded.",
    color: "primary",
    textColor: "white",
  });
  closeAccountDialog();
}

function resetImportState(): void {
  importValidationMessage.value = null;
  canSubmitImport.value = false;
  importFile.value = null;
  importJsonInput.value = "";
}

function resetImportReviewState(): void {
  isImportReviewDialogOpen.value = false;
  pendingImportPayload.value = null;
  pendingImportPlan.value = null;
  selectedMissingTemplateIds.value = [];
  selectedMissingExerciseIds.value = [];
}

function openImportMode(): void {
  isImportDialogStandalone.value = false;
  dialogMode.value = "import";
}

function openLoginMode(): void {
  isImportDialogStandalone.value = false;
  dialogMode.value = "login";
  importValidationMessage.value = null;
}

function openStandaloneImportDialog(): void {
  dialogMode.value = "import";
  isImportDialogStandalone.value = true;
  resetImportState();
  resetImportReviewState();
  isLoginDialogOpen.value = true;
}

function closeLoginDialog(): void {
  if (dialogMode.value === "login" && !isImportDialogStandalone.value) {
    return;
  }

  isLoginDialogOpen.value = false;
  dialogMode.value = "login";
  isImportDialogStandalone.value = false;
  resetImportState();
}

function handleLoginDialogHide(): void {
  if (!isLoginDialogOpen.value) {
    closeLoginDialog();
  }
}

function validateImportInput(): void {
  const input = importJsonInput.value.trim();

  if (input.length === 0) {
    importValidationMessage.value = null;
    canSubmitImport.value = false;
    return;
  }

  const payload = parseLocalUserStoragePayload(input);

  if (!payload) {
    importValidationMessage.value = INVALID_BACKUP_JSON_MESSAGE;
    canSubmitImport.value = false;
    return;
  }

  if (getLocalUserImportPlan(payload) === null) {
    importValidationMessage.value =
      "The backup user ID/name does not match a local profile.";
    canSubmitImport.value = false;
    return;
  }

  importValidationMessage.value = null;
  canSubmitImport.value = true;
}

function handleImportFile(file: File | null): void {
  if (file === null) {
    importJsonInput.value = "";
    validateImportInput();
    return;
  }

  void file.text().then((text) => {
    importJsonInput.value = text;
    validateImportInput();
  });
}

function submitLogin(): void {
  if (selectedUserId.value === null) {
    return;
  }

  handleUserChange(selectedUserId.value);
  selectedUserId.value = null;
  isLoginDialogOpen.value = false;
}

function submitImport(): void {
  if (!canSubmitImport.value) {
    return;
  }

  const payload = parseLocalUserStoragePayload(importJsonInput.value.trim());

  if (!payload) {
    importValidationMessage.value = INVALID_BACKUP_JSON_MESSAGE;
    return;
  }

  const importPlan = getLocalUserImportPlan(payload);

  if (!importPlan) {
    importValidationMessage.value =
      "The backup user ID/name does not match a local profile.";
    return;
  }

  pendingImportPayload.value = payload;
  pendingImportPlan.value = importPlan;

  if (
    importPlan.missingWorkoutTemplates.length === 0 &&
    importPlan.missingExercises.length === 0
  ) {
    applyImportAndNotify();
    return;
  }

  isLoginDialogOpen.value = false;
  isImportReviewDialogOpen.value = true;
}

function dismissImportReviewDialog(): void {
  resetImportReviewState();

  if (activeUserId.value === null) {
    dialogMode.value = "login";
    isLoginDialogOpen.value = true;
  }
}

function applyImportAndNotify(deleteSelected = false): void {
  if (pendingImportPayload.value === null || pendingImportPlan.value === null) {
    Notify.create({
      message: "Import data is no longer available. Please try again.",
      color: "negative",
      textColor: "white",
    });
    return;
  }

  const appliedPlan = applyLocalUserStorageImport(pendingImportPayload.value, {
    deleteWorkoutTemplateIds: deleteSelected
      ? selectedMissingTemplateIds.value
      : [],
    deleteExerciseIds: deleteSelected ? selectedMissingExerciseIds.value : [],
  });

  if (!appliedPlan) {
    Notify.create({
      message: "Import could not be applied. Please check the backup JSON.",
      color: "negative",
      textColor: "white",
    });
    return;
  }

  if (activeUserId.value === null) {
    handleUserChange(appliedPlan.targetUserId);
  } else if (activeUserId.value === appliedPlan.targetUserId) {
    applyThemeFromProfile();
  }

  Notify.create({
    message: `Imported data for ${appliedPlan.targetUserName}.`,
    color: "primary",
    textColor: "white",
  });

  resetImportReviewState();
  closeLoginDialog();
}

function keepExistingAndImport(): void {
  applyImportAndNotify(false);
}

function deleteSelectedAndImport(): void {
  applyImportAndNotify(true);
}

function handleStorageSync(event: StorageEvent): void {
  if (event.key === STORAGE_KEYS.activeUserId) {
    activeUserId.value = getStoredActiveUserId();
    isLoginDialogOpen.value = activeUserId.value === null;
    applyThemeFromProfile();
    return;
  }

  if (
    activeUserId.value !== null &&
    isUserProfileStorageKey(event.key, activeUserId.value)
  ) {
    applyThemeFromProfile();
  }
}

onMounted(() => {
  applyThemeFromProfile();
  window.addEventListener("storage", handleStorageSync);
});

watch(
  () => activeUserId.value,
  (userId) => {
    if (userId === null) {
      isLoginDialogOpen.value = true;
      return;
    }

    isLoginDialogOpen.value = false;
  },
);

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

.brand-title--compact {
  font-size: 0.9rem;
}

.phone-shell {
  max-width: 520px;
  min-height: 100vh;
}

.in-frame-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.88);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
}

.active-user-pill {
  transition: color 120ms ease;
}

.active-user-pill:hover {
  color: #ffffff !important;
}

.login-card {
  width: min(92vw, 420px);
}

.import-review-card {
  max-height: min(80vh, 620px);
}

.import-review-content {
  max-height: min(48vh, 360px);
  overflow: auto;
}

.export-json-input :deep(textarea) {
  max-height: 220px;
  overflow: auto;
  white-space: pre;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}

.import-json-input :deep(textarea) {
  max-height: 220px;
  overflow: auto;
  white-space: pre-wrap;
}
</style>
