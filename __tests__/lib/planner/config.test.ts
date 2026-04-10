describe("planner config", () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_PLANNER_MODE;
  });

  it("defaults to live mode", async () => {
    const { getPlannerMode, getGeneratePlanLabel, getGeneratePlanHeading } =
      await import("@/lib/planner/config");

    expect(getPlannerMode()).toBe("live");
    expect(getGeneratePlanLabel()).toBe("Generate Plan");
    expect(getGeneratePlanHeading()).toBe("Create a plan draft");
  });

  it("switches labels when mock mode is enabled", async () => {
    process.env.EXPO_PUBLIC_PLANNER_MODE = "mock";

    const { getPlannerMode, getGeneratePlanLabel, getGeneratePlanHeading } =
      await import("@/lib/planner/config");

    expect(getPlannerMode()).toBe("mock");
    expect(getGeneratePlanLabel()).toBe("Generate Mock Plan");
    expect(getGeneratePlanHeading()).toBe("Create a mock plan draft");
  });
});
