import Goal from "@/model/Goal";

import { generateMockPlan } from "@/lib/mock-goal-planner";
import { isMockPlannerMode } from "@/lib/planner/config";
import { isPlanDraft } from "@/lib/planner/planDraftValidation";
import { PlanDraft } from "@/lib/planner/types";
import { supabase } from "@/lib/supabase";

export async function requestPlanDraft(goal: Goal): Promise<PlanDraft> {
  if (isMockPlannerMode()) {
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
