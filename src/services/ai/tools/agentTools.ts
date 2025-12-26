/**
 * Agent Action Tools for AI
 * 
 * Tools that the AI can use to take actions in the application.
 * These tools return action requests that are executed by the ActionExecutor.
 */

import type { AITool, AIContext, AgentActionRequest } from "../types";
import { ACTION_REGISTRY, type ActionModule } from "@/services/agent/actionRegistry";

/**
 * Helper to create an agent action response
 */
function createAgentAction(
  type: string,
  target: string,
  description: string,
  params?: Record<string, unknown>,
  requiresConfirmation?: boolean
): { agentAction: AgentActionRequest } {
  return {
    agentAction: {
      type,
      target,
      description,
      params,
      requiresConfirmation,
    },
  };
}

// =============================================================================
// Navigation Tools
// =============================================================================

/**
 * Tool: Navigate to a page
 */
export const navigateToPageTool: AITool = {
  name: "navigate_to_page",
  description:
    "Navigue vers une page spécifique de l'application. Utilisez cet outil quand l'utilisateur demande d'aller vers un module ou une section.",
  parameters: {
    type: "object",
    properties: {
      page: {
        type: "string",
        description:
          "La page de destination. Options: dashboard, incidents, capa, training, compliance, health, analytics",
        enum: [
          "dashboard",
          "incidents",
          "capa",
          "training",
          "compliance",
          "health",
          "analytics",
        ],
      },
    },
    required: ["page"],
  },
  execute: async (params, _context: AIContext) => {
    const page = params.page as ActionModule;
    const path = `/app/${page}`;

    return createAgentAction(
      "navigate",
      path,
      `Navigation vers ${page}`
    );
  },
};

// =============================================================================
// Incident Tools
// =============================================================================

/**
 * Tool: Create a new incident
 */
export const createIncidentTool: AITool = {
  name: "create_incident",
  description:
    "Ouvre le formulaire de création d'un nouvel incident. Utilisez cet outil quand l'utilisateur veut déclarer un incident.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, _context: AIContext) => {
    return createAgentAction(
      "click",
      'button:has-text("Déclarer un incident")',
      "Ouverture du formulaire de déclaration d'incident"
    );
  },
};

/**
 * Tool: Filter incidents by status
 */
export const filterIncidentsByStatusTool: AITool = {
  name: "filter_incidents_by_status",
  description:
    "Filtre les incidents par leur statut. Options: all, reported, acknowledged, investigating, action_plan_created, closed",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        description: "Le statut pour filtrer",
        enum: [
          "all",
          "reported",
          "acknowledged",
          "investigating",
          "action_plan_created",
          "closed",
        ],
      },
    },
    required: ["status"],
  },
  execute: async (params, _context: AIContext) => {
    const status = params.status as string;
    
    return createAgentAction(
      "filter",
      '[data-filter="status"]',
      `Filtrage des incidents par statut: ${status}`,
      { value: status }
    );
  },
};

/**
 * Tool: Filter incidents by severity
 */
export const filterIncidentsBySeverityTool: AITool = {
  name: "filter_incidents_by_severity",
  description:
    "Filtre les incidents par leur gravité. Options: all, minor, moderate, severe, critical",
  parameters: {
    type: "object",
    properties: {
      severity: {
        type: "string",
        description: "La gravité pour filtrer",
        enum: ["all", "minor", "moderate", "severe", "critical"],
      },
    },
    required: ["severity"],
  },
  execute: async (params, _context: AIContext) => {
    const severity = params.severity as string;
    
    return createAgentAction(
      "filter",
      '[data-filter="severity"]',
      `Filtrage des incidents par gravité: ${severity}`,
      { value: severity }
    );
  },
};

/**
 * Tool: Search incidents
 */
export const searchIncidentsTool: AITool = {
  name: "search_incidents",
  description:
    "Recherche des incidents par mot-clé dans la description, référence ou lieu.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Le terme de recherche",
      },
    },
    required: ["query"],
  },
  execute: async (params, _context: AIContext) => {
    const query = params.query as string;
    
    return createAgentAction(
      "search",
      '[data-search="incidents"]',
      `Recherche d'incidents: "${query}"`,
      { query }
    );
  },
};

/**
 * Tool: Change incidents view
 */
export const changeIncidentsViewTool: AITool = {
  name: "change_incidents_view",
  description: "Change l'affichage des incidents entre vue grille et vue liste.",
  parameters: {
    type: "object",
    properties: {
      view: {
        type: "string",
        description: "Le type de vue souhaité",
        enum: ["grid", "list"],
      },
    },
    required: ["view"],
  },
  execute: async (params, _context: AIContext) => {
    const view = params.view as string;
    const selector =
      view === "grid"
        ? '[aria-label="Vue grille"]'
        : '[aria-label="Vue liste"]';
    
    return createAgentAction(
      "click",
      selector,
      `Changement vers la vue ${view === "grid" ? "grille" : "liste"}`
    );
  },
};

