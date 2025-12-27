/**
 * Equipment Hooks
 * 
 * React Query hooks for equipment management.
 * Provides data fetching, mutations, and real-time updates for:
 * - Equipment catalog
 * - Equipment recommendations
 * - Status tracking
 * - CAPA integration
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEquipmentCatalog,
  getEquipmentRecommendation,
  createEquipmentRecommendation,
  updateEquipmentRecommendation,
  deleteEquipmentRecommendation,
  subscribeToEquipmentCatalog,
  updateEquipmentStatus,
  markEquipmentOrdered,
  markEquipmentReceived,
  markEquipmentDeployed,
  rejectEquipmentRecommendation,
  getEquipmentForCAPA,
  linkEquipmentToCAPA,
  getEquipmentStats,
  getEquipmentCatalogTemplates,
  createFromCatalogTemplate,
} from "@/services/equipmentService";
import type {
  EquipmentRecommendation,
  EquipmentCategory,
  EquipmentPriority,
  EquipmentStatus,
} from "@/types/capa";

// Re-export types for consumers
export type { EquipmentRecommendation, EquipmentCategory, EquipmentPriority, EquipmentStatus } from "@/types/capa";

// Query keys for caching
export const equipmentKeys = {
  all: ["equipment"] as const,
  lists: () => [...equipmentKeys.all, "list"] as const,
  list: (orgId: string, filters?: object) => [...equipmentKeys.lists(), orgId, filters] as const,
  details: () => [...equipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
  forCAPA: (capaId: string) => [...equipmentKeys.all, "capa", capaId] as const,
  stats: (orgId: string) => [...equipmentKeys.all, "stats", orgId] as const,
  templates: () => [...equipmentKeys.all, "templates"] as const,
};

// =============================================================================
// List & Fetch Hooks
// =============================================================================

/**
 * Hook to fetch equipment catalog with optional filters
 */
export function useEquipmentCatalog(
  filters: {
    category?: EquipmentCategory[];
    priority?: EquipmentPriority[];
    status?: EquipmentStatus[];
    searchQuery?: string;
  } = {}
) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: equipmentKeys.list(orgId || "", filters),
    queryFn: () => getEquipmentCatalog(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time equipment catalog updates
 */
export function useRealtimeEquipmentCatalog() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [equipment, setEquipment] = useState<EquipmentRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToEquipmentCatalog(orgId, (newEquipment) => {
      setEquipment(newEquipment);
      setIsLoading(false);
      
      queryClient.setQueryData(equipmentKeys.list(orgId), newEquipment);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { equipment, isLoading, error };
}

/**
 * Hook to fetch a single equipment recommendation by ID
 */
export function useEquipmentRecommendation(equipmentId: string | undefined) {
  return useQuery({
    queryKey: equipmentKeys.detail(equipmentId || ""),
    queryFn: () => getEquipmentRecommendation(equipmentId!),
    enabled: !!equipmentId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to fetch equipment linked to a CAPA
 */
export function useEquipmentForCAPA(capaId: string | undefined) {
  return useQuery({
    queryKey: equipmentKeys.forCAPA(capaId || ""),
    queryFn: () => getEquipmentForCAPA(capaId!),
    enabled: !!capaId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch equipment statistics
 */
export function useEquipmentStats() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: equipmentKeys.stats(orgId || ""),
    queryFn: () => getEquipmentStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch equipment templates
 */
export function useEquipmentTemplates() {
  return useQuery({
    queryKey: equipmentKeys.templates(),
    queryFn: () => getEquipmentCatalogTemplates(),
    staleTime: Infinity, // Templates don't change
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Hook to create a new equipment recommendation
 */
export function useCreateEquipmentRecommendation() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<EquipmentRecommendation, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createEquipmentRecommendation(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
    },
  });
}

/**
 * Hook to create equipment from a catalog template
 */
export function useCreateEquipmentFromTemplate() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      capaId,
      incidentId,
      quantity,
      aiReason,
      priority,
    }: {
      templateId: string;
      capaId?: string;
      incidentId?: string;
      quantity: number;
      aiReason: string;
      priority: EquipmentPriority;
    }) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createFromCatalogTemplate(
        templateId,
        userProfile.organizationId,
        capaId,
        incidentId,
        quantity,
        aiReason,
        priority,
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
    },
  });
}

/**
 * Hook to update an equipment recommendation
 */
export function useUpdateEquipmentRecommendation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      equipmentId,
      data,
    }: {
      equipmentId: string;
      data: Partial<Omit<EquipmentRecommendation, "id" | "createdAt" | "audit" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateEquipmentRecommendation(equipmentId, data, user.uid);
    },
    onSuccess: (_data, { equipmentId }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(equipmentId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
    },
  });
}

