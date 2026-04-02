import Todo from "@/model/Todo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { getTodos, syncTodos } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";
import { expandRecurringTasks } from "@/lib/recurrence";

interface TodoStore {
  todos: Todo[];
  userId: string | null;
  isLoading: boolean;
  isSyncing: boolean;

  initializeUser: () => Promise<void>;
  addTodo: (text: string, options?: {
    dueDate?: number;
    priority?: 'low' | 'medium' | 'high';
    isHabit?: boolean;
    recurrence?: {
      type: 'daily' | 'weekly' | 'monthly' | null;
      endDate?: number;
    };
  }) => void;
  toggleCompleted: (index: number) => void;
  removeTodo: (index: number) => void;
  updateTodo: (index: number, updates: Partial<Todo>) => void;

  // Due date filtering
  getTodosByDate: (timestamp: number) => Todo[];
  getUpcomingTodos: (days?: number) => Todo[];

  // Priority filtering
  filterByPriority: (priority: 'low' | 'medium' | 'high') => Todo[];

  // Habit tracking
  getHabits: () => Todo[];
  updateHabitStreak: (index: number) => void;

  syncTodos: () => Promise<void>;
  startPeriodicSync: () => void;
  stopPeriodicSync: () => void;
}

let syncInterval: ReturnType<typeof setInterval> | null = null;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

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
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;
            set({ userId: data.session?.user.id || null });
          } else {
            set({ userId: session.user.id });
          }

          await get().syncTodos();
          get().startPeriodicSync();
        } catch (error) {
          console.error("Failed to initialize user:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addTodo: (text: string, options = {}) => {
        set((state) => {
          const newTodo: Todo = {
            id: uuidv4(),
            text,
            isCompleted: false,
            updatedAt: Date.now(),
            dueDate: options.dueDate,
            priority: options.priority || 'medium',
            isHabit: options.isHabit || false,
            recurrence: options.recurrence,
            createdDate: Date.now(),
          };

          return {
            todos: [...state.todos, newTodo],
          };
        });
      },

      toggleCompleted: (index: number) => {
        set((state) => ({
          todos: state.todos.map((todo, i) =>
            i === index
              ? {
                  ...todo,
                  isCompleted: !todo.isCompleted,
                  updatedAt: Date.now(),
                  lastCompletedDate: !todo.isCompleted ? Date.now() : todo.lastCompletedDate,
                  habitStreak: !todo.isCompleted && todo.isHabit ? (todo.habitStreak || 0) + 1 : 0,
                }
              : todo,
          ),
        }));
      },

      removeTodo: (index: number) => {
        set((state) => ({
          todos: state.todos.filter((_, i) => i !== index),
        }));
      },

      updateTodo: (index: number, updates: Partial<Todo>) => {
        set((state) => ({
          todos: state.todos.map((todo, i) =>
            i === index
              ? { ...todo, ...updates, updatedAt: Date.now() }
              : todo,
          ),
        }));
      },

      getTodosByDate: (timestamp: number) => {
        const targetDate = new Date(timestamp);
        targetDate.setHours(0, 0, 0, 0);
        const targetTime = targetDate.getTime();

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayTime = nextDay.getTime();

        return get().todos
          .filter(
            (todo) =>
              todo.dueDate &&
              todo.dueDate >= targetTime &&
              todo.dueDate < nextDayTime,
          )
          .sort((a, b) => (a.priority === 'high' ? -1 : 1));
      },

      getUpcomingTodos: (days = 7) => {
        const now = Date.now();
        const endTime = now + days * 24 * 60 * 60 * 1000;

        const expanded = expandRecurringTasks(get().todos, days);

        return expanded
          .filter((todo) => {
            if (!todo.dueDate) return false;
            return todo.dueDate >= now && todo.dueDate <= endTime;
          })
          .sort((a, b) => {
            if (a.dueDate && b.dueDate) {
              if (a.dueDate !== b.dueDate) return a.dueDate - b.dueDate;
            }
            return (a.priority === 'high' ? -1 : 1);
          });
      },

      filterByPriority: (priority: 'low' | 'medium' | 'high') => {
        return get().todos.filter((todo) => (todo.priority || 'medium') === priority);
      },

      getHabits: () => {
        return get().todos.filter((todo) => todo.isHabit);
      },

      updateHabitStreak: (index: number) => {
        get().toggleCompleted(index);
      },

      syncTodos: async () => {
        const userId = get().userId;
        if (!userId) return;

        set({ isSyncing: true });
        try {
          const expanded = expandRecurringTasks(get().todos);
          const remoteTodos = await syncTodos(userId, expanded);

          const localIds = new Set(get().todos.map((t) => t.id));
          const remoteIds = new Set(remoteTodos.map((t) => t.id));
          const localOnly = get().todos.filter((t) => !remoteIds.has(t.id));

          set({
            todos: [...remoteTodos, ...localOnly],
          });
        } catch (error) {
          console.error("Failed to sync todos:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      startPeriodicSync: () => {
        if (syncInterval) return;

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
