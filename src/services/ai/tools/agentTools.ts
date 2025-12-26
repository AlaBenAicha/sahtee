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
 * Mapping of page names to their sidebar link selectors and labels
 */
const PAGE_SIDEBAR_MAPPING: Record<string, { selector: string; label: string }> = {
  dashboard: { selector: 'a[href="/app/dashboard"]', label: "Tableau de bord" },
  incidents: { selector: 'a[href="/app/incidents"]', label: "Incidents" },
  capa: { selector: 'a[href="/app/capa"]', label: "CAPA" },
  training: { selector: 'a[href="/app/training"]', label: "Formations" },
  compliance: { selector: 'a[href="/app/compliance"]', label: "Conformité" },
  health: { selector: 'a[href="/app/health"]', label: "Santé" },
  analytics: { selector: 'a[href="/app/analytics"]', label: "Analytique" },
};

/**
 * Tool: Navigate to a page by clicking on the sidebar link
 */
export const navigateToPageTool: AITool = {
  name: "navigate_to_page",
  description:
    "Navigue vers une page spécifique de l'application en cliquant sur le lien correspondant dans la barre latérale. Utilisez cet outil quand l'utilisateur demande d'aller vers un module ou une section.",
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
    const page = params.page as string;
    const mapping = PAGE_SIDEBAR_MAPPING[page];
    
    if (!mapping) {
      return createAgentAction(
        "click",
        `nav a[href*="${page}"]`,
        `Clic sur le lien ${page} dans la navigation`
      );
    }

    return createAgentAction(
      "click",
      mapping.selector,
      `Clic sur "${mapping.label}" dans la barre latérale`
    );
  },
};

// =============================================================================
// Incident Tools
// =============================================================================

/**
 * Tool: Create a new incident - Opens the form
 */
export const createIncidentTool: AITool = {
  name: "create_incident",
  description:
    "Ouvre le formulaire de création d'un nouvel incident. Utilisez cet outil quand l'utilisateur veut déclarer un incident. Cela ouvre le formulaire multi-étapes.",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, _context: AIContext) => {
    return createAgentAction(
      "click",
      '[data-testid="declare-incident-button"], button:has-text("Déclarer un incident")',
      "Ouverture du formulaire de déclaration d'incident"
    );
  },
};

/**
 * Incident form wizard step actions
 * The incident form is a multi-step wizard with:
 * Step 1: Type d'incident & Niveau de gravité
 * Step 2: Lieu et moment
 * Step 3: Description
 * Step 4: Déclarant (informations du déclarant)
 */

/**
 * Tool: Select incident type (Step 1)
 */
export const selectIncidentTypeTool: AITool = {
  name: "select_incident_type",
  description:
    "Sélectionne le type d'incident dans le formulaire. Types: accident, near_miss (presqu'accident), unsafe_condition (condition dangereuse), unsafe_act (acte dangereux).",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        description: "Le type d'incident à sélectionner",
        enum: ["accident", "near_miss", "unsafe_condition", "unsafe_act"],
      },
    },
    required: ["type"],
  },
  execute: async (params, _context: AIContext) => {
    const type = params.type as string;
    const typeLabels: Record<string, string> = {
      accident: "Accident",
      near_miss: "Presqu'accident",
      unsafe_condition: "Condition dangereuse",
      unsafe_act: "Acte dangereux",
    };
    const label = typeLabels[type] || type;

    // Click on the label that contains the RadioGroupItem for this type
    // The label has id="type-{value}" (e.g., type-accident)
    return createAgentAction(
      "click",
      `label[for="type-${type}"], #type-${type}, label:has-text("${label}")`,
      `Sélection du type d'incident: ${label}`
    );
  },
};

/**
 * Tool: Select severity level (Step 1)
 */
