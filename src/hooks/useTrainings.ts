/**
 * Training Hooks
 * 
 * React Query hooks for training management.
 * Provides data fetching, mutations, and real-time updates for:
 * - Training plan CRUD
 * - Employee enrollment
 * - Progress tracking
 * - Statistics
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTrainingPlans,
  getTrainingPlan,
  createTrainingPlan,
  updateTrainingPlan,
  deleteTrainingPlan,
  subscribeToTrainingPlans,
  getEmployeeTrainingRecords,
  getPlanTrainingRecords,
  subscribeToEmployeeTrainingRecords,
  enrollEmployee,
  bulkEnrollEmployees,
  startTraining,
  updateTrainingProgress,
  completeTraining,
  generateCertificate,
  getTrainingStats,
  getEmployeeTrainingStats,
} from "@/services/trainingService";
import type {
  TrainingPlan,
  TrainingRecord,
  TrainingPriority,
  TrainingSource,
} from "@/types/capa";

// Re-export types for consumers
export type { TrainingPlan, TrainingRecord, TrainingPriority } from "@/types/capa";

// Query keys for caching
export const trainingKeys = {
  all: ["trainings"] as const,
  plans: () => [...trainingKeys.all, "plans"] as const,
  planList: (orgId: string, filters?: object) => [...trainingKeys.plans(), orgId, filters] as const,
  planDetail: (id: string) => [...trainingKeys.plans(), id] as const,
  records: () => [...trainingKeys.all, "records"] as const,
  employeeRecords: (orgId: string, employeeId: string) => 
    [...trainingKeys.records(), orgId, employeeId] as const,
  planRecords: (planId: string) => [...trainingKeys.records(), "plan", planId] as const,
  stats: (orgId: string) => [...trainingKeys.all, "stats", orgId] as const,
  employeeStats: (orgId: string, employeeId: string) => 
    [...trainingKeys.all, "employeeStats", orgId, employeeId] as const,
};

// =============================================================================
// Training Plan Hooks
// =============================================================================

/**
 * Hook to fetch training plans with optional filters
 */
export function useTrainingPlans(
  filters: {
    priority?: TrainingPriority[];
    source?: TrainingSource[];
    mandatory?: boolean;
    departmentId?: string;
    searchQuery?: string;
  } = {}
) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: trainingKeys.planList(orgId || "", filters),
    queryFn: () => getTrainingPlans(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time training plan updates
 */
export function useRealtimeTrainingPlans() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToTrainingPlans(orgId, (newPlans) => {
      setPlans(newPlans);
      setIsLoading(false);
      
      queryClient.setQueryData(trainingKeys.planList(orgId), newPlans);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { plans, isLoading, error };
}

/**
 * Hook to fetch a single training plan by ID
 */
export function useTrainingPlan(planId: string | undefined) {
  return useQuery({
    queryKey: trainingKeys.planDetail(planId || ""),
    queryFn: () => getTrainingPlan(planId!),
    enabled: !!planId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to create a new training plan
 */
export function useCreateTrainingPlan() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<TrainingPlan, "id" | "createdAt" | "updatedAt" | "audit" | "completionStatus" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createTrainingPlan(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}

/**
 * Hook to update a training plan
 */
export function useUpdateTrainingPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      data,
    }: {
      planId: string;
      data: Partial<Omit<TrainingPlan, "id" | "createdAt" | "audit" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateTrainingPlan(planId, data, user.uid);
    },
    onSuccess: (_data, { planId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.planDetail(planId) });
      queryClient.invalidateQueries({ queryKey: trainingKeys.plans() });
    },
  });
}

/**
 * Hook to delete a training plan
 */
export function useDeleteTrainingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      await deleteTrainingPlan(planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}

// =============================================================================
// Training Record Hooks
// =============================================================================

/**
 * Hook to fetch training records for the current user
 */
