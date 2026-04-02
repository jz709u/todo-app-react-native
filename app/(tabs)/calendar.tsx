import { ThemedText } from "@/components/themed-text";
import { ThemedTodoRowView } from "@/components/themed-todo-row-view";
import { useTodoStore } from "@/store/todoStore";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalendarScreen() {
  const { todos, toggleCompleted } = useTodoStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const monthTodos = todos.filter((todo) => {
    if (!todo.dueDate) return false;
    const todoDate = new Date(todo.dueDate);
    return (
      todoDate.getMonth() === currentDate.getMonth() &&
      todoDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const getDayTodos = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    date.setHours(0, 0, 0, 0);
    const timestamp = date.getTime();

    return todos.filter(
      (todo) =>
        todo.dueDate &&
        Math.floor(todo.dueDate / (24 * 60 * 60 * 1000)) ===
          Math.floor(timestamp / (24 * 60 * 60 * 1000)),
    );
  };

  const getSelectedDateTodos = () => {
    if (selectedDate === null) return [];
    return getDayTodos(selectedDate);
  };

  const getDaysInMonth = () => {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    ).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete the 6-week grid (42 days total)
  while (days.length < 42) {
    days.push(null);
  }

  const selectedDateTodos = getSelectedDateTodos();
  const isToday =
    selectedDate === new Date().getDate() &&
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 16, flexDirection: "column", flex: 1 }}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <Pressable onPress={previousMonth}>
            <ThemedText style={styles.navButton}>←</ThemedText>
          </Pressable>
          <ThemedText style={styles.monthTitle}>
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </ThemedText>
          <Pressable onPress={nextMonth}>
            <ThemedText style={styles.navButton}>→</ThemedText>
          </Pressable>
        </View>

        {/* Day Headers */}
        <View style={styles.dayHeadersContainer}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <ThemedText key={day} style={styles.dayHeader}>
              {day}
            </ThemedText>
          ))}
        </View>

        {/* Calendar Grid */}
        <FlatList
          data={days}
          numColumns={7}
          renderItem={({ item: day }) => (
            <CalendarDay
              day={day}
              isSelected={day === selectedDate}
              todoCount={day ? getDayTodos(day).length : 0}
              isToday={
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()
              }
              onPress={() => day && setSelectedDate(day)}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />

        {/* Selected Day Todos */}
        {selectedDate && (
          <View style={{ gap: 8, flex: 1 }}>
            <ThemedText style={styles.selectedDayTitle}>
              {isToday
                ? "Today"
                : `${new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              {selectedDateTodos.length > 0 && ` (${selectedDateTodos.length})`}
            </ThemedText>
            <FlatList
              data={selectedDateTodos}
              renderItem={({ item: todo, index: todoIndex }) => {
                return (
                  <ThemedTodoRowView
                    text={todo.text}
                    isCompleted={todo.isCompleted}
                    toggleCompleted={() => toggleCompleted(todoIndex)}
                    priority={todo.priority}
                    dueDate={todo.dueDate}
                  />
                );
              }}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <ThemedText
                  style={{
                    color: "#999",
                    textAlign: "center",
                    paddingVertical: 16,
                  }}
                >
                  No todos for this day
                </ThemedText>
              }
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

interface CalendarDayProps {
  day: number | null;
  isSelected: boolean;
  todoCount: number;
  isToday: boolean;
  onPress: () => void;
}

function CalendarDay({
  day,
  isSelected,
  todoCount,
  isToday,
  onPress,
}: CalendarDayProps) {
  if (day === null) {
    return <View style={styles.emptyDayCell} />;
  }

  return (
    <Pressable
      style={[
        styles.dayCell,
        isSelected && styles.selectedDayCell,
        isToday && styles.todayCell,
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.dayNumber,
          isSelected && styles.selectedDayNumber,
          isToday && styles.todayNumber,
        ]}
      >
        {day}
      </ThemedText>
      {todoCount > 0 && (
        <ThemedText
          style={[styles.todoCount, isSelected && styles.selectedTodoCount]}
        >
          {todoCount}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  navButton: {
    fontSize: 20,
    fontWeight: "bold",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dayHeadersContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    flexBasis: "14.28%",
    padding: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  emptyDayCell: {
    flex: 1,
    aspectRatio: 1,
    flexBasis: "14.28%",
    backgroundColor: "transparent",
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: "600",
  },
  todayCell: {
    backgroundColor: "#E8F4FD",
    borderColor: "#3C88DF",
    borderWidth: 2,
  },
  todayNumber: {
    color: "#3C88DF",
  },
  selectedDayCell: {
    backgroundColor: "#3C88DF",
    borderColor: "#2563EB",
  },
  selectedDayNumber: {
    color: "#fff",
  },
  todoCount: {
    fontSize: 10,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  selectedTodoCount: {
    color: "#FFD700",
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
