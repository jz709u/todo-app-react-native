import { DueDatePicker } from "@/components/due-date-picker.component";
import OptionSelector from "@/components/option-selector.component";
import { Priority } from "@/components/priority-selector.component";
import { RecurrenceType } from "@/components/recurrence-selector.component";
import SelectorPicker from "@/components/themed-selector-picker.component";
import { ThemedText } from "@/components/themed-text.component";
import { useTodoStore } from "@/store/todoStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTodoModal() {
  const router = useRouter();
  const { addTodo } = useTodoStore();

  const [text, setText] = useState("");
  const [selectedDueDate, setSelectedDueDate] = useState<number>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>("medium");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");

  const formatDueDate = (timestamp?: number) => {
    if (!timestamp) return undefined;
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
        priority: priority,
        recurrence:
          recurrence === "none"
            ? undefined
            : { type: recurrence, endDate: undefined },
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

      <ScrollView style={styles.form} contentContainerStyle={{ gap: 24 }}>
        <View style={{ gap: 8 }}>
          <ThemedText type="subheading">What do you want to do?</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter todo..."
            value={text}
            onChangeText={setText}
            placeholderTextColor="#999"
            multiline
          />
        </View>
        <OptionSelector<Priority>
          name="Priority"
          options={["low", "medium", "high"]}
          value={priority}
          onValueChange={(value) => setPriority(value)}
        />

        <OptionSelector<RecurrenceType>
          name="Recurrence"
          options={["none", "daily", "weekly", "monthly"]}
          value={recurrence}
          onValueChange={(value) => setRecurrence(value)}
        />

        <SelectorPicker
          title="Due Date"
          value={formatDueDate(selectedDueDate)}
          noValueText="No Date"
          onPress={() => setShowDatePicker(true)}
          removePressed={() => setSelectedDueDate(undefined)}
        />

        <DueDatePicker
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelect={(date) => {
            setSelectedDueDate(date);
            setShowDatePicker(false);
          }}
          selectedDate={selectedDueDate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
    //padding: 16,
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
