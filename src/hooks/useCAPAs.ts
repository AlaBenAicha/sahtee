/**
 * CAPA Hooks
 * 
 * React Query hooks for CAPA (Corrective and Preventive Action) management.
 * Provides data fetching, mutations, and real-time updates for:
 * - Action plans CRUD
 * - Kanban board operations
 * - Progress tracking
 * - Comments and completion
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCAPAs,
  getCAPA,
  createCAPA,
  updateCAPA,
  deleteCAPA,
  subscribeToCAPAs,
  moveCAPAToColumn,
  getCAPAsByColumn,
  getCAPAStats,
  toggleChecklistItem,
  addChecklistItem,
  addCAPAComment,
  completeCAPA,
  verifyCAPA,
  closeCAPA,
  bulkUpdateCAPAStatus,
  bulkAssignCAPAs,
  statusToColumn,
} from "@/services/capaService";
import type {
  ActionPlan,
  ActionStatus,
  CAPAFilters,
  ChecklistItem,
  ActionComment,
  CompletionProof,
} from "@/types/capa";

// Re-export types for consumers
export type { ActionPlan, CAPAFilters } from "@/types/capa";

// Query keys for caching
export const capaKeys = {
  all: ["capas"] as const,
  lists: () => [...capaKeys.all, "list"] as const,
  list: (orgId: string, filters?: CAPAFilters) => [...capaKeys.lists(), orgId, filters] as const,
  byColumn: (orgId: string) => [...capaKeys.all, "byColumn", orgId] as const,
  details: () => [...capaKeys.all, "detail"] as const,
  detail: (id: string) => [...capaKeys.details(), id] as const,
  stats: (orgId: string) => [...capaKeys.all, "stats", orgId] as const,
};

// =============================================================================
// List & Fetch Hooks
// =============================================================================

/**
 * Hook to fetch CAPAs with optional filters
 */
export function useCAPAs(filters: CAPAFilters = {}) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: capaKeys.list(orgId || "", filters),
    queryFn: () => getCAPAs(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time CAPA updates
 */
export function useRealtimeCAPAs(filters: CAPAFilters = {}) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [capas, setCAPAs] = useState<ActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToCAPAs(orgId, (newCAPAs) => {
      setCAPAs(newCAPAs);
      setIsLoading(false);
      
      // Update React Query cache
      queryClient.setQueryData(capaKeys.list(orgId, filters), newCAPAs);
    }, filters);

    return () => unsubscribe();
  }, [orgId, queryClient, JSON.stringify(filters)]);

  return { capas, isLoading, error };
}

/**
 * Hook to fetch CAPAs grouped by Kanban column
 */
export function useCAPAsByColumn() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: capaKeys.byColumn(orgId || ""),
    queryFn: () => getCAPAsByColumn(orgId!),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single CAPA by ID
 */
export function useCAPA(capaId: string | undefined) {
  return useQuery({
    queryKey: capaKeys.detail(capaId || ""),
    queryFn: () => getCAPA(capaId!),
    enabled: !!capaId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to fetch CAPA statistics
 */
export function useCAPAStats() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: capaKeys.stats(orgId || ""),
    queryFn: () => getCAPAStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Hook to create a new CAPA
 */
export function useCreateCAPA() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<ActionPlan, "id" | "createdAt" | "updatedAt" | "audit" | "reference" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createCAPA(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capaKeys.all });
    },
  });
}

/**
 * Hook to update a CAPA
 */
export function useUpdateCAPA() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      capaId,
      data,
    }: {
      capaId: string;
      data: Partial<Omit<ActionPlan, "id" | "createdAt" | "audit" | "reference" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateCAPA(capaId, data, user.uid);
    },
    onSuccess: (_data, { capaId }) => {
      queryClient.invalidateQueries({ queryKey: capaKeys.detail(capaId) });
      queryClient.invalidateQueries({ queryKey: capaKeys.lists() });
    },
  });
}

/**
 * Hook to delete a CAPA
 */
export function useDeleteCAPA() {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (capaId: string) => {
      await deleteCAPA(capaId);
    },
    onSuccess: () => {
      if (userProfile?.organizationId) {
        queryClient.invalidateQueries({ queryKey: capaKeys.all });
      }
    },
  });
}

// =============================================================================
// Kanban Hooks
// =============================================================================

/**
 * Hook to move a CAPA to a different Kanban column
 */
