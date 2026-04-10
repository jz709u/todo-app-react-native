import { beforeEach, describe, expect, jest, it } from "@jest/globals";

import { usePlanStore } from "@/store/planStore";

describe("usePlanStore", () => {
  beforeEach(() => {
    usePlanStore.setState({
      plansById: {},
      planOrder: [],
      planStepsById: {},
      planStepOrderByPlanId: {},
    });
  });

  it("creates a plan and returns its id", () => {
    const store = usePlanStore.getState();

    const planId = store.createPlan({
      goalId: "goal-1",
      summary: "Break launch into milestones",
    });

    const plan = usePlanStore.getState().getPlanById(planId);
    expect(plan?.goalId).toBe("goal-1");
    expect(plan?.status).toBe("draft");
    expect(usePlanStore.getState().planOrder).toEqual([planId]);
  });

  it("creates ordered plan steps and returns them sorted", () => {
    const store = usePlanStore.getState();
    const planId = store.createPlan({
      goalId: "goal-1",
      summary: "Interview prep plan",
    });

    const laterStepId = store.createPlanStep({
      planId,
      title: "Practice mock interviews",
      order: 2,
    });
    const firstStepId = store.createPlanStep({
      planId,
      title: "Study common PM questions",
      order: 1,
    });

    const steps = usePlanStore.getState().getPlanSteps(planId);
    expect(steps.map((step) => step.id)).toEqual([firstStepId, laterStepId]);
    expect(steps.map((step) => step.title)).toEqual([
      "Study common PM questions",
      "Practice mock interviews",
    ]);
  });

  it("upserts and updates plan steps by id", () => {
    const store = usePlanStore.getState();
    const planId = store.createPlan({
      goalId: "goal-1",
      summary: "Trip planning plan",
    });
    const stepId = store.createPlanStep({
      planId,
      title: "Set a budget",
      order: 1,
    });

    store.updatePlanStep(stepId, {
      status: "approved",
      approvalState: "approved",
    });

    const step = store.getPlanStepById(stepId);
    expect(step?.status).toBe("approved");
    expect(step?.approvalState).toBe("approved");

    store.upsertPlanStep({
      ...step!,
      title: "Set a realistic budget",
    });

    expect(usePlanStore.getState().getPlanSteps(planId)).toHaveLength(1);
    expect(usePlanStore.getState().getPlanStepById(stepId)?.title).toBe(
      "Set a realistic budget",
    );
  });

  it("removes a plan and all of its plan steps", () => {
    const store = usePlanStore.getState();
    const planId = store.createPlan({
      goalId: "goal-1",
      summary: "Launch checklist",
    });
    const stepId = store.createPlanStep({
      planId,
      title: "Write copy",
      order: 1,
    });

    store.removePlan(planId);

    expect(usePlanStore.getState().getPlanById(planId)).toBeUndefined();
    expect(usePlanStore.getState().getPlanStepById(stepId)).toBeUndefined();
    expect(usePlanStore.getState().getPlanSteps(planId)).toEqual([]);
  });
});
