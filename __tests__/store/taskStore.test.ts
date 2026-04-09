import { useTaskStore } from "@/store/taskStore";

describe("useTaskStore", () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasksById: {},
      taskOrder: [],
    });
  });

  it("creates a task and returns its id", () => {
    const store = useTaskStore.getState();

    const taskId = store.createTask({
      goalId: "goal-1",
      title: "Book flights",
      priority: "high",
    });

    const task = useTaskStore.getState().getTaskById(taskId);
    expect(task?.goalId).toBe("goal-1");
    expect(task?.priority).toBe("high");
    expect(task?.status).toBe("todo");
  });

  it("updates task status and sets completion timestamp when done", () => {
    const store = useTaskStore.getState();
    const taskId = store.createTask({
      goalId: "goal-1",
      title: "Finalize itinerary",
    });

    store.setTaskStatus(taskId, "doing");
    expect(useTaskStore.getState().getTaskById(taskId)?.status).toBe("doing");

    store.setTaskStatus(taskId, "done");
    const task = useTaskStore.getState().getTaskById(taskId);
    expect(task?.status).toBe("done");
    expect(task?.completedAt).toBeDefined();
  });

  it("clears completion timestamp when task moves out of done", () => {
    const store = useTaskStore.getState();
    const taskId = store.createTask({
      goalId: "goal-1",
      title: "Pack bags",
      status: "done",
    });

    expect(useTaskStore.getState().getTaskById(taskId)?.completedAt).toBeDefined();

    store.updateTask(taskId, { status: "todo" });

    expect(useTaskStore.getState().getTaskById(taskId)?.completedAt).toBeUndefined();
  });

  it("returns tasks filtered by goal id and removes tasks cleanly", () => {
    const store = useTaskStore.getState();
    const firstTaskId = store.createTask({
      goalId: "goal-1",
      title: "Task A",
    });
    store.createTask({
      goalId: "goal-2",
      title: "Task B",
    });

    expect(useTaskStore.getState().getTasksByGoalId("goal-1")).toHaveLength(1);

    store.removeTask(firstTaskId);

    expect(useTaskStore.getState().getTaskById(firstTaskId)).toBeUndefined();
    expect(useTaskStore.getState().getTasks()).toHaveLength(1);
  });
});
