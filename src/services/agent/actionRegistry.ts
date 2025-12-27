/**
 * Action Registry
 * 
 * Defines all possible agent actions organized by module.
 * Each action includes metadata for permission checking and UI interaction.
 */

import type { FeatureModule, CRUDPermissions } from "@/types/organization";
import type { AgentAction, AgentActionType } from "@/types/agent";
import { createAction } from "@/types/agent";

/**
 * Action definition template
 */
interface ActionTemplate {
  type: AgentActionType;
  target: string;
  label: string;
  labelFr: string;
  feature?: FeatureModule;
  crudAction?: keyof CRUDPermissions;
  requiresConfirmation?: boolean;
  params?: Record<string, unknown>;
}

/**
 * Module action definitions
 */
interface ModuleActions {
  [key: string]: ActionTemplate;
}

// =============================================================================
// Dashboard Actions
// =============================================================================

export const dashboardActions: ModuleActions = {
  navigate: {
    type: "click",
    target: 'a[href="/app/dashboard"]',
    label: "Click Dashboard link in sidebar",
    labelFr: "Cliquer sur Tableau de bord dans le menu",
    feature: "dashboard",
    crudAction: "read",
  },
  refreshData: {
    type: "click",
    target: '[data-action="refresh-dashboard"]',
    label: "Refresh dashboard data",
    labelFr: "Actualiser les données du tableau de bord",
    feature: "dashboard",
    crudAction: "read",
  },
};

// =============================================================================
// Incidents Actions
// =============================================================================

export const incidentActions: ModuleActions = {
  navigate: {
    type: "click",
    target: 'a[href="/app/incidents"]',
    label: "Click Incidents link in sidebar",
    labelFr: "Cliquer sur Incidents dans le menu",
    feature: "incidents",
    crudAction: "read",
  },
  create: {
    type: "click",
    target: '[data-testid="declare-incident-button"], button:has-text("Déclarer un incident")',
    label: "Create new incident",
    labelFr: "Déclarer un nouvel incident",
    feature: "incidents",
    crudAction: "create",
  },
  viewList: {
    type: "click",
    target: 'a[href="/app/incidents"]',
    label: "Click Incidents link to view list",
    labelFr: "Cliquer sur Incidents pour voir la liste",
    feature: "incidents",
    crudAction: "read",
  },
  openDetail: {
    type: "click",
    target: '[data-incident-card]',
    label: "Open incident detail",
    labelFr: "Ouvrir le détail de l'incident",
    feature: "incidents",
    crudAction: "read",
  },
  setFilterStatus: {
    type: "filter",
    target: '[data-filter="status"]',
    label: "Filter by status",
    labelFr: "Filtrer par statut",
    feature: "incidents",
    crudAction: "read",
  },
  setFilterSeverity: {
    type: "filter",
    target: '[data-filter="severity"]',
    label: "Filter by severity",
    labelFr: "Filtrer par gravité",
    feature: "incidents",
    crudAction: "read",
  },
  changeViewGrid: {
    type: "click",
    target: '[aria-label="Vue grille"]',
    label: "Switch to grid view",
    labelFr: "Passer en vue grille",
    feature: "incidents",
    crudAction: "read",
  },
  changeViewList: {
    type: "click",
    target: '[aria-label="Vue liste"]',
    label: "Switch to list view",
    labelFr: "Passer en vue liste",
    feature: "incidents",
    crudAction: "read",
  },
  search: {
    type: "search",
    target: '[data-search="incidents"]',
    label: "Search incidents",
    labelFr: "Rechercher des incidents",
    feature: "incidents",
    crudAction: "read",
  },
};

// =============================================================================
// CAPA Actions
// =============================================================================

export const capaActions: ModuleActions = {
  navigate: {
    type: "click",
    target: 'a[href="/app/capa"]',
    label: "Navigate to CAPA",
    labelFr: "Aller aux CAPA",
    feature: "capa",
    crudAction: "read",
  },
  create: {
    type: "click",
    target: 'button:has-text("Nouvelle CAPA")',
    label: "Create new CAPA",
    labelFr: "Créer une nouvelle CAPA",
    feature: "capa",
    crudAction: "create",
  },
  viewList: {
    type: "click",
    target: 'a[href="/app/capa"]',
    label: "View CAPA list",
    labelFr: "Voir la liste des CAPA",
    feature: "capa",
    crudAction: "read",
  },
  openDetail: {
    type: "click",
    target: '[data-capa-card]',
    label: "Open CAPA detail",
    labelFr: "Ouvrir le détail de la CAPA",
    feature: "capa",
    crudAction: "read",
  },
  changeStatus: {
    type: "click",
    target: '[data-action="change-status"]',
    label: "Change CAPA status",
    labelFr: "Changer le statut de la CAPA",
    feature: "capa",
    crudAction: "update",
    requiresConfirmation: true,
  },
  setFilterCategory: {
    type: "filter",
    target: '[data-filter="category"]',
    label: "Filter by category",
    labelFr: "Filtrer par catégorie",
    feature: "capa",
    crudAction: "read",
  },
  setFilterPriority: {
    type: "filter",
    target: '[data-filter="priority"]',
    label: "Filter by priority",
    labelFr: "Filtrer par priorité",
    feature: "capa",
    crudAction: "read",
  },
};

// =============================================================================
// Training Actions
// =============================================================================

