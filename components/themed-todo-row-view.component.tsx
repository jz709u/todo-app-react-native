import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import { SFSymbol, SymbolView } from "expo-symbols";
import { ThemedText } from "./themed-text.component";
import { ThemedViewProps } from "./themed-view.component";

export type ThemedTodoRowViewProps = ThemedViewProps & {
  text: string;
  isCompleted: boolean;
  toggleCompleted: () => void;
  priority?: "low" | "medium" | "high";
  dueDate?: number;
};

const PRIORITY_COLORS: Record<"low" | "medium" | "high", string> = {
  low: "#FFD700",
  medium: "#FFA500",
  high: "#FF6B6B",
};

export function ThemedTodoRowView({
  style,
  lightColor,
  darkColor,
  text,
  isCompleted,
  toggleCompleted,
  priority = "medium",
  dueDate,
  ...otherProps
}: ThemedTodoRowViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const isOverdue = dueDate && dueDate < Date.now() && !isCompleted;

  const formatDueDate = (timestamp: number) => {
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
    <View
      style={[
        { backgroundColor: isOverdue ? "#FFE0E0" : backgroundColor },
        style,
        themedRowStyles.themedTodoRow,
      ]}
      {...otherProps}
    >
      <CheckmarkButtonView
        isCompleted={isCompleted}
        onPress={toggleCompleted}
      />
      <View style={themedRowStyles.contentContainer}>
        <View style={themedRowStyles.textContainer}>
          <ThemedText
            style={[
              themedRowStyles.todoText,
              isCompleted && themedRowStyles.completedText,
            ]}
          >
            {text}
          </ThemedText>
        </View>
        <View style={themedRowStyles.metadataContainer}>
          {dueDate && (
            <ThemedText
              style={[
                themedRowStyles.dueDate,
                isOverdue ? themedRowStyles.overdueText : {},
              ]}
            >
              📅 {formatDueDate(dueDate)}
            </ThemedText>
          )}
          {priority && priority !== "medium" && (
            <View
              style={[
                themedRowStyles.priorityBadge,
                { backgroundColor: PRIORITY_COLORS[priority] },
              ]}
            >
              <ThemedText style={themedRowStyles.priorityText}>
                {priority.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

type CompletedButtonViewProps = {
  isCompleted: boolean;
  onPress: () => void;
};

function CheckmarkButtonView({
  isCompleted,
  onPress,
}: CompletedButtonViewProps) {
  const type = "monochrome";
  let name: SFSymbol = "circle";
  let tintColor = "#B0B0B0";
  const size = 24;

  if (isCompleted) {
    name = "checkmark.circle.fill";
    tintColor = "#3C88DF";
  }
  const symbolView = (
    <SymbolView type={type} name={name} size={size} tintColor={tintColor} />
  );

  return (
    <TouchableOpacity style={themedRowStyles.checkmarkButton} onPress={onPress}>
      {symbolView}
    </TouchableOpacity>
  );
}

const themedRowStyles = StyleSheet.create({
  themedTodoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: "#E0E0E0",
    borderColor: "#B0B0B0",
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  checkmarkButton: {
    borderRadius: 12,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  textContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 14,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  metadataContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  dueDate: {
    fontSize: 12,
    color: "#666",
  },
  overdueText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    minWidth: 24,
    alignItems: "center",
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
  },
});
