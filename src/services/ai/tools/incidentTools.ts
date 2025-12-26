/**
 * Incident Data Access Tools for AI
 * 
 * Tools for AI to query incident data securely, scoped to user's organization.
 * All responses are sanitized to remove internal IDs and translate constants.
 */

import type { AITool, AIContext } from "../types";
import { getIncidents, getIncidentStats } from "@/services/incidentService";
import type { IncidentStatus, IncidentSeverity } from "@/types/capa";
import { sanitizeIncidents, sanitizeIncident, sanitizeIncidentStats } from "../utils/sanitizeForAI";

/**
 * Tool: Get recent incidents
 */
export const getRecentIncidentsTool: AITool = {
  name: "get_recent_incidents",
  description:
    "Récupère les incidents récents de l'organisation avec des filtres optionnels. Retourne une liste d'incidents triée par date de signalement.",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "array",
        description:
          "Filtrer par statut: reported, acknowledged, investigating, action_plan_created, closed",
        items: { type: "string" },
      },
      severity: {
        type: "array",
        description: "Filtrer par gravité: minor, moderate, severe, critical",
        items: { type: "string" },
      },
      type: {
        type: "array",
        description:
          "Filtrer par type: work_accident, near_miss, occupational_disease, property_damage, environmental",
        items: { type: "string" },
      },
      limit: {
        type: "number",
        description: "Nombre maximum d'incidents à retourner (défaut: 10)",
      },
      searchQuery: {
        type: "string",
        description: "Recherche textuelle dans la description, référence ou lieu",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const incidents = await getIncidents(
      context.organizationId,
      {
        status: params.status as IncidentStatus[] | undefined,
        severity: params.severity as IncidentSeverity[] | undefined,
        type: params.type as string[] | undefined,
        searchQuery: params.searchQuery as string | undefined,
      },
      (params.limit as number) || 10
    );

    // Transform to sanitized format (removes IDs, translates constants to French)
    const rawData = incidents.map((inc) => ({
      reference: inc.reference,
      type: inc.type,
      severity: inc.severity,
      status: inc.status,
      description: inc.description.substring(0, 200),
      location: inc.location,
      reportedAt: inc.reportedAt.toDate().toISOString(),
      hasLinkedCapa: inc.linkedCapaIds && inc.linkedCapaIds.length > 0,
    }));

    return sanitizeIncidents(rawData);
  },
};

/**
 * Tool: Get incident statistics
 */
export const getIncidentStatsTool: AITool = {
  name: "get_incident_stats",
  description:
    "Récupère les statistiques des incidents de l'organisation: totaux, répartition par statut, gravité, type, et tendances mensuelles.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const stats = await getIncidentStats(context.organizationId);
    
    const rawStats = {
      total: stats.total,
      byStatus: stats.byStatus,
      bySeverity: stats.bySeverity,
      byType: stats.byType,
      thisMonth: stats.thisMonth,
      lastMonth: stats.lastMonth,
      pendingInvestigation: stats.pendingInvestigation,
      monthlyChange:
        stats.lastMonth > 0
          ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100
          : 0,
    };

    return sanitizeIncidentStats(rawStats);
  },
};

/**
 * Tool: Get incident details
 */
export const getIncidentDetailsTool: AITool = {
  name: "get_incident_details",
  description:
    "Récupère les détails complets d'un incident spécifique par sa référence (ex: INC-202512-ABCD).",
  parameters: {
    type: "object",
    properties: {
      incidentReference: {
        type: "string",
        description: "La référence de l'incident (ex: INC-202512-ABCD)",
      },
    },
    required: ["incidentReference"],
  },
  execute: async (params, context: AIContext) => {
    // First try to find by reference in recent incidents
    const incidents = await getIncidents(
      context.organizationId,
      { searchQuery: params.incidentReference as string },
      50
    );

    const incident = incidents.find(
      (inc) => inc.reference === params.incidentReference
    );

    if (!incident) {
      return { error: "Incident non trouvé avec cette référence" };
    }

    // Verify organization access (should already be filtered, but double-check)
    if (incident.organizationId !== context.organizationId) {
      return { error: "Accès non autorisé à cet incident" };
    }

    // Return sanitized data (no internal IDs, French labels)
    return sanitizeIncident({
      reference: incident.reference,
      type: incident.type,
      severity: incident.severity,
      status: incident.status,
      description: incident.description,
      location: incident.location,
      reportedAt: incident.reportedAt.toDate().toISOString(),
      immediateActions: incident.immediateActions,
      rootCause: incident.rootCause,
      contributingFactors: incident.contributingFactors,
      hasAiAnalysis: !!incident.aiAnalysis,
      hasLinkedCapa: incident.linkedCapaIds && incident.linkedCapaIds.length > 0,
      affectedPersonsCount: incident.affectedPersons?.length || 0,
      witnessCount: incident.witnesses?.length || 0,
    });
  },
};

/**
 * Tool: Find similar incidents
 */
export const findSimilarIncidentsTool: AITool = {
  name: "find_similar_incidents",
  description:
    "Recherche des incidents similaires basés sur le type, la localisation ou des mots-clés pour aider à identifier des tendances.",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        description: "Type d'incident à rechercher",
      },
      keywords: {
        type: "array",
        description: "Mots-clés à rechercher dans les descriptions",
        items: { type: "string" },
      },
      limit: {
        type: "number",
        description: "Nombre maximum de résultats (défaut: 5)",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const incidents = await getIncidents(
      context.organizationId,
      {
        type: params.type ? [params.type as string] : undefined,
      },
      50 // Get more to filter
    );

    let filtered = incidents;

    // Filter by keywords if provided
    if (params.keywords && Array.isArray(params.keywords)) {
      const keywords = (params.keywords as string[]).map((k) => k.toLowerCase());
      filtered = incidents.filter((inc) => {
        const text = `${inc.description} ${inc.location} ${inc.immediateActions || ""}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      });
    }

    // Return limited results, sanitized
    const limit = (params.limit as number) || 5;
    const rawData = filtered.slice(0, limit).map((inc) => ({
      reference: inc.reference,
      type: inc.type,
      severity: inc.severity,
      status: inc.status,
      description: inc.description.substring(0, 150),
      location: inc.location,
      reportedAt: inc.reportedAt.toDate().toISOString(),
      rootCause: inc.rootCause,
    }));

    return sanitizeIncidents(rawData);
  },
};

/**
 * All incident tools
 */
export const incidentTools: AITool[] = [
  getRecentIncidentsTool,
  getIncidentStatsTool,
  getIncidentDetailsTool,
  findSimilarIncidentsTool,
];
