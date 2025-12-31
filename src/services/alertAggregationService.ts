/**
 * Alert Aggregation Service
 * 
 * Aggregates alerts from multiple sources for the 360° Board:
 * - Incidents (new and critical incidents)
 * - CAPA actions (high/critical priority, overdue)
 * - Health alerts (exposure thresholds, overdue visits)
 * - AI recommendations (critical from CAPA AI, Health AI, Conformity AI)
 * - Compliance issues
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { DashboardAlert, DashboardAlertType, DashboardAlertPriority } from "@/types/dashboard";
import type { Incident } from "@/types/capa";
import type { ActionPlan } from "@/types/capa";
import type { HealthAlert } from "@/types/health";
import type { AIRecommendation } from "@/types/dashboard";

// Collection names
const INCIDENTS_COLLECTION = "incidents";
const ACTION_PLANS_COLLECTION = "actionPlans";
const HEALTH_ALERTS_COLLECTION = "healthAlerts";
const AI_RECOMMENDATIONS_COLLECTION = "aiRecommendations";

// =============================================================================
// Type Definitions
// =============================================================================

interface AlertSource {
  type: "incident" | "capa" | "health" | "compliance" | "training" | "system";
  data: unknown;
}

// =============================================================================
// Alert Conversion Functions
// =============================================================================

/**
 * Convert incident to dashboard alert
 */
function incidentToAlert(incident: Incident): DashboardAlert {
  const priorityMap: Record<string, DashboardAlertPriority> = {
    critical: "critical",
    severe: "high",
    moderate: "medium",
    minor: "low",
  };

  // Safe timestamp handling
  const reportedAt = incident.reportedAt || Timestamp.now();
  const isNew = Date.now() - (reportedAt.toMillis?.() || Date.now()) < 24 * 60 * 60 * 1000; // Less than 24 hours
  const needsAction = incident.status === "reported" || incident.status === "acknowledged";

  return {
    id: `incident-${incident.id}`,
    type: "incident",
    priority: priorityMap[incident.severity] || "medium",
    title: isNew ? "Nouvel incident déclaré" : `Incident: ${incident.reference}`,
    description: incident.description?.substring(0, 150) + (incident.description?.length > 150 ? "..." : "") || "",
    actionRequired: needsAction,
    actionUrl: `/app/incidents?id=${incident.id}`,
    actionLabel: needsAction ? "Voir l'incident" : undefined,
    entityId: incident.id,
    entityType: "incident",
    createdAt: reportedAt,
    readBy: [],
    dismissedBy: [],
  };
}

/**
 * Convert CAPA to dashboard alert
 */
function capaToAlert(capa: ActionPlan): DashboardAlert {
  const now = Date.now();
  const dueTime = capa.dueDate?.toMillis?.() || now;
  const isOverdue = dueTime < now;
  const isDueSoon = !isOverdue && (dueTime - now) < 3 * 24 * 60 * 60 * 1000; // Less than 3 days

  const priorityMap: Record<string, DashboardAlertPriority> = {
    critique: "critical",
    haute: "high",
    moyenne: "medium",
    basse: "low",
  };

  let title: string;
  let description: string;
  let priority: DashboardAlertPriority;

  if (isOverdue) {
    title = `CAPA en retard: ${capa.reference}`;
    const dueDateStr = capa.dueDate?.toDate?.()?.toLocaleDateString("fr-FR") || "N/A";
    description = `L'action "${capa.title}" devait être complétée le ${dueDateStr}`;
    priority = capa.priority === "critique" ? "critical" : "high";
  } else if (isDueSoon) {
    const daysRemaining = Math.ceil((dueTime - now) / (24 * 60 * 60 * 1000));
    title = `CAPA proche de l'échéance`;
    description = `L'action "${capa.title}" expire dans ${daysRemaining} jour${daysRemaining > 1 ? "s" : ""}`;
    priority = priorityMap[capa.priority] || "medium";
  } else {
    title = `CAPA prioritaire: ${capa.reference}`;
    description = capa.title;
    priority = priorityMap[capa.priority] || "medium";
  }

  // Safe timestamp handling
  const createdAt = capa.createdAt || Timestamp.now();

  return {
    id: `capa-${capa.id}`,
    type: "capa",
    priority,
    title,
    description,
    actionRequired: isOverdue || isDueSoon,
    actionUrl: `/app/capa?id=${capa.id}`,
    actionLabel: "Gérer CAPA",
    entityId: capa.id,
    entityType: "capa",
    createdAt,
    readBy: [],
    dismissedBy: [],
  };
}

