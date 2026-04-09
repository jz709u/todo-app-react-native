import Goal from "@/model/Goal";

export interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  abstract_goal: string;
  status: Goal["status"];
  constraints: Goal["constraints"] | null;
  target_date: number | null;
  active_plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export function mapGoalRowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    abstractGoal: row.abstract_goal,
    status: row.status,
    constraints: row.constraints ?? {},
    targetDate: row.target_date ?? undefined,
    activePlanId: row.active_plan_id ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export function mapGoalToGoalRow(goal: Goal, userId: string): GoalRow {
  return {
    id: goal.id,
    user_id: userId,
    title: goal.title,
    abstract_goal: goal.abstractGoal,
    status: goal.status,
    constraints: goal.constraints,
    target_date: goal.targetDate ?? null,
    active_plan_id: goal.activePlanId ?? null,
    created_at: new Date(goal.createdAt).toISOString(),
    updated_at: new Date(goal.updatedAt).toISOString(),
  };
}
