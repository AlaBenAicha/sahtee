/**
 * CAPA Data Access Tools for AI
 * 
 * Tools for AI to query CAPA (Corrective and Preventive Action) data securely.
 * All responses are sanitized to remove internal IDs and translate constants.
 */

import type { AITool, AIContext } from "../types";
import { getCAPAs, getCAPAStats, getCAPAsByColumn } from "@/services/capaService";
import type { ActionStatus, ActionPriority, ActionCategory } from "@/types/capa";
import { sanitizeCAPAs, sanitizeCAPA, sanitizeCAPAStats, sanitizeCAPAKanban } from "../utils/sanitizeForAI";

/**
 * Tool: Get CAPAs
 */
export const getCAPAsTool: AITool = {
  name: "get_capas",
  description:
    "Récupère les actions correctives et préventives (CAPA) de l'organisation avec des filtres optionnels.",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "array",
        description:
          "Filtrer par statut: draft, pending_approval, approved, in_progress, blocked, completed, verified, closed",
        items: { type: "string" },
      },
      priority: {
        type: "array",
        description: "Filtrer par priorité: critique, haute, moyenne, basse",
        items: { type: "string" },
      },
      category: {
        type: "array",
        description: "Filtrer par catégorie: correctif, preventif",
        items: { type: "string" },
      },
      limit: {
        type: "number",
        description: "Nombre maximum de CAPAs à retourner (défaut: 20)",
      },
      searchQuery: {
        type: "string",
        description: "Recherche textuelle dans le titre, description ou référence",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const capas = await getCAPAs(
      context.organizationId,
      {
        status: params.status as ActionStatus[] | undefined,
        priority: params.priority as ActionPriority[] | undefined,
        category: params.category as ActionCategory[] | undefined,
        searchQuery: params.searchQuery as string | undefined,
      },
      (params.limit as number) || 20
    );

    // Transform to sanitized format (removes IDs, translates constants to French)
    const rawData = capas.map((capa) => ({
      reference: capa.reference,
      title: capa.title,
      description: capa.description.substring(0, 200),
      category: capa.category,
      priority: capa.priority,
      status: capa.status,
      progress: capa.progress,
      assigneeName: capa.assigneeName,
      dueDate: capa.dueDate.toDate().toISOString(),
      isOverdue: capa.dueDate.toMillis() < Date.now() && 
        !["completed", "verified", "closed"].includes(capa.status),
      aiGenerated: capa.aiGenerated,
    }));

    return sanitizeCAPAs(rawData);
  },
};

/**
 * Tool: Get CAPA statistics
 */
export const getCAPAStatsTool: AITool = {
  name: "get_capa_stats",
  description:
    "Récupère les statistiques des CAPAs: totaux, urgentes, en retard, taux de clôture, répartition par statut/priorité/catégorie.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const stats = await getCAPAStats(context.organizationId);
    
    // Calculate closure rate
    const closedCount = (stats.byStatus.completed || 0) + 
                       (stats.byStatus.verified || 0) + 
                       (stats.byStatus.closed || 0);
    const closureRate = stats.total > 0 
      ? Math.round((closedCount / stats.total) * 100) 
      : 0;
    
    // Calculate on-time closure rate
    const onTimeRate = closedCount > 0 
      ? Math.round((stats.closedOnTime / closedCount) * 100) 
      : 0;

    const rawStats = {
      total: stats.total,
      urgent: stats.urgent,
      overdue: stats.overdue,
      closureRate,
      onTimeClosureRate: onTimeRate,
      byStatus: stats.byStatus,
      byPriority: stats.byPriority,
      byCategory: stats.byCategory,
      inProgress: stats.byStatus.in_progress || 0,
      pendingApproval: stats.byStatus.pending_approval || 0,
    };

    return sanitizeCAPAStats(rawStats);
  },
};

/**
 * Tool: Get overdue CAPAs
 */
