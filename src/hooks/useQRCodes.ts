/**
 * QR Code Hooks
 * 
 * React Query hooks for QR code management.
 * Provides data fetching, mutations, and real-time updates for:
 * - QR code CRUD
 * - Scan tracking
 * - Statistics
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getQRCodes,
  getQRCode,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  subscribeToQRCodes,
  generateQRCodeForLocation,
  activateQRCode,
  deactivateQRCode,
  getQRCodeStats,
  validateQRCode,
  getQRCodePrintData,
  getQRCodesForBatchPrint,
  getQRCodeScans,
  recordQRCodeScan,
} from "@/services/qrCodeService";
import type { QRCodeConfig } from "@/types/capa";

// Query keys for caching
export const qrCodeKeys = {
  all: ["qrCodes"] as const,
  lists: () => [...qrCodeKeys.all, "list"] as const,
  list: (orgId: string, filters?: object) => [...qrCodeKeys.lists(), orgId, filters] as const,
  details: () => [...qrCodeKeys.all, "detail"] as const,
  detail: (id: string) => [...qrCodeKeys.details(), id] as const,
  stats: (orgId: string) => [...qrCodeKeys.all, "stats", orgId] as const,
  scans: (qrCodeId: string) => [...qrCodeKeys.all, "scans", qrCodeId] as const,
  validation: (shortCode: string) => [...qrCodeKeys.all, "validation", shortCode] as const,
  printData: (id: string) => [...qrCodeKeys.all, "print", id] as const,
};

// =============================================================================
// List & Fetch Hooks
// =============================================================================

/**
 * Hook to fetch QR codes with optional filters
 */
export function useQRCodes(
  filters: {
    siteId?: string;
    departmentId?: string;
    active?: boolean;
    searchQuery?: string;
  } = {}
) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: qrCodeKeys.list(orgId || "", filters),
    queryFn: () => getQRCodes(orgId!, filters),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time QR code updates
 */
export function useRealtimeQRCodes() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [qrCodes, setQRCodes] = useState<QRCodeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToQRCodes(orgId, (newQRCodes) => {
      setQRCodes(newQRCodes);
      setIsLoading(false);
      
      // Update React Query cache
      queryClient.setQueryData(qrCodeKeys.list(orgId), newQRCodes);
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { qrCodes, isLoading, error };
}

/**
 * Hook to fetch a single QR code by ID
 */
export function useQRCode(qrCodeId: string | undefined) {
  return useQuery({
    queryKey: qrCodeKeys.detail(qrCodeId || ""),
    queryFn: () => getQRCode(qrCodeId!),
    enabled: !!qrCodeId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to validate a QR code by short code
 */
export function useValidateQRCode(shortCode: string | undefined) {
  return useQuery({
    queryKey: qrCodeKeys.validation(shortCode || ""),
    queryFn: () => validateQRCode(shortCode!),
    enabled: !!shortCode,
    staleTime: 0, // Always check fresh
    retry: 1,
  });
}

/**
 * Hook to fetch QR code statistics
 */
export function useQRCodeStats() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: qrCodeKeys.stats(orgId || ""),
    queryFn: () => getQRCodeStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch QR code scans
 */
export function useQRCodeScans(qrCodeId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: qrCodeKeys.scans(qrCodeId || ""),
    queryFn: () => getQRCodeScans(qrCodeId!, limit),
    enabled: !!qrCodeId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get print data for a QR code
 */
export function useQRCodePrintData(qrCodeId: string | undefined) {
  return useQuery({
    queryKey: qrCodeKeys.printData(qrCodeId || ""),
    queryFn: () => getQRCodePrintData(qrCodeId!),
    enabled: !!qrCodeId,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Hook to create a new QR code
 */
export function useCreateQRCode() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<QRCodeConfig, "id" | "createdAt" | "updatedAt" | "audit" | "scanCount" | "organizationId">
    ) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return createQRCode(
        { ...data, organizationId: userProfile.organizationId },
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.all });
    },
  });
}

/**
 * Hook to generate a QR code for a location
 */
export function useGenerateQRCode() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      siteId: string;
      departmentId?: string;
      locationName: string;
      locationDescription: string;
      coordinates?: { latitude: number; longitude: number };
    }) => {
      if (!user?.uid || !userProfile?.organizationId) {
        throw new Error("Not authenticated");
      }
      return generateQRCodeForLocation(
        userProfile.organizationId,
        data.siteId,
        data.departmentId,
        data.locationName,
        data.locationDescription,
        data.coordinates,
        user.uid
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.all });
    },
  });
}

/**
 * Hook to update a QR code
 */
export function useUpdateQRCode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      qrCodeId,
      data,
    }: {
      qrCodeId: string;
      data: Partial<Omit<QRCodeConfig, "id" | "createdAt" | "audit" | "organizationId" | "scanCount">>;
    }) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await updateQRCode(qrCodeId, data, user.uid);
    },
    onSuccess: (_data, { qrCodeId }) => {
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.detail(qrCodeId) });
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.lists() });
    },
  });
}

/**
 * Hook to delete a QR code
 */
export function useDeleteQRCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qrCodeId: string) => {
      await deleteQRCode(qrCodeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.all });
    },
  });
}

/**
 * Hook to activate a QR code
 */
export function useActivateQRCode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qrCodeId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await activateQRCode(qrCodeId, user.uid);
    },
    onSuccess: (_data, qrCodeId) => {
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.detail(qrCodeId) });
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.lists() });
    },
  });
}

/**
 * Hook to deactivate a QR code
 */
export function useDeactivateQRCode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qrCodeId: string) => {
      if (!user?.uid) {
        throw new Error("Not authenticated");
      }
      await deactivateQRCode(qrCodeId, user.uid);
    },
    onSuccess: (_data, qrCodeId) => {
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.detail(qrCodeId) });
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.lists() });
    },
  });
}

/**
 * Hook to record a QR code scan (for public scanning)
 */
export function useRecordQRCodeScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      qrCodeId,
      organizationId,
      scannedBy,
      userAgent,
    }: {
      qrCodeId: string;
      organizationId: string;
      scannedBy?: string;
      userAgent?: string;
    }) => {
      return recordQRCodeScan(qrCodeId, organizationId, scannedBy, userAgent);
    },
    onSuccess: (_data, { qrCodeId }) => {
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.scans(qrCodeId) });
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.detail(qrCodeId) });
    },
  });
}

/**
 * Hook for batch print data
 */
export function useBatchPrintData(qrCodeIds: string[]) {
  return useQuery({
    queryKey: [...qrCodeKeys.all, "batchPrint", qrCodeIds],
    queryFn: () => getQRCodesForBatchPrint(qrCodeIds),
    enabled: qrCodeIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

