import Goal from "@/model/Goal";
import { PlanDraft } from "@/lib/planner/types";

function buildStepTitleFragments(goal: Goal) {
  const normalizedTitle = goal.title.trim();

  return [
    `Define success criteria for ${normalizedTitle}`,
    `Break ${normalizedTitle} into a concrete checklist`,
    `Set up the tools and assets needed`,
    `Complete the highest-risk work first`,
    `Review progress and close remaining gaps`,
  ];
}

export function generateMockPlan(goal: Goal): PlanDraft {
  const notes = goal.constraints.notes?.trim();
  const tools = goal.constraints.tools?.length
    ? goal.constraints.tools.join(", ")
    : "the tools you already use";

  const steps = buildStepTitleFragments(goal).map((title, index) => ({
    title,
    description:
      index === 0
        ? `Clarify the target outcome, deadline, and quality bar for "${goal.abstractGoal}".`
        : index === 1
          ? `Turn the goal into smaller execution steps and identify any dependencies or blockers.`
          : index === 2
            ? `Prepare the environment, references, and assets required to execute using ${tools}.`
            : index === 3
              ? `Execute the most important milestone first so the highest-risk uncertainty drops early.`
              : `Review what is done, adjust the plan, and finish the remaining work cleanly.`,
    estimatedMinutes: 30 + index * 15,
    priority: index < 2 ? "high" : index === 2 ? "medium" : "low",
  }));

  return {
    summary: `A first-pass execution plan for ${goal.title} that turns the abstract goal into a short set of reviewable milestones.`,
    assumptions: [
      goal.targetDate
        ? "You are aiming to complete this on the target date already stored on the goal."
        : "No hard deadline is set yet, so the plan assumes a flexible schedule.",
      notes
        ? `The plan incorporates these constraints: ${notes}`
        : "The plan assumes no major constraints beyond the goal description.",
    ],
    risks: [
      "The generated steps may still need domain-specific edits before execution.",
      "Dependencies and timing are approximate until you approve and refine the draft.",
    ],
    steps,
  };
}
