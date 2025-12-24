/**
 * Risk Map Component
 * 
 * Interactive 5x5 risk heatmap for the 360° Board.
 * Shows risk distribution by severity and likelihood.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { RiskMapCell, RiskMapViewMode } from "@/types/dashboard";

interface RiskMapProps {
  data: RiskMapCell[][];
  viewMode?: RiskMapViewMode;
  onViewModeChange?: (mode: RiskMapViewMode) => void;
  onCellClick?: (cell: RiskMapCell) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Get cell color based on risk score (severity × likelihood)
 */
function getCellColor(severity: number, likelihood: number, count: number): string {
  if (count === 0) {
    return "bg-slate-50 hover:bg-slate-100";
  }

  const riskScore = severity * likelihood;

  if (riskScore >= 20) {
    return "bg-red-500 hover:bg-red-600 text-white"; // Critical
  }
  if (riskScore >= 12) {
    return "bg-orange-500 hover:bg-orange-600 text-white"; // High
  }
  if (riskScore >= 6) {
    return "bg-amber-400 hover:bg-amber-500 text-slate-900"; // Medium
  }
  if (riskScore >= 3) {
    return "bg-yellow-300 hover:bg-yellow-400 text-slate-900"; // Low
  }
  return "bg-emerald-200 hover:bg-emerald-300 text-slate-900"; // Negligible
}

/**
 * Get risk level label
 */
function getRiskLevel(severity: number, likelihood: number): string {
  const riskScore = severity * likelihood;
  if (riskScore >= 20) return "Critique";
  if (riskScore >= 12) return "Élevé";
  if (riskScore >= 6) return "Moyen";
  if (riskScore >= 3) return "Faible";
  return "Négligeable";
}

/**
 * Severity labels (Y-axis)
 */
const severityLabels = [
  { value: 5, label: "Catastrophique" },
  { value: 4, label: "Majeur" },
  { value: 3, label: "Modéré" },
  { value: 2, label: "Mineur" },
  { value: 1, label: "Négligeable" },
];

/**
 * Likelihood labels (X-axis)
 */
const likelihoodLabels = [
  { value: 1, label: "Rare" },
  { value: 2, label: "Peu probable" },
  { value: 3, label: "Possible" },
  { value: 4, label: "Probable" },
  { value: 5, label: "Très probable" },
];

/**
 * Individual Risk Map Cell
 */
interface RiskMapCellComponentProps {
  cell: RiskMapCell;
  onClick?: () => void;
}

