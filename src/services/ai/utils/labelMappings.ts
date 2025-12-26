/**
 * Centralized Label Mappings for AI Responses
 * 
 * This module provides French translations for all database constants
 * to ensure AI responses use user-friendly labels matching the UI.
 * 
 * IMPORTANT: These mappings must be kept in sync with the UI components.
 */

import type { 
  IncidentStatus, 
  IncidentSeverity, 
  ActionStatus, 
  ActionPriority,
  ActionCategory 
} from "@/types/capa";

// =============================================================================
// Incident Mappings
// =============================================================================

/** Incident status labels (French) */
export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  reported: "Signalé",
  acknowledged: "Pris en compte",
  investigating: "En investigation",
  action_plan_created: "CAPA créé",
  resolved: "Résolu",
  closed: "Clôturé",
};

/** Incident severity labels (French) */
export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  critical: "Critique",
  severe: "Grave",
  moderate: "Modéré",
  minor: "Mineur",
};

/** Incident type labels (French) */
export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  accident: "Accident",
  work_accident: "Accident du travail",
  near_miss: "Presqu'accident",
  unsafe_condition: "Condition dangereuse",
  unsafe_act: "Acte dangereux",
  occupational_disease: "Maladie professionnelle",
  property_damage: "Dommage matériel",
  environmental: "Incident environnemental",
};

// =============================================================================
// CAPA Mappings
// =============================================================================

/** CAPA status labels (French) */
export const CAPA_STATUS_LABELS: Record<ActionStatus, string> = {
  draft: "Brouillon",
  pending_approval: "En attente d'approbation",
  approved: "Approuvé",
  in_progress: "En cours",
  blocked: "Bloqué",
  completed: "Terminé",
  verified: "Vérifié",
  closed: "Clôturé",
};

/** CAPA priority labels (already in French, but providing for consistency) */
export const CAPA_PRIORITY_LABELS: Record<ActionPriority, string> = {
  critique: "Critique",
  haute: "Haute",
  moyenne: "Moyenne",
  basse: "Basse",
};

/** CAPA category labels (French) */
export const CAPA_CATEGORY_LABELS: Record<ActionCategory, string> = {
  correctif: "Correctif",
  preventif: "Préventif",
};

/** CAPA source type labels (French) */
export const CAPA_SOURCE_LABELS: Record<string, string> = {
  incident: "Incident",
  audit: "Audit",
  risk_assessment: "Évaluation des risques",
  observation: "Observation",
  ai_suggestion: "Suggestion IA",
  manual: "Création manuelle",
};

// =============================================================================
// Alert Mappings
// =============================================================================

/** Alert priority labels (French) */
export const ALERT_PRIORITY_LABELS: Record<string, string> = {
  critical: "Critique",
  high: "Élevée",
  medium: "Moyenne",
  low: "Faible",
};

/** Alert type labels (French) */
export const ALERT_TYPE_LABELS: Record<string, string> = {
  incident: "Incident",
  capa: "CAPA",
  compliance: "Conformité",
  health: "Santé",
  training: "Formation",
  equipment: "Équipement",
};

// =============================================================================
// KPI/Dashboard Mappings
// =============================================================================

/** KPI status labels (French) */
export const KPI_STATUS_LABELS: Record<string, string> = {
  good: "Bon",
  warning: "Attention",
  critical: "Critique",
};

/** Trend direction labels (French) */
export const TREND_LABELS: Record<string, string> = {
  up: "En hausse",
  down: "En baisse",
  stable: "Stable",
};

// =============================================================================
// Risk Matrix Mappings
// =============================================================================

/** Risk level labels (French) */
export const RISK_LEVEL_LABELS: Record<string, string> = {
  critical: "Critique",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
};

// =============================================================================
// Training Mappings
// =============================================================================

/** Training status labels (French) */
export const TRAINING_STATUS_LABELS: Record<string, string> = {
  not_started: "Non commencé",
  in_progress: "En cours",
  completed: "Terminé",
  failed: "Échoué",
};

/** Training priority labels (French) */
export const TRAINING_PRIORITY_LABELS: Record<string, string> = {
  obligatoire: "Obligatoire",
  recommandee: "Recommandée",
  optionnelle: "Optionnelle",
};

// =============================================================================
// Compliance/Audit Mappings
// =============================================================================

/** Audit status labels (French) */
export const AUDIT_STATUS_LABELS: Record<string, string> = {
  planned: "Planifié",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

/** Compliance status labels (French) */
export const COMPLIANCE_STATUS_LABELS: Record<string, string> = {
  compliant: "Conforme",
  non_compliant: "Non conforme",
  in_progress: "En cours",
  not_applicable: "Non applicable",
  pending: "En attente",
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the French label for an incident status
 */
export function getIncidentStatusLabel(status: string): string {
  return INCIDENT_STATUS_LABELS[status as IncidentStatus] || status;
}

/**
 * Get the French label for an incident severity
 */
export function getIncidentSeverityLabel(severity: string): string {
  return INCIDENT_SEVERITY_LABELS[severity as IncidentSeverity] || severity;
}

/**
 * Get the French label for an incident type
 */
export function getIncidentTypeLabel(type: string): string {
  return INCIDENT_TYPE_LABELS[type] || type;
}

/**
 * Get the French label for a CAPA status
 */
export function getCAPAStatusLabel(status: string): string {
  return CAPA_STATUS_LABELS[status as ActionStatus] || status;
}

/**
 * Get the French label for a CAPA priority
 */
export function getCAPAPriorityLabel(priority: string): string {
  return CAPA_PRIORITY_LABELS[priority as ActionPriority] || priority;
}

/**
 * Get the French label for a CAPA category
 */
export function getCAPACategoryLabel(category: string): string {
  return CAPA_CATEGORY_LABELS[category as ActionCategory] || category;
}

/**
 * Get the French label for an alert priority
 */
export function getAlertPriorityLabel(priority: string): string {
  return ALERT_PRIORITY_LABELS[priority] || priority;
}

/**
 * Get the French label for an alert type
 */
export function getAlertTypeLabel(type: string): string {
  return ALERT_TYPE_LABELS[type] || type;
}

/**
 * Get the French label for a KPI status
 */
export function getKPIStatusLabel(status: string): string {
  return KPI_STATUS_LABELS[status] || status;
}

/**
 * Get the French label for a risk level
 */
export function getRiskLevelLabel(level: string): string {
  return RISK_LEVEL_LABELS[level] || level;
}

