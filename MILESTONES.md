# Milestones

Execute one milestone per chat session.

## Milestone 0 — Project Infrastructure

- Scaffold Vue 3 + Quasar + TypeScript + Vite + Jest.
- Configure Quasar dark mode globally in config.
- Create core TypeScript types matching `ARCHITECTURE.md` in `@/types`.

## Milestone 1 — Storage Services & Seed Data

- Create Local Storage wrapper for `WorkoutTemplate`, `Exercise`, and `WorkoutLog`.
- Create seed file with standard exercises.
- Build JSON Backup Export utility function.
- Add UserProfile to the Local Storage scope:
- Update Local Storage service wrapper to include getters and setters for UserProfile (defaulting themeColor to 'orange').

## Milestone 2 — Home Screen Dashboard & Heatmap

- Build Home Screen layout using Quasar grid cards.
- Display high-level Muscle Group chips (`Chest`, `Back`, `Legs`).
- Implement timestamp decay calculation to fade chip colors based on days since last workout.
- Add the SVG component and profile theme picker to the tasks:
- Add the BodyHeatmap.vue SVG component displaying front and back silhouettes.
- Bind muscle group decay intensities to dynamic SVG path fill colors.
- Add a simple highlight theme selector. the selected theme should be deep version of following colours ( Orange, Red, Blue, Purple) that updates to the deep colour after workout and eases back to neutral colour as the rest days happen for the muscle group
- UserProfile in Local Storage and dynamically shifts the heatmap and UI - highlight palette.

## Milestone 3 — Routine Template Manager

- Build UI to create, view, and delete Workout Templates.
- Allow mapping exercises and muscle tags to templates.
- Add a 3 line menu button on the top right which allows navigation from Dashboard to Workouts and exercises and workout log and to start workout. Note building the actual workout logging screen is in the next milestone.

## Milestone 4 — Gym Floor Log Engine (Core Loop)

- Build active workout logging screen.
- Auto-populate sets/weights from the previous log of the selected template.
- Implement completion checkboxes and instant local storage saving.

## Milestone 5 — Quality Validation & Deployment

- Run full Jest test suite.
- Verify all Vue components follow `<template>` -> `<script>` -> `<style>` layout.
- Build production static bundle (`npm run build`).
