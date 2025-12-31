/**
 * CAPA Page - Corrective and Preventive Actions
 * 
 * Main page for managing CAPAs with Kanban/List views.
 * Enforces CRUD permissions using FeatureGuard and useFeaturePermissions.
 */

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Sparkles, Loader2, Brain, BarChart3, GraduationCap, BookOpen, Award, Users, AlertTriangle, Grid3X3, List, AlertCircle, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CAPAStatusTiles,
  CAPAFilters,
  ViewToggle,
  CAPAKanbanBoard,
  CAPAListView,
  CAPACalendarView,
  CAPADetailModal,
  CAPAForm,
} from "@/components/capa";
import { IntelligenceDashboard, AIHistoryPanel } from "@/components/capa/ai";
import { saveCAPAAIHistory, generateHistoryTitle, getCAPAAIHistory } from "@/services/ai/capaAIHistoryService";
import {
  TrainingCatalog,
  TrainingForm,
  TrainingProgress,
  TrainingDetailModal,
} from "@/components/training";
import { useTrainingCounts } from "@/hooks/useTrainings";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CRUDGuard from "@/components/auth/CRUDGuard";
import type { TrainingPlan } from "@/types/capa";
import {
  IncidentCard,
  IncidentsList,
  IncidentFilters,
  IncidentFilterValues,
  IncidentForm,
  IncidentDetailModal,
} from "@/components/incidents";
import { useIncidents, useIncidentStats } from "@/hooks/useIncidents";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { History } from "lucide-react";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { getCAPAAIService } from "@/services/ai/capaAIService";
import { getIncidents } from "@/services/incidentService";
import { toast } from "sonner";
import type { ActionPlan, CAPAFilters as CAPAFiltersType, ViewMode, Incident } from "@/types/capa";
import type { SuggestedCapa } from "@/services/ai/types";

// Prefill data type for creating CAPA from other modules
interface CAPAPrefill {
  title?: string;
  description?: string;
  source?: string;
  sourceId?: string;
  priority?: "critique" | "haute" | "moyenne" | "basse";
  category?: "correctif" | "preventif";
}

