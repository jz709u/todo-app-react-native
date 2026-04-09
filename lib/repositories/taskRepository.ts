import Task, { TaskPriority, TaskStatus } from "@/model/Task";
import { getTasks as fetchTasks, syncTasks as pushTasks } from "@/lib/api/tasks";
import { useTaskStore } from "@/store/taskStore";

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

export function createTask(input: CreateTaskInput) {
  return useTaskStore.getState().createTask(input);
}

export function updateTask(taskId: string, updates: Partial<Task>) {
  useTaskStore.getState().updateTask(taskId, updates);
}

export function getTaskById(taskId: string) {
  return useTaskStore.getState().tasksById[taskId];
}

export function getTasksByGoalId(goalId: string) {
  const { taskOrder, tasksById } = useTaskStore.getState();

  return taskOrder
    .map((taskId) => tasksById[taskId])
    .filter((task): task is Task => Boolean(task))
    .filter((task) => task.goalId === goalId);
}

export function getTasks() {
  const { taskOrder, tasksById } = useTaskStore.getState();

  return taskOrder
    .map((taskId) => tasksById[taskId])
    .filter((task): task is Task => Boolean(task));
}

export async function syncTaskRepository(goalId: string) {
  await pushTasks(getTasksByGoalId(goalId));
}

export async function hydrateTasksFromRemote(goalId: string) {
  const tasks = await fetchTasks(goalId);
  tasks.forEach((task) => useTaskStore.getState().upsertTask(task));
  return tasks;
}
