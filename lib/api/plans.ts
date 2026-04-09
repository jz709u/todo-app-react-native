import Plan from "@/model/Plan";
import PlanStep from "@/model/PlanStep";
import {
  mapPlanRowToPlan,
  mapPlanStepRowToPlanStep,
  mapPlanStepToPlanStepRow,
  mapPlanToPlanRow,
  PlanRow,
  PlanStepRow,
} from "@/lib/mappers/planMappers";
import { restSelect, restUpsert } from "@/lib/api/restClient";

export async function getPlans(goalId: string): Promise<Plan[]> {
  const query = new URLSearchParams({
    goal_id: `eq.${goalId}`,
    order: "created_at.asc",
  });

  const rows = await restSelect<PlanRow[]>("plans", query);
  return rows.map(mapPlanRowToPlan);
}

export async function syncPlans(plans: Plan[]): Promise<void> {
  if (plans.length > 0) {
    await restUpsert("plans", plans.map(mapPlanToPlanRow));
  }
}

export async function getPlanSteps(planId: string): Promise<PlanStep[]> {
  const query = new URLSearchParams({
    plan_id: `eq.${planId}`,
    order: "step_order.asc",
  });

  const rows = await restSelect<PlanStepRow[]>("plan_steps", query);
  return rows.map(mapPlanStepRowToPlanStep);
}

export async function syncPlanSteps(planSteps: PlanStep[]): Promise<void> {
  if (planSteps.length > 0) {
    await restUpsert("plan_steps", planSteps.map(mapPlanStepToPlanStepRow));
  }
}
