/**
 * Sanitization Utilities for AI Tool Responses
 * 
 * This module provides functions to sanitize data before sending it to the AI,
 * ensuring that:
 * 1. Internal database IDs are removed (only user-facing references are kept)
 * 2. Status/severity/type/priority constants are translated to French labels
 * 3. No backend implementation details are exposed
 * 
 * SECURITY: This is a critical security layer to prevent information leakage.
 */

import {
  getIncidentStatusLabel,
  getIncidentSeverityLabel,
  getIncidentTypeLabel,
  getCAPAStatusLabel,
  getCAPAPriorityLabel,
  getCAPACategoryLabel,
  getAlertPriorityLabel,
  getAlertTypeLabel,
  getKPIStatusLabel,
  getRiskLevelLabel,
  CAPA_SOURCE_LABELS,
} from "./labelMappings";

// =============================================================================
// Types for Sanitized Responses
// =============================================================================

/** Sanitized incident data for AI */
export interface SanitizedIncident {
  reference: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  location: string;
  reportedAt: string;
  hasLinkedCapa: boolean;
  rootCause?: string;
  contributingFactors?: string[];
  affectedPersonsCount?: number;
  witnessCount?: number;
  immediateActions?: string;
  hasAiAnalysis?: boolean;
}

/** Sanitized CAPA data for AI */
export interface SanitizedCAPA {
  reference: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  progress: number;
  assigneeName: string;
  dueDate: string;
  isOverdue: boolean;
  aiGenerated: boolean;
  daysOverdue?: number;
  createdAt?: string;
  sourceType?: string;
  checklistItemsCount?: number;
  checklistCompletedCount?: number;
  commentsCount?: number;
  aiSuggestions?: string[];
}

/** Sanitized alert data for AI */
export interface SanitizedAlert {
  type: string;
  priority: string;
  title: string;
  description: string;
  actionRequired: boolean;
  actionLabel?: string;
  entityType?: string;
  createdAt: string;
}

/** Sanitized KPI data for AI */
export interface SanitizedKPI {
  name: string;
  value: number | string;
  unit?: string;
  target?: number | string;
  status: string;
  trend?: {
    direction: string;
    percentage?: number;
  };
}

// =============================================================================
// Incident Sanitization
// =============================================================================

/**
 * Sanitize a single incident for AI consumption
 * Removes internal IDs and translates constants to French labels
 */
export function sanitizeIncident(incident: {
  id?: string;
  reference: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  location: string;
  reportedAt: string;
  hasLinkedCapa?: boolean;
  rootCause?: string;
  contributingFactors?: string[];
  affectedPersonsCount?: number;
  witnessCount?: number;
  immediateActions?: string;
  hasAiAnalysis?: boolean;
  linkedCapaIds?: string[];
}): SanitizedIncident {
  return {
    reference: incident.reference,
    type: getIncidentTypeLabel(incident.type),
    severity: getIncidentSeverityLabel(incident.severity),
    status: getIncidentStatusLabel(incident.status),
    description: incident.description,
    location: incident.location,
    reportedAt: formatDateForAI(incident.reportedAt),
    hasLinkedCapa: incident.hasLinkedCapa ?? (incident.linkedCapaIds?.length ?? 0) > 0,
    ...(incident.rootCause && { rootCause: incident.rootCause }),
    ...(incident.contributingFactors && { contributingFactors: incident.contributingFactors }),
    ...(incident.affectedPersonsCount !== undefined && { affectedPersonsCount: incident.affectedPersonsCount }),
    ...(incident.witnessCount !== undefined && { witnessCount: incident.witnessCount }),
    ...(incident.immediateActions && { immediateActions: incident.immediateActions }),
    ...(incident.hasAiAnalysis !== undefined && { hasAiAnalysis: incident.hasAiAnalysis }),
  };
}

/**
 * Sanitize an array of incidents for AI consumption
 */