export const selectSeverityLevelTool: AITool = {
  name: "select_severity_level",
  description:
    "Sélectionne le niveau de gravité de l'incident. Options: minor (Mineur), moderate (Modéré), severe (Grave), critical (Critique).",
  parameters: {
    type: "object",
    properties: {
      severity: {
        type: "string",
        description: "Le niveau de gravité",
        enum: ["minor", "moderate", "severe", "critical"],
      },
    },
    required: ["severity"],
  },
  execute: async (params, _context: AIContext) => {
    const severity = params.severity as string;
    const severityLabels: Record<string, string> = {
      minor: "Mineur",
      moderate: "Modéré",
      severe: "Grave",
      critical: "Critique",
    };
    const label = severityLabels[severity] || severity;

    // The severity buttons are plain buttons with bg color classes
    // Match by the exact text content
    return createAgentAction(
      "click",
      `button:has-text("${label}")`,
      `Sélection du niveau de gravité: ${label}`
    );
  },
};

/**
 * Tool: Click Next/Previous in incident wizard
 */
export const incidentWizardNavigationTool: AITool = {
  name: "incident_wizard_navigation",
  description:
    "Navigue entre les étapes du formulaire d'incident (Suivant ou Précédent).",
  parameters: {
    type: "object",
    properties: {
      direction: {
        type: "string",
        description: "La direction de navigation",
        enum: ["next", "previous"],
      },
    },
    required: ["direction"],
  },
  execute: async (params, _context: AIContext) => {
    const direction = params.direction as string;
    
    if (direction === "next") {
      // Use data-testid for reliable selection
      return createAgentAction(
        "click",
        '[data-testid="incident-form-next"], button:has-text("Suivant")',
        'Clic sur "Suivant" dans le formulaire d\'incident'
      );
    } else {
      return createAgentAction(
        "click",
        'button:has-text("Précédent")',
        'Clic sur "Précédent" dans le formulaire d\'incident'
      );
    }
  },
};

/**
 * Tool: Fill incident location (Step 2)
 */
export const fillIncidentLocationTool: AITool = {
  name: "fill_incident_location",
  description: "Remplit le lieu de l'incident (Étape 2).",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "Le lieu de l'incident (ex: Atelier A, Bureau, Zone de stockage)",
      },
    },
    required: ["location"],
  },
  execute: async (params, _context: AIContext) => {
    const location = params.location as string;

    // The location input has name="location" from react-hook-form
    return createAgentAction(
      "fill_input",
      "input[name='location']",
      `Saisie du lieu: ${location}`,
      { value: location }
    );
  },
};

/**
 * Tool: Fill incident date (Step 2)
 */
export const fillIncidentDateTimeTool: AITool = {
  name: "fill_incident_datetime",
  description: "Remplit la date de l'incident (Étape 2). Format: YYYY-MM-DD (ex: 2024-12-26).",
  parameters: {
    type: "object",
    properties: {
      date: {
        type: "string",
        description: "La date de l'incident (format: YYYY-MM-DD, ex: 2024-12-26)",
      },
    },
    required: ["date"],
  },
  execute: async (params, _context: AIContext) => {
    const date = params.date as string;

    // The date input has name="incidentDate" from react-hook-form
    return createAgentAction(
      "fill_input",
      "input[name='incidentDate']",
      `Saisie de la date: ${date}`,
      { value: date }
    );
  },
};

/**
 * Tool: Fill incident time (Step 2)
 */
export const fillIncidentTimeTool: AITool = {
  name: "fill_incident_time",
  description: "Remplit l'heure de l'incident (Étape 2). Format: HH:MM (ex: 14:30).",
  parameters: {
    type: "object",
    properties: {
      time: {
        type: "string",
        description: "L'heure de l'incident (format: HH:MM, ex: 14:30)",
      },
    },
    required: ["time"],
  },
  execute: async (params, _context: AIContext) => {
    const time = params.time as string;

    // The time input has name="incidentTime" from react-hook-form
    return createAgentAction(
      "fill_input",
      "input[name='incidentTime']",
      `Saisie de l'heure: ${time}`,
      { value: time }
    );
  },
};

/**
 * Tool: Fill incident description (Step 3)
 */
