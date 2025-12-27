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
import { saveAIAnalysis } from "@/services/complianceService";
import { complianceKeys } from "@/hooks/useCompliance";
import type {
    AIContext,
    ComplianceGapResult,
    AuditRecommendation,
    ComplianceRecommendation
} from "@/services/ai/types";
import type { AIRecommendationRecord, AIGapRecord, AIAuditRecommendationRecord } from "@/types/conformity";

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
 * Helper function to remove undefined values from an object
 * Firebase doesn't accept undefined values in setDoc()
 */
function removeUndefinedValues<T extends Record<string, unknown>>(obj: T): T {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result as T;
}

/**
 * Hook to manually trigger gap analysis and save results to database
 */
export function usePerformGapAnalysis() {
    const { service, isInitialized, isEnabled } = useConformityAI();
    const { user, userProfile } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<ComplianceGapResult> => {
            if (!isInitialized || !isEnabled) {
                throw new Error("Conformity-AI not initialized");
            }
            
            const result = await service.performGapAnalysis();
            
            // Save the analysis to the database
            if (user?.uid && userProfile?.organizationId) {
                // Map the result to our database format, removing undefined values
                const gaps: AIGapRecord[] = (result.gaps || []).map(g => removeUndefinedValues({
                    normId: g.normId || "",
                    normCode: g.normCode || "",
                    requirementId: g.requirementId || "",
                    clause: g.clause || "",
                    description: g.description || "",
                    severity: g.severity || "minor",
                    suggestedAction: g.suggestedAction,
                }));
                
                const recommendations: AIRecommendationRecord[] = (result.recommendations || []).map((r, i) => removeUndefinedValues({
                    id: `rec-${i}`,
                    type: r.type === "audit" ? "audit" : r.type === "training" ? "training" : r.type === "documentation" ? "documentation" : "capa",
                    priority: r.priority || "medium",
                    title: r.title || "",
                    description: r.description || "",
                    normId: r.relatedNormIds?.[0],
                }));
                
                const auditRecommendations: AIAuditRecommendationRecord[] = (result.prioritizedAudits || []).map(a => removeUndefinedValues({
                    normId: a.normId || "",
                    normCode: a.normCode || "",
                    priority: a.priority || "planned",
                    reason: a.reason || "",
                    suggestedDate: a.suggestedDate instanceof Date 
                        ? a.suggestedDate.toISOString() 
                        : a.suggestedDate,
                }));
                
                await saveAIAnalysis(
                    {
                        organizationId: userProfile.organizationId,
                        type: "gap_analysis",
                        description: `Analyse d'écarts avec score de ${result.overallScore ?? 0}%`,
                        overallScore: result.overallScore ?? 0,
                        gaps,
                        recommendations,
                        auditRecommendations,
                        totalNorms: 0, // Will be updated from metrics
                        totalRequirements: 0,
                        compliantCount: 0,
                        nonCompliantCount: gaps.length,
                        aiModel: "gemini",
                        analyzedBy: user.uid,
                        analyzedByName: userProfile.displayName || user.email || "Unknown",
                    },
                    user.uid,
                    userProfile.displayName || user.email || "Unknown"
                );
            }
            
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: conformityAIKeys.all });
            queryClient.invalidateQueries({ queryKey: complianceKeys.aiAnalyses() });
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

