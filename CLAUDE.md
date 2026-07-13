# Claude / AI Coding Guidelines

This file governs agent execution behaviors inside this workspace.

## Scope Discipline

- Implement **exactly one milestone** at a time.
- Stop immediately once the requested milestone satisfies its success criteria.
- Do not introduce unnecessary service abstractions, factories, or wrapper layers for basic framework utilities.

## Direct Implementation Workflow

When assigned a milestone:

1. Define any new TypeScript interfaces in `@/types`.
2. Implement functional, clean code directly into components or storage utilities.
3. Verify using Jest tests (`npm run test`).
4. Output concise explanations of changes made.
