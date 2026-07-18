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

## Milestone 4 — Gym Floor Log Engine & Nav Views

- **Exercise Library View:** Build view to list all exercises from seed data/Local Storage with a search filter.
- **Workout Log History View:** Build view to display past completed `WorkoutLog` entries grouped by date.
- **Active Workout Logger (Core Loop):**
  - Select a `WorkoutTemplate` to start a workout.
  - Auto-populate sets/weights from the previous historical log of that template.
  - Interactive checkboxes to toggle set completion and instant save to Local Storage.

## Milestone 5 — Local Multi-User Profile Mode (Frontend-Only)

- Add a fixed, hardcoded user list controlled in-app (no signup, no auth).
- Add active profile selection UI (name picker) and persist selected profile locally.
- Add `userId` scoping to stored templates/logs/profile data in Local Storage.
- Filter all views by selected `userId` so each user sees their own records by default.
- Keep this explicitly marked as interim/trust-based mode for private use.

## Milestone 6 — Quality Validation & Private Beta Deployment

- Run full Jest test suite.
- Verify all Vue components follow `<template>` -> `<script>` -> `<style>` layout.
- Build production static bundle (`npm run build`).
- Add private-hosting hardening checklist (HTTPS, whitelist/VPN/Tailscale, backups).
- Deploy private V1 for trusted users and collect UI/UX feedback.

## Milestone 7 — Backend, Auth, and Sync (Post-V1)

- Add backend API and Postgres persistence.
- Implement real user auth (signup/login/session or JWT refresh flow).
- Migrate from frontend-only profile mode to authenticated user accounts.
- Add per-user authorization checks and cloud sync across devices.
