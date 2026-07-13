<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="dashboard-shell q-mx-auto">
      <q-card flat bordered class="bg-dark text-white full-height">
        <q-card-section>
          <div class="text-overline text-primary">Milestone 2</div>
          <div class="text-h4 text-weight-bold">Recovery Dashboard</div>
          <div class="text-subtitle2 text-grey-5">
            Your recent training intensity fades toward neutral as rest days
            pass.
          </div>
        </q-card-section>

        <q-separator dark />

        <q-card-section class="q-gutter-sm">
          <div class="text-subtitle2 text-grey-4">Highlight Theme</div>
          <div class="row q-gutter-sm">
            <q-btn
              v-for="themeColor in themeOptions"
              :key="themeColor"
              round
              unelevated
              size="md"
              :aria-label="`Select ${themeColor} theme`"
              :style="getThemeSwatchStyle(themeColor)"
              @click="selectTheme(themeColor)"
            />
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2 text-grey-4 q-mb-sm">
            Primary Muscle Groups
          </div>
          <div class="row q-col-gutter-sm">
            <div
              v-for="muscleGroup in summaryMuscleGroups"
              :key="muscleGroup"
              class="col-4"
            >
              <q-chip
                square
                class="full-width justify-center q-py-sm"
                :style="getChipStyle(muscleGroup)"
              >
                {{ muscleGroup }} {{ formatIntensity(muscleGroup) }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-separator dark inset />

        <q-card-section class="flex flex-center">
          <BodyHeatMap
            :muscle-decay-map="muscleDecayMap"
            :user-highlight-color="profile.themeColor"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { setCssVar } from "quasar";
import BodyHeatMap from "@/components/BodyHeatMap.vue";
import { getUserProfile, saveUserProfile } from "@/storage/localStorage";
import type { MuscleGroup, ThemeColor, UserProfile } from "@/types/models";
import { getStoredMuscleDecayMap } from "@/utils/muscleDecay";
import { THEME_PALETTES, getIntensityColor } from "@/utils/themePalette";

const themeOptions: ThemeColor[] = ["orange", "red", "blue", "purple"];
const summaryMuscleGroups: MuscleGroup[] = ["Chest", "Back", "Legs"];

const profile = ref<UserProfile>(getUserProfile());
const muscleDecayMap = ref(getStoredMuscleDecayMap());

const activePalette = computed(() => THEME_PALETTES[profile.value.themeColor]);

watch(
  () => profile.value.themeColor,
  (themeColor) => {
    const palette = THEME_PALETTES[themeColor];

    setCssVar("primary", palette.high);
    setCssVar("secondary", palette.med);
    setCssVar("accent", palette.low);
  },
  { immediate: true },
);

function selectTheme(themeColor: ThemeColor): void {
  profile.value = {
    ...profile.value,
    themeColor,
  };

  saveUserProfile(profile.value);
}

function getThemeSwatchStyle(themeColor: ThemeColor): Record<string, string> {
  const palette = THEME_PALETTES[themeColor];
  const isActive = profile.value.themeColor === themeColor;

  return {
    backgroundColor: palette.high,
    border: isActive ? `2px solid ${palette.low}` : "2px solid transparent",
  };
}

function getChipStyle(muscleGroup: MuscleGroup): Record<string, string> {
  const intensity = muscleDecayMap.value[muscleGroup] ?? 0;

  return {
    backgroundColor: getIntensityColor(intensity, profile.value.themeColor),
    border: `1px solid ${activePalette.value.low}`,
    color: "#ffffff",
  };
}

function formatIntensity(muscleGroup: MuscleGroup): string {
  const intensity = muscleDecayMap.value[muscleGroup] ?? 0;

  return `${Math.round(intensity * 100)}%`;
}
</script>

<style scoped>
.dashboard-shell {
  max-width: 450px;
  min-height: 100vh;
}
</style>
