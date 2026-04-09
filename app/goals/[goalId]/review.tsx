import { SectionCard } from "@/components/section-card.component";
import { ThemedText } from "@/components/themed-text.component";
import { semanticColors } from "@/constants/theme";
import {
  formatPlanStatus,
  formatStepApprovalState,
  formatStepStatus,
} from "@/lib/formatters/status";
import {
  buildTaskTitleFromStep,
  getApprovedPlanSteps,
} from "@/lib/plan-materialization";
import { generateMockPlan } from "@/lib/mock-goal-planner";
import Goal from "@/model/Goal";
import PlanStep from "@/model/PlanStep";
import { useGoalStore } from "@/store/goalStore";
import { usePlanStore } from "@/store/planStore";
import { useTaskStore } from "@/store/taskStore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getLatestDraftPlan(goalId: string, planOrder: string[], plansById: Record<string, any>) {
  return planOrder
    .map((planId) => plansById[planId])
    .filter((plan): plan is NonNullable<typeof plan> => Boolean(plan))
    .filter(
      (plan) => plan.goalId === goalId && plan.status === "awaiting_approval",
    )
    .at(-1);
}

export default function GoalPlanReviewScreen() {
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const goalsById = useGoalStore((state) => state.goalsById);
  const updateGoal = useGoalStore((state) => state.updateGoal);
  const planOrder = usePlanStore((state) => state.planOrder);
  const plansById = usePlanStore((state) => state.plansById);
  const createPlan = usePlanStore((state) => state.createPlan);
  const updatePlan = usePlanStore((state) => state.updatePlan);
  const createPlanStep = usePlanStore((state) => state.createPlanStep);
  const updatePlanStep = usePlanStore((state) => state.updatePlanStep);
  const planStepOrderByPlanId = usePlanStore(
    (state) => state.planStepOrderByPlanId,
  );
  const planStepsById = usePlanStore((state) => state.planStepsById);
  const createTask = useTaskStore((state) => state.createTask);

  const goal = goalId ? goalsById[goalId] : undefined;
  const draftPlan = goalId
    ? getLatestDraftPlan(goalId, planOrder, plansById)
    : undefined;
  const draftSteps = draftPlan
    ? (planStepOrderByPlanId[draftPlan.id] ?? [])
        .map((stepId) => planStepsById[stepId])
        .filter((step): step is PlanStep => Boolean(step))
        .sort((a, b) => a.order - b.order)
    : [];

  const handleGenerateDraft = () => {
    if (!goalId || !goal) {
      return;
    }

    const generated = generateMockPlan(goal);
    const planId = createPlan({
      goalId,
      summary: generated.summary,
      assumptions: generated.assumptions,
      risks: generated.risks,
      status: "awaiting_approval",
    });

    generated.steps.forEach((step, index) => {
      createPlanStep({
        planId,
        title: step.title,
        description: step.description,
        order: index + 1,
        estimatedMinutes: step.estimatedMinutes,
        status: "proposed",
        approvalState: "pending",
      });
    });

    updateGoal(goalId, { status: "planning" });
  };

  const handleApproveStep = (stepId: string) => {
    updatePlanStep(stepId, {
      status: "approved",
      approvalState: "approved",
    });
  };

  const handleRejectStep = (stepId: string) => {
    updatePlanStep(stepId, {
      status: "rejected",
      approvalState: "rejected",
    });
  };

  const handleApprovePlan = () => {
    if (!goal || !goalId || !draftPlan) {
      return;
    }

    const approvedSteps = getApprovedPlanSteps(draftSteps);
    approvedSteps.forEach((step) => {
      createTask({
        goalId,
        planStepId: step.id,
        title: buildTaskTitleFromStep(step),
        dueDate: step.suggestedDueDate,
        priority: step.order <= 2 ? "high" : "medium",
      });
    });

    updatePlan(draftPlan.id, { status: "approved" });
    updateGoal(goalId, {
      activePlanId: draftPlan.id,
      status: approvedSteps.length > 0 ? "active" : "draft",
    });
    router.replace(`/goals/${goalId}`);
  };

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerState}>
          <ThemedText type="subheading">Goal not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={styles.headerAction}>Back</ThemedText>
        </Pressable>
        <ThemedText type="subheading">Plan Review</ThemedText>
        <Pressable
          disabled={!draftPlan}
          onPress={handleApprovePlan}
        >
          <ThemedText
            style={[
              styles.headerAction,
              !draftPlan && styles.headerActionDisabled,
            ]}
          >
            Approve
          </ThemedText>
        </Pressable>
      </View>

      {!draftPlan ? (
        <View style={styles.centerState}>
          <SectionCard style={styles.emptyCard}>
            <ThemedText type="subheading">Create a mock plan draft</ThemedText>
            <ThemedText lightColor={semanticColors.textMuted}>
              This local-only flow generates a reviewable draft plan so you can
              validate the UX before backend AI integration.
            </ThemedText>
            <Pressable style={styles.primaryButton} onPress={handleGenerateDraft}>
              <ThemedText style={styles.primaryButtonText}>
                Generate Mock Plan
              </ThemedText>
            </Pressable>
          </SectionCard>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <SectionCard>
            <ThemedText type="subheading">{goal.title}</ThemedText>
            <ThemedText lightColor={semanticColors.textMuted}>
              {draftPlan.summary}
            </ThemedText>
            <ThemedText style={styles.metaText}>
              Status: {formatPlanStatus(draftPlan.status)}
            </ThemedText>
          </SectionCard>

          <SectionCard>
            <ThemedText type="subheading">Assumptions</ThemedText>
            {draftPlan.assumptions.map((assumption) => (
              <ThemedText key={assumption} lightColor={semanticColors.textMuted}>
                • {assumption}
              </ThemedText>
            ))}
          </SectionCard>

          <SectionCard>
            <ThemedText type="subheading">Risks</ThemedText>
            {draftPlan.risks.map((risk) => (
              <ThemedText key={risk} lightColor={semanticColors.textMuted}>
                • {risk}
              </ThemedText>
            ))}
          </SectionCard>

          <View style={styles.section}>
            <ThemedText type="subheading">Review steps</ThemedText>
            {draftSteps.map((step) => (
              <SectionCard key={step.id}>
                <View style={styles.stepTopRow}>
                  <ThemedText type="subheading">{step.order}. {step.title}</ThemedText>
                  <ThemedText style={styles.metaText}>
                    {formatStepStatus(step.status)}
                  </ThemedText>
                </View>
                {step.description ? (
                  <ThemedText lightColor={semanticColors.textMuted}>
                    {step.description}
                  </ThemedText>
                ) : null}
                <ThemedText style={styles.metaText}>
                  Approval: {formatStepApprovalState(step.approvalState)}
                </ThemedText>
                <View style={styles.buttonRow}>
                  <Pressable
                    style={styles.approveButton}
                    onPress={() => handleApproveStep(step.id)}
                  >
                    <ThemedText style={styles.approveButtonText}>
                      Approve Step
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.rejectButton}
                    onPress={() => handleRejectStep(step.id)}
                  >
                    <ThemedText style={styles.rejectButtonText}>
                      Reject
                    </ThemedText>
                  </Pressable>
                </View>
              </SectionCard>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.screenBackground,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.borderSubtle,
    backgroundColor: semanticColors.surface,
  },
  headerAction: {
    color: "#0F766E",
    fontWeight: "600",
  },
  headerActionDisabled: {
    color: "#D0D5DD",
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  emptyCard: {
    gap: 14,
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  section: {
    gap: 10,
  },
  metaText: {
    color: semanticColors.textMuted,
    fontSize: 13,
  },
  stepTopRow: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  approveButton: {
    backgroundColor: "#0F766E",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rejectButtonText: {
    color: "#B42318",
    fontWeight: "600",
  },
});
