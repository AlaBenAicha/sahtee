/**
 * Health Trend Charts Component
 * 
 * Displays trend charts for health metrics including:
 * - TMS (Troubles musculo-squelettiques) trends
 * - RPS (Risques psychosociaux) trends
 * - Exposure levels over time
 * - Visit completion rates
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useHealthStats, 
  useVisitStats, 
  useExposureStats,
  usePathologyTrends,
  useVisitTrends,
  useAptitudeTrends,
  useExposureTrends,
} from "@/hooks/useHealth";

// Color palette for charts
const CHART_COLORS = {
  primary: "#4f46e5",
  secondary: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  muted: "#94a3b8",
};

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

interface TrendCardProps {
  title: string;
  value: number | string;
  change: number;
  status: "up" | "down" | "stable";
  subtitle: string;
  invertColors?: boolean; // For metrics where "down" is bad (like compliance)
}

function TrendCard({ title, value, change, status, subtitle, invertColors = false }: TrendCardProps) {
  const TrendIcon = status === "stable" ? Minus : status === "up" ? TrendingUp : TrendingDown;
  
  // For health issues, "down" is usually good (fewer cases)
  // For compliance/positive metrics, "down" is bad
  let trendColor: string;
  if (status === "stable") {
    trendColor = "text-slate-500";
  } else if (invertColors) {
    trendColor = status === "up" ? "text-emerald-500" : "text-red-500";
  } else {
    trendColor = status === "down" ? "text-emerald-500" : "text-red-500";
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <div className={cn("flex items-center gap-1", trendColor)}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-xs font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        <span className="ml-1 text-sm text-slate-500">{subtitle}</span>
      </div>
    </div>
  );
}

interface HealthTrendChartsProps {
  className?: string;
}

export function HealthTrendCharts({ className }: HealthTrendChartsProps) {
  const [activeTab, setActiveTab] = useState("pathologies");
  
  // Fetch all trend data
  const { data: stats, isLoading: statsLoading } = useHealthStats();
  const { data: visitStats, isLoading: visitStatsLoading } = useVisitStats();
  const { data: exposureStats, isLoading: exposureStatsLoading } = useExposureStats();
  const { data: pathologyTrends, isLoading: pathologyLoading } = usePathologyTrends();
  const { data: visitTrends, isLoading: visitTrendsLoading } = useVisitTrends();
  const { data: aptitudeTrends, isLoading: aptitudeLoading } = useAptitudeTrends();
  const { data: exposureTrends, isLoading: exposureTrendsLoading } = useExposureTrends();

  const isLoading = statsLoading || visitStatsLoading || exposureStatsLoading || 
                    pathologyLoading || visitTrendsLoading || aptitudeLoading || exposureTrendsLoading;

  // Prepare fitness status data for pie chart
  const fitnessData = useMemo(() => {
    if (aptitudeTrends?.currentDistribution) {
      return Object.entries(aptitudeTrends.currentDistribution)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: getFitnessStatusLabel(status),
          value: count,
        }));
    }
    if (stats?.fitnessByStatus) {
      return Object.entries(stats.fitnessByStatus)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: getFitnessStatusLabel(status),
          value: count,
        }));
    }
    return [];
  }, [aptitudeTrends, stats]);

  // Prepare exposure data for bar chart
  const exposureData = useMemo(() => {
    if (exposureTrends?.byHazardType && exposureTrends.byHazardType.length > 0) {
      return exposureTrends.byHazardType.map(item => ({
        type: item.type,
        count: item.count,
      }));
    }
    if (exposureStats?.byHazardType) {
      return Object.entries(exposureStats.byHazardType).map(([type, count]) => ({
        type: getHazardTypeLabel(type),
        count,
      }));
    }
    return [];
  }, [exposureTrends, exposureStats]);

  // Summary cards based on active tab
  const summaryCards = useMemo(() => {
    switch (activeTab) {
      case "pathologies":
        return [
          {
            title: "TMS",
            value: pathologyTrends?.currentMonth?.tms || 0,
            change: pathologyTrends?.changes?.tms || 0,
            status: getChangeStatus(pathologyTrends?.changes?.tms || 0),
            subtitle: "cas ce mois",
          },
          {
            title: "RPS",
            value: pathologyTrends?.currentMonth?.rps || 0,
            change: pathologyTrends?.changes?.rps || 0,
            status: getChangeStatus(pathologyTrends?.changes?.rps || 0),
            subtitle: "cas ce mois",
          },
          {
            title: "Respiratoires",
            value: pathologyTrends?.currentMonth?.respiratory || 0,
            change: pathologyTrends?.changes?.respiratory || 0,
            status: getChangeStatus(pathologyTrends?.changes?.respiratory || 0),
            subtitle: "cas ce mois",
          },
          {
            title: "Autres",
            value: pathologyTrends?.currentMonth?.other || 0,
            change: 0,
            status: "stable" as const,
            subtitle: "cas ce mois",
          },
        ];
      
      case "fitness":
        return [
          {
            title: "Aptes",
            value: aptitudeTrends?.currentDistribution?.fit || stats?.fitnessByStatus?.fit || 0,
            change: aptitudeTrends?.changes?.fit || 0,
            status: getChangeStatus(aptitudeTrends?.changes?.fit || 0, true),
            subtitle: "employés",
            invertColors: true,
          },
          {
            title: "Avec restrictions",
            value: aptitudeTrends?.withRestrictions || 0,
            change: aptitudeTrends?.changes?.withRestrictions || 0,
            status: getChangeStatus(aptitudeTrends?.changes?.withRestrictions || 0),
            subtitle: "employés",
          },
          {
            title: "En attente",
            value: aptitudeTrends?.pending || 0,
            change: 0,
            status: "stable" as const,
            subtitle: "examens",
          },
          {
            title: "Total employés",
            value: aptitudeTrends?.totalEmployees || 0,
            change: 0,
            status: "stable" as const,
            subtitle: "suivis",
          },
        ];
      
      case "exposures":
        return [
          {
            title: "Expositions",
            value: exposureStats?.total || exposureTrends?.byHazardType?.length || 0,
            change: exposureTrends?.changes?.exposed || 0,
            status: getChangeStatus(exposureTrends?.changes?.exposed || 0),
            subtitle: "actives",
          },
          {
            title: "Critiques",
            value: exposureStats?.critical || exposureTrends?.criticalCount || 0,
            change: exposureTrends?.changes?.critical || 0,
            status: getChangeStatus(exposureTrends?.changes?.critical || 0),
            subtitle: "dépassements",
          },
          {
            title: "Conformité",
            value: `${exposureTrends?.withinLimitsPercent || 100}`,
            change: 0,
            status: "stable" as const,
            subtitle: "%",
            invertColors: true,
          },
          {
            title: "Employés exposés",
            value: exposureStats?.totalExposedEmployees || exposureTrends?.totalExposed || 0,
            change: 0,
            status: "stable" as const,
            subtitle: "personnes",
          },
        ];
      
      case "visits":
        return [
          {
            title: "Planifiées",
            value: visitTrends?.currentMonth?.scheduled || visitStats?.scheduled || 0,
            change: 0,
            status: "stable" as const,
            subtitle: "ce mois",
          },
          {
            title: "Effectuées",
            value: visitTrends?.currentMonth?.completed || visitStats?.completed || 0,
            change: visitTrends?.changes?.completed || 0,
            status: getChangeStatus(visitTrends?.changes?.completed || 0, true),
            subtitle: "ce mois",
            invertColors: true,
          },
          {
            title: "En retard",
            value: visitTrends?.currentMonth?.overdue || visitStats?.overdue || 0,
            change: 0,
            status: "stable" as const,
            subtitle: "visites",
          },
          {
            title: "Taux conformité",
            value: `${visitTrends?.currentMonth?.compliance || 100}`,
            change: visitTrends?.changes?.compliance || 0,
            status: getChangeStatus(visitTrends?.changes?.compliance || 0, true),
            subtitle: "%",
            invertColors: true,
          },
        ];
      
      default:
        return [];
    }
  }, [activeTab, pathologyTrends, aptitudeTrends, exposureTrends, exposureStats, visitTrends, visitStats, stats]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Tendances Santé
            </CardTitle>
            <CardDescription>
              Évolution des indicateurs de santé au travail sur 12 mois
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tabbed Charts - Tabs on top */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full">
            <TabsTrigger value="pathologies" className="flex-1">Pathologies</TabsTrigger>
            <TabsTrigger value="fitness" className="flex-1">Aptitude</TabsTrigger>
            <TabsTrigger value="exposures" className="flex-1">Expositions</TabsTrigger>
            <TabsTrigger value="visits" className="flex-1">Visites</TabsTrigger>
          </TabsList>

          {/* Dynamic Summary Cards - Below tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {summaryCards.map((card, index) => (
              <TrendCard
                key={`${activeTab}-${index}`}
                title={card.title}
                value={card.value}
                change={card.change}
                status={card.status}
                subtitle={card.subtitle}
                invertColors={card.invertColors}
              />
            ))}
          </div>

          {/* Pathologies Chart */}
          <TabsContent value="pathologies" className="mt-4">
            <div className="h-[300px]">
              {pathologyTrends?.monthlyData && pathologyTrends.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pathologyTrends.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickLine={{ stroke: "#cbd5e1" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#f8fafc",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="tms"
                      name="TMS"
                      stroke={CHART_COLORS.danger}
                      fill={CHART_COLORS.danger}
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="rps"
                      name="RPS"
                      stroke={CHART_COLORS.warning}
                      fill={CHART_COLORS.warning}
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="respiratory"
                      name="Respiratoires"
                      stroke={CHART_COLORS.info}
                      fill={CHART_COLORS.info}
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>Aucune donnée de pathologie disponible</p>
                    <p className="text-sm text-slate-400">Les données apparaîtront lorsque des restrictions médicales seront enregistrées</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Fitness Status Pie Chart */}
          <TabsContent value="fitness" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[300px]">
                {fitnessData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fitnessData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {fitnessData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "none",
                          borderRadius: "8px",
                          color: "#f8fafc",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                      <p>Aucune donnée d'aptitude disponible</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700">Répartition par statut</h4>
                {fitnessData.length > 0 ? (
                  fitnessData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="text-sm text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{item.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Aucune fiche médicale enregistrée</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Exposures Bar Chart */}
          <TabsContent value="exposures" className="mt-4">
            <div className="h-[300px]">
              {exposureData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exposureData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="type"
                      width={100}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#f8fafc",
                      }}
                    />
                    <Bar dataKey="count" name="Expositions" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>Aucune exposition enregistrée</p>
                    <p className="text-sm text-slate-400">Les données apparaîtront lorsque des expositions seront ajoutées</p>
                  </div>
                </div>
              )}
            </div>
            {exposureStats && exposureStats.critical > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">
                  {exposureStats.critical} exposition{exposureStats.critical > 1 ? "s" : ""} dépasse{exposureStats.critical > 1 ? "nt" : ""} les seuils réglementaires
                </span>
              </div>
            )}
          </TabsContent>

          {/* Visits Line Chart */}
          <TabsContent value="visits" className="mt-4">
            <div className="h-[300px]">
              {visitTrends?.monthlyData && visitTrends.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitTrends.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickLine={{ stroke: "#cbd5e1" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#f8fafc",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Visites effectuées"
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.secondary }}
                    />
                    <Line
                      type="monotone"
                      dataKey="compliance"
                      name="Taux conformité (%)"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>Aucune visite médicale enregistrée</p>
                    <p className="text-sm text-slate-400">Les données apparaîtront lorsque des visites seront planifiées</p>
                  </div>
                </div>
              )}
            </div>
            {visitStats && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-slate-50 p-3 text-center">
                  <span className="text-2xl font-bold text-slate-800">{visitStats.scheduled}</span>
                  <p className="text-xs text-slate-500">Planifiées</p>
                </div>
                <div className="rounded-lg border bg-emerald-50 p-3 text-center">
                  <span className="text-2xl font-bold text-emerald-600">{visitStats.completed}</span>
                  <p className="text-xs text-slate-500">Effectuées</p>
                </div>
                <div className="rounded-lg border bg-red-50 p-3 text-center">
                  <span className="text-2xl font-bold text-red-600">{visitStats.overdue}</span>
                  <p className="text-xs text-slate-500">En retard</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getFitnessStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    fit: "Apte",
    fit_with_restrictions: "Apte avec restrictions",
    temporarily_unfit: "Inapte temporaire",
    permanently_unfit: "Inapte définitif",
    pending_examination: "En attente d'examen",
  };
  return labels[status] || status;
}

function getHazardTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    physical: "Physique",
    chemical: "Chimique",
    biological: "Biologique",
    ergonomic: "Ergonomique",
    psychosocial: "Psychosocial",
    mechanical: "Mécanique",
    electrical: "Électrique",
    thermal: "Thermique",
    environmental: "Environnemental",
  };
  return labels[type] || type;
}

function getChangeStatus(change: number, invertForPositive = false): "up" | "down" | "stable" {
  if (change === 0) return "stable";
  if (invertForPositive) {
    return change > 0 ? "up" : "down";
  }
  return change > 0 ? "up" : "down";
}

export default HealthTrendCharts;
