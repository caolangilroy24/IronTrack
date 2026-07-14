import { MUSCLE_GROUPS } from "@/types/models";
import type { WorkoutLog, WorkoutTemplate } from "@/types/models";
import {
  calculateMuscleDecayMap,
  createEmptyMuscleDecayMap,
} from "@/utils/muscleDecay";

describe("muscle decay utility", () => {
  const templates: WorkoutTemplate[] = [
    {
      id: 1,
      name: "Push Day",
      tags: ["Chest", "Shoulders", "Arms"],
      exercises: [1, 2],
    },
    {
      id: 2,
      name: "Pull Day",
      tags: ["Back", "Triceps", "Forearms"],
      exercises: [3, 4],
    },
    {
      id: 3,
      name: "Leg Day",
      tags: ["Legs", "Glutes", "Calves", "Abs"],
      exercises: [5, 6],
    },
  ];

  const logs: WorkoutLog[] = [
    {
      id: 1,
      templateId: 1,
      date: "2026-07-12T09:00:00.000Z",
      exercises: [],
    },
    {
      id: 2,
      templateId: 2,
      date: "2026-07-10T09:00:00.000Z",
      exercises: [],
    },
    {
      id: 3,
      templateId: 3,
      date: "2026-07-08T09:00:00.000Z",
      exercises: [],
    },
  ];

  it("returns zero intensity for all supported muscle groups by default", () => {
    expect(createEmptyMuscleDecayMap()).toEqual(
      Object.fromEntries(MUSCLE_GROUPS.map((muscleGroup) => [muscleGroup, 0])),
    );
  });

  it("calculates intensity from the latest workout date for each muscle group", () => {
    const decayMap = calculateMuscleDecayMap(
      logs,
      templates,
      new Date("2026-07-13T18:00:00.000Z"),
    );

    expect(decayMap).toEqual({
      Chest: 0.8,
      Back: 0.4,
      Legs: 0,
      Shoulders: 0.8,
      Triceps: 0.4,
      Arms: 0.8,
      Abs: 0,
      Glutes: 0,
      Calves: 0,
      Forearms: 0.4,
    });
  });

  it("prefers the most recent matching workout and ignores invalid templates or dates", () => {
    const decayMap = calculateMuscleDecayMap(
      [
        ...logs,
        {
          id: 4,
          templateId: 1,
          date: "2026-07-13T08:00:00.000Z",
          exercises: [],
        },
        {
          id: 5,
          templateId: 999,
          date: "2026-07-13T08:00:00.000Z",
          exercises: [],
        },
        {
          id: 6,
          templateId: 2,
          date: "invalid-date",
          exercises: [],
        },
      ],
      templates,
      new Date("2026-07-13T18:00:00.000Z"),
    );

    expect(decayMap.Chest).toBe(1);
    expect(decayMap.Shoulders).toBe(1);
    expect(decayMap.Arms).toBe(1);
    expect(decayMap.Back).toBe(0.4);
    expect(decayMap.Triceps).toBe(0.4);
    expect(decayMap.Forearms).toBe(0.4);
  });
});