/**
 * Hook to delete an equipment recommendation
 */
export function useDeleteEquipmentRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipmentId: string) => {
      await deleteEquipmentRecommendation(equipmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
    },
  });
}

// =============================================================================
// Status Hooks
// =============================================================================

/**
 * Hook to update equipment status
 */
export function useUpdateEquipmentStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      equipmentId,
      status,
    }: {
      equipmentId: string;
      status: EquipmentStatus;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateEquipmentStatus(equipmentId, status, user.uid);
    },
    onSuccess: (_data, { equipmentId }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(equipmentId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
    },
  });
}

/**
 * Hook to mark equipment as ordered
 */
export function useMarkEquipmentOrdered() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      equipmentId,
      quantityOrdered,
    }: {
      equipmentId: string;
      quantityOrdered: number;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await markEquipmentOrdered(equipmentId, quantityOrdered, user.uid);
    },
    onSuccess: (_data, { equipmentId }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(equipmentId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
    },
  });
}

/**
 * Hook to mark equipment as received
 */
export function useMarkEquipmentReceived() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      equipmentId,
      quantityReceived,
    }: {
      equipmentId: string;
      quantityReceived: number;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await markEquipmentReceived(equipmentId, quantityReceived, user.uid);
    },
    onSuccess: (_data, { equipmentId }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(equipmentId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
    },
  });
}

/**
 * Hook to mark equipment as deployed
 */
export function useMarkEquipmentDeployed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      equipmentId,
      actualCost,
    }: {
      equipmentId: string;
      actualCost?: number;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await markEquipmentDeployed(equipmentId, actualCost, user.uid);
    },
    onSuccess: (_data, { equipmentId }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(equipmentId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
    },
  });
}

/**
 * Hook to reject an equipment recommendation
 */
export function useRejectEquipmentRecommendation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipmentId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await rejectEquipmentRecommendation(equipmentId, user.uid);
    },
    onSuccess: (_data, equipmentId) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(equipmentId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
    },
  });
}

// =============================================================================
// CAPA Integration Hooks
// =============================================================================

/**
 * Hook to link equipment to a CAPA
 */
export function useLinkEquipmentToCAPA() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      equipmentId,
      capaId,
    }: {
      equipmentId: string;
      capaId: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await linkEquipmentToCAPA(equipmentId, capaId, user.uid);
    },
    onSuccess: (_data, { equipmentId, capaId }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(equipmentId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.forCAPA(capaId) });
    },
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to get equipment counts for dashboard tiles
 */
export function useEquipmentCounts() {
  const { data: stats, isLoading, error } = useEquipmentStats();

  const counts = {
    total: stats?.total || 0,
    pendingDeployment: stats?.pendingDeployment || 0,
    totalEstimatedCost: stats?.totalEstimatedCost || 0,
    totalActualCost: stats?.totalActualCost || 0,
    byCategory: stats?.byCategory || {},
    byStatus: stats?.byStatus || {},
    byPriority: stats?.byPriority || {},
  };

  return { counts, isLoading, error };
}

/**
 * Hook to filter equipment by category
 */
export function useEquipmentByCategory(category: EquipmentCategory) {
  return useEquipmentCatalog({ category: [category] });
}

/**
 * Hook to get pending equipment (not yet deployed)
 */
export function usePendingEquipment() {
  return useEquipmentCatalog({ status: ["pending", "ordered", "received"] });
}

