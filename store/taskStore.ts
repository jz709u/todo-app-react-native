import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import Task, { TaskPriority, TaskStatus } from "@/model/Task";

interface CreateTaskInput {
  goalId: string;
  title: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  planStepId?: string;
  dueDate?: number;
  scheduledStart?: number;
  scheduledEnd?: number;
}

interface TaskStore {
  tasksById: Record<string, Task>;
  taskOrder: string[];

  createTask: (input: CreateTaskInput) => string;
  upsertTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  getTaskById: (taskId: string) => Task | undefined;
  getTasks: () => Task[];
  getTasksByGoalId: (goalId: string) => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasksById: {},
      taskOrder: [],

      createTask: (input) => {
        const taskId = nanoid();
        const timestamp = Date.now();
        const task: Task = {
          id: taskId,
          goalId: input.goalId,
          title: input.title,
          priority: input.priority ?? "medium",
          status: input.status ?? "todo",
          planStepId: input.planStepId,
          dueDate: input.dueDate,
          scheduledStart: input.scheduledStart,
          scheduledEnd: input.scheduledEnd,
          completedAt: input.status === "done" ? timestamp : undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          tasksById: {
            ...state.tasksById,
            [taskId]: task,
          },
          taskOrder: [...state.taskOrder, taskId],
        }));

        return taskId;
      },

      upsertTask: (task) => {
        set((state) => ({
          tasksById: {
            ...state.tasksById,
            [task.id]: task,
          },
          taskOrder: state.taskOrder.includes(task.id)
            ? state.taskOrder
            : [...state.taskOrder, task.id],
        }));
      },

      updateTask: (taskId, updates) => {
        const currentTask = get().tasksById[taskId];
        if (!currentTask) return;

        set((state) => ({
          tasksById: {
            ...state.tasksById,
            [taskId]: {
              ...currentTask,
              ...updates,
              completedAt:
                updates.status === "done"
                  ? updates.completedAt ?? Date.now()
                  : updates.status && updates.status !== "done"
                    ? undefined
                    : currentTask.completedAt,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      removeTask: (taskId) => {
        set((state) => {
          const { [taskId]: _removedTask, ...remainingTasks } = state.tasksById;

          return {
            tasksById: remainingTasks,
            taskOrder: state.taskOrder.filter((id) => id !== taskId),
          };
        });
      },

      setTaskStatus: (taskId, status) => {
        get().updateTask(taskId, { status });
      },

      getTaskById: (taskId) => get().tasksById[taskId],

      getTasks: () =>
        get()
          .taskOrder.map((taskId) => get().tasksById[taskId])
          .filter((task): task is Task => Boolean(task)),

      getTasksByGoalId: (goalId) =>
        get()
          .taskOrder.map((taskId) => get().tasksById[taskId])
          .filter((task): task is Task => Boolean(task))
          .filter((task) => task.goalId === goalId),
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
