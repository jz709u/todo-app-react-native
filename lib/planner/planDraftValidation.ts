import { PlanDraft } from "@/lib/planner/types";

export function isPlanDraft(value: unknown): value is PlanDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.summary !== "string" ||
    !Array.isArray(candidate.assumptions) ||
    !Array.isArray(candidate.risks) ||
    !Array.isArray(candidate.steps)
  ) {
    return false;
  }

  return candidate.steps.every((step) => {
    if (!step || typeof step !== "object") {
      return false;
    }

    const draftStep = step as Record<string, unknown>;
    return (
      typeof draftStep.title === "string" &&
      typeof draftStep.description === "string" &&
      typeof draftStep.estimatedMinutes === "number" &&
      (draftStep.priority === "low" ||
        draftStep.priority === "medium" ||
        draftStep.priority === "high")
    );
  });
}
