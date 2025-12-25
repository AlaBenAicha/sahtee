/**
 * Compliance Hooks
 * 
 * React Query hooks for compliance management including:
 * - Norms/Standards CRUD
 * - Requirements management
 * - Audits CRUD
 * - Findings management
 * - Compliance metrics
 * - Real-time updates
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  // Norm operations
  getNorms,
  getNorm,
  createNorm,
  updateNorm,
  deleteNorm,
  subscribeToNorms,
  updateNormRequirement,
  addEvidenceToRequirement,
  removeEvidenceFromRequirement,
  linkCapaToRequirement,
  bulkUpdateRequirementStatus,
  // Audit operations
  getAudits,
  getAudit,
  createAudit,
  updateAudit,
  deleteAudit,
  startAudit,
  completeAudit,
  cancelAudit,
  subscribeToAudits,
  linkNormToAudit,
  // Finding operations
  addFinding,
  updateFinding,
  deleteFinding,
  submitFindingResponse,
  verifyFinding,
  createCAPAFromFinding,
  // Metrics
  getComplianceMetrics,
  getAuditStats,
} from "@/services/complianceService";
import type {
  Norm,
  NormWithRequirements,
  NormRequirement,
  NormFilters,
  Audit,
  AuditFilters,
  AuditSummary,
  Finding,
  Evidence,
  ComplianceMetrics,
  ComplianceStatus,
} from "@/types/conformity";

// Re-export types for consumers
export type {
  Norm,
  NormWithRequirements,
  NormRequirement,
  NormFilters,
  Audit,
  AuditFilters,
  Finding,
  ComplianceMetrics,
} from "@/types/conformity";

// =============================================================================
// Query Keys
// =============================================================================

export const complianceKeys = {
  all: ["compliance"] as const,
  
  // Norms
  norms: () => [...complianceKeys.all, "norms"] as const,
  normsList: (orgId: string, filters?: NormFilters) => [...complianceKeys.norms(), "list", orgId, filters] as const,
  normDetail: (id: string) => [...complianceKeys.norms(), "detail", id] as const,
  
  // Audits
  audits: () => [...complianceKeys.all, "audits"] as const,
  auditsList: (orgId: string, filters?: AuditFilters) => [...complianceKeys.audits(), "list", orgId, filters] as const,
  auditDetail: (id: string) => [...complianceKeys.audits(), "detail", id] as const,
  auditStats: (orgId: string) => [...complianceKeys.audits(), "stats", orgId] as const,
  
  // Metrics
  metrics: (orgId: string) => [...complianceKeys.all, "metrics", orgId] as const,
};

// =============================================================================
// Norm Hooks
// =============================================================================

/**
 * Hook to fetch norms with optional filters
 */
export function useNorms(filters: NormFilters = {}) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: complianceKeys.normsList(orgId || "", filters),
    queryFn: () => getNorms(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time norm updates
 */
export function useRealtimeNorms() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [norms, setNorms] = useState<NormWithRequirements[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToNorms(orgId, (newNorms) => {
      setNorms(newNorms);
      setIsLoading(false);
      
      // Update React Query cache
      queryClient.setQueryData(complianceKeys.normsList(orgId, {}), newNorms);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { norms, isLoading, error };
}

/**
 * Hook to fetch a single norm by ID
 */
export function useNorm(normId: string | undefined) {
  return useQuery({
    queryKey: complianceKeys.normDetail(normId || ""),
    queryFn: () => getNorm(normId!),
    enabled: !!normId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to create a new norm
 */
export function useCreateNorm() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<NormWithRequirements, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createNorm(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.norms() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.metrics(userProfile?.organizationId || "") });
    },
  });
}

/**
 * Hook to update a norm
 */
export function useUpdateNorm() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      normId,
      data,
    }: {
      normId: string;
      data: Partial<Omit<NormWithRequirements, "id" | "createdAt" | "audit" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateNorm(normId, data, user.uid);
    },
    onSuccess: (_data, { normId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.normDetail(normId) });
      queryClient.invalidateQueries({ queryKey: complianceKeys.norms() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.metrics(userProfile?.organizationId || "") });
    },
  });
}

/**
 * Hook to delete a norm
 */
export function useDeleteNorm() {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (normId: string) => {
      await deleteNorm(normId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.norms() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.metrics(userProfile?.organizationId || "") });
    },
  });
}

// =============================================================================
// Requirement Hooks
// =============================================================================

/**
 * Hook to update a requirement within a norm
 */
