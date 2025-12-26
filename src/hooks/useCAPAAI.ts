/**
 * CAPA AI Hooks
 * 
 * React Query hooks for AI-powered CAPA features.
 * Provides data fetching and mutations for:
 * - Priority recommendations
 * - Root cause analysis
 * - Action suggestions
 * - Similar incident pattern detection
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCAPAAIService, isCAPAAIEnabled } from "@/services/ai/capaAIService";
import type { Incident, ActionPlan, AIIncidentAnalysis, AIRecommendedAction } from "@/types/capa";
import type { Priority } from "@/types/common";
import type { AIContext, IncidentAnalysisResult, SuggestedCapa } from "@/services/ai/types";
import { Timestamp } from "firebase/firestore";

// Query keys for caching
export const capaAIKeys = {
  all: ["capa-ai"] as const,
  suggestions: (orgId: string) => [...capaAIKeys.all, "suggestions", orgId] as const,
  incidentAnalysis: (incidentId: string) => [...capaAIKeys.all, "incident-analysis", incidentId] as const,
  priorityRecommendations: (orgId: string) => [...capaAIKeys.all, "priority", orgId] as const,
  rootCause: (incidentId: string) => [...capaAIKeys.all, "root-cause", incidentId] as const,
  similarIncidents: (incidentId: string) => [...capaAIKeys.all, "similar", incidentId] as const,
  capaSuggestions: (incidentId: string) => [...capaAIKeys.all, "capa-suggestions", incidentId] as const,
};

// =============================================================================
// Types
// =============================================================================

export interface CAPARecommendation {
  id: string;
  title: string;
  description: string;
  priority: "critique" | "haute" | "moyenne" | "basse";
  category: "correctif" | "preventif";
  confidence: number;
  reasoning: string;
  suggestedAssignee?: string;
  suggestedDueDate?: Date;
  linkedIncidentIds?: string[];
  linkedTrainings?: string[];
  linkedEquipment?: string[];
}

export interface PriorityRecommendation {
  capaId: string;
  currentPriority: string;
  suggestedPriority: string;
  reasoning: string;
  confidence: number;
  factors: string[];
}

export interface RootCauseAnalysis {
  incidentId: string;
  rootCause: string;
  rootCauseCategory: string;
  confidence: number;
  contributingFactors: string[];
  immediateActions: string[];
  preventiveMeasures: string[];
  methodology: "5why" | "fishbone" | "barrier" | "fta" | "auto";
}

export interface SimilarPatternResult {
  incidentId: string;
  reference: string;
  similarity: number;
  commonFactors: string[];
  date: Date;
}

export interface FiveWhysResult {
  problem: string;
  whys: string[];
  rootCause: string;
  contributingFactors: Array<{ category: string; factor: string }>;
}

// =============================================================================
// CAPA-AI Hook
// =============================================================================

/**
 * Main hook for CAPA-AI functionality
 */
