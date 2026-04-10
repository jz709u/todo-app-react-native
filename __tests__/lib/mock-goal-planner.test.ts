import { describe, expect, jest, it } from "@jest/globals";

import Goal from "@/model/Goal";
import { generateMockPlan } from "@/lib/mock-goal-planner";

describe("generateMockPlan", () => {
  it("builds a usable local draft plan from a goal", () => {
    const goal: Goal = {
      id: "goal-1",
      title: "Launch portfolio",
      abstractGoal: "Ship a clean portfolio site this month",
      status: "draft",
      constraints: {
        notes: "Keep it lightweight and use the current brand assets.",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const draft = generateMockPlan(goal);

    expect(draft.summary).toContain("Launch portfolio");
    expect(draft.assumptions).toHaveLength(2);
    expect(draft.risks).toHaveLength(2);
    expect(draft.steps).toHaveLength(5);
    expect(draft.steps[0].title).toContain("Launch portfolio");
  });
});