export default function CAPAPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canCreate, canRead } = useFeaturePermissions("capa");
  const { canPerformAction, canAccessFeature } = useAuth();
  const { session } = useAuth();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filters, setFilters] = useState<CAPAFiltersType>({});
  const [selectedCapa, setSelectedCapa] = useState<ActionPlan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCapa, setEditingCapa] = useState<ActionPlan | null>(null);
  const [prefillData, setPrefillData] = useState<CAPAPrefill | null>(null);

  // AI State
  const [aiTab, setAiTab] = useState<"dashboard" | "suggestions" | "history">("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedCapa[]>([]);

  // Training State
  const { counts: trainingCounts, isLoading: isLoadingTrainingStats } = useTrainingCounts();
  const [trainingActiveTab, setTrainingActiveTab] = useState<"catalog" | "my-trainings" | "admin">("catalog");
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingPlan | null>(null);
  const [isTrainingDetailOpen, setIsTrainingDetailOpen] = useState(false);
  const canCreateTraining = canPerformAction("training", "create");
  const canManageTrainings = canPerformAction("training", "update");
  const canAccessTraining = canAccessFeature("training");
  const canAccessIncidents = canAccessFeature("incidents");
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Incidents State
  const [incidentViewMode, setIncidentViewMode] = useState<"grid" | "list">("list");
  const [incidentFilters, setIncidentFilters] = useState<IncidentFilterValues>({});
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isIncidentDetailOpen, setIsIncidentDetailOpen] = useState(false);
  const { data: incidentsList = [], isLoading: isLoadingIncidents } = useIncidents(incidentFilters);
  const { data: incidentStats, isLoading: isLoadingIncidentStats } = useIncidentStats();
  const canCreateIncident = canPerformAction("incidents", "create");

  // Load latest suggestions from history on mount
  useEffect(() => {
    if (!session?.organizationId) return;

    const loadLatestSuggestions = async () => {
      try {
        // Get the latest suggestions entry from history
        const historyEntries = await getCAPAAIHistory(session.organizationId, {
          type: "suggestions",
          limit: 1,
        });

        if (historyEntries.length > 0 && historyEntries[0].suggestions) {
          setSuggestions(historyEntries[0].suggestions);
        }
      } catch (error) {
        console.warn("Failed to load latest suggestions from history:", error);
      }
    };

    loadLatestSuggestions();
  }, [session?.organizationId]);

  // Analyze incidents handler
  const handleAnalyzeIncidents = async () => {
    if (!session?.organizationId) {
      toast.error("Session non valide. Veuillez vous reconnecter.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Fetch incidents
      const fetchedIncidents = await getIncidents(session.organizationId);
      setIncidents(fetchedIncidents);

      // Switch to dashboard view
      setAiTab("dashboard");

      // Save analysis to history
      try {
        await saveCAPAAIHistory({
          organizationId: session.organizationId,
          type: "analysis",
          title: generateHistoryTitle("analysis", fetchedIncidents.length),
          description: `Tableau de bord d'intelligence CAPA avec ${fetchedIncidents.length} incident(s)`,
          status: "completed",
          incidentsAnalyzed: fetchedIncidents.length,
          createdBy: {
            id: session.uid,
            name: session.displayName || "Utilisateur",
          },
        });
      } catch (historyError) {
        console.warn("Failed to save analysis to history:", historyError);
      }

      toast.success(`Analyse terminée: ${fetchedIncidents.length} incident(s) analysé(s).`);
    } catch (error) {
      console.error("Failed to analyze incidents:", error);
      toast.error("Impossible d'analyser les incidents. Veuillez réessayer.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate suggestions handler
  const handleGenerateSuggestions = async () => {
    if (!session?.organizationId) {
      toast.error("Session non valide. Veuillez vous reconnecter.");
      return;
    }

    setIsGenerating(true);
    try {
      const capaAI = getCAPAAIService();

      // Initialize the AI service
      capaAI.initialize({
        organizationId: session.organizationId,
        userId: session.uid,
        userRole: session.role || "user",
        userName: session.displayName || "User",
        language: "fr",
        permissions: [],
      });

      // Fetch incidents first if not already loaded
      let incidentsToAnalyze = incidents;
      if (incidentsToAnalyze.length === 0) {
        incidentsToAnalyze = await getIncidents(session.organizationId);
        setIncidents(incidentsToAnalyze);
      }

      // Generate suggestions for each unanalyzed incident (max 5)
      const recentIncidents = incidentsToAnalyze
        .filter(i => !i.aiAnalysis && i.status !== "closed")
        .slice(0, 5);

      if (recentIncidents.length === 0) {
        toast.info("Tous les incidents récents ont déjà été analysés.");
        setIsGenerating(false);
        return;
      }

      const allSuggestions: SuggestedCapa[] = [];

      for (const incident of recentIncidents) {
        try {
          const incidentSuggestions = await capaAI.generateCAPASuggestions(incident.id);
          allSuggestions.push(...incidentSuggestions);
        } catch (err) {
          console.warn(`Failed to analyze incident ${incident.id}:`, err);
        }
      }

      setSuggestions(allSuggestions);
      setAiTab("suggestions");

      // Save to history
      if (allSuggestions.length > 0) {
        try {
          await saveCAPAAIHistory({
            organizationId: session.organizationId,
            type: "suggestions",
            title: generateHistoryTitle("suggestions", allSuggestions.length),
            description: `Analyse de ${recentIncidents.length} incident(s) non analysé(s)`,
            status: "completed",
            suggestions: allSuggestions,
            incidentsAnalyzed: recentIncidents.length,
            confidence: allSuggestions.reduce((acc, s) => acc + (s.confidence || 0.7), 0) / allSuggestions.length,
            createdBy: session.uid,
            createdByName: session.displayName || "User",
          });
        } catch (historyError) {
          console.warn("Failed to save suggestions to history:", historyError);
        }
      }

      toast.success(`${allSuggestions.length} suggestion(s) CAPA générée(s) à partir de ${recentIncidents.length} incident(s).`);
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      toast.error("Impossible de générer des suggestions. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Accept a suggestion and create a CAPA
  const handleAcceptSuggestion = (suggestion: SuggestedCapa) => {
    setPrefillData({
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority,
      category: suggestion.category,
      source: "ai_suggestion",
    });
    setEditingCapa(null);
    setShowFormModal(true);

    // Remove from suggestions list
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  // Dismiss a suggestion
  const handleDismissSuggestion = (suggestion: SuggestedCapa) => {
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  // Handle incoming navigation state for creating CAPA from other modules
  useEffect(() => {
    const state = location.state as { createMode?: boolean; prefill?: CAPAPrefill } | null;
    if (state?.createMode && state?.prefill && canCreate) {
      setPrefillData(state.prefill);
      setEditingCapa(null);
      setShowFormModal(true);
      // Clear the state to prevent re-opening on navigation
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, canCreate, navigate, location.pathname]);

  const handleCAPAClick = (capa: ActionPlan) => {
    setSelectedCapa(capa);
    setShowDetailModal(true);
  };

  const handleCreateClick = () => {
    setEditingCapa(null);
    setShowFormModal(true);
  };

  const handleEditClick = (capa: ActionPlan) => {
    setEditingCapa(capa);
    setShowFormModal(true);
    setShowDetailModal(false);
  };

  const handleEditFromDetail = () => {
    if (selectedCapa) {
      setEditingCapa(selectedCapa);
      setShowFormModal(true);
      setShowDetailModal(false);
    }
  };

  // Training handlers
  const handleOpenTrainingForm = (training?: TrainingPlan) => {
    setSelectedTraining(training || null);
    setShowTrainingForm(true);
  };

  const handleCloseTrainingForm = () => {
    setShowTrainingForm(false);
    setSelectedTraining(null);
  };

  const handleOpenTrainingDetail = (training: TrainingPlan) => {
    setSelectedTraining(training);
    setIsTrainingDetailOpen(true);
  };

  const handleCloseTrainingDetail = () => {
    setIsTrainingDetailOpen(false);
    setSelectedTraining(null);
  };

  const handleEditTrainingFromDetail = () => {
    setIsTrainingDetailOpen(false);
    setShowTrainingForm(true);
  };

  // Incident handlers
  const handleIncidentFilterChange = (newFilters: IncidentFilterValues) => {
    setIncidentFilters(newFilters);
  };

  const handleOpenIncidentForm = (incident?: Incident) => {
    setSelectedIncident(incident || null);
    setShowIncidentForm(true);
  };

  const handleCloseIncidentForm = () => {
    setShowIncidentForm(false);
    setSelectedIncident(null);
  };

  const handleOpenIncidentDetail = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsIncidentDetailOpen(true);
  };

  const handleCloseIncidentDetail = () => {
    setIsIncidentDetailOpen(false);
    setSelectedIncident(null);
  };

  const handleEditIncidentFromDetail = () => {
    setIsIncidentDetailOpen(false);
    setShowIncidentForm(true);
  };

  // Calculate incident trend
  const incidentTrend = incidentStats
    ? incidentStats.thisMonth - incidentStats.lastMonth
    : 0;
  const IncidentTrendIcon = incidentTrend > 0 ? TrendingUp : incidentTrend < 0 ? TrendingDown : Minus;
  const incidentTrendColor = incidentTrend > 0 ? "text-red-500" : incidentTrend < 0 ? "text-green-500" : "text-muted-foreground";

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Accès restreint</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          Vous n'avez pas les permissions nécessaires pour accéder au module CAPA.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CAPA Room</h1>
          <p className="text-muted-foreground mt-1">
            Actions Correctives et Préventives
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle action
            </Button>
          )}
        </div>
      </div>

      {/* KPI Status Tiles */}
      <CAPAStatusTiles />

      {/* Main content tabs */}
      <Tabs defaultValue="actions" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="actions">Plan d'actions</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              CAPA-AI
            </TabsTrigger>
            {canAccessTraining && (
              <TabsTrigger value="formations" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Formations
              </TabsTrigger>
            )}
            {canAccessIncidents && (
              <TabsTrigger value="incidents" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Incidents
              </TabsTrigger>
            )}
          </TabsList>

          {/* View toggle - only for actions tab */}
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>

        <TabsContent value="actions" className="space-y-4">
          {/* Filters */}
          <CAPAFilters filters={filters} onFiltersChange={setFilters} />

          {/* View content */}
          {viewMode === "kanban" ? (
            <CAPAKanbanBoard
              onCAPAClick={handleCAPAClick}
              onCreateClick={handleCreateClick}
            />
          ) : viewMode === "list" ? (
            <CAPAListView
              filters={filters}
              onCAPAClick={handleCAPAClick}
              onEditClick={handleEditClick}
            />
          ) : (
            <CAPACalendarView
              onCAPAClick={handleCAPAClick}
              onCreateClick={handleCreateClick}
            />
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          {/* Loading Overlay */}
          {(isAnalyzing || isGenerating) && (
            <div className="rounded-lg border bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-8">
              <div className="flex flex-col items-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-violet-600 mb-4" />
                <h3 className="text-lg font-semibold">
                  {isAnalyzing ? "Analyse en cours..." : "Génération des suggestions..."}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {isAnalyzing
                    ? "L'IA analyse vos incidents pour identifier les patterns et risques."
                    : "L'IA génère des recommandations CAPA personnalisées."
                  }
                </p>
              </div>
            </div>
          )}

          {/* AI Navigation - Always visible */}
          {!isAnalyzing && !isGenerating && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                <Button
                  variant={aiTab === "dashboard" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setAiTab("dashboard")}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Tableau de bord
                </Button>
                <Button
                  variant={aiTab === "suggestions" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setAiTab("suggestions")}
                  className="gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Suggestions ({suggestions.length})
                </Button>
                <Button
                  variant={aiTab === "history" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setAiTab("history")}
                  className="gap-2"
                >
                  <History className="h-4 w-4" />
                  Historique
                </Button>
              </div>
            </div>
          )}

          {/* Intelligence Dashboard */}
          {aiTab === "dashboard" && !isAnalyzing && !isGenerating && (
            <IntelligenceDashboard
              onCapaClick={(capaId) => {
                // Navigate to CAPA detail
                setSelectedCapa({ id: capaId } as ActionPlan);
                setShowDetailModal(true);
              }}
              onViewDetails={(section) => {
                console.log("View details:", section);
                // Handle navigation to specific sections
              }}
            />
          )}

          {/* AI Suggestions */}
          {aiTab === "suggestions" && !isAnalyzing && !isGenerating && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Suggestions CAPA</h3>
                  <p className="text-sm text-muted-foreground">
                    {suggestions.length} suggestion(s) basée(s) sur l'analyse des incidents
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Actualiser
                </Button>
              </div>

              {suggestions.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h4 className="font-medium">Aucune suggestion</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Cliquez sur "Générer des suggestions" pour analyser vos incidents
                    et obtenir des recommandations CAPA.
                  </p>
                  <Button
                    className="mt-4 gap-2"
                    onClick={handleGenerateSuggestions}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Générer des suggestions
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {suggestions.map((suggestion, i) => (
                    <div
                      key={`suggestion-${i}`}
                      className="rounded-lg border p-4 space-y-3 bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-violet-500" />
                          <span className="text-xs text-muted-foreground capitalize">
                            {suggestion.category}
                          </span>
                        </div>
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded dark:bg-violet-900/40 dark:text-violet-300">
                          {Math.round(suggestion.confidence * 100)}% confiance
                        </span>
                      </div>
                      <h4 className="font-medium text-sm line-clamp-2">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded ${suggestion.priority === "critique" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
                          suggestion.priority === "haute" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" :
                            suggestion.priority === "moyenne" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                          {suggestion.priority}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDismissSuggestion(suggestion)}
                        >
                          Ignorer
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAcceptSuggestion(suggestion)}
                        >
                          Accepter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* AI History */}
          {aiTab === "history" && !isAnalyzing && !isGenerating && (
            <AIHistoryPanel
              onApplySuggestion={handleAcceptSuggestion}
              onViewDetails={(entry) => {
                console.log("View history details:", entry);
                // Could show a modal with full details
              }}
            />
          )}
        </TabsContent>

        {/* Formations Tab Content */}
        {canAccessTraining && (
          <TabsContent value="formations" className="space-y-6">
            {/* Training Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Formations
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Planifiez et suivez les formations SST
                </p>
              </div>
              {canCreateTraining && (
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleOpenTrainingForm()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle formation
                </Button>
              )}
            </div>

            {/* Training Stats Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total formations</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingTrainingStats ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{trainingCounts.totalPlans}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Actives</CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingTrainingStats ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-primary">{trainingCounts.activePlans}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Obligatoires</CardTitle>
                  <Award className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingTrainingStats ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-red-600">{trainingCounts.mandatoryPlans}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingTrainingStats ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600">
                        {trainingCounts.completionRate}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {trainingCounts.completedEnrollments}/{trainingCounts.totalEnrollments} terminées
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Training Inner Tabs */}
            <Tabs value={trainingActiveTab} onValueChange={(v) => setTrainingActiveTab(v as typeof trainingActiveTab)}>
              <TabsList>
                <TabsTrigger value="catalog">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Catalogue
                </TabsTrigger>
                <TabsTrigger value="my-trainings">
                  <Award className="h-4 w-4 mr-2" />
                  Mes formations
                </TabsTrigger>
                {canManageTrainings && (
                  <TabsTrigger value="admin">
                    <Users className="h-4 w-4 mr-2" />
                    Administration
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="catalog" className="mt-4">
                <CRUDGuard feature="training" action="read">
                  <TrainingCatalog
                    onCreateClick={() => handleOpenTrainingForm()}
                    onTrainingClick={handleOpenTrainingDetail}
                  />
                </CRUDGuard>
              </TabsContent>

              <TabsContent value="my-trainings" className="mt-4">
                <TrainingProgress />
              </TabsContent>

              {canManageTrainings && (
                <TabsContent value="admin" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Administration des formations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TrainingCatalog
                        onCreateClick={() => handleOpenTrainingForm()}
                        onTrainingClick={handleOpenTrainingDetail}
                        onEnrollClick={(training) => {
                          setSelectedTraining(training);
                          setIsTrainingDetailOpen(true);
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </TabsContent>
        )}

        {/* Incidents Tab Content */}
        {canAccessIncidents && (
          <TabsContent value="incidents" className="space-y-6">
            {/* Incidents Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Incidents
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Gérez et suivez les incidents de sécurité
                </p>
              </div>
              {canCreateIncident && (
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => handleOpenIncidentForm()}
                  data-testid="declare-incident-button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Déclarer un incident
                </Button>
              )}
            </div>

            {/* Incidents Stats Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total incidents</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingIncidentStats ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{incidentStats?.total || 0}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
                  <IncidentTrendIcon className={`h-4 w-4 ${incidentTrendColor}`} />
                </CardHeader>
                <CardContent>
                  {isLoadingIncidentStats ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{incidentStats?.thisMonth || 0}</div>
                      {incidentTrend !== 0 && (
                        <p className={`text-xs ${incidentTrendColor}`}>
                          {incidentTrend > 0 ? "+" : ""}{incidentTrend} vs mois dernier
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En investigation</CardTitle>
                  <Clock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingIncidentStats ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-amber-600">
                      {incidentStats?.pendingInvestigation || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critiques</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingIncidentStats ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-red-600">
                      {incidentStats?.bySeverity?.critical || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Filters and View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <IncidentFilters
                onFilterChange={handleIncidentFilterChange}
                currentFilters={incidentFilters}
              />

              <ToggleGroup
                type="single"
                value={incidentViewMode}
                onValueChange={(value) => value && setIncidentViewMode(value as "grid" | "list")}
              >
                <ToggleGroupItem value="grid" aria-label="Vue grille">
                  <Grid3X3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Vue liste">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Incidents Content */}
            <CRUDGuard feature="incidents" action="read">
              {isLoadingIncidents ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : incidentsList.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
                      <AlertTriangle className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      Aucun incident trouvé
                    </h3>
                    <p className="text-slate-500 mt-2 max-w-md">
                      {Object.keys(incidentFilters).length > 0
                        ? "Modifiez vos filtres ou créez un nouveau signalement"
                        : "Vous n'avez pas encore signalé d'incidents. Cliquez sur le bouton ci-dessus pour en créer un."}
                    </p>
                  </CardContent>
                </Card>
              ) : incidentViewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incidentsList.map((incident) => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      onClick={() => handleOpenIncidentDetail(incident)}
                    />
                  ))}
                </div>
              ) : (
                <IncidentsList
                  filters={incidentFilters}
                  onIncidentClick={handleOpenIncidentDetail}
                  onEditClick={handleOpenIncidentForm}
                />
              )}
            </CRUDGuard>
          </TabsContent>
        )}
      </Tabs>

      {/* Detail Modal */}
      <CAPADetailModal
        capaId={selectedCapa?.id || null}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onEditClick={handleEditFromDetail}
      />

      {/* Create/Edit Form Modal */}
      <CAPAForm
        capa={editingCapa}
        prefill={prefillData}
        open={showFormModal}
        onOpenChange={(open) => {
          setShowFormModal(open);
          if (!open) {
            setPrefillData(null); // Clear prefill when form closes
          }
        }}
      />

      {/* Training Form Modal */}
      <TrainingForm
        training={selectedTraining}
        isOpen={showTrainingForm}
        onClose={handleCloseTrainingForm}
      />

      {/* Training Detail Modal */}
      {selectedTraining && isTrainingDetailOpen && (
        <TrainingDetailModal
          training={selectedTraining}
          isOpen={isTrainingDetailOpen}
          onClose={handleCloseTrainingDetail}
          onEdit={handleEditTrainingFromDetail}
        />
      )}

      {/* Incident Form Modal */}
      <IncidentForm
        incident={selectedIncident}
        isOpen={showIncidentForm}
        onClose={handleCloseIncidentForm}
      />

      {/* Incident Detail Modal */}
      {selectedIncident && isIncidentDetailOpen && (
        <IncidentDetailModal
          incident={selectedIncident}
          isOpen={isIncidentDetailOpen}
          onClose={handleCloseIncidentDetail}
          onEdit={handleEditIncidentFromDetail}
        />
      )}
    </div>
  );
}
