import { seedExercises } from "@/data/seedExercises";
import {
  LOCAL_USERS,
  deleteWorkoutTemplateById,
  deleteExercises,
  deleteWorkoutLogs,
  deleteUserProfile,
  deleteWorkoutTemplates,
  getActiveUserId,
  getLocalUsersWithTheme,
  getExercises,
  getLocalStoragePayload,
  getUserProfile,
  getWorkoutLogs,
  getWorkoutTemplates,
  saveActiveUserId,
  saveExercises,
  saveWorkoutLogs,
  saveWorkoutTemplate,
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
  const userId = "k-lin";

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
    expect(getWorkoutTemplates(userId)).toEqual([]);

    saveWorkoutTemplates(templates, userId);
    expect(getWorkoutTemplates(userId)).toEqual(templates);
    expect(
      localStorage.getItem(
        `irontrack.users.${userId}.${STORAGE_KEYS.workoutTemplates}`,
      ),
    ).toBe(
      JSON.stringify(templates),
    );

    deleteWorkoutTemplates(userId);
    expect(getWorkoutTemplates(userId)).toEqual([]);
  });

  it("upserts and deletes a single workout template", () => {
    const updatedTemplate: WorkoutTemplate = {
      ...templates[0],
      name: "Push Day Plus",
      exercises: [1, 3, 6],
    };

    expect(saveWorkoutTemplate(templates[0], userId)).toEqual(templates);
    expect(saveWorkoutTemplate(updatedTemplate, userId)).toEqual([
      updatedTemplate,
    ]);
    expect(getWorkoutTemplates(userId)).toEqual([updatedTemplate]);
    expect(deleteWorkoutTemplateById(updatedTemplate.id, userId)).toEqual([]);
    expect(getWorkoutTemplates(userId)).toEqual([]);
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
    expect(getWorkoutLogs(userId)).toEqual([]);

    saveWorkoutLogs(logs, userId);
    expect(getWorkoutLogs(userId)).toEqual(logs);
    expect(
      localStorage.getItem(`irontrack.users.${userId}.${STORAGE_KEYS.workoutLogs}`),
    ).toBe(
      JSON.stringify(logs),
    );

    deleteWorkoutLogs(userId);
    expect(getWorkoutLogs(userId)).toEqual([]);
  });

  it("returns the combined local storage payload", () => {
    saveWorkoutTemplates(templates, userId);
    saveExercises(exercises);
    saveWorkoutLogs(logs, userId);
    saveUserProfile(profile, userId);

    expect(getLocalStoragePayload()).toEqual({
      activeUserId: "k-lin",
      users: [
        {
          id: "k-lin",
          name: "K-Lin",
          workoutTemplates: templates,
          workoutLogs: logs,
          userProfile: profile,
        },
        {
          id: "maz",
          name: "Maz",
          workoutTemplates: [],
          workoutLogs: [],
          userProfile: { themeColor: "orange" },
        },
        {
          id: "needlebeard",
          name: "NeedleBeard",
          workoutTemplates: [],
          workoutLogs: [],
          userProfile: { themeColor: "orange" },
        },
        {
          id: "bigsteve",
          name: "BigSteve",
          workoutTemplates: [],
          workoutLogs: [],
          userProfile: { themeColor: "orange" },
        },
      ],
      exercises,
    });
  });

  it("stores and validates active user selection", () => {
    expect(getActiveUserId()).toBe("k-lin");

    saveActiveUserId("maz");
    expect(getActiveUserId()).toBe("maz");

    saveActiveUserId("unknown-user");
    expect(getActiveUserId()).toBe("maz");
  });

  it("returns local users with each user's active theme", () => {
    saveUserProfile({ themeColor: "blue" }, "maz");
    saveUserProfile({ themeColor: "red" }, "bigsteve");

    expect(getLocalUsersWithTheme()).toEqual([
      { id: "k-lin", name: "K-Lin", themeColor: "orange" },
      { id: "maz", name: "Maz", themeColor: "blue" },
      { id: "needlebeard", name: "NeedleBeard", themeColor: "orange" },
      { id: "bigsteve", name: "BigSteve", themeColor: "red" },
    ]);
    expect(LOCAL_USERS).toHaveLength(4);
  });

  it("saves, reads, and deletes user profile with orange default", () => {
    expect(getUserProfile(userId)).toEqual({ themeColor: "orange" });

    saveUserProfile(profile, userId);
    expect(getUserProfile(userId)).toEqual(profile);
    expect(
      localStorage.getItem(`irontrack.users.${userId}.${STORAGE_KEYS.userProfile}`),
    ).toBe(
      JSON.stringify(profile),
    );

    deleteUserProfile(userId);
    expect(getUserProfile(userId)).toEqual({ themeColor: "orange" });
  });

  it("exports the local storage payload as downloadable json", async () => {
    saveWorkoutTemplates(templates, userId);
    saveExercises(exercises);
    saveWorkoutLogs(logs, userId);
    saveUserProfile(profile, userId);

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
      activeUserId: "k-lin",
      users: [
        {
          id: "k-lin",
          name: "K-Lin",
          workoutTemplates: templates,
          workoutLogs: logs,
          userProfile: profile,
        },
        {
          id: "maz",
          name: "Maz",
          workoutTemplates: [],
          workoutLogs: [],
          userProfile: { themeColor: "orange" },
        },
        {
          id: "needlebeard",
          name: "NeedleBeard",
          workoutTemplates: [],
          workoutLogs: [],
          userProfile: { themeColor: "orange" },
        },
        {
          id: "bigsteve",
          name: "BigSteve",
          workoutTemplates: [],
          workoutLogs: [],
          userProfile: { themeColor: "orange" },
        },
      ],
      exercises,
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
