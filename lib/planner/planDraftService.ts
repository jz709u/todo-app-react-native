import Goal from "@/model/Goal";

import { generateMockPlan } from "@/lib/mock-goal-planner";
import { PlanDraft } from "@/lib/planner/types";

export async function requestPlanDraft(goal: Goal): Promise<PlanDraft> {
  // Temporary local implementation. Replace this with a Supabase/Edge Function
  // request once the backend planner is ready.
  return Promise.resolve(generateMockPlan(goal));
}
