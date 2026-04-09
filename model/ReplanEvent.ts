export type ReplanTrigger =
  | "manual"
  | "task_overdue"
  | "task_blocked"
  | "deadline_changed"
  | "goal_changed";

export default interface ReplanEvent {
  id: string;
  goalId: string;
  planId: string;
  trigger: ReplanTrigger;
  reason: string;
  createdAt: number;
  metadata?: Record<string, string | number | boolean | null>;
}
