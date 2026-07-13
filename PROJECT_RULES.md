# Project Rules

## Architecture Constraints

- **Vue File Layout:** Every single `.vue` file must follow this exact order:
  1. `<template>`
  2. `<script setup lang="ts">`
  3. `<style scoped>`
- **No Over-Engineering:** Do not create custom "service layers" or "factories" for built-in Quasar functionality. Use native Quasar props (`color="deep-orange"`) and framework plugins (`Dark`).
- **Local Storage First:** Keep everything in browser storage (IndexedDB/localStorage). No backend/Express code in MVP.
- **No Extra Dependencies:** Rely strictly on Vue 3 Composition API, Quasar components, and native ES6+.