/**
 * Convert health alert to dashboard alert
 */
function healthAlertToAlert(healthAlert: HealthAlert): DashboardAlert {
  const priorityMap: Record<string, DashboardAlertPriority> = {
    critical: "critical",
    warning: "high",
    info: "medium",
  };

  // Safe timestamp handling
  const createdAt = healthAlert.createdAt || Timestamp.now();

  return {
    id: `health-${healthAlert.id}`,
    type: "health",
    priority: priorityMap[healthAlert.severity] || "medium",
    title: healthAlert.title || "Alerte santé",
    description: healthAlert.description || "",
    actionRequired: healthAlert.status === "active",
    actionUrl: `/app/health?alertId=${healthAlert.id}`,
    actionLabel: healthAlert.status === "active" ? "Voir l'alerte" : undefined,
    entityId: healthAlert.id,
    entityType: "incident",
    createdAt,
    readBy: [],
    dismissedBy: [],
  };
}

/**
 * Convert AI recommendation to dashboard alert
 */
function aiRecommendationToAlert(rec: AIRecommendation): DashboardAlert {
  const priorityMap: Record<string, DashboardAlertPriority> = {
    critique: "critical",
    haute: "high",
    moyenne: "medium",
    basse: "low",
  };

  // Determine type based on recommendation type
  const typeMap: Record<string, DashboardAlertType> = {
    capa: "capa",
    training: "training",
    compliance: "compliance",
    health: "health",
    equipment: "system",
    risk_assessment: "compliance",
    optimization: "system",
  };

  // Safe timestamp handling
  const createdAt = rec.createdAt || Timestamp.now();

  return {
    id: `ai-${rec.id}`,
    type: typeMap[rec.type] || "system",
    priority: priorityMap[rec.priority] || "medium",
    title: `IA: ${rec.title}`,
    description: rec.description || "",
    actionRequired: rec.status === "pending",
    actionUrl: rec.actionUrl,
    actionLabel: rec.status === "pending" ? "Voir la recommandation" : undefined,
    entityId: rec.id,
    entityType: rec.type === "capa" ? "capa" : rec.type === "training" ? "training" : "incident",
    createdAt,
    readBy: [],
    dismissedBy: [],
  };
}

// =============================================================================
// Alert Aggregation Functions
// =============================================================================

/**
 * Subscribe to aggregated alerts from all sources
 * Returns a combined stream of alerts from incidents, CAPAs, health, and AI
 */
