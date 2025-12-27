/**
 * Incident Hooks
 * 
 * React Query hooks for incident management.
 * Provides data fetching, mutations, and real-time updates for:
 * - Incident CRUD
 * - Investigation workflow
 * - CAPA integration
 * - Statistics
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
  subscribeToIncidents,
  startInvestigation,
  completeInvestigation,
  closeIncident,
  addWitness,
  addAffectedPerson,
  addIncidentPhotos,
  addIncidentDocuments,
  linkCAPAToIncident,
  markReportedToAuthorities,
  getIncidentStats,
} from "@/services/incidentService";
import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  WitnessInfo,
  AffectedPerson,
} from "@/types/capa";
import type { FileMetadata } from "@/types/common";

// Re-export types for consumers
export type { Incident, IncidentSeverity, IncidentStatus } from "@/types/capa";

// Query keys for caching
export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (orgId: string, filters?: object) => [...incidentKeys.lists(), orgId, filters] as const,
  details: () => [...incidentKeys.all, "detail"] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
  stats: (orgId: string) => [...incidentKeys.all, "stats", orgId] as const,
};

// =============================================================================
// List & Fetch Hooks
// =============================================================================

/**
 * Hook to fetch incidents with optional filters
 */
export function useIncidents(
  filters: {
    status?: IncidentStatus[];
    severity?: IncidentSeverity[];
    type?: string[];
    siteId?: string;
    departmentId?: string;
    dateRange?: { start: Date; end: Date };
    searchQuery?: string;
  } = {}
) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: incidentKeys.list(orgId || "", filters),
    queryFn: () => getIncidents(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time incident updates
 */
export function useRealtimeIncidents() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToIncidents(orgId, (newIncidents) => {
      setIncidents(newIncidents);
      setIsLoading(false);
      
      // Update React Query cache
      queryClient.setQueryData(incidentKeys.list(orgId), newIncidents);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { incidents, isLoading, error };
}

/**
 * Hook to fetch a single incident by ID
 */
export function useIncident(incidentId: string | undefined) {
  return useQuery({
    queryKey: incidentKeys.detail(incidentId || ""),
    queryFn: () => getIncident(incidentId!),
    enabled: !!incidentId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to fetch incident statistics
 */
export function useIncidentStats() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: incidentKeys.stats(orgId || ""),
    queryFn: () => getIncidentStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Hook to create a new incident
 */
export function useCreateIncident() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<Incident, "id" | "createdAt" | "updatedAt" | "audit" | "reference" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createIncident(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
  });
}

/**
 * Hook to update an incident
 */
export function useUpdateIncident() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      data,
    }: {
      incidentId: string;
      data: Partial<Omit<Incident, "id" | "createdAt" | "audit" | "reference" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateIncident(incidentId, data, user.uid);
    },
    onSuccess: (_data, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

/**
 * Hook to delete an incident
 */
export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incidentId: string) => {
      await deleteIncident(incidentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
  });
}

// =============================================================================
// Investigation Hooks
// =============================================================================

/**
 * Hook to start investigation on an incident
 */
export function useStartInvestigation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      investigatorId,
    }: {
      incidentId: string;
      investigatorId: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await startInvestigation(incidentId, investigatorId, user.uid);
    },
    onSuccess: (_data, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

/**
 * Hook to complete investigation with findings
 */
export function useCompleteInvestigation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      rootCause,
      contributingFactors,
    }: {
      incidentId: string;
      rootCause: string;
      contributingFactors: string[];
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await completeInvestigation(incidentId, rootCause, contributingFactors, user.uid);
    },
    onSuccess: (_data, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

/**
 * Hook to close an incident
 */
export function useCloseIncident() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incidentId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await closeIncident(incidentId, user.uid);
    },
    onSuccess: (_data, incidentId) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

// =============================================================================
// Witness & Affected Person Hooks
// =============================================================================

/**
 * Hook to add a witness to an incident
 */
export function useAddWitness() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      witness,
    }: {
      incidentId: string;
      witness: Omit<WitnessInfo, "id">;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      return addWitness(incidentId, witness, user.uid);
    },
    onSuccess: (_data, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}

/**
 * Hook to add an affected person to an incident
 */
export function useAddAffectedPerson() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      person,
    }: {
      incidentId: string;
      person: Omit<AffectedPerson, "id">;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      return addAffectedPerson(incidentId, person, user.uid);
    },
    onSuccess: (_data, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}

// =============================================================================
// Evidence Hooks
// =============================================================================

/**
 * Hook to add photos to an incident
 */
export function useAddIncidentPhotos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      photos,
    }: {
      incidentId: string;
      photos: FileMetadata[];
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await addIncidentPhotos(incidentId, photos, user.uid);
    },
    onSuccess: (_data, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}

/**
 * Hook to add documents to an incident
 */
export function useAddIncidentDocuments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      documents,
    }: {
      incidentId: string;
      documents: FileMetadata[];
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await addIncidentDocuments(incidentId, documents, user.uid);
    },
    onSuccess: (_data, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}

// =============================================================================
// CAPA Integration Hooks
// =============================================================================

/**
 * Hook to link a CAPA to an incident
 */
export function useLinkCAPAToIncident() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      capaId,
    }: {
      incidentId: string;
      capaId: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await linkCAPAToIncident(incidentId, capaId, user.uid);
    },
    onSuccess: (_data, { incidentId }) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}

// =============================================================================
// Regulatory Hooks
// =============================================================================

/**
 * Hook to mark incident as reported to authorities
 */
export function useMarkReportedToAuthorities() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incidentId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await markReportedToAuthorities(incidentId, user.uid);
    },
    onSuccess: (_data, incidentId) => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to get incident counts for dashboard tiles
 */
export function useIncidentCounts() {
  const { data: stats, isLoading, error } = useIncidentStats();

  const counts = {
    total: stats?.total || 0,
    thisMonth: stats?.thisMonth || 0,
    lastMonth: stats?.lastMonth || 0,
    pendingInvestigation: stats?.pendingInvestigation || 0,
    byStatus: stats?.byStatus || {},
    bySeverity: stats?.bySeverity || {},
  };

  return { counts, isLoading, error };
}

/**
 * Hook to get recent incidents
 */
export function useRecentIncidents(limit = 5) {
  const { data: incidents = [], isLoading, error } = useIncidents();

  return {
    incidents: incidents.slice(0, limit),
    isLoading,
    error,
  };
}

