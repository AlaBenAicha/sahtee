/**
 * Risk Group Card Component
 * 
 * Displays an identified at-risk group with suggested actions.
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskGroupData {
  id: string;
  name: string;
  description: string;
  riskFactors: string[];
  primaryRisk: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  employeeCount: number;
  departmentIds: string[];
  suggestedActions: string[];
  priority: "immediate" | "short_term" | "medium_term" | "long_term";
}

interface RiskGroupCardProps {
  group: RiskGroupData;
  onCreateCapa?: (group: RiskGroupData) => void;
}

const RISK_LEVEL_CONFIG = {
  low: { label: "Faible", color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
  medium: { label: "Modéré", color: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  high: { label: "Élevé", color: "bg-red-100 text-red-700", border: "border-red-200" },
  critical: { label: "Critique", color: "bg-red-100 text-red-700", border: "border-red-300" },
};

const PRIORITY_CONFIG = {
  immediate: { label: "Immédiate", color: "text-red-600" },
  short_term: { label: "Court terme", color: "text-amber-600" },
  medium_term: { label: "Moyen terme", color: "text-blue-600" },
  long_term: { label: "Long terme", color: "text-slate-600" },
};

const RISK_TYPE_LABELS: Record<string, string> = {
  tms: "TMS",
  rps: "RPS",
  chemical: "Chimique",
  physical: "Physique",
  biological: "Biologique",
  ergonomic: "Ergonomique",
};

export function RiskGroupCard({ group, onCreateCapa }: RiskGroupCardProps) {
  const [expanded, setExpanded] = useState(false);

  const riskConfig = RISK_LEVEL_CONFIG[group.riskLevel];
  const priorityConfig = PRIORITY_CONFIG[group.priority];

  return (
    <Card className={cn("border transition-all", riskConfig.border)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn("rounded-lg p-2", 
            group.riskLevel === "high" || group.riskLevel === "critical" 
              ? "bg-red-100" 
              : group.riskLevel === "medium" 
              ? "bg-amber-100" 
              : "bg-slate-100"
          )}>
            <Users className={cn("h-5 w-5",
              group.riskLevel === "high" || group.riskLevel === "critical"
                ? "text-red-600"
                : group.riskLevel === "medium"
                ? "text-amber-600"
                : "text-slate-600"
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-slate-800">{group.name}</h4>
                  <Badge className={cn("text-xs", riskConfig.color)}>
                    Risque {riskConfig.label.toLowerCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {RISK_TYPE_LABELS[group.primaryRisk] || group.primaryRisk}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{group.description}</p>
              </div>
              <span className="text-sm font-medium text-slate-600">
                {group.employeeCount} employés
              </span>
            </div>

            {/* Risk Factors */}
            <div className="mt-3 flex flex-wrap gap-1">
              {group.riskFactors.map((factor, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>

            {/* Priority */}
            <div className="mt-3 flex items-center gap-2">
              <Clock className={cn("h-4 w-4", priorityConfig.color)} />
              <span className={cn("text-sm font-medium", priorityConfig.color)}>
                Priorité: {priorityConfig.label}
              </span>
            </div>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-2 -ml-2"
            >
              {expanded ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" />
                  Masquer les actions
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" />
                  Voir les actions suggérées ({group.suggestedActions.length})
                </>
              )}
            </Button>

            {/* Suggested Actions */}
            {expanded && (
              <div className="mt-3 space-y-2">
                {group.suggestedActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-lg border bg-slate-50 p-2"
                  >
                    <CheckCircle className="h-4 w-4 text-slate-400 mt-0.5" />
                    <span className="text-sm text-slate-700">{action}</span>
                  </div>
                ))}
                <Button
                  size="sm"
                  onClick={() => onCreateCapa?.(group)}
                  className="mt-2"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Créer une CAPA
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RiskGroupCard;

