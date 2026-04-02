import { ThemedText } from "@/components/themed-text";
import { ThemedTodoRowView } from "@/components/themed-todo-row-view";
import { useTodoStore } from "@/store/todoStore";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HabitsScreen() {
  const { todos, toggleCompleted } = useTodoStore();

  const habits = todos.filter((todo) => todo.isHabit);

  const habitsWithStats = habits.map((habit, index) => ({
    todo: habit,
    index: todos.indexOf(habit),
    streak: habit.habitStreak || 0,
  }));

  const sortedHabits = habitsWithStats.sort((a, b) => b.streak - a.streak);

  const totalStreak = habitsWithStats.reduce((sum, h) => sum + h.streak, 0);
  const activeHabits = habitsWithStats.filter((h) => h.streak > 0).length;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 16, flexDirection: "column", flex: 1 }}>
        <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
          Habit Tracker
        </ThemedText>

        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={{ fontSize: 16, textAlign: "center" }}>
              No habits yet!
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: "#999", marginTop: 8 }}>
              Mark a task as a habit from the main screen to start tracking
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {habits.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Total Habits</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>
                  {activeHabits}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Active Streaks</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{totalStreak}</ThemedText>
                <ThemedText style={styles.statLabel}>Total Days</ThemedText>
              </View>
            </View>

            <FlatList
              data={sortedHabits}
              renderItem={({ item }) => (
                <StreakHabitRow
                  todo={item.todo}
                  streak={item.streak}
                  onToggle={() => toggleCompleted(item.index)}
                />
              )}
              keyExtractor={(item) => item.todo.id}
              scrollEnabled={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

interface StreakHabitRowProps {
  todo: any;
  streak: number;
  onToggle: () => void;
}

function StreakHabitRow({ todo, streak, onToggle }: StreakHabitRowProps) {
  const getStreakColor = (streak: number) => {
    if (streak === 0) return "#E8E8E8";
    if (streak < 5) return "#FFD700";
    if (streak < 10) return "#FFA500";
    return "#FF6B6B";
  };

  const streakColor = getStreakColor(streak);

  return (
    <View style={[styles.habitRow, { boundaryColor: streakColor }]}>
      <ThemedTodoRowView
        text={todo.text}
        isCompleted={todo.isCompleted}
        toggleCompleted={onToggle}
        dueDate={todo.dueDate}
      />
      <View style={[styles.streakBadge, { backgroundColor: streakColor }]}>
        <ThemedText style={styles.streakText}>🔥 {streak}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3C88DF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  habitRow: {
    marginBottom: 8,
    borderLeftWidth: 4,
    paddingLeft: 4,
  },
  streakBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: -32,
    marginRight: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
});
