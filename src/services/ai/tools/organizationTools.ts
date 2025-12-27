/**
 * Organization & Dashboard Data Access Tools for AI
 * 
 * Tools for AI to query organization-wide data and dashboard metrics.
 * All responses are sanitized to remove internal IDs and translate constants.
 */

import type { AITool, AIContext } from "../types";
import { 
  getDashboardMetrics, 
  getAlerts,
  getRiskMapData,
} from "@/services/dashboardService";
import { 
  sanitizeAlerts, 
  sanitizeDashboardMetrics, 
  sanitizeRiskMatrix,
  sanitizeOrganizationSummary 
} from "../utils/sanitizeForAI";

/**
 * Tool: Get dashboard KPIs
 */
export const getDashboardStatsTool: AITool = {
  name: "get_dashboard_stats",
  description:
    "Récupère les KPIs du tableau de bord: taux de fréquence, taux de gravité, conformité, formation, CAPA, jours sans accident.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const metrics = await getDashboardMetrics(context.organizationId);
    
    if (!metrics) {
      return { message: "Métriques non disponibles" };
    }

    // Transform to sanitized format (removes IDs, translates constants to French)
    const rawData = {
      kpis: metrics.kpis.map((kpi) => ({
        name: kpi.name,
        value: kpi.value,
        unit: kpi.unit,
        target: kpi.target,
        status: kpi.status,
        trend: kpi.trend,
      })),
      alertsSummary: {
        total: metrics.alertsSummary.total,
        critical: metrics.alertsSummary.critical,
        actionRequired: metrics.alertsSummary.actionRequired,
      },
      daysSinceLastIncident: metrics.daysSinceLastIncident,
      calculatedAt: metrics.calculatedAt.toDate().toISOString(),
    };

    return sanitizeDashboardMetrics(rawData);
  },
};

/**
 * Tool: Get alerts
 */
