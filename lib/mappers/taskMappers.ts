import Task from "@/model/Task";

export interface TaskRow {
  id: string;
  goal_id: string;
  plan_step_id: string | null;
  title: string;
  status: Task["status"];
  priority: Task["priority"];
  due_date: number | null;
  scheduled_start: number | null;
  scheduled_end: number | null;
  completed_at: number | null;
  created_at: string;
  updated_at: string;
}

export function mapTaskRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    goalId: row.goal_id,
    planStepId: row.plan_step_id ?? undefined,
    title: row.title,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    scheduledStart: row.scheduled_start ?? undefined,
    scheduledEnd: row.scheduled_end ?? undefined,
    completedAt: row.completed_at ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export function mapTaskToTaskRow(task: Task): TaskRow {
  return {
    id: task.id,
    goal_id: task.goalId,
    plan_step_id: task.planStepId ?? null,
    title: task.title,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate ?? null,
    scheduled_start: task.scheduledStart ?? null,
    scheduled_end: task.scheduledEnd ?? null,
    completed_at: task.completedAt ?? null,
    created_at: new Date(task.createdAt).toISOString(),
    updated_at: new Date(task.updatedAt).toISOString(),
  };
}
