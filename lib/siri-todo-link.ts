import { useTodoStore } from "@/store/todoStore";

type SiriTodoPayload = {
  text: string;
  priority?: "low" | "medium" | "high";
  dueDate?: number;
};

const SUPPORTED_HOSTS = new Set(["create-todo", "siri-create-todo"]);
const handledUrls = new Set<string>();

function normalizePriority(
  value: string | null,
): SiriTodoPayload["priority"] | undefined {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

function normalizeDueDate(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const timestamp = Number(value);
  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function parseSiriTodoUrl(url: string): SiriTodoPayload | null {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const action =
    parsedUrl.hostname || parsedUrl.pathname.replace(/^\/+/, "").split("/")[0];

  if (!SUPPORTED_HOSTS.has(action)) {
    return null;
  }

  const text = parsedUrl.searchParams.get("title")?.trim();
  if (!text) {
    return null;
  }

  return {
    text,
    priority: normalizePriority(parsedUrl.searchParams.get("priority")),
    dueDate: normalizeDueDate(parsedUrl.searchParams.get("dueDate")),
  };
}

export async function handleSiriTodoUrl(url: string): Promise<boolean> {
  const payload = parseSiriTodoUrl(url);
  if (!payload || handledUrls.has(url)) {
    return false;
  }

  handledUrls.add(url);

  const store = useTodoStore.getState();
  await store.waitForHydration();
  useTodoStore.getState().addTodo(payload.text, {
    priority: payload.priority,
    dueDate: payload.dueDate,
  });

  return true;
}

export function resetHandledSiriTodoUrlsForTests() {
  handledUrls.clear();
}
