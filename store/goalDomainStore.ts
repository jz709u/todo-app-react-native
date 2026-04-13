import { create } from "zustand";

import {
  getOrCreateDomainUserId,
  hydrateGoalDomain,
  syncAllGoalDomains,
  syncGoalDomainGraph,
} from "@/lib/domainSync";

interface GoalDomainStore {
  userId: string | null;
  isInitializing: boolean;
  isSyncing: boolean;
  hasInitialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  syncGoalDomain: (goalId: string) => Promise<void>;
  syncAllGoals: () => Promise<void>;
  clearError: () => void;
}

export const useGoalDomainStore = create<GoalDomainStore>((set, get) => ({
  userId: null,
  isInitializing: false,
  isSyncing: false,
  hasInitialized: false,
  error: null,

  initialize: async () => {
    if (get().isInitializing || get().hasInitialized) {
      return;
    }

    set({ isInitializing: true, error: null });

    try {
      const userId = await getOrCreateDomainUserId();
      await hydrateGoalDomain(userId);
      set({
        userId,
        hasInitialized: true,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize the goals workspace.",
      });
    } finally {
      set({ isInitializing: false });
    }
  },

  syncGoalDomain: async (goalId) => {
    set({ isSyncing: true, error: null });

    try {
      const userId = get().userId ?? (await getOrCreateDomainUserId());
      await syncGoalDomainGraph(goalId, userId);
      set({ userId, hasInitialized: true });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync this goal.",
      });
      throw error;
    } finally {
      set({ isSyncing: false });
    }
  },

  syncAllGoals: async () => {
    set({ isSyncing: true, error: null });

    try {
      const userId = get().userId ?? (await getOrCreateDomainUserId());
      await syncAllGoalDomains(userId);
      set({ userId, hasInitialized: true });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync goals.",
      });
      throw error;
    } finally {
      set({ isSyncing: false });
    }
  },

  clearError: () => set({ error: null }),
}));
