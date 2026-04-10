// Supabase Edge Function scaffold for remote plan generation.
// Replace the mocked draft generation here with a real LLM call once secrets
// and deployment are configured.

import { corsHeaders } from "../_shared/cors.ts";

type Goal = {
  id: string;
  title: string;
  abstractGoal: string;
  status: string;
  constraints: {
    budget?: string;
    effortLevel?: string;
    tools?: string[];
    notes?: string;
  };
  targetDate?: number;
};

function buildMockDraft(goal: Goal) {
  return {
    summary: `A first-pass execution plan for ${goal.title}.`,
    assumptions: [
      goal.targetDate
        ? "A target date exists and should drive the ordering."
        : "No target date exists yet.",
    ],
    risks: ["This is still a scaffolded planner implementation."],
    steps: [
      {
        title: `Define the success criteria for ${goal.title}`,
        description: `Clarify what “done” means for "${goal.abstractGoal}".`,
        estimatedMinutes: 30,
        priority: "high",
      },
      {
        title: `Break ${goal.title} into execution tasks`,
        description: "Create concrete steps and identify dependencies.",
        estimatedMinutes: 45,
        priority: "high",
      },
      {
        title: "Review and finalize the sequence",
        description: "Refine the draft before execution begins.",
        estimatedMinutes: 30,
        priority: "medium",
      },
    ],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { goal } = await req.json();
    if (!goal?.title || !goal?.abstractGoal) {
      return new Response(JSON.stringify({ error: "Missing goal payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const draft = buildMockDraft(goal as Goal);

    return new Response(JSON.stringify(draft), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown planner error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
