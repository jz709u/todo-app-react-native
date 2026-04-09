export type TaskStatus = "todo" | "doing" | "done" | "skipped";
export type TaskPriority = "low" | "medium" | "high";

export default interface Task {
  id: string;
  goalId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  planStepId?: string;
  dueDate?: number;
  scheduledStart?: number;
  scheduledEnd?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}
