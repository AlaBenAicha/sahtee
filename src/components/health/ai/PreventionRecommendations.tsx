/**
 * Prevention Recommendations Component
 * 
 * Displays AI-generated prevention recommendations with actions.
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Lightbulb,
  GraduationCap,
  Wrench,
  Activity,
  FileText,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Building,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationData {
  id: string;
  type: "prevention" | "training" | "equipment" | "procedure" | "monitoring";
  title: string;
  description: string;
  rationale: string;
  priority: "haute" | "moyenne" | "basse";
  expectedImpact: "high" | "medium" | "low";
  confidence: number;
  targetDepartments?: string[];
  targetEmployeeCount?: number;
  suggestedCapaTitle?: string;
  suggestedCapaDescription?: string;
  status: "pending" | "accepted" | "modified" | "rejected";
}

interface PreventionRecommendationsProps {
  recommendations: RecommendationData[];
  onAccept?: (recommendation: RecommendationData) => void;
  onReject?: (recommendation: RecommendationData) => void;
  onCreateCapa?: (recommendation: RecommendationData) => void;
}

const TYPE_CONFIG = {
  prevention: { label: "Prévention", icon: Lightbulb, color: "text-primary bg-secondary" },
  training: { label: "Formation", icon: GraduationCap, color: "text-primary bg-secondary" },
  equipment: { label: "Équipement", icon: Wrench, color: "text-amber-600 bg-amber-100" },
  procedure: { label: "Procédure", icon: FileText, color: "text-purple-600 bg-purple-100" },
  monitoring: { label: "Surveillance", icon: Activity, color: "text-indigo-600 bg-indigo-100" },
};

const PRIORITY_CONFIG = {
  haute: { label: "Haute", color: "bg-red-100 text-red-700" },
  moyenne: { label: "Moyenne", color: "bg-amber-100 text-amber-700" },
  basse: { label: "Basse", color: "bg-secondary text-primary" },
};

const IMPACT_CONFIG = {
  high: { label: "Élevé", color: "text-primary" },
  medium: { label: "Modéré", color: "text-amber-600" },
  low: { label: "Faible", color: "text-slate-600" },
};

function RecommendationCard({
  recommendation,
  onAccept,
  onReject,
  onCreateCapa,
}: {
  recommendation: RecommendationData;
  onAccept?: (rec: RecommendationData) => void;
  onReject?: (rec: RecommendationData) => void;
  onCreateCapa?: (rec: RecommendationData) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = TYPE_CONFIG[recommendation.type];
  const priorityConfig = PRIORITY_CONFIG[recommendation.priority];
  const impactConfig = IMPACT_CONFIG[recommendation.expectedImpact];
  const Icon = typeConfig.icon;

  const isPending = recommendation.status === "pending";
  const isAccepted = recommendation.status === "accepted";
  const isRejected = recommendation.status === "rejected";

  return (
    <Card className={cn(
      "border transition-all",
      isAccepted && "border-secondary bg-secondary/50",
      isRejected && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn("rounded-lg p-2", typeConfig.color.split(" ")[1])}>
            <Icon className={cn("h-5 w-5", typeConfig.color.split(" ")[0])} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {typeConfig.label}
                  </Badge>
                  <Badge className={cn("text-xs", priorityConfig.color)}>
                    Priorité {priorityConfig.label.toLowerCase()}
                  </Badge>
                  {isAccepted && (
                    <Badge className="bg-secondary text-primary text-xs">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Acceptée
                    </Badge>
                  )}
                  {isRejected && (
                    <Badge variant="secondary" className="text-xs">
                      <X className="mr-1 h-3 w-3" />
                      Rejetée
                    </Badge>
                  )}
                </div>
                <h4 className="mt-2 font-medium text-slate-800">{recommendation.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{recommendation.description}</p>
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {recommendation.targetEmployeeCount && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recommendation.targetEmployeeCount} employés</span>
                </div>
              )}
              {recommendation.targetDepartments && (
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>{recommendation.targetDepartments.join(", ")}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                <span>Impact {impactConfig.label.toLowerCase()}</span>
              </div>
            </div>

            {/* Confidence */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Confiance IA</span>
                <span>{(recommendation.confidence * 100).toFixed(0)}%</span>
              </div>
              <Progress value={recommendation.confidence * 100} className="h-1" />
            </div>

            {/* Expand for rationale */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-2 -ml-2"
            >
              {expanded ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" />
                  Masquer le détail
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" />
                  Voir le raisonnement
                </>
              )}
            </Button>

            {expanded && (
              <div className="mt-3 rounded-lg border bg-slate-50 p-3">
                <h5 className="text-sm font-medium text-slate-700 mb-1">Raisonnement</h5>
                <p className="text-sm text-slate-600">{recommendation.rationale}</p>
                {recommendation.suggestedCapaTitle && (
                  <div className="mt-3 pt-3 border-t">
                    <h5 className="text-sm font-medium text-slate-700 mb-1">CAPA suggérée</h5>
                    <p className="text-sm text-slate-600">{recommendation.suggestedCapaTitle}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {isPending && (
              <div className="mt-4 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => onCreateCapa?.(recommendation)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Créer CAPA
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAccept?.(recommendation)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReject?.(recommendation)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PreventionRecommendations({
  recommendations,
  onAccept,
  onReject,
  onCreateCapa,
}: PreventionRecommendationsProps) {
  const pendingCount = recommendations.filter((r) => r.status === "pending").length;
  const acceptedCount = recommendations.filter((r) => r.status === "accepted").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {pendingCount} recommandation{pendingCount > 1 ? "s" : ""} en attente
          {acceptedCount > 0 && ` • ${acceptedCount} acceptée${acceptedCount > 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.id || `recommendation-${index}`}
            recommendation={recommendation}
            onAccept={onAccept}
            onReject={onReject}
            onCreateCapa={onCreateCapa}
          />
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="py-8 text-center text-slate-500">
          <Lightbulb className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-2">Aucune recommandation générée</p>
          <p className="text-xs mt-1">Les recommandations apparaîtront après l'analyse des données</p>
        </div>
      )}
    </div>
  );
}

export default PreventionRecommendations;

