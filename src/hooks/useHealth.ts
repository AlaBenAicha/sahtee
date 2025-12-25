/**
 * Health Hooks
 * 
 * React Query hooks for health management.
 * Provides data fetching, mutations, and real-time updates for:
 * - Health records (physician-only)
 * - Medical visits
 * - Exposure monitoring
 * - Health alerts
 * - Aggregate statistics
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  // Health Records
  getHealthRecords,
  getHealthRecord,
  getHealthRecordByEmployee,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  subscribeToHealthRecords,
  // Medical Visits
  getMedicalVisits,
  getMedicalVisit,
  getUpcomingVisits,
  getOverdueVisits,
  createMedicalVisit,
  updateMedicalVisit,
  deleteMedicalVisit,
  completeMedicalVisit,
  subscribeToMedicalVisits,
  // Exposures
  getExposures,
  getExposure,
  getCriticalExposures,
  createExposure,
  updateExposure,
  deleteExposure,
  addExposureMeasurement,
  subscribeToExposures,
  // Health Alerts
  getHealthAlerts,
  getActiveHealthAlerts,
  getHealthAlert,
  createHealthAlert,
  acknowledgeHealthAlert,
  resolveHealthAlert,
  subscribeToHealthAlerts,
  // Statistics
  getHealthStats,
  getVisitStats,
  getExposureStats,
  calculateHealthStats,
} from "@/services/healthService";
import type {
  HealthRecord,
  MedicalVisit,
  MedicalVisitStatus,
  HealthAlert,
  HealthAlertStatus,
  HealthAlertSeverity,
  HealthAlertType,
  HealthStats,
  OrganizationExposure,
  ExposureMeasurement,
  FitnessStatus,
  ExaminationType,
  HazardCategory,
} from "@/types/health";

// Re-export types for consumers
export type {
  HealthRecord,
  MedicalVisit,
  MedicalVisitStatus,
  HealthAlert,
  HealthStats,
  OrganizationExposure,
  FitnessStatus,
  ExaminationType,
} from "@/types/health";

// Query keys for caching
export const healthKeys = {
  all: ["health"] as const,
  records: () => [...healthKeys.all, "records"] as const,
  recordsList: (orgId: string, filters?: object) => [...healthKeys.records(), "list", orgId, filters] as const,
  recordDetail: (id: string) => [...healthKeys.records(), "detail", id] as const,
  recordByEmployee: (orgId: string, empId: string) => [...healthKeys.records(), "employee", orgId, empId] as const,
  visits: () => [...healthKeys.all, "visits"] as const,
  visitsList: (orgId: string, filters?: object) => [...healthKeys.visits(), "list", orgId, filters] as const,
  visitDetail: (id: string) => [...healthKeys.visits(), "detail", id] as const,
  upcomingVisits: (orgId: string) => [...healthKeys.visits(), "upcoming", orgId] as const,
  overdueVisits: (orgId: string) => [...healthKeys.visits(), "overdue", orgId] as const,
  exposures: () => [...healthKeys.all, "exposures"] as const,
  exposuresList: (orgId: string, filters?: object) => [...healthKeys.exposures(), "list", orgId, filters] as const,
  exposureDetail: (id: string) => [...healthKeys.exposures(), "detail", id] as const,
  criticalExposures: (orgId: string) => [...healthKeys.exposures(), "critical", orgId] as const,
  alerts: () => [...healthKeys.all, "alerts"] as const,
  alertsList: (orgId: string, filters?: object) => [...healthKeys.alerts(), "list", orgId, filters] as const,
  alertDetail: (id: string) => [...healthKeys.alerts(), "detail", id] as const,
  activeAlerts: (orgId: string) => [...healthKeys.alerts(), "active", orgId] as const,
  stats: (orgId: string) => [...healthKeys.all, "stats", orgId] as const,
  visitStats: (orgId: string) => [...healthKeys.all, "visitStats", orgId] as const,
  exposureStats: (orgId: string) => [...healthKeys.all, "exposureStats", orgId] as const,
};

// =============================================================================
// Health Record Hooks (Physician-Only)
// =============================================================================

/**
 * Hook to fetch health records with optional filters
 * Note: This should only be accessible to physicians
 */
