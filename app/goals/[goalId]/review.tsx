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
import {
  getGeneratePlanHeading,
  getGeneratePlanLabel,
} from "@/lib/planner/config";
import PlanStep from "@/model/PlanStep";
import { TaskPriority } from "@/model/Task";
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
  const createPlanStep = usePlanStore((state) => state.createPlanStep);
  const updatePlanStep = usePlanStore((state) => state.updatePlanStep);
  const removePlanStep = usePlanStore((state) => state.removePlanStep);
  const planStepOrderByPlanId = usePlanStore(
    (state) => state.planStepOrderByPlanId,
  );
  const planStepsById = usePlanStore((state) => state.planStepsById);
  const taskOrder = useTaskStore((state) => state.taskOrder);
  const tasksById = useTaskStore((state) => state.tasksById);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedPriority, setEditedPriority] = useState<TaskPriority>("medium");
  const [editedEstimatedMinutes, setEditedEstimatedMinutes] = useState("");
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isApprovingPlan, setIsApprovingPlan] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);

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
    setGenerationError(null);

    try {
      await createDraftPlanForGoal(goalId);
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Failed to generate the plan draft.",
      );
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleStartEditing = (step: PlanStep) => {
    setEditingStepId(step.id);
    setEditedTitle(step.title);
    setEditedDescription(step.description ?? "");
    setEditedPriority(step.priority ?? "medium");
    setEditedEstimatedMinutes(
      step.estimatedMinutes ? String(step.estimatedMinutes) : "",
    );
  };

  const handleCancelEditing = () => {
    setEditingStepId(null);
    setEditedTitle("");
    setEditedDescription("");
    setEditedPriority("medium");
    setEditedEstimatedMinutes("");
  };

  const handleSaveStepEdit = (step: PlanStep) => {
    const nextTitle = editedTitle.trim();
    if (!nextTitle) {
      return;
    }

    const parsedMinutes = Number(editedEstimatedMinutes);

    updatePlanStep(step.id, {
      title: nextTitle,
      description: editedDescription.trim() || undefined,
      priority: editedPriority,
      estimatedMinutes:
        editedEstimatedMinutes.trim() && !Number.isNaN(parsedMinutes)
          ? parsedMinutes
          : undefined,
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

  const handleBulkApprove = () => {
    draftSteps.forEach((step) => {
      updatePlanStep(step.id, {
        status: "approved",
        approvalState: "approved",
      });
    });
  };

  const handleBulkReject = () => {
    draftSteps.forEach((step) => {
      updatePlanStep(step.id, {
        status: "rejected",
        approvalState: "rejected",
      });
    });
  };

  const handleAddStep = () => {
    if (!draftPlan) {
      return;
    }

    const stepId = createPlanStep({
      planId: draftPlan.id,
      title: "New custom step",
      description: "Add the detail for this step.",
      order: draftSteps.length + 1,
      estimatedMinutes: 30,
      priority: "medium",
      status: "proposed",
      approvalState: "pending",
    });

    const createdStep = planStepsById[stepId];
    if (createdStep) {
      handleStartEditing(createdStep);
    } else {
      setEditingStepId(stepId);
      setEditedTitle("New custom step");
      setEditedDescription("Add the detail for this step.");
      setEditedPriority("medium");
      setEditedEstimatedMinutes("30");
    }
  };

  const handleDeleteStep = (stepId: string) => {
    removePlanStep(stepId);
    if (editingStepId === stepId) {
      handleCancelEditing();
    }
  };

  const handleMoveStep = (step: PlanStep, direction: "up" | "down") => {
    const currentIndex = draftSteps.findIndex((draftStep) => draftStep.id === step.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= draftSteps.length) {
      return;
    }

    const targetStep = draftSteps[targetIndex];
    updatePlanStep(step.id, { order: targetStep.order });
    updatePlanStep(targetStep.id, { order: step.order });
  };

  const handleApprovePlan = () => {
    if (!goalId || !draftPlan) {
      return;
    }

    setIsApprovingPlan(true);
    setApprovalError(null);

    void approveDraftPlanForGoal(goalId)
      .then(() => {
        router.replace(`/goals/${goalId}`);
      })
      .catch((error) => {
        setApprovalError(
          error instanceof Error
            ? error.message
            : "Failed to approve the plan.",
        );
      })
      .finally(() => {
        setIsApprovingPlan(false);
      });
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
          disabled={!draftPlan || approvedStepCount === 0 || isApprovingPlan}
          onPress={handleApprovePlan}
        >
          <ThemedText
            style={[
              styles.headerAction,
              (!draftPlan || approvedStepCount === 0 || isApprovingPlan) &&
                styles.headerActionDisabled,
            ]}
          >
            {isApprovingPlan ? "Saving..." : "Approve"}
          </ThemedText>
        </Pressable>
      </View>

      {!draftPlan ? (
        <View style={styles.centerState}>
          <SectionCard style={styles.emptyCard}>
            <ThemedText type="subheading">{getGeneratePlanHeading()}</ThemedText>
            <ThemedText lightColor={semanticColors.textMuted}>
              Generate a reviewable plan draft for this goal.
            </ThemedText>
            {generationError ? (
              <ThemedText style={styles.errorText}>{generationError}</ThemedText>
            ) : null}
            <Pressable
              style={styles.primaryButton}
              onPress={() => void handleGenerateDraft()}
              disabled={isGeneratingDraft}
            >
              <ThemedText style={styles.primaryButtonText}>
                {isGeneratingDraft ? "Generating..." : getGeneratePlanLabel()}
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
              <View style={styles.toolbarRow}>
                <Pressable style={styles.secondaryButton} onPress={handleBulkApprove}>
                  <ThemedText style={styles.secondaryButtonText}>
                    Approve All
                  </ThemedText>
                </Pressable>
                <Pressable style={styles.neutralButton} onPress={handleBulkReject}>
                  <ThemedText style={styles.neutralButtonText}>
                    Reject All
                  </ThemedText>
                </Pressable>
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
            </View>
            <ThemedText style={styles.metaText}>
              {approvedStepCount === 0
                ? "Approve at least one step to create or update tasks."
                : `${approvedStepCount} approved step${approvedStepCount === 1 ? "" : "s"} ready · ${newTaskCount} new task${newTaskCount === 1 ? "" : "s"} · ${updatedTaskCount} updated`}
            </ThemedText>
            {generationError ? (
              <ThemedText style={styles.errorText}>{generationError}</ThemedText>
            ) : null}
            {approvalError ? (
              <ThemedText style={styles.errorText}>{approvalError}</ThemedText>
            ) : null}
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
            <View style={styles.sectionHeader}>
              <ThemedText type="subheading">Review steps</ThemedText>
              <Pressable style={styles.secondaryButton} onPress={handleAddStep}>
                <ThemedText style={styles.secondaryButtonText}>
                  Add Step
                </ThemedText>
              </Pressable>
            </View>
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
                      <View style={styles.inlineFields}>
                        <View style={styles.fieldBlock}>
                          <ThemedText style={styles.metaText}>Priority</ThemedText>
                          <View style={styles.priorityRow}>
                            {(["low", "medium", "high"] as TaskPriority[]).map(
                              (priority) => (
                                <Pressable
                                  key={priority}
                                  style={[
                                    styles.priorityChip,
                                    editedPriority === priority &&
                                      styles.priorityChipActive,
                                  ]}
                                  onPress={() => setEditedPriority(priority)}
                                >
                                  <ThemedText
                                    style={[
                                      styles.priorityChipText,
                                      editedPriority === priority &&
                                        styles.priorityChipTextActive,
                                    ]}
                                  >
                                    {priority}
                                  </ThemedText>
                                </Pressable>
                              ),
                            )}
                          </View>
                        </View>
                        <View style={styles.fieldBlock}>
                          <ThemedText style={styles.metaText}>
                            Estimate (min)
                          </ThemedText>
                          <TextInput
                            value={editedEstimatedMinutes}
                            onChangeText={setEditedEstimatedMinutes}
                            placeholder="30"
                            placeholderTextColor="#98A2B3"
                            style={styles.input}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.stepTitleRow}>
                      <ThemedText type="subheading" style={styles.stepTitleText}>
                        {step.order}. {step.title}
                      </ThemedText>
                      <View style={styles.reorderRow}>
                        <Pressable
                          style={styles.reorderButton}
                          onPress={() => handleMoveStep(step, "up")}
                          disabled={step.order === 1}
                        >
                          <ThemedText
                            style={[
                              styles.reorderButtonText,
                              step.order === 1 && styles.disabledButtonText,
                            ]}
                          >
                            Up
                          </ThemedText>
                        </Pressable>
                        <Pressable
                          style={styles.reorderButton}
                          onPress={() => handleMoveStep(step, "down")}
                          disabled={step.order === draftSteps.length}
                        >
                          <ThemedText
                            style={[
                              styles.reorderButtonText,
                              step.order === draftSteps.length &&
                                styles.disabledButtonText,
                            ]}
                          >
                            Down
                          </ThemedText>
                        </Pressable>
                      </View>
                    </View>
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
                  Approval: {formatStepApprovalState(step.approvalState)} · Priority: {step.priority ?? "medium"} · Estimate: {step.estimatedMinutes ?? "n/a"} min
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
                      <Pressable
                        style={styles.rejectButton}
                        onPress={() => handleDeleteStep(step.id)}
                      >
                        <ThemedText style={styles.rejectButtonText}>
                          Delete
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
                      <Pressable
                        style={styles.neutralButton}
                        onPress={() => handleDeleteStep(step.id)}
                      >
                        <ThemedText style={styles.neutralButtonText}>
                          Delete
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
    gap: 12,
  },
  toolbarRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  metaText: {
    color: semanticColors.textMuted,
    fontSize: 13,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
  },
  stepTopRow: {
    gap: 8,
  },
  stepTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  stepTitleText: {
    flex: 1,
  },
  editForm: {
    gap: 8,
  },
  inlineFields: {
    gap: 12,
  },
  fieldBlock: {
    gap: 6,
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
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  priorityChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
  },
  priorityChipActive: {
    backgroundColor: "#111827",
  },
  priorityChipText: {
    color: "#374151",
    fontWeight: "600",
  },
  priorityChipTextActive: {
    color: "#FFFFFF",
  },
  reorderRow: {
    flexDirection: "row",
    gap: 6,
  },
  reorderButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  reorderButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 12,
  },
  disabledButtonText: {
    color: "#D0D5DD",
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
