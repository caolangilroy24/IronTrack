<template>
  <q-dialog v-model="dialogModel" :persistent="persistent" @hide="emit('hide')">
    <q-card class="app-dialog-card bg-grey-10 text-white">
      <q-card-section class="q-pb-sm row items-start no-wrap">
        <div class="col">
          <slot name="header">
            <div v-if="title" class="text-subtitle1 text-weight-bold">
              {{ title }}
            </div>
            <div v-if="caption" class="text-caption text-grey-5 q-mt-xs">
              {{ caption }}
            </div>
          </slot>
        </div>

        <q-btn
          v-if="showCloseButton"
          flat
          round
          dense
          icon="close"
          color="grey-5"
          :aria-label="closeAriaLabel"
          @click="handleClose"
        />
      </q-card-section>

      <q-separator dark />

      <q-card-section v-if="showBodySection" :class="bodyClass">
        <slot />
      </q-card-section>

      <q-separator v-if="showBodySection && showBodySeparator" dark />

      <q-card-actions :align="actionsAlign">
        <slot name="actions" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

type CardActionsAlign =
  | "left"
  | "right"
  | "center"
  | "between"
  | "around"
  | "evenly";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    caption?: string;
    persistent?: boolean;
    showCloseButton?: boolean;
    closeAriaLabel?: string;
    showBodySection?: boolean;
    showBodySeparator?: boolean;
    bodyClass?: string;
    actionsAlign?: CardActionsAlign;
  }>(),
  {
    title: "",
    caption: "",
    persistent: false,
    showCloseButton: false,
    closeAriaLabel: "Close dialog",
    showBodySection: true,
    showBodySeparator: true,
    bodyClass: "",
    actionsAlign: "between",
  },
);

const emit = defineEmits<{
  (eventName: "update:modelValue", value: boolean): void;
  (eventName: "hide"): void;
  (eventName: "close"): void;
}>();

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit("update:modelValue", value);
  },
});

function handleClose(): void {
  emit("close");
}
</script>

<style scoped>
.app-dialog-card {
  width: min(92vw, 420px);
}
</style>
