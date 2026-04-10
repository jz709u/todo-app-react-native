export type PlannerMode = "mock" | "live";

export function getPlannerMode(): PlannerMode {
  return process.env.EXPO_PUBLIC_PLANNER_MODE === "mock" ? "mock" : "live";
}

export function isMockPlannerMode() {
  return getPlannerMode() === "mock";
}

export function getGeneratePlanLabel() {
  return isMockPlannerMode() ? "Generate Mock Plan" : "Generate Plan";
}

export function getGeneratePlanHeading() {
  return isMockPlannerMode() ? "Create a mock plan draft" : "Create a plan draft";
}
