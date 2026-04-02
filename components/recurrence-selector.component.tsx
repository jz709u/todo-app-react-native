import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text.component";

export type RecurrenceType = "daily" | "weekly" | "monthly" | null;

export type RecurrenceSelectorProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (recurrence: { type: RecurrenceType; endDate?: number }) => void;
  selectedRecurrence?: { type: RecurrenceType; endDate?: number };
};

const RECURRENCE_OPTIONS = [
  { label: "No Recurrence", value: null as RecurrenceType },
  { label: "Daily", value: "daily" as RecurrenceType },
  { label: "Weekly", value: "weekly" as RecurrenceType },
  { label: "Monthly", value: "monthly" as RecurrenceType },
];

export function RecurrenceSelector({
  visible,
  onClose,
  onSelect,
  selectedRecurrence,
}: RecurrenceSelectorProps) {
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

  const currentType = selectedRecurrence?.type || null;

  const handleSelect = (type: RecurrenceType) => {
    onSelect({
      type,
      endDate: selectedRecurrence?.endDate,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
        <View style={[styles.container, { backgroundColor }]}>
          <ThemedText style={styles.title}>Set Recurrence</ThemedText>

          <View style={styles.optionsContainer}>
            {RECURRENCE_OPTIONS.map((option) => (
              <Pressable
                key={option.label}
                onPress={() => handleSelect(option.value)}
                style={[
                  styles.option,
                  currentType === option.value && {
                    backgroundColor: tintColor,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    currentType === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText style={styles.note}>
            💡 Recurring tasks expand locally and aren't duplicated on the
            server
          </ThemedText>

          <Pressable
            style={[styles.closeButton, { borderColor: tintColor }]}
            onPress={onClose}
          >
            <ThemedText style={{ color: tintColor }}>Close</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  selectedOptionText: {
    color: "#fff",
  },
  note: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 6,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
});
