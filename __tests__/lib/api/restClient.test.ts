import { beforeEach, describe, expect, jest, it } from "@jest/globals";

import { supabase } from "@/lib/supabase";
import { restSelect, restUpsert } from "@/lib/api/restClient";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("restClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it("uses the session access token when available", async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: {
        session: {
          access_token: "session-token",
        },
      },
    });

    await restSelect("goals", new URLSearchParams({ order: "created_at.asc" }));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rest/v1/goals?"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer session-token",
        }),
      }),
    );
  });

  it("falls back to the anon key when no session exists", async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: {
        session: null,
      },
    });

    await restUpsert("goals", []);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rest/v1/goals?on_conflict=id"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        }),
      }),
    );
  });
});
