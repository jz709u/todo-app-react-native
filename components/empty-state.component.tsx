import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text.component";
import { semanticColors } from "@/constants/theme";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="subheading">{title}</ThemedText>
      {description ? (
        <ThemedText lightColor={semanticColors.textMuted} style={styles.copy}>
          {description}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  copy: {
    textAlign: "center",
  },
});
