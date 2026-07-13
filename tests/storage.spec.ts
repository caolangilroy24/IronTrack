import { seedExercises } from "@/data/seedExercises";
import {
  deleteExercises,
  deleteWorkoutLogs,
  deleteUserProfile,
  deleteWorkoutTemplates,
  getExercises,
  getLocalStoragePayload,
  getUserProfile,
  getWorkoutLogs,
  getWorkoutTemplates,
  saveExercises,
  saveWorkoutLogs,
  saveUserProfile,
  saveWorkoutTemplates,
  STORAGE_KEYS,
} from "@/storage/localStorage";
import type {
  Exercise,
  UserProfile,
  WorkoutLog,
  WorkoutTemplate,
} from "@/types/models";
import { exportLocalStorageBackup } from "@/utils/exportBackup";

describe("local storage utilities", () => {
  const templates: WorkoutTemplate[] = [
    {
      id: 1,
      name: "Push Day",
      tags: ["Chest", "Shoulders"],
      exercises: [1, 3],
    },
  ];

  const exercises: Exercise[] = [
    { id: 1, name: "Bench Press" },
    { id: 3, name: "Incline Dumbbell Press" },
  ];

  const logs: WorkoutLog[] = [
    {
      id: 1,
      templateId: 1,
      date: "2026-07-13T12:00:00.000Z",
      exercises: [
        {
          exerciseId: 1,
          sets: [{ id: 1, reps: 8, weight: 185, completed: true }],
        },
      ],
    },
  ];

  const profile: UserProfile = {
    themeColor: "purple",
  };

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("saves, reads, and deletes workout templates", () => {
    expect(getWorkoutTemplates()).toEqual([]);

    saveWorkoutTemplates(templates);
    expect(getWorkoutTemplates()).toEqual(templates);
    expect(localStorage.getItem(STORAGE_KEYS.workoutTemplates)).toBe(
      JSON.stringify(templates),
    );

    deleteWorkoutTemplates();
    expect(getWorkoutTemplates()).toEqual([]);
  });

  it("saves, reads, and deletes exercises", () => {
    expect(getExercises()).toEqual([]);

    saveExercises(exercises);
    expect(getExercises()).toEqual(exercises);
    expect(localStorage.getItem(STORAGE_KEYS.exercises)).toBe(
      JSON.stringify(exercises),
    );

    deleteExercises();
    expect(getExercises()).toEqual([]);
  });

  it("saves, reads, and deletes workout logs", () => {
    expect(getWorkoutLogs()).toEqual([]);

    saveWorkoutLogs(logs);
    expect(getWorkoutLogs()).toEqual(logs);
    expect(localStorage.getItem(STORAGE_KEYS.workoutLogs)).toBe(
      JSON.stringify(logs),
    );

    deleteWorkoutLogs();
    expect(getWorkoutLogs()).toEqual([]);
  });

  it("returns the combined local storage payload", () => {
    saveWorkoutTemplates(templates);
    saveExercises(exercises);
    saveWorkoutLogs(logs);
    saveUserProfile(profile);

    expect(getLocalStoragePayload()).toEqual({
      workoutTemplates: templates,
      exercises,
      workoutLogs: logs,
      userProfile: profile,
    });
  });

  it("saves, reads, and deletes user profile with orange default", () => {
    expect(getUserProfile()).toEqual({ themeColor: "orange" });

    saveUserProfile(profile);
    expect(getUserProfile()).toEqual(profile);
    expect(localStorage.getItem(STORAGE_KEYS.userProfile)).toBe(
      JSON.stringify(profile),
    );

    deleteUserProfile();
    expect(getUserProfile()).toEqual({ themeColor: "orange" });
  });

  it("exports the local storage payload as downloadable json", async () => {
    saveWorkoutTemplates(templates);
    saveExercises(exercises);
    saveWorkoutLogs(logs);
    saveUserProfile(profile);

    const createObjectURL = jest.fn().mockReturnValue("blob:backup");
    const revokeObjectURL = jest.fn();
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });

    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    const click = jest.fn();
    const createElement = jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        if (tagName === "a") {
          return {
            href: "",
            download: "",
            click,
          } as unknown as HTMLAnchorElement;
        }

        return document.createElement(tagName);
      });

    const json = exportLocalStorageBackup("backup.json");
    const blob = createObjectURL.mock.calls[0][0] as Blob;

    expect(JSON.parse(json)).toEqual({
      workoutTemplates: templates,
      exercises,
      workoutLogs: logs,
      userProfile: profile,
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/json");
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:backup");
    expect(createElement).toHaveBeenCalledWith("a");

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: originalCreateObjectURL,
    });

    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: originalRevokeObjectURL,
    });
  });
});

describe("seed exercises", () => {
  it("includes standard starter exercises", () => {
    expect(seedExercises).toEqual(
      expect.arrayContaining([
        { id: 1, name: "Bench Press" },
        { id: 2, name: "Squat" },
        { id: 3, name: "Incline Dumbbell Press" },
        { id: 4, name: "Pull-ups" },
      ]),
    );
  });
});
