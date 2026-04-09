import { RecurrenceType } from "@/components/recurrence-selector.component";
import Todo from "@/model/Todo";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function expandRecurringTasks(
  todos: Todo[],
  daysAhead: number = 30,
): Todo[] {
  const expanded: Todo[] = [];
  const now = Date.now();
  const endTime = now + daysAhead * MS_PER_DAY;

  for (const todo of todos) {
    expanded.push(todo);

    if (!todo.recurrence?.type) continue;

    const startDate = todo.dueDate || now;
    const recurrenceEnd = todo.recurrence.endDate || endTime;

    let currentDate = startDate;
    let instanceIndex = 0;

    while (currentDate <= recurrenceEnd && currentDate <= endTime) {
      const nextDate = getNextRecurrenceDate(currentDate, todo.recurrence.type);
      if (nextDate <= currentDate) break;

      currentDate = nextDate;
      instanceIndex++;

      if (currentDate > recurrenceEnd) break;

      expanded.push({
        ...todo,
        id: `${todo.id}_instance_${instanceIndex}`,
        dueDate: currentDate,
        recurrence: undefined,
        isHabit: false,
      });
    }
  }

  return expanded;
}

function getNextRecurrenceDate(
  currentDate: number,
  type: RecurrenceType,
): number {
  const date = new Date(currentDate);

  switch (type) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
  }

  return date.getTime();
}

export function isRecurringInstance(todoId: string): boolean {
  return todoId.includes("_instance_");
}

export function getParentTodoId(instanceId: string): string {
  return instanceId.split("_instance_")[0];
}

export function shouldSyncTodo(todo: Todo): boolean {
  // Don't sync recurring instances, only parent tasks
  return !isRecurringInstance(todo.id);
}
