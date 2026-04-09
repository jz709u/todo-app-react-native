import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { semanticColors } from "@/constants/theme";

export function SectionCard({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: semanticColors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: semanticColors.borderSubtle,
  },
});
