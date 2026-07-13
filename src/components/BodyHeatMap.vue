<template>
  <div class="body-heatmap-container q-pa-md flex flex-center column">
    <div class="row q-gutter-md justify-center items-center">
      <!-- Front View Silhouette -->
      <div class="svg-wrapper">
        <span class="text-caption text-grey-5 block text-center q-mb-xs"
          >FRONT</span
        >
        <svg viewBox="0 0 100 200" class="body-svg">
          <!-- Head / Neck -->
          <circle
            cx="50"
            cy="18"
            r="10"
            fill="#2a2a2a"
            stroke="#121212"
            stroke-width="1"
          />
          <rect x="46" y="27" width="8" height="6" rx="2" fill="#2a2a2a" />

          <!-- Chest -->
          <path
            id="chest"
            d="M 36,34 L 64,34 L 62,50 L 50,54 L 38,50 Z"
            :fill="getMuscleColor('Chest')"
            stroke="#121212"
            stroke-width="1.2"
          />

          <!-- Abs / Core -->
          <path
            id="abs"
            d="M 38,51 L 62,51 L 60,78 L 40,78 Z"
            :fill="getMuscleColor('Abs')"
            stroke="#121212"
            stroke-width="1.2"
          />

          <!-- Shoulders (Front) -->
          <path
            id="shoulders-left"
            d="M 24,34 C 24,30 35,33 35,39 L 32,48 C 28,45 24,40 24,34 Z"
            :fill="getMuscleColor('Shoulders')"
            stroke="#121212"
            stroke-width="1"
          />
          <path
            id="shoulders-right"
            d="M 76,34 C 76,30 65,33 65,39 L 68,48 C 72,45 76,40 76,34 Z"
            :fill="getMuscleColor('Shoulders')"
            stroke="#121212"
            stroke-width="1"
          />

          <!-- Arms / Biceps -->
          <path
            id="biceps-left"
            d="M 24,42 L 31,48 L 28,66 L 21,58 Z"
            :fill="getMuscleColor('Arms')"
            stroke="#121212"
            stroke-width="1"
          />
          <path
            id="biceps-right"
            d="M 76,42 L 69,48 L 72,66 L 79,58 Z"
            :fill="getMuscleColor('Arms')"
            stroke="#121212"
            stroke-width="1"
          />

          <!-- Forearms (Front) -->
          <path
            id="forearms-left"
            d="M 21,59 L 28,67 L 23,88 L 17,82 Z"
            :fill="getMuscleColor('Forearms')"
            stroke="#121212"
            stroke-width="1"
          />
          <path
            id="forearms-right"
            d="M 79,59 L 72,67 L 77,88 L 83,82 Z"
            :fill="getMuscleColor('Forearms')"
            stroke="#121212"
            stroke-width="1"
          />

          <!-- Quads / Legs -->
          <path
            id="quads-left"
            d="M 38,80 L 49,80 L 47,125 L 35,125 Z"
            :fill="getMuscleColor('Legs')"
            stroke="#121212"
            stroke-width="1.2"
          />
          <path
            id="quads-right"
            d="M 51,80 L 62,80 L 65,125 L 53,125 Z"
            :fill="getMuscleColor('Legs')"
            stroke="#121212"
            stroke-width="1.2"
          />

          <!-- Calves (Front) -->
          <path
            id="calves-front-left"
            d="M 36,128 L 46,128 L 44,168 L 38,168 Z"
            :fill="getMuscleColor('Calves')"
            stroke="#121212"
            stroke-width="1"
          />
          <path
            id="calves-front-right"
            d="M 54,128 L 64,128 L 62,168 L 56,168 Z"
            :fill="getMuscleColor('Calves')"
            stroke="#121212"
            stroke-width="1"
          />
        </svg>
      </div>

      <!-- Back View Silhouette -->
      <div class="svg-wrapper">
        <span class="text-caption text-grey-5 block text-center q-mb-xs"
          >BACK</span
        >
        <svg viewBox="0 0 100 200" class="body-svg">
          <!-- Head / Neck (Back) -->
          <circle
            cx="50"
            cy="18"
            r="10"
            fill="#2a2a2a"
            stroke="#121212"
            stroke-width="1"
          />
          <path
            id="traps"
            d="M 42,28 L 58,28 L 62,35 L 38,35 Z"
            :fill="getMuscleColor('Back')"
            stroke="#121212"
            stroke-width="1"
          />

          <!-- Upper / Mid Back -->
          <path
            id="upper-back"
            d="M 36,35 L 64,35 L 58,62 L 42,62 Z"
            :fill="getMuscleColor('Back')"
            stroke="#121212"
            stroke-width="1.2"
          />

          <!-- Lower Back -->
          <path
            id="lower-back"
            d="M 42,63 L 58,63 L 56,76 L 44,76 Z"
            :fill="getMuscleColor('Back')"
            stroke="#121212"
            stroke-width="1"
          />

          <!-- Triceps (Back) -->
          <path
            id="triceps-left"
            d="M 24,40 L 32,46 L 29,64 L 22,58 Z"
            :fill="getMuscleColor('Arms')"
            stroke="#121212"
            stroke-width="1"
          />
          <path
            id="triceps-right"
            d="M 76,40 L 68,46 L 71,64 L 78,58 Z"
            :fill="getMuscleColor('Arms')"
            stroke="#121212"
            stroke-width="1"
          />

          <!-- Glutes -->
          <path
            id="glutes-left"
            d="M 38,77 L 49,77 L 48,98 L 36,95 Z"
            :fill="getMuscleColor('Glutes')"
            stroke="#121212"
            stroke-width="1.2"
          />
          <path
            id="glutes-right"
            d="M 51,77 L 62,77 L 64,95 L 52,98 Z"
            :fill="getMuscleColor('Glutes')"
            stroke="#121212"
            stroke-width="1.2"
          />

          <!-- Hamstrings -->
          <path
            id="hamstrings-left"
            d="M 36,97 L 48,99 L 46,126 L 36,126 Z"
            :fill="getMuscleColor('Legs')"
            stroke="#121212"
            stroke-width="1"
          />
          <path
            id="hamstrings-right"
            d="M 52,99 L 64,97 L 64,126 L 54,126 Z"
            :fill="getMuscleColor('Legs')"
            stroke="#121212"
            stroke-width="1"
          />

          <!-- Calves (Back) -->
          <path
            id="calves-back-left"
            d="M 36,128 L 45,128 L 43,168 L 37,168 Z"
            :fill="getMuscleColor('Calves')"
            stroke="#121212"
            stroke-width="1"
          />
          <path
            id="calves-back-right"
            d="M 55,128 L 64,128 L 63,168 L 57,168 Z"
            :fill="getMuscleColor('Calves')"
            stroke="#121212"
            stroke-width="1"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MuscleGroup, ThemeColor } from "@/types/models";
import { getIntensityColor } from "@/utils/themePalette";

const props = withDefaults(
  defineProps<{
    muscleDecayMap?: Partial<Record<MuscleGroup, number>>;
    userHighlightColor?: ThemeColor;
  }>(),
  {
    muscleDecayMap: () => ({}),
    userHighlightColor: "orange",
  },
);

function getMuscleColor(muscleName: MuscleGroup): string {
  const intensity = props.muscleDecayMap[muscleName] ?? 0;

  return getIntensityColor(intensity, props.userHighlightColor);
}
</script>

<style scoped>
.body-svg {
  width: 130px;
  height: 260px;
  filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.5));
}

.svg-wrapper path {
  transition: fill 0.4s ease-in-out;
}
</style>