export function useUpdateRequirement() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      normId,
      requirementId,
      data,
    }: {
      normId: string;
      requirementId: string;
      data: Partial<NormRequirement>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateNormRequirement(normId, requirementId, data, user.uid);
    },
    onSuccess: (_data, { normId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.normDetail(normId) });
      queryClient.invalidateQueries({ queryKey: complianceKeys.norms() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.metrics(userProfile?.organizationId || "") });
    },
  });
}

/**
 * Hook to add evidence to a requirement
 */
export function useAddEvidence() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      normId,
      requirementId,
      evidence,
    }: {
      normId: string;
      requirementId: string;
      evidence: Evidence;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await addEvidenceToRequirement(normId, requirementId, evidence, user.uid);
    },
    onSuccess: (_data, { normId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.normDetail(normId) });
    },
  });
}

/**
 * Hook to remove evidence from a requirement
 */
export function useRemoveEvidence() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      normId,
      requirementId,
      evidenceId,
    }: {
      normId: string;
      requirementId: string;
      evidenceId: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await removeEvidenceFromRequirement(normId, requirementId, evidenceId, user.uid);
    },
    onSuccess: (_data, { normId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.normDetail(normId) });
    },
  });
}

/**
 * Hook to link a CAPA to a requirement
 */
export function useLinkCapaToRequirement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      normId,
      requirementId,
      capaId,
    }: {
      normId: string;
      requirementId: string;
      capaId: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await linkCapaToRequirement(normId, requirementId, capaId, user.uid);
    },
    onSuccess: (_data, { normId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.normDetail(normId) });
    },
  });
}

/**
 * Hook to bulk update requirement statuses
 */
export function useBulkUpdateRequirementStatus() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      normId,
      requirementIds,
      status,
    }: {
      normId: string;
      requirementIds: string[];
      status: ComplianceStatus;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await bulkUpdateRequirementStatus(normId, requirementIds, status, user.uid);
    },
    onSuccess: (_data, { normId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.normDetail(normId) });
      queryClient.invalidateQueries({ queryKey: complianceKeys.norms() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.metrics(userProfile?.organizationId || "") });
    },
  });
}

// =============================================================================
// Audit Hooks
// =============================================================================

/**
 * Hook to fetch audits with optional filters
 */
export function useAudits(filters: AuditFilters = {}) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: complianceKeys.auditsList(orgId || "", filters),
    queryFn: () => getAudits(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time audit updates
 */
export function useRealtimeAudits() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToAudits(orgId, (newAudits) => {
      setAudits(newAudits);
      setIsLoading(false);
      
      // Update React Query cache
      queryClient.setQueryData(complianceKeys.auditsList(orgId, {}), newAudits);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { audits, isLoading, error };
}

/**
 * Hook to fetch a single audit by ID
 */
export function useAudit(auditId: string | undefined) {
  return useQuery({
    queryKey: complianceKeys.auditDetail(auditId || ""),
    queryFn: () => getAudit(auditId!),
    enabled: !!auditId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to create a new audit
 */
export function useCreateAudit() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<Audit, "id" | "createdAt" | "updatedAt" | "audit" | "findings" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createAudit(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.audits() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.metrics(userProfile?.organizationId || "") });
    },
  });
}

/**
 * Hook to update an audit
 */
export function useUpdateAudit() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      data,
    }: {
      auditId: string;
      data: Partial<Omit<Audit, "id" | "createdAt" | "audit" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateAudit(auditId, data, user.uid);
    },
    onSuccess: (_data, { auditId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
      queryClient.invalidateQueries({ queryKey: complianceKeys.audits() });
    },
  });
}

/**
 * Hook to delete an audit
 */
export function useDeleteAudit() {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auditId: string) => {
      await deleteAudit(auditId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.audits() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.metrics(userProfile?.organizationId || "") });
    },
  });
}

/**
 * Hook to start an audit
 */
export function useStartAudit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auditId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await startAudit(auditId, user.uid);
    },
    onSuccess: (_data, auditId) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
      queryClient.invalidateQueries({ queryKey: complianceKeys.audits() });
    },
  });
}

/**
 * Hook to complete an audit
 */
export function useCompleteAudit() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      summary,
    }: {
      auditId: string;
      summary: AuditSummary;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await completeAudit(auditId, summary, user.uid);
    },
    onSuccess: (_data, { auditId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
      queryClient.invalidateQueries({ queryKey: complianceKeys.audits() });
      queryClient.invalidateQueries({ queryKey: complianceKeys.metrics(userProfile?.organizationId || "") });
    },
  });
}

