import PlanStep from "@/model/PlanStep";
import { MockPlanStepDraft } from "@/lib/mock-goal-planner";

export function getApprovedPlanSteps(steps: PlanStep[]) {
  return steps.filter(
    (step) =>
      step.approvalState === "approved" || step.approvalState === "edited",
  );
}

export function buildTaskTitleFromStep(step: PlanStep | MockPlanStepDraft) {
  return step.title;
}
