import Goal from "@/model/Goal";
import Plan from "@/model/Plan";
import PlanStep from "@/model/PlanStep";
import Task from "@/model/Task";

export function selectGoals(goalOrder: string[], goalsById: Record<string, Goal>) {
  return goalOrder
    .map((goalId) => goalsById[goalId])
    .filter((goal): goal is Goal => Boolean(goal));
}

export function selectPlansByGoalId(
  goalId: string,
  planOrder: string[],
  plansById: Record<string, Plan>,
) {
  return planOrder
    .map((planId) => plansById[planId])
    .filter((plan): plan is Plan => Boolean(plan))
    .filter((plan) => plan.goalId === goalId);
}

export function selectLatestDraftPlan(goalId: string, plans: Plan[]) {
  return plans
    .filter((plan) => plan.goalId === goalId && plan.status === "awaiting_approval")
    .at(-1);
}

export function selectPlanSteps(
  planId: string | undefined,
  planStepOrderByPlanId: Record<string, string[]>,
  planStepsById: Record<string, PlanStep>,
) {
  if (!planId) {
    return [];
  }

  return (planStepOrderByPlanId[planId] ?? [])
    .map((stepId) => planStepsById[stepId])
    .filter((step): step is PlanStep => Boolean(step))
    .sort((a, b) => a.order - b.order);
}

export function selectTasksByGoalId(
  goalId: string,
  taskOrder: string[],
  tasksById: Record<string, Task>,
) {
  return taskOrder
    .map((taskId) => tasksById[taskId])
    .filter((task): task is Task => Boolean(task))
    .filter((task) => task.goalId === goalId);
}

export function selectGoalProgress(tasks: Task[]) {
  const completedTaskCount = tasks.filter((task) => task.status === "done").length;
  const totalTaskCount = tasks.length;

  return {
    completedTaskCount,
    totalTaskCount,
    completionRatio:
      totalTaskCount === 0 ? 0 : completedTaskCount / totalTaskCount,
  };
}
