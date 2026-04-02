import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

export type PrioritySelectorProps = {
  value: "low" | "medium" | "high";
  onValueChange: (value: "low" | "medium" | "high") => void;
};

const PRIORITIES = [
  { label: "Low", value: "low" as const, color: "#FFD700" },
  { label: "Medium", value: "medium" as const, color: "#FFA500" },
  { label: "High", value: "high" as const, color: "#FF6B6B" },
];

export function PrioritySelector({
  value,
  onValueChange,
}: PrioritySelectorProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Priority</ThemedText>
      <View style={styles.buttonsContainer}>
        {PRIORITIES.map((priority) => (
          <Pressable
            key={priority.value}
            onPress={() => onValueChange(priority.value)}
            style={[
              styles.button,
              {
                backgroundColor:
                  value === priority.value ? priority.color : "#E8E8E8",
              },
            ]}
          >
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color: value === priority.value ? "#fff" : "#000",
                },
              ]}
            >
              {priority.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
