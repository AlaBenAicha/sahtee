/**
 * Health Alerts Feed Component
 * 
 * Displays a real-time feed of health alerts with filtering.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import {
  useRealtimeHealthAlerts,
  useHealthAlerts,
} from "@/hooks/useHealth";
import { HealthAlertCard } from "./HealthAlertCard";
import type { HealthAlert, HealthAlertSeverity } from "@/types/health";

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
  const [severityFilter, setSeverityFilter] = useState<HealthAlertSeverity | "all">("all");

  // Use realtime subscription for active alerts
  const { alerts: realtimeAlerts, isLoading: realtimeLoading } = useRealtimeHealthAlerts();
  
  // Fetch all alerts for history
  const { data: allAlerts, isLoading: allLoading, refetch } = useHealthAlerts();

  const isLoading = realtimeLoading || allLoading;

  // Filter alerts based on tab and severity
  const getFilteredAlerts = () => {
    let alerts: HealthAlert[] = [];
    
    switch (activeTab) {
      case "active":
        alerts = (realtimeAlerts || []).filter(a => a.status === "active");
        break;
      case "acknowledged":
        alerts = (realtimeAlerts || []).filter(a => a.status === "acknowledged");
        break;
      case "resolved":
        alerts = (allAlerts || []).filter(a => a.status === "resolved");
        break;
      default:
        alerts = realtimeAlerts || [];
    }

    if (severityFilter !== "all") {
      alerts = alerts.filter(a => a.severity === severityFilter);
    }

    return alerts;
  };

  const filteredAlerts = getFilteredAlerts();
  const activeCount = (realtimeAlerts || []).filter(a => a.status === "active").length;
  const criticalCount = (realtimeAlerts || []).filter(a => a.status === "active" && a.severity === "critical").length;

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
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex gap-1">
            {(["all", "critical", "warning", "info"] as const).map((severity) => (
              <Button
                key={severity}
                size="sm"
                variant={severityFilter === severity ? "default" : "outline"}
                onClick={() => setSeverityFilter(severity)}
                className="text-xs"
              >
                {severity === "all" ? "Tous" :
                 severity === "critical" ? "Critiques" :
                 severity === "warning" ? "Attention" : "Info"}
              </Button>
            ))}
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
                    </>
                  ) : activeTab === "acknowledged" ? (
                    <>
                      <Bell className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-2">Aucune alerte en cours de traitement</p>
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
          <span>{filteredAlerts.length} alerte{filteredAlerts.length > 1 ? "s" : ""}</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              {(realtimeAlerts || []).filter(a => a.severity === "critical" && a.status !== "resolved").length} critiques
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              {(realtimeAlerts || []).filter(a => a.severity === "warning" && a.status !== "resolved").length} avertissements
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HealthAlertsFeed;

