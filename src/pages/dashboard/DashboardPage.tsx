/**
 * Dashboard Page - 360° Board
 * 
 * Main overview dashboard for authenticated users.
 * Features real-time KPI aggregation, interactive risk mapping,
 * trend charts, and alert feeds.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ClipboardList, RefreshCw } from "lucide-react";
import { ExportButton } from "@/components/common";
import { generateMonthlyReport, downloadBlob } from "@/utils/pdfGenerator";
import { exportDashboardData } from "@/utils/excelGenerator";

// Dashboard Components
import {
  DashboardContainer,
  DashboardHeader,
  DashboardGrid,
  MainContent,
  Sidebar,
  Section,
  KPIBanner,
  KPISummary,
  RiskMap,
  MultiTrendChart,
  AlertFeed,
  QuickActions,
  AIInsightsPanel,
  getMockRecommendations,
} from "@/components/dashboard";

// Hooks
import {
  useDashboardData,
  useRealtimeAlerts,
  useMarkAlertRead,
  useDismissAlert,
} from "@/hooks/useDashboard";

// Services
import { getMockAlerts } from "@/services/dashboardService";

// Types
import type { DashboardKPI, RiskMapCell, RiskMapViewMode } from "@/types/dashboard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  const userId = user?.uid;

  // Dashboard data hooks
  const { kpis, riskMap, isLoading, error, refetch } = useDashboardData();
  
  // Real-time alerts
  const { 
    alerts, 
    isLoading: alertsLoading 
  } = useRealtimeAlerts({ limit: 20 });
  
  // Alert mutations
  const markAlertRead = useMarkAlertRead();
  const dismissAlert = useDismissAlert();

  // Local state
  const [riskMapViewMode, setRiskMapViewMode] = useState<RiskMapViewMode>("residual");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get mock recommendations (would come from AI service in production)
  const recommendations = getMockRecommendations();

  // Use mock alerts if no real alerts
  const displayAlerts = alerts.length > 0 ? alerts : getMockAlerts(userProfile?.organizationId || "demo");

  // Handle KPI click - navigate to detailed analytics
  const handleKPIClick = (kpi: DashboardKPI) => {
    navigate(`/analytics?kpi=${kpi.id}`);
  };

  // Handle risk cell click - filter risks by cell
  const handleRiskCellClick = (cell: RiskMapCell) => {
    if (cell.count > 0) {
      navigate(`/compliance?severity=${cell.severity}&likelihood=${cell.likelihood}`);
    }
  };

  // Handle alert actions
  const handleMarkAlertRead = (alertId: string) => {
    markAlertRead.mutate(alertId);
  };

  const handleDismissAlert = (alertId: string) => {
    dismissAlert.mutate(alertId);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Export handlers
  const handleExportPDF = async () => {
    const now = new Date();
    const period = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    
    const blob = await generateMonthlyReport({
      organizationName: "Organisation",
      period,
      kpis: {
        complianceRate: 85,
        accidentFrequency: 2.5,
        lostDays: 12,
        capaCompletionRate: 78,
      },
      incidents: [],
      capas: [],
      trainings: { completed: 45, inProgress: 12, planned: 8 },
    });
    
    downloadBlob(blob, `rapport-sst-${now.toISOString().slice(0, 7)}.pdf`);
  };

  const handleExportExcel = () => {
    exportDashboardData({
      kpis: {
        "Taux de conformité": "85%",
        "Taux de fréquence AT": "2.5",
        "Jours perdus": 12,
        "CAPA clôturées": "78%",
      },
      incidents: [],
      capas: [],
      trainings: [],
    });
  };

  const exportOptions = [
    {
      label: "Rapport mensuel",
      format: "pdf" as const,
      onClick: handleExportPDF,
      description: "Synthèse SST du mois",
    },
    {
      label: "Données brutes",
      format: "excel" as const,
      onClick: handleExportExcel,
      description: "Export Excel complet",
    },
  ];

  return (
    <DashboardContainer>
      {/* Header */}
      <DashboardHeader
        title={`Bonjour, ${userProfile?.firstName || "Utilisateur"} 👋`}
        subtitle="Voici l'aperçu de la sécurité de votre organisation"
        actions={
          <>
            <ExportButton options={exportOptions} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button
              onClick={() => navigate("/incidents?action=new")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Déclarer un incident
            </Button>
          </>
        }
      />

      {/* KPI Banner */}
      <Section>
        {kpis && kpis.length > 0 && (
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900">Indicateurs clés</h2>
            <KPISummary kpis={kpis} />
          </div>
        )}
        <KPIBanner
          kpis={kpis || []}
          loading={isLoading}
          onKPIClick={handleKPIClick}
        />
      </Section>

      {/* Main Grid: Charts + Sidebar */}
      <DashboardGrid>
        <MainContent>
          {/* Trend Charts */}
          {kpis && kpis.length > 0 && (
            <MultiTrendChart
              kpis={kpis}
              period="30d"
              loading={isLoading}
            />
          )}

          {/* Quick Actions - moved here */}
          <Section title="Actions rapides">
            <QuickActions variant="grid" />
          </Section>

          {/* Risk Map - only show if there's data */}
          {riskMap && riskMap.length > 0 && riskMap.some(row => row.some(cell => cell.count > 0)) && (
            <RiskMap
              data={riskMap}
              viewMode={riskMapViewMode}
              onViewModeChange={setRiskMapViewMode}
              onCellClick={handleRiskCellClick}
              loading={isLoading}
            />
          )}
        </MainContent>

        <Sidebar>
          {/* Alert Feed */}
          <AlertFeed
            alerts={displayAlerts}
            userId={userId}
            loading={alertsLoading}
            onMarkRead={handleMarkAlertRead}
            onDismiss={handleDismissAlert}
            onAlertClick={(alert) => {
              if (alert.actionUrl) {
                navigate(alert.actionUrl);
              }
            }}
          />

          {/* AI Insights */}
          <AIInsightsPanel
            recommendations={recommendations}
            loading={false}
            onAccept={(id) => {
              console.log("Accept recommendation:", id);
              // Would integrate with AI service
            }}
            onDismiss={(id) => {
              console.log("Dismiss recommendation:", id);
              // Would integrate with AI service
            }}
            onViewDetails={(rec) => {
              console.log("View details:", rec);
              // Would open modal or navigate
            }}
          />
        </Sidebar>
      </DashboardGrid>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Une erreur est survenue lors du chargement des données. 
          <button 
            onClick={handleRefresh}
            className="ml-2 underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      )}
    </DashboardContainer>
  );
}
