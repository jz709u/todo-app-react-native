import Goal from "@/model/Goal";
import { GoalRow, mapGoalRowToGoal, mapGoalToGoalRow } from "@/lib/mappers/goalMappers";
import { restSelect, restUpsert } from "@/lib/api/restClient";

export async function getGoals(userId: string): Promise<Goal[]> {
  const query = new URLSearchParams({
    user_id: `eq.${userId}`,
    order: "created_at.asc",
  });

  const rows = await restSelect<GoalRow[]>("goals", query);
  return rows.map(mapGoalRowToGoal);
}

export async function syncGoals(userId: string, goals: Goal[]): Promise<Goal[]> {
  if (goals.length > 0) {
    await restUpsert("goals", goals.map((goal) => mapGoalToGoalRow(goal, userId)));
  }

  return getGoals(userId);
}