export const getAlertsTool: AITool = {
  name: "get_alerts",
  description:
    "Récupère les alertes récentes de tous les modules: incidents, CAPA, conformité, santé, formation.",
  parameters: {
    type: "object",
    properties: {
      types: {
        type: "array",
        description: "Filtrer par type: incident, capa, compliance, health, training, equipment",
        items: { type: "string" },
      },
      priorities: {
        type: "array",
        description: "Filtrer par priorité: critical, high, medium, low",
        items: { type: "string" },
      },
      limit: {
        type: "number",
        description: "Nombre maximum d'alertes (défaut: 10)",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const alerts = await getAlerts(context.organizationId, {
      types: params.types as Array<"incident" | "capa" | "compliance" | "health" | "training" | "equipment"> | undefined,
      priorities: params.priorities as Array<"critical" | "high" | "medium" | "low"> | undefined,
      limit: (params.limit as number) || 10,
    });

    // Transform to sanitized format (removes IDs, translates constants to French)
    const rawData = alerts.map((alert) => ({
      type: alert.type,
      priority: alert.priority,
      title: alert.title,
      description: alert.description,
      actionRequired: alert.actionRequired,
      actionLabel: alert.actionLabel,
      entityType: alert.entityType,
      createdAt: alert.createdAt.toDate().toISOString(),
    }));

    return sanitizeAlerts(rawData);
  },
};

/**
 * Tool: Get risk matrix
 */
export const getRiskMatrixTool: AITool = {
  name: "get_risk_matrix",
  description:
    "Récupère la matrice des risques (probabilité x gravité) avec le nombre de risques par cellule.",
  parameters: {
    type: "object",
    properties: {
      viewMode: {
        type: "string",
        description: "Mode de vue: initial (brut) ou residual (après mesures)",
        enum: ["initial", "residual"],
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const viewMode = (params.viewMode as "initial" | "residual") || "residual";
    const matrix = await getRiskMapData(context.organizationId, viewMode);

    // Summarize the matrix
    let totalRisks = 0;
    let criticalRisks = 0;
    let highRisks = 0;
    let mediumRisks = 0;
    let lowRisks = 0;

    for (const row of matrix) {
      for (const cell of row) {
        totalRisks += cell.count;
        const riskScore = cell.likelihood * cell.severity;
        if (riskScore >= 20) criticalRisks += cell.count;
        else if (riskScore >= 12) highRisks += cell.count;
        else if (riskScore >= 6) mediumRisks += cell.count;
        else lowRisks += cell.count;
      }
    }

    const rawData = {
      viewMode,
      summary: {
        total: totalRisks,
        critical: criticalRisks,
        high: highRisks,
        medium: mediumRisks,
        low: lowRisks,
      },
      matrix: matrix.map((row, rowIdx) =>
        row.map((cell, colIdx) => ({
          severity: 5 - rowIdx,
          likelihood: colIdx + 1,
          count: cell.count,
          riskLevel: getRiskLevel(cell.likelihood * cell.severity),
        }))
      ),
    };

    return sanitizeRiskMatrix(rawData);
  },
};

/**
 * Tool: Get organization summary
 */
export const getOrganizationSummaryTool: AITool = {
  name: "get_organization_summary",
  description:
    "Récupère un résumé général de la situation SST de l'organisation: statut global, points d'attention, tendances.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const metrics = await getDashboardMetrics(context.organizationId);
    
    if (!metrics) {
      return { message: "Données non disponibles" };
    }

    // Analyze KPIs to determine overall status
    const kpiStatuses = metrics.kpis.map((kpi) => kpi.status);
    const criticalCount = kpiStatuses.filter((s) => s === "critical").length;
    const warningCount = kpiStatuses.filter((s) => s === "warning").length;

    let overallStatus: "good" | "warning" | "critical" = "good";
    if (criticalCount > 0) overallStatus = "critical";
    else if (warningCount > 2) overallStatus = "warning";

    // Find areas needing attention
    const areasOfConcern = metrics.kpis
      .filter((kpi) => kpi.status !== "good")
      .map((kpi) => ({
        name: kpi.name,
        status: kpi.status,
        value: kpi.value,
        target: kpi.target,
        trendDirection: kpi.trend?.direction,
      }));

    // Find positive trends
    const positiveTrends = metrics.kpis
      .filter(
        (kpi) =>
          kpi.trend?.direction === "up" &&
          ["compliance-rate", "capa-closure", "training-rate", "days-without-incident"].includes(kpi.id)
      )
      .map((kpi) => ({
        name: kpi.name,
        improvement: kpi.trend?.percentage,
      }));

    const rawData = {
      overallStatus,
      daysSinceLastIncident: metrics.daysSinceLastIncident,
      alerts: {
        total: metrics.alertsSummary.total,
        critical: metrics.alertsSummary.critical,
        actionRequired: metrics.alertsSummary.actionRequired,
      },
      areasOfConcern,
      positiveTrends,
      summary: generateSummaryText(overallStatus, areasOfConcern.length, metrics.daysSinceLastIncident),
    };

    return sanitizeOrganizationSummary(rawData);
  },
};

/**
 * Helper: Get risk level from score (internal use only)
 */
function getRiskLevel(score: number): string {
  if (score >= 20) return "critical";
  if (score >= 12) return "high";
  if (score >= 6) return "medium";
  return "low";
}

/**
 * Helper: Generate summary text
 */
function generateSummaryText(
  status: string,
  concernsCount: number,
  daysSafe: number
): string {
  if (status === "critical") {
    return `Situation nécessitant une attention immédiate. ${concernsCount} indicateurs en alerte.`;
  }
  if (status === "warning") {
    return `Quelques points d'attention à surveiller. ${daysSafe} jours sans accident.`;
  }
  return `Situation globalement maîtrisée. ${daysSafe} jours sans accident.`;
}

/**
 * All organization tools
 */
export const organizationTools: AITool[] = [
  getDashboardStatsTool,
  getAlertsTool,
  getRiskMatrixTool,
  getOrganizationSummaryTool,
];