export function sanitizeIncidents(incidents: Array<{
  id?: string;
  reference: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  location: string;
  reportedAt: string;
  hasLinkedCapa?: boolean;
  rootCause?: string;
  linkedCapaIds?: string[];
}>): SanitizedIncident[] {
  return incidents.map(sanitizeIncident);
}

/**
 * Sanitize incident statistics for AI
 * Translates status/severity/type keys to French labels
 */
export function sanitizeIncidentStats(stats: {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  thisMonth: number;
  lastMonth: number;
  pendingInvestigation: number;
  monthlyChange?: number;
}): {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  thisMonth: number;
  lastMonth: number;
  pendingInvestigation: number;
  monthlyChange?: number;
} {
  return {
    total: stats.total,
    byStatus: translateKeys(stats.byStatus, getIncidentStatusLabel),
    bySeverity: translateKeys(stats.bySeverity, getIncidentSeverityLabel),
    byType: translateKeys(stats.byType, getIncidentTypeLabel),
    thisMonth: stats.thisMonth,
    lastMonth: stats.lastMonth,
    pendingInvestigation: stats.pendingInvestigation,
    ...(stats.monthlyChange !== undefined && { monthlyChange: stats.monthlyChange }),
  };
}

// =============================================================================
// CAPA Sanitization
// =============================================================================

/**
 * Sanitize a single CAPA for AI consumption
 */
export function sanitizeCAPA(capa: {
  id?: string;
  reference: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  progress: number;
  assigneeName: string;
  dueDate: string;
  isOverdue?: boolean;
  aiGenerated: boolean;
  daysOverdue?: number;
  createdAt?: string;
  sourceType?: string;
  sourceIncidentId?: string;
  checklistItemsCount?: number;
  checklistCompletedCount?: number;
  commentsCount?: number;
  aiSuggestions?: string[];
  linkedTrainingIds?: string[];
  linkedEquipmentIds?: string[];
}): SanitizedCAPA {
  // Calculate isOverdue if not provided
  const isOverdue = capa.isOverdue ?? (
    new Date(capa.dueDate).getTime() < Date.now() &&
    !["completed", "verified", "closed"].includes(capa.status)
  );

  return {
    reference: capa.reference,
    title: capa.title,
    description: capa.description,
    category: getCAPACategoryLabel(capa.category),
    priority: getCAPAPriorityLabel(capa.priority),
    status: getCAPAStatusLabel(capa.status),
    progress: capa.progress,
    assigneeName: capa.assigneeName,
    dueDate: formatDateForAI(capa.dueDate),
    isOverdue,
    aiGenerated: capa.aiGenerated,
    ...(capa.daysOverdue !== undefined && { daysOverdue: capa.daysOverdue }),
    ...(capa.createdAt && { createdAt: formatDateForAI(capa.createdAt) }),
    ...(capa.sourceType && { sourceType: CAPA_SOURCE_LABELS[capa.sourceType] || capa.sourceType }),
    ...(capa.checklistItemsCount !== undefined && { checklistItemsCount: capa.checklistItemsCount }),
    ...(capa.checklistCompletedCount !== undefined && { checklistCompletedCount: capa.checklistCompletedCount }),
    ...(capa.commentsCount !== undefined && { commentsCount: capa.commentsCount }),
    ...(capa.aiSuggestions && { aiSuggestions: capa.aiSuggestions }),
  };
}

/**
 * Sanitize an array of CAPAs for AI consumption
 */
export function sanitizeCAPAs(capas: Array<{
  id?: string;
  reference: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  progress: number;
  assigneeName: string;
  dueDate: string;
  isOverdue?: boolean;
  aiGenerated: boolean;
  daysOverdue?: number;
}>): SanitizedCAPA[] {
  return capas.map(sanitizeCAPA);
}

/**
 * Sanitize CAPA statistics for AI
 */
