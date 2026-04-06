import {
  handleSiriTodoUrl,
  parseSiriTodoUrl,
  resetHandledSiriTodoUrlsForTests,
} from "@/lib/siri-todo-link";
import { useTodoStore } from "@/store/todoStore";

describe("siri todo links", () => {
  beforeEach(() => {
    resetHandledSiriTodoUrlsForTests();
    useTodoStore.setState({
      todos: [],
      userId: null,
      isLoading: false,
      isSyncing: false,
      hasHydrated: true,
    });
  });

  it("parses supported create-todo links", () => {
    expect(
      parseSiriTodoUrl(
        "todoapp://create-todo?title=Buy%20milk&priority=high&dueDate=1735689600000",
      ),
    ).toEqual({
      text: "Buy milk",
      priority: "high",
      dueDate: 1735689600000,
    });
  });

  it("ignores unrelated deep links", () => {
    expect(parseSiriTodoUrl("todoapp://calendar-screen")).toBeNull();
  });

  it("adds a todo once for a valid siri link", async () => {
    await handleSiriTodoUrl("todoapp://siri-create-todo?title=Call%20mom");
    await handleSiriTodoUrl("todoapp://siri-create-todo?title=Call%20mom");

    expect(useTodoStore.getState().todos).toHaveLength(1);
    expect(useTodoStore.getState().todos[0].text).toBe("Call mom");
  });
});