export const trainingActions: ModuleActions = {
  navigate: {
    type: "click",
    target: 'a[href="/app/training"]',
    label: "Navigate to Training",
    labelFr: "Aller aux formations",
    feature: "training",
    crudAction: "read",
  },
  create: {
    type: "click",
    target: 'button:has-text("Nouvelle formation")',
    label: "Create new training",
    labelFr: "Créer une nouvelle formation",
    feature: "training",
    crudAction: "create",
  },
  viewList: {
    type: "click",
    target: 'a[href="/app/training"]',
    label: "View training list",
    labelFr: "Voir la liste des formations",
    feature: "training",
    crudAction: "read",
  },
};

// =============================================================================
// Compliance Actions
// =============================================================================

export const complianceActions: ModuleActions = {
  navigate: {
    type: "click",
    target: 'a[href="/app/compliance"]',
    label: "Navigate to Compliance",
    labelFr: "Aller à la conformité",
    feature: "compliance",
    crudAction: "read",
  },
  viewList: {
    type: "click",
    target: 'a[href="/app/compliance"]',
    label: "View compliance status",
    labelFr: "Voir l'état de conformité",
    feature: "compliance",
    crudAction: "read",
  },
  runAudit: {
    type: "click",
    target: 'button:has-text("Lancer un audit")',
    label: "Run compliance audit",
    labelFr: "Lancer un audit de conformité",
    feature: "compliance",
    crudAction: "create",
  },
  updateStatus: {
    type: "click",
    target: '[data-action="update-compliance-status"]',
    label: "Update compliance status",
    labelFr: "Mettre à jour le statut de conformité",
    feature: "compliance",
    crudAction: "update",
    requiresConfirmation: true,
  },
};

// =============================================================================
// Health Actions
// =============================================================================

export const healthActions: ModuleActions = {
  navigate: {
    type: "click",
    target: 'a[href="/app/health"]',
    label: "Navigate to Health",
    labelFr: "Aller à la santé",
    feature: "health",
    crudAction: "read",
  },
  viewList: {
    type: "click",
    target: 'a[href="/app/health"]',
    label: "View health records",
    labelFr: "Voir les dossiers de santé",
    feature: "health",
    crudAction: "read",
  },
  scheduleVisit: {
    type: "click",
    target: 'button:has-text("Planifier une visite")',
    label: "Schedule medical visit",
    labelFr: "Planifier une visite médicale",
    feature: "health",
    crudAction: "create",
  },
  viewStats: {
    type: "click",
    target: '[data-tab="statistics"]',
    label: "View health statistics",
    labelFr: "Voir les statistiques de santé",
    feature: "health",
    crudAction: "read",
  },
};

// =============================================================================
// Analytics Actions
// =============================================================================

export const analyticsActions: ModuleActions = {
  navigate: {
    type: "click",
    target: 'a[href="/app/analytics"]',
    label: "Navigate to Analytics",
    labelFr: "Aller aux analytiques",
    feature: "analytics",
    crudAction: "read",
  },
  viewReport: {
    type: "click",
    target: '[data-report]',
    label: "View report",
    labelFr: "Voir le rapport",
    feature: "analytics",
    crudAction: "read",
  },
  exportData: {
    type: "click",
    target: 'button:has-text("Exporter")',
    label: "Export data",
    labelFr: "Exporter les données",
    feature: "analytics",
    crudAction: "read",
  },
};

// =============================================================================
// All Actions Registry
// =============================================================================

export const ACTION_REGISTRY = {
  dashboard: dashboardActions,
  incidents: incidentActions,
  capa: capaActions,
  training: trainingActions,
  compliance: complianceActions,
  health: healthActions,
  analytics: analyticsActions,
} as const;

export type ActionModule = keyof typeof ACTION_REGISTRY;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all actions for a module
 */
export function getModuleActions(module: ActionModule): ModuleActions {
  return ACTION_REGISTRY[module];
}

/**
 * Get a specific action by module and key
 */
export function getAction(module: ActionModule, actionKey: string): ActionTemplate | undefined {
  return ACTION_REGISTRY[module][actionKey];
}

/**
 * Create an AgentAction from a template
 */
export function createActionFromTemplate(
  template: ActionTemplate,
  params?: Record<string, unknown>
): AgentAction {
  return createAction(template.type, template.target, template.labelFr, {
    feature: template.feature,
    crudAction: template.crudAction,
    requiresConfirmation: template.requiresConfirmation ?? false,
    params: { ...template.params, ...params },
  });
}

/**
 * Get all available action templates
 */
export function getAllActionTemplates(): Array<{ module: ActionModule; key: string; template: ActionTemplate }> {
  const all: Array<{ module: ActionModule; key: string; template: ActionTemplate }> = [];
  
  for (const [module, actions] of Object.entries(ACTION_REGISTRY)) {
    for (const [key, template] of Object.entries(actions)) {
      all.push({ module: module as ActionModule, key, template });
    }
  }
  
  return all;
}

/**
 * Get navigation actions only
 */
export function getNavigationActions(): Array<{ module: ActionModule; template: ActionTemplate }> {
  return getAllActionTemplates()
    .filter(({ template }) => template.type === "navigate")
    .map(({ module, template }) => ({ module, template }));
}

/**
 * Find action by target
 */
export function findActionByTarget(target: string): { module: ActionModule; key: string; template: ActionTemplate } | undefined {
  return getAllActionTemplates().find(({ template }) => template.target === target);
}