export function useMyTrainingRecords() {
  const { user, userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const employeeId = user?.uid;

  return useQuery({
    queryKey: trainingKeys.employeeRecords(orgId || "", employeeId || ""),
    queryFn: () => getEmployeeTrainingRecords(orgId!, employeeId!),
    enabled: !!orgId && !!employeeId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch training records for a specific employee
 */
export function useEmployeeTrainingRecords(employeeId: string | undefined) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: trainingKeys.employeeRecords(orgId || "", employeeId || ""),
    queryFn: () => getEmployeeTrainingRecords(orgId!, employeeId!),
    enabled: !!orgId && !!employeeId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for real-time training record updates for current user
 */
export function useRealtimeMyTrainingRecords() {
  const { user, userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const employeeId = user?.uid;
  const queryClient = useQueryClient();
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId || !employeeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToEmployeeTrainingRecords(orgId, employeeId, (newRecords) => {
      setRecords(newRecords);
      setIsLoading(false);
      
      queryClient.setQueryData(trainingKeys.employeeRecords(orgId, employeeId), newRecords);
    });

    return () => unsubscribe();
  }, [orgId, employeeId, queryClient]);

  return { records, isLoading, error };
}

/**
 * Hook to fetch training records for a specific plan
 */
export function usePlanTrainingRecords(planId: string | undefined) {
  return useQuery({
    queryKey: trainingKeys.planRecords(planId || ""),
    queryFn: () => getPlanTrainingRecords(planId!),
    enabled: !!planId,
    staleTime: 2 * 60 * 1000,
  });
}

// =============================================================================
// Enrollment Hooks
// =============================================================================

/**
 * Hook to enroll an employee in a training
 */
export function useEnrollEmployee() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      employeeId,
    }: {
      planId: string;
      employeeId: string;
    }) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return enrollEmployee(planId, employeeId, userProfile.organizationId, user.uid);
    },
    onSuccess: (_data, { planId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.planDetail(planId) });
      queryClient.invalidateQueries({ queryKey: trainingKeys.records() });
    },
  });
}

/**
 * Hook to bulk enroll employees in a training
 */
export function useBulkEnrollEmployees() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      employeeIds,
    }: {
      planId: string;
      employeeIds: string[];
    }) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      await bulkEnrollEmployees(planId, employeeIds, userProfile.organizationId, user.uid);
    },
    onSuccess: (_data, { planId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.planDetail(planId) });
      queryClient.invalidateQueries({ queryKey: trainingKeys.records() });
    },
  });
}

// =============================================================================
// Progress Hooks
// =============================================================================

/**
 * Hook to start a training
 */
export function useStartTraining() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await startTraining(recordId, user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.records() });
    },
  });
}

/**
 * Hook to update training progress
 */
export function useUpdateTrainingProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      progress,
    }: {
      recordId: string;
      progress: number;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateTrainingProgress(recordId, progress, user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.records() });
    },
  });
}

/**
 * Hook to complete a training
 */
export function useCompleteTraining() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      score,
    }: {
      recordId: string;
      score?: number;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await completeTraining(recordId, score, user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}

/**
 * Hook to generate a certificate
 */
export function useGenerateCertificate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      certificateUrl,
    }: {
      recordId: string;
      certificateUrl: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await generateCertificate(recordId, certificateUrl, user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.records() });
    },
  });
}

// =============================================================================
// Statistics Hooks
// =============================================================================

/**
 * Hook to fetch training statistics for the organization
 */
export function useTrainingStats() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: trainingKeys.stats(orgId || ""),
    queryFn: () => getTrainingStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch training statistics for the current user
 */
export function useMyTrainingStats() {
  const { user, userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const employeeId = user?.uid;

  return useQuery({
    queryKey: trainingKeys.employeeStats(orgId || "", employeeId || ""),
    queryFn: () => getEmployeeTrainingStats(orgId!, employeeId!),
    enabled: !!orgId && !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch training statistics for a specific employee
 */
export function useEmployeeTrainingStats(employeeId: string | undefined) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: trainingKeys.employeeStats(orgId || "", employeeId || ""),
    queryFn: () => getEmployeeTrainingStats(orgId!, employeeId!),
    enabled: !!orgId && !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to get training counts for dashboard tiles
 */
export function useTrainingCounts() {
  const { data: stats, isLoading, error } = useTrainingStats();

  const counts = {
    totalPlans: stats?.totalPlans || 0,
    activePlans: stats?.activePlans || 0,
    mandatoryPlans: stats?.mandatoryPlans || 0,
    totalEnrollments: stats?.totalEnrollments || 0,
    completedEnrollments: stats?.completedEnrollments || 0,
    completionRate: stats?.overallCompletionRate || 0,
  };

  return { counts, isLoading, error };
}

/**
 * Hook to get current user's training summary
 */
export function useMyTrainingSummary() {
  const { data: stats, isLoading, error } = useMyTrainingStats();

  return {
    total: stats?.total || 0,
    completed: stats?.completed || 0,
    inProgress: stats?.inProgress || 0,
    overdue: stats?.overdue || 0,
    completionRate: stats?.completionRate || 0,
    expiringWithin30Days: stats?.expiringWithin30Days || 0,
    isLoading,
    error,
  };
}

