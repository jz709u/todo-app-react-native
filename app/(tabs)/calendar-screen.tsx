import { Calendar } from "@/components/calendar.component";
import { ThemedText } from "@/components/themed-text.component";
import { ThemedTodoRowView } from "@/components/themed-todo-row-view.component";
import { useTodoStore } from "@/store/todoStore";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalendarScreen() {
  const { todos, toggleCompleted } = useTodoStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

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

  const handleMonthChange = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const selectedDateTodos = getSelectedDateTodos();
  const isToday =
    selectedDate === new Date().getDate() &&
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 16, flexDirection: "column", flex: 1 }}>
        {/* Decoupled Calendar Component */}
        <Calendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          onMonthChange={handleMonthChange}
          onDateSelect={setSelectedDate}
          renderDay={({ day, isSelected, isToday: isDayToday }) => {
            if (day === null) {
              return <View style={styles.emptyDayCell} />;
            }

            const todoCount = getDayTodos(day).length;

            return (
              <Pressable
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDayCell,
                  isDayToday && styles.todayCell,
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <ThemedText
                  style={[
                    styles.dayNumber,
                    isSelected && styles.selectedDayNumber,
                    isDayToday && styles.todayNumber,
                  ]}
                >
                  {day}
                </ThemedText>
                {todoCount > 0 && (
                  <ThemedText
                    style={[
                      styles.todoCount,
                      isSelected && styles.selectedTodoCount,
                    ]}
                  >
                    {todoCount}
                  </ThemedText>
                )}
              </Pressable>
            );
          }}
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
              renderItem={({ item: todo }) => {
                return (
                  <ThemedTodoRowView
                    text={todo.text}
                    isCompleted={todo.isCompleted}
                    toggleCompleted={() => toggleCompleted(todo.id)}
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

const styles = StyleSheet.create({
  emptyDayCell: {
    flex: 1,
    aspectRatio: 1,
    flexBasis: "14.28%",
    backgroundColor: "transparent",
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
