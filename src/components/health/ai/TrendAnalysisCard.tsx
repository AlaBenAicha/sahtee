/**
 * Trend Analysis Card Component
 * 
 * Displays a detected health trend with severity and impact.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Building,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendData {
  id: string;
  type: string;
  description: string;
  direction: "increasing" | "stable" | "decreasing";
  changePercent: number;
  affectedDepartments: string[];
  affectedEmployeeCount: number;
  severity: "low" | "medium" | "high";
  confidence: number;
  periodMonths: number;
}

interface TrendAnalysisCardProps {
  trend: TrendData;
  onClick?: () => void;
}

const SEVERITY_CONFIG = {
  low: { label: "Faible", color: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Modéré", color: "bg-amber-100 text-amber-700" },
  high: { label: "Élevé", color: "bg-red-100 text-red-700" },
};

const TYPE_LABELS: Record<string, string> = {
  tms: "TMS",
  rps: "RPS",
  respiratory: "Respiratoire",
  cardiovascular: "Cardiovasculaire",
  dermatological: "Dermatologique",
  hearing: "Auditif",
  vision: "Visuel",
  other: "Autre",
};

export function TrendAnalysisCard({ trend, onClick }: TrendAnalysisCardProps) {
  const severityConfig = SEVERITY_CONFIG[trend.severity];
  
  const TrendIcon = trend.direction === "increasing" 
    ? TrendingUp 
    : trend.direction === "decreasing" 
    ? TrendingDown 
    : Minus;
  
  // For health issues, increasing is bad, decreasing is good
  const trendColor = trend.direction === "increasing"
    ? "text-red-500"
    : trend.direction === "decreasing"
    ? "text-emerald-500"
    : "text-slate-400";

  const trendBgColor = trend.direction === "increasing"
    ? "bg-red-100"
    : trend.direction === "decreasing"
    ? "bg-emerald-100"
    : "bg-slate-100";

  return (
    <Card
      className={cn(
        "border transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-indigo-200"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Trend Icon */}
          <div className={cn("rounded-lg p-2", trendBgColor)}>
            <TrendIcon className={cn("h-5 w-5", trendColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABELS[trend.type] || trend.type}
                  </Badge>
                  <Badge className={cn("text-xs", severityConfig.color)}>
                    {severityConfig.label}
                  </Badge>
                </div>
                <p className="mt-2 font-medium text-slate-800">{trend.description}</p>
              </div>
              {onClick && (
                <ChevronRight className="h-5 w-5 text-slate-300 flex-shrink-0" />
              )}
            </div>

            {/* Stats */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <TrendIcon className={cn("h-4 w-4", trendColor)} />
                <span className={cn("font-medium", trendColor)}>
                  {trend.direction === "increasing" ? "+" : trend.direction === "decreasing" ? "-" : ""}
                  {trend.changePercent}%
                </span>
                <span>sur {trend.periodMonths} mois</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{trend.affectedEmployeeCount} employés</span>
              </div>
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{trend.affectedDepartments.join(", ")}</span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Confiance de l'analyse</span>
                <span>{(trend.confidence * 100).toFixed(0)}%</span>
              </div>
              <Progress value={trend.confidence * 100} className="h-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TrendAnalysisCard;