/**
 * Hook to cancel an audit
 */
export function useCancelAudit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auditId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await cancelAudit(auditId, user.uid);
    },
    onSuccess: (_data, auditId) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
      queryClient.invalidateQueries({ queryKey: complianceKeys.audits() });
    },
  });
}

/**
 * Hook to link a norm to an audit
 */
export function useLinkNormToAudit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      normId,
      auditId,
    }: {
      normId: string;
      auditId: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await linkNormToAudit(normId, auditId, user.uid);
    },
    onSuccess: (_data, { normId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.normDetail(normId) });
      queryClient.invalidateQueries({ queryKey: complianceKeys.norms() });
    },
  });
}

// =============================================================================
// Finding Hooks
// =============================================================================

/**
 * Hook to add a finding to an audit
 */
export function useAddFinding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      findingData,
    }: {
      auditId: string;
      findingData: Omit<Finding, "id" | "auditId" | "createdAt" | "updatedAt" | "audit" | "reference">;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      return addFinding(auditId, findingData, user.uid);
    },
    onSuccess: (_data, { auditId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
    },
  });
}

/**
 * Hook to update a finding
 */
export function useUpdateFinding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      findingId,
      data,
    }: {
      auditId: string;
      findingId: string;
      data: Partial<Omit<Finding, "id" | "auditId" | "createdAt" | "audit" | "reference" | "organizationId">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateFinding(auditId, findingId, data, user.uid);
    },
    onSuccess: (_data, { auditId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
    },
  });
}

/**
 * Hook to delete a finding
 */
export function useDeleteFinding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      findingId,
    }: {
      auditId: string;
      findingId: string;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await deleteFinding(auditId, findingId, user.uid);
    },
    onSuccess: (_data, { auditId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
    },
  });
}

/**
 * Hook to submit a response to a finding
 */
export function useSubmitFindingResponse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      findingId,
      response,
    }: {
      auditId: string;
      findingId: string;
      response: {
        rootCause: string;
        correction?: string;
        correctiveAction: string;
      };
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await submitFindingResponse(auditId, findingId, response, user.uid);
    },
    onSuccess: (_data, { auditId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
    },
  });
}

/**
 * Hook to verify and close a finding
 */
export function useVerifyFinding() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      findingId,
      verificationNotes,
      effective,
    }: {
      auditId: string;
      findingId: string;
      verificationNotes: string;
      effective: boolean;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await verifyFinding(auditId, findingId, verificationNotes, effective, user.uid);
    },
    onSuccess: (_data, { auditId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
      queryClient.invalidateQueries({ queryKey: complianceKeys.metrics(userProfile?.organizationId || "") });
    },
  });
}

/**
 * Hook to create a CAPA from a finding
 */
export function useCreateCAPAFromFinding() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      finding,
      auditId,
    }: {
      finding: Finding;
      auditId: string;
    }) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createCAPAFromFinding(finding, auditId, userProfile.organizationId, user.uid);
    },
    onSuccess: (_data, { auditId }) => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.auditDetail(auditId) });
      // Also invalidate CAPA queries
      queryClient.invalidateQueries({ queryKey: ["capas"] });
    },
  });
}

// =============================================================================
// Metrics Hooks
// =============================================================================

/**
 * Hook to fetch compliance metrics
 */
export function useComplianceMetrics() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: complianceKeys.metrics(orgId || ""),
    queryFn: () => getComplianceMetrics(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 1000,
  });
}

/**
 * Hook to fetch audit statistics
 */
export function useAuditStats() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: complianceKeys.auditStats(orgId || ""),
    queryFn: () => getAuditStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to get compliance counts for dashboard tiles
 */
export function useComplianceCounts() {
  const { data: metrics, isLoading, error, isError } = useComplianceMetrics();

  const counts = {
    complianceRate: metrics?.overallComplianceRate ?? 0,
    nonCompliantCount: metrics?.nonCompliantCount ?? 0,
    upcomingAudits: metrics?.upcomingAudits ?? 0,
    openFindings: metrics?.openFindings ?? 0,
    overdueFindings: metrics?.overdueFindings ?? 0,
    totalRequirements: metrics?.totalRequirements ?? 0,
    compliantCount: metrics?.compliantCount ?? 0,
    completedAuditsYTD: metrics?.completedAuditsYTD ?? 0,
  };

  // Only return error if it's a true error (not just empty data)
  return { 
    counts, 
    isLoading, 
    error: isError ? error : null 
  };
}

