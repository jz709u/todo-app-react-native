import { GoalStatus } from "@/model/Goal";
import { PlanStatus } from "@/model/Plan";
import { StepApprovalState, StepStatus } from "@/model/PlanStep";
import { TaskPriority, TaskStatus } from "@/model/Task";

function formatUnderscoredLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function formatGoalStatus(status: GoalStatus) {
  return formatUnderscoredLabel(status);
}

export function formatPlanStatus(status: PlanStatus) {
  return formatUnderscoredLabel(status);
}

export function formatStepStatus(status: StepStatus) {
  return formatUnderscoredLabel(status);
}

export function formatStepApprovalState(approvalState: StepApprovalState) {
  return formatUnderscoredLabel(approvalState);
}

export function formatTaskStatus(status: TaskStatus) {
  return formatUnderscoredLabel(status);
}

export function formatTaskPriority(priority: TaskPriority) {
  return formatUnderscoredLabel(priority);
}
