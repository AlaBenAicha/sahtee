/**
 * AI Insights Panel Component
 * 
 * Displays AI-generated recommendations for the 360° Board.
 * Shows confidence scores, action buttons, and source data links.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Shield,
  GraduationCap,
  Wrench,
  CheckCircle,
  X,
  ChevronRight,
  Info,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIRecommendation, RecommendationType } from "@/types/dashboard";

interface AIInsightsPanelProps {
  recommendations: AIRecommendation[];
  loading?: boolean;
  onAccept?: (recommendationId: string) => void;
  onDismiss?: (recommendationId: string) => void;
  onViewDetails?: (recommendation: AIRecommendation) => void;
  className?: string;
}

/**
 * Get icon for recommendation type
 */
function getRecommendationIcon(type: RecommendationType) {
  const icons: Record<RecommendationType, React.ElementType> = {
    training: GraduationCap,
    capa: CheckCircle,
    risk_assessment: AlertTriangle,
    equipment: Wrench,
    compliance: Shield,
    optimization: TrendingUp,
  };
  return icons[type] || Lightbulb;
}

/**
 * Get type label in French
 */
function getTypeLabel(type: RecommendationType): string {
  const labels: Record<RecommendationType, string> = {
    training: "Formation",
    capa: "Action corrective",
    risk_assessment: "Évaluation risque",
    equipment: "Équipement",
    compliance: "Conformité",
    optimization: "Optimisation",
  };
  return labels[type];
}

/**
 * Get type color classes
 */
function getTypeColors(type: RecommendationType) {
  const colors: Record<RecommendationType, { bg: string; text: string; border: string }> = {
    training: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    capa: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    risk_assessment: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
    equipment: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
    compliance: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    optimization: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  };
  return colors[type];
}

/**
 * Get confidence color
 */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "text-emerald-600";
  if (confidence >= 60) return "text-amber-600";
  return "text-slate-600";
}

/**
 * Get priority label
 */
function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    critique: "Critique",
    haute: "Haute",
    moyenne: "Moyenne",
    basse: "Basse",
  };
  return labels[priority] || priority;
}

/**
 * Individual Recommendation Card
 */
interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onAccept?: () => void;
  onDismiss?: () => void;
  onViewDetails?: () => void;
}

function RecommendationCard({
  recommendation,
  onAccept,
  onDismiss,
  onViewDetails,
}: RecommendationCardProps) {
  const Icon = getRecommendationIcon(recommendation.type);
  const colors = getTypeColors(recommendation.type);
  const confidenceColor = getConfidenceColor(recommendation.confidence);

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-150",
        "hover:shadow-sm",
        recommendation.status === "accepted" && "opacity-60",
        recommendation.status === "rejected" && "opacity-40"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-xs", colors.bg, colors.text, colors.border)}
          >
            <Icon className="h-3 w-3 mr-1" />
            {getTypeLabel(recommendation.type)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getPriorityLabel(recommendation.priority)}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-medium text-slate-900 text-sm mb-1">
        {recommendation.title}
      </h4>

      {/* Description */}
      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
        {recommendation.description}
      </p>

      {/* Confidence Score */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-slate-500">Confiance:</span>
        <div className="flex-1">
          <Progress value={recommendation.confidence} className="h-1.5" />
        </div>
        <span className={cn("text-xs font-semibold", confidenceColor)}>
          {recommendation.confidence}%
        </span>
      </div>

      {/* Reasoning */}
      <div className="bg-slate-50 rounded p-2 mb-3">
        <p className="text-xs text-slate-600 italic">
          <Info className="h-3 w-3 inline mr-1" />
          {recommendation.reasoning}
        </p>
      </div>

      {/* Actions */}
      {recommendation.status === "pending" && (
        <div className="flex items-center gap-2">
          {onAccept && (
            <Button
              size="sm"
              onClick={onAccept}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-xs h-8"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Accepter
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDismiss}
              className="text-xs h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Ignorer
            </Button>
          )}
          {onViewDetails && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onViewDetails}
              className="text-xs h-8"
            >
              Détails
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Status Badge for non-pending */}
      {recommendation.status !== "pending" && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            recommendation.status === "accepted" && "bg-emerald-50 text-emerald-700",
            recommendation.status === "rejected" && "bg-red-50 text-red-700",
            recommendation.status === "dismissed" && "bg-slate-50 text-slate-700"
          )}
        >
          {recommendation.status === "accepted" && "Acceptée"}
          {recommendation.status === "rejected" && "Rejetée"}
          {recommendation.status === "dismissed" && "Ignorée"}
        </Badge>
      )}
    </div>
  );
}

