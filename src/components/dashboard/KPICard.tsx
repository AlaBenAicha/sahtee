/**
 * KPI Card Component
 * 
 * Individual KPI card with value, trend indicator, sparkline, and status colors.
 * Part of the 360° Board KPI Banner.
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Shield,
  CheckCircle,
  GraduationCap,
  Calendar,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardKPI } from "@/types/dashboard";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KPICardProps {
  kpi: DashboardKPI;
  onClick?: () => void;
  className?: string;
}

/**
 * Get icon component based on icon name
 */
function getKPIIcon(iconName?: string) {
  const icons: Record<string, React.ElementType> = {
    activity: Activity,
    "trending-down": TrendingDown,
    "shield-check": Shield,
    "check-circle": CheckCircle,
    "graduation-cap": GraduationCap,
    "calendar-check": Calendar,
    "alert-triangle": AlertTriangle,
    "bar-chart": BarChart3,
  };

  return icons[iconName || "activity"] || Activity;
}

/**
 * Get status color classes based on KPI status
 */
function getStatusClasses(status: "good" | "warning" | "critical", category: "lead" | "lag") {
  if (status === "good") {
    return {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      border: "border-emerald-200",
      icon: "text-emerald-600",
    };
  }
  if (status === "warning") {
    return {
      bg: category === "lead" ? "bg-blue-100" : "bg-amber-100",
      text: category === "lead" ? "text-blue-600" : "text-amber-600",
      border: category === "lead" ? "border-blue-200" : "border-amber-200",
      icon: category === "lead" ? "text-blue-600" : "text-amber-600",
    };
  }
  // critical
  return {
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-red-200",
    icon: "text-red-600",
  };
}

/**
 * Get trend icon and color
 */
function getTrendDisplay(trend: DashboardKPI["trend"], kpiId: string) {
  // For "lower-is-better" KPIs, flip the color logic
  const lowerIsBetter = ["tf", "tg"].includes(kpiId);
  
  if (trend.direction === "stable") {
    return {
      icon: Minus,
      color: "text-slate-500",
      label: "Stable",
    };
  }
  
  if (trend.direction === "up") {
    return {
      icon: TrendingUp,
      color: lowerIsBetter ? "text-red-500" : "text-emerald-500",
      label: lowerIsBetter ? "En hausse (négatif)" : "En hausse",
    };
  }
  
  // down
  return {
    icon: TrendingDown,
    color: lowerIsBetter ? "text-emerald-500" : "text-red-500",
    label: lowerIsBetter ? "En baisse (positif)" : "En baisse",
  };
}

/**
 * Format KPI value based on format type
 */
function formatValue(value: number, format?: string, _unit?: string): string {
  switch (format) {
    case "percentage":
      return `${value}%`;
    case "days":
      return `${value}`;
    case "rate":
      return `${value}`;
    default:
      return value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  }
}

/**
 * KPI Card Component
 */
export function KPICard({ kpi, onClick, className }: KPICardProps) {
  const Icon = getKPIIcon(kpi.icon);
  const statusClasses = getStatusClasses(kpi.status, kpi.category);
  const trendDisplay = getTrendDisplay(kpi.trend, kpi.id);
  const TrendIcon = trendDisplay.icon;

  // Prepare sparkline data
  const sparklineData = kpi.sparklineData.map((value, index) => ({
    value,
    index,
  }));

  // Determine sparkline color based on status
  const sparklineColor =
    kpi.status === "good"
      ? "#10b981"
      : kpi.status === "warning"
      ? kpi.category === "lead"
        ? "#3b82f6"
        : "#f59e0b"
      : "#ef4444";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className={cn(
            "border transition-all duration-200 hover:shadow-md cursor-pointer group",
            statusClasses.border,
            onClick && "hover:scale-[1.02]",
            className
          )}
          onClick={onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              {/* Left: Icon and Labels */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("rounded-full p-1.5", statusClasses.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", statusClasses.icon)} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 truncate">
                    {kpi.shortName || kpi.name}
                  </span>
                </div>

                {/* Value and Unit */}
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={cn("text-2xl font-bold", statusClasses.text)}>
                    {formatValue(kpi.value, kpi.format, kpi.unit)}
                  </span>
                  {kpi.unit && kpi.format !== "percentage" && (
                    <span className="text-sm text-slate-500">{kpi.unit}</span>
                  )}
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon className={cn("h-3 w-3", trendDisplay.color)} />
                  <span className={cn("text-xs font-medium", trendDisplay.color)}>
                    {kpi.trend.percentage > 0 && `${kpi.trend.percentage}%`}
                  </span>
                  <span className="text-xs text-slate-400">
                    vs mois précédent
                  </span>
                </div>
              </div>

              {/* Right: Sparkline */}
              <div className="w-16 h-10 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={sparklineColor}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target indicator */}
            {kpi.target && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Objectif</span>
                  <span className="font-medium text-slate-600">
                    {formatValue(kpi.target, kpi.format, kpi.unit)}
                    {kpi.unit && kpi.format !== "percentage" && ` ${kpi.unit}`}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="text-sm">
          <p className="font-medium">{kpi.name}</p>
          {kpi.description && (
            <p className="text-slate-300 mt-1">{kpi.description}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * KPI Card Skeleton for loading state
 */
export function KPICardSkeleton() {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-16 mt-2" />
            <div className="flex items-center gap-1 mt-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="w-16 h-10" />
        </div>
      </CardContent>
    </Card>
  );
}

export default KPICard;
