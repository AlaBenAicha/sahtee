/**
 * Agent Permission Service
 * 
 * Handles permission checks for agent actions, including:
 * - Blocked paths (profile, settings)
 * - Blocked selectors (logout, profile links)
 * - Integration with user's RBAC permissions
 */

import type { FeaturePermissions, FeatureModule, CRUDPermissions } from "@/types/organization";
import type { AgentAction, AgentPermissionResult } from "@/types/agent";

/**
 * Paths the agent is not allowed to navigate to
 */
export const BLOCKED_PATHS = [
  "/app/profile",
  "/app/settings",
  "/logout",
  "/signout",
] as const;

/**
 * CSS selectors the agent is not allowed to interact with
 */
export const BLOCKED_SELECTORS = [
  // Logout buttons
  '[data-testid="logout-button"]',
  '[data-agent-block="logout"]',
  'button:has-text("Déconnexion")',
  'button:has-text("Logout")',
  // Profile links
  '[data-testid="profile-link"]',
  '[data-agent-block="profile"]',
  'a[href="/app/profile"]',
  'a[href*="profile"]',
  // Settings links
  '[data-testid="settings-link"]',
  '[data-agent-block="settings"]',
  'a[href="/app/settings"]',
  'a[href*="settings"]',
] as const;

/**
 * Keywords that indicate blocked content in selectors
 */
const BLOCKED_KEYWORDS = [
  "logout",
  "signout",
  "sign-out",
  "log-out",
  "profile",
  "settings",
  "account",
  "déconnexion",
  "mon-profil",
  "paramètres",
];

/**
 * Check if a path is blocked for agent access
 */
export function isPathBlocked(path: string): boolean {
  const normalizedPath = path.toLowerCase().trim();
  return BLOCKED_PATHS.some((blocked) => 
    normalizedPath === blocked.toLowerCase() ||
    normalizedPath.startsWith(blocked.toLowerCase())
  );
}

/**
 * Check if a selector targets a blocked element
 */
export function isSelectorBlocked(selector: string): boolean {
  const normalizedSelector = selector.toLowerCase();
  
  // Check against explicit blocked selectors
  if (BLOCKED_SELECTORS.some((blocked) => 
    normalizedSelector.includes(blocked.toLowerCase())
  )) {
    return true;
  }
  
  // Check for blocked keywords in selector
  if (BLOCKED_KEYWORDS.some((keyword) => 
    normalizedSelector.includes(keyword.toLowerCase())
  )) {
    return true;
  }
  
  return false;
}

/**
 * Check if user has permission for a feature action
 */
export function hasFeaturePermission(
  permissions: FeaturePermissions,
  feature: FeatureModule,
  action: keyof CRUDPermissions
): boolean {
  const featurePerms = permissions[feature];
  if (!featurePerms) return false;
  return featurePerms[action] ?? false;
}

/**
 * Main permission check for agent actions
 */
export function canAgentExecuteAction(
  action: AgentAction,
  userPermissions: FeaturePermissions
): AgentPermissionResult {
  // Check blocked paths for navigation actions
  if (action.type === "navigate") {
    if (isPathBlocked(action.target)) {
      return {
        allowed: false,
        reason: "L'accès au profil et aux paramètres est restreint pour l'agent.",
      };
    }
  }
  
  // Check blocked selectors for interaction actions
  if (["click", "fill_input", "select_option", "toggle", "submit_form"].includes(action.type)) {
    if (isSelectorBlocked(action.target)) {
      return {
        allowed: false,
        reason: "L'agent ne peut pas interagir avec cet élément (zone restreinte).",
      };
    }
  }
  
  // Check feature-level permissions
  if (action.feature && action.crudAction) {
    if (!hasFeaturePermission(userPermissions, action.feature, action.crudAction)) {
      return {
        allowed: false,
        reason: `Vous n'avez pas la permission d'effectuer cette action sur ${action.feature}.`,
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Check if an action requires user confirmation
 * Update and delete actions require confirmation
 */
export function actionRequiresConfirmation(action: AgentAction): boolean {
  // Explicit confirmation flag
  if (action.requiresConfirmation) {
    return true;
  }
  
  // Update and delete actions require confirmation
  if (action.crudAction === "update" || action.crudAction === "delete") {
    return true;
  }
  
  // Submit form actions that modify data
  if (action.type === "submit_form" && action.crudAction !== "read") {
    return true;
  }
  
  return false;
}

/**
 * Get permission error message for display
 */
export function getPermissionErrorMessage(result: AgentPermissionResult): string {
  return result.reason || "Action non autorisée.";
}

/**
 * Validate a batch of actions before execution
 */
export function validateActionBatch(
  actions: AgentAction[],
  userPermissions: FeaturePermissions
): { valid: AgentAction[]; invalid: Array<{ action: AgentAction; reason: string }> } {
  const valid: AgentAction[] = [];
  const invalid: Array<{ action: AgentAction; reason: string }> = [];
  
  for (const action of actions) {
    const result = canAgentExecuteAction(action, userPermissions);
    if (result.allowed) {
      valid.push(action);
    } else {
      invalid.push({ action, reason: result.reason || "Non autorisé" });
    }
  }
  
  return { valid, invalid };
}

/**
 * Filter available features based on user permissions
 */
export function getAvailableFeatures(permissions: FeaturePermissions): FeatureModule[] {
  const features: FeatureModule[] = [];
  const allFeatures: FeatureModule[] = [
    "dashboard",
    "incidents",
    "capa",
    "training",
    "compliance",
    "health",
    "analytics",
  ];
  
  for (const feature of allFeatures) {
    if (permissions[feature]?.read) {
      features.push(feature);
    }
  }
  
  return features;
}

/**
 * Mark an element as blocked for agent
 * Use this data attribute to prevent agent interaction
 */
export const AGENT_BLOCK_ATTRIBUTE = "data-agent-block";

/**
 * Check if an element is marked as blocked
 */
export function isElementBlocked(element: Element): boolean {
  // Check for blocking attribute
  if (element.hasAttribute(AGENT_BLOCK_ATTRIBUTE)) {
    return true;
  }
  
  // Check parent elements
  const blockedParent = element.closest(`[${AGENT_BLOCK_ATTRIBUTE}]`);
  if (blockedParent) {
    return true;
  }
  
  // Check if any blocked selector matches
  for (const selector of BLOCKED_SELECTORS) {
    try {
      if (element.matches(selector)) {
        return true;
      }
    } catch {
      // Invalid selector, skip
    }
  }
  
  return false;
}