/**
 * AI Insights Panel Component
 */
export function AIInsightsPanel({
  recommendations,
  loading = false,
  onAccept,
  onDismiss,
  onViewDetails,
  className,
}: AIInsightsPanelProps) {
  // Filter to show only pending recommendations first
  const pendingRecommendations = recommendations.filter((r) => r.status === "pending");
  const otherRecommendations = recommendations.filter((r) => r.status !== "pending");
  const sortedRecommendations = [...pendingRecommendations, ...otherRecommendations];

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Suggestions IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Suggestions IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Aucune suggestion disponible</p>
            <p className="text-xs text-slate-400 mt-1">
              Les recommandations apparaîtront ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Suggestions IA
          </CardTitle>
          {pendingRecommendations.length > 0 && (
            <Badge className="bg-emerald-100 text-emerald-700">
              {pendingRecommendations.length} nouvelle{pendingRecommendations.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Recommandations basées sur l'analyse de vos données
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-2">
          <div className="space-y-3">
            {sortedRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onAccept={onAccept ? () => onAccept(recommendation.id) : undefined}
                onDismiss={onDismiss ? () => onDismiss(recommendation.id) : undefined}
                onViewDetails={
                  onViewDetails ? () => onViewDetails(recommendation) : undefined
                }
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Compact AI Insights summary for header
 */
export function AIInsightsSummary({
  count,
  onClick,
}: {
  count: number;
  onClick?: () => void;
}) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
    >
      <Sparkles className="h-3.5 w-3.5" />
      {count} suggestion{count > 1 ? "s" : ""} IA
    </button>
  );
}

/**
 * Mock recommendations for demo
 */
export function getMockRecommendations(): AIRecommendation[] {
  const now = new Date();
  
  return [
    {
      id: "rec-1",
      type: "training",
      title: "Formation manutention recommandée",
      description: "Basé sur l'analyse de 3 incidents similaires ce mois, une formation en manutention pourrait réduire les risques.",
      reasoning: "3 incidents impliquant la manutention au cours des 30 derniers jours",
      confidence: 92,
      priority: "haute",
      actionType: "create",
      actionUrl: "/training?action=new&type=manutention",
      status: "pending",
      basedOn: {
        incidents: ["inc-1", "inc-2", "inc-3"],
        patterns: ["Manutention manuelle", "Postures inadaptées"],
      },
      createdAt: { toDate: () => now } as any,
    },
    {
      id: "rec-2",
      type: "equipment",
      title: "EPI protection respiratoire",
      description: "Une zone à risque chimique a été identifiée. Recommandation d'équiper le personnel de masques FFP3.",
      reasoning: "Zone de stockage chimique avec ventilation insuffisante détectée",
      confidence: 87,
      priority: "haute",
      actionType: "create",
      actionUrl: "/health?action=ppe",
      status: "pending",
      basedOn: {
        incidents: ["inc-4"],
        regulations: ["R4412-1"],
      },
      createdAt: { toDate: () => new Date(now.getTime() - 86400000) } as any,
    },
    {
      id: "rec-3",
      type: "risk_assessment",
      title: "Réévaluation zone atelier B",
      description: "Suite aux changements de process, une mise à jour de l'évaluation des risques est recommandée.",
      reasoning: "Dernière évaluation il y a plus de 6 mois avec 2 incidents depuis",
      confidence: 78,
      priority: "moyenne",
      actionType: "update",
      actionUrl: "/compliance?section=risk-assessment",
      status: "pending",
      basedOn: {
        historicalData: true,
        incidents: ["inc-5", "inc-6"],
      },
      createdAt: { toDate: () => new Date(now.getTime() - 172800000) } as any,
    },
  ];
}

export default AIInsightsPanel;
