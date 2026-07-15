import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/components/Dashboard.vue";
import RoutineTemplateManager from "@/components/RoutineTemplateManager.vue";
import ActiveWorkoutView from "@/views/ActiveWorkoutView.vue";
import ExerciseLibraryView from "@/views/ExerciseLibraryView.vue";
import WorkoutHistoryView from "@/views/WorkoutHistoryView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: Dashboard,
    },
    {
      path: "/workouts",
      name: "workouts",
      component: RoutineTemplateManager,
    },
    {
      path: "/exercises",
      name: "exercises",
      component: ExerciseLibraryView,
    },
    {
      path: "/history",
      name: "history",
      component: WorkoutHistoryView,
    },
    {
      path: "/logs",
      redirect: "/history",
    },
    {
      path: "/workout",
      name: "workout",
      component: ActiveWorkoutView,
    },
  ],
});

export default router;
