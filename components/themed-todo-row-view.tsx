import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import { SFSymbol, SymbolView } from "expo-symbols";
import { ThemedText } from "./themed-text";
import { ThemedViewProps } from "./themed-view";

export type ThemedTodoRowViewProps = ThemedViewProps & {
  text: string;
  isCompleted: boolean;
  toggleCompleted: () => void;
};

export function ThemedTodoRowView({
  style,
  lightColor,
  darkColor,
  text,
  isCompleted,
  toggleCompleted,
  ...otherProps
}: ThemedTodoRowViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return (
    <View
      style={[{ backgroundColor }, style, themedRowStyles.themedTodoRow]}
      {...otherProps}
    >
      <CheckmarkButtonView
        isCompleted={isCompleted}
        onPress={toggleCompleted}
      />
      <ThemedText>{text}</ThemedText>
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
    name = "checkmark.circle";
    tintColor = "#3C88DF";
  }
  const symbolView = (
    <SymbolView
      type="monochrome"
      name={name}
      size={size}
      tintColor={tintColor}
    />
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
    gap: 20,
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderColor: "#B0B0B0",
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
  },
  checkmarkButton: {
    borderRadius: 12,
  },
});
