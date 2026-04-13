import { EmptyState } from "@/components/empty-state.component";
import { ThemedText } from "@/components/themed-text.component";
import { semanticColors } from "@/constants/theme";
import { formatLongDate } from "@/lib/formatters/date";
import { formatGoalStatus } from "@/lib/formatters/status";
import { selectGoals } from "@/lib/selectors/goalSelectors";
import Goal from "@/model/Goal";
import { useGoalDomainStore } from "@/store/goalDomainStore";
import { useGoalStore } from "@/store/goalStore";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalsScreen() {
  const router = useRouter();
  const initialize = useGoalDomainStore((state) => state.initialize);
  const error = useGoalDomainStore((state) => state.error);
  const isInitializing = useGoalDomainStore((state) => state.isInitializing);
  const isSyncing = useGoalDomainStore((state) => state.isSyncing);
  const goalOrder = useGoalStore((state) => state.goalOrder);
  const goalsById = useGoalStore((state) => state.goalsById);
  const goals = selectGoals(goalOrder, goalsById);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <ThemedText type="title">Goals</ThemedText>
            <ThemedText lightColor="#667085">
              Track higher-level outcomes, not just one-off tasks.
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.push("/goals/create")}
            style={styles.createButton}
          >
            <ThemedText style={styles.createButtonText}>New Goal</ThemedText>
          </Pressable>
        </View>

        {isInitializing || isSyncing || error ? (
          <View style={styles.syncBanner}>
            <ThemedText style={styles.syncBannerText}>
              {error
                ? `Sync issue: ${error}`
                : isInitializing
                  ? "Connecting goals workspace..."
                  : "Syncing goals workspace..."}
            </ThemedText>
          </View>
        ) : null}

        <FlatList
          contentContainerStyle={styles.listContent}
          data={goals}
          keyExtractor={(goal) => goal.id}
          ListEmptyComponent={<EmptyGoalsView />}
          renderItem={({ item }) => (
            <GoalCard
              goal={item}
              onPress={() => router.push(`/goals/${item.id}`)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function GoalCard({
  goal,
  onPress,
}: {
  goal: Goal;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="subheading" style={styles.cardTitle}>
          {goal.title}
        </ThemedText>
        <View style={styles.statusBadge}>
          <ThemedText style={styles.statusText}>
            {formatGoalStatus(goal.status)}
          </ThemedText>
        </View>
      </View>
      <ThemedText lightColor={semanticColors.textSubtle} numberOfLines={3}>
        {goal.abstractGoal}
      </ThemedText>
      <View style={styles.cardMetaRow}>
        <ThemedText style={styles.metaLabel}>
          Target: {formatLongDate(goal.targetDate, "No deadline")}
        </ThemedText>
        <ThemedText style={styles.metaLabel}>
          {goal.activePlanId ? "Plan attached" : "No active plan"}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function EmptyGoalsView() {
  return (
    <EmptyState
      title="No goals yet"
      description="Create a goal to start building the goal-to-plan workflow."
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.screenBackground,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  header: {
    gap: 12,
  },
  syncBanner: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FEF3C7",
  },
  syncBannerText: {
    color: "#92400E",
    fontSize: 12,
  },
  headerCopy: {
    gap: 4,
  },
  createButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    flexGrow: 1,
    gap: 12,
    paddingBottom: 120,
  },
  card: {
    gap: 10,
    borderRadius: 18,
    padding: 16,
    backgroundColor: semanticColors.surface,
    borderWidth: 1,
    borderColor: semanticColors.borderSubtle,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardTitle: {
    flex: 1,
  },
  statusBadge: {
    backgroundColor: semanticColors.statusInfoBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: semanticColors.statusInfoText,
    fontSize: 12,
    textTransform: "capitalize",
  },
  cardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaLabel: {
    fontSize: 12,
    color: semanticColors.textMuted,
  },
});
