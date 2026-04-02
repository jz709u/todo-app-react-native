import Todo from "@/model/Todo";
import { shouldSyncTodo } from "./recurrence";

const API_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ANON_KEY}`,
  apikey: ANON_KEY!,
};

function mapDbToTodo(item: any): Todo {
  return {
    id: item.id,
    text: item.text,
    isCompleted: item.is_completed,
    updatedAt: item.updated_at ? new Date(item.updated_at).getTime() : undefined,
    dueDate: item.due_date || undefined,
    priority: item.priority || 'medium',
    recurrence: item.recurrence_type ? {
      type: item.recurrence_type as 'daily' | 'weekly' | 'monthly',
      endDate: item.recurrence_end_date || undefined,
    } : undefined,
    isHabit: item.is_habit || false,
    habitStreak: item.habit_streak || 0,
    lastCompletedDate: item.last_completed_date || undefined,
    createdDate: item.created_date || undefined,
  };
}

function mapTodoToDb(todo: Todo, userId: string) {
  return {
    id: todo.id,
    user_id: userId,
    text: todo.text,
    is_completed: todo.isCompleted,
    updated_at: new Date(todo.updatedAt || Date.now()).toISOString(),
    due_date: todo.dueDate || null,
    priority: todo.priority || 'medium',
    recurrence_type: todo.recurrence?.type || null,
    recurrence_end_date: todo.recurrence?.endDate || null,
    is_habit: todo.isHabit || false,
    habit_streak: todo.habitStreak || 0,
    last_completed_date: todo.lastCompletedDate || null,
    created_date: todo.createdDate || null,
  };
}

export async function getTodos(userId: string): Promise<Todo[]> {
  const query = new URLSearchParams({
    user_id: `eq.${userId}`,
    order: "created_at.asc",
  });

  const response = await fetch(`${API_URL}/rest/v1/todos?${query}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) throw new Error("Failed to fetch todos");
  const data = await response.json();

  return data.map(mapDbToTodo);
}

export async function syncTodos(
  userId: string,
  todos: Todo[],
): Promise<Todo[]> {
  // Only sync parent tasks, not recurring instances
  const todosToSync = todos.filter(shouldSyncTodo);

  if (todosToSync.length > 0) {
    const todosToUpsert = todosToSync.map((todo) => mapTodoToDb(todo, userId));

    const response = await fetch(
      `${API_URL}/rest/v1/todos?on_conflict=id`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(todosToUpsert),
      },
    );

    if (!response.ok) throw new Error("Failed to upsert todos");
  }

  // Fetch all remote todos to get latest state
  const remoteTodos = await getTodos(userId);
  return remoteTodos;
}
