import Task from "@/model/Task";
import { mapTaskRowToTask, mapTaskToTaskRow, TaskRow } from "@/lib/mappers/taskMappers";
import { restSelect, restUpsert } from "@/lib/api/restClient";

export async function getTasks(goalId: string): Promise<Task[]> {
  const query = new URLSearchParams({
    goal_id: `eq.${goalId}`,
    order: "created_at.asc",
  });

  const rows = await restSelect<TaskRow[]>("tasks", query);
  return rows.map(mapTaskRowToTask);
}

export async function syncTasks(tasks: Task[]): Promise<void> {
  if (tasks.length > 0) {
    await restUpsert("tasks", tasks.map(mapTaskToTaskRow));
  }
}
