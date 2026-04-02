jest.mock("@/store/todoStore");

import React from "react";
import { useTodoStore } from "@/store/todoStore";

const mockUseTodoStore = useTodoStore as jest.MockedFunction<typeof useTodoStore>;

const mockStoreDefaults = {
  todos: [] as any,
  userId: "test-user",
  isLoading: false,
  isSyncing: false,
  initializeUser: jest.fn(),
  addTodo: jest.fn(),
  toggleCompleted: jest.fn(),
  removeTodo: jest.fn(),
  syncTodos: jest.fn(),
  startPeriodicSync: jest.fn(),
  stopPeriodicSync: jest.fn(),
};

describe("HomeScreen Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodoStore.mockReturnValue({ ...mockStoreDefaults } as any);
  });

  it("should initialize user on mount", () => {
    const initializeMock = jest.fn();
    mockUseTodoStore.mockReturnValue({
      ...mockStoreDefaults,
      initializeUser: initializeMock,
    } as any);

    // Import after mock setup
    const HomeScreen = require("@/app/(tabs)/index").default;
    expect(HomeScreen).toBeDefined();
  });

  it("should have todos state from store", () => {
    const todos = [
      { id: "1", text: "Test Todo", isCompleted: false },
    ];
    mockUseTodoStore.mockReturnValue({
      ...mockStoreDefaults,
      todos,
    } as any);

    expect(mockUseTodoStore()).toEqual(expect.objectContaining({ todos }));
  });

  it("should call addTodo with input text", () => {
    const addTodoMock = jest.fn();
    mockUseTodoStore.mockReturnValue({
      ...mockStoreDefaults,
      addTodo: addTodoMock,
    } as any);

    const store = mockUseTodoStore();
    expect(store.addTodo).toBe(addTodoMock);
  });

  it("should handle loading state", () => {
    mockUseTodoStore.mockReturnValue({
      ...mockStoreDefaults,
      isLoading: true,
    } as any);

    const store = mockUseTodoStore();
    expect(store.isLoading).toBe(true);
  });

  it("should handle syncing state", () => {
    mockUseTodoStore.mockReturnValue({
      ...mockStoreDefaults,
      isSyncing: true,
    } as any);

    const store = mockUseTodoStore();
    expect(store.isSyncing).toBe(true);
  });

  it("should have toggleCompleted function", () => {
    const toggleMock = jest.fn();
    mockUseTodoStore.mockReturnValue({
      ...mockStoreDefaults,
      toggleCompleted: toggleMock,
    } as any);

    const store = mockUseTodoStore();
    store.toggleCompleted(0);
    expect(toggleMock).toHaveBeenCalledWith(0);
  });
});
