import { beforeEach, describe, expect, jest, it } from "@jest/globals";

import Goal from "@/model/Goal";
import Plan from "@/model/Plan";
import PlanStep from "@/model/PlanStep";
import Task from "@/model/Task";
import { getGoals, syncGoals } from "@/lib/api/goals";
import { getPlans, getPlanSteps, syncPlans, syncPlanSteps } from "@/lib/api/plans";
import { getTasks, syncTasks } from "@/lib/api/tasks";

describe("domain API modules", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it("fetches and syncs goals", async () => {
    const goal: Goal = {
      id: "goal-1",
      title: "Launch",
      abstractGoal: "Ship launch",
      status: "draft",
      constraints: {},
      createdAt: 10,
      updatedAt: 20,
    };

    await syncGoals("user-1", [goal]);
    await getGoals("user-1");

    expect(global.fetch).toHaveBeenCalled();
  });

  it("fetches and syncs plans, steps, and tasks", async () => {
    const plan: Plan = {
      id: "plan-1",
      goalId: "goal-1",
      status: "draft",
      summary: "Summary",
      assumptions: [],
      risks: [],
      version: 1,
      createdAt: 10,
      updatedAt: 20,
    };
    const step: PlanStep = {
      id: "step-1",
      planId: "plan-1",
      title: "Step",
      order: 1,
      status: "proposed",
      approvalState: "pending",
      dependsOnStepIds: [],
      priority: "medium",
      createdAt: 10,
      updatedAt: 20,
    };
    const task: Task = {
      id: "task-1",
      goalId: "goal-1",
      title: "Task",
      status: "todo",
      priority: "medium",
      createdAt: 10,
      updatedAt: 20,
    };

    await syncPlans([plan]);
    await getPlans("goal-1");
    await syncPlanSteps([step]);
    await getPlanSteps("plan-1");
    await syncTasks([task]);
    await getTasks("goal-1");

    expect(global.fetch).toHaveBeenCalled();
  });
});
