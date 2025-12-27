/**
 * CAPA AI Panel Component
 *
 * Main panel for AI-powered CAPA features including:
 * - CAPA suggestions
 * - Priority recommendations
 * - Root cause analysis
 * - Similar incident patterns
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Sparkles,
  Lightbulb,
  GitBranch,
  Link2,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AISuggestionCard } from "./AISuggestionCard";
import { RootCauseAnalysisPanel } from "./RootCauseAnalysisPanel";
import { SimilarIncidentsPanel } from "./SimilarIncidentsPanel";
import {
  useCAPARecommendations,
  usePriorityRecommendations,
  useAnalyzeIncident,
  useRootCauseAnalysis,
  useAcceptAIRecommendation,
  type CAPARecommendation,
} from "@/hooks/useCAPAAI";
import type { Incident, ActionPlan } from "@/types/capa";

interface CAPAAIPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIncident?: Incident | null;
  onCreateCapa?: (data: Partial<ActionPlan>) => void;
}

export function CAPAAIPanel({
  isOpen,
  onOpenChange,
  selectedIncident,
  onCreateCapa,
}: CAPAAIPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("suggestions");

  // Hooks
  const {
    data: suggestions,
    isLoading: loadingSuggestions,
    refetch: refetchSuggestions,
  } = useCAPARecommendations();

  const {
    data: priorityRecs,
  } = usePriorityRecommendations();

  const {
    data: incidentAnalysis,
    isLoading: loadingAnalysis,
  } = useAnalyzeIncident(selectedIncident?.id);

  const {
    data: rootCauseData,
    isLoading: loadingRootCause,
    refetch: refetchRootCause,
  } = useRootCauseAnalysis(selectedIncident?.id);

  const acceptMutation = useAcceptAIRecommendation();

  // Handlers
  const handleAcceptSuggestion = async (suggestion: CAPARecommendation) => {
    try {
      await acceptMutation.mutateAsync({
        recommendationId: suggestion.id,
        action: "accept",
      });

      if (onCreateCapa) {
        onCreateCapa({
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          priority: suggestion.priority,
          aiGenerated: true,
          aiConfidence: suggestion.confidence,
          aiSuggestions: [suggestion.reasoning],
          status: "draft",
        });
      }

      toast.success("Suggestion acceptée", {
        description: "Une nouvelle action CAPA a été créée",
      });
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible d'accepter la suggestion",
      });
    }
  };

  const handleRejectSuggestion = async (suggestion: CAPARecommendation) => {
    try {
      await acceptMutation.mutateAsync({
        recommendationId: suggestion.id,
        action: "reject",
      });
      toast.info("Suggestion rejetée");
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de rejeter la suggestion",
      });
    }
  };

  const handleModifySuggestion = (suggestion: CAPARecommendation) => {
    // Open CAPA form with pre-filled data
    if (onCreateCapa) {
      onCreateCapa({
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        priority: suggestion.priority,
        aiGenerated: true,
        aiConfidence: suggestion.confidence,
        status: "draft",
      });
    }
    onOpenChange(false);
  };

  const handleApplyRecommendation = (action: string) => {
    if (onCreateCapa) {
      onCreateCapa({
        title: action,
        description: `Action générée automatiquement à partir de l'analyse IA`,
        category: "preventif",
        priority: "moyenne",
        aiGenerated: true,
        status: "draft",
      });
    }
    toast.success("CAPA créée", {
      description: "L'action a été ajoutée comme nouvelle CAPA",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <SheetTitle>Assistant IA CAPA</SheetTitle>
                <p className="text-sm text-slate-500">
                  Suggestions et analyses intelligentes
                </p>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions" className="gap-1">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Suggestions</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-1">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Analyse</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-1">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
          </TabsList>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">
                Recommandations IA
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchSuggestions()}
                disabled={loadingSuggestions}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${
                    loadingSuggestions ? "animate-spin" : ""
                  }`}
                />
                Actualiser
              </Button>
            </div>

            {loadingSuggestions ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4" />
                <p className="text-slate-600">Génération des suggestions...</p>
              </div>
            ) : suggestions && suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <AISuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={handleAcceptSuggestion}
                    onReject={handleRejectSuggestion}
                    onModify={handleModifySuggestion}
                    isProcessing={acceptMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Lightbulb className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-600">Aucune suggestion disponible</p>
                <p className="text-sm text-slate-400">
                  L'IA analysera vos données pour générer des recommandations
                </p>
              </div>
            )}

            {/* Priority Recommendations */}
            {priorityRecs && priorityRecs.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  Ajustements de priorité suggérés
                </h3>
                <div className="space-y-2">
                  {priorityRecs.map((rec) => (
                    <div
                      key={rec.capaId}
                      className="p-3 rounded-lg bg-amber-50 border border-amber-100"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{rec.currentPriority}</Badge>
                        <span className="text-amber-600">→</span>
                        <Badge className="bg-amber-500 text-white">
                          {rec.suggestedPriority}
                        </Badge>
                        <span className="text-sm text-amber-700 ml-auto">
                          {rec.confidence}%
                        </span>
                      </div>
                      <p className="text-sm text-amber-800">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4 mt-4">
            {selectedIncident ? (
              <RootCauseAnalysisPanel
                analysis={rootCauseData ?? null}
                isLoading={loadingRootCause}
                onRefresh={() => refetchRootCause()}
                onApplyRecommendation={handleApplyRecommendation}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-600">Aucun incident sélectionné</p>
                <p className="text-sm text-slate-400">
                  Sélectionnez un incident pour lancer l'analyse des causes
                  racines
                </p>
              </div>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4 mt-4">
            <SimilarIncidentsPanel
              analysis={incidentAnalysis}
              isLoading={loadingAnalysis}
              onViewIncident={(id) => {
                // Navigate to incident detail
                toast.info("Navigation vers l'incident", { description: id });
              }}
              onFindSimilar={() => {
                // Trigger similar incident search
                toast.info("Recherche en cours...");
              }}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Trigger Button Component
export function CAPAAIPanelTrigger({
  onClick,
  suggestionCount,
}: {
  onClick: () => void;
  suggestionCount?: number;
}) {
  return (
    <Button
      onClick={onClick}
      className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
    >
      <Sparkles className="h-4 w-4" />
      Assistant IA
      {suggestionCount && suggestionCount > 0 && (
        <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
          {suggestionCount}
        </Badge>
      )}
    </Button>
  );
}

