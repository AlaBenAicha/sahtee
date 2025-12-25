/**
 * Exposure Detail Modal Component
 * 
 * Displays detailed information about an exposure record,
 * including measurement history and trends.
 */

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  Biohazard,
  AlertTriangle,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Plus,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrganizationExposure, HazardCategory } from "@/types/health";

const ALERT_LEVEL_CONFIG = {
  low: { label: "Faible", color: "bg-emerald-100 text-emerald-700", chartColor: "#10b981" },
  moderate: { label: "Modéré", color: "bg-blue-100 text-blue-700", chartColor: "#3b82f6" },
  elevated: { label: "Élevé", color: "bg-amber-100 text-amber-700", chartColor: "#f59e0b" },
  critical: { label: "Critique", color: "bg-red-100 text-red-700", chartColor: "#ef4444" },
};

const HAZARD_TYPE_LABELS: Record<HazardCategory, string> = {
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

interface ExposureDetailModalProps {
  exposure: OrganizationExposure | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMeasurement?: (exposure: OrganizationExposure) => void;
}

export function ExposureDetailModal({
  exposure,
  open,
  onOpenChange,
  onAddMeasurement,
}: ExposureDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!exposure) return null;

  const alertConfig = ALERT_LEVEL_CONFIG[exposure.alertLevel];
  
  // Prepare chart data
  const chartData = exposure.measurementHistory.map((m) => ({
    date: format(m.date.toDate(), "dd/MM", { locale: fr }),
    value: m.value,
    limit: exposure.regulatoryLimit,
  }));

  const getTrend = () => {
    if (exposure.measurementHistory.length < 2) return { direction: "stable", change: 0 };
    const last = exposure.measurementHistory[exposure.measurementHistory.length - 1].value;
    const prev = exposure.measurementHistory[exposure.measurementHistory.length - 2].value;
    const change = ((last - prev) / prev) * 100;
    return {
      direction: last > prev ? "up" : last < prev ? "down" : "stable",
      change: Math.abs(change),
    };
  };

  const trend = getTrend();
  const TrendIcon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const trendColor = trend.direction === "up" ? "text-red-500" : trend.direction === "down" ? "text-emerald-500" : "text-slate-400";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Biohazard className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <SheetTitle>{exposure.agent}</SheetTitle>
              <SheetDescription>
                {HAZARD_TYPE_LABELS[exposure.hazardType]} • {exposure.area}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Alert Level */}
            <div className="flex items-center justify-between">
              <Badge className={cn("flex items-center gap-1", alertConfig.color)}>
                {exposure.alertLevel === "critical" && <AlertTriangle className="h-3 w-3" />}
                Niveau {alertConfig.label}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => onAddMeasurement?.(exposure)}>
                <Plus className="mr-1 h-4 w-4" />
                Nouvelle mesure
              </Button>
            </div>

            {/* Current Level Card */}
            <div className={cn(
              "rounded-lg border p-4",
              exposure.percentOfLimit >= 100 ? "border-red-200 bg-red-50" : "border-slate-200"
            )}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600">Niveau actuel</span>
                <div className={cn("flex items-center gap-1", trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-xs">{trend.change.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-3xl font-bold",
                  exposure.percentOfLimit >= 100 ? "text-red-600" : "text-slate-800"
                )}>
                  {exposure.lastMeasurement}
                </span>
                <span className="text-sm text-slate-500">{exposure.unit}</span>
                <span className="text-sm text-slate-400">
                  / {exposure.regulatoryLimit} {exposure.unit}
                </span>
              </div>
              <div className="mt-3">
                <Progress
                  value={Math.min(exposure.percentOfLimit, 100)}
                  className={cn("h-2", exposure.percentOfLimit >= 100 && "animate-pulse")}
                />
                <div className="flex justify-between mt-1 text-xs text-slate-500">
                  <span>0%</span>
                  <span className={exposure.percentOfLimit >= 80 ? "text-amber-600 font-medium" : ""}>
                    {exposure.percentOfLimit.toFixed(0)}% de la limite
                  </span>
                  <span>100%</span>
                </div>
              </div>
              {exposure.regulatoryReference && (
                <p className="text-xs text-slate-400 mt-2">
                  Référence: {exposure.regulatoryReference}
                </p>
              )}
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
                <TabsTrigger value="controls">Mesures</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Employés exposés</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {exposure.exposedEmployeeCount}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Dépassements</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {exposure.exceedanceCount}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Localisation</span>
                  </div>
                  <p className="text-sm text-slate-700">{exposure.area}</p>
                  {exposure.siteName && (
                    <p className="text-sm text-slate-500">{exposure.siteName}</p>
                  )}
                  {exposure.departmentName && (
                    <p className="text-sm text-slate-500">{exposure.departmentName}</p>
                  )}
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Surveillance</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Dernière mesure:</span>
                      <p className="text-slate-700">
                        {format(exposure.lastMeasurementDate.toDate(), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Prochaine mesure:</span>
                      <p className="text-slate-700">
                        {format(exposure.nextMeasurementDue.toDate(), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Fréquence: {getFrequencyLabel(exposure.monitoringFrequency)}
                  </Badge>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-4">
                {chartData.length > 1 ? (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "8px",
                            color: "#f8fafc",
                          }}
                        />
                        <ReferenceLine
                          y={exposure.regulatoryLimit}
                          stroke="#ef4444"
                          strokeDasharray="5 5"
                          label={{ value: "Limite", fill: "#ef4444", fontSize: 12 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={alertConfig.chartColor}
                          strokeWidth={2}
                          dot={{ fill: alertConfig.chartColor }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-500 py-8">
                    Pas assez de données pour afficher le graphique
                  </p>
                )}

                {/* Measurement History List */}
                <div className="mt-4 space-y-2">
                  {exposure.measurementHistory.slice().reverse().map((measurement, index) => (
                    <div
                      key={measurement.id || index}
                      className={cn(
                        "rounded-lg border p-3",
                        !measurement.withinLimits && "border-red-200 bg-red-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-800">
                            {measurement.value} {measurement.unit}
                          </span>
                          {!measurement.withinLimits && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Dépassement
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {format(measurement.date.toDate(), "d MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Méthode: {measurement.method} • Durée: {measurement.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Control Measures Tab */}
              <TabsContent value="controls" className="mt-4">
                {exposure.controlMeasures.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-8">
                    Aucune mesure de contrôle enregistrée
                  </p>
                ) : (
                  <div className="space-y-2">
                    {exposure.controlMeasures.map((measure, index) => (
                      <div key={index} className="rounded-lg border bg-slate-50 p-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                          <span className="text-sm text-slate-700">{measure}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {exposure.linkedCapaIds.length > 0 && (
                  <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-700">
                        {exposure.linkedCapaIds.length} CAPA associée{exposure.linkedCapaIds.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    continuous: "Continue",
    weekly: "Hebdomadaire",
    monthly: "Mensuelle",
    quarterly: "Trimestrielle",
    annually: "Annuelle",
  };
  return labels[frequency] || frequency;
}

export default ExposureDetailModal;

