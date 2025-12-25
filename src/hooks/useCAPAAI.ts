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
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  ActionPlan,
  Incident,
  AIIncidentAnalysis,
  AIRecommendedAction,
} from "@/types/capa";

// Query keys for caching
export const capaAIKeys = {
  all: ["capa-ai"] as const,
  suggestions: (orgId: string) => [...capaAIKeys.all, "suggestions", orgId] as const,
  incidentAnalysis: (incidentId: string) => [...capaAIKeys.all, "incident-analysis", incidentId] as const,
  priorityRecommendations: (orgId: string) => [...capaAIKeys.all, "priority", orgId] as const,
  rootCause: (incidentId: string) => [...capaAIKeys.all, "root-cause", incidentId] as const,
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

// =============================================================================
// AI Analysis Hooks
// =============================================================================

/**
 * Hook to get AI suggestions for CAPAs
 * This would typically call an AI service/API
 */
export function useCAPARecommendations() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const [isGenerating, setIsGenerating] = useState(false);

  const query = useQuery({
    queryKey: capaAIKeys.suggestions(orgId || ""),
    queryFn: async (): Promise<CAPARecommendation[]> => {
      // In production, this would call the AI service
      // For now, return mock suggestions
      return getMockCAPARecommendations();
    },
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    ...query,
    isGenerating,
    setIsGenerating,
  };
}

/**
 * Hook to analyze an incident with AI
 */
export function useAnalyzeIncident(incidentId: string | undefined) {
  return useQuery({
    queryKey: capaAIKeys.incidentAnalysis(incidentId || ""),
    queryFn: async (): Promise<AIIncidentAnalysis | null> => {
      if (!incidentId) return null;
      // In production, this would call the AI service
      return getMockIncidentAnalysis(incidentId);
    },
    enabled: !!incidentId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get priority recommendations for existing CAPAs
 */
export function usePriorityRecommendations() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: capaAIKeys.priorityRecommendations(orgId || ""),
    queryFn: async (): Promise<PriorityRecommendation[]> => {
      // In production, this would call the AI service
      return getMockPriorityRecommendations();
    },
    enabled: !!orgId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook for root cause analysis
 */
export function useRootCauseAnalysis(incidentId: string | undefined) {
  return useQuery({
    queryKey: capaAIKeys.rootCause(incidentId || ""),
    queryFn: async (): Promise<RootCauseAnalysis | null> => {
      if (!incidentId) return null;
      // In production, this would call the AI service
      return getMockRootCauseAnalysis(incidentId);
    },
    enabled: !!incidentId,
    staleTime: 30 * 60 * 1000,
  });
}

// =============================================================================
// AI Generation Hooks
// =============================================================================

/**
 * Hook to generate CAPA from incident using AI
 */
export function useGenerateCAPAFromIncident() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: Incident): Promise<Partial<ActionPlan>> => {
      // In production, this would call the AI service
      // For now, return a mock generated CAPA
      await simulateAIDelay();
      
      return {
        title: `Action corrective: ${incident.description.substring(0, 50)}...`,
        description: `Action générée par IA suite à l'incident ${incident.reference}.\n\nDescription: ${incident.description}\n\nActions immédiates: ${incident.immediateActions}`,
        category: "correctif",
        priority: incident.severity === "critical" ? "critique" : incident.severity === "severe" ? "haute" : "moyenne",
        status: "draft",
        sourceType: "incident",
        sourceIncidentId: incident.id,
        aiGenerated: true,
        aiConfidence: 85,
        aiSuggestions: [
          "Analyser les causes racines",
          "Mettre en place des barrières préventives",
          "Former le personnel concerné",
          "Réviser les procédures existantes",
        ],
        checklistItems: [],
        linkedTrainingIds: [],
        linkedEquipmentIds: [],
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
  return useMutation({
    mutationFn: async ({
      context,
      incidentId,
      existingActions,
    }: {
      context: string;
      incidentId?: string;
      existingActions?: string[];
    }): Promise<AIRecommendedAction[]> => {
      // In production, this would call the AI service
      await simulateAIDelay();
      
      return [
        {
          id: crypto.randomUUID(),
          type: "capa",
          title: "Renforcer les procédures de sécurité",
          description: "Mettre à jour et diffuser les procédures de sécurité relatives à cette situation",
          priority: "high",
          confidence: 88,
        },
        {
          id: crypto.randomUUID(),
          type: "training",
          title: "Formation de sensibilisation",
          description: "Organiser une formation pour le personnel concerné",
          priority: "medium",
          confidence: 82,
        },
        {
          id: crypto.randomUUID(),
          type: "equipment",
          title: "Équipement de protection",
          description: "Évaluer le besoin en EPI supplémentaires",
          priority: "medium",
          confidence: 75,
        },
      ];
    },
  });
}

/**
 * Hook to find similar incidents using AI
 */
export function useFindSimilarIncidents() {
  return useMutation({
    mutationFn: async (incident: Incident): Promise<SimilarPatternResult[]> => {
      // In production, this would call the AI service
      await simulateAIDelay();
      
      return getMockSimilarIncidents(incident);
    },
  });
}

/**
 * Hook to suggest root cause using AI
 */
export function useSuggestRootCause() {
  return useMutation({
    mutationFn: async ({
      incident,
      methodology,
    }: {
      incident: Incident;
      methodology?: "5why" | "fishbone" | "barrier" | "fta" | "auto";
    }): Promise<RootCauseAnalysis> => {
      // In production, this would call the AI service
      await simulateAIDelay();
      
      return {
        incidentId: incident.id,
        rootCause: "Manque de supervision et formation insuffisante du personnel",
        rootCauseCategory: "organizational",
        confidence: 78,
        contributingFactors: [
          "Procédures non suivies",
          "Équipement de protection non porté",
          "Manque de signalisation",
          "Pression de production",
        ],
        immediateActions: [
          "Rappeler les règles de sécurité",
          "Vérifier les EPI disponibles",
          "Renforcer la supervision",
        ],
        preventiveMeasures: [
          "Mettre à jour les procédures",
          "Organiser des formations de rappel",
          "Installer une signalisation supplémentaire",
          "Revoir la planification des tâches",
        ],
        methodology: methodology || "auto",
      };
    },
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
      // In production, this would track AI recommendation acceptance
      await simulateAIDelay(300);
      return { recommendationId, action };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capaAIKeys.all });
    },
  });
}

// =============================================================================
// Mock Data Functions
// =============================================================================

function simulateAIDelay(ms = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMockCAPARecommendations(): CAPARecommendation[] {
  return [
    {
      id: "rec-1",
      title: "Renforcer la signalisation zone de stockage",
      description: "Installer une signalisation supplémentaire dans la zone de stockage chimique suite aux incidents récents",
      priority: "haute",
      category: "preventif",
      confidence: 92,
      reasoning: "Basé sur 3 incidents similaires dans les 6 derniers mois impliquant la zone de stockage",
      linkedIncidentIds: ["inc-1", "inc-2", "inc-3"],
      suggestedDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: "rec-2",
      title: "Formation manutention manuelle",
      description: "Organiser une formation sur les gestes et postures pour le personnel de l'atelier B",
      priority: "moyenne",
      category: "preventif",
      confidence: 85,
      reasoning: "Taux de TMS en augmentation de 15% sur le trimestre",
      linkedTrainings: ["training-ergo"],
      suggestedDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: "rec-3",
      title: "Audit équipements de levage",
      description: "Planifier un audit complet des équipements de levage et de manutention",
      priority: "haute",
      category: "preventif",
      confidence: 78,
      reasoning: "Dernier audit datant de plus de 12 mois",
      suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ];
}

function getMockIncidentAnalysis(incidentId: string): AIIncidentAnalysis {
  return {
    analyzedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    confidence: 85,
    rootCause: "Manque de supervision et non-respect des procédures établies",
    rootCauseCategory: "organizational",
    contributingFactors: [
      "Personnel non formé sur les nouvelles procédures",
      "Équipement de protection non disponible",
      "Pression sur les délais de production",
      "Signalisation insuffisante",
    ],
    recommendedActions: [
      {
        id: "action-1",
        type: "capa",
        title: "Réviser les procédures de travail",
        description: "Mettre à jour et diffuser les procédures de sécurité",
        priority: "high",
        confidence: 90,
      },
      {
        id: "action-2",
        type: "training",
        title: "Formation de rappel sécurité",
        description: "Organiser des sessions de formation pour tout le personnel concerné",
        priority: "high",
        confidence: 88,
      },
      {
        id: "action-3",
        type: "equipment",
        title: "Équipements de protection individuelle",
        description: "Vérifier et compléter le stock d'EPI",
        priority: "medium",
        confidence: 75,
      },
    ],
    similarIncidents: [
      {
        id: "similar-1",
        reference: "INC-2025-001",
        similarity: 85,
        date: { seconds: Date.now() / 1000 - 86400 * 30, nanoseconds: 0 } as any,
        summary: "Incident similaire dans le même atelier",
      },
    ],
    patternIdentified: true,
    patternDescription: "Tendance récurrente liée au manque de supervision pendant les changements d'équipe",
    preventiveMeasures: [
      "Renforcer la supervision pendant les transitions",
      "Mettre en place des points de contrôle",
      "Améliorer la communication entre équipes",
    ],
    trainingRecommendations: [
      "Formation gestes et postures",
      "Sensibilisation aux risques chimiques",
    ],
    equipmentRecommendations: [
      "Gants de protection nitrile",
      "Lunettes de sécurité",
    ],
  };
}

function getMockPriorityRecommendations(): PriorityRecommendation[] {
  return [
    {
      capaId: "capa-1",
      currentPriority: "moyenne",
      suggestedPriority: "haute",
      reasoning: "L'échéance approche et le taux de completion est faible",
      confidence: 88,
      factors: ["Échéance dans 5 jours", "Progression: 20%", "2 dépendances non résolues"],
    },
    {
      capaId: "capa-2",
      currentPriority: "haute",
      suggestedPriority: "critique",
      reasoning: "Nouvel incident lié à cette action non résolue",
      confidence: 92,
      factors: ["Incident INC-2025-045 lié", "Impact potentiel élevé"],
    },
  ];
}

function getMockRootCauseAnalysis(incidentId: string): RootCauseAnalysis {
  return {
    incidentId,
    rootCause: "Défaillance dans le processus de vérification pré-opératoire",
    rootCauseCategory: "process",
    confidence: 82,
    contributingFactors: [
      "Checklist pré-démarrage non suivie",
      "Formation initiale insuffisante",
      "Absence de contrôle hiérarchique",
    ],
    immediateActions: [
      "Suspendre les opérations concernées",
      "Rappeler les procédures à tout le personnel",
      "Vérifier les équipements similaires",
    ],
    preventiveMeasures: [
      "Digitaliser la checklist pré-démarrage",
      "Renforcer la formation initiale",
      "Mettre en place des audits surprise",
    ],
    methodology: "5why",
  };
}

function getMockSimilarIncidents(incident: Incident): SimilarPatternResult[] {
  return [
    {
      incidentId: "inc-similar-1",
      reference: "INC-2024-089",
      similarity: 87,
      commonFactors: ["Même zone", "Même type d'équipement", "Conditions similaires"],
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      incidentId: "inc-similar-2",
      reference: "INC-2024-056",
      similarity: 72,
      commonFactors: ["Même département", "Facteurs humains similaires"],
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    },
  ];
}

