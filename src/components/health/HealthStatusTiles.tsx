/**
 * Health Status Tiles Component
 * 
 * Displays aggregate health KPIs in tile format for the dashboard.
 * Shows: Active Cases, Pending Visits, Overdue Visits, Active Alerts, Absenteeism Rate
 */

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  AlertCircle,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  HeartPulse,
  Biohazard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHealthDashboardCounts } from "@/hooks/useHealth";

interface StatusTileProps {
  title: string;
  value: number;
  subtitle?: string;
  change?: number;
  status?: "good" | "warning" | "critical";
  icon: React.ElementType;
  onClick?: () => void;
}

function StatusTile({
  title,
  value,
  subtitle,
  change,
  status = "good",
  icon: Icon,
  onClick,
}: StatusTileProps) {
  const statusColors = {
    good: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    critical: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: "text-red-600",
      iconBg: "bg-red-100",
    },
  };

  const colors = statusColors[status];

  const TrendIcon = change === undefined || change === 0 
    ? Minus 
    : change > 0 
    ? TrendingUp 
    : TrendingDown;

  // For most health metrics, an increase is bad
  const trendColor = change === undefined || change === 0
    ? "text-slate-500"
    : change > 0
    ? "text-red-500"
    : "text-emerald-500";

  return (
    <Card
      className={cn(
        "border transition-all duration-200 hover:shadow-md",
        colors.border,
        colors.bg,
        onClick && "cursor-pointer hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={cn("rounded-lg p-2", colors.iconBg)}>
                <Icon className={cn("h-4 w-4", colors.icon)} />
              </div>
              <span className="text-sm font-medium text-slate-600">{title}</span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", colors.text)}>
                {value.toLocaleString("fr-FR")}
              </span>
              {subtitle && (
                <span className="text-sm text-slate-500">{subtitle}</span>
              )}
            </div>

            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                <TrendIcon className={cn("h-3 w-3", trendColor)} />
                <span className={cn("text-xs font-medium", trendColor)}>
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-slate-400">vs mois précédent</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusTileSkeleton() {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="mt-3 h-9 w-16" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface HealthStatusTilesProps {
  onTileClick?: (tileId: string) => void;
}

export function HealthStatusTiles({ onTileClick }: HealthStatusTilesProps) {
  const { counts, isLoading } = useHealthDashboardCounts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatusTileSkeleton key={i} />
        ))}
      </div>
    );
  }

  const tiles = [
    {
      id: "active-cases",
      title: "Cas actifs",
      value: counts.activeCases,
      status: counts.activeCases > 10 ? "critical" : counts.activeCases > 5 ? "warning" : "good",
      icon: Users,
    },
    {
      id: "surveillance",
      title: "Sous surveillance",
      value: counts.employeesUnderSurveillance,
      status: "good",
      icon: Activity,
    },
    {
      id: "pending-visits",
      title: "Visites planifiées",
      value: counts.pendingVisits,
      status: counts.pendingVisits > 20 ? "warning" : "good",
      icon: Calendar,
    },
    {
      id: "overdue-visits",
      title: "Visites en retard",
      value: counts.overdueVisits,
      status: counts.overdueVisits > 5 ? "critical" : counts.overdueVisits > 0 ? "warning" : "good",
      icon: AlertCircle,
    },
    {
      id: "active-alerts",
      title: "Alertes actives",
      value: counts.activeAlerts,
      subtitle: counts.criticalAlerts > 0 ? `${counts.criticalAlerts} critiques` : undefined,
      status: counts.criticalAlerts > 0 ? "critical" : counts.activeAlerts > 0 ? "warning" : "good",
      icon: Bell,
    },
    {
      id: "exposures",
      title: "Expositions critiques",
      value: counts.criticalExposures,
      status: counts.criticalExposures > 0 ? "critical" : "good",
      icon: Biohazard,
    },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-rose-500" />
          <h2 className="text-lg font-semibold text-slate-800">Statut Santé</h2>
        </div>
        {counts.criticalAlerts > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {counts.criticalAlerts} alerte{counts.criticalAlerts > 1 ? "s" : ""} critique{counts.criticalAlerts > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Tiles Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {tiles.map((tile) => (
          <StatusTile
            key={tile.id}
            title={tile.title}
            value={tile.value}
            subtitle={"subtitle" in tile ? tile.subtitle : undefined}
            status={tile.status as "good" | "warning" | "critical"}
            icon={tile.icon}
            onClick={() => onTileClick?.(tile.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default HealthStatusTiles;