function RiskMapCellComponent({ cell, onClick }: RiskMapCellComponentProps) {
  const colorClass = getCellColor(cell.severity, cell.likelihood, cell.count);
  const riskLevel = getRiskLevel(cell.severity, cell.likelihood);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "w-full aspect-square flex items-center justify-center",
            "text-sm font-semibold rounded transition-all duration-150",
            "border border-white/20",
            colorClass,
            cell.count > 0 && "cursor-pointer",
            cell.count === 0 && "cursor-default"
          )}
          onClick={cell.count > 0 ? onClick : undefined}
          aria-label={`${cell.count} risques - Sévérité ${cell.severity}, Probabilité ${cell.likelihood}`}
        >
          {cell.count > 0 ? cell.count : ""}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="text-sm">
          <p className="font-semibold">{riskLevel}</p>
          <p className="text-slate-300">
            Sévérité: {severityLabels.find((s) => s.value === cell.severity)?.label}
          </p>
          <p className="text-slate-300">
            Probabilité: {likelihoodLabels.find((l) => l.value === cell.likelihood)?.label}
          </p>
          {cell.count > 0 && (
            <>
              <p className="mt-1 font-medium">{cell.count} risque{cell.count > 1 ? "s" : ""}</p>
              {cell.risks.slice(0, 3).map((risk) => (
                <p key={risk.id} className="text-xs text-slate-400 truncate">
                  • {risk.title}
                </p>
              ))}
              {cell.risks.length > 3 && (
                <p className="text-xs text-slate-400">
                  +{cell.risks.length - 3} autres...
                </p>
              )}
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Risk Map Component
 */
export function RiskMap({
  data,
  viewMode = "residual",
  onViewModeChange,
  onCellClick,
  loading = false,
  className,
}: RiskMapProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Matrice des risques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals for the legend
  const totalRisks = data.flat().reduce((sum, cell) => sum + cell.count, 0);
  const criticalRisks = data
    .flat()
    .filter((c) => c.severity * c.likelihood >= 20)
    .reduce((sum, cell) => sum + cell.count, 0);
  const highRisks = data
    .flat()
    .filter((c) => {
      const score = c.severity * c.likelihood;
      return score >= 12 && score < 20;
    })
    .reduce((sum, cell) => sum + cell.count, 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Matrice des risques</CardTitle>
          {onViewModeChange && (
            <div className="flex gap-1">
              <Button
                variant={viewMode === "initial" ? "default" : "outline"}
                size="sm"
                onClick={() => onViewModeChange("initial")}
                className="text-xs h-7"
              >
                Initial
              </Button>
              <Button
                variant={viewMode === "residual" ? "default" : "outline"}
                size="sm"
                onClick={() => onViewModeChange("residual")}
                className="text-xs h-7"
              >
                Résiduel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Risk Matrix Grid */}
        <div className="flex gap-2">
          {/* Y-axis label */}
          <div className="flex flex-col items-center justify-center">
            <span
              className="text-xs font-medium text-slate-500 writing-mode-vertical transform -rotate-180"
              style={{ writingMode: "vertical-rl" }}
            >
              Sévérité →
            </span>
          </div>

          {/* Matrix with labels */}
          <div className="flex-1">
            <div className="grid grid-cols-6 gap-1">
              {/* Empty corner cell */}
              <div className="aspect-square" />

              {/* X-axis labels */}
              {likelihoodLabels.map((label) => (
                <div
                  key={label.value}
                  className="aspect-square flex items-center justify-center text-[10px] text-slate-500 font-medium text-center leading-tight p-1"
                >
                  {label.label}
                </div>
              ))}

              {/* Matrix rows (severity 5 to 1) */}
              {data.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {/* Y-axis label for this row */}
                  <div className="aspect-square flex items-center justify-center text-[10px] text-slate-500 font-medium text-center leading-tight p-1">
                    {severityLabels[rowIndex]?.label}
                  </div>

                  {/* Cells for this row */}
                  {row.map((cell, colIndex) => (
                    <RiskMapCellComponent
                      key={`${rowIndex}-${colIndex}`}
                      cell={cell}
                      onClick={onCellClick ? () => onCellClick(cell) : undefined}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* X-axis label */}
            <div className="text-center mt-2">
              <span className="text-xs font-medium text-slate-500">
                Probabilité →
              </span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-slate-600">{criticalRisks} critiques</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-slate-600">{highRisks} élevés</span>
            </div>
          </div>
          <span className="text-sm text-slate-500">{totalRisks} risques au total</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 text-xs">
          <span className="text-slate-500">Niveau:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-emerald-200" />
            <span className="text-slate-600">Négligeable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-yellow-300" />
            <span className="text-slate-600">Faible</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-amber-400" />
            <span className="text-slate-600">Moyen</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-slate-600">Élevé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-slate-600">Critique</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Risk Map for smaller displays
 */
export function CompactRiskMap({
  data,
  className,
}: {
  data: RiskMapCell[][];
  className?: string;
}) {
  const totalRisks = data.flat().reduce((sum, cell) => sum + cell.count, 0);
  const criticalRisks = data
    .flat()
    .filter((c) => c.severity * c.likelihood >= 20)
    .reduce((sum, cell) => sum + cell.count, 0);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Risques</h3>
            <p className="text-2xl font-bold text-slate-900">{totalRisks}</p>
          </div>
          {criticalRisks > 0 && (
            <div className="text-right">
              <span className="text-xs text-red-600 font-medium">
                {criticalRisks} critique{criticalRisks > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RiskMap;
