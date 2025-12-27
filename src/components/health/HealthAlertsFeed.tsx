/**
 * Health Alerts Feed Component
 *
 * Displays a real-time feed of health alerts with filtering.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useHealthAlerts,
  useRealtimeHealthAlerts,
  useSyncHealthAlerts,
} from "@/hooks/useHealth";
import type { HealthAlert, HealthAlertSeverity } from "@/types/health";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Filter,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HealthAlertCard } from "./HealthAlertCard";

interface HealthAlertsFeedProps {
  onViewAlertDetails?: (alert: HealthAlert) => void;
  onCreateCapa?: (alert: HealthAlert) => void;
  maxHeight?: string;
}

export function HealthAlertsFeed({
  onViewAlertDetails,
  onCreateCapa,
  maxHeight = "600px",
}: HealthAlertsFeedProps) {
  const [activeTab, setActiveTab] = useState("active");
  const [severityFilter, setSeverityFilter] = useState<
    HealthAlertSeverity | "all"
  >("all");

  // Use realtime subscription for active alerts
  const {
    alerts: realtimeAlerts,
    isLoading: realtimeLoading,
    error: realtimeError,
  } = useRealtimeHealthAlerts();

  // Fetch all alerts for history
  const {
    data: allAlerts,
    isLoading: allLoading,
    refetch,
    error: fetchError,
  } = useHealthAlerts();

  // Sync alerts from existing data
  const syncAlerts = useSyncHealthAlerts();

  const isLoading = realtimeLoading || allLoading;

  // Add logging for debugging
  console.log("[HealthAlertsFeed] Component state:", {
    activeTab,
    severityFilter,
    realtimeLoading,
    allLoading,
    isLoading,
    realtimeAlertsCount: realtimeAlerts?.length ?? 0,
    allAlertsCount: allAlerts?.length ?? 0,
    realtimeError: realtimeError?.message,
    fetchError: fetchError?.message,
  });

  console.log(
    "[HealthAlertsFeed] Realtime alerts:",
    realtimeAlerts?.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      severity: a.severity,
    }))
  );

  console.log(
    "[HealthAlertsFeed] All alerts:",
    allAlerts?.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      severity: a.severity,
    }))
  );

  const handleSyncAlerts = async () => {
    console.log("[HealthAlertsFeed] handleSyncAlerts called");
    try {
      const result = await syncAlerts.mutateAsync();
      console.log("[HealthAlertsFeed] Sync result:", result);
      const total = result.exposureAlerts + result.visitAlerts;
      if (total > 0) {
        toast.success("Alertes synchronisées", {
          description: `${result.exposureAlerts} alerte(s) d'exposition et ${result.visitAlerts} alerte(s) de visite créées.`,
        });
      } else {
        toast.info("Aucune nouvelle alerte", {
          description: "Toutes les alertes sont déjà à jour.",
        });
      }
      refetch();
    } catch (error) {
      console.error("[HealthAlertsFeed] Sync error:", {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      toast.error("Erreur", {
        description: "Impossible de synchroniser les alertes.",
      });
    }
  };

  // Filter alerts based on tab and severity
  const getFilteredAlerts = () => {
    let alerts: HealthAlert[] = [];

    switch (activeTab) {
      case "active":
        alerts = (realtimeAlerts || []).filter((a) => a.status === "active");
        console.log("[HealthAlertsFeed] getFilteredAlerts - active tab:", {
          beforeFilter: realtimeAlerts?.length ?? 0,
          afterFilter: alerts.length,
          statuses: realtimeAlerts?.map((a) => a.status),
        });
        break;
      case "acknowledged":
        alerts = (realtimeAlerts || []).filter(
          (a) => a.status === "acknowledged"
        );
        console.log(
          "[HealthAlertsFeed] getFilteredAlerts - acknowledged tab:",
          {
            beforeFilter: realtimeAlerts?.length ?? 0,
            afterFilter: alerts.length,
          }
        );
        break;
      case "resolved":
        alerts = (allAlerts || []).filter((a) => a.status === "resolved");
        console.log("[HealthAlertsFeed] getFilteredAlerts - resolved tab:", {
          beforeFilter: allAlerts?.length ?? 0,
          afterFilter: alerts.length,
        });
        break;
      default:
        alerts = realtimeAlerts || [];
    }

    if (severityFilter !== "all") {
      const beforeCount = alerts.length;
      alerts = alerts.filter((a) => a.severity === severityFilter);
      console.log(
        "[HealthAlertsFeed] getFilteredAlerts - after severity filter:",
        {
          severityFilter,
          beforeFilter: beforeCount,
          afterFilter: alerts.length,
        }
      );
    }

    console.log("[HealthAlertsFeed] getFilteredAlerts - final result:", {
      count: alerts.length,
      alerts: alerts.map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        severity: a.severity,
      })),
    });

    return alerts;
  };

  const filteredAlerts = getFilteredAlerts();
  const activeCount = (realtimeAlerts || []).filter(
    (a) => a.status === "active"
  ).length;
  const criticalCount = (realtimeAlerts || []).filter(
    (a) => a.status === "active" && a.severity === "critical"
  ).length;

  console.log("[HealthAlertsFeed] Computed counts:", {
    filteredAlertsCount: filteredAlerts.length,
    activeCount,
    criticalCount,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Alertes Santé
              {criticalCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {criticalCount} critique{criticalCount > 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Notifications et alertes de santé au travail
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncAlerts}
              disabled={syncAlerts.isPending}
              title="Synchroniser les alertes depuis les expositions et visites existantes"
            >
              {syncAlerts.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Sync
            </Button>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex gap-1">
            {(["all", "critical", "warning", "info"] as const).map(
              (severity) => (
                <Button
                  key={severity}
                  size="sm"
                  variant={severityFilter === severity ? "default" : "outline"}
                  onClick={() => setSeverityFilter(severity)}
                  className="text-xs"
                >
                  {severity === "all"
                    ? "Tous"
                    : severity === "critical"
                    ? "Critiques"
                    : severity === "warning"
                    ? "Attention"
                    : "Info"}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full">
            <TabsTrigger value="active" className="flex-1 relative">
              Actives
              {activeCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs h-5 min-w-[20px] px-1"
                >
                  {activeCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="acknowledged" className="flex-1">
              En cours
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex-1">
              Résolues
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea style={{ maxHeight }}>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  {activeTab === "active" ? (
                    <>
                      <CheckCircle className="mx-auto h-12 w-12 text-emerald-300" />
                      <p className="mt-2">Aucune alerte active</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Des expositions ou visites en retard existent ?
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={handleSyncAlerts}
                        disabled={syncAlerts.isPending}
                      >
                        {syncAlerts.isPending ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="mr-2 h-4 w-4" />
                        )}
                        Synchroniser les alertes
                      </Button>
                    </>
                  ) : activeTab === "acknowledged" ? (
                    <>
                      <Bell className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-2">
                        Aucune alerte en cours de traitement
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-2">Aucune alerte résolue</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {filteredAlerts.map((alert) => (
                    <HealthAlertCard
                      key={alert.id}
                      alert={alert}
                      onViewDetails={onViewAlertDetails}
                      onCreateCapa={onCreateCapa}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-slate-500 border-t pt-4">
          <span>
            {filteredAlerts.length} alerte{filteredAlerts.length > 1 ? "s" : ""}
          </span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              {
                (realtimeAlerts || []).filter(
                  (a) => a.severity === "critical" && a.status !== "resolved"
                ).length
              }{" "}
              critiques
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              {
                (realtimeAlerts || []).filter(
                  (a) => a.severity === "warning" && a.status !== "resolved"
                ).length
              }{" "}
              avertissements
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HealthAlertsFeed;
