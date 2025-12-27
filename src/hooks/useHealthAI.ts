/**
 * Health AI Hooks
 * 
 * React Query hooks for AI-powered health analysis features.
 * Provides data fetching and mutations for:
 * - Trend analysis
 * - Risk group identification
 * - Prevention recommendations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getHealthAIService, 
  isHealthAIEnabled 
} from "@/services/ai/healthAIService";
import type { 
  AIContext, 
  HealthTrendResult,
  RiskGroup,
  PreventionRecommendation 
} from "@/services/ai/types";

// Query keys for caching
export const healthAIKeys = {
  all: ["health-ai"] as const,
  trends: (orgId: string) => [...healthAIKeys.all, "trends", orgId] as const,
  riskGroups: (orgId: string) => [...healthAIKeys.all, "risk-groups", orgId] as const,
  recommendations: (orgId: string) => [...healthAIKeys.all, "recommendations", orgId] as const,
  fullAnalysis: (orgId: string) => [...healthAIKeys.all, "full-analysis", orgId] as const,
};

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Main hook for Health-AI functionality
 */
export function useHealthAI() {
  const { user, userProfile } = useAuth();
  const serviceRef = useRef(getHealthAIService());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled] = useState(isHealthAIEnabled());

  // Initialize the service when user context is available
  useEffect(() => {
    if (!user || !userProfile || !isEnabled) return;

    const context: AIContext = {
      organizationId: userProfile.organizationId,
      userId: user.uid,
      userRole: userProfile.role,
      userName: userProfile.displayName || user.email || "Utilisateur",
      organizationName: userProfile.organizationId,
      currentModule: "health",
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
 * Hook for full health trend analysis
 */
export function useHealthTrendAnalysis() {
  const { service, isInitialized, isEnabled } = useHealthAI();
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const [streamedContent, setStreamedContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  const query = useQuery({
    queryKey: healthAIKeys.fullAnalysis(orgId || ""),
    queryFn: async (): Promise<HealthTrendResult | null> => {
      if (!isInitialized) return null;

      setIsStreaming(true);
      setStreamedContent("");

      try {
        const result = await service.streamTrendAnalysis((chunk) => {
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
 * Hook for risk group identification
 */
export function useRiskGroups() {
  const { service, isInitialized, isEnabled } = useHealthAI();
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: healthAIKeys.riskGroups(orgId || ""),
    queryFn: async (): Promise<RiskGroup[]> => {
      if (!isInitialized) return [];
      return service.identifyRiskGroups();
    },
    enabled: !!orgId && isInitialized && isEnabled,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for prevention recommendations
 */
export function usePreventionRecommendations(analysisSummary?: string) {
  const { service, isInitialized, isEnabled } = useHealthAI();
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: [...healthAIKeys.recommendations(orgId || ""), analysisSummary],
    queryFn: async (): Promise<PreventionRecommendation[]> => {
      if (!isInitialized) return [];
      return service.getPreventionRecommendations(analysisSummary);
    },
    enabled: !!orgId && isInitialized && isEnabled,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to manually trigger trend analysis
 */
export function usePerformHealthAnalysis() {
  const { service, isInitialized, isEnabled } = useHealthAI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<HealthTrendResult> => {
      if (!isInitialized || !isEnabled) {
        throw new Error("Health-AI not initialized");
      }
      return service.performTrendAnalysis();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthAIKeys.all });
    },
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook for AI panel state
 */
export function useHealthAIPanelState() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trends" | "risks" | "recommendations">("trends");

  return {
    isOpen,
    setIsOpen,
    togglePanel: () => setIsOpen(!isOpen),
    activeTab,
    setActiveTab,
  };
}

// =============================================================================
// Mock Data (fallback when AI is disabled)
// =============================================================================

export function getMockHealthAnalysis(): HealthTrendResult {
  return {
    trends: [
      {
        type: "tms",
        direction: "increasing",
        changePercent: 15,
        affectedDepartments: ["Production", "Logistique"],
        affectedEmployeeCount: 23,
        severity: "high",
        confidence: 0.89,
        periodMonths: 6,
      },
      {
        type: "rps",
        direction: "stable",
        changePercent: 2,
        affectedDepartments: ["Commercial", "R&D"],
        affectedEmployeeCount: 18,
        severity: "medium",
        confidence: 0.82,
        periodMonths: 3,
      },
      {
        type: "respiratory",
        direction: "decreasing",
        changePercent: 28,
        affectedDepartments: ["Production"],
        affectedEmployeeCount: 12,
        severity: "low",
        confidence: 0.91,
        periodMonths: 6,
      },
    ],
    riskGroups: [
      {
        name: "Opérateurs production ligne A",
        description: "Exposés aux mouvements répétitifs et postures contraignantes",
        riskFactors: ["Gestes répétitifs", "Port de charges", "Postures statiques"],
        primaryRisk: "tms",
        riskLevel: "high",
        employeeCount: 15,
        departmentIds: ["production"],
        suggestedActions: [
          "Rotation des postes toutes les 2 heures",
          "Formation gestes et postures",
          "Évaluation ergonomique des postes",
        ],
        priority: "immediate",
      },
      {
        name: "Équipe maintenance",
        description: "Exposés aux risques chimiques lors des interventions",
        riskFactors: ["Solvants", "Huiles", "Poussières métalliques"],
        primaryRisk: "chemical",
        riskLevel: "medium",
        employeeCount: 8,
        departmentIds: ["maintenance"],
        suggestedActions: [
          "Mise à jour des fiches de données de sécurité",
          "Vérification des EPI",
          "Surveillance biologique renforcée",
        ],
        priority: "short_term",
      },
    ],
    recommendations: [
      {
        type: "prevention",
        title: "Programme de prévention TMS",
        description: "Mettre en place un programme complet de prévention des troubles musculo-squelettiques",
        rationale: "L'analyse montre une augmentation de 15% des TMS sur 6 mois",
        priority: "haute",
        expectedImpact: "high",
        confidence: 0.89,
        targetDepartments: ["Production", "Logistique"],
        targetEmployeeCount: 23,
        suggestedCapaTitle: "Programme prévention TMS - Production",
      },
      {
        type: "training",
        title: "Formation gestes et postures",
        description: "Organiser des sessions de formation sur les bonnes pratiques de manutention",
        rationale: "65% des employés n'ont pas suivi de formation depuis plus de 2 ans",
        priority: "haute",
        expectedImpact: "medium",
        confidence: 0.85,
        targetDepartments: ["Production"],
        targetEmployeeCount: 35,
      },
      {
        type: "equipment",
        title: "Renouvellement EPI respiratoires",
        description: "Planifier le renouvellement des équipements de protection respiratoire",
        rationale: "Les EPI actuels approchent de leur date de péremption",
        priority: "moyenne",
        expectedImpact: "medium",
        confidence: 0.78,
        targetDepartments: ["Production", "Maintenance"],
        targetEmployeeCount: 28,
      },
    ],
    alerts: [
      {
        type: "trend_detected",
        severity: "warning",
        title: "Tendance TMS en hausse",
        description: "Augmentation de 15% détectée sur 6 mois",
        affectedCount: 23,
      },
    ],
  };
}