export function useHealthRecords(
  filters: {
    fitnessStatus?: FitnessStatus[];
    departmentId?: string;
    searchQuery?: string;
  } = {}
) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.recordsList(orgId || "", filters),
    queryFn: () => getHealthRecords(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time health record updates
 */
export function useRealtimeHealthRecords() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToHealthRecords(orgId, (newRecords) => {
      setRecords(newRecords);
      setIsLoading(false);
      queryClient.setQueryData(healthKeys.recordsList(orgId), newRecords);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { records, isLoading, error };
}

/**
 * Hook to fetch a single health record by ID
 */
export function useHealthRecord(recordId: string | undefined) {
  return useQuery({
    queryKey: healthKeys.recordDetail(recordId || ""),
    queryFn: () => getHealthRecord(recordId!),
    enabled: !!recordId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to fetch health record by employee ID
 */
export function useHealthRecordByEmployee(employeeId: string | undefined) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.recordByEmployee(orgId || "", employeeId || ""),
    queryFn: () => getHealthRecordByEmployee(orgId!, employeeId!),
    enabled: !!orgId && !!employeeId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to create a new health record
 */
export function useCreateHealthRecord() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<HealthRecord, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createHealthRecord(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.records() });
    },
  });
}

/**
 * Hook to update a health record
 */
export function useUpdateHealthRecord() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      data,
    }: {
      recordId: string;
      data: Partial<Omit<HealthRecord, "id" | "createdAt" | "audit" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateHealthRecord(recordId, data, user.uid);
    },
    onSuccess: (_data, { recordId }) => {
      queryClient.invalidateQueries({ queryKey: healthKeys.recordDetail(recordId) });
      queryClient.invalidateQueries({ queryKey: healthKeys.records() });
    },
  });
}

/**
 * Hook to delete a health record
 */
export function useDeleteHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      await deleteHealthRecord(recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.records() });
    },
  });
}

// =============================================================================
// Medical Visit Hooks
// =============================================================================

/**
 * Hook to fetch medical visits with optional filters
 */
export function useMedicalVisits(
  filters: {
    status?: MedicalVisitStatus[];
    type?: ExaminationType[];
    physicianId?: string;
    employeeId?: string;
    departmentId?: string;
    dateRange?: { start: Date; end: Date };
  } = {}
) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.visitsList(orgId || "", filters),
    queryFn: () => getMedicalVisits(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time medical visit updates
 */
export function useRealtimeMedicalVisits() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToMedicalVisits(orgId, (newVisits) => {
      setVisits(newVisits);
      setIsLoading(false);
      queryClient.setQueryData(healthKeys.visitsList(orgId), newVisits);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { visits, isLoading, error };
}

/**
 * Hook to fetch a single medical visit
 */
export function useMedicalVisit(visitId: string | undefined) {
  return useQuery({
    queryKey: healthKeys.visitDetail(visitId || ""),
    queryFn: () => getMedicalVisit(visitId!),
    enabled: !!visitId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to fetch upcoming visits
 */
export function useUpcomingVisits(limit = 10) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.upcomingVisits(orgId || ""),
    queryFn: () => getUpcomingVisits(orgId!, limit),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch overdue visits
 */
export function useOverdueVisits() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.overdueVisits(orgId || ""),
    queryFn: () => getOverdueVisits(orgId!),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to create a new medical visit
 */
export function useCreateMedicalVisit() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<MedicalVisit, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createMedicalVisit(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.visits() });
    },
  });
}

/**
 * Hook to update a medical visit
 */
export function useUpdateMedicalVisit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      visitId,
      data,
    }: {
      visitId: string;
      data: Partial<Omit<MedicalVisit, "id" | "createdAt" | "audit" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateMedicalVisit(visitId, data, user.uid);
    },
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: healthKeys.visitDetail(visitId) });
      queryClient.invalidateQueries({ queryKey: healthKeys.visits() });
    },
  });
}

