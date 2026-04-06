import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Linking } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { handleSiriTodoUrl } from "@/lib/siri-todo-link";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const processUrl = async (url: string | null) => {
      if (!url) {
        return;
      }

      const didCreateTodo = await handleSiriTodoUrl(url);
      if (didCreateTodo) {
        router.replace("/");
      }
    };

    void Linking.getInitialURL().then(processUrl);

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void processUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-todo-modal-screen"
          options={{
            presentation: "formSheet",
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
