import { DueDatePicker } from "@/components/due-date-picker.component";
import { ThemedText } from "@/components/themed-text.component";
import { useTodoStore } from "@/store/todoStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function AddTodoModal() {
  const router = useRouter();
  const { addTodo } = useTodoStore();

  const [text, setText] = useState("");
  const [selectedDueDate, setSelectedDueDate] = useState<number>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDueDate = (timestamp?: number) => {
    if (!timestamp) return "No date";
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

  const handleAddTodo = () => {
    if (text.trim()) {
      addTodo(text, {
        dueDate: selectedDueDate,
      });
      router.dismiss();
    }
  };

  const handleCancel = () => {
    router.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleCancel}>
          <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
        </Pressable>
        <ThemedText style={styles.title}>New Todo</ThemedText>
        <Pressable onPress={handleAddTodo} disabled={!text.trim()}>
          <ThemedText
            style={[
              styles.saveButton,
              !text.trim() && styles.saveButtonDisabled,
            ]}
          >
            Save
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.section}>
          <ThemedText style={styles.label}>What do you want to do?</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter todo..."
            value={text}
            onChangeText={setText}
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Due Date</ThemedText>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText style={styles.dateButtonText}>
              📅 {formatDueDate(selectedDueDate)}
            </ThemedText>
            {selectedDueDate && (
              <Pressable
                onPress={() => setSelectedDueDate(undefined)}
                style={styles.removeDateButton}
              >
                <ThemedText style={styles.removeDateText}>✕</ThemedText>
              </Pressable>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <DueDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(date) => {
          setSelectedDueDate(date);
          setShowDatePicker(false);
        }}
        selectedDate={selectedDueDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    color: "#999",
    fontSize: 16,
  },
  saveButton: {
    color: "#3C88DF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonDisabled: {
    color: "#CCC",
  },
  form: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  removeDateButton: {
    padding: 4,
  },
  removeDateText: {
    fontSize: 18,
    color: "#999",
  },
});
