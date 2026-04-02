import Todo from "@/model/Todo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { getTodos, syncTodos } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";

interface TodoStore {
  todos: Todo[];
  userId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  initializeUser: () => Promise<void>;
  addTodo: (text: string) => void;
  toggleCompleted: (index: number) => void;
  removeTodo: (index: number) => void;
  syncTodos: () => Promise<void>;
  startPeriodicSync: () => void;
  stopPeriodicSync: () => void;
}

let syncInterval: ReturnType<typeof setInterval> | null = null;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes - adjust this to change sync frequency

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [],
      userId: null,
      isLoading: false,
      isSyncing: false,

      initializeUser: async () => {
        set({ isLoading: true });
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            // Sign in anonymously
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;
            set({ userId: data.session?.user.id || null });
          } else {
            set({ userId: session.user.id });
          }

          // Fetch todos after user is set
          await get().syncTodos();
          // Start periodic sync every 30 seconds
          get().startPeriodicSync();
        } catch (error) {
          console.error("Failed to initialize user:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Just update local state - no API calls
      addTodo: (text: string) => {
        set((state) => ({
          todos: [
            ...state.todos,
            { id: uuidv4(), isCompleted: false, text, updatedAt: Date.now() },
          ],
        }));
      },

      // Just update local state - no API calls
      toggleCompleted: (index: number) => {
        set((state) => ({
          todos: state.todos.map((todo, i) =>
            i === index
              ? { ...todo, isCompleted: !todo.isCompleted, updatedAt: Date.now() }
              : todo,
          ),
        }));
      },

      // Just update local state - no API calls
      removeTodo: (index: number) => {
        set((state) => ({
          todos: state.todos.filter((_, i) => i !== index),
        }));
      },

      syncTodos: async () => {
        const userId = get().userId;
        if (!userId) return;

        set({ isSyncing: true });
        try {
          // Upsert local todos and get remote state
          const remoteTodos = await syncTodos(userId, get().todos);

          // Merge: use remote todos, but keep local todos that don't exist on server
          const localIds = new Set(get().todos.map((t) => t.id));
          const remoteIds = new Set(remoteTodos.map((t) => t.id));
          const localOnly = get().todos.filter((t) => !remoteIds.has(t.id));

          const merged = [...remoteTodos, ...localOnly];
          set({ todos: merged });
        } catch (error) {
          console.error("Failed to sync todos:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      startPeriodicSync: () => {
        if (syncInterval) return; // Already running

        // Sync on interval
        syncInterval = setInterval(() => {
          get().syncTodos();
        }, SYNC_INTERVAL_MS);
      },

      stopPeriodicSync: () => {
        if (syncInterval) {
          clearInterval(syncInterval);
          syncInterval = null;
        }
      },
    }),
    {
      name: "todo-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