export const fillIncidentDescriptionTool: AITool = {
  name: "fill_incident_description",
  description: "Remplit la description détaillée de l'incident (Étape 3). Minimum 10 caractères.",
  parameters: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description: "La description détaillée de ce qui s'est passé (minimum 10 caractères)",
      },
    },
    required: ["description"],
  },
  execute: async (params, _context: AIContext) => {
    const description = params.description as string;

    // The description textarea has name="description" from react-hook-form
    return createAgentAction(
      "fill_input",
      "textarea[name='description']",
      `Saisie de la description de l'incident`,
      { value: description }
    );
  },
};

/**
 * Tool: Fill immediate actions taken (Step 3 - optional)
 */
export const fillImmediateActionsTool: AITool = {
  name: "fill_immediate_actions",
  description: "Remplit les actions immédiates prises après l'incident (Étape 3, optionnel).",
  parameters: {
    type: "object",
    properties: {
      actions: {
        type: "string",
        description: "Les actions immédiates prises (premiers secours, mise en sécurité, etc.)",
      },
    },
    required: ["actions"],
  },
  execute: async (params, _context: AIContext) => {
    const actions = params.actions as string;

    return createAgentAction(
      "fill_input",
      "textarea[name='immediateActions']",
      `Saisie des actions immédiates`,
      { value: actions }
    );
  },
};

/**
 * Tool: Fill reporter name (Step 4)
 */
export const fillReporterNameTool: AITool = {
  name: "fill_reporter_name",
  description: "Remplit le nom du déclarant (Étape 4). Requis sauf si signalement anonyme.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Le nom complet du déclarant (minimum 2 caractères)",
      },
    },
    required: ["name"],
  },
  execute: async (params, _context: AIContext) => {
    const name = params.name as string;

    return createAgentAction(
      "fill_input",
      "input[name='reporterName']",
      `Saisie du nom du déclarant: ${name}`,
      { value: name }
    );
  },
};

/**
 * Tool: Set anonymous reporting (Step 4)
 */
export const setAnonymousReportingTool: AITool = {
  name: "set_anonymous_reporting",
  description: "Active ou désactive le signalement anonyme (Étape 4).",
  parameters: {
    type: "object",
    properties: {
      anonymous: {
        type: "boolean",
        description: "true pour activer le signalement anonyme",
      },
    },
    required: ["anonymous"],
  },
  execute: async (params, _context: AIContext) => {
    const anonymous = params.anonymous as boolean;

    return createAgentAction(
      "toggle",
      "input[type='checkbox'][name='isAnonymous'], input[type='checkbox']",
      anonymous ? "Activation du signalement anonyme" : "Désactivation du signalement anonyme",
      { checked: anonymous }
    );
  },
};

/**
 * Tool: Submit incident form (Final step)
 */
export const submitIncidentFormTool: AITool = {
  name: "submit_incident_form",
  description:
    "Soumet le formulaire d'incident après avoir rempli toutes les étapes. Utilisez cet outil UNIQUEMENT à l'étape 4 (Déclarant).",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async (_params, _context: AIContext) => {
    // Use data-testid for reliable selection
    // No confirmation needed - user already requested incident creation
    return createAgentAction(
      "click",
      '[data-testid="incident-form-submit"], button[type="submit"]',
      "Soumission du formulaire d'incident",
      undefined,
      false // No confirmation - user already requested this action
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
  
  // Incidents - Specific tools for incident form wizard
  createIncidentTool,
  selectIncidentTypeTool,
  selectSeverityLevelTool,
  incidentWizardNavigationTool,
  fillIncidentLocationTool,
  fillIncidentDateTimeTool,
  fillIncidentTimeTool,
  fillIncidentDescriptionTool,
  fillImmediateActionsTool,
  fillReporterNameTool,
  setAnonymousReportingTool,
  submitIncidentFormTool,
  filterIncidentsByStatusTool,
  filterIncidentsBySeverityTool,
  searchIncidentsTool,
  changeIncidentsViewTool,
  
  // CAPA
  createCAPATool,
  filterCAPAByCategoryTool,
  filterCAPAByPriorityTool,
  
  // Form operations (generic)
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

