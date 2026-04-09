import { useGoalStore } from "@/store/goalStore";

describe("useGoalStore", () => {
  beforeEach(() => {
    useGoalStore.setState({
      goalsById: {},
      goalOrder: [],
    });
  });

  it("creates a goal and returns its id", () => {
    const store = useGoalStore.getState();

    const goalId = store.createGoal({
      title: "Launch portfolio",
      abstractGoal: "Ship my portfolio site this month",
    });

    const goal = useGoalStore.getState().getGoalById(goalId);
    expect(goalId).toBeDefined();
    expect(goal?.title).toBe("Launch portfolio");
    expect(goal?.status).toBe("draft");
    expect(useGoalStore.getState().goalOrder).toEqual([goalId]);
  });

  it("updates an existing goal by id", () => {
    const store = useGoalStore.getState();
    const goalId = store.createGoal({
      title: "Prepare interview",
      abstractGoal: "Get ready for PM interviews",
    });

    store.updateGoal(goalId, {
      status: "active",
      targetDate: 1_700_000_000_000,
    });

    const goal = useGoalStore.getState().getGoalById(goalId);
    expect(goal?.status).toBe("active");
    expect(goal?.targetDate).toBe(1_700_000_000_000);
  });

  it("upserts without duplicating goal order", () => {
    const store = useGoalStore.getState();
    const goalId = store.createGoal({
      title: "Move apartments",
      abstractGoal: "Move into a new apartment in 30 days",
    });

    const existingGoal = store.getGoalById(goalId);
    expect(existingGoal).toBeDefined();

    store.upsertGoal({
      ...existingGoal!,
      status: "planning",
    });

    expect(useGoalStore.getState().goalOrder).toEqual([goalId]);
    expect(useGoalStore.getState().getGoalById(goalId)?.status).toBe(
      "planning",
    );
  });

  it("removes a goal and its ordering entry", () => {
    const store = useGoalStore.getState();
    const firstGoalId = store.createGoal({
      title: "Goal 1",
      abstractGoal: "First goal",
    });
    const secondGoalId = store.createGoal({
      title: "Goal 2",
      abstractGoal: "Second goal",
    });

    store.removeGoal(firstGoalId);

    expect(useGoalStore.getState().getGoalById(firstGoalId)).toBeUndefined();
    expect(useGoalStore.getState().goalOrder).toEqual([secondGoalId]);
  });
});
