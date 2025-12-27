/**
 * Dashboard Page - 360° Board
 * 
 * Main overview dashboard for authenticated users.
 * Features real-time KPI aggregation, interactive risk mapping,
 * trend charts, and alert feeds.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
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
  useRealtimeAIRecommendations,
  useAcceptRecommendation,
  useDismissRecommendation,
} from "@/hooks/useDashboard";

// Services - removed mock alerts import, using real data only

// Types
import type { DashboardKPI, RiskMapCell, RiskMapViewMode, AIRecommendation } from "@/types/dashboard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile, user } = useAuth();
  const userId = user?.uid;

  // Local state for risk map view mode (before data hooks)
  const [riskMapViewMode, setRiskMapViewMode] = useState<RiskMapViewMode>("residual");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dashboard data hooks - pass viewMode to get correct risk map data
  const { kpis, riskMap, isLoading, error, refetch } = useDashboardData(riskMapViewMode);
  
  // Real-time alerts
  const { 
    alerts, 
    isLoading: alertsLoading 
  } = useRealtimeAlerts({ limit: 20 });
  
  // Alert mutations
  const markAlertRead = useMarkAlertRead();
  const dismissAlert = useDismissAlert();

  // AI recommendations - real data from Firestore
  const { 
    recommendations: realRecommendations, 
    isLoading: recommendationsLoading 
  } = useRealtimeAIRecommendations(10);
  
  // AI recommendation actions
  const acceptRecommendation = useAcceptRecommendation();
  const dismissRecommendation = useDismissRecommendation();
  
  // Use real recommendations, or mock if empty (for demo purposes)
  const recommendations = realRecommendations.length > 0 
    ? realRecommendations 
    : getMockRecommendations();

  // Use real alerts only - no mock fallback
  const displayAlerts = alerts;

  // Handle KPI click - navigate to detailed analytics
  const handleKPIClick = (kpi: DashboardKPI) => {
    navigate(`/app/analytics?kpi=${kpi.id}`);
  };

  // Handle risk cell click - filter risks by cell
  const handleRiskCellClick = (cell: RiskMapCell) => {
    if (cell.count > 0) {
      navigate(`/app/compliance?severity=${cell.severity}&likelihood=${cell.likelihood}`);
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
  const handleExportPDF = useCallback(async () => {
    const now = new Date();
    const period = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    
    toast.info("Génération du rapport...", { id: "report-generation" });
    
    try {
      const blob = await generateMonthlyReport({
        organizationName: userProfile?.organizationId || "Organisation",
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
      toast.success("Rapport généré avec succès", { id: "report-generation" });
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Erreur lors de la génération du rapport", { id: "report-generation" });
    }
  }, [userProfile?.organizationId]);

  // Handle generateReport query parameter from SafetyBot
  useEffect(() => {
    const shouldGenerateReport = searchParams.get("generateReport") === "true";
    if (shouldGenerateReport && !isLoading) {
      // Clear the query parameter
      setSearchParams({}, { replace: true });
      // Trigger report generation
      handleExportPDF();
    }
  }, [searchParams, setSearchParams, isLoading, handleExportPDF]);

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
              onClick={() => navigate("/app/incidents?action=new")}
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

          {/* Risk Map - always show (with empty state if no data) */}
          <RiskMap
            data={riskMap || []}
            viewMode={riskMapViewMode}
            onViewModeChange={setRiskMapViewMode}
            onCellClick={handleRiskCellClick}
            loading={isLoading}
          />
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
            loading={recommendationsLoading}
            onAccept={(id) => {
              acceptRecommendation.mutate(id, {
                onSuccess: (result) => {
                  if (result.success) {
                    toast.success(result.message);
                  } else {
                    toast.error(result.message);
                  }
                },
                onError: () => {
                  toast.error("Erreur lors de l'acceptation de la recommandation");
                },
              });
            }}
            onDismiss={(id) => {
              dismissRecommendation.mutate(id, {
                onSuccess: () => {
                  toast.info("Recommandation ignorée");
                },
                onError: () => {
                  toast.error("Erreur lors de l'ignorance de la recommandation");
                },
              });
            }}
            onViewDetails={(rec: AIRecommendation) => {
              // Navigate to the action URL if available
              if (rec.actionUrl) {
                navigate(rec.actionUrl);
              } else {
                // Navigate based on recommendation type
                switch (rec.type) {
                  case "capa":
                    navigate("/app/capa");
                    break;
                  case "training":
                    navigate("/app/training");
                    break;
                  case "compliance":
                    navigate("/app/compliance");
                    break;
                  case "health":
                    navigate("/app/health");
                    break;
                  case "equipment":
                    navigate("/app/equipment");
                    break;
                  default:
                    toast.info(`Détails: ${rec.title}`);
                }
              }
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
