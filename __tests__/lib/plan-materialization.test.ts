import { getApprovedPlanSteps, buildTaskTitleFromStep } from "@/lib/plan-materialization";
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
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    expect(getApprovedPlanSteps(steps)).toHaveLength(1);
    expect(buildTaskTitleFromStep(steps[0])).toBe("Approved step");
  });
});
