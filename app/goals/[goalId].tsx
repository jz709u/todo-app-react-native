import { SectionCard } from "@/components/section-card.component";
import { ThemedText } from "@/components/themed-text.component";
import { semanticColors } from "@/constants/theme";
import { formatLongDate } from "@/lib/formatters/date";
import {
  formatGoalStatus,
  formatPlanStatus,
  formatStepApprovalState,
  formatStepStatus,
  formatTaskPriority,
  formatTaskStatus,
} from "@/lib/formatters/status";
import { getGeneratePlanLabel } from "@/lib/planner/config";
import {
  selectGoalProgress,
  selectPlansByGoalId,
  selectPlanSteps,
  selectTasksByGoalId,
} from "@/lib/selectors/goalSelectors";
import Task from "@/model/Task";
import { useGoalStore } from "@/store/goalStore";
import { usePlanStore } from "@/store/planStore";
import { useTaskStore } from "@/store/taskStore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalDetailScreen() {
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const goalsById = useGoalStore((state) => state.goalsById);
  const planOrder = usePlanStore((state) => state.planOrder);
  const plansById = usePlanStore((state) => state.plansById);
  const planStepOrderByPlanId = usePlanStore(
    (state) => state.planStepOrderByPlanId,
  );
  const planStepsById = usePlanStore((state) => state.planStepsById);
  const taskOrder = useTaskStore((state) => state.taskOrder);
  const tasksById = useTaskStore((state) => state.tasksById);

  const goal = goalId ? goalsById[goalId] : undefined;
  const plans = goalId ? selectPlansByGoalId(goalId, planOrder, plansById) : [];
  const tasks = goalId ? selectTasksByGoalId(goalId, taskOrder, tasksById) : [];

  const activePlan = goal?.activePlanId
    ? plans.find((plan) => plan.id === goal.activePlanId)
    : plans[plans.length - 1];
  const planSteps = selectPlanSteps(
    activePlan?.id,
    planStepOrderByPlanId,
    planStepsById,
  );
  const { completedTaskCount, totalTaskCount } = selectGoalProgress(tasks);

  if (!goal) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["right", "bottom", "left"]}
      >
        <Stack.Screen options={{ title: "Goal" }} />
        <View style={styles.missingState}>
          <ThemedText type="subheading">Goal not found</ThemedText>
          <Pressable onPress={() => router.replace("/goals-screen")}>
            <ThemedText style={styles.linkText}>Back to goals</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["right", "bottom", "left"]}>
      <Stack.Screen options={{ title: goal.title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.statusPill}>
              <ThemedText style={styles.statusPillText}>
                {formatGoalStatus(goal.status)}
              </ThemedText>
            </View>
            <ThemedText style={styles.deadlineText}>
              Target {formatLongDate(goal.targetDate)}
            </ThemedText>
          </View>

          <ThemedText type="title">{goal.title}</ThemedText>
          <ThemedText lightColor={semanticColors.textSubtle}>
            {goal.abstractGoal}
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Plans" value={String(plans.length)} />
          <StatCard label="Steps" value={String(planSteps.length)} />
          <StatCard
            label="Done tasks"
            value={`${completedTaskCount}/${totalTaskCount}`}
          />
        </View>

        <Section title="Constraints">
          {goal.constraints.notes ||
          goal.constraints.budget ||
          goal.constraints.tools?.length ? (
            <SectionCard>
              {goal.constraints.notes ? (
                <ThemedText lightColor={semanticColors.textSubtle}>
                  {goal.constraints.notes}
                </ThemedText>
              ) : null}
              {goal.constraints.budget ? (
                <ThemedText style={styles.metaRowText}>
                  Budget: {goal.constraints.budget}
                </ThemedText>
              ) : null}
              {goal.constraints.tools?.length ? (
                <ThemedText style={styles.metaRowText}>
                  Tools: {goal.constraints.tools.join(", ")}
                </ThemedText>
              ) : null}
            </SectionCard>
          ) : (
            <EmptySectionCopy text="No constraints captured yet." />
          )}
        </Section>

        <Section title="Active plan">
          {activePlan ? (
            <SectionCard>
              <ThemedText type="subheading">{activePlan.summary}</ThemedText>
              <ThemedText style={styles.metaRowText}>
                Version {activePlan.version} ·{" "}
                {formatPlanStatus(activePlan.status)}
              </ThemedText>
              {activePlan.status === "awaiting_approval" ? (
                <Pressable
                  style={styles.reviewButton}
                  onPress={() => router.push(`/goals/${goal.id}/review`)}
                >
                  <ThemedText style={styles.reviewButtonText}>
                    Review Draft Plan
                  </ThemedText>
                </Pressable>
              ) : null}
              {planSteps.length > 0 ? (
                <View style={styles.listBlock}>
                  {planSteps.map((step) => (
                    <View key={step.id} style={styles.stepRow}>
                      <View style={styles.stepIndex}>
                        <ThemedText style={styles.stepIndexText}>
                          {step.order}
                        </ThemedText>
                      </View>
                      <View style={styles.stepCopy}>
                        <ThemedText>{step.title}</ThemedText>
                        <ThemedText style={styles.metaRowText}>
                          {formatStepStatus(step.status)} ·{" "}
                          {formatStepApprovalState(step.approvalState)}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <EmptySectionCopy text="No plan steps exist for this goal yet." />
              )}
            </SectionCard>
          ) : (
            <SectionCard>
              <ThemedText lightColor={semanticColors.textMuted}>
                No plan has been created for this goal yet.
              </ThemedText>
              <Pressable
                style={styles.reviewButton}
                onPress={() => router.push(`/goals/${goal.id}/review`)}
              >
                <ThemedText style={styles.reviewButtonText}>
                  {getGeneratePlanLabel()}
                </ThemedText>
              </Pressable>
            </SectionCard>
          )}
        </Section>

        <Section title="Tasks">
          {tasks.length > 0 ? (
            <SectionCard>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </SectionCard>
          ) : (
            <EmptySectionCopy text="No execution tasks exist for this goal yet." />
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="subheading">{title}</ThemedText>
      {children}
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <ThemedText type="heading">{value}</ThemedText>
      <ThemedText style={styles.metaRowText}>{label}</ThemedText>
    </View>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <View style={styles.taskRow}>
      <View
        style={[
          styles.taskStatusDot,
          task.status === "done" ? styles.doneDot : styles.todoDot,
        ]}
      />
      <View style={styles.stepCopy}>
        <ThemedText>{task.title}</ThemedText>
        <ThemedText style={styles.metaRowText}>
          {formatTaskStatus(task.status)} · {formatTaskPriority(task.priority)}{" "}
          priority
        </ThemedText>
      </View>
    </View>
  );
}

function EmptySectionCopy({ text }: { text: string }) {
  return (
    <SectionCard>
      <ThemedText lightColor={semanticColors.textMuted}>{text}</ThemedText>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.screenBackground,
  },
  content: {
    padding: 16,
    gap: 18,
  },
  heroCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPill: {
    backgroundColor: "#164E63",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    color: "#ECFEFF",
    textTransform: "capitalize",
    fontSize: 12,
  },
  deadlineText: {
    color: "#CBD5E1",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: semanticColors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: semanticColors.borderSubtle,
    gap: 4,
  },
  section: {
    gap: 8,
  },
  metaRowText: {
    color: semanticColors.textMuted,
    fontSize: 13,
  },
  listBlock: {
    gap: 12,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndexText: {
    color: "#0C4A6E",
    fontWeight: "700",
  },
  stepCopy: {
    flex: 1,
    gap: 2,
  },
  reviewButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  taskRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  taskStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  doneDot: {
    backgroundColor: "#16A34A",
  },
  todoDot: {
    backgroundColor: "#F59E0B",
  },
  missingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  linkText: {
    color: "#0F766E",
    fontWeight: "600",
  },
});
