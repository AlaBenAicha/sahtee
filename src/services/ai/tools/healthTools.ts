/**
 * Health Data Access Tools for AI
 * 
 * Tools for AI to query aggregate health data (non-PHI).
 * Individual medical records are NOT accessible through AI tools.
 */

import type { AITool, AIContext } from "../types";
import { 
  getHealthStats,
  getVisitStats,
  getExposureStats,
  getActiveHealthAlerts,
  getUpcomingVisits,
  getCriticalExposures,
} from "@/services/healthService";

/**
 * Tool: Get health overview (aggregate, non-PHI)
 */
export const getHealthOverviewTool: AITool = {
  name: "get_health_overview",
  description:
    "Récupère les statistiques agrégées de santé au travail (données non-PHI): cas actifs, visites en attente, alertes. Aucune donnée médicale individuelle.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const stats = await getHealthStats(context.organizationId);
    
    if (!stats) {
      return {
        message: "Aucune donnée de santé disponible",
        activeCases: 0,
        pendingVisits: 0,
        activeAlerts: 0,
      };
    }

    return {
      activeCases: stats.activeCases,
      activeCasesChange: stats.activeCasesChange,
      employeesUnderSurveillance: stats.employeesUnderSurveillance,
      pendingVisits: stats.pendingVisits,
      overdueVisits: stats.overdueVisits,
      activeAlerts: stats.activeAlerts,
      criticalAlerts: stats.criticalAlerts,
      fitnessByStatus: stats.fitnessByStatus,
      period: {
        start: stats.period.start.toDate().toISOString(),
        end: stats.period.end.toDate().toISOString(),
      },
    };
  },
};

/**
 * Tool: Get visit statistics
 */
export const getVisitStatsTool: AITool = {
  name: "get_visit_stats",
  description:
    "Récupère les statistiques des visites médicales: programmées, terminées, en retard, par type.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const stats = await getVisitStats(context.organizationId);
    
    return {
      total: stats.total,
      scheduled: stats.scheduled,
      completed: stats.completed,
      overdue: stats.overdue,
      thisMonth: stats.thisMonth,
      byType: stats.byType,
      completionRate: stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0,
    };
  },
};

/**
 * Tool: Get pending visits
 */
export const getPendingVisitsTool: AITool = {
  name: "get_pending_visits",
  description:
    "Récupère les visites médicales à venir (planifiées). Retourne uniquement les informations de planification, pas les données médicales.",
  parameters: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Nombre maximum de visites (défaut: 10)",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const limit = (params.limit as number) || 10;
    const visits = await getUpcomingVisits(context.organizationId, limit);

    // Return only non-PHI data
    return visits.map((visit) => ({
      id: visit.id,
      type: visit.type,
      scheduledDate: visit.scheduledDate.toDate().toISOString(),
      departmentId: visit.departmentId,
      daysUntil: Math.ceil(
        (visit.scheduledDate.toMillis() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));
  },
};

/**
 * Tool: Get exposure statistics
 */
export const getExposureStatsTool: AITool = {
  name: "get_exposure_stats",
  description:
    "Récupère les statistiques d'exposition aux risques: niveaux critiques, élevés, par type de danger.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const stats = await getExposureStats(context.organizationId);
    
    return {
      total: stats.total,
      critical: stats.critical,
      elevated: stats.elevated,
      withinLimits: stats.withinLimits,
      byHazardType: stats.byHazardType,
      totalExposedEmployees: stats.totalExposedEmployees,
      criticalPercentage: stats.total > 0 
        ? Math.round((stats.critical / stats.total) * 100) 
        : 0,
    };
  },
};

/**
 * Tool: Get critical exposures
 */
export const getCriticalExposuresTool: AITool = {
  name: "get_critical_exposures",
  description:
    "Récupère les expositions critiques ou élevées nécessitant une attention immédiate.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const exposures = await getCriticalExposures(context.organizationId);

    return exposures.map((exp) => ({
      id: exp.id,
      agent: exp.agent,
      hazardType: exp.hazardType,
      alertLevel: exp.alertLevel,
      percentOfLimit: exp.percentOfLimit,
      regulatoryLimit: exp.regulatoryLimit,
      lastMeasurement: exp.lastMeasurement,
      unit: exp.unit,
      siteId: exp.siteId,
      departmentId: exp.departmentId,
      exposedEmployeeCount: exp.exposedEmployeeCount,
      exceedanceCount: exp.exceedanceCount,
      lastMeasurementDate: exp.lastMeasurementDate.toDate().toISOString(),
    }));
  },
};

/**
 * Tool: Get active health alerts
 */
export const getHealthAlertsTool: AITool = {
  name: "get_health_alerts",
  description:
    "Récupère les alertes santé actives: dépassements de seuils, visites en retard, tendances détectées.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const alerts = await getActiveHealthAlerts(context.organizationId);

    return alerts.map((alert) => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      description: alert.description,
      affectedDepartments: alert.affectedDepartments,
      affectedEmployeeCount: alert.affectedEmployeeCount,
      status: alert.status,
      createdAt: alert.createdAt.toDate().toISOString(),
    }));
  },
};

/**
 * All health tools (non-PHI aggregate data only)
 */
export const healthTools: AITool[] = [
  getHealthOverviewTool,
  getVisitStatsTool,
  getPendingVisitsTool,
  getExposureStatsTool,
  getCriticalExposuresTool,
  getHealthAlertsTool,
];

