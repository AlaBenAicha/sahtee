/**
 * Health AI Panel Component
 * 
 * Displays AI-powered health analysis including:
 * - Trend detection
 * - Risk group identification
 * - Prevention recommendations
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  TrendingUp,
  Users,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Activity,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendAnalysisCard } from "./TrendAnalysisCard";
import { RiskGroupCard } from "./RiskGroupCard";
import { PreventionRecommendations } from "./PreventionRecommendations";
import { 
  useHealthAI, 
  useHealthTrendAnalysis, 
  usePerformHealthAnalysis,
  getMockHealthAnalysis 
} from "@/hooks/useHealthAI";
import type { HealthTrendResult } from "@/services/ai/types";

interface HealthAIPanelProps {
  className?: string;
}

export function HealthAIPanel({ className }: HealthAIPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // AI hooks
  const { isEnabled: isAIEnabled, isInitialized } = useHealthAI();
  const { 
    data: aiAnalysis, 
    isLoading, 
    streamedContent,
    isStreaming,
    refetch 
  } = useHealthTrendAnalysis();
  const performAnalysis = usePerformHealthAnalysis();

  // Use AI data or fallback to mock
  const analysis: HealthTrendResult = useMemo(() => {
    if (isAIEnabled && aiAnalysis) {
      return aiAnalysis;
    }
    return getMockHealthAnalysis();
  }, [isAIEnabled, aiAnalysis]);

  const isRefreshing = isStreaming || performAnalysis.isPending;

  const handleRefresh = async () => {
    if (isAIEnabled && isInitialized) {
      await performAnalysis.mutateAsync();
    } else {
      await refetch();
    }
  };

  // Calculate confidence (average of all trends)
  const confidence = useMemo(() => {
    if (!analysis.trends.length) return 0.8;
    const sum = analysis.trends.reduce((acc, t) => acc + t.confidence, 0);
    return sum / analysis.trends.length;
  }, [analysis.trends]);

  // Calculate total affected employees
  const totalAffectedEmployees = useMemo(() => {
    const fromTrends = analysis.trends.reduce((sum, t) => sum + t.affectedEmployeeCount, 0);
    const fromGroups = analysis.riskGroups.reduce((sum, g) => sum + g.employeeCount, 0);
    return Math.max(fromTrends, fromGroups);
  }, [analysis]);

  if (isLoading && isAIEnabled) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 p-2">
                <Brain className="h-5 w-5 text-white" />
              </div>
              Health-AI
              {isAIEnabled ? (
                <Badge variant="secondary" className="ml-2 text-xs bg-purple-100 text-purple-700 border-purple-300">
                  <Sparkles className="mr-1 h-3 w-3" />
                  IA Active
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-2 text-xs">
                  Mode démo
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isAIEnabled 
                ? "Analyse intelligente des données de santé au travail"
                : "Aperçu des fonctionnalités d'analyse santé"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Confiance: {(confidence * 100).toFixed(0)}%
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Analyse..." : "Actualiser"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI Status Alert */}
        {!isAIEnabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              L'IA Gemini n'est pas configurée. Les données affichées sont des exemples.
              Configurez VITE_GEMINI_API_KEY pour activer l'analyse IA avancée.
            </AlertDescription>
          </Alert>
        )}

        {/* Streaming Content */}
        {isStreaming && streamedContent && (
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse text-purple-500" />
                Analyse en cours...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <p className="text-sm whitespace-pre-wrap">{streamedContent}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-gradient-to-br from-violet-50 to-purple-50 p-4">
            <div className="flex items-center gap-2 text-violet-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Tendances</span>
            </div>
            <p className="text-2xl font-bold text-violet-700 mt-1">
              {analysis.trends.length}
            </p>
            <p className="text-xs text-violet-500">détectées</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Groupes à risque</span>
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {analysis.riskGroups.length}
            </p>
            <p className="text-xs text-amber-500">identifiés</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-green-50 p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-medium">Recommandations</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {analysis.recommendations.length}
            </p>
            <p className="text-xs text-emerald-500">proposées</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Employés concernés</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {totalAffectedEmployees}
            </p>
            <p className="text-xs text-blue-500">personnes</p>
          </div>
        </div>

        {/* Alerts */}
        {analysis.alerts && analysis.alerts.length > 0 && (
          <div className="space-y-2">
            {analysis.alerts.map((alert, index) => (
              <Alert 
                key={index} 
                variant={alert.severity === "critical" ? "destructive" : "default"}
                className={cn(
                  alert.severity === "warning" && "border-amber-300 bg-amber-50 dark:bg-amber-950/20"
                )}
              >
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  alert.severity === "warning" && "text-amber-600"
                )} />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    <strong>{alert.title}</strong>: {alert.description}
                  </span>
                  {alert.affectedCount && (
                    <Badge variant="outline" className="ml-2">
                      {alert.affectedCount} personnes
                    </Badge>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Separator />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Groupes à risque
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommandations
            </TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Analyse sur les {analysis.trends[0]?.periodMonths || 6} derniers mois
              </span>
              <span>
                Dernière analyse: {new Date().toLocaleDateString("fr-FR")}
              </span>
            </div>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {analysis.trends.length > 0 ? (
                  analysis.trends.map((trend, index) => (
                    <TrendAnalysisCard key={`trend-${index}`} trend={trend} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>Aucune tendance significative détectée</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Risk Groups Tab */}
          <TabsContent value="risks" className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                {analysis.riskGroups.reduce((sum, g) => sum + g.employeeCount, 0)} employés
                dans les groupes à risque
              </span>
            </div>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {analysis.riskGroups.length > 0 ? (
                  analysis.riskGroups.map((group, index) => (
                    <RiskGroupCard key={`group-${index}`} group={group} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>Aucun groupe à risque identifié</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-4">
            {analysis.recommendations.length > 0 ? (
              <PreventionRecommendations recommendations={analysis.recommendations} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Aucune recommandation pour le moment</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* AI Disclaimer */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-slate-400 mt-0.5" />
            <p>
              Les analyses et recommandations sont générées par l'IA Health-AI sur la base des
              données disponibles. Elles sont fournies à titre indicatif et doivent être validées
              par un professionnel de santé avant toute mise en œuvre.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HealthAIPanel;
