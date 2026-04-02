import { ThemedText } from "@/components/themed-text.component";
import { ThemedTodoRowView } from "@/components/themed-todo-row-view.component";
import { useTodoStore } from "@/store/todoStore";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    todos,
    toggleCompleted,
    initializeUser,
    isLoading,
    isSyncing,
  } = useTodoStore();

  useEffect(() => {
    initializeUser();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 16, flexDirection: "column", flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
            Todo App
          </ThemedText>
          {isSyncing && (
            <ThemedText style={{ fontSize: 12, color: "#666" }}>
              Syncing...
            </ThemedText>
          )}
        </View>
        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ThemedText>Loading...</ThemedText>
          </View>
        ) : (
          <FlatList
            ListEmptyComponent={<EmptyTodoView />}
            contentContainerStyle={{ flexGrow: 1 }}
            data={todos}
            renderItem={({ item: todo, index }) => (
              <ThemedTodoRowView
                text={todo.text}
                isCompleted={todo.isCompleted}
                priority={todo.priority}
                dueDate={todo.dueDate}
                toggleCompleted={() => toggleCompleted(index)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function EmptyTodoView() {
  return (
    <View style={styles.emptyView}>
      <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}>
        No todos yet!
      </ThemedText>
      <ThemedText>Tap the + button to create your first todo.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