export const getOverdueCAPAsTool: AITool = {
  name: "get_overdue_capas",
  description:
    "Récupère toutes les CAPAs en retard (date d'échéance dépassée et non clôturées).",
  parameters: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Nombre maximum de résultats (défaut: 10)",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const capas = await getCAPAs(context.organizationId, {}, 100);
    const now = Date.now();
    
    const overdue = capas
      .filter((capa) => 
        capa.dueDate.toMillis() < now && 
        !["completed", "verified", "closed"].includes(capa.status)
      )
      .sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis());

    const limit = (params.limit as number) || 10;
    
    // Transform to sanitized format
    const rawData = overdue.slice(0, limit).map((capa) => ({
      reference: capa.reference,
      title: capa.title,
      description: capa.description.substring(0, 100),
      category: capa.category,
      priority: capa.priority,
      status: capa.status,
      progress: capa.progress,
      assigneeName: capa.assigneeName,
      dueDate: capa.dueDate.toDate().toISOString(),
      isOverdue: true,
      aiGenerated: capa.aiGenerated,
      daysOverdue: Math.floor((now - capa.dueDate.toMillis()) / (1000 * 60 * 60 * 24)),
    }));

    return sanitizeCAPAs(rawData);
  },
};

/**
 * Tool: Get CAPA Kanban status
 */
export const getCAPAKanbanTool: AITool = {
  name: "get_capa_kanban",
  description:
    "Récupère la répartition des CAPAs par colonne Kanban pour visualiser le flux de travail.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const byColumn = await getCAPAsByColumn(context.organizationId);
    
    const rawKanban = {
      urgent: byColumn.urgent.length,
      toPlan: byColumn.to_plan.length,
      todo: byColumn.todo.length,
      inProgress: byColumn.in_progress.length,
      done: byColumn.done.length,
      summary: {
        active: byColumn.urgent.length + byColumn.to_plan.length + 
                byColumn.todo.length + byColumn.in_progress.length,
        completed: byColumn.done.length,
      },
    };

    return sanitizeCAPAKanban(rawKanban);
  },
};

/**
 * Tool: Get CAPA details
 */
export const getCAPADetailsTool: AITool = {
  name: "get_capa_details",
  description:
    "Récupère les détails complets d'une CAPA spécifique par sa référence (ex: CAPA-202512-ABCD).",
  parameters: {
    type: "object",
    properties: {
      capaReference: {
        type: "string",
        description: "La référence de la CAPA (ex: CAPA-202512-ABCD)",
      },
    },
    required: ["capaReference"],
  },
  execute: async (params, context: AIContext) => {
    // Find CAPA by reference
    const capas = await getCAPAs(
      context.organizationId,
      { searchQuery: params.capaReference as string },
      50
    );

    const capa = capas.find(
      (c) => c.reference === params.capaReference
    );

    if (!capa) {
      return { error: "CAPA non trouvée avec cette référence" };
    }

    // Verify organization access (should already be filtered, but double-check)
    if (capa.organizationId !== context.organizationId) {
      return { error: "Accès non autorisé à cette CAPA" };
    }

    // Return sanitized data (no internal IDs, French labels)
    return sanitizeCAPA({
      reference: capa.reference,
      title: capa.title,
      description: capa.description,
      category: capa.category,
      priority: capa.priority,
      status: capa.status,
      progress: capa.progress,
      assigneeName: capa.assigneeName,
      dueDate: capa.dueDate.toDate().toISOString(),
      isOverdue: capa.dueDate.toMillis() < Date.now() && 
        !["completed", "verified", "closed"].includes(capa.status),
      aiGenerated: capa.aiGenerated,
      createdAt: capa.createdAt.toDate().toISOString(),
      sourceType: capa.sourceType,
      checklistItemsCount: capa.checklistItems?.length || 0,
      checklistCompletedCount: capa.checklistItems?.filter(i => i.completed).length || 0,
      commentsCount: capa.comments?.length || 0,
      aiSuggestions: capa.aiSuggestions,
    });
  },
};

/**
 * All CAPA tools
 */
export const capaTools: AITool[] = [
  getCAPAsTool,
  getCAPAStatsTool,
  getOverdueCAPAsTool,
  getCAPAKanbanTool,
  getCAPADetailsTool,
];
