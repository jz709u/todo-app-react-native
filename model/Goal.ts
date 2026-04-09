export type GoalStatus =
  | "draft"
  | "planning"
  | "active"
  | "blocked"
  | "completed"
  | "archived";

export type GoalEffortLevel = "light" | "moderate" | "aggressive";

export interface GoalConstraints {
  budget?: string;
  effortLevel?: GoalEffortLevel;
  tools?: string[];
  notes?: string;
}

export default interface Goal {
  id: string;
  title: string;
  abstractGoal: string;
  status: GoalStatus;
  constraints: GoalConstraints;
  targetDate?: number;
  activePlanId?: string;
  createdAt: number;
  updatedAt: number;
}
