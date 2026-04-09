import { TaskPriority } from "@/model/Task";

export interface PlanStepDraft {
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: TaskPriority;
}

export interface PlanDraft {
  summary: string;
  assumptions: string[];
  risks: string[];
  steps: PlanStepDraft[];
}
