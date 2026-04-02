import Todo from "@/model/Todo";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateStreak(
  completedDates: number[],
  today: number = Date.now(),
): number {
  if (completedDates.length === 0) return 0;

  const todayDate = getDateOnly(today);
  const sortedDates = completedDates.map(getDateOnly).sort((a, b) => b - a);

  // Check if completed today or yesterday (allow grace period)
  const mostRecentDate = sortedDates[0];
  if (
    mostRecentDate !== todayDate &&
    mostRecentDate !== todayDate - MS_PER_DAY
  ) {
    return 0; // Streak broken
  }

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const expectedDate = sortedDates[i - 1] - MS_PER_DAY;
    if (sortedDates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getDateOnly(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function isCompletedToday(lastCompletedDate?: number): boolean {
  if (!lastCompletedDate) return false;
  return getDateOnly(lastCompletedDate) === getDateOnly(Date.now());
}

export function isCompletedYesterday(lastCompletedDate?: number): boolean {
  if (!lastCompletedDate) return false;
  const yesterday = getDateOnly(Date.now()) - 24 * 60 * 60 * 1000;
  return getDateOnly(lastCompletedDate) === yesterday;
}

export function getHabitStats(habitTodos: Todo[]): {
  totalHabits: number;
  activeStreaks: number;
  totalStreak: number;
} {
  let totalStreak = 0;
  let activeStreaks = 0;

  for (const todo of habitTodos) {
    if (todo.habitStreak && todo.habitStreak > 0) {
      totalStreak += todo.habitStreak;
      activeStreaks++;
    }
  }

  return {
    totalHabits: habitTodos.length,
    activeStreaks,
    totalStreak,
  };
}
