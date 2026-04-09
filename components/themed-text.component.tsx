import React from "react";
import { Text, type TextProps } from "react-native";

import { Typography } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextType =
  | "caption"
  | "bodySmall"
  | "body"
  | "subheading"
  | "heading"
  | "title";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemedTextType;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "caption" ? Typography.caption : undefined,
        type === "bodySmall" ? Typography.bodySmall : undefined,
        type === "body" ? Typography.body : undefined,
        type === "subheading" ? Typography.subheading : undefined,
        type === "heading" ? Typography.heading : undefined,
        type === "title" ? Typography.title : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
