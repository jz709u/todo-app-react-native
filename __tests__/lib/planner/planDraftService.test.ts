import { requestPlanDraft } from "@/lib/planner/planDraftService";
import Goal from "@/model/Goal";
import { supabase } from "@/lib/supabase";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const goal: Goal = {
  id: "goal-1",
  title: "Prepare launch",
  abstractGoal: "Get a clean launch plan ready this week",
  status: "draft",
  constraints: {},
  createdAt: 1,
  updatedAt: 1,
};

describe("requestPlanDraft", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_PLANNER_MODE;
  });

  it("returns the local mock draft when mock mode is enabled", async () => {
    process.env.EXPO_PUBLIC_PLANNER_MODE = "mock";

    const draft = await requestPlanDraft(goal);

    expect(draft.summary).toContain("Prepare launch");
    expect(draft.steps.length).toBeGreaterThan(0);
    expect(mockSupabase.functions.invoke).not.toHaveBeenCalled();
  });

  it("returns a structured draft for a goal", async () => {
    (mockSupabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: {
        summary: "Prepare launch draft",
        assumptions: [],
        risks: [],
        steps: [
          {
            title: "Step 1",
            description: "Desc",
            estimatedMinutes: 30,
            priority: "high",
          },
        ],
      },
      error: null,
    });

    const draft = await requestPlanDraft(goal);

    expect(draft.summary).toContain("Prepare launch");
    expect(draft.steps.length).toBeGreaterThan(0);
    expect(draft.steps[0].title).toBeTruthy();
  });

  it("throws when the remote planner returns invalid data", async () => {
    (mockSupabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: { summary: "bad" },
      error: null,
    });

    await expect(requestPlanDraft(goal)).rejects.toThrow(
      "Planner returned an invalid plan draft",
    );
  });
});
