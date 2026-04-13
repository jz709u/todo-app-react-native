import { createGoal } from "@/lib/repositories/goalRepository";
import { useGoalDomainStore } from "@/store/goalDomainStore";
import { ThemedText } from "@/components/themed-text.component";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateGoalScreen() {
  const router = useRouter();
  const syncGoalDomain = useGoalDomainStore((state) => state.syncGoalDomain);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [abstractGoal, setAbstractGoal] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreateGoal = async () => {
    if (!title.trim() || !abstractGoal.trim()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const goalId = createGoal({
        title: title.trim(),
        abstractGoal: abstractGoal.trim(),
        constraints: notes.trim() ? { notes: notes.trim() } : undefined,
        status: "draft",
      });

      await syncGoalDomain(goalId);
      router.replace(`/goals/${goalId}`);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save this goal.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={styles.cancelText}>Cancel</ThemedText>
        </Pressable>
        <ThemedText type="subheading">New Goal</ThemedText>
        <Pressable
          onPress={() => void handleCreateGoal()}
          disabled={isSaving || !title.trim() || !abstractGoal.trim()}
        >
          <ThemedText
            style={[
              styles.saveText,
              (isSaving || !title.trim() || !abstractGoal.trim()) &&
                styles.disabledText,
            ]}
          >
            {isSaving ? "Saving..." : "Save"}
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {saveError ? (
          <ThemedText style={styles.errorText}>{saveError}</ThemedText>
        ) : null}
        <View style={styles.fieldGroup}>
          <ThemedText type="subheading">Goal title</ThemedText>
          <TextInput
            placeholder="Launch portfolio site"
            placeholderTextColor="#98A2B3"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText type="subheading">What are you trying to achieve?</ThemedText>
          <TextInput
            placeholder="Describe the outcome in plain language..."
            placeholderTextColor="#98A2B3"
            style={[styles.input, styles.multilineInput]}
            multiline
            value={abstractGoal}
            onChangeText={setAbstractGoal}
          />
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText type="subheading">Constraints or notes</ThemedText>
          <TextInput
            placeholder="Budget, deadline, tools, blockers..."
            placeholderTextColor="#98A2B3"
            style={[styles.input, styles.notesInput]}
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E7EC",
  },
  cancelText: {
    color: "#667085",
  },
  saveText: {
    color: "#0F766E",
    fontWeight: "600",
  },
  disabledText: {
    color: "#D0D5DD",
  },
  errorText: {
    color: "#B42318",
  },
  form: {
    padding: 16,
    gap: 24,
  },
  fieldGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F8FAFC",
  },
  multilineInput: {
    minHeight: 130,
    textAlignVertical: "top",
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
