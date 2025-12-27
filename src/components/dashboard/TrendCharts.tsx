/**
 * Trend Charts Component
 * 
 * Multi-series line charts for KPI trend visualization.
 * Uses Recharts with custom theming for the 360° Board.
 */

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { TrendPoint, DashboardKPI } from "@/types/dashboard";

interface TrendChartsProps {
  data: TrendPoint[];
  kpi?: DashboardKPI;
  title?: string;
  period?: "7d" | "30d" | "90d" | "1y";
  onPeriodChange?: (period: "7d" | "30d" | "90d" | "1y") => void;
  showTarget?: boolean;
  loading?: boolean;
  className?: string;
}

const periodLabels: Record<string, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "90d": "90 jours",
  "1y": "1 an",
};

/**
 * Format date for X-axis based on period
 */
function formatDate(date: Date | { toDate: () => Date }, period: string): string {
  const d = date instanceof Date ? date : date.toDate();
  
  if (period === "7d") {
    return d.toLocaleDateString("fr-FR", { weekday: "short" });
  }
  if (period === "30d") {
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  }
  if (period === "90d") {
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  }
  // 1y
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

/**
 * Single KPI Trend Chart
 */
export function TrendChart({
  data,
  kpi,
  title,
  period = "30d",
  onPeriodChange,
  showTarget = true,
  loading = false,
  className,
}: TrendChartsProps) {
  const chartConfig: ChartConfig = {
    value: {
      label: kpi?.name || "Valeur",
      color: kpi?.status === "good" 
        ? "var(--chart-1)" 
        : kpi?.status === "warning"
        ? "var(--chart-4)"
        : "var(--chart-5)",
    },
    target: {
      label: "Objectif",
      color: "var(--chart-2)",
    },
  };

  // Transform data for Recharts
  const chartData = data.map((point) => ({
    date: point.label || formatDate(point.date, period),
    value: point.value,
    fullDate: point.date instanceof Date 
      ? point.date.toLocaleDateString("fr-FR")
      : point.date.toDate().toLocaleDateString("fr-FR"),
  }));

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title || kpi?.name || "Tendance"}</CardTitle>
          {onPeriodChange && (
            <div className="flex gap-1">
              {(["7d", "30d", "90d", "1y"] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange(p)}
                  className="text-xs h-7 px-2"
                >
                  {periodLabels[p]}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickMargin={8}
              domain={["auto", "auto"]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullDate || "";
                  }}
                />
              }
            />
            {/* Target reference line */}
            {showTarget && kpi?.target && (
              <ReferenceLine
                y={kpi.target}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{
                  value: `Objectif: ${kpi.target}`,
                  position: "right",
                  fontSize: 10,
                  fill: "#22c55e",
                }}
              />
            )}
            {/* Warning threshold line */}
            {kpi?.threshold?.warning && (
              <ReferenceLine
                y={kpi.threshold.warning}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-value)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>

        {/* Current value summary */}
        {kpi && chartData.length > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
            <div>
              <span className="text-slate-500">Dernière valeur: </span>
              <span className="font-semibold">
                {chartData[chartData.length - 1].value}
                {kpi.unit && ` ${kpi.unit}`}
              </span>
            </div>
            {kpi.target && (
              <div>
                <span className="text-slate-500">Objectif: </span>
                <span className="font-semibold text-emerald-600">
                  {kpi.target}
                  {kpi.unit && ` ${kpi.unit}`}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Multi-KPI Comparison Chart
 */
interface MultiTrendChartProps {
  kpis: DashboardKPI[];
  period?: "7d" | "30d" | "90d" | "1y";
  onPeriodChange?: (period: "7d" | "30d" | "90d" | "1y") => void;
  loading?: boolean;
  className?: string;
}

export function MultiTrendChart({
  kpis,
  period = "30d",
  onPeriodChange,
  loading = false,
  className,
}: MultiTrendChartProps) {
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(
    kpis.slice(0, 2).map((k) => k.id)
  );

  // Build chart config for selected KPIs
  const chartConfig: ChartConfig = {};
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
  ];

  selectedKPIs.forEach((kpiId, index) => {
    const kpi = kpis.find((k) => k.id === kpiId);
    if (kpi) {
      chartConfig[kpiId] = {
        label: kpi.shortName || kpi.name,
        color: colors[index % colors.length],
      };
    }
  });

  // Create combined chart data from sparkline data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const point: Record<string, number | string> = {
      index: i,
      label: `J-${6 - i}`,
    };
    selectedKPIs.forEach((kpiId) => {
      const kpi = kpis.find((k) => k.id === kpiId);
      if (kpi?.sparklineData?.[i] !== undefined) {
        point[kpiId] = kpi.sparklineData[i];
      }
    });
    return point;
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const toggleKPI = (kpiId: string) => {
    setSelectedKPIs((prev) => {
      if (prev.includes(kpiId)) {
        return prev.filter((id) => id !== kpiId);
      }
      if (prev.length < 4) {
        return [...prev, kpiId];
      }
      return prev;
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tendances KPI</CardTitle>
          {onPeriodChange && (
            <div className="flex gap-1">
              {(["7d", "30d", "90d", "1y"] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange(p)}
                  className="text-xs h-7 px-2"
                >
                  {periodLabels[p]}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* KPI Selector */}
        <div className="flex flex-wrap items-center justify-start gap-2 mb-4">
          {kpis.map((kpi) => {
            const isSelected = selectedKPIs.includes(kpi.id);
            const selectedIndex = selectedKPIs.indexOf(kpi.id);
            
            // Chart colors for selected buttons
            const chartColors = ["#1f4993", "#3a70b7", "#5a8fd1", "#7ba8e5"];
            const bgColor = isSelected ? chartColors[selectedIndex % chartColors.length] : undefined;

            return (
              <Button
                key={kpi.id}
                variant="outline"
                size="sm"
                onClick={() => toggleKPI(kpi.id)}
                className="text-xs h-7"
                style={isSelected ? {
                  backgroundColor: bgColor,
                  color: "#ffffff",
                  borderColor: bgColor,
                } : undefined}
              >
                {kpi.shortName || kpi.name}
              </Button>
            );
          })}
        </div>

        <ChartContainer config={chartConfig} className="h-48 w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {selectedKPIs.map((kpiId, index) => (
              <Line
                key={kpiId}
                type="monotone"
                dataKey={kpiId}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default TrendChart;
