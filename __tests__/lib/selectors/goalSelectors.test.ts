import Goal from "@/model/Goal";
import Plan from "@/model/Plan";
import PlanStep from "@/model/PlanStep";
import Task from "@/model/Task";
import {
  selectGoalProgress,
  selectGoals,
  selectLatestDraftPlan,
  selectPlansByGoalId,
  selectPlanSteps,
  selectTasksByGoalId,
} from "@/lib/selectors/goalSelectors";

describe("goal selectors", () => {
  it("selects ordered goals", () => {
    const goalsById: Record<string, Goal> = {
      "g-1": {
        id: "g-1",
        title: "Goal 1",
        abstractGoal: "First",
        status: "draft",
        constraints: {},
        createdAt: 1,
        updatedAt: 1,
      },
      "g-2": {
        id: "g-2",
        title: "Goal 2",
        abstractGoal: "Second",
        status: "active",
        constraints: {},
        createdAt: 1,
        updatedAt: 1,
      },
    };

    expect(selectGoals(["g-2", "g-1"], goalsById).map((goal) => goal.id)).toEqual([
      "g-2",
      "g-1",
    ]);
  });

  it("selects plans, latest draft, steps, tasks, and progress", () => {
    const plansById: Record<string, Plan> = {
      "p-1": {
        id: "p-1",
        goalId: "g-1",
        status: "approved",
        summary: "Approved",
        assumptions: [],
        risks: [],
        version: 1,
        createdAt: 1,
        updatedAt: 1,
      },
      "p-2": {
        id: "p-2",
        goalId: "g-1",
        status: "awaiting_approval",
        summary: "Draft",
        assumptions: [],
        risks: [],
        version: 2,
        createdAt: 2,
        updatedAt: 2,
      },
    };
    const stepsById: Record<string, PlanStep> = {
      "s-1": {
        id: "s-1",
        planId: "p-2",
        title: "Step 2",
        order: 2,
        status: "proposed",
        approvalState: "pending",
        dependsOnStepIds: [],
        priority: "medium",
        createdAt: 1,
        updatedAt: 1,
      },
      "s-2": {
        id: "s-2",
        planId: "p-2",
        title: "Step 1",
        order: 1,
        status: "approved",
        approvalState: "approved",
        dependsOnStepIds: [],
        priority: "high",
        createdAt: 1,
        updatedAt: 1,
      },
    };
    const tasksById: Record<string, Task> = {
      "t-1": {
        id: "t-1",
        goalId: "g-1",
        title: "Task 1",
        status: "done",
        priority: "high",
        createdAt: 1,
        updatedAt: 1,
      },
      "t-2": {
        id: "t-2",
        goalId: "g-1",
        title: "Task 2",
        status: "todo",
        priority: "medium",
        createdAt: 1,
        updatedAt: 1,
      },
    };

    const plans = selectPlansByGoalId("g-1", ["p-1", "p-2"], plansById);
    expect(plans).toHaveLength(2);
    expect(selectLatestDraftPlan("g-1", plans)?.id).toBe("p-2");
    expect(
      selectPlanSteps("p-2", { "p-2": ["s-1", "s-2"] }, stepsById).map(
        (step) => step.id,
      ),
    ).toEqual(["s-2", "s-1"]);

    const tasks = selectTasksByGoalId("g-1", ["t-1", "t-2"], tasksById);
    expect(tasks).toHaveLength(2);
    expect(selectGoalProgress(tasks)).toEqual({
      completedTaskCount: 1,
      totalTaskCount: 2,
      completionRatio: 0.5,
    });
  });
});
