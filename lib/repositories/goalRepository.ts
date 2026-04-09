import Goal, { GoalConstraints, GoalStatus } from "@/model/Goal";
import { getGoals as fetchGoals, syncGoals as pushGoals } from "@/lib/api/goals";
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

export async function syncGoalRepository(userId: string) {
  const syncedGoals = await pushGoals(userId, getGoals());
  syncedGoals.forEach((goal) => upsertGoal(goal));
  return syncedGoals;
}

export async function hydrateGoalsFromRemote(userId: string) {
  const goals = await fetchGoals(userId);
  goals.forEach((goal) => upsertGoal(goal));
  return goals;
}
