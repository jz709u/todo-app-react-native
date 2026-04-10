import { describe, expect, jest, it } from "@jest/globals";

import Goal from "@/model/Goal";
import Plan from "@/model/Plan";
import PlanStep from "@/model/PlanStep";
import Task from "@/model/Task";
import { mapGoalRowToGoal, mapGoalToGoalRow } from "@/lib/mappers/goalMappers";
import {
  mapPlanRowToPlan,
  mapPlanStepRowToPlanStep,
  mapPlanStepToPlanStepRow,
  mapPlanToPlanRow,
} from "@/lib/mappers/planMappers";
import { mapTaskRowToTask, mapTaskToTaskRow } from "@/lib/mappers/taskMappers";

describe("domain mappers", () => {
  it("maps goal rows round-trip", () => {
    const goal: Goal = {
      id: "goal-1",
      title: "Launch",
      abstractGoal: "Ship the launch",
      status: "active",
      constraints: { notes: "Soon" },
      targetDate: 123,
      activePlanId: "plan-1",
      createdAt: 10,
      updatedAt: 20,
    };

    const row = mapGoalToGoalRow(goal, "user-1");
    expect(mapGoalRowToGoal(row)).toMatchObject(goal);
  });

  it("maps plans and plan steps round-trip", () => {
    const plan: Plan = {
      id: "plan-1",
      goalId: "goal-1",
      status: "awaiting_approval",
      summary: "Summary",
      assumptions: ["A"],
      risks: ["R"],
      version: 1,
      createdAt: 10,
      updatedAt: 20,
    };
    const step: PlanStep = {
      id: "step-1",
      planId: "plan-1",
      title: "Step",
      order: 1,
      status: "approved",
      approvalState: "approved",
      dependsOnStepIds: [],
      estimatedMinutes: 30,
      priority: "high",
      suggestedDueDate: 123,
      createdAt: 10,
      updatedAt: 20,
    };

    expect(mapPlanRowToPlan(mapPlanToPlanRow(plan))).toMatchObject(plan);
    expect(mapPlanStepRowToPlanStep(mapPlanStepToPlanStepRow(step))).toMatchObject(step);
  });

  it("maps tasks round-trip", () => {
    const task: Task = {
      id: "task-1",
      goalId: "goal-1",
      planStepId: "step-1",
      title: "Task",
      status: "todo",
      priority: "medium",
      dueDate: 123,
      scheduledStart: 456,
      scheduledEnd: 789,
      completedAt: 999,
      createdAt: 10,
      updatedAt: 20,
    };

    expect(mapTaskRowToTask(mapTaskToTaskRow(task))).toMatchObject(task);
  });
});
