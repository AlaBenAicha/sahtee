/**
 * Analytics Page - Advanced Analytics and Reporting
 * 
 * Handles query parameters:
 * - kpi: Shows detailed view for a specific KPI
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Download, 
  ArrowLeft,
  Activity,
  Shield,
  CheckCircle,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Minus,
} from "lucide-react";
import { useKPIs, useTrendData } from "@/hooks/useDashboard";
import type { DashboardKPI } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// KPI icon mapping
const kpiIcons: Record<string, React.ReactNode> = {
  "tf": <Activity className="h-5 w-5" />,
  "tg": <TrendingDown className="h-5 w-5" />,
  "compliance-rate": <Shield className="h-5 w-5" />,
  "capa-closure": <CheckCircle className="h-5 w-5" />,
  "training-rate": <GraduationCap className="h-5 w-5" />,
  "days-without-incident": <Calendar className="h-5 w-5" />,
  "near-miss-ratio": <AlertTriangle className="h-5 w-5" />,
};

function TrendIcon({ direction }: { direction: "up" | "down" | "stable" }) {
  switch (direction) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-slate-400" />;
  }
}

function KPIDetailView({ kpi }: { kpi: DashboardKPI }) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const { data: trendData, isLoading: trendLoading } = useTrendData(kpi.id, period);

  // Generate chart data from trend data or sparkline
  const chartData = trendData?.map((point, index) => ({
    name: point.label || `J-${trendData.length - index}`,
    value: point.value,
  })) || kpi.sparklineData.map((value, index) => ({
    name: `J-${kpi.sparklineData.length - index}`,
    value,
  }));

  const statusColors = {
    good: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    critical: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-6">
      {/* KPI Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-lg",
                kpi.status === "good" && "bg-emerald-100",
                kpi.status === "warning" && "bg-amber-100",
                kpi.status === "critical" && "bg-red-100",
              )}>
                {kpiIcons[kpi.id] || <Activity className="h-5 w-5" />}
              </div>
              <div>
                <CardTitle className="text-xl">{kpi.name}</CardTitle>
                <CardDescription>{kpi.description}</CardDescription>
              </div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border",
              statusColors[kpi.status]
            )}>
              {kpi.status === "good" && "Bon"}
              {kpi.status === "warning" && "Attention"}
              {kpi.status === "critical" && "Critique"}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Valeur actuelle</p>
              <p className="text-3xl font-bold text-slate-900">
                {kpi.value}{kpi.unit}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Objectif</p>
              <p className="text-3xl font-bold text-slate-600">
                {kpi.target}{kpi.unit}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Tendance</p>
              <div className="flex items-center justify-center gap-2">
                <TrendIcon direction={kpi.trend.direction} />
                <span className="text-2xl font-bold">
                  {kpi.trend.percentage}%
                </span>
              </div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Seuils</p>
              <p className="text-sm">
                <span className="text-amber-600">⚠ {kpi.threshold.warning}</span>
                {" / "}
                <span className="text-red-600">⛔ {kpi.threshold.critical}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution de {kpi.shortName || kpi.name}
            </CardTitle>
            <div className="flex gap-1">
              {(["7d", "30d", "90d", "1y"] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {p === "7d" && "7 jours"}
                  {p === "30d" && "30 jours"}
                  {p === "90d" && "3 mois"}
                  {p === "1y" && "1 an"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500">Chargement des données...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                {kpi.target && (
                  <ReferenceLine 
                    y={kpi.target} 
                    stroke="#10b981" 
                    strokeDasharray="5 5"
                    label={{ value: "Objectif", fill: "#10b981", fontSize: 12 }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: "#0ea5e9", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const kpiId = searchParams.get("kpi");
  
  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const selectedKPI = kpis?.find(k => k.id === kpiId);

  // If a KPI is selected, show detailed view
  if (kpiId && selectedKPI) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/app/analytics")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux analytiques
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Détail KPI: {selectedKPI.shortName || selectedKPI.name}
            </h1>
          </div>
        </div>
        
        <KPIDetailView kpi={selectedKPI} />
      </div>
    );
  }

  // Default analytics overview
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytiques</h1>
          <p className="text-slate-600 mt-1">Tableaux de bord et rapports avancés</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter les données
        </Button>
      </div>

      {/* KPIs Grid */}
      {kpisLoading ? (
        <div className="text-center py-12 text-slate-500">
          Chargement des KPIs...
        </div>
      ) : kpis && kpis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <Card 
              key={kpi.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/app/analytics?kpi=${kpi.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {kpiIcons[kpi.id] || <Activity className="h-4 w-4" />}
                    <CardTitle className="text-sm font-medium">
                      {kpi.shortName || kpi.name}
                    </CardTitle>
                  </div>
                  <TrendIcon direction={kpi.trend.direction} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-2xl font-bold",
                    kpi.status === "good" && "text-emerald-600",
                    kpi.status === "warning" && "text-amber-600",
                    kpi.status === "critical" && "text-red-600",
                  )}>
                    {kpi.value}
                  </span>
                  <span className="text-slate-500 text-sm">{kpi.unit}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Objectif: {kpi.target}{kpi.unit}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Incidents par mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <BarChart3 className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Graphique en cours de développement</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendances de sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <TrendingUp className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Graphique en cours de développement</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Répartition par type d'incident
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <PieChart className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Graphique en cours de développement</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Conformité par département
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <BarChart3 className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Graphique en cours de développement</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
