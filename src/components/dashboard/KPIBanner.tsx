/**
 * KPI Banner Component
 * 
 * Displays a responsive grid of KPI cards for the 360° Board.
 * Shows lead and lag indicators with visual differentiation.
 */

import { KPICard, KPICardSkeleton } from "./KPICard";
import { cn } from "@/lib/utils";
import type { DashboardKPI } from "@/types/dashboard";

interface KPIBannerProps {
  kpis: DashboardKPI[];
  loading?: boolean;
  onKPIClick?: (kpi: DashboardKPI) => void;
  className?: string;
}

/**
 * KPI Banner Component
 * Displays KPIs in a responsive grid layout
 */
export function KPIBanner({
  kpis,
  loading = false,
  onKPIClick,
  className,
}: KPIBannerProps) {

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (kpis.length === 0) {
    return (
      <div className={cn("text-center py-8 text-slate-500", className)}>
        <p>Aucun indicateur disponible</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* All KPIs in a single responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.id}
            kpi={kpi}
            onClick={onKPIClick ? () => onKPIClick(kpi) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Compact KPI Banner for smaller displays
 * Shows only key KPIs in a horizontal scroll
 */
interface CompactKPIBannerProps {
  kpis: DashboardKPI[];
  loading?: boolean;
  className?: string;
}

export function CompactKPIBanner({
  kpis,
  loading = false,
  className,
}: CompactKPIBannerProps) {
  if (loading) {
    return (
      <div className={cn("flex gap-3 overflow-x-auto pb-2", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-40">
            <KPICardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Show only top 4 KPIs in compact mode
  const topKPIs = kpis.slice(0, 4);

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-2", className)}>
      {topKPIs.map((kpi) => (
        <div key={kpi.id} className="flex-shrink-0 w-40">
          <KPICard kpi={kpi} />
        </div>
      ))}
    </div>
  );
}

/**
 * KPI Summary Stats - Quick overview numbers
 */
interface KPISummaryProps {
  kpis: DashboardKPI[];
  className?: string;
}

export function KPISummary({ kpis, className }: KPISummaryProps) {
  const goodCount = kpis.filter((k) => k.status === "good").length;
  const warningCount = kpis.filter((k) => k.status === "warning").length;
  const criticalCount = kpis.filter((k) => k.status === "critical").length;

  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-slate-600">
          {goodCount} bon{goodCount > 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-slate-600">
          {warningCount} attention
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-slate-600">
          {criticalCount} critique{criticalCount > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

export default KPIBanner;
