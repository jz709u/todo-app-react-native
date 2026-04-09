export type PlanStatus =
  | "draft"
  | "awaiting_approval"
  | "approved"
  | "superseded";

export default interface Plan {
  id: string;
  goalId: string;
  status: PlanStatus;
  summary: string;
  assumptions: string[];
  risks: string[];
  version: number;
  createdAt: number;
  updatedAt: number;
}
