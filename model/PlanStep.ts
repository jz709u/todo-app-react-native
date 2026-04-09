import { TaskPriority } from "@/model/Task";

export type StepStatus =
  | "proposed"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "blocked";

export type StepApprovalState =
  | "pending"
  | "approved"
  | "edited"
  | "rejected";

export default interface PlanStep {
  id: string;
  planId: string;
  title: string;
  order: number;
  status: StepStatus;
  approvalState: StepApprovalState;
  dependsOnStepIds: string[];
  description?: string;
  estimatedMinutes?: number;
  priority?: TaskPriority;
  suggestedDueDate?: number;
  createdAt: number;
  updatedAt: number;
}
