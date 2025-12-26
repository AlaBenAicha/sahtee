/**
 * Compliance Data Access Tools for AI
 * 
 * Tools for AI to query compliance and audit data securely.
 */

import type { AITool, AIContext } from "../types";
import { 
  getNorms, 
  getAudits, 
  getComplianceMetrics, 
  getAuditStats,
  getNorm,
  getAudit,
} from "@/services/complianceService";
import type { RegulatoryFramework, NormStatus } from "@/types/conformity";

/**
 * Tool: Get compliance metrics
 */
export const getComplianceStatusTool: AITool = {
  name: "get_compliance_status",
  description:
    "Récupère les métriques de conformité globales: taux de conformité, écarts, constats ouverts, audits à venir.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const metrics = await getComplianceMetrics(context.organizationId);
    
    return {
      overallComplianceRate: metrics.overallComplianceRate,
      frameworkCompliance: metrics.frameworkCompliance,
      requirements: {
        total: metrics.totalRequirements,
        compliant: metrics.compliantCount,
        nonCompliant: metrics.nonCompliantCount,
        partiallyCompliant: metrics.partiallyCompliantCount,
        pending: metrics.pendingCount,
      },
      findings: {
        open: metrics.openFindings,
        overdue: metrics.overdueFindings,
      },
      audits: {
        upcoming: metrics.upcomingAudits,
        completedYTD: metrics.completedAuditsYTD,
      },
    };
  },
};

/**
 * Tool: Get norms/standards
 */