export function sanitizeCAPAStats(stats: {
  total: number;
  urgent: number;
  overdue: number;
  closureRate: number;
  onTimeClosureRate: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  inProgress: number;
  pendingApproval: number;
}): {
  total: number;
  urgent: number;
  overdue: number;
  closureRate: number;
  onTimeClosureRate: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  inProgress: number;
  pendingApproval: number;
} {
  return {
    total: stats.total,
    urgent: stats.urgent,
    overdue: stats.overdue,
    closureRate: stats.closureRate,
    onTimeClosureRate: stats.onTimeClosureRate,
    byStatus: translateKeys(stats.byStatus, getCAPAStatusLabel),
    byPriority: translateKeys(stats.byPriority, getCAPAPriorityLabel),
    byCategory: translateKeys(stats.byCategory, getCAPACategoryLabel),
    inProgress: stats.inProgress,
    pendingApproval: stats.pendingApproval,
  };
}

/**
 * Sanitize CAPA Kanban data for AI
 */
export function sanitizeCAPAKanban(kanban: {
  urgent: number;
  toPlan: number;
  todo: number;
  inProgress: number;
  done: number;
  summary: {
    active: number;
    completed: number;
  };
}): {
  urgent: number;
  aPlanifier: number;
  aFaire: number;
  enCours: number;
  termine: number;
  resume: {
    actifs: number;
    termines: number;
  };
} {
  return {
    urgent: kanban.urgent,
    aPlanifier: kanban.toPlan,
    aFaire: kanban.todo,
    enCours: kanban.inProgress,
    termine: kanban.done,
    resume: {
      actifs: kanban.summary.active,
      termines: kanban.summary.completed,
    },
  };
}

// =============================================================================
// Alert Sanitization
// =============================================================================

/**
 * Sanitize a single alert for AI consumption
 */
export function sanitizeAlert(alert: {
  id?: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  actionRequired: boolean;
  actionLabel?: string;
  entityType?: string;
  createdAt: string;
}): SanitizedAlert {
  return {
    type: getAlertTypeLabel(alert.type),
    priority: getAlertPriorityLabel(alert.priority),
    title: alert.title,
    description: alert.description,
    actionRequired: alert.actionRequired,
    ...(alert.actionLabel && { actionLabel: alert.actionLabel }),
    ...(alert.entityType && { entityType: alert.entityType }),
    createdAt: formatDateForAI(alert.createdAt),
  };
}

/**
 * Sanitize an array of alerts for AI consumption
 */
export function sanitizeAlerts(alerts: Array<{
  id?: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  actionRequired: boolean;
  actionLabel?: string;
  entityType?: string;
  createdAt: string;
}>): SanitizedAlert[] {
  return alerts.map(sanitizeAlert);
}

// =============================================================================
// Dashboard/KPI Sanitization
// =============================================================================

/**
 * Sanitize KPI data for AI consumption
 */
export function sanitizeKPI(kpi: {
  id?: string;
  name: string;
  value: number | string;
  unit?: string;
  target?: number | string;
  status: string;
  trend?: {
    direction?: string;
    percentage?: number;
  };
}): SanitizedKPI {
  return {
    name: kpi.name,
    value: kpi.value,
    ...(kpi.unit && { unit: kpi.unit }),
    ...(kpi.target !== undefined && { target: kpi.target }),
    status: getKPIStatusLabel(kpi.status),
    ...(kpi.trend && {
      trend: {
        direction: kpi.trend.direction || "stable",
        ...(kpi.trend.percentage !== undefined && { percentage: kpi.trend.percentage }),
      },
    }),
  };
}

/**
 * Sanitize an array of KPIs for AI consumption
 */
export function sanitizeKPIs(kpis: Array<{
  id?: string;
  name: string;
  value: number | string;
  unit?: string;
  target?: number | string;
  status: string;
  trend?: {
    direction?: string;
    percentage?: number;
  };
}>): SanitizedKPI[] {
  return kpis.map(sanitizeKPI);
}

/**
 * Sanitize dashboard metrics for AI consumption
 */