/**
 * Hook to delete a medical visit
 */
export function useDeleteMedicalVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitId: string) => {
      await deleteMedicalVisit(visitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.visits() });
    },
  });
}

/**
 * Hook to complete a medical visit with findings
 */
export function useCompleteMedicalVisit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      visitId,
      findings,
    }: {
      visitId: string;
      findings: {
        findings: string;
        recommendations?: string[];
        fitnessDecision: FitnessStatus;
        nextVisitRecommended?: import("firebase/firestore").Timestamp;
        nextVisitType?: ExaminationType;
      };
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await completeMedicalVisit(visitId, findings, user.uid);
    },
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: healthKeys.visitDetail(visitId) });
      queryClient.invalidateQueries({ queryKey: healthKeys.visits() });
    },
  });
}

// =============================================================================
// Exposure Hooks
// =============================================================================

/**
 * Hook to fetch exposures with optional filters
 */
export function useExposures(
  filters: {
    hazardType?: HazardCategory[];
    alertLevel?: ("low" | "moderate" | "elevated" | "critical")[];
    siteId?: string;
    departmentId?: string;
  } = {}
) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.exposuresList(orgId || "", filters),
    queryFn: () => getExposures(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time exposure updates
 */
export function useRealtimeExposures() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [exposures, setExposures] = useState<OrganizationExposure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToExposures(orgId, (newExposures) => {
      setExposures(newExposures);
      setIsLoading(false);
      queryClient.setQueryData(healthKeys.exposuresList(orgId), newExposures);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { exposures, isLoading, error };
}

/**
 * Hook to fetch a single exposure
 */
export function useExposure(exposureId: string | undefined) {
  return useQuery({
    queryKey: healthKeys.exposureDetail(exposureId || ""),
    queryFn: () => getExposure(exposureId!),
    enabled: !!exposureId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to fetch critical exposures
 */
export function useCriticalExposures() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.criticalExposures(orgId || ""),
    queryFn: () => getCriticalExposures(orgId!),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to create a new exposure record
 */
export function useCreateExposure() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<OrganizationExposure, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createExposure(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.exposures() });
    },
  });
}

/**
 * Hook to update an exposure record
 */
export function useUpdateExposure() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exposureId,
      data,
    }: {
      exposureId: string;
      data: Partial<Omit<OrganizationExposure, "id" | "createdAt" | "audit" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateExposure(exposureId, data, user.uid);
    },
    onSuccess: (_data, { exposureId }) => {
      queryClient.invalidateQueries({ queryKey: healthKeys.exposureDetail(exposureId) });
      queryClient.invalidateQueries({ queryKey: healthKeys.exposures() });
    },
  });
}

/**
 * Hook to delete an exposure record
 */
export function useDeleteExposure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exposureId: string) => {
      await deleteExposure(exposureId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.exposures() });
    },
  });
}

/**
 * Hook to add a measurement to an exposure
 */
export function useAddExposureMeasurement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exposureId,
      measurement,
    }: {
      exposureId: string;
      measurement: ExposureMeasurement;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await addExposureMeasurement(exposureId, measurement, user.uid);
    },
    onSuccess: (_data, { exposureId }) => {
      queryClient.invalidateQueries({ queryKey: healthKeys.exposureDetail(exposureId) });
      queryClient.invalidateQueries({ queryKey: healthKeys.exposures() });
      queryClient.invalidateQueries({ queryKey: healthKeys.alerts() });
    },
  });
}

// =============================================================================
// Health Alert Hooks
// =============================================================================

/**
 * Hook to fetch health alerts with optional filters
 */
export function useHealthAlerts(
  filters: {
    status?: HealthAlertStatus[];
    severity?: HealthAlertSeverity[];
    type?: HealthAlertType[];
  } = {}
) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.alertsList(orgId || "", filters),
    queryFn: () => getHealthAlerts(orgId!, filters),
    enabled: !!orgId,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time health alert updates
 */