export const getNormsTool: AITool = {
  name: "get_norms",
  description:
    "Récupère les normes et standards réglementaires applicables à l'organisation avec leurs scores de conformité.",
  parameters: {
    type: "object",
    properties: {
      framework: {
        type: "array",
        description:
          "Filtrer par référentiel: iso_45001, iso_14001, mase, code_travail, icpe, reach, seveso, other",
        items: { type: "string" },
      },
      status: {
        type: "array",
        description: "Filtrer par statut: not_started, in_progress, compliant, non_compliant",
        items: { type: "string" },
      },
      searchQuery: {
        type: "string",
        description: "Recherche dans le code ou nom de la norme",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const norms = await getNorms(context.organizationId, {
      framework: params.framework as RegulatoryFramework[] | undefined,
      status: params.status as NormStatus[] | undefined,
      searchQuery: params.searchQuery as string | undefined,
    });

    return norms.map((norm) => ({
      id: norm.id,
      code: norm.code,
      name: norm.name,
      framework: norm.framework,
      status: norm.status,
      complianceScore: norm.complianceScore,
      requirementsCount: norm.requirements.length,
      compliantCount: norm.requirements.filter((r) => r.status === "compliant").length,
      lastAuditDate: norm.lastAuditDate?.toDate().toISOString(),
      isActive: norm.isActive,
    }));
  },
};

/**
 * Tool: Find compliance gaps
 */
export const findComplianceGapsTool: AITool = {
  name: "find_compliance_gaps",
  description:
    "Identifie les écarts de conformité (exigences non conformes ou partiellement conformes) par norme.",
  parameters: {
    type: "object",
    properties: {
      normId: {
        type: "string",
        description: "ID de la norme spécifique (optionnel, sinon toutes les normes)",
      },
      framework: {
        type: "string",
        description: "Filtrer par référentiel",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const norms = await getNorms(context.organizationId, {
      framework: params.framework ? [params.framework as RegulatoryFramework] : undefined,
      isActive: true,
    });

    const filteredNorms = params.normId 
      ? norms.filter((n) => n.id === params.normId)
      : norms;

    const gaps: Array<{
      normCode: string;
      normName: string;
      requirementId: string;
      clause: string;
      description: string;
      status: string;
      priority: string;
    }> = [];

    for (const norm of filteredNorms) {
      for (const req of norm.requirements) {
        if (req.status === "non_compliant" || req.status === "partially_compliant") {
          gaps.push({
            normCode: norm.code,
            normName: norm.name,
            requirementId: req.id,
            clause: req.clause,
            description: req.description,
            status: req.status,
            priority: req.priority,
          });
        }
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    gaps.sort((a, b) => 
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
    );

    return {
      totalGaps: gaps.length,
      gaps: gaps.slice(0, 20), // Limit for AI context
    };
  },
};

/**
 * Tool: Get audits
 */
export const getAuditsTool: AITool = {
  name: "get_audits",
  description:
    "Récupère la liste des audits avec filtres optionnels sur le statut, type ou référentiel.",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "array",
        description: "Filtrer par statut: planned, in_progress, pending_report, completed, cancelled",
        items: { type: "string" },
      },
      type: {
        type: "array",
        description: "Filtrer par type: internal, external, certification, surveillance, follow_up",
        items: { type: "string" },
      },
      framework: {
        type: "array",
        description: "Filtrer par référentiel",
        items: { type: "string" },
      },
      limit: {
        type: "number",
        description: "Nombre maximum d'audits (défaut: 10)",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const audits = await getAudits(
      context.organizationId,
      {
        status: params.status as Array<"planned" | "in_progress" | "pending_report" | "completed" | "cancelled"> | undefined,
        type: params.type as Array<"internal" | "external" | "certification" | "surveillance" | "follow_up"> | undefined,
        framework: params.framework as RegulatoryFramework[] | undefined,
      },
      (params.limit as number) || 10
    );

    return audits.map((audit) => ({
      id: audit.id,
      title: audit.title,
      type: audit.type,
      framework: audit.framework,
      status: audit.status,
      scope: audit.scope,
      plannedStartDate: audit.plannedStartDate.toDate().toISOString(),
      plannedEndDate: audit.plannedEndDate.toDate().toISOString(),
      findingsCount: audit.findings?.length || 0,
      leadAuditor: audit.leadAuditor?.name,
    }));
  },
};

/**
 * Tool: Get audit statistics
 */
export const getAuditStatsTool: AITool = {
  name: "get_audit_stats",
  description:
    "Récupère les statistiques des audits: répartition par statut, type et référentiel.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, context: AIContext) => {
    const stats = await getAuditStats(context.organizationId);
    
    return {
      total: stats.total,
      planned: stats.planned,
      inProgress: stats.inProgress,
      completed: stats.completed,
      cancelled: stats.cancelled,
      byType: stats.byType,
      byFramework: stats.byFramework,
    };
  },
};

/**
 * Tool: Get upcoming audits
 */
export const getUpcomingAuditsTool: AITool = {
  name: "get_upcoming_audits",
  description:
    "Récupère les audits planifiés à venir dans les prochaines semaines.",
  parameters: {
    type: "object",
    properties: {
      daysAhead: {
        type: "number",
        description: "Nombre de jours à regarder (défaut: 30)",
      },
    },
  },
  execute: async (params, context: AIContext) => {
    const daysAhead = (params.daysAhead as number) || 30;
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const audits = await getAudits(context.organizationId, {
      status: ["planned"],
      dateRange: { start: now, end: futureDate },
    });

    return audits.map((audit) => ({
      id: audit.id,
      title: audit.title,
      type: audit.type,
      framework: audit.framework,
      plannedStartDate: audit.plannedStartDate.toDate().toISOString(),
      scope: audit.scope,
      daysUntilStart: Math.ceil(
        (audit.plannedStartDate.toMillis() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  },
};

/**
 * Tool: Get norm details
 */
export const getNormDetailsTool: AITool = {
  name: "get_norm_details",
  description:
    "Récupère les détails d'une norme spécifique incluant toutes ses exigences.",
  parameters: {
    type: "object",
    properties: {
      normId: {
        type: "string",
        description: "L'ID de la norme",
      },
    },
    required: ["normId"],
  },
  execute: async (params, context: AIContext) => {
    const norm = await getNorm(params.normId as string);

    if (!norm) {
      return { error: "Norme non trouvée" };
    }

    if (norm.organizationId !== context.organizationId) {
      return { error: "Accès non autorisé à cette norme" };
    }

    return {
      id: norm.id,
      code: norm.code,
      name: norm.name,
      description: norm.description,
      framework: norm.framework,
      status: norm.status,
      complianceScore: norm.complianceScore,
      requirements: norm.requirements.map((req) => ({
        id: req.id,
        clause: req.clause,
        description: req.description.substring(0, 100),
        status: req.status,
        priority: req.priority,
        evidenceCount: req.evidence?.length || 0,
        hasLinkedCapa: req.linkedCapaIds?.length > 0,
      })),
    };
  },
};

/**
 * All compliance tools
 */
export const complianceTools: AITool[] = [
  getComplianceStatusTool,
  getNormsTool,
  findComplianceGapsTool,
  getAuditsTool,
  getAuditStatsTool,
  getUpcomingAuditsTool,
  getNormDetailsTool,
];

