# IronTrack

A mobile-first web application for tracking gym workouts without paywalls or forced subscriptions. Built with an agile, local-first architecture using agent-assisted development pipelines.

## Core Principle

Eliminate data tracking friction. If a user is repeating a workout, they should be able to log a completed set with a single tap. All initial historical data acts as the immediate structural baseline for future logs.

## Tech Stack

- **Frontend:** Vue 3 (Composition API), Quasar Framework, TypeScript, Vite
- **Storage:** Local-first Web Storage (IndexedDB/localStorage) with decoupled interface abstractions for future database sync.
- **Testing:** Jest

## Milestone 6 Private Beta

Use `PRIVATE_BETA_CHECKLIST.md` for the full deployment and whitelist hardening steps required before sharing V1 with trusted users.

## Internal Template Spec (Minimal)

This section defines the reusable MVP baseline for local-first, phone-first apps derived from IronTrack.

### 1) Folder Structure

```text
src/
	App.vue                 # Shell layout, top-level dialogs, user/session entry flow
	main.ts                 # App bootstrap + Quasar global config
	router/
		index.ts              # All route declarations + redirects
	views/                  # Route-level screens (history, active flow, libraries)
	components/             # Reusable UI blocks
	config/
		appConfig.ts         # Template branding and app-level text/file-name constants
	storage/
		localStorage.ts       # Persistence contract and all local-first CRUD
	types/
		models.ts             # Shared domain models and payload contracts
	data/
		seedExercises.ts      # Initial seed data used to bootstrap local storage
	utils/
		themePalette.ts       # Theme color palette/intensity mapping
		exportBackup.ts       # JSON export helpers
```

Template rule: keep all shared data contracts in `src/types/models.ts`, and keep all storage read/write logic centralized in `src/storage/localStorage.ts`.

### 2) Where Routing Lives

- Router source of truth: `src/router/index.ts`.
- Use `createWebHistory()` and explicit named routes.
- Route-level screens are mounted through `<router-view />` in `App.vue`.
- Keep redirects in router config (example: `/logs` -> `/history`) instead of inside components.

### 3) Where User Identity + Theme Lives

- Identity state is local-first and managed through `src/storage/localStorage.ts`:
  - `LOCAL_USERS` defines allowed local profiles.
  - `activeUserId` is persisted and validated.
- Theme selection is user-scoped:
  - `UserProfile.themeColor` is defined in `src/types/models.ts`.
  - Palette definitions and intensity mapping live in `src/utils/themePalette.ts`.
  - UI applies theme via profile reads/writes (`getUserProfile`, `saveUserProfile`) and Quasar CSS vars.

### 4) Standard Storage Key Strategy

Use two key classes:

- Global/shared keys (non-user-scoped):
  - `irontrack.exercises`
  - `irontrack.activeUserId`
- User-scoped keys generated as:
  - `irontrack.users.<userId>.<baseKey>`
  - Base keys currently include templates, logs, profile.

Guideline: always generate user data keys through one helper (like `getUserScopedKey`) and never hand-build scoped key strings in component code.

### 5) Standard CRUD Interface

Define one storage module exposing typed functions per entity:

- Read: `getX()`
- Write all: `saveX(items)`
- Upsert one (where needed): `saveXItem(item)`
- Delete one (where needed): `deleteXById(id)`
- Delete all: `deleteX()`

Current implementation pattern in `src/storage/localStorage.ts`:

- Templates: `getWorkoutTemplates`, `saveWorkoutTemplates`, `saveWorkoutTemplate`, `deleteWorkoutTemplateById`, `deleteWorkoutTemplates`
- Logs: `getWorkoutLogs`, `saveWorkoutLogs`, `deleteWorkoutLogs`
- Exercises: `getExercises`, `saveExercises`, `deleteExercises`
- User profile: `getUserProfile`, `saveUserProfile`, `deleteUserProfile`

Validation/compatibility rule: parse imports and normalize legacy payloads at the storage boundary before persisting.

### 6) How List/Table Screens Are Wired

Use this flow for list-style screens (cards, lists, table-like rows):

1. Load source data from storage in the route component.
2. Merge with seed data when relevant (for durable bootstrap).
3. Build computed filtered/sorted/enriched arrays for rendering.
4. Render using Quasar list/card primitives.
5. Trigger mutations through storage functions only, then refresh local state.

Concrete examples in this project:

- Exercise listing/search: `src/views/ExerciseLibraryView.vue`
- History grouped list with derived metrics: `src/views/WorkoutHistoryView.vue`
- Editable template list + form CRUD: `src/views/RoutineTemplateManager.vue`

This spec is intentionally minimal so it can be copied as a template baseline and evolved per-app without changing the local-first architecture.

### Template Branding

After cloning this project as a starter, update branding in one place:

- `src/config/appConfig.ts`

This controls the app display name, backup file prefix, default full-backup filename, and backup validation label text.

