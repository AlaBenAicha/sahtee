/**
 * Agent Mode Types
 * 
 * Types for the SafetyBot Agent Mode that enables AI-controlled UI interactions.
 */

import type { FeatureModule, CRUDPermissions } from "./organization";

/**
 * Operating mode for SafetyBot
 * - chat: Traditional chat mode, AI responds with text
 * - agent: AI can take actions in the application
 */
export type AgentMode = "chat" | "agent";

/**
 * Types of actions the agent can perform
 * NOTE: No "navigate" type - agent must always click on visible UI elements
 */
export type AgentActionType =
  | "click"           // Click a button, link, or element (including sidebar navigation)
  | "fill_input"      // Fill an input field
  | "select_option"   // Select from dropdown
  | "toggle"          // Toggle a switch or checkbox
  | "drag_drop"       // Drag and drop operation
  | "search"          // Perform a search
  | "filter"          // Apply a filter
  | "open_modal"      // Open a modal/dialog
  | "close_modal"     // Close a modal/dialog
  | "submit_form"     // Submit a form
  | "expand_collapse" // Expand or collapse a section
  | "switch_tab"      // Switch between tabs
  | "scroll"          // Scroll to element
  | "wait";           // Wait for condition

/**
 * Agent action status
 */
export type AgentActionStatus =
  | "pending"
  | "executing"
  | "awaiting_confirmation"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Single action the agent can execute
 */
export interface AgentAction {
  /** Unique action ID */
  id: string;
  /** Type of action */
  type: AgentActionType;
  /** Target - CSS selector, route path, or element identifier */
  target: string;
  /** Additional parameters for the action */
  params?: Record<string, unknown>;
  /** Human-readable description of what the action does */
  label: string;
  /** Feature module this action belongs to (for permission checking) */
  feature?: FeatureModule;
  /** CRUD action type (for permission checking) */
  crudAction?: keyof CRUDPermissions;
  /** Whether this action requires user confirmation */
  requiresConfirmation: boolean;
  /** Current status of the action */
  status: AgentActionStatus;
  /** Error message if action failed */
  error?: string;
  /** Timestamp when action started */
  startedAt?: Date;
  /** Timestamp when action completed */
  completedAt?: Date;
}

/**
 * Agent execution state
 */
export type AgentExecutionState =
  | "idle"              // Not executing
  | "thinking"          // AI is thinking/planning
  | "executing"         // Executing an action
  | "waiting_confirm"   // Waiting for user confirmation
  | "paused"            // User paused execution
  | "stopped"           // User stopped execution
  | "error";            // Error occurred

/**
 * Complete agent state
 */
export interface AgentState {
  /** Current mode (chat or agent) */
  mode: AgentMode;
  /** Current execution state */
  executionState: AgentExecutionState;
  /** Whether agent is actively executing */
  isExecuting: boolean;
  /** Current action being executed */
  currentAction: AgentAction | null;
  /** Queue of pending actions */
  actionQueue: AgentAction[];
  /** History of executed actions */
  actionHistory: AgentAction[];
  /** Current thinking content from AI */
  thinking: string | null;
  /** Whether user can stop the agent */
  canStop: boolean;
  /** Error message if any */
  error: string | null;
  /** Highlighted element selector (for visual feedback) */
  highlightedElement: string | null;
}

/**
 * Result of action permission check
 */
export interface AgentPermissionResult {
  /** Whether action is allowed */
  allowed: boolean;
  /** Reason if not allowed */
  reason?: string;
}

/**
 * Agent action result
 */
export interface AgentActionResult {
  /** Whether action succeeded */
  success: boolean;
  /** Action that was executed */
  action: AgentAction;
  /** Error message if failed */
  error?: string;
  /** Any data returned by the action */
  data?: unknown;
}

/**
 * Confirmation request for destructive actions
 */
export interface AgentConfirmationRequest {
  /** Action requiring confirmation */
  action: AgentAction;
  /** Title for confirmation dialog */
  title: string;
  /** Description of what will happen */
  description: string;
  /** Confirm button text */
  confirmText: string;
  /** Cancel button text */
  cancelText: string;
  /** Whether this is a destructive action */
  isDestructive: boolean;
}

/**
 * Agent context value exposed by AgentContext
 */
export interface AgentContextValue {
  /** Current agent state */
  state: AgentState;
  /** Switch between chat and agent mode */
  setMode: (mode: AgentMode) => void;
  /** Queue actions for execution */
  queueActions: (actions: AgentAction[]) => void;
  /** Execute queued actions */
  executeActions: () => Promise<void>;
  /** Stop current execution */
  stopExecution: (notify?: boolean) => void;
  /** Pause execution */
  pauseExecution: () => void;
  /** Resume execution */
  resumeExecution: () => void;
  /** Clear action queue */
  clearQueue: () => void;
  /** Set current thinking text */
  setThinking: (thinking: string | null) => void;
  /** Highlight an element */
  highlightElement: (selector: string | null) => void;
  /** Handle confirmation response */
  handleConfirmation: (confirmed: boolean) => void;
  /** Current confirmation request */
  confirmationRequest: AgentConfirmationRequest | null;
  /** Whether agent mode is available */
  isAgentModeAvailable: boolean;
}

/**
 * Default agent state
 */
export const DEFAULT_AGENT_STATE: AgentState = {
  mode: "chat",
  executionState: "idle",
  isExecuting: false,
  currentAction: null,
  actionQueue: [],
  actionHistory: [],
  thinking: null,
  canStop: false,
  error: null,
  highlightedElement: null,
};

/**
 * Generate a unique action ID
 */
export function generateActionId(): string {
  return `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create an action object
 */
export function createAction(
  type: AgentActionType,
  target: string,
  label: string,
  options?: Partial<Omit<AgentAction, "id" | "type" | "target" | "label" | "status">>
): AgentAction {
  return {
    id: generateActionId(),
    type,
    target,
    label,
    status: "pending",
    requiresConfirmation: options?.requiresConfirmation ?? false,
    ...options,
  };
}