// =============================================================================
// CAPA Tools
// =============================================================================

/**
 * Tool: Create a new CAPA
 */
export const createCAPATool: AITool = {
  name: "create_capa",
  description:
    "Ouvre le formulaire de création d'une nouvelle CAPA (action corrective ou préventive).",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, _context: AIContext) => {
    return createAgentAction(
      "click",
      'button:has-text("Nouvelle CAPA")',
      "Ouverture du formulaire de création de CAPA"
    );
  },
};

/**
 * Tool: Filter CAPAs by category
 */
export const filterCAPAByCategoryTool: AITool = {
  name: "filter_capa_by_category",
  description:
    "Filtre les CAPA par catégorie. Options: all, correctif, preventif",
  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "La catégorie pour filtrer",
        enum: ["all", "correctif", "preventif"],
      },
    },
    required: ["category"],
  },
  execute: async (params, _context: AIContext) => {
    const category = params.category as string;
    
    return createAgentAction(
      "filter",
      '[data-filter="category"]',
      `Filtrage des CAPA par catégorie: ${category}`,
      { value: category }
    );
  },
};

/**
 * Tool: Filter CAPAs by priority
 */
export const filterCAPAByPriorityTool: AITool = {
  name: "filter_capa_by_priority",
  description:
    "Filtre les CAPA par priorité. Options: all, critique, haute, moyenne, basse",
  parameters: {
    type: "object",
    properties: {
      priority: {
        type: "string",
        description: "La priorité pour filtrer",
        enum: ["all", "critique", "haute", "moyenne", "basse"],
      },
    },
    required: ["priority"],
  },
  execute: async (params, _context: AIContext) => {
    const priority = params.priority as string;
    
    return createAgentAction(
      "filter",
      '[data-filter="priority"]',
      `Filtrage des CAPA par priorité: ${priority}`,
      { value: priority }
    );
  },
};

// =============================================================================
// Form Filling Tools
// =============================================================================

/**
 * Tool: Fill a form field
 */
export const fillFormFieldTool: AITool = {
  name: "fill_form_field",
  description:
    "Remplit un champ de formulaire avec une valeur spécifique. Utilisez cet outil pour remplir des formulaires.",
  parameters: {
    type: "object",
    properties: {
      fieldSelector: {
        type: "string",
        description:
          "Le sélecteur CSS du champ ou son nom/id (ex: input[name='title'], #description)",
      },
      value: {
        type: "string",
        description: "La valeur à saisir dans le champ",
      },
    },
    required: ["fieldSelector", "value"],
  },
  execute: async (params, _context: AIContext) => {
    const selector = params.fieldSelector as string;
    const value = params.value as string;
    
    return createAgentAction(
      "fill_input",
      selector,
      `Remplissage du champ avec: "${value.substring(0, 50)}${value.length > 50 ? "..." : ""}"`,
      { value }
    );
  },
};

/**
 * Tool: Select an option
 */
export const selectOptionTool: AITool = {
  name: "select_option",
  description: "Sélectionne une option dans un menu déroulant.",
  parameters: {
    type: "object",
    properties: {
      selectSelector: {
        type: "string",
        description: "Le sélecteur CSS du menu déroulant",
      },
      value: {
        type: "string",
        description: "La valeur de l'option à sélectionner",
      },
    },
    required: ["selectSelector", "value"],
  },
  execute: async (params, _context: AIContext) => {
    const selector = params.selectSelector as string;
    const value = params.value as string;
    
    return createAgentAction(
      "select_option",
      selector,
      `Sélection de l'option: ${value}`,
      { value }
    );
  },
};

/**
 * Tool: Submit a form
 */
export const submitFormTool: AITool = {
  name: "submit_form",
  description:
    "Soumet un formulaire. Utilisez cet outil après avoir rempli tous les champs nécessaires.",
  parameters: {
    type: "object",
    properties: {
      formSelector: {
        type: "string",
        description:
          "Le sélecteur CSS du formulaire (ex: form, [data-form='incident'])",
      },
    },
    required: ["formSelector"],
  },
  execute: async (params, _context: AIContext) => {
    const selector = params.formSelector as string;
    
    return createAgentAction(
      "submit_form",
      selector,
      "Soumission du formulaire",
      undefined,
      true // Requires confirmation
    );
  },
};

// =============================================================================
// Generic UI Tools
// =============================================================================

/**
 * Tool: Click a button
 */
