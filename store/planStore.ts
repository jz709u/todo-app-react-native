import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import Plan, { PlanStatus } from "@/model/Plan";
import PlanStep, { StepApprovalState, StepStatus } from "@/model/PlanStep";

interface CreatePlanInput {
  goalId: string;
  summary: string;
  assumptions?: string[];
  risks?: string[];
  status?: PlanStatus;
  version?: number;
}

interface CreatePlanStepInput {
  planId: string;
  title: string;
  order: number;
  description?: string;
  dependsOnStepIds?: string[];
  estimatedMinutes?: number;
  suggestedDueDate?: number;
  status?: StepStatus;
  approvalState?: StepApprovalState;
}

interface PlanStore {
  plansById: Record<string, Plan>;
  planOrder: string[];
  planStepsById: Record<string, PlanStep>;
  planStepOrderByPlanId: Record<string, string[]>;

  createPlan: (input: CreatePlanInput) => string;
  upsertPlan: (plan: Plan) => void;
  updatePlan: (planId: string, updates: Partial<Plan>) => void;
  removePlan: (planId: string) => void;
  getPlanById: (planId: string) => Plan | undefined;
  getPlansByGoalId: (goalId: string) => Plan[];

  createPlanStep: (input: CreatePlanStepInput) => string;
  upsertPlanStep: (step: PlanStep) => void;
  updatePlanStep: (stepId: string, updates: Partial<PlanStep>) => void;
  removePlanStep: (stepId: string) => void;
  getPlanStepById: (stepId: string) => PlanStep | undefined;
  getPlanSteps: (planId: string) => PlanStep[];
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plansById: {},
      planOrder: [],
      planStepsById: {},
      planStepOrderByPlanId: {},

      createPlan: (input) => {
        const planId = nanoid();
        const timestamp = Date.now();
        const plan: Plan = {
          id: planId,
          goalId: input.goalId,
          summary: input.summary,
          assumptions: input.assumptions ?? [],
          risks: input.risks ?? [],
          status: input.status ?? "draft",
          version: input.version ?? 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          plansById: {
            ...state.plansById,
            [planId]: plan,
          },
          planOrder: [...state.planOrder, planId],
        }));

        return planId;
      },

      upsertPlan: (plan) => {
        set((state) => ({
          plansById: {
            ...state.plansById,
            [plan.id]: plan,
          },
          planOrder: state.planOrder.includes(plan.id)
            ? state.planOrder
            : [...state.planOrder, plan.id],
        }));
      },

      updatePlan: (planId, updates) => {
        const currentPlan = get().plansById[planId];
        if (!currentPlan) return;

        set((state) => ({
          plansById: {
            ...state.plansById,
            [planId]: {
              ...currentPlan,
              ...updates,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      removePlan: (planId) => {
        const stepIds = get().planStepOrderByPlanId[planId] ?? [];

        set((state) => {
          const { [planId]: _removedPlan, ...remainingPlans } = state.plansById;
          const { [planId]: _removedStepOrder, ...remainingStepOrder } =
            state.planStepOrderByPlanId;
          const remainingSteps = { ...state.planStepsById };

          stepIds.forEach((stepId) => {
            delete remainingSteps[stepId];
          });

          return {
            plansById: remainingPlans,
            planOrder: state.planOrder.filter((id) => id !== planId),
            planStepsById: remainingSteps,
            planStepOrderByPlanId: remainingStepOrder,
          };
        });
      },

      getPlanById: (planId) => get().plansById[planId],

      getPlansByGoalId: (goalId) =>
        get()
          .planOrder.map((planId) => get().plansById[planId])
          .filter((plan): plan is Plan => Boolean(plan))
          .filter((plan) => plan.goalId === goalId),

      createPlanStep: (input) => {
        const stepId = nanoid();
        const timestamp = Date.now();
        const step: PlanStep = {
          id: stepId,
          planId: input.planId,
          title: input.title,
          order: input.order,
          description: input.description,
          dependsOnStepIds: input.dependsOnStepIds ?? [],
          estimatedMinutes: input.estimatedMinutes,
          suggestedDueDate: input.suggestedDueDate,
          status: input.status ?? "proposed",
          approvalState: input.approvalState ?? "pending",
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          planStepsById: {
            ...state.planStepsById,
            [stepId]: step,
          },
          planStepOrderByPlanId: {
            ...state.planStepOrderByPlanId,
            [input.planId]: [
              ...(state.planStepOrderByPlanId[input.planId] ?? []),
              stepId,
            ],
          },
        }));

        return stepId;
      },

      upsertPlanStep: (step) => {
        const stepOrder = get().planStepOrderByPlanId[step.planId] ?? [];

        set((state) => ({
          planStepsById: {
            ...state.planStepsById,
            [step.id]: step,
          },
          planStepOrderByPlanId: {
            ...state.planStepOrderByPlanId,
            [step.planId]: stepOrder.includes(step.id)
              ? stepOrder
              : [...stepOrder, step.id],
          },
        }));
      },

      updatePlanStep: (stepId, updates) => {
        const currentStep = get().planStepsById[stepId];
        if (!currentStep) return;

        set((state) => ({
          planStepsById: {
            ...state.planStepsById,
            [stepId]: {
              ...currentStep,
              ...updates,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      removePlanStep: (stepId) => {
        const currentStep = get().planStepsById[stepId];
        if (!currentStep) return;

        set((state) => {
          const { [stepId]: _removedStep, ...remainingSteps } =
            state.planStepsById;

          return {
            planStepsById: remainingSteps,
            planStepOrderByPlanId: {
              ...state.planStepOrderByPlanId,
              [currentStep.planId]: (
                state.planStepOrderByPlanId[currentStep.planId] ?? []
              ).filter((id) => id !== stepId),
            },
          };
        });
      },

      getPlanStepById: (stepId) => get().planStepsById[stepId],

      getPlanSteps: (planId) =>
        (get().planStepOrderByPlanId[planId] ?? [])
          .map((stepId) => get().planStepsById[stepId])
          .filter((step): step is PlanStep => Boolean(step))
          .sort((a, b) => a.order - b.order),
    }),
    {
      name: "plan-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
