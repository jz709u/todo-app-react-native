import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import Goal, { GoalConstraints, GoalStatus } from "@/model/Goal";

interface GoalStore {
  goalsById: Record<string, Goal>;
  goalOrder: string[];

  createGoal: (input: {
    title: string;
    abstractGoal: string;
    constraints?: GoalConstraints;
    status?: GoalStatus;
    targetDate?: number;
    activePlanId?: string;
  }) => string;
  upsertGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  removeGoal: (goalId: string) => void;
  getGoalById: (goalId: string) => Goal | undefined;
  getGoals: () => Goal[];
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goalsById: {},
      goalOrder: [],

      createGoal: (input) => {
        const goalId = nanoid();
        const timestamp = Date.now();
        const goal: Goal = {
          id: goalId,
          title: input.title,
          abstractGoal: input.abstractGoal,
          status: input.status ?? "draft",
          constraints: input.constraints ?? {},
          targetDate: input.targetDate,
          activePlanId: input.activePlanId,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          goalsById: {
            ...state.goalsById,
            [goalId]: goal,
          },
          goalOrder: [...state.goalOrder, goalId],
        }));

        return goalId;
      },

      upsertGoal: (goal) => {
        set((state) => ({
          goalsById: {
            ...state.goalsById,
            [goal.id]: goal,
          },
          goalOrder: state.goalOrder.includes(goal.id)
            ? state.goalOrder
            : [...state.goalOrder, goal.id],
        }));
      },

      updateGoal: (goalId, updates) => {
        const currentGoal = get().goalsById[goalId];
        if (!currentGoal) return;

        set((state) => ({
          goalsById: {
            ...state.goalsById,
            [goalId]: {
              ...currentGoal,
              ...updates,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      removeGoal: (goalId) => {
        set((state) => {
          const { [goalId]: _removedGoal, ...remainingGoals } = state.goalsById;

          return {
            goalsById: remainingGoals,
            goalOrder: state.goalOrder.filter((id) => id !== goalId),
          };
        });
      },

      getGoalById: (goalId) => get().goalsById[goalId],

      getGoals: () =>
        get()
          .goalOrder.map((goalId) => get().goalsById[goalId])
          .filter((goal): goal is Goal => Boolean(goal)),
    }),
    {
      name: "goal-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
