import {
  buildTaskTitleFromStep,
  getApprovedPlanSteps,
  getSuggestedDueDateForStep,
  getTaskPriorityFromStep,
  hasMaterializedTaskForStep,
} from "@/lib/plan-materialization";
import Goal from "@/model/Goal";
import Task from "@/model/Task";
import PlanStep from "@/model/PlanStep";

describe("plan materialization helpers", () => {
  it("filters only approved plan steps", () => {
    const steps: PlanStep[] = [
      {
        id: "1",
        planId: "plan-1",
        title: "Approved step",
        order: 1,
        status: "approved",
        approvalState: "approved",
        dependsOnStepIds: [],
        priority: "high",
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "2",
        planId: "plan-1",
        title: "Rejected step",
        order: 2,
        status: "rejected",
        approvalState: "rejected",
        dependsOnStepIds: [],
        priority: "low",
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    expect(getApprovedPlanSteps(steps)).toHaveLength(1);
    expect(buildTaskTitleFromStep(steps[0])).toBe("Approved step");
    expect(getTaskPriorityFromStep(steps[0])).toBe("high");
  });

  it("suggests due dates from the goal deadline and detects duplicates", () => {
    const goal: Goal = {
      id: "goal-1",
      title: "Goal",
      abstractGoal: "Goal",
      status: "active",
      constraints: {},
      targetDate: 1_800_000_000_000,
      createdAt: 1,
      updatedAt: 1,
    };
    const approvedSteps: PlanStep[] = [
      {
        id: "1",
        planId: "plan-1",
        title: "First",
        order: 1,
        status: "approved",
        approvalState: "approved",
        dependsOnStepIds: [],
        priority: "high",
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "2",
        planId: "plan-1",
        title: "Second",
        order: 2,
        status: "approved",
        approvalState: "approved",
        dependsOnStepIds: [],
        priority: "medium",
        createdAt: 1,
        updatedAt: 1,
      },
    ];
    const existingTasks: Task[] = [
      {
        id: "task-1",
        goalId: "goal-1",
        title: "First",
        status: "todo",
        priority: "high",
        planStepId: "1",
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    expect(getSuggestedDueDateForStep(approvedSteps[0], approvedSteps, goal)).toBe(
      goal.targetDate! - 24 * 60 * 60 * 1000,
    );
    expect(getSuggestedDueDateForStep(approvedSteps[1], approvedSteps, goal)).toBe(
      goal.targetDate,
    );
    expect(hasMaterializedTaskForStep(existingTasks, "1")).toBe(true);
    expect(hasMaterializedTaskForStep(existingTasks, "2")).toBe(false);
  });
});