export function useCAPAAI() {
  const { user, userProfile } = useAuth();
  const serviceRef = useRef(getCAPAAIService());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled] = useState(isCAPAAIEnabled());

  // Initialize the service when user context is available
  useEffect(() => {
    if (!user || !userProfile || !isEnabled) return;

    const context: AIContext = {
      organizationId: userProfile.organizationId,
      userId: user.uid,
      userRole: userProfile.role,
      userName: userProfile.displayName || user.email || "Utilisateur",
      organizationName: userProfile.organizationId, // Would be fetched in a real app
      currentModule: "capa",
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
// AI Analysis Hooks
// =============================================================================

/**
 * Map AI priority to capa Priority type
 */
function mapToPriority(priority: string): Priority {
  switch (priority) {
    case "critique": return "critique";
    case "haute": return "haute";
    case "moyenne": return "moyenne";
    case "basse": return "basse";
    default: return "moyenne";
  }
}

/**
 * Convert IncidentAnalysisResult to AIIncidentAnalysis for component compatibility
 */
function convertToAIIncidentAnalysis(result: IncidentAnalysisResult): AIIncidentAnalysis {
  return {
    analyzedAt: Timestamp.now(),
    confidence: Math.round(result.confidence * 100),
    rootCause: result.rootCause,
    rootCauseCategory: result.rootCauseCategory,
    contributingFactors: result.contributingFactors,
    recommendedActions: result.suggestedCapas.map((capa, i): AIRecommendedAction => ({
      id: `action-${i}`,
      type: "capa",
      title: capa.title,
      description: capa.description,
      priority: mapToPriority(capa.priority),
      confidence: Math.round(capa.confidence * 100),
    })),
    similarIncidents: result.similarIncidents.map((inc) => ({
      id: inc.incidentId,
      reference: inc.reference,
      similarity: Math.round(inc.similarity * 100),
      date: Timestamp.fromDate(inc.date),
      summary: inc.commonFactors.join(", "),
    })),
    patternIdentified: result.similarIncidents.length > 0,
    patternDescription: result.similarIncidents.length > 0 
      ? `${result.similarIncidents.length} incident(s) similaire(s) identifié(s)` 
      : undefined,
    preventiveMeasures: result.preventiveMeasures,
    trainingRecommendations: result.suggestedCapas
      .filter(c => c.linkedTrainings?.length)
      .flatMap(c => c.linkedTrainings || []),
    equipmentRecommendations: result.suggestedCapas
      .filter(c => c.linkedEquipment?.length)
      .flatMap(c => c.linkedEquipment || []),
  };
}

/**
 * Hook to analyze an incident with AI
 */
export function useAnalyzeIncident(incidentId: string | undefined) {
  const { service, isInitialized, isEnabled } = useCAPAAI();
  const [streamedContent, setStreamedContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  const query = useQuery({
    queryKey: capaAIKeys.incidentAnalysis(incidentId || ""),
    queryFn: async (): Promise<AIIncidentAnalysis | null> => {
      if (!incidentId || !isInitialized) return null;

      setIsStreaming(true);
      setStreamedContent("");

      try {
        const result = await service.streamAnalysis(incidentId, (chunk) => {
          setStreamedContent((prev) => prev + chunk);
        });
        return convertToAIIncidentAnalysis(result);
      } finally {
        setIsStreaming(false);
      }
    },
    enabled: !!incidentId && isInitialized && isEnabled,
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
 * Hook for root cause analysis with 5 Whys
 */
export function useRootCauseAnalysis(incidentId: string | undefined) {
  const { service, isInitialized, isEnabled } = useCAPAAI();

  return useQuery({
    queryKey: capaAIKeys.rootCause(incidentId || ""),
    queryFn: async (): Promise<RootCauseAnalysis | null> => {
      if (!incidentId || !isInitialized) return null;
      const result = await service.analyzeIncident(incidentId);
      return {
        incidentId: result.incidentId,
        rootCause: result.rootCause,
        rootCauseCategory: result.rootCauseCategory,
        confidence: Math.round(result.confidence * 100),
        contributingFactors: result.contributingFactors,
        immediateActions: result.immediateActions,
        preventiveMeasures: result.preventiveMeasures,
        methodology: "auto",
      };
    },
    enabled: !!incidentId && isInitialized && isEnabled,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to perform 5 Whys analysis
 */
export function useFiveWhysAnalysis() {
  const { service, isInitialized, isEnabled } = useCAPAAI();

  return useMutation({
    mutationFn: async ({
      problem,
      initialCause,
    }: {
      problem: string;
      initialCause?: string;
    }): Promise<FiveWhysResult> => {
      if (!isInitialized || !isEnabled) {
        throw new Error("CAPA-AI not initialized");
      }
      return service.performFiveWhys(problem, initialCause);
    },
  });
}

/**
 * Hook to find similar incidents
 */
export function useFindSimilarIncidents(incidentId: string | undefined) {
  const { service, isInitialized, isEnabled } = useCAPAAI();

  return useQuery({
    queryKey: capaAIKeys.similarIncidents(incidentId || ""),
    queryFn: async () => {
      if (!incidentId || !isInitialized) return [];
      return service.findSimilarIncidents(incidentId);
    },
    enabled: !!incidentId && isInitialized && isEnabled,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to get CAPA suggestions from an incident
 */
export function useCAPASuggestions(incidentId: string | undefined, rootCause?: string) {
  const { service, isInitialized, isEnabled } = useCAPAAI();

  return useQuery({
    queryKey: capaAIKeys.capaSuggestions(incidentId || ""),
    queryFn: async (): Promise<SuggestedCapa[]> => {
      if (!incidentId || !isInitialized) return [];
      return service.generateCAPASuggestions(incidentId, rootCause);
    },
    enabled: !!incidentId && isInitialized && isEnabled,
    staleTime: 15 * 60 * 1000,
  });
}

// =============================================================================
// AI Generation Hooks
// =============================================================================

/**
 * Hook to generate CAPA from incident using AI
 */
export function useGenerateCAPAFromIncident() {
  const { service, isInitialized, isEnabled } = useCAPAAI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: Incident): Promise<Partial<ActionPlan>> => {
      if (!isInitialized || !isEnabled) {
        // Fallback to basic generation without AI
        return {
          title: `Action corrective: ${incident.description.substring(0, 50)}...`,
          description: `Action générée suite à l'incident ${incident.reference}.\n\nDescription: ${incident.description}`,
          category: "correctif",
          priority: incident.severity === "critical" ? "critique" : incident.severity === "severe" ? "haute" : "moyenne",
          status: "draft",
          sourceType: "incident",
          sourceIncidentId: incident.id,
          aiGenerated: false,
        };
      }

      // Use AI to generate CAPA suggestions
      const suggestions = await service.generateCAPASuggestions(incident.id);
      
      if (suggestions.length === 0) {
        throw new Error("Aucune suggestion générée");
      }

      const suggestion = suggestions[0];

      return {
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        priority: suggestion.priority,
        status: "draft",
        sourceType: "incident",
        sourceIncidentId: incident.id,
        aiGenerated: true,
        aiConfidence: Math.round(suggestion.confidence * 100),
        aiSuggestions: suggestions.slice(1).map(s => s.title),
        checklistItems: [],
        linkedTrainingIds: suggestion.linkedTrainings || [],
        linkedEquipmentIds: suggestion.linkedEquipment || [],
        linkedDocumentIds: [],
        comments: [],
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capaAIKeys.all });
    },
  });
}

/**
 * Hook to generate action suggestions using AI
 */
export function useGenerateActionSuggestions() {
  const { service, isInitialized, isEnabled } = useCAPAAI();

  return useMutation({
    mutationFn: async ({
      incidentId,
    }: {
      context?: string;
      incidentId?: string;
      existingActions?: string[];
    }): Promise<AIRecommendedAction[]> => {
      if (!isInitialized || !isEnabled || !incidentId) {
        // Return default suggestions
        return [
          {
            id: crypto.randomUUID(),
            type: "capa",
            title: "Renforcer les procédures de sécurité",
            description: "Mettre à jour et diffuser les procédures de sécurité",
            priority: "haute",
            confidence: 70,
          },
        ];
      }

      const suggestions = await service.generateCAPASuggestions(incidentId);
      
      return suggestions.map((s): AIRecommendedAction => ({
        id: crypto.randomUUID(),
        type: "capa",
        title: s.title,
        description: s.description,
        priority: mapToPriority(s.priority),
        confidence: Math.round(s.confidence * 100),
      }));
    },
  });
}

/**
 * Hook to suggest root cause using AI
 */
export function useSuggestRootCause() {
  const { service, isInitialized, isEnabled } = useCAPAAI();

  return useMutation({
    mutationFn: async ({
      incident,
      methodology,
    }: {
      incident: Incident;
      methodology?: "5why" | "fishbone" | "barrier" | "fta" | "auto";
    }): Promise<RootCauseAnalysis> => {
      if (!isInitialized || !isEnabled) {
        // Fallback mock response
        return {
          incidentId: incident.id,
          rootCause: "Analyse IA non disponible",
          rootCauseCategory: "unknown",
          confidence: 0,
          contributingFactors: [],
          immediateActions: [],
          preventiveMeasures: [],
          methodology: methodology || "auto",
        };
      }

      const analysis = await service.analyzeIncident(incident.id);
      
      return {
        incidentId: incident.id,
        rootCause: analysis.rootCause,
        rootCauseCategory: analysis.rootCauseCategory,
        confidence: analysis.confidence,
        contributingFactors: analysis.contributingFactors,
        immediateActions: analysis.immediateActions,
        preventiveMeasures: analysis.preventiveMeasures,
        methodology: methodology || "auto",
      };
    },
  });
}

/**
 * Hook to analyze CAPA effectiveness
 */
export function useAnalyzeCAPAEffectiveness(capaId: string | undefined) {
  const { service, isInitialized, isEnabled } = useCAPAAI();

  return useQuery({
    queryKey: [...capaAIKeys.all, "effectiveness", capaId],
    queryFn: async () => {
      if (!capaId || !isInitialized) return null;
      return service.analyzeCAPAEffectiveness(capaId);
    },
    enabled: !!capaId && isInitialized && isEnabled,
    staleTime: 15 * 60 * 1000,
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to get AI panel state (for UI)
 */
export function useCAPAAIPanelState() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"suggestions" | "analysis" | "patterns">("suggestions");

  return {
    isOpen,
    setIsOpen,
    togglePanel: () => setIsOpen(!isOpen),
    activeTab,
    setActiveTab,
  };
}

/**
 * Hook to accept AI recommendations
 */
export function useAcceptAIRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recommendationId,
      action,
    }: {
      recommendationId: string;
      action: "accept" | "reject" | "modify";
    }) => {
      // Track AI recommendation acceptance
      // In production, this would log to analytics
      console.log(`AI recommendation ${recommendationId}: ${action}`);
      return { recommendationId, action };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capaAIKeys.all });
    },
  });
}

/**
 * Hook to get CAPA recommendations (uses real AI when available)
 */
export function useCAPARecommendations() {
  const { userProfile } = useAuth();
  const { isEnabled } = useCAPAAI();
  const orgId = userProfile?.organizationId;
  const [isGenerating, setIsGenerating] = useState(false);

  const query = useQuery({
    queryKey: capaAIKeys.suggestions(orgId || ""),
    queryFn: async (): Promise<CAPARecommendation[]> => {
      // For now, return empty array - in production,
      // this would aggregate suggestions from open incidents
      if (!isEnabled) {
        return getMockCAPARecommendations();
      }
      // TODO: Implement batch analysis of open incidents
      return [];
    },
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    ...query,
    isGenerating,
    setIsGenerating,
    isAIEnabled: isEnabled,
  };
}

/**
 * Hook to get priority recommendations for existing CAPAs
 */
export function usePriorityRecommendations() {
  const { userProfile } = useAuth();
  const { isEnabled } = useCAPAAI();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: capaAIKeys.priorityRecommendations(orgId || ""),
    queryFn: async (): Promise<PriorityRecommendation[]> => {
      // In production, this would analyze CAPAs and suggest priority changes
      if (!isEnabled) {
        return getMockPriorityRecommendations();
      }
      // TODO: Implement CAPA priority analysis
      return [];
    },
    enabled: !!orgId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// =============================================================================
// Mock Data Functions (fallback when AI is disabled)
// =============================================================================

function getMockCAPARecommendations(): CAPARecommendation[] {
  return [
    {
      id: "rec-1",
      title: "Renforcer la signalisation zone de stockage",
      description: "Installer une signalisation supplémentaire dans la zone de stockage chimique",
      priority: "haute",
      category: "preventif",
      confidence: 92,
      reasoning: "Basé sur 3 incidents similaires dans les 6 derniers mois",
      linkedIncidentIds: ["inc-1", "inc-2", "inc-3"],
      suggestedDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: "rec-2",
      title: "Formation manutention manuelle",
      description: "Organiser une formation sur les gestes et postures pour le personnel",
      priority: "moyenne",
      category: "preventif",
      confidence: 85,
      reasoning: "Taux de TMS en augmentation de 15% sur le trimestre",
      linkedTrainings: ["training-ergo"],
      suggestedDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ];
}

function getMockPriorityRecommendations(): PriorityRecommendation[] {
  return [
    {
      capaId: "capa-1",
      currentPriority: "moyenne",
      suggestedPriority: "haute",
      reasoning: "L'échéance approche et le taux de completion est faible",
      confidence: 88,
      factors: ["Échéance dans 5 jours", "Progression: 20%"],
    },
  ];
}
