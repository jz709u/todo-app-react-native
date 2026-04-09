import Goal from "@/model/Goal";

import { generateMockPlan } from "@/lib/mock-goal-planner";
import { isPlanDraft } from "@/lib/planner/planDraftValidation";
import { PlanDraft } from "@/lib/planner/types";
import { supabase } from "@/lib/supabase";

const PLANNER_MODE = process.env.EXPO_PUBLIC_PLANNER_MODE;

export async function requestPlanDraft(goal: Goal): Promise<PlanDraft> {
  if (PLANNER_MODE === "mock") {
    return generateMockPlan(goal);
  }

  const { data, error } = await supabase.functions.invoke("request-plan-draft", {
    body: {
      goal,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to generate plan draft");
  }

  if (!isPlanDraft(data)) {
    throw new Error("Planner returned an invalid plan draft");
  }

  return data;
}