export function subscribeToAggregatedAlerts(
  orgId: string,
  callback: (alerts: DashboardAlert[]) => void,
  options: { limit?: number } = {}
): Unsubscribe {
  const { limit = 50 } = options;

  // Store alerts from different sources
  let incidentAlerts: DashboardAlert[] = [];
  let capaAlerts: DashboardAlert[] = [];
  let healthAlerts: DashboardAlert[] = [];
  let aiAlerts: DashboardAlert[] = [];

  // Function to merge and sort all alerts
  const mergeAndNotify = () => {
    const allAlerts = [
      ...incidentAlerts,
      ...capaAlerts,
      ...healthAlerts,
      ...aiAlerts,
    ];

    // Sort by priority (critical first) then by date (most recent first)
    allAlerts.sort((a, b) => {
      const priorityOrder: Record<DashboardAlertPriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by date (most recent first)
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    // Limit and notify
    callback(allAlerts.slice(0, limit));
  };

  const unsubscribers: Unsubscribe[] = [];

  // 1. Subscribe to recent incidents (critical/severe, or new)
  try {
    const incidentQuery = query(
      collection(db, INCIDENTS_COLLECTION),
      where("organizationId", "==", orgId),
      orderBy("reportedAt", "desc"),
      firestoreLimit(20)
    );

    const unsubIncidents = onSnapshot(
      incidentQuery,
      (snapshot) => {
        const incidents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Incident[];

        // Filter: only show critical/severe incidents, or incidents that need action
        const relevantIncidents = incidents.filter(inc => 
          inc.severity === "critical" || 
          inc.severity === "severe" ||
          inc.status === "reported" ||
          inc.status === "acknowledged"
        );

        incidentAlerts = relevantIncidents.map(incidentToAlert);
        mergeAndNotify();
      },
      (error) => {
        console.warn("Incidents subscription error:", error);
        incidentAlerts = [];
        mergeAndNotify();
      }
    );
    unsubscribers.push(unsubIncidents);
  } catch (error) {
    console.warn("Failed to subscribe to incidents:", error);
  }

  // 2. Subscribe to high/critical priority CAPAs and overdue CAPAs
  try {
    const capaQuery = query(
      collection(db, ACTION_PLANS_COLLECTION),
      where("organizationId", "==", orgId),
      firestoreLimit(30)
    );

    const unsubCapa = onSnapshot(
      capaQuery,
      (snapshot) => {
        const capas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ActionPlan[];

        const now = Date.now();

        // Filter: only show high/critical priority or overdue/due soon
        const relevantCapas = capas.filter(capa => {
          // Skip completed/closed
          if (["completed", "verified", "closed"].includes(capa.status)) {
            return false;
          }

          // Include high/critical priority
          if (capa.priority === "critique" || capa.priority === "haute") {
            return true;
          }

          // Include overdue
          const dueTime = capa.dueDate?.toMillis?.() || 0;
          if (dueTime < now) {
            return true;
          }

          // Include due within 3 days
          if (dueTime - now < 3 * 24 * 60 * 60 * 1000) {
            return true;
          }

          return false;
        });

        capaAlerts = relevantCapas.map(capaToAlert);
        mergeAndNotify();
      },
      (error) => {
        console.warn("CAPA subscription error:", error);
        capaAlerts = [];
        mergeAndNotify();
      }
    );
    unsubscribers.push(unsubCapa);
  } catch (error) {
    console.warn("Failed to subscribe to CAPAs:", error);
  }

  // 3. Subscribe to active health alerts
  try {
    const healthQuery = query(
      collection(db, HEALTH_ALERTS_COLLECTION),
      where("organizationId", "==", orgId),
      where("status", "in", ["active", "acknowledged"]),
      orderBy("createdAt", "desc"),
      firestoreLimit(20)
    );

    const unsubHealth = onSnapshot(
      healthQuery,
      (snapshot) => {
        const alerts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as HealthAlert[];

        healthAlerts = alerts.map(healthAlertToAlert);
        mergeAndNotify();
      },
      (error) => {
        console.warn("Health alerts subscription error:", error);
        healthAlerts = [];
        mergeAndNotify();
      }
    );
    unsubscribers.push(unsubHealth);
  } catch (error) {
    console.warn("Failed to subscribe to health alerts:", error);
  }

  // 4. Subscribe to pending AI recommendations (critical/high priority)
  try {
    const aiQuery = query(
      collection(db, AI_RECOMMENDATIONS_COLLECTION),
      where("organizationId", "==", orgId),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      firestoreLimit(15)
    );

    const unsubAI = onSnapshot(
      aiQuery,
      (snapshot) => {
        const recommendations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as AIRecommendation[];

        // Filter: only critical and high priority recommendations
        const relevantRecs = recommendations.filter(rec =>
          rec.priority === "critique" || rec.priority === "haute"
        );

        aiAlerts = relevantRecs.map(aiRecommendationToAlert);
        mergeAndNotify();
      },
      (error) => {
        console.warn("AI recommendations subscription error:", error);
        aiAlerts = [];
        mergeAndNotify();
      }
    );
    unsubscribers.push(unsubAI);
  } catch (error) {
    console.warn("Failed to subscribe to AI recommendations:", error);
  }

  // Return cleanup function
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}

/**
 * Get aggregated alerts count by priority
 */
export function getAlertCounts(alerts: DashboardAlert[]): {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  actionRequired: number;
} {
  return {
    total: alerts.length,
    critical: alerts.filter(a => a.priority === "critical").length,
    high: alerts.filter(a => a.priority === "high").length,
    medium: alerts.filter(a => a.priority === "medium").length,
    low: alerts.filter(a => a.priority === "low").length,
    actionRequired: alerts.filter(a => a.actionRequired).length,
  };
}

/**
 * Filter alerts by type
 */
export function filterAlertsByType(
  alerts: DashboardAlert[],
  types: DashboardAlertType[]
): DashboardAlert[] {
  if (types.length === 0) return alerts;
  return alerts.filter(a => types.includes(a.type));
}

/**
 * Filter alerts by priority
 */
export function filterAlertsByPriority(
  alerts: DashboardAlert[],
  priorities: DashboardAlertPriority[]
): DashboardAlert[] {
  if (priorities.length === 0) return alerts;
  return alerts.filter(a => priorities.includes(a.priority));
}

