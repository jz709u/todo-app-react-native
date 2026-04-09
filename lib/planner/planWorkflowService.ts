import {
  buildTaskTitleFromStep,
  getMaterializedTaskForStep,
  getSuggestedDueDateForStep,
  getTaskPriorityFromStep,
  getApprovedPlanSteps,
} from "@/lib/plan-materialization";
import { requestPlanDraft } from "@/lib/planner/planDraftService";
import {
  createPlan,
  createPlanStep,
  getPlansByGoalId,
  getPlanSteps,
  updatePlan,
} from "@/lib/repositories/planRepository";
import {
  createTask,
  getTasksByGoalId,
  updateTask,
} from "@/lib/repositories/taskRepository";
import { getGoalById, updateGoal } from "@/lib/repositories/goalRepository";
import { selectLatestDraftPlan } from "@/lib/selectors/goalSelectors";

export async function createDraftPlanForGoal(goalId: string) {
  const goal = getGoalById(goalId);
  if (!goal) {
    throw new Error("Goal not found");
  }

  const existingDraftPlan = selectLatestDraftPlan(goalId, getPlansByGoalId(goalId));

  if (existingDraftPlan) {
    updatePlan(existingDraftPlan.id, { status: "superseded" });
  }

  const generated = await requestPlanDraft(goal);
  const planId = createPlan({
    goalId,
    summary: generated.summary,
    assumptions: generated.assumptions,
    risks: generated.risks,
    status: "awaiting_approval",
  });

  generated.steps.forEach((step, index) => {
    createPlanStep({
      planId,
      title: step.title,
      description: step.description,
      order: index + 1,
      estimatedMinutes: step.estimatedMinutes,
      priority: step.priority,
      status: "proposed",
      approvalState: "pending",
    });
  });

  updateGoal(goalId, { status: "planning" });

  return planId;
}

export function approveDraftPlanForGoal(goalId: string) {
  const goal = getGoalById(goalId);
  if (!goal) {
    throw new Error("Goal not found");
  }

  const plans = getPlansByGoalId(goalId);
  const draftPlan = selectLatestDraftPlan(goalId, plans);
  if (!draftPlan) {
    throw new Error("Draft plan not found");
  }

  const draftSteps = getPlanSteps(draftPlan.id);
  const approvedSteps = getApprovedPlanSteps(draftSteps);
  const existingTasks = getTasksByGoalId(goalId);

  approvedSteps.forEach((step) => {
    const dueDate = getSuggestedDueDateForStep(step, approvedSteps, goal);
    const priority = getTaskPriorityFromStep(step);
    const existingTask = getMaterializedTaskForStep(existingTasks, step.id);

    if (existingTask) {
      updateTask(existingTask.id, {
        title: buildTaskTitleFromStep(step),
        dueDate,
        priority,
      });
      return;
    }

    createTask({
      goalId,
      planStepId: step.id,
      title: buildTaskTitleFromStep(step),
      dueDate,
      priority,
    });
  });

  updatePlan(draftPlan.id, { status: "approved" });
  updateGoal(goalId, {
    activePlanId: draftPlan.id,
    status: approvedSteps.length > 0 ? "active" : "draft",
  });

  return draftPlan.id;
}

export function getDraftPlanReviewState(goalId: string) {
  const goal = getGoalById(goalId);
  const plans = getPlansByGoalId(goalId);
  const draftPlan = selectLatestDraftPlan(goalId, plans);
  const draftSteps = draftPlan ? getPlanSteps(draftPlan.id) : [];
  const existingTasks = getTasksByGoalId(goalId);
  const approvedSteps = getApprovedPlanSteps(draftSteps);

  return {
    goal,
    draftPlan,
    draftSteps,
    existingTasks,
    approvedSteps,
  };
}