export function useMoveCAPAToColumn() {
  const { user, userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ capaId, column }: { capaId: string; column: string }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await moveCAPAToColumn(capaId, column, user.uid);
    },
    onMutate: async ({ capaId, column }) => {
      // Optimistic update for Kanban
      if (orgId) {
        await queryClient.cancelQueries({ queryKey: capaKeys.byColumn(orgId) });
        
        const previousData = queryClient.getQueryData<Record<string, ActionPlan[]>>(
          capaKeys.byColumn(orgId)
        );
        
        if (previousData) {
          const updatedData = { ...previousData };
          
          // Find and remove CAPA from its current column
          for (const col of Object.keys(updatedData)) {
            const capaIndex = updatedData[col].findIndex(c => c.id === capaId);
            if (capaIndex !== -1) {
              const [capa] = updatedData[col].splice(capaIndex, 1);
              // Add to new column
              if (updatedData[column]) {
                updatedData[column].push({
                  ...capa,
                  status: column === "done" ? "completed" : capa.status,
                });
              }
              break;
            }
          }
          
          queryClient.setQueryData(capaKeys.byColumn(orgId), updatedData);
        }
        
        return { previousData };
      }
    },
    onError: (_err, _vars, context) => {
      if (orgId && context?.previousData) {
        queryClient.setQueryData(capaKeys.byColumn(orgId), context.previousData);
      }
    },
    onSettled: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: capaKeys.byColumn(orgId) });
        queryClient.invalidateQueries({ queryKey: capaKeys.lists() });
      }
    },
  });
}

// =============================================================================
// Checklist Hooks
// =============================================================================

/**
 * Hook to toggle a checklist item
 */
export function useToggleChecklistItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      capaId,
      itemId,
      completed,
    }: {
      capaId: string;
      itemId: string;
      completed: boolean;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await toggleChecklistItem(capaId, itemId, completed, user.uid);
    },
    onSuccess: (_data, { capaId }) => {
      queryClient.invalidateQueries({ queryKey: capaKeys.detail(capaId) });
    },
  });
}

/**
 * Hook to add a checklist item
 */
export function useAddChecklistItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      capaId,
      description,
    }: {
      capaId: string;
      description: string;
    }): Promise<ChecklistItem> => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      return addChecklistItem(capaId, description, user.uid);
    },
    onSuccess: (_data, { capaId }) => {
      queryClient.invalidateQueries({ queryKey: capaKeys.detail(capaId) });
    },
  });
}

// =============================================================================
// Comment Hooks
// =============================================================================

/**
 * Hook to add a comment to a CAPA
 */
export function useAddCAPAComment() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      capaId,
      content,
    }: {
      capaId: string;
      content: string;
    }): Promise<ActionComment> => {
      if (!user?.uid || !userProfile?.displayName) {
        throw new Error("Not authenticated");
      }
      return addCAPAComment(capaId, content, user.uid, userProfile.displayName);
    },
    onSuccess: (_data, { capaId }) => {
      queryClient.invalidateQueries({ queryKey: capaKeys.detail(capaId) });
    },
  });
}

// =============================================================================
// Completion Hooks
// =============================================================================

/**
 * Hook to complete a CAPA with proof
 */
export function useCompleteCAPA() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      capaId,
      proof,
    }: {
      capaId: string;
      proof: CompletionProof;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await completeCAPA(capaId, proof, user.uid);
    },
    onSuccess: (_data, { capaId }) => {
      queryClient.invalidateQueries({ queryKey: capaKeys.detail(capaId) });
      queryClient.invalidateQueries({ queryKey: capaKeys.lists() });
    },
  });
}

/**
 * Hook to verify a completed CAPA
 */
export function useVerifyCAPA() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (capaId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await verifyCAPA(capaId, user.uid);
    },
    onSuccess: (_data, capaId) => {
      queryClient.invalidateQueries({ queryKey: capaKeys.detail(capaId) });
      queryClient.invalidateQueries({ queryKey: capaKeys.lists() });
    },
  });
}

/**
 * Hook to close a verified CAPA
 */
export function useCloseCAPA() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (capaId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await closeCAPA(capaId, user.uid);
    },
    onSuccess: (_data, capaId) => {
      queryClient.invalidateQueries({ queryKey: capaKeys.detail(capaId) });
      queryClient.invalidateQueries({ queryKey: capaKeys.lists() });
    },
  });
}

// =============================================================================
// Bulk Operations Hooks
// =============================================================================

/**
 * Hook to bulk update CAPA statuses
 */
export function useBulkUpdateCAPAStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      capaIds,
      status,
    }: {
      capaIds: string[];
      status: ActionStatus;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await bulkUpdateCAPAStatus(capaIds, status, user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capaKeys.all });
    },
  });
}

/**
 * Hook to bulk assign CAPAs to a user
 */
export function useBulkAssignCAPAs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      capaIds,
      assigneeId,
      assigneeName,
    }: {
      capaIds: string[];
      assigneeId: string;
      assigneeName: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await bulkAssignCAPAs(capaIds, assigneeId, assigneeName, user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capaKeys.all });
    },
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to get CAPA counts by status for dashboard tiles
 */
export function useCAPACounts() {
  const { data: stats, isLoading, error } = useCAPAStats();

  const counts = {
    urgent: stats?.urgent || 0,
    overdue: stats?.overdue || 0,
    inProgress: stats?.byStatus?.in_progress || 0,
    completed: (stats?.byStatus?.completed || 0) + 
               (stats?.byStatus?.verified || 0) + 
               (stats?.byStatus?.closed || 0),
    closedOnTime: stats?.closedOnTime || 0,
    total: stats?.total || 0,
  };

  return { counts, isLoading, error };
}

/**
 * Utility to convert CAPA status to Kanban column
 */
export { statusToColumn };

