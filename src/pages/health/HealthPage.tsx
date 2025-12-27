/**
 * Health Page - Healthmeter Module
 * 
 * Comprehensive occupational health management including:
 * - Health Status Dashboard (aggregate view for QHSE/HR)
 * - Medical Records (physician-only access)
 * - Visit Scheduling
 * - Exposure Monitoring
 * - Health Alerts
 * - Health-AI Integration
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HeartPulse,
  FileText,
  Calendar,
  AlertTriangle,
  Bell,
  Brain,
  Lock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  useHealthDashboardCounts,
  useIsPhysician,
  useRecalculateHealthStats,
} from "@/hooks/useHealth";

// Import health components
import { HealthStatusTiles } from "@/components/health/HealthStatusTiles";
import { HealthTrendCharts } from "@/components/health/HealthTrendCharts";
import { MedicalRecordsList } from "@/components/health/MedicalRecordsList";
import { MedicalRecordForm } from "@/components/health/MedicalRecordForm";
import { MedicalRecordDetail } from "@/components/health/MedicalRecordDetail";
import { VisitCalendar } from "@/components/health/VisitCalendar";
import { VisitForm } from "@/components/health/VisitForm";
import { VisitList } from "@/components/health/VisitList";
import { ExposureTable } from "@/components/health/ExposureTable";
import { ExposureDetailModal } from "@/components/health/ExposureDetailModal";
import { ExposureForm } from "@/components/health/ExposureForm";
import { MeasurementForm } from "@/components/health/MeasurementForm";
import { HealthAlertsFeed } from "@/components/health/HealthAlertsFeed";
import { HealthAIPanel } from "@/components/health/ai/HealthAIPanel";

import type { HealthRecord, MedicalVisit, OrganizationExposure, HealthAlert } from "@/types/health";

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  physicianOnly?: boolean;
  badge?: number;
  badgeVariant?: "default" | "destructive" | "secondary";
}

export default function HealthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isPhysician = useIsPhysician();
  const { counts, isLoading: countsLoading } = useHealthDashboardCounts();
  const recalculateStats = useRecalculateHealthStats();

  // State for modals and selected items
  const [activeTab, setActiveTab] = useState("status");
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<MedicalVisit | null>(null);
  const [selectedExposure, setSelectedExposure] = useState<OrganizationExposure | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<HealthAlert | null>(null);

  // Form modals
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showExposureForm, setShowExposureForm] = useState(false);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [exposureForMeasurement, setExposureForMeasurement] = useState<OrganizationExposure | null>(null);
  const [visitFormDate, setVisitFormDate] = useState<Date | undefined>(undefined);

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: "status",
      label: "Statut santé",
      icon: HeartPulse,
    },
    {
      id: "records",
      label: "Fiches médicales",
      icon: FileText,
      physicianOnly: true,
    },
    {
      id: "visits",
      label: "Visites",
      icon: Calendar,
      badge: counts.overdueVisits > 0 ? counts.overdueVisits : undefined,
      badgeVariant: "destructive",
    },
    {
      id: "exposures",
      label: "Expositions",
      icon: AlertTriangle,
      badge: counts.criticalExposures > 0 ? counts.criticalExposures : undefined,
      badgeVariant: "destructive",
    },
    {
      id: "alerts",
      label: "Alertes",
      icon: Bell,
      badge: counts.activeAlerts > 0 ? counts.activeAlerts : undefined,
      badgeVariant: counts.criticalAlerts > 0 ? "destructive" : "secondary",
    },
    {
      id: "ai",
      label: "Health-AI",
      icon: Brain,
    },
  ];

  // Filter tabs based on physician access
  const visibleTabs = tabs.filter((tab) => !tab.physicianOnly || isPhysician);

  // Handle tile clicks to navigate to tabs
  const handleTileClick = (tileId: string) => {
    switch (tileId) {
      case "active-cases":
      case "surveillance":
        if (isPhysician) setActiveTab("records");
        break;
      case "pending-visits":
      case "overdue-visits":
        setActiveTab("visits");
        break;
      case "active-alerts":
        setActiveTab("alerts");
        break;
      case "exposures":
        setActiveTab("exposures");
        break;
    }
  };

  // Handle record selection
  const handleSelectRecord = (record: HealthRecord) => {
    setSelectedRecord(record);
  };

  const handleCreateRecord = () => {
    setSelectedRecord(null);
    setShowRecordForm(true);
  };

  const handleEditRecord = (record: HealthRecord) => {
    setSelectedRecord(record);
    setShowRecordForm(true);
  };

  // Handle visit selection
  const handleSelectVisit = (visit: MedicalVisit) => {
    setSelectedVisit(visit);
  };

  const handleCreateVisit = (date?: Date) => {
    setVisitFormDate(date);
    setSelectedVisit(null);
    setShowVisitForm(true);
  };

  const handleEditVisit = (visit: MedicalVisit) => {
    setSelectedVisit(visit);
    setShowVisitForm(true);
  };

  // Handle exposure selection
  const handleSelectExposure = (exposure: OrganizationExposure) => {
    setSelectedExposure(exposure);
  };

  // Handle exposure creation
  const handleCreateExposure = () => {
    setSelectedExposure(null);
    setShowExposureForm(true);
  };

  // Handle alert actions
  const handleViewAlertDetails = (alert: HealthAlert) => {
    setSelectedAlert(alert);
  };

  const handleCreateCapaFromAlert = (alert: HealthAlert) => {
    // Navigate to CAPA Room with pre-filled data from alert
    navigate("/app/capa", {
      state: {
        createMode: true,
        prefill: {
          title: `CAPA: ${alert.title}`,
          description: alert.description,
          source: "health_alert",
          sourceId: alert.id,
          priority: alert.severity === "critical" ? "haute" :
            alert.severity === "warning" ? "moyenne" : "basse",
          category: "correctif" as const,
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rose-100 p-2">
              <HeartPulse className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Healthmeter</h1>
              <p className="text-slate-600">
                Surveillance et gestion de la santé au travail
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPhysician && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Accès médecin
            </Badge>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => recalculateStats.mutate()}
            disabled={recalculateStats.isPending}
          >
            <RefreshCw className={cn("h-4 w-4", recalculateStats.isPending && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start gap-1 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 flex-shrink-0 min-w-fit px-4"
                title={tab.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Badge
                    variant={tab.badgeVariant}
                    className="h-5 min-w-[20px] px-1 text-xs shrink-0"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Status Tab - Health Dashboard */}
        <TabsContent value="status" className="mt-6 space-y-6">
          <HealthStatusTiles onTileClick={handleTileClick} />
          <HealthTrendCharts />
        </TabsContent>

        {/* Records Tab - Medical Records (Physician Only) */}
        {isPhysician && (
          <TabsContent value="records" className="mt-6">
            <MedicalRecordsList
              onSelectRecord={handleSelectRecord}
              onCreateRecord={handleCreateRecord}
            />
          </TabsContent>
        )}

        {/* Visits Tab */}
        <TabsContent value="visits" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisitCalendar
              onSelectVisit={handleSelectVisit}
              onCreateVisit={handleCreateVisit}
            />
            <VisitList
              onSelectVisit={handleSelectVisit}
              onEditVisit={handleEditVisit}
              onCreateVisit={handleCreateVisit}
            />
          </div>
        </TabsContent>

        {/* Exposures Tab */}
        <TabsContent value="exposures" className="mt-6">
          <ExposureTable
            onSelectExposure={handleSelectExposure}
            onCreateExposure={handleCreateExposure}
          />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <HealthAlertsFeed
            onViewAlertDetails={handleViewAlertDetails}
            onCreateCapa={handleCreateCapaFromAlert}
          />
        </TabsContent>

        {/* Health-AI Tab */}
        <TabsContent value="ai" className="mt-6">
          <HealthAIPanel />
        </TabsContent>
      </Tabs>

      {/* Modals */}

      {/* Medical Record Form */}
      <MedicalRecordForm
        open={showRecordForm}
        onOpenChange={setShowRecordForm}
        record={selectedRecord || undefined}
        onSuccess={() => {
          setShowRecordForm(false);
          setSelectedRecord(null);
        }}
      />

      {/* Medical Record Detail */}
      <MedicalRecordDetail
        record={selectedRecord}
        open={!!selectedRecord && !showRecordForm}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
        onEdit={handleEditRecord}
        onScheduleVisit={(record) => {
          setSelectedRecord(null);
          handleCreateVisit();
        }}
      />

      {/* Visit Form */}
      <VisitForm
        open={showVisitForm}
        onOpenChange={setShowVisitForm}
        visit={selectedVisit || undefined}
        defaultDate={visitFormDate}
        onSuccess={() => {
          setShowVisitForm(false);
          setSelectedVisit(null);
          setVisitFormDate(undefined);
        }}
      />

      {/* Exposure Detail Modal */}
      <ExposureDetailModal
        exposure={selectedExposure}
        open={!!selectedExposure && !showExposureForm && !showMeasurementForm}
        onOpenChange={(open) => !open && setSelectedExposure(null)}
        onAddMeasurement={(exposure) => {
          setExposureForMeasurement(exposure);
          setShowMeasurementForm(true);
        }}
      />

      {/* Exposure Form */}
      <ExposureForm
        open={showExposureForm}
        onOpenChange={setShowExposureForm}
        exposure={undefined}
        onSuccess={() => {
          setShowExposureForm(false);
          setSelectedExposure(null);
        }}
      />

      {/* Measurement Form */}
      {exposureForMeasurement && (
        <MeasurementForm
          open={showMeasurementForm}
          onOpenChange={(open) => {
            setShowMeasurementForm(open);
            if (!open) {
              setExposureForMeasurement(null);
            }
          }}
          exposure={exposureForMeasurement}
          onSuccess={() => {
            setShowMeasurementForm(false);
            setExposureForMeasurement(null);
          }}
        />
      )}
    </div>
  );
}
