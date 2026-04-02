export default interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
  updatedAt?: number;

  // Phase 1: Due Dates & Scheduling
  dueDate?: number; // Unix timestamp for due date

  // Phase 1: Priority
  priority?: 'low' | 'medium' | 'high';

  // Phase 1: Recurring Tasks
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | null;
    endDate?: number; // Optional end date for recurrence
  };

  // Phase 1: Habit Tracking
  isHabit?: boolean;
  habitStreak?: number;
  lastCompletedDate?: number; // Unix timestamp of last completion
  createdDate?: number; // Unix timestamp of creation
}
