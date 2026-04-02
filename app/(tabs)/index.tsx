import { ThemedText } from "@/components/themed-text";
import { ThemedTodoRowView } from "@/components/themed-todo-row-view";
import { useTodoStore } from "@/store/todoStore";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    todos,
    addTodo,
    toggleCompleted,
    initializeUser,
    isLoading,
    isSyncing,
    syncTodos,
  } = useTodoStore();
  const [input, setInput] = useState("");

  useEffect(() => {
    initializeUser();
  }, []);

  const handleAddTodo = () => {
    if (input.trim()) {
      addTodo(input);
      setInput("");
    }
  };

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
                toggleCompleted={() => toggleCompleted(index)}
              />
            )}
          />
        )}
      </View>
      <View
        style={{
          flexDirection: `row`,
          gap: 8,
          alignItems: "center",
          backgroundColor: "#A1CEDC",
          padding: 8,
          borderRadius: 4,
          marginHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <TextInput
          placeholder="Enter todo..."
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={(event) => {
            setInput(event.nativeEvent.text);
          }}
        />
        <Pressable
          onPress={handleAddTodo}
          style={{
            backgroundColor: "#3C88DF",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 4,
          }}
        >
          <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>
            Add
          </ThemedText>
        </Pressable>
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
      <ThemedText>Get started by adding your first todo below.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 8,
    flex: 1,
    flexShrink: 1,
    height: 50,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  emptyView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff00",
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
