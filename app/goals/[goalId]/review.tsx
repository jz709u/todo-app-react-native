import { SectionCard } from "@/components/section-card.component";
import { ThemedText } from "@/components/themed-text.component";
import { semanticColors } from "@/constants/theme";
import {
  formatPlanStatus,
  formatStepApprovalState,
  formatStepStatus,
} from "@/lib/formatters/status";
import {
  getApprovedPlanSteps,
  hasMaterializedTaskForStep,
} from "@/lib/plan-materialization";
import {
  approveDraftPlanForGoal,
  createDraftPlanForGoal,
} from "@/lib/planner/planWorkflowService";
import PlanStep from "@/model/PlanStep";
import { useGoalStore } from "@/store/goalStore";
import { usePlanStore } from "@/store/planStore";
import { useTaskStore } from "@/store/taskStore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalPlanReviewScreen() {
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const goalsById = useGoalStore((state) => state.goalsById);
  const planOrder = usePlanStore((state) => state.planOrder);
  const plansById = usePlanStore((state) => state.plansById);
  const updatePlanStep = usePlanStore((state) => state.updatePlanStep);
  const planStepOrderByPlanId = usePlanStore(
    (state) => state.planStepOrderByPlanId,
  );
  const planStepsById = usePlanStore((state) => state.planStepsById);
  const taskOrder = useTaskStore((state) => state.taskOrder);
  const tasksById = useTaskStore((state) => state.tasksById);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  const goal = goalId ? goalsById[goalId] : undefined;
  const draftPlan = goalId
    ? planOrder
        .map((planId) => plansById[planId])
        .filter((plan): plan is NonNullable<typeof plan> => Boolean(plan))
        .filter(
          (plan) =>
            plan.goalId === goalId && plan.status === "awaiting_approval",
        )
        .at(-1)
    : undefined;
  const draftSteps = draftPlan
    ? (planStepOrderByPlanId[draftPlan.id] ?? [])
        .map((stepId) => planStepsById[stepId])
        .filter((step): step is PlanStep => Boolean(step))
        .sort((a, b) => a.order - b.order)
    : [];
  const existingTasks = goalId
    ? taskOrder
        .map((taskId) => tasksById[taskId])
        .filter((task): task is NonNullable<typeof task> => Boolean(task))
        .filter((task) => task.goalId === goalId)
    : [];
  const approvedSteps = getApprovedPlanSteps(draftSteps);
  const approvedStepCount = approvedSteps.length;
  const newTaskCount = approvedSteps.filter(
    (step) => !hasMaterializedTaskForStep(existingTasks, step.id),
  ).length;
  const updatedTaskCount = approvedSteps.filter((step) =>
    hasMaterializedTaskForStep(existingTasks, step.id),
  ).length;

  const handleGenerateDraft = async () => {
    if (!goalId || !goal) {
      return;
    }

    setIsGeneratingDraft(true);

    try {
      await createDraftPlanForGoal(goalId);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleStartEditing = (step: PlanStep) => {
    setEditingStepId(step.id);
    setEditedTitle(step.title);
    setEditedDescription(step.description ?? "");
  };

  const handleCancelEditing = () => {
    setEditingStepId(null);
    setEditedTitle("");
    setEditedDescription("");
  };

  const handleSaveStepEdit = (step: PlanStep) => {
    const nextTitle = editedTitle.trim();
    if (!nextTitle) {
      return;
    }

    updatePlanStep(step.id, {
      title: nextTitle,
      description: editedDescription.trim() || undefined,
      status: "approved",
      approvalState: "edited",
    });
    handleCancelEditing();
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
    if (!goalId || !draftPlan) {
      return;
    }

    approveDraftPlanForGoal(goalId);
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
          disabled={!draftPlan || approvedStepCount === 0}
          onPress={handleApprovePlan}
        >
          <ThemedText
            style={[
              styles.headerAction,
              (!draftPlan || approvedStepCount === 0) &&
                styles.headerActionDisabled,
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
            <Pressable
              style={styles.primaryButton}
              onPress={() => void handleGenerateDraft()}
              disabled={isGeneratingDraft}
            >
              <ThemedText style={styles.primaryButtonText}>
                {isGeneratingDraft ? "Generating..." : "Generate Mock Plan"}
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
            <View style={styles.summaryRow}>
              <ThemedText style={styles.metaText}>
                Status: {formatPlanStatus(draftPlan.status)}
              </ThemedText>
              <Pressable
                onPress={() => void handleGenerateDraft()}
                style={styles.secondaryButton}
                disabled={isGeneratingDraft}
              >
                <ThemedText style={styles.secondaryButtonText}>
                  {isGeneratingDraft ? "Generating..." : "Regenerate"}
                </ThemedText>
              </Pressable>
            </View>
            <ThemedText style={styles.metaText}>
              {approvedStepCount === 0
                ? "Approve at least one step to create or update tasks."
                : `${approvedStepCount} approved step${approvedStepCount === 1 ? "" : "s"} ready · ${newTaskCount} new task${newTaskCount === 1 ? "" : "s"} · ${updatedTaskCount} updated`}
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
                  {editingStepId === step.id ? (
                    <View style={styles.editForm}>
                      <TextInput
                        value={editedTitle}
                        onChangeText={setEditedTitle}
                        placeholder="Step title"
                        placeholderTextColor="#98A2B3"
                        style={styles.input}
                      />
                      <TextInput
                        value={editedDescription}
                        onChangeText={setEditedDescription}
                        placeholder="Step description"
                        placeholderTextColor="#98A2B3"
                        style={[styles.input, styles.descriptionInput]}
                        multiline
                      />
                    </View>
                  ) : (
                    <ThemedText type="subheading">
                      {step.order}. {step.title}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.metaText}>
                    {formatStepStatus(step.status)}
                  </ThemedText>
                </View>
                {editingStepId !== step.id && step.description ? (
                  <ThemedText lightColor={semanticColors.textMuted}>
                    {step.description}
                  </ThemedText>
                ) : null}
                <ThemedText style={styles.metaText}>
                  Approval: {formatStepApprovalState(step.approvalState)} · Priority: {step.priority ?? "medium"}
                </ThemedText>
                <View style={styles.buttonRow}>
                  {editingStepId === step.id ? (
                    <>
                      <Pressable
                        style={styles.approveButton}
                        onPress={() => handleSaveStepEdit(step)}
                      >
                        <ThemedText style={styles.approveButtonText}>
                          Save Edit
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        style={styles.neutralButton}
                        onPress={handleCancelEditing}
                      >
                        <ThemedText style={styles.neutralButtonText}>
                          Cancel
                        </ThemedText>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Pressable
                        style={styles.approveButton}
                        onPress={() => handleApproveStep(step.id)}
                      >
                        <ThemedText style={styles.approveButtonText}>
                          Approve Step
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        style={styles.secondaryButton}
                        onPress={() => handleStartEditing(step)}
                      >
                        <ThemedText style={styles.secondaryButtonText}>
                          Edit
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
                    </>
                  )}
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
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
  editForm: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: semanticColors.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: semanticColors.surface,
    fontSize: 16,
  },
  descriptionInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
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
  secondaryButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  neutralButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  neutralButtonText: {
    color: "#475467",
    fontWeight: "600",
  },
});
