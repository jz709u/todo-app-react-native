import { requestPlanDraft } from "@/lib/planner/planDraftService";
import Goal from "@/model/Goal";

describe("requestPlanDraft", () => {
  it("returns a structured draft for a goal", async () => {
    const goal: Goal = {
      id: "goal-1",
      title: "Prepare launch",
      abstractGoal: "Get a clean launch plan ready this week",
      status: "draft",
      constraints: {},
      createdAt: 1,
      updatedAt: 1,
    };

    const draft = await requestPlanDraft(goal);

    expect(draft.summary).toContain("Prepare launch");
    expect(draft.steps.length).toBeGreaterThan(0);
    expect(draft.steps[0].title).toBeTruthy();
  });
});
