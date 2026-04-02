import { ThemedText } from "@/components/themed-text";
import { ThemedTodoRowView } from "@/components/themed-todo-row-view";
import { DueDatePicker } from "@/components/due-date-picker";
import { PrioritySelector } from "@/components/priority-selector";
import { useTodoStore } from "@/store/todoStore";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    todos,
    addTodo,
    toggleCompleted,
    initializeUser,
    isLoading,
    isSyncing,
    syncTodos,
  } = useTodoStore();

  const [input, setInput] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<number>();
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    initializeUser();
  }, []);

  const handleAddTodo = () => {
    if (input.trim()) {
      addTodo(input, {
        dueDate: selectedDueDate,
        priority: selectedPriority,
      });
      setInput("");
      setSelectedDueDate(undefined);
      setSelectedPriority('medium');
    }
  };

  const formatDueDate = (timestamp?: number) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 16, flexDirection: "column", flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
            Todo App
          </ThemedText>
          {isSyncing && (
            <ThemedText style={{ fontSize: 12, color: "#666" }}>
              Syncing...
            </ThemedText>
          )}
        </View>
        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ThemedText>Loading...</ThemedText>
          </View>
        ) : (
          <FlatList
            ListEmptyComponent={<EmptyTodoView />}
            contentContainerStyle={{ flexGrow: 1 }}
            data={todos}
            renderItem={({ item: todo, index }) => (
              <ThemedTodoRowView
                text={todo.text}
                isCompleted={todo.isCompleted}
                priority={todo.priority}
                dueDate={todo.dueDate}
                toggleCompleted={() => toggleCompleted(index)}
              />
            )}
          />
        )}
      </View>

      <View style={styles.inputSection}>
        <TextInput
          placeholder="Enter todo..."
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleAddTodo}
        />

        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={[
            styles.iconButton,
            selectedDueDate && { backgroundColor: "#3C88DF" },
          ]}
        >
          <ThemedText style={{ fontSize: 18 }}>📅</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleAddTodo}
          style={styles.addButton}
        >
          <ThemedText style={styles.addButtonText}>Add</ThemedText>
        </Pressable>
      </View>

      {/* Due Date Picker */}
      <DueDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(date) => {
          setSelectedDueDate(date);
          setShowDatePicker(false);
        }}
        selectedDate={selectedDueDate}
      />

      {selectedDueDate && (
        <View style={styles.selectedOptionsBar}>
          <ThemedText style={styles.selectedOptionText}>
            Due: {formatDueDate(selectedDueDate)}
          </ThemedText>
          <Pressable onPress={() => setSelectedDueDate(undefined)}>
            <ThemedText style={styles.removeButton}>✕</ThemedText>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function EmptyTodoView() {
  return (
    <View style={styles.emptyView}>
      <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}>
        No todos yet!
      </ThemedText>
      <ThemedText>Get started by adding your first todo below.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  inputSection: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: "#A1CEDC",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 8,
    flex: 1,
    height: 40,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
  },
  addButton: {
    backgroundColor: "#3C88DF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedOptionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F4FD",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 4,
  },
  selectedOptionText: {
    fontSize: 12,
    color: "#0a7ea4",
  },
  removeButton: {
    fontSize: 16,
    color: "#999",
  },
  emptyView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
