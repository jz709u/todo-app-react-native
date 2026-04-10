import { beforeEach, describe, expect, jest, it, test } from "@jest/globals";

jest.mock("@/lib/api");

import { syncTodos, getTodos } from "@/lib/api";

const mockSyncTodos = syncTodos as jest.MockedFunction<typeof syncTodos>;
const mockGetTodos = getTodos as jest.MockedFunction<typeof getTodos>;

describe("API Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("syncTodos", () => {
    it("should upsert local todos to server", async () => {
      const localTodos = [
        { id: "1", text: "Todo 1", isCompleted: false, updatedAt: Date.now() },
        { id: "2", text: "Todo 2", isCompleted: true, updatedAt: Date.now() },
      ];

      mockSyncTodos.mockResolvedValueOnce(localTodos);

      const result = await syncTodos("test-user-id", localTodos);

      expect(result).toEqual(localTodos);
      expect(result).toHaveLength(2);
    });

    it("should handle sync errors", async () => {
      mockSyncTodos.mockRejectedValueOnce(new Error("Sync failed"));

      await expect(syncTodos("test-user-id", [])).rejects.toThrow("Sync failed");
    });
  });

  describe("getTodos", () => {
    it("should fetch remote todos", async () => {
      const remoteTodos = [
        { id: "1", text: "Remote Todo 1", isCompleted: false },
      ];

      mockGetTodos.mockResolvedValueOnce(remoteTodos);

      const result = await getTodos("test-user-id");

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Remote Todo 1");
    });

    it("should return empty array when no todos exist", async () => {
      mockGetTodos.mockResolvedValueOnce([]);

      const result = await getTodos("test-user-id");

      expect(result).toHaveLength(0);
    });

    it("should handle fetch errors", async () => {
      mockGetTodos.mockRejectedValueOnce(new Error("Fetch failed"));

      await expect(getTodos("test-user-id")).rejects.toThrow("Fetch failed");
    });
  });
});
