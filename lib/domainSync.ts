import {
  getGoals,
  hydrateGoalsFromRemote,
  syncGoalRepository,
} from "@/lib/repositories/goalRepository";
import {
  hydratePlansFromRemote,
  syncPlanRepository,
} from "@/lib/repositories/planRepository";
import {
  hydrateTasksFromRemote,
  syncTaskRepository,
} from "@/lib/repositories/taskRepository";
import { supabase } from "@/lib/supabase";

export async function getOrCreateDomainUserId() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user.id) {
    return session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw error;
  }

  const userId = data.session?.user.id;
  if (!userId) {
    throw new Error("Failed to resolve a Supabase user session");
  }

  return userId;
}

export async function hydrateGoalDomain(userId: string) {
  const goals = await hydrateGoalsFromRemote(userId);

  for (const goal of goals) {
    await hydratePlansFromRemote(goal.id);
    await hydrateTasksFromRemote(goal.id);
  }

  return goals;
}

export async function syncGoalDomainGraph(goalId: string, userId: string) {
  await syncGoalRepository(userId);
  await syncPlanRepository(goalId);
  await syncTaskRepository(goalId);
}

export async function syncAllGoalDomains(userId: string) {
  await syncGoalRepository(userId);

  for (const goal of getGoals()) {
    await syncPlanRepository(goal.id);
    await syncTaskRepository(goal.id);
  }
}