export function sanitizeDashboardMetrics(metrics: {
  kpis: Array<{
    id?: string;
    name: string;
    value: number | string;
    unit?: string;
    target?: number | string;
    status: string;
    trend?: {
      direction?: string;
      percentage?: number;
    };
  }>;
  alertsSummary: {
    total: number;
    critical: number;
    actionRequired: number;
  };
  daysSinceLastIncident: number;
  calculatedAt: string;
}): {
  kpis: SanitizedKPI[];
  alertsSummary: {
    total: number;
    critique: number;
    actionRequise: number;
  };
  joursSansDernierIncident: number;
  calculeA: string;
} {
  return {
    kpis: sanitizeKPIs(metrics.kpis),
    alertsSummary: {
      total: metrics.alertsSummary.total,
      critique: metrics.alertsSummary.critical,
      actionRequise: metrics.alertsSummary.actionRequired,
    },
    joursSansDernierIncident: metrics.daysSinceLastIncident,
    calculeA: formatDateForAI(metrics.calculatedAt),
  };
}

/**
 * Sanitize risk matrix data for AI consumption
 */
export function sanitizeRiskMatrix(matrix: {
  viewMode: string;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  matrix: Array<Array<{
    severity: number;
    likelihood: number;
    count: number;
    riskLevel: string;
  }>>;
}): {
  modeVue: string;
  resume: {
    total: number;
    critique: number;
    eleve: number;
    moyen: number;
    faible: number;
  };
  matrice: Array<Array<{
    gravite: number;
    probabilite: number;
    nombre: number;
    niveauRisque: string;
  }>>;
} {
  return {
    modeVue: matrix.viewMode === "initial" ? "Brut" : "Résiduel",
    resume: {
      total: matrix.summary.total,
      critique: matrix.summary.critical,
      eleve: matrix.summary.high,
      moyen: matrix.summary.medium,
      faible: matrix.summary.low,
    },
    matrice: matrix.matrix.map(row =>
      row.map(cell => ({
        gravite: cell.severity,
        probabilite: cell.likelihood,
        nombre: cell.count,
        niveauRisque: getRiskLevelLabel(cell.riskLevel),
      }))
    ),
  };
}

/**
 * Sanitize organization summary for AI consumption
 */
export function sanitizeOrganizationSummary(summary: {
  organizationId?: string;
  overallStatus: string;
  daysSinceLastIncident: number;
  alerts: {
    total: number;
    critical: number;
    actionRequired: number;
  };
  areasOfConcern: Array<{
    name: string;
    status: string;
    value: number | string;
    target?: number | string;
    trendDirection?: string;
  }>;
  positiveTrends: Array<{
    name: string;
    improvement?: number;
  }>;
  summary: string;
}): {
  statutGlobal: string;
  joursSansDernierIncident: number;
  alertes: {
    total: number;
    critiques: number;
    actionRequise: number;
  };
  pointsAttention: Array<{
    nom: string;
    statut: string;
    valeur: number | string;
    cible?: number | string;
  }>;
  tendancesPositives: Array<{
    nom: string;
    amelioration?: number;
  }>;
  resume: string;
} {
  const statusLabels: Record<string, string> = {
    good: "Maîtrisé",
    warning: "À surveiller",
    critical: "Critique",
  };

  return {
    statutGlobal: statusLabels[summary.overallStatus] || summary.overallStatus,
    joursSansDernierIncident: summary.daysSinceLastIncident,
    alertes: {
      total: summary.alerts.total,
      critiques: summary.alerts.critical,
      actionRequise: summary.alerts.actionRequired,
    },
    pointsAttention: summary.areasOfConcern.map(area => ({
      nom: area.name,
      statut: getKPIStatusLabel(area.status),
      valeur: area.value,
      ...(area.target !== undefined && { cible: area.target }),
    })),
    tendancesPositives: summary.positiveTrends.map(trend => ({
      nom: trend.name,
      ...(trend.improvement !== undefined && { amelioration: trend.improvement }),
    })),
    resume: summary.summary,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Translate object keys using a label function
 */
function translateKeys(
  obj: Record<string, number>,
  labelFn: (key: string) => string
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[labelFn(key)] = value;
  }
  return result;
}

/**
 * Format an ISO date string to a user-friendly French format
 */
function formatDateForAI(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

