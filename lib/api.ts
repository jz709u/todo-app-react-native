import Todo from "@/model/Todo";

const API_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ANON_KEY}`,
  apikey: ANON_KEY!,
};

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

  return data.map((item: any) => ({
    id: item.id,
    isCompleted: item.is_completed,
    text: item.text,
    updatedAt: new Date(item.updated_at).getTime(),
  }));
}

export async function syncTodos(
  userId: string,
  todos: Todo[],
): Promise<Todo[]> {
  // Upsert all local todos to server (insert or update if id exists)
  if (todos.length > 0) {
    const todosToUpsert = todos.map((todo) => ({
      id: todo.id,
      user_id: userId,
      text: todo.text,
      is_completed: todo.isCompleted,
      updated_at: new Date(todo.updatedAt || Date.now()).toISOString(),
    }));

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
