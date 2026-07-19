import { seedExercises } from "@/data/seedExercises";
import {
  applyLocalUserStorageImport,
  LOCAL_USERS,
  deleteWorkoutTemplateById,
  deleteExercises,
  deleteWorkoutLogs,
  deleteUserProfile,
  deleteWorkoutTemplates,
  getActiveUserId,
  getLocalUsersWithTheme,
  getExercises,
  getLocalUserImportPlan,
  getLocalUserStoragePayload,
  getLocalStoragePayload,
  getUserProfile,
  getWorkoutLogs,
  getWorkoutTemplates,
  parseLocalUserStoragePayload,
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
import {
  buildBackupFileName,
  exportLocalStorageBackup,
  exportLocalUserStorageBackup,
} from "@/utils/exportBackup";

describe("local storage utilities", () => {
  const userId = "k-lin";

  const templates: WorkoutTemplate[] = [
    {
      id: 1,
      name: "Push Day",
      muscleGroups: ["Chest", "Shoulders"],
      exercises: [1, 3],
    },
  ];

  const exercises: Exercise[] = [
    { id: 1, name: "Bench Press", muscleGroups: ["Chest", "Triceps", "Shoulders"] },
    { id: 3, name: "Incline Dumbbell Press", muscleGroups: ["Chest", "Shoulders", "Triceps"] },
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
    ).toBe(JSON.stringify(getWorkoutTemplates(userId)));

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

  it("returns a user-specific export payload", () => {
    saveWorkoutTemplates(templates, userId);
    saveWorkoutLogs(logs, userId);
    saveUserProfile(profile, userId);
    saveExercises(exercises);

    expect(getLocalUserStoragePayload(userId)).toEqual({
      user: {
        id: "k-lin",
        name: "K-Lin",
        workoutTemplates: templates,
        workoutLogs: logs,
        userProfile: profile,
      },
      exercises,
    });
  });

  it("parses a valid user-specific import payload", () => {
    const payloadJson = JSON.stringify({
      user: {
        id: "k-lin",
        name: "Changed Name",
        workoutTemplates: templates,
        workoutLogs: logs,
        userProfile: profile,
      },
      exercises,
    });

    expect(parseLocalUserStoragePayload(payloadJson)).toEqual({
      user: {
        id: "k-lin",
        name: "Changed Name",
        workoutTemplates: templates,
        workoutLogs: logs,
        userProfile: profile,
      },
      exercises,
    });
  });

  it("parses theme color from user-edited casing and whitespace", () => {
    const payloadJson = JSON.stringify({
      user: {
        id: "k-lin",
        name: "K-Lin",
        workoutTemplates: templates,
        workoutLogs: logs,
        userProfile: {
          themeColor: " Purple ",
        },
      },
      exercises,
    });

    expect(parseLocalUserStoragePayload(payloadJson)).toEqual({
      user: {
        id: "k-lin",
        name: "K-Lin",
        workoutTemplates: templates,
        workoutLogs: logs,
        userProfile: {
          themeColor: "purple",
        },
      },
      exercises,
    });
  });

  it("parses user-specific payload when pasted JSON contains smart quotes", () => {
    const payloadJson = `{
      "user": {
        "id": "k-lin",
        "name": "K-Lin",
        "workoutTemplates": [],
        "workoutLogs": [],
        "userProfile": {
          "themeColor": “purple"
        }
      },
      "exercises": [
        {
          "id": 7,
          "name": "Barbell Row"
        }
      ]
    }`;

    expect(parseLocalUserStoragePayload(payloadJson)).toEqual({
      user: {
        id: "k-lin",
        name: "K-Lin",
        workoutTemplates: [],
        workoutLogs: [],
        userProfile: {
          themeColor: "purple",
        },
      },
      exercises: [{ id: 7, name: "Barbell Row", muscleGroups: [] }],
    });
  });

  it("rejects an invalid user-specific import payload", () => {
    expect(parseLocalUserStoragePayload('{"user":{"id":"k-lin"}}')).toBeNull();
  });

  it("builds an import plan for missing local templates and exercises", () => {
    saveWorkoutTemplates(
      [
        ...templates,
        {
          id: 2,
          name: "Leg Day",
          muscleGroups: ["Legs"],
          exercises: [2],
        },
      ],
      userId,
    );
    saveExercises([...exercises, { id: 2, name: "Squat", muscleGroups: ["Legs", "Quads", "Glutes"] }]);

    expect(
      getLocalUserImportPlan({
        user: {
          id: "k-lin",
          name: "K-Lin",
          workoutTemplates: templates,
          workoutLogs: logs,
          userProfile: profile,
        },
        exercises,
      }),
    ).toEqual({
      targetUserId: "k-lin",
      targetUserName: "K-Lin",
      missingWorkoutTemplates: [
        {
          id: 2,
          name: "Leg Day",
          muscleGroups: ["Legs"],
          exercises: [2],
        },
      ],
      missingExercises: [{ id: 2, name: "Squat", muscleGroups: ["Legs", "Quads", "Glutes"] }],
    });
  });

  it("merges imported user data without overwriting local-only logs", () => {
    saveWorkoutTemplates(
      [
        {
          id: 1,
          name: "Old Push Day",
          muscleGroups: ["Chest"],
          exercises: [1],
        },
      ],
      userId,
    );
    saveWorkoutLogs(
      [
        {
          id: 1,
          templateId: 1,
          date: "2026-07-12T12:00:00.000Z",
          exercises: [
            {
              exerciseId: 1,
              sets: [{ id: 1, reps: 5, weight: 135, completed: true }],
            },
          ],
        },
      ],
      userId,
    );
    saveExercises([{ id: 1, name: "Bench Press", muscleGroups: ["Chest", "Triceps", "Shoulders"] }]);

    const result = applyLocalUserStorageImport({
      user: {
        id: "k-lin",
        name: "K-Lin",
        workoutTemplates: templates,
        workoutLogs: logs,
        userProfile: profile,
      },
      exercises,
    });

    expect(result?.targetUserId).toBe("k-lin");
    expect(getWorkoutTemplates(userId)).toEqual(templates);
    expect(getUserProfile(userId)).toEqual(profile);
    expect(getWorkoutLogs(userId)).toEqual([
      {
        ...logs[0],
        id: 2,
      },
      {
        id: 1,
        templateId: 1,
        date: "2026-07-12T12:00:00.000Z",
        exercises: [
          {
            exerciseId: 1,
            sets: [{ id: 1, reps: 5, weight: 135, completed: true }],
          },
        ],
      },
    ]);
    expect(LOCAL_USERS.find((user) => user.id === userId)?.name).toBe("K-Lin");
  });

  it("rejects import plans when backup user name does not match local identity", () => {
    expect(
      getLocalUserImportPlan({
        user: {
          id: "k-lin",
          name: "Edited Name",
          workoutTemplates: templates,
          workoutLogs: logs,
          userProfile: profile,
        },
        exercises,
      }),
    ).toBeNull();
  });

  it("deletes selected missing items before merging import data", () => {
    saveWorkoutTemplates(
      [
        ...templates,
        {
          id: 2,
          name: "Leg Day",
          muscleGroups: ["Legs"],
          exercises: [2],
        },
      ],
      userId,
    );
    saveExercises([...exercises, { id: 2, name: "Squat", muscleGroups: ["Legs", "Quads", "Glutes"] }]);

    applyLocalUserStorageImport(
      {
        user: {
          id: "k-lin",
          name: "K-Lin",
          workoutTemplates: templates,
          workoutLogs: logs,
          userProfile: profile,
        },
        exercises,
      },
      {
        deleteWorkoutTemplateIds: [2],
        deleteExerciseIds: [2],
      },
    );

    expect(getWorkoutTemplates(userId)).toEqual(templates);
    expect(getExercises()).toEqual(exercises);
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

  it("normalizes legacy template tags and exercise muscle groups from storage", () => {
    localStorage.setItem(
      `irontrack.users.${userId}.${STORAGE_KEYS.workoutTemplates}`,
      JSON.stringify([
        {
          id: 1,
          name: "Push Day",
          tags: ["Chest", "Shoulders"],
          exercises: [1, 3],
        },
      ]),
    );
    localStorage.setItem(
      STORAGE_KEYS.exercises,
      JSON.stringify([
        { id: 1, name: "Bench Press" },
      ]),
    );

    expect(getWorkoutTemplates(userId)).toEqual(templates);
    expect(getExercises()).toEqual([
      { id: 1, name: "Bench Press", muscleGroups: [] },
    ]);
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

  it("exports a user-specific backup with a dated filename", () => {
    saveWorkoutTemplates(templates, userId);
    saveExercises(exercises);
    saveWorkoutLogs(logs, userId);
    saveUserProfile(profile, userId);

    const createObjectURL = jest.fn().mockReturnValue("blob:user-backup");
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

    const json = exportLocalUserStorageBackup(userId, new Date("2026-07-19T12:00:00.000Z"));

    expect(JSON.parse(json)).toEqual({
      user: {
        id: "k-lin",
        name: "K-Lin",
        workoutTemplates: templates,
        workoutLogs: logs,
        userProfile: profile,
      },
      exercises,
    });
    expect(buildBackupFileName(new Date("2026-07-19T12:00:00.000Z"))).toBe(
      "laidir_backup_20260719.json",
    );
    expect(click).toHaveBeenCalledTimes(1);
    expect(createElement).toHaveBeenCalledWith("a");

    const anchor = createElement.mock.results[0].value as HTMLAnchorElement;
    expect(anchor.download).toBe("laidir_backup_20260719.json");

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
        {
          id: 1,
          name: "Bench Press",
          muscleGroups: ["Chest", "Triceps", "Shoulders"],
        },
        {
          id: 2,
          name: "Squat",
          muscleGroups: ["Legs", "Quads", "Glutes"],
        },
        {
          id: 3,
          name: "Incline Dumbbell Press",
          muscleGroups: ["Chest", "Shoulders", "Triceps"],
        },
        {
          id: 4,
          name: "Pull-ups",
          muscleGroups: ["Back", "Biceps", "Forearms", "Upper Back"],
        },
      ]),
    );
  });
});
