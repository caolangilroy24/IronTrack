# Architecture

## Overview

IronTrack is a client-side web application optimized for mobile viewports. It operates entirely local-first, utilizing browser storage mechanisms to record workouts, eliminating external network latency and server overhead during gym execution loops.

## UI & Design Specifications

- **Component Layout:** Every single `.vue` file must follow this exact block ordering sequence:
  1. `<template>`
  2. `<script setup lang="ts">`
  3. `<style scoped>` (Only when natively required; leverage Quasar design classes first).
- **Theme Constraints:** True Dark Mode enabled globally. Highlight colors must strictly use Quasar's Deep Orange configuration (`#FF5722`). Custom CSS components are banned; use utility tokens.

## Data Model (Shared Structures)

### WorkoutTemplate

Defines the structure of a repeatable routine.

```ts
export interface WorkoutTemplate {
  id: number;
  name: string; // e.g., "30-Min Chest & Shoulders"
  tags: string[]; // Muscle tags for Home Screen Heatmap (e.g., ["Chest", "Shoulders"])
  exercises: number[]; // Ordered array of Exercise IDs
}

export interface Exercise {
  id: number;
  name: string; // e.g., "Incline Dumbbell Press"
}

export interface LoggedSet {
  id: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutLog {
  id: number;
  templateId: number;
  date: string; // ISO Timestamp
  exercises: {
    exerciseId: number;
    sets: LoggedSet[];
  }[];
}

//New component
export interface UserProfile {
  themeColor: "orange" | "red" | "blue" | "purple";
}
```
