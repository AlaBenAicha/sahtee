/**
 * Prediction Dashboard Component
 *
 * Displays predictive insights, risk forecasts, and alerts for CAPA-AI.
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  MapPin,
  Users,
  Zap,
  Shield,
  Target,
  ArrowRight,
  RefreshCw,
  Calendar,
  Activity,
  Bell,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import type {
  PredictiveInsight,
  PatternCluster,
} from "@/services/ai/types";
import type {
  PredictionResult,
  PredictionAlert,
  RiskForecast,
  DepartmentRisk,
} from "@/services/ai/predictionService";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface PredictionDashboardProps {
  predictions?: PredictionResult;
  forecasts?: RiskForecast[];
  departmentRisks?: DepartmentRisk[];
  patterns?: PatternCluster[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onInsightClick?: (insight: PredictiveInsight) => void;
  onAlertClick?: (alert: PredictionAlert) => void;
  onCreateCapa?: (insight: PredictiveInsight) => void;
  className?: string;
}

// =============================================================================
// Risk Level Config
// =============================================================================

const riskLevelConfig = {
  low: {
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    label: "Faible",
  },
  medium: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
    label: "Moyen",
  },
  high: {
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
    label: "Élevé",
  },
  critical: {
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    label: "Critique",
  },
};

// =============================================================================
// Main Component
// =============================================================================

export function PredictionDashboard({
  predictions,
  forecasts,
  departmentRisks,
  patterns,
  isLoading,
  onRefresh,
  onInsightClick,
  onAlertClick,
  onCreateCapa,
  className,
}: PredictionDashboardProps) {
  // Calculate derived data
  const criticalAlerts = useMemo(
    () => predictions?.alerts.filter((a) => a.severity === "critical") || [],
    [predictions]
  );

  const activeInsights = useMemo(
    () => predictions?.insights.filter((i) => i.status === "active") || [],
    [predictions]
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
              <p className="text-slate-600">Analyse prédictive en cours...</p>
              <p className="text-sm text-slate-400">
                Génération des prévisions de risque
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!predictions) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Aucune analyse disponible</p>
              <Button onClick={onRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Lancer l'analyse
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskConfig = riskLevelConfig[predictions.overallRiskLevel];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Overall Risk Score */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Intelligence Prédictive
          </h2>
          <p className="text-sm text-slate-500">
            Dernière analyse:{" "}
            {predictions.analysisDate.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Risk Score */}
        <Card className={cn("border-2", riskConfig.borderColor)}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Score de Risque</p>
                <p className={cn("text-4xl font-bold", riskConfig.color)}>
                  {predictions.riskScore}%
                </p>
                <Badge className={cn("mt-2", riskConfig.bgColor, riskConfig.color)}>
                  {riskConfig.label}
                </Badge>
              </div>
              <div
                className={cn(
                  "p-4 rounded-full",
                  riskConfig.bgColor
                )}
              >
                <Shield className={cn("h-8 w-8", riskConfig.color)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Level */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Confiance</p>
                <p className="text-4xl font-bold text-slate-900">
                  {predictions.confidenceLevel}%
                </p>
                <Progress
                  value={predictions.confidenceLevel}
                  className="mt-2 h-2"
                />
              </div>
              <div className="p-4 rounded-full bg-secondary">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Predictions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Prédictions Actives</p>
                <p className="text-4xl font-bold text-slate-900">
                  {activeInsights.length}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {criticalAlerts.length} alertes critiques
                </p>
              </div>
              <div className="p-4 rounded-full bg-purple-100">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Analysis */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Prochaine Analyse</p>
                <p className="text-lg font-bold text-slate-900">
                  {predictions.nextRecommendedAnalysis.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {predictions.nextRecommendedAnalysis.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="p-4 rounded-full bg-green-100">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-800">
              <Bell className="h-4 w-4" />
              Alertes Critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClick={() => onAlertClick?.(alert)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Timeline */}
      {forecasts && forecasts.length > 0 && (
        <RiskTimeline forecasts={forecasts} />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictive Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              Prédictions de Risque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {activeInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onClick={() => onInsightClick?.(insight)}
                    onCreateCapa={() => onCreateCapa?.(insight)}
                  />
                ))}
                {activeInsights.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Aucune prédiction active
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Department Risks */}
        {departmentRisks && departmentRisks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Risques par Département
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {departmentRisks.map((dept) => (
                    <DepartmentRiskCard key={dept.departmentId} department={dept} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Pattern Clusters */}
        {patterns && patterns.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                Patterns Identifiés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {patterns.map((pattern) => (
                    <PatternCard key={pattern.id} pattern={pattern} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* All Alerts */}
        {predictions.alerts.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-600" />
                Toutes les Alertes ({predictions.alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {predictions.alerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onClick={() => onAlertClick?.(alert)}
                      compact
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Risk Timeline Component
// =============================================================================

interface RiskTimelineProps {
  forecasts: RiskForecast[];
}

function RiskTimeline({ forecasts }: RiskTimelineProps) {
  const horizonLabels: Record<string, string> = {
    "24h": "24 heures",
    "7d": "7 jours",
    "30d": "30 jours",
    "90d": "90 jours",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-600" />
          Prévision des Risques
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          {forecasts.map((forecast, index) => (
            <React.Fragment key={forecast.timeHorizon}>
              <div className="flex-1 text-center">
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold",
                    forecast.riskScore >= 70
                      ? "bg-red-100 text-red-600"
                      : forecast.riskScore >= 50
                      ? "bg-orange-100 text-orange-600"
                      : forecast.riskScore >= 30
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  )}
                >
                  {forecast.riskScore}
                </div>
                <p className="text-sm font-medium mt-2">
                  {horizonLabels[forecast.timeHorizon]}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendIcon trend={forecast.trend} />
                  <span className="text-xs text-slate-500">
                    {Math.round(forecast.confidence)}% conf.
                  </span>
                </div>
              </div>
              {index < forecasts.length - 1 && (
                <ArrowRight className="h-5 w-5 text-slate-300 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Sub-Components
// =============================================================================

interface AlertCardProps {
  alert: PredictionAlert;
  onClick?: () => void;
  compact?: boolean;
}

function AlertCard({ alert, onClick, compact }: AlertCardProps) {
  const severityConfig = {
    info: {
      icon: <Activity className="h-4 w-4" />,
      color: "text-primary",
      bgColor: "bg-secondary",
      borderColor: "border-secondary",
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    critical: {
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  };

  const config = severityConfig[alert.severity];

  return (
    <div
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
        config.bgColor,
        config.borderColor,
        compact && "p-2"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex-shrink-0 mt-0.5", config.color)}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm", config.color)}>
            {alert.title}
          </p>
          {!compact && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              {alert.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {alert.type}
            </Badge>
            {alert.affectedAreas.slice(0, 2).map((area, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
      </div>
    </div>
  );
}

interface InsightCardProps {
  insight: PredictiveInsight;
  onClick?: () => void;
  onCreateCapa?: () => void;
}

function InsightCard({ insight, onClick, onCreateCapa }: InsightCardProps) {
  const typeLabels: Record<string, string> = {
    imminent_risk: "Risque Imminent",
    trend_deviation: "Déviation de Tendance",
    pattern_recurrence: "Pattern Récurrent",
    exposure_threshold: "Seuil d'Exposition",
    seasonal_risk: "Risque Saisonnier",
    resource_constraint: "Contrainte de Ressources",
  };

  return (
    <div
      className="p-4 rounded-lg border bg-white hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={cn(
                insight.riskScore >= 70
                  ? "bg-red-100 text-red-700"
                  : insight.riskScore >= 50
                  ? "bg-orange-100 text-orange-700"
                  : "bg-yellow-100 text-yellow-700"
              )}
            >
              {insight.riskScore}%
            </Badge>
            <Badge variant="outline" className="text-xs">
              {typeLabels[insight.predictionType] || insight.predictionType}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {insight.timeHorizon}
            </Badge>
          </div>

          {insight.triggeringFactors.length > 0 && (
            <p className="text-sm text-slate-700 mb-2">
              {insight.triggeringFactors[0].factor}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {insight.affectedAreas.departments.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {insight.affectedAreas.departments.length} dept.
              </span>
            )}
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {Math.round(
                (insight.confidenceInterval.lower + insight.confidenceInterval.upper) / 2
              )}
              % conf.
            </span>
          </div>
        </div>

        {onCreateCapa && insight.preventiveActions.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateCapa();
                  }}
                >
                  <Zap className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Créer CAPA préventive</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

interface DepartmentRiskCardProps {
  department: DepartmentRisk;
}

function DepartmentRiskCard({ department }: DepartmentRiskCardProps) {
  return (
    <div className="p-3 rounded-lg border bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-sm">{department.departmentName}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon trend={department.trend} />
          <span
            className={cn(
              "text-lg font-bold",
              department.riskScore >= 70
                ? "text-red-600"
                : department.riskScore >= 50
                ? "text-orange-600"
                : department.riskScore >= 30
                ? "text-yellow-600"
                : "text-green-600"
            )}
          >
            {department.riskScore}%
          </span>
        </div>
      </div>

      <Progress
        value={department.riskScore}
        className={cn(
          "h-2",
          department.riskScore >= 70
            ? "[&>div]:bg-red-500"
            : department.riskScore >= 50
            ? "[&>div]:bg-orange-500"
            : department.riskScore >= 30
            ? "[&>div]:bg-yellow-500"
            : "[&>div]:bg-green-500"
        )}
      />

      <div className="flex flex-wrap gap-1 mt-2">
        {department.topRisks.slice(0, 3).map((risk, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {risk}
          </Badge>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-2">
        {department.incidentCount} incident(s) récent(s)
      </p>
    </div>
  );
}

interface PatternCardProps {
  pattern: PatternCluster;
}

function PatternCard({ pattern }: PatternCardProps) {
  const severityColors = {
    high: "bg-red-100 border-red-300 text-red-700",
    medium: "bg-amber-100 border-amber-300 text-amber-700",
    low: "bg-green-100 border-green-300 text-green-700",
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border",
        severityColors[pattern.severity]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium text-sm">{pattern.name}</p>
          <p className="text-xs mt-1 line-clamp-2">{pattern.description}</p>
        </div>
        <TrendIcon trend={pattern.trendDirection} />
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs">
        <span>{pattern.incidentIds.length} incidents</span>
        <span>{pattern.frequency.toFixed(1)}/mois</span>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {pattern.commonFactors.slice(0, 2).map((factor, idx) => (
          <Badge key={idx} variant="outline" className="text-xs">
            {factor}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function TrendIcon({ trend }: { trend: "increasing" | "stable" | "decreasing" }) {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    case "decreasing":
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    default:
      return <Minus className="h-4 w-4 text-slate-400" />;
  }
}

export default PredictionDashboard;

