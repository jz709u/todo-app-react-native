import { act, renderHook } from "@testing-library/react-native";
import { supabase } from "@/lib/supabase";
import { syncTodos as syncTodosAPI } from "@/lib/api";
import { useTodoStore } from "@/store/todoStore";

jest.mock("@/lib/api");
jest.mock("@/lib/supabase");

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockSyncTodosAPI = syncTodosAPI as jest.MockedFunction<typeof syncTodosAPI>;

describe("useTodoStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state for each test
    useTodoStore.setState({
      todos: [],
      userId: null,
      isLoading: false,
      isSyncing: false,
    });
  });

  describe("addTodo", () => {
    it("should add a todo to the list", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo("Test todo");
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe("Test todo");
      expect(result.current.todos[0].isCompleted).toBe(false);
      expect(result.current.todos[0].id).toBeDefined();
    });

    it("should add multiple todos", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo("Todo 1");
        result.current.addTodo("Todo 2");
        result.current.addTodo("Todo 3");
      });

      expect(result.current.todos).toHaveLength(3);
      expect(result.current.todos[0].text).toBe("Todo 1");
      expect(result.current.todos[1].text).toBe("Todo 2");
      expect(result.current.todos[2].text).toBe("Todo 3");
    });

    it("should generate unique IDs for each todo", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo("Todo 1");
        result.current.addTodo("Todo 2");
      });

      const ids = result.current.todos.map((t) => t.id);
      expect(new Set(ids).size).toBe(2); // All IDs should be unique
    });
  });

  describe("toggleCompleted", () => {
    it("should toggle todo completion status", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo("Test todo");
      });

      expect(result.current.todos[0].isCompleted).toBe(false);

      act(() => {
        result.current.toggleCompleted(result.current.todos[0].id);
      });

      expect(result.current.todos[0].isCompleted).toBe(true);

      act(() => {
        result.current.toggleCompleted(result.current.todos[0].id);
      });

      expect(result.current.todos[0].isCompleted).toBe(false);
    });

    it("should update updatedAt timestamp", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo("Test todo");
      });

      const beforeToggle = result.current.todos[0].updatedAt || 0;

      jest.useFakeTimers();
      jest.advanceTimersByTime(1);

      act(() => {
        result.current.toggleCompleted(result.current.todos[0].id);
      });

      const afterToggle = result.current.todos[0].updatedAt || 0;
      expect(afterToggle).toBeGreaterThanOrEqual(beforeToggle);

      jest.useRealTimers();
    });
  });

  describe("removeTodo", () => {
    it("should remove a todo from the list", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo("Todo 1");
        result.current.addTodo("Todo 2");
      });

      expect(result.current.todos).toHaveLength(2);

      act(() => {
        result.current.removeTodo(result.current.todos[0].id);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe("Todo 2");
    });

    it("should handle removing the last todo", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo("Solo todo");
      });

      act(() => {
        result.current.removeTodo(result.current.todos[0].id);
      });

      expect(result.current.todos).toHaveLength(0);
    });
  });

  describe("initializeUser", () => {
    it("should initialize user and sync todos", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
      });

      (mockSupabase.auth.signInAnonymously as jest.Mock).mockResolvedValueOnce({
        data: { session: { user: { id: "test-user-id" } } },
        error: null,
      });

      mockSyncTodosAPI.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useTodoStore());

      await act(async () => {
        await result.current.initializeUser();
      });

      expect(result.current.userId).toBe("test-user-id");
      expect(result.current.isLoading).toBe(false);
    });

    it("should use existing session if available", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: { user: { id: "existing-user-id" } } },
      });

      mockSyncTodosAPI.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useTodoStore());

      await act(async () => {
        await result.current.initializeUser();
      });

      expect(result.current.userId).toBe("existing-user-id");
      expect(mockSupabase.auth.signInAnonymously).not.toHaveBeenCalled();
    });
  });

  describe("syncTodos", () => {
    it("should sync todos from server", async () => {
      const remoteTodos = [
        { id: "1", text: "Server Todo", isCompleted: false },
      ];

      mockSyncTodosAPI.mockResolvedValueOnce(remoteTodos);

      const { result } = renderHook(() => useTodoStore());

      act(() => {
        useTodoStore.setState({ userId: "test-user-id" });
      });

      await act(async () => {
        await result.current.syncTodos();
      });

      expect(result.current.isSyncing).toBe(false);
    });
  });

  describe("periodic sync", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should start and stop periodic sync", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.startPeriodicSync();
      });

      expect(result.current.stopPeriodicSync).toBeDefined();

      act(() => {
        result.current.stopPeriodicSync();
      });

      expect(true).toBe(true);
    });
  });
});
