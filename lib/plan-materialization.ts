import PlanStep from "@/model/PlanStep";
import Goal from "@/model/Goal";
import Task from "@/model/Task";
import { PlanStepDraft } from "@/lib/planner/types";

export function getApprovedPlanSteps(steps: PlanStep[]) {
  return steps.filter(
    (step) =>
      step.approvalState === "approved" || step.approvalState === "edited",
  );
}

export function buildTaskTitleFromStep(step: PlanStep | PlanStepDraft) {
  return step.title;
}

export function getTaskPriorityFromStep(step: PlanStep) {
  return step.priority ?? "medium";
}

export function getSuggestedDueDateForStep(
  step: PlanStep,
  approvedSteps: PlanStep[],
  goal: Goal,
) {
  if (step.suggestedDueDate) {
    return step.suggestedDueDate;
  }

  if (!goal.targetDate || approvedSteps.length === 0) {
    return undefined;
  }

  const totalSteps = approvedSteps.length;
  const reverseOffset = totalSteps - step.order;
  const millisPerDay = 24 * 60 * 60 * 1000;

  return goal.targetDate - reverseOffset * millisPerDay;
}

export function hasMaterializedTaskForStep(
  existingTasks: Task[],
  planStepId: string,
) {
  return existingTasks.some((task) => task.planStepId === planStepId);
}

export function getMaterializedTaskForStep(
  existingTasks: Task[],
  planStepId: string,
) {
  return existingTasks.find((task) => task.planStepId === planStepId);
}
