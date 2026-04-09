import Plan from "@/model/Plan";
import PlanStep from "@/model/PlanStep";

export interface PlanRow {
  id: string;
  goal_id: string;
  status: Plan["status"];
  summary: string;
  assumptions: string[] | null;
  risks: string[] | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface PlanStepRow {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  step_order: number;
  status: PlanStep["status"];
  approval_state: PlanStep["approvalState"];
  depends_on_step_ids: string[] | null;
  estimated_minutes: number | null;
  priority: PlanStep["priority"] | null;
  suggested_due_date: number | null;
  created_at: string;
  updated_at: string;
}

export function mapPlanRowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    goalId: row.goal_id,
    status: row.status,
    summary: row.summary,
    assumptions: row.assumptions ?? [],
    risks: row.risks ?? [],
    version: row.version,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export function mapPlanToPlanRow(plan: Plan): PlanRow {
  return {
    id: plan.id,
    goal_id: plan.goalId,
    status: plan.status,
    summary: plan.summary,
    assumptions: plan.assumptions,
    risks: plan.risks,
    version: plan.version,
    created_at: new Date(plan.createdAt).toISOString(),
    updated_at: new Date(plan.updatedAt).toISOString(),
  };
}

export function mapPlanStepRowToPlanStep(row: PlanStepRow): PlanStep {
  return {
    id: row.id,
    planId: row.plan_id,
    title: row.title,
    description: row.description ?? undefined,
    order: row.step_order,
    status: row.status,
    approvalState: row.approval_state,
    dependsOnStepIds: row.depends_on_step_ids ?? [],
    estimatedMinutes: row.estimated_minutes ?? undefined,
    priority: row.priority ?? undefined,
    suggestedDueDate: row.suggested_due_date ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export function mapPlanStepToPlanStepRow(step: PlanStep): PlanStepRow {
  return {
    id: step.id,
    plan_id: step.planId,
    title: step.title,
    description: step.description ?? null,
    step_order: step.order,
    status: step.status,
    approval_state: step.approvalState,
    depends_on_step_ids: step.dependsOnStepIds,
    estimated_minutes: step.estimatedMinutes ?? null,
    priority: step.priority ?? null,
    suggested_due_date: step.suggestedDueDate ?? null,
    created_at: new Date(step.createdAt).toISOString(),
    updated_at: new Date(step.updatedAt).toISOString(),
  };
}
