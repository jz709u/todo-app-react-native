import { beforeEach, describe, expect, jest, it } from "@jest/globals";

import Goal from "@/model/Goal";
import { createDraftPlanForGoal, approveDraftPlanForGoal } from "@/lib/planner/planWorkflowService";
import { supabase } from "@/lib/supabase";
import { useGoalStore } from "@/store/goalStore";
import { usePlanStore } from "@/store/planStore";
import { useTaskStore } from "@/store/taskStore";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("planWorkflowService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    useGoalStore.setState({
      goalsById: {},
      goalOrder: [],
    });
    usePlanStore.setState({
      plansById: {},
      planOrder: [],
      planStepsById: {},
      planStepOrderByPlanId: {},
    });
    useTaskStore.setState({
      tasksById: {},
      taskOrder: [],
    });
    (mockSupabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: {
        summary: "Generated draft",
        assumptions: [],
        risks: [],
        steps: [
          {
            title: "Step 1",
            description: "Desc",
            estimatedMinutes: 30,
            priority: "high",
          },
          {
            title: "Step 2",
            description: "Desc 2",
            estimatedMinutes: 45,
            priority: "medium",
          },
        ],
      },
      error: null,
    });
  });

  it("creates a draft plan for an existing goal", async () => {
    const goal: Goal = {
      id: "goal-1",
      title: "Launch app",
      abstractGoal: "Ship the MVP this month",
      status: "draft",
      constraints: {},
      createdAt: 1,
      updatedAt: 1,
    };
    useGoalStore.getState().upsertGoal(goal);

    const planId = await createDraftPlanForGoal(goal.id);

    expect(usePlanStore.getState().plansById[planId]).toBeDefined();
    expect(usePlanStore.getState().plansById[planId].status).toBe(
      "awaiting_approval",
    );
    expect(usePlanStore.getState().planStepOrderByPlanId[planId].length).toBeGreaterThan(0);
    expect(useGoalStore.getState().goalsById[goal.id].status).toBe("planning");
  });

  it("approves a draft plan and materializes tasks", async () => {
    const goal: Goal = {
      id: "goal-1",
      title: "Prepare launch",
      abstractGoal: "Get ready to launch",
      status: "draft",
      constraints: {},
      targetDate: 1_800_000_000_000,
      createdAt: 1,
      updatedAt: 1,
    };
    useGoalStore.getState().upsertGoal(goal);

    const planId = await createDraftPlanForGoal(goal.id);
    const stepIds = usePlanStore.getState().planStepOrderByPlanId[planId];
    usePlanStore.getState().updatePlanStep(stepIds[0], {
      status: "approved",
      approvalState: "approved",
    });

    const approvedPlanId = await approveDraftPlanForGoal(goal.id);

    expect(approvedPlanId).toBe(planId);
    expect(usePlanStore.getState().plansById[planId].status).toBe("approved");
    expect(useTaskStore.getState().taskOrder.length).toBe(1);
    expect(useGoalStore.getState().goalsById[goal.id].activePlanId).toBe(planId);
  });
});
