import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import {
  DatePickerAndroid,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

export type DueDatePickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (timestamp: number) => void;
  selectedDate?: number;
};

const QUICK_OPTIONS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "Next Week", days: 7 },
  { label: "Next Month", days: 30 },
];

export function DueDatePicker({
  visible,
  onClose,
  onSelect,
  selectedDate,
}: DueDatePickerProps) {
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

  const handleQuickSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(0, 0, 0, 0);
    onSelect(date.getTime());
    onClose();
  };

  const handleCustomDate = async () => {
    if (Platform.OS === "android") {
      try {
        const result = await DatePickerAndroid.open({
          date: selectedDate ? new Date(selectedDate) : new Date(),
        });

        if (result.action === DatePickerAndroid.dateSetAction) {
          const date = new Date(result.year, result.month, result.day);
          date.setHours(0, 0, 0, 0);
          onSelect(date.getTime());
          onClose();
        }
      } catch {
        // Fallback or error handling
      }
    } else {
      // iOS users can use the quick options for now
      // Full date picker can be added later with react-native-date-picker
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "No date set";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
        <View style={[styles.container, { backgroundColor }]}>
          <ThemedText style={styles.title}>Set Due Date</ThemedText>

          <View style={styles.selectedDateContainer}>
            <ThemedText style={styles.selectedDateLabel}>
              Selected: {formatDate(selectedDate)}
            </ThemedText>
          </View>

          <View style={styles.quickOptionsContainer}>
            <ThemedText style={styles.sectionTitle}>Quick Options</ThemedText>
            {QUICK_OPTIONS.map((option) => (
              <Pressable
                key={option.label}
                style={styles.quickOption}
                onPress={() => handleQuickSelect(option.days)}
              >
                <ThemedText style={styles.quickOptionText}>
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.customButton, { backgroundColor: tintColor }]}
            onPress={handleCustomDate}
          >
            <ThemedText style={styles.customButtonText}>
              Choose Custom Date
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.cancelButton, { borderColor: tintColor }]}
            onPress={onClose}
          >
            <ThemedText style={{ color: tintColor }}>Cancel</ThemedText>
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
  selectedDateContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
  },
  selectedDateLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  quickOptionsContainer: {
    gap: 8,
  },
  quickOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    alignItems: "center",
  },
  quickOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  customButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
});
