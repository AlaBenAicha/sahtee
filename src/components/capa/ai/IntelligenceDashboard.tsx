/**
 * CAPA-AI Intelligence Dashboard
 *
 * Comprehensive dashboard showing CAPA health metrics, predictions,
 * patterns, escalations, and AI-powered insights.
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Gauge,
  GitBranch,
  Lightbulb,
  LineChart,
  Loader2,
  RefreshCcw,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  AlertCircle,
  XCircle,
} from "lucide-react";
import {
  getCAPAHealthMonitor,
  type PortfolioHealth,
} from "@/services/ai/capaHealthMonitor";
import { getPredictionService, type PredictionResult } from "@/services/ai/predictionService";
import { getPatternService } from "@/services/ai/patternService";
import { getRiskIntelligenceHub, type RiskIntelligenceReport } from "@/services/ai/riskIntelligenceHub";
import { getCAPAAIHistory, saveCAPAAIHistory, generateHistoryTitle } from "@/services/ai/capaAIHistoryService";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { PatternCluster } from "@/services/ai/types";
import { toast } from "sonner";

// Local type for pattern display
interface PatternDisplay {
  id: string;
  name: string;
  description: string;
  incidentCount: number;
  commonFactors: string[];
  suggestedActions: string[];
}

// Helper to safely convert various date formats to Date object
function toDate(value: unknown): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  // Firestore Timestamp
  if (typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  // String or number timestamp
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date();
}

// =============================================================================
// Types
// =============================================================================

interface IntelligenceDashboardProps {
  className?: string;
  onCapaClick?: (capaId: string) => void;
  onViewDetails?: (section: string) => void;
}

// =============================================================================
// Component
// =============================================================================

export function IntelligenceDashboard({
  className,
  onCapaClick,
  onViewDetails,
}: IntelligenceDashboardProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCache, setIsLoadingCache] = useState(true);
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);
  const [portfolioHealth, setPortfolioHealth] = useState<PortfolioHealth | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [patterns, setPatterns] = useState<PatternDisplay[]>([]);
  const [riskReport, setRiskReport] = useState<RiskIntelligenceReport | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Load cached data from history on mount (does NOT run AI analysis)
  useEffect(() => {
    if (!session?.organizationId) return;

    const loadCachedData = async () => {
      setIsLoadingCache(true);
      try {
        // Load the most recent analysis from history
        const analysisHistory = await getCAPAAIHistory(session.organizationId, {
          type: "analysis",
          limit: 1,
        });

        if (analysisHistory.length > 0) {
          const lastAnalysis = analysisHistory[0];
          
          // Load predictions
          if (lastAnalysis.predictions && lastAnalysis.predictions.length > 0) {
            setPredictions(lastAnalysis.predictions[0] || null);
          }
          
          // Load patterns
          if (lastAnalysis.patterns && lastAnalysis.patterns.length > 0) {
            const pats = lastAnalysis.patterns.map((cluster: PatternCluster) => ({
              id: cluster.id,
              name: cluster.category,
              description: `${cluster.incidentIds?.length || 0} incidents similaires identifiés`,
              incidentCount: cluster.incidentIds?.length || 0,
              commonFactors: cluster.commonFactors || [],
              suggestedActions: cluster.suggestedActions?.map(a => a.title) || [],
            }));
            setPatterns(pats);
          }
          
          // Load portfolio health
          if (lastAnalysis.portfolioHealth) {
            setPortfolioHealth(lastAnalysis.portfolioHealth);
          }
          
          // Load risk report
          if (lastAnalysis.riskReport) {
            setRiskReport(lastAnalysis.riskReport);
          }
          
          // Set last refresh time from history
          if (lastAnalysis.createdAt) {
            setLastRefresh(toDate(lastAnalysis.createdAt));
          }
          
          setHasRunAnalysis(true);
        }
      } catch (error) {
        console.warn("Failed to load cached data:", error);
      } finally {
        setIsLoadingCache(false);
      }
    };

    loadCachedData();
  }, [session?.organizationId]);

  // Run full AI analysis (called manually by user)
  const runAnalysis = async () => {
    if (!session?.organizationId) return;

    setIsLoading(true);
    try {
      const healthMonitor = getCAPAHealthMonitor();
      const predictionService = getPredictionService();
      const patternService = getPatternService();
      const riskHub = getRiskIntelligenceHub();

      // Initialize services if needed
      const context = {
        organizationId: session.organizationId,
        userId: session.uid,
        userRole: session.role || "user",
        userName: session.displayName || "User",
        language: "fr" as const,
        permissions: [],
      };

      healthMonitor.initialize(context);
      predictionService.initialize(context);
      patternService.initialize(context);
      riskHub.initialize(context);

      // Fetch data with error handling for each service
      let health: PortfolioHealth | null = null;
      let preds: PredictionResult | null = null;
      let pats: PatternDisplay[] = [];
      let patternClusters: PatternCluster[] = [];
      let report: RiskIntelligenceReport | null = null;

      try {
        health = await healthMonitor.runHealthCheck();
      } catch (err) {
        console.warn("Health monitor error:", err);
      }

      try {
        preds = await predictionService.generatePredictions();
      } catch (err) {
        console.warn("Prediction service error:", err);
      }

      try {
        const patternAnalysis = await patternService.analyzePatterns(365);
        patternClusters = patternAnalysis?.clusters || [];
        // Convert clusters to display format
        pats = patternClusters.map((cluster: PatternCluster) => ({
          id: cluster.id,
          name: cluster.category,
          description: `${cluster.incidentIds.length} incidents similaires identifiés`,
          incidentCount: cluster.incidentIds.length,
          commonFactors: cluster.commonFactors,
          suggestedActions: cluster.suggestedActions?.map(a => a.title) || [],
        }));
      } catch (err) {
        console.warn("Pattern service error:", err);
      }

      try {
        report = await riskHub.generateIntelligenceReport();
      } catch (err) {
        console.warn("Risk intelligence hub error:", err);
      }

      setPortfolioHealth(health);
      setPredictions(preds);
      setPatterns(pats);
      setRiskReport(report);
      setLastRefresh(new Date());
      setHasRunAnalysis(true);

      // Save complete analysis to history for future caching
      try {
        await saveCAPAAIHistory({
          organizationId: session.organizationId,
          type: "analysis",
          title: generateHistoryTitle("analysis", 1, "Tableau de bord"),
          description: `Analyse complète du tableau de bord CAPA-AI`,
          status: "completed",
          predictions: preds ? [preds] : [],
          patterns: patternClusters,
          portfolioHealth: health || undefined,
          riskReport: report || undefined,
          confidence: preds?.confidenceLevel ? preds.confidenceLevel / 100 : undefined,
          createdBy: session.uid,
          createdByName: session.displayName || "User",
        });
      } catch (historyError) {
        console.warn("Failed to save analysis to history:", historyError);
      }

      toast.success("Analyse terminée avec succès");
    } catch (error) {
      console.error("Failed to fetch intelligence data:", error);
      toast.error("Échec de l'analyse. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh handler - runs full analysis
  const handleRefresh = () => {
    runAnalysis();
  };

  // Health score color
  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  // Health score badge
  const getHealthBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-secondary text-primary border-secondary">Sain</Badge>;
      case "at_risk":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">À risque</Badge>;
      case "critical":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Critique</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-700 border-red-200">En retard</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowRight className="h-4 w-4 text-gray-500" />;
    }
  };

  // Loading cached data
  if (isLoadingCache) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="flex flex-col items-center gap-4">
          <Brain className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Empty state - no analysis has been run yet and no cached data
  if (!hasRunAnalysis && !portfolioHealth && !predictions && patterns.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Intelligence CAPA
            </h2>
            <p className="text-muted-foreground">
              Tableau de bord analytique et prédictif
            </p>
          </div>
        </div>

        {/* Empty state card */}
        <div className="rounded-lg border bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-12">
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="rounded-full bg-violet-100 dark:bg-violet-900/50 p-6 mb-6">
              <Sparkles className="h-12 w-12 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Lancer l'analyse IA</h3>
            <p className="text-muted-foreground mb-6">
              L'analyse IA évalue la santé de vos CAPAs, détecte les patterns récurrents,
              génère des prédictions de risque et identifie les corrélations inter-modules.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                size="lg"
                className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={runAnalysis}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Brain className="h-5 w-5" />
                )}
                {isLoading ? "Analyse en cours..." : "Lancer l'analyse"}
              </Button>
              <p className="text-xs text-muted-foreground">
                ⚠️ L'analyse consomme des crédits API. Utilisez-la avec parcimonie.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while running analysis
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-violet-600 animate-spin" />
          <p className="text-lg font-medium">Analyse IA en cours...</p>
          <p className="text-muted-foreground text-sm">
            Évaluation de la santé, prédictions et détection de patterns
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Intelligence CAPA
          </h2>
          <p className="text-muted-foreground">
            Tableau de bord analytique et prédictif
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastRefresh && (
            <span className="text-sm text-muted-foreground">
              Dernière analyse: {lastRefresh.toLocaleDateString("fr-FR")} à {lastRefresh.toLocaleTimeString("fr-FR")}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            {isLoading ? "Analyse..." : "Relancer l'analyse"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Global</p>
                <p className={cn("text-3xl font-bold", getHealthColor(portfolioHealth?.averageHealthScore || 0))}>
                  {portfolioHealth?.averageHealthScore || 0}%
                </p>
              </div>
              <Gauge className={cn("h-10 w-10", getHealthColor(portfolioHealth?.averageHealthScore || 0))} />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(portfolioHealth?.healthTrend || "stable")}
              <span className="text-xs text-muted-foreground capitalize">
                {portfolioHealth?.healthTrend === "improving" && "En amélioration"}
                {portfolioHealth?.healthTrend === "declining" && "En déclin"}
                {portfolioHealth?.healthTrend === "stable" && "Stable"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CAPAs Ouvertes</p>
                <p className="text-3xl font-bold">{portfolioHealth?.openCapas || 0}</p>
              </div>
              <Target className="h-10 w-10 text-primary" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                sur {portfolioHealth?.totalCapas || 0} au total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Retard</p>
                <p className="text-3xl font-bold text-red-500">{portfolioHealth?.overdueCapas || 0}</p>
              </div>
              <Clock className="h-10 w-10 text-red-500" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-muted-foreground">
                {portfolioHealth?.criticalCapas || 0} critiques
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficacité</p>
                <p className="text-3xl font-bold text-primary">
                  {portfolioHealth?.effectivenessRate || 0}%
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Taux de non-récurrence
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full">
          <TabsTrigger value="overview" className="flex-1 flex items-center justify-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex-1 flex items-center justify-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Prédictions</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex-1 flex items-center justify-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="escalations" className="flex-1 flex items-center justify-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Escalades</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex-1 flex items-center justify-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Facteurs de Risque
                </CardTitle>
                <CardDescription>
                  Top facteurs impactant la santé des CAPAs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioHealth?.topRiskFactors?.map((factor, index) => (
                    <div key={factor.factor} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">{factor.factor.replace(/_/g, " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          {factor.count} CAPA{factor.count > 1 ? "s" : ""} affectée{factor.count > 1 ? "s" : ""}
                        </p>
                      </div>
                      <Badge variant="outline">{factor.count}</Badge>
                    </div>
                  ))}
                  {(!portfolioHealth?.topRiskFactors || portfolioHealth.topRiskFactors.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun facteur de risque détecté</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Health Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Distribution Santé
                </CardTitle>
                <CardDescription>
                  Répartition des CAPAs par état de santé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Healthy */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Saines</span>
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {(portfolioHealth?.openCapas || 0) - (portfolioHealth?.atRiskCapas || 0) - (portfolioHealth?.criticalCapas || 0) - (portfolioHealth?.overdueCapas || 0)}
                      </span>
                    </div>
                    <Progress
                      value={portfolioHealth?.openCapas ? (((portfolioHealth.openCapas - portfolioHealth.atRiskCapas - portfolioHealth.criticalCapas - portfolioHealth.overdueCapas) / portfolioHealth.openCapas) * 100) : 0}
                      className="h-2 bg-secondary [&>div]:bg-primary"
                    />
                  </div>

                  {/* At Risk */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">À risque</span>
                      </span>
                      <span className="text-sm font-medium text-amber-500">
                        {portfolioHealth?.atRiskCapas || 0}
                      </span>
                    </div>
                    <Progress
                      value={portfolioHealth?.openCapas ? ((portfolioHealth.atRiskCapas / portfolioHealth.openCapas) * 100) : 0}
                      className="h-2 bg-amber-100 [&>div]:bg-amber-500"
                    />
                  </div>

                  {/* Critical */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Critiques</span>
                      </span>
                      <span className="text-sm font-medium text-orange-500">
                        {portfolioHealth?.criticalCapas || 0}
                      </span>
                    </div>
                    <Progress
                      value={portfolioHealth?.openCapas ? ((portfolioHealth.criticalCapas / portfolioHealth.openCapas) * 100) : 0}
                      className="h-2 bg-orange-100 [&>div]:bg-orange-500"
                    />
                  </div>

                  {/* Overdue */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">En retard</span>
                      </span>
                      <span className="text-sm font-medium text-red-500">
                        {portfolioHealth?.overdueCapas || 0}
                      </span>
                    </div>
                    <Progress
                      value={portfolioHealth?.openCapas ? ((portfolioHealth.overdueCapas / portfolioHealth.openCapas) * 100) : 0}
                      className="h-2 bg-red-100 [&>div]:bg-red-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Escalations */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" />
                  Escalades Récentes
                </CardTitle>
                <CardDescription>
                  Alertes et escalades déclenchées automatiquement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    {portfolioHealth?.recentEscalations?.map((escalation) => (
                      <div
                        key={escalation.id}
                        className="flex items-start gap-4 p-3 rounded-lg border bg-muted/50"
                      >
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                          escalation.status === "pending" && "bg-red-100 text-red-700",
                          escalation.status === "acknowledged" && "bg-amber-100 text-amber-700",
                          escalation.status === "resolved" && "bg-secondary text-primary"
                        )}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{escalation.triggerReason}</p>
                          <p className="text-sm text-muted-foreground">
                            CAPA: {escalation.capaId}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {toDate(escalation.triggeredAt).toLocaleString("fr-FR")}
                          </p>
                        </div>
                        <Badge
                          variant={
                            escalation.status === "pending" ? "destructive" :
                              escalation.status === "acknowledged" ? "secondary" : "outline"
                          }
                        >
                          {escalation.status === "pending" && "En attente"}
                          {escalation.status === "acknowledged" && "Pris en compte"}
                          {escalation.status === "resolved" && "Résolu"}
                        </Badge>
                      </div>
                    ))}
                    {(!portfolioHealth?.recentEscalations || portfolioHealth.recentEscalations.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-primary opacity-50" />
                        <p>Aucune escalade récente</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Risk Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-purple-500" />
                  Prévision des Risques
                </CardTitle>
                <CardDescription>
                  Analyse prédictive globale
                </CardDescription>
              </CardHeader>
              <CardContent>
                {predictions ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Niveau de risque global</span>
                      <Badge
                        variant={
                          predictions.overallRiskLevel === "critical" || predictions.overallRiskLevel === "high" ? "destructive" :
                            predictions.overallRiskLevel === "medium" ? "secondary" : "outline"
                        }
                      >
                        {predictions.overallRiskLevel === "critical" && "Critique"}
                        {predictions.overallRiskLevel === "high" && "Élevé"}
                        {predictions.overallRiskLevel === "medium" && "Moyen"}
                        {predictions.overallRiskLevel === "low" && "Faible"}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Score de risque</span>
                        <span className="text-sm font-medium">
                          {predictions.riskScore}/100
                        </span>
                      </div>
                      <Progress
                        value={predictions.riskScore}
                        className={cn(
                          "h-3",
                          predictions.riskScore > 70 && "[&>div]:bg-red-500",
                          predictions.riskScore <= 70 && predictions.riskScore > 30 && "[&>div]:bg-amber-500",
                          predictions.riskScore <= 30 && "[&>div]:bg-primary"
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Niveau de confiance</span>
                        <span className="text-sm font-medium">
                          {predictions.confidenceLevel}%
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Prochaine analyse recommandée</p>
                      <p className="text-sm text-muted-foreground">
                        {toDate(predictions.nextRecommendedAnalysis).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Données insuffisantes pour les prévisions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Alertes Prédictives
                </CardTitle>
                <CardDescription>
                  Alertes basées sur l'analyse des patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {predictions?.alerts?.map((alert, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border bg-muted/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium">{alert.title}</span>
                          <Badge
                            variant={
                              alert.severity === "critical" ? "destructive" :
                                alert.severity === "warning" ? "secondary" : "outline"
                            }
                          >
                            {alert.severity === "critical" && "Critique"}
                            {alert.severity === "warning" && "Attention"}
                            {alert.severity === "info" && "Info"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        {alert.affectedAreas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {alert.affectedAreas?.slice(0, 3).map((area, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Action suggérée: {alert.suggestedAction}
                        </p>
                      </div>
                    ))}
                    {(!predictions?.alerts || predictions.alerts.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-2 text-primary opacity-50" />
                        <p>Aucune alerte active</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patterns?.map((pattern) => (
              <Card key={pattern.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    {pattern.name}
                  </CardTitle>
                  <CardDescription>
                    {pattern.incidentCount} incident{pattern.incidentCount > 1 ? "s" : ""} associé{pattern.incidentCount > 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {pattern.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Facteurs communs
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.commonFactors?.map((factor, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {pattern.suggestedActions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => onViewDetails?.("patterns")}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {pattern.suggestedActions.length} action{pattern.suggestedActions.length > 1 ? "s" : ""} suggérée{pattern.suggestedActions.length > 1 ? "s" : ""}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {patterns.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun pattern détecté</p>
                  <p className="text-sm">
                    Les patterns seront identifiés automatiquement lorsque suffisamment de données seront disponibles.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Escalations Tab */}
        <TabsContent value="escalations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Historique des Escalades
              </CardTitle>
              <CardDescription>
                Toutes les alertes et escalades avec leur statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {portfolioHealth?.recentEscalations?.map((escalation) => (
                    <div
                      key={escalation.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        escalation.status === "pending" && "bg-red-100 text-red-700",
                        escalation.status === "acknowledged" && "bg-amber-100 text-amber-700",
                        escalation.status === "resolved" && "bg-secondary text-primary"
                      )}>
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{escalation.triggerReason}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              CAPA: {escalation.capaId} • Politique: {escalation.policyId}
                            </p>
                          </div>
                          <Badge
                            variant={
                              escalation.status === "pending" ? "destructive" :
                                escalation.status === "acknowledged" ? "secondary" : "outline"
                            }
                          >
                            {escalation.status === "pending" && "En attente"}
                            {escalation.status === "acknowledged" && "Pris en compte"}
                            {escalation.status === "resolved" && "Résolu"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {toDate(escalation.triggeredAt).toLocaleString("fr-FR")}
                          </span>
                          {escalation.resolvedAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Résolu le {toDate(escalation.resolvedAt).toLocaleString("fr-FR")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {escalation.actions?.map((action, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {action.type === "notify" && "Notification"}
                              {action.type === "escalate_manager" && "Escalade manager"}
                              {action.type === "flag_priority" && "Priorité élevée"}
                              {action.type === "create_followup" && "Suivi créé"}
                              {action.type === "reassign" && "Réassigné"}
                            </Badge>
                          ))}
                        </div>
                        {escalation.status === "pending" && (
                          <div className="flex items-center gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              Prendre en compte
                            </Button>
                            <Button size="sm" variant="default">
                              Résoudre
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!portfolioHealth?.recentEscalations || portfolioHealth.recentEscalations.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
                      <p className="font-medium">Aucune escalade</p>
                      <p className="text-sm">
                        Toutes les CAPAs sont dans un état satisfaisant.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Recommandations IA
                </CardTitle>
                <CardDescription>
                  Suggestions personnalisées basées sur l'analyse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions?.insights?.filter(i => i.preventiveActions?.length > 0)?.slice(0, 5).map((insight, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-lg border-l-4",
                        insight.riskScore >= 80 && "border-l-red-500 bg-red-50 dark:bg-red-950/20",
                        insight.riskScore >= 60 && insight.riskScore < 80 && "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20",
                        insight.riskScore >= 40 && insight.riskScore < 60 && "border-l-primary bg-secondary dark:bg-primary/20",
                        insight.riskScore < 40 && "border-l-gray-500 bg-gray-50 dark:bg-gray-950/20"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{insight.preventiveActions[0]?.title || "Action recommandée"}</p>
                        <Badge
                          variant={insight.riskScore >= 70 ? "destructive" : "secondary"}
                        >
                          Score: {insight.riskScore}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {insight.preventiveActions[0]?.description || insight.triggeringFactors[0]?.factor}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => onViewDetails?.("predictions")}
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Voir détails
                      </Button>
                    </div>
                  ))}
                  {(!predictions?.insights || predictions.insights.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune recommandation pour le moment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cross-Module Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Intelligence Inter-Modules
                </CardTitle>
                <CardDescription>
                  Corrélations entre CAPA, Santé et Conformité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskReport?.crossModuleInsights?.map((insight, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2 mb-2">
                        {insight.involvedModules?.map((mod, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {mod}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm">{insight.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Confiance: {Math.round(insight.confidence * 100)}%
                      </p>
                    </div>
                  ))}
                  {(!riskReport?.crossModuleInsights || riskReport.crossModuleInsights.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Analyse inter-modules en cours...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Actions Rapides
                </CardTitle>
                <CardDescription>
                  Actions recommandées basées sur l'état actuel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {portfolioHealth && portfolioHealth.overdueCapas > 0 && (
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => onViewDetails?.("overdue")}
                    >
                      <Clock className="h-6 w-6 text-red-500" />
                      <span className="text-xs">Traiter les retards</span>
                      <Badge variant="destructive">{portfolioHealth.overdueCapas}</Badge>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => onViewDetails?.("report")}
                  >
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="text-xs">Générer rapport</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => onViewDetails?.("analysis")}
                  >
                    <Target className="h-6 w-6 text-purple-500" />
                    <span className="text-xs">Analyser un incident</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => onViewDetails?.("schedule")}
                  >
                    <Calendar className="h-6 w-6 text-primary" />
                    <span className="text-xs">Optimiser planning</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IntelligenceDashboard;

