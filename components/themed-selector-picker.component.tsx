import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text.component";

type SelectorPickerProps = {
  title: string;
  value?: string;
  noValueText: string;
  onPress: () => void;
  removePressed?: () => void;
};

export default function SelectorPicker({
  title,
  value,
  onPress,
  removePressed,
  noValueText,
}: SelectorPickerProps) {
  const showRemoveButton = value !== undefined;
  const content = showRemoveButton ? (
    <View style={styles.dateButtonText}>
      <ThemedText>{value}</ThemedText>
      <RemoveButton onPress={() => removePressed && removePressed()} />
    </View>
  ) : (
    <ThemedText style={styles.dateButtonText}>{noValueText}</ThemedText>
  );
  return (
    <View style={styles.section}>
      <ThemedText type="subheading">{title}</ThemedText>
      <Pressable style={styles.dateButton} onPress={onPress}>
        {content}
      </Pressable>
    </View>
  );
}

function RemoveButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.removeDateButton}>
      <ThemedText style={styles.removeDateText}>✕</ThemedText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  section: {
    gap: 8,
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
    flexGrow: 1,
    direction: "ltr",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignContent: "center",
  },
  removeDateButton: {
    padding: 4,
  },
  removeDateText: {
    fontSize: 18,
    color: "#999",
  },
});
