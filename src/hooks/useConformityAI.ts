/**
 * Conformity AI Hooks
 * 
 * React Query hooks for AI-powered compliance features.
 * Provides data fetching and mutations for:
 * - Gap analysis
 * - Audit planning recommendations
 * - CAPA generation from findings
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    getConformityAIService,
    isConformityAIEnabled
} from "@/services/ai/conformityAIService";
import type {
    AIContext,
    ComplianceGapResult,
    AuditRecommendation,
    ComplianceRecommendation
} from "@/services/ai/types";

// Query keys for caching
export const conformityAIKeys = {
    all: ["conformity-ai"] as const,
    gapAnalysis: (orgId: string) => [...conformityAIKeys.all, "gap-analysis", orgId] as const,
    auditPlanning: (orgId: string) => [...conformityAIKeys.all, "audit-planning", orgId] as const,
    capaFromFinding: (auditId: string, findingId: string) =>
        [...conformityAIKeys.all, "capa-finding", auditId, findingId] as const,
};

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Main hook for Conformity-AI functionality
 */
export function useConformityAI() {
    const { user, userProfile } = useAuth();
    const serviceRef = useRef(getConformityAIService());
    const [isInitialized, setIsInitialized] = useState(false);
    const [isEnabled] = useState(isConformityAIEnabled());

    // Initialize the service when user context is available
    useEffect(() => {
        if (!user || !userProfile || !isEnabled) return;

        const context: AIContext = {
            organizationId: userProfile.organizationId,
            userId: user.uid,
            userRole: userProfile.role,
            userName: userProfile.displayName || user.email || "Utilisateur",
            organizationName: userProfile.organizationId,
            currentModule: "compliance",
        };

        serviceRef.current.initialize(context);
        setIsInitialized(true);
    }, [user, userProfile, isEnabled]);

    return {
        service: serviceRef.current,
        isInitialized,
        isEnabled,
    };
}

// =============================================================================
// Analysis Hooks
// =============================================================================

/**
 * Hook for gap analysis
 */
export function useGapAnalysis() {
    const { service, isInitialized, isEnabled } = useConformityAI();
    const { userProfile } = useAuth();
    const orgId = userProfile?.organizationId;
    const [streamedContent, setStreamedContent] = useState<string>("");
    const [isStreaming, setIsStreaming] = useState(false);

    const query = useQuery({
        queryKey: conformityAIKeys.gapAnalysis(orgId || ""),
        queryFn: async (): Promise<ComplianceGapResult | null> => {
            if (!isInitialized) return null;

            setIsStreaming(true);
            setStreamedContent("");

            try {
                const result = await service.streamGapAnalysis((chunk) => {
                    setStreamedContent((prev) => prev + chunk);
                });
                return result;
            } finally {
                setIsStreaming(false);
            }
        },
        enabled: !!orgId && isInitialized && isEnabled,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });

    return {
        ...query,
        streamedContent,
        isStreaming,
        isAIEnabled: isEnabled,
    };
}

/**
 * Hook for audit planning recommendations
 */
export function useAuditPlanning() {
    const { service, isInitialized, isEnabled } = useConformityAI();
    const { userProfile } = useAuth();
    const orgId = userProfile?.organizationId;

    return useQuery({
        queryKey: conformityAIKeys.auditPlanning(orgId || ""),
        queryFn: async (): Promise<AuditRecommendation[]> => {
            if (!isInitialized) return [];
            return service.getAuditPlanningRecommendations();
        },
        enabled: !!orgId && isInitialized && isEnabled,
        staleTime: 30 * 60 * 1000,
    });
}

/**
 * Hook to manually trigger gap analysis
 */
export function usePerformGapAnalysis() {
    const { service, isInitialized, isEnabled } = useConformityAI();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<ComplianceGapResult> => {
            if (!isInitialized || !isEnabled) {
                throw new Error("Conformity-AI not initialized");
            }
            return service.performGapAnalysis();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: conformityAIKeys.all });
        },
    });
}

// =============================================================================
// Generation Hooks
// =============================================================================

/**
 * Hook to generate CAPA from audit finding
 */
export function useGenerateCAPAFromFinding() {
    const { service, isInitialized, isEnabled } = useConformityAI();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            auditId,
            findingId,
        }: {
            auditId: string;
            findingId: string;
        }): Promise<ComplianceRecommendation[]> => {
            if (!isInitialized || !isEnabled) {
                // Fallback without AI
                return [
                    {
                        type: "capa",
                        title: "Action corrective requise",
                        description: "Traiter le constat d'audit identifié",
                        priority: "high",
                        relatedNormIds: [],
                    },
                ];
            }

            return service.generateCAPAFromFinding(auditId, findingId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: conformityAIKeys.all });
        },
    });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook for AI panel state
 */
export function useConformityAIPanelState() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"gaps" | "audits" | "recommendations">("gaps");

    return {
        isOpen,
        setIsOpen,
        togglePanel: () => setIsOpen(!isOpen),
        activeTab,
        setActiveTab,
    };
}

