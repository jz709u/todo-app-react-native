import { generateHslRange } from "@/lib/hsl-range";
import { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewProps } from "react-native";
import { ThemedText } from "./themed-text.component";

type OptionSelectorProps<T extends string> = {
  name: String;
  options: T[];
  value: T;
  startColor?: string;
  endColor?: string;
  onValueChange: (value: T) => void;
} & ViewProps;

export default function OptionSelector<T extends string>({
  name,
  options,
  value,
  startColor = "#3b15d4",
  endColor = "#20bc6b",
  onValueChange,
  style,
}: OptionSelectorProps<T>) {
  const colors = useMemo(() => {
    return generateHslRange(startColor, endColor, options.length + 1);
  }, [options, startColor, endColor]);

  return (
    <View style={[styles.container, style]}>
      <ThemedText type="subheading">{name}</ThemedText>
      <View style={styles.buttonsContainer}>
        {[...options].map((option, index) => (
          <Pressable
            key={index}
            onPress={() => {
              onValueChange(option as T);
            }}
            style={[
              styles.button,
              {
                backgroundColor: colors[index],
                opacity: value === option ? 1 : 0.4,
              },
            ]}
          >
            <ThemedText
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.buttonText,
                {
                  color: value === option ? "#fff" : "#000",
                },
              ]}
            >
              {option.toUpperCase()}
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
    fontWeight: "800",
  },
});
