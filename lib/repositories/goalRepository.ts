import Goal, { GoalConstraints, GoalStatus } from "@/model/Goal";
import { useGoalStore } from "@/store/goalStore";

interface CreateGoalInput {
  title: string;
  abstractGoal: string;
  constraints?: GoalConstraints;
  status?: GoalStatus;
  targetDate?: number;
  activePlanId?: string;
}

export function createGoal(input: CreateGoalInput) {
  return useGoalStore.getState().createGoal(input);
}

export function getGoalById(goalId: string) {
  return useGoalStore.getState().goalsById[goalId];
}

export function getGoals() {
  const { goalOrder, goalsById } = useGoalStore.getState();

  return goalOrder
    .map((goalId) => goalsById[goalId])
    .filter((goal): goal is Goal => Boolean(goal));
}

export function updateGoal(goalId: string, updates: Partial<Goal>) {
  useGoalStore.getState().updateGoal(goalId, updates);
}

export function upsertGoal(goal: Goal) {
  useGoalStore.getState().upsertGoal(goal);
}
