import Plan, { PlanStatus } from "@/model/Plan";
import PlanStep, { StepApprovalState, StepStatus } from "@/model/PlanStep";
import { TaskPriority } from "@/model/Task";
import { usePlanStore } from "@/store/planStore";

interface CreatePlanInput {
  goalId: string;
  summary: string;
  assumptions?: string[];
  risks?: string[];
  status?: PlanStatus;
  version?: number;
}

interface CreatePlanStepInput {
  planId: string;
  title: string;
  order: number;
  description?: string;
  dependsOnStepIds?: string[];
  estimatedMinutes?: number;
  priority?: TaskPriority;
  suggestedDueDate?: number;
  status?: StepStatus;
  approvalState?: StepApprovalState;
}

export function createPlan(input: CreatePlanInput) {
  return usePlanStore.getState().createPlan(input);
}

export function updatePlan(planId: string, updates: Partial<Plan>) {
  usePlanStore.getState().updatePlan(planId, updates);
}

export function getPlanById(planId: string) {
  return usePlanStore.getState().plansById[planId];
}

export function getPlansByGoalId(goalId: string) {
  const { planOrder, plansById } = usePlanStore.getState();

  return planOrder
    .map((planId) => plansById[planId])
    .filter((plan): plan is Plan => Boolean(plan))
    .filter((plan) => plan.goalId === goalId);
}

export function createPlanStep(input: CreatePlanStepInput) {
  return usePlanStore.getState().createPlanStep(input);
}

export function updatePlanStep(stepId: string, updates: Partial<PlanStep>) {
  usePlanStore.getState().updatePlanStep(stepId, updates);
}

export function getPlanStepById(stepId: string) {
  return usePlanStore.getState().planStepsById[stepId];
}

export function getPlanSteps(planId: string) {
  const { planStepOrderByPlanId, planStepsById } = usePlanStore.getState();

  return (planStepOrderByPlanId[planId] ?? [])
    .map((stepId) => planStepsById[stepId])
    .filter((step): step is PlanStep => Boolean(step))
    .sort((a, b) => a.order - b.order);
}