export const clickButtonTool: AITool = {
  name: "click_button",
  description:
    "Clique sur un bouton ou un élément interactif. Utilisez cet outil pour déclencher des actions.",
  parameters: {
    type: "object",
    properties: {
      buttonSelector: {
        type: "string",
        description:
          "Le sélecteur CSS du bouton ou un texte pour le trouver (ex: button:has-text('Enregistrer'))",
      },
      description: {
        type: "string",
        description: "Description de ce que fait le clic",
      },
    },
    required: ["buttonSelector"],
  },
  execute: async (params, _context: AIContext) => {
    const selector = params.buttonSelector as string;
    const desc = (params.description as string) || "Clic sur un bouton";
    
    return createAgentAction("click", selector, desc);
  },
};

/**
 * Tool: Switch tab
 */
export const switchTabTool: AITool = {
  name: "switch_tab",
  description: "Change l'onglet actif dans une interface à onglets.",
  parameters: {
    type: "object",
    properties: {
      tabSelector: {
        type: "string",
        description: "Le sélecteur CSS de l'onglet ou son nom",
      },
    },
    required: ["tabSelector"],
  },
  execute: async (params, _context: AIContext) => {
    const selector = params.tabSelector as string;
    
    return createAgentAction(
      "switch_tab",
      selector,
      "Changement d'onglet"
    );
  },
};

/**
 * Tool: Scroll to element
 */
export const scrollToElementTool: AITool = {
  name: "scroll_to_element",
  description: "Fait défiler la page jusqu'à un élément spécifique.",
  parameters: {
    type: "object",
    properties: {
      elementSelector: {
        type: "string",
        description: "Le sélecteur CSS de l'élément",
      },
    },
    required: ["elementSelector"],
  },
  execute: async (params, _context: AIContext) => {
    const selector = params.elementSelector as string;
    
    return createAgentAction(
      "scroll",
      selector,
      "Défilement vers l'élément"
    );
  },
};

/**
 * Tool: Open modal/dialog
 */
export const openModalTool: AITool = {
  name: "open_modal",
  description: "Ouvre une fenêtre modale ou un dialogue.",
  parameters: {
    type: "object",
    properties: {
      triggerSelector: {
        type: "string",
        description: "Le sélecteur CSS de l'élément qui ouvre la modale",
      },
    },
    required: ["triggerSelector"],
  },
  execute: async (params, _context: AIContext) => {
    const selector = params.triggerSelector as string;
    
    return createAgentAction(
      "open_modal",
      selector,
      "Ouverture de la fenêtre modale"
    );
  },
};

/**
 * Tool: Close modal/dialog
 */
export const closeModalTool: AITool = {
  name: "close_modal",
  description: "Ferme la fenêtre modale ou le dialogue actif.",
  parameters: {
    type: "object",
    properties: {
      closeButtonSelector: {
        type: "string",
        description:
          "Le sélecteur CSS du bouton de fermeture (défaut: [data-dismiss='modal'], .modal-close)",
      },
    },
  },
  execute: async (params, _context: AIContext) => {
    const selector =
      (params.closeButtonSelector as string) ||
      "[data-dismiss='modal'], .modal-close, button:has-text('Fermer')";
    
    return createAgentAction(
      "close_modal",
      selector,
      "Fermeture de la fenêtre modale"
    );
  },
};

/**
 * Tool: Wait for page load
 */
export const waitTool: AITool = {
  name: "wait",
  description:
    "Attend un certain temps avant de continuer. Utile après une action qui déclenche un chargement.",
  parameters: {
    type: "object",
    properties: {
      duration: {
        type: "number",
        description: "Durée d'attente en millisecondes (défaut: 1000)",
      },
    },
  },
  execute: async (params, _context: AIContext) => {
    const duration = (params.duration as number) || 1000;
    
    return createAgentAction(
      "wait",
      "",
      `Attente de ${duration}ms`,
      { duration }
    );
  },
};

// =============================================================================
// Export All Agent Tools
// =============================================================================

export const agentTools: AITool[] = [
  // Navigation
  navigateToPageTool,
  
  // Incidents
  createIncidentTool,
  filterIncidentsByStatusTool,
  filterIncidentsBySeverityTool,
  searchIncidentsTool,
  changeIncidentsViewTool,
  
  // CAPA
  createCAPATool,
  filterCAPAByCategoryTool,
  filterCAPAByPriorityTool,
  
  // Form operations
  fillFormFieldTool,
  selectOptionTool,
  submitFormTool,
  
  // Generic UI
  clickButtonTool,
  switchTabTool,
  scrollToElementTool,
  openModalTool,
  closeModalTool,
  waitTool,
];

/**
 * Get agent tools filtered by available features
 */
export function getAgentToolsForContext(availableFeatures: string[]): AITool[] {
  // For now, return all tools - permissions are checked at execution time
  // In the future, we could filter based on features
  return agentTools;
}