export function useRealtimeHealthAlerts() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToHealthAlerts(orgId, (newAlerts) => {
      setAlerts(newAlerts);
      setIsLoading(false);
      queryClient.setQueryData(healthKeys.alertsList(orgId), newAlerts);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { alerts, isLoading, error };
}

/**
 * Hook to fetch active health alerts
 */
export function useActiveHealthAlerts() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.activeAlerts(orgId || ""),
    queryFn: () => getActiveHealthAlerts(orgId!),
    enabled: !!orgId,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

/**
 * Hook to fetch a single health alert
 */
export function useHealthAlert(alertId: string | undefined) {
  return useQuery({
    queryKey: healthKeys.alertDetail(alertId || ""),
    queryFn: () => getHealthAlert(alertId!),
    enabled: !!alertId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to create a health alert
 */
export function useCreateHealthAlert() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<HealthAlert, "id" | "createdAt" | "updatedAt" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createHealthAlert(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.alerts() });
    },
  });
}

/**
 * Hook to acknowledge a health alert
 */
export function useAcknowledgeHealthAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await acknowledgeHealthAlert(alertId, user.uid);
    },
    onSuccess: (_data, alertId) => {
      queryClient.invalidateQueries({ queryKey: healthKeys.alertDetail(alertId) });
      queryClient.invalidateQueries({ queryKey: healthKeys.alerts() });
    },
  });
}

/**
 * Hook to resolve a health alert
 */
export function useResolveHealthAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alertId,
      resolutionNotes,
      linkedCapaId,
    }: {
      alertId: string;
      resolutionNotes: string;
      linkedCapaId?: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await resolveHealthAlert(alertId, resolutionNotes, linkedCapaId, user.uid);
    },
    onSuccess: (_data, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: healthKeys.alertDetail(alertId) });
      queryClient.invalidateQueries({ queryKey: healthKeys.alerts() });
    },
  });
}

// =============================================================================
// Statistics Hooks
// =============================================================================

/**
 * Hook to fetch aggregate health statistics
 */
export function useHealthStats() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.stats(orgId || ""),
    queryFn: () => getHealthStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch visit statistics
 */
export function useVisitStats() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.visitStats(orgId || ""),
    queryFn: () => getVisitStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch exposure statistics
 */
export function useExposureStats() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthKeys.exposureStats(orgId || ""),
    queryFn: () => getExposureStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to recalculate health stats
 */
export function useRecalculateHealthStats() {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return calculateHealthStats(userProfile.organizationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.all });
    },
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to get health dashboard summary counts
 */
export function useHealthDashboardCounts() {
  const { data: stats, isLoading: statsLoading } = useHealthStats();
  const { data: visitStats, isLoading: visitStatsLoading } = useVisitStats();
  const { data: exposureStats, isLoading: exposureStatsLoading } = useExposureStats();

  const isLoading = statsLoading || visitStatsLoading || exposureStatsLoading;

  const counts = {
    activeCases: stats?.activeCases || 0,
    pendingVisits: visitStats?.scheduled || 0,
    overdueVisits: visitStats?.overdue || 0,
    activeAlerts: stats?.activeAlerts || 0,
    criticalAlerts: stats?.criticalAlerts || 0,
    criticalExposures: exposureStats?.critical || 0,
    employeesUnderSurveillance: stats?.employeesUnderSurveillance || 0,
    absenteeismRate: stats?.absenteeismRate || 0,
  };

  return { counts, isLoading };
}

/**
 * Hook to check if current user is a physician
 */
export function useIsPhysician() {
  const { session } = useAuth();
  
  // Check if user has physician role
  const isPhysician = session?.roleName === "Médecin du travail" || 
                      session?.roleName === "physician" ||
                      session?.featurePermissions?.health?.delete === true; // Full health access indicator
  
  return isPhysician;
}

