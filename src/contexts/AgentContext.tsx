/**
 * Agent Context
 * 
 * Provides agent mode state and controls throughout the application.
 * Manages the agent's ability to take actions in the UI.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  canAgentExecuteAction,
  actionRequiresConfirmation,
} from "@/services/agent/agentPermissions";
import type {
  AgentState,
  AgentAction,
  AgentMode,
  AgentContextValue,
  AgentConfirmationRequest,
  AgentActionResult,
} from "@/types/agent";
import { DEFAULT_AGENT_STATE } from "@/types/agent";

// Create context with undefined default
const AgentContext = createContext<AgentContextValue | undefined>(undefined);

/**
 * Find an element using a single selector (no retry)
 * Handles :has-text() patterns
 */
function findElementImmediate(selector: string): Element | null {
  console.log(`[AgentContext] findElementImmediate trying: "${selector}"`);

  // Handle :has-text() pattern (Playwright-style selector)
  const hasTextMatch = selector.match(/^(\w+):has-text\("([^"]+)"\)$/);
  if (hasTextMatch) {
    const [, tagName, text] = hasTextMatch;
    console.log(`[AgentContext] :has-text pattern matched, looking for ${tagName} with text "${text}"`);
    const elements = document.querySelectorAll(tagName);
    console.log(`[AgentContext] Found ${elements.length} ${tagName} elements`);
    for (const el of elements) {
      const elText = el.textContent?.trim() || '';
      if (elText.includes(text)) {
        console.log(`[AgentContext] Found element with text: "${elText.substring(0, 50)}..."`);
        return el;
      }
    }
    console.log(`[AgentContext] No ${tagName} element found with text "${text}"`);
    return null;
  }

  // Standard CSS selector
  try {
    const element = document.querySelector(selector);
    console.log(`[AgentContext] querySelector("${selector}") returned: ${element ? 'found' : 'null'}`);
    return element;
  } catch (error) {
    console.warn(`[AgentContext] Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Find an element using a selector that may include :has-text() patterns
 * Waits for the element to appear in the DOM with retries
 * @param selector - CSS selector or comma-separated selectors
 * @param timeout - Maximum time to wait in ms (default: 3000)
 * @param retryInterval - Time between retries in ms (default: 100)
 */
async function findElement(
  selector: string,
  timeout: number = 3000,
  retryInterval: number = 100
): Promise<Element | null> {
  const startTime = Date.now();
  console.log(`[AgentContext] findElement called with: "${selector}"`);

  // Handle multiple selectors separated by comma (try each one)
  const selectors = selector.includes(",")
    ? selector.split(",").map((s) => s.trim())
    : [selector];

  console.log(`[AgentContext] Selectors to try: ${JSON.stringify(selectors)}`);

  // First try immediate lookup
  for (const sel of selectors) {
    const element = findElementImmediate(sel);
    if (element) {
      console.log(`[AgentContext] Element found immediately: ${sel}`);
      return element;
    }
  }

  console.log(`[AgentContext] Element not found immediately, starting polling...`);

  // Retry with polling until timeout
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      for (const sel of selectors) {
        const element = findElementImmediate(sel);
        if (element) {
          clearInterval(checkInterval);
          console.log(`[AgentContext] Element found after waiting: ${sel}`);
          resolve(element);
          return;
        }
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        console.warn(`[AgentContext] Element not found after ${timeout}ms: ${selector}`);
        resolve(null);
      }
    }, retryInterval);
  });
}

interface AgentProviderProps {
  children: React.ReactNode;
}

/**
 * Agent Provider Component
 * Wraps the app and provides agent context
 */
export function AgentProvider({ children }: AgentProviderProps) {
  const location = useLocation();
  const { session } = useAuth();

  const [state, setState] = useState<AgentState>(DEFAULT_AGENT_STATE);
  const [confirmationRequest, setConfirmationRequest] = useState<AgentConfirmationRequest | null>(null);

  // Refs for execution control
  const executionAbortRef = useRef(false);
  const executionPausedRef = useRef(false);
  const confirmationResolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  // Check if agent mode is available (user is authenticated)
  const isAgentModeAvailable = !!session && !!session.featurePermissions;

  /**
   * Set agent mode
   */
  const setMode = useCallback((mode: AgentMode) => {
    setState((prev) => ({
      ...prev,
      mode,
      // Reset execution state when switching modes
      executionState: "idle",
      isExecuting: false,
      currentAction: null,
      actionQueue: [],
      thinking: null,
      error: null,
    }));
  }, []);

  /**
   * Queue actions for execution
   */
  const queueActions = useCallback((actions: AgentAction[]) => {
    setState((prev) => ({
      ...prev,
      actionQueue: [...prev.actionQueue, ...actions],
    }));
  }, []);

  /**
   * Set thinking text
   */
  const setThinking = useCallback((thinking: string | null) => {
    setState((prev) => ({
      ...prev,
      thinking,
      executionState: thinking ? "thinking" : prev.executionState,
    }));
  }, []);

  /**
   * Highlight an element
   */
  const highlightElement = useCallback((selector: string | null) => {
    setState((prev) => ({
      ...prev,
      highlightedElement: selector,
    }));
  }, []);

  /**
   * Clear action queue
   */
  const clearQueue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      actionQueue: [],
    }));
  }, []);

  /**
   * Stop execution
   */
  const stopExecution = useCallback((notify = true) => {
    executionAbortRef.current = true;
    executionPausedRef.current = false;

    // Reject any pending confirmation
    if (confirmationResolverRef.current) {
      confirmationResolverRef.current(false);
      confirmationResolverRef.current = null;
    }
    setConfirmationRequest(null);

    setState((prev) => ({
      ...prev,
      executionState: "stopped",
      isExecuting: false,
      canStop: false,
      currentAction: null,
      thinking: null,
      highlightedElement: null,
    }));

    // TODO: Notify AI that user stopped execution
    if (notify) {
      console.log("[Agent] Execution stopped by user");
    }
  }, []);

  /**
   * Pause execution
   */
  const pauseExecution = useCallback(() => {
    executionPausedRef.current = true;
    setState((prev) => ({
      ...prev,
      executionState: "paused",
    }));
  }, []);

  /**
   * Resume execution
   */
  const resumeExecution = useCallback(() => {
    executionPausedRef.current = false;
    setState((prev) => ({
      ...prev,
      executionState: "executing",
    }));
  }, []);

  /**
   * Handle confirmation response
   */
  const handleConfirmation = useCallback((confirmed: boolean) => {
    if (confirmationResolverRef.current) {
      confirmationResolverRef.current(confirmed);
      confirmationResolverRef.current = null;
    }
    setConfirmationRequest(null);
  }, []);

  /**
   * Request user confirmation for an action
   */
  const requestConfirmation = useCallback(async (action: AgentAction): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmationResolverRef.current = resolve;

      const isDestructive = action.crudAction === "delete";

      setConfirmationRequest({
        action,
        title: isDestructive ? "Confirmer la suppression" : "Confirmer l'action",
        description: `L'agent souhaite effectuer l'action suivante: ${action.label}`,
        confirmText: isDestructive ? "Supprimer" : "Confirmer",
        cancelText: "Annuler",
        isDestructive,
      });

      setState((prev) => ({
        ...prev,
        executionState: "waiting_confirm",
      }));
    });
  }, []);

  /**
   * Execute a single action
   */
  const executeAction = useCallback(async (action: AgentAction): Promise<AgentActionResult> => {
    // Check permissions
    if (!session?.featurePermissions) {
      return {
        success: false,
        action,
        error: "Permissions non disponibles",
      };
    }

    const permissionCheck = canAgentExecuteAction(action, session.featurePermissions);
    if (!permissionCheck.allowed) {
      return {
        success: false,
        action,
        error: permissionCheck.reason,
      };
    }

    // Check if confirmation is required
    if (actionRequiresConfirmation(action)) {
      const confirmed = await requestConfirmation(action);
      if (!confirmed) {
        return {
          success: false,
          action,
          error: "Action annulée par l'utilisateur",
        };
      }
    }

    // Update state
    setState((prev) => ({
      ...prev,
      currentAction: { ...action, status: "executing", startedAt: new Date() },
      executionState: "executing",
    }));

    try {
      // Execute based on action type
      switch (action.type) {
        // NOTE: No "navigate" case - agent must use "click" on sidebar links

        case "click": {
          const element = await findElement(action.target);
          if (element && element instanceof HTMLElement) {
            highlightElement(action.target);
            await new Promise((resolve) => setTimeout(resolve, 300));
            element.click();
            await new Promise((resolve) => setTimeout(resolve, 200));
            highlightElement(null);
          } else {
            throw new Error(`Élément non trouvé: ${action.target}`);
          }
          break;
        }

        case "fill_input": {
          const input = await findElement(action.target);
          if (input && (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
            highlightElement(action.target);
            await new Promise((resolve) => setTimeout(resolve, 200));
            input.focus();

            // Set value using React's native setter (required for controlled components)
            const value = String(action.params?.value ?? "");

            // Get the native value setter from the prototype
            const nativeInputValueSetter = input instanceof HTMLTextAreaElement
              ? Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
              : Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(input, value);
            } else {
              input.value = value;
            }

            // Dispatch input event - this is what React listens to
            const inputEvent = new Event("input", { bubbles: true, cancelable: true });
            input.dispatchEvent(inputEvent);

            // Also dispatch change event for good measure
            const changeEvent = new Event("change", { bubbles: true, cancelable: true });
            input.dispatchEvent(changeEvent);

            // Blur and refocus to trigger any blur-based validation
            input.blur();
            await new Promise((resolve) => setTimeout(resolve, 50));
            input.focus();

            await new Promise((resolve) => setTimeout(resolve, 100));
            highlightElement(null);
          } else {
            throw new Error(`Champ non trouvé: ${action.target}`);
          }
          break;
        }

        case "select_option": {
          const select = await findElement(action.target);
          if (select && select instanceof HTMLSelectElement) {
            highlightElement(action.target);
            await new Promise((resolve) => setTimeout(resolve, 200));

            const value = String(action.params?.value ?? "");

            // Use native setter for React controlled components
            const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
              HTMLSelectElement.prototype, 'value'
            )?.set;

            if (nativeSelectValueSetter) {
              nativeSelectValueSetter.call(select, value);
            } else {
              select.value = value;
            }

            // Dispatch change event
            const changeEvent = new Event("change", { bubbles: true, cancelable: true });
            select.dispatchEvent(changeEvent);

            await new Promise((resolve) => setTimeout(resolve, 100));
            highlightElement(null);
          } else {
            throw new Error(`Sélecteur non trouvé: ${action.target}`);
          }
          break;
        }

        case "toggle": {
          const toggle = await findElement(action.target);
          if (toggle && toggle instanceof HTMLInputElement) {
            highlightElement(action.target);
            await new Promise((resolve) => setTimeout(resolve, 200));

            toggle.checked = !toggle.checked;
            const changeEvent = new Event("change", { bubbles: true });
            toggle.dispatchEvent(changeEvent);

            await new Promise((resolve) => setTimeout(resolve, 100));
            highlightElement(null);
          } else if (toggle instanceof HTMLElement) {
            toggle.click();
          } else {
            throw new Error(`Toggle non trouvé: ${action.target}`);
          }
          break;
        }

        case "submit_form": {
          const form = await findElement(action.target);
          if (form && form instanceof HTMLFormElement) {
            highlightElement(action.target);
            await new Promise((resolve) => setTimeout(resolve, 300));
            form.requestSubmit();
            await new Promise((resolve) => setTimeout(resolve, 500));
            highlightElement(null);
          } else {
            // Try to find and click a submit button
            const submitBtn = await findElement(`${action.target} button[type="submit"]`) ||
              await findElement(`${action.target} input[type="submit"]`) ||
              await findElement('button[type="submit"]');
            if (submitBtn && submitBtn instanceof HTMLElement) {
              submitBtn.click();
            } else {
              throw new Error(`Formulaire non trouvé: ${action.target}`);
            }
          }
          break;
        }

        case "scroll": {
          const scrollTarget = await findElement(action.target);
          if (scrollTarget) {
            scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
          break;
        }

        case "wait": {
          const duration = Number(action.params?.duration) || 1000;
          await new Promise((resolve) => setTimeout(resolve, duration));
          break;
        }

        case "search": {
          const searchInput = await findElement(action.target);
          if (searchInput && (searchInput instanceof HTMLInputElement)) {
            highlightElement(action.target);
            searchInput.focus();
            const query = String(action.params?.query ?? "");
            searchInput.value = query;

            const inputEvent = new Event("input", { bubbles: true });
            searchInput.dispatchEvent(inputEvent);

            // Press Enter to submit search
            const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
            searchInput.dispatchEvent(enterEvent);

            await new Promise((resolve) => setTimeout(resolve, 300));
            highlightElement(null);
          }
          break;
        }

        default:
          console.warn(`[Agent] Unhandled action type: ${action.type}`);
      }

      // Mark action as completed
      const completedAction: AgentAction = {
        ...action,
        status: "completed",
        completedAt: new Date(),
      };

      setState((prev) => ({
        ...prev,
        currentAction: null,
        actionHistory: [...prev.actionHistory, completedAction],
      }));

      return { success: true, action: completedAction };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";

      const failedAction: AgentAction = {
        ...action,
        status: "failed",
        error: errorMessage,
        completedAt: new Date(),
      };

      setState((prev) => ({
        ...prev,
        currentAction: null,
        actionHistory: [...prev.actionHistory, failedAction],
        error: errorMessage,
      }));

      return { success: false, action: failedAction, error: errorMessage };
    }
  }, [session, highlightElement, requestConfirmation]);

  // Ref to track the latest action queue (for async access)
  const actionQueueRef = useRef<AgentAction[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    actionQueueRef.current = state.actionQueue;
  }, [state.actionQueue]);

  /**
   * Execute all queued actions
   */
  const executeActions = useCallback(async () => {
    // Use ref to get latest queue (state might be stale)
    const queue = [...actionQueueRef.current];

    console.log("[AgentContext] executeActions called:", {
      queueLength: queue.length,
      stateQueueLength: state.actionQueue.length,
      types: queue.map((a) => a.type),
    });

    if (queue.length === 0) {
      console.log("[AgentContext] No actions in queue, returning");
      return;
    }

    executionAbortRef.current = false;
    executionPausedRef.current = false;

    setState((prev) => ({
      ...prev,
      isExecuting: true,
      canStop: true,
      executionState: "executing",
      error: null,
    }));

    console.log("[AgentContext] Starting execution of", queue.length, "actions");

    for (let i = 0; i < queue.length; i++) {
      const action = queue[i];

      console.log(`[AgentContext] Executing action ${i + 1}/${queue.length}:`, {
        type: action.type,
        target: action.target,
        label: action.label,
      });

      // Check if aborted
      if (executionAbortRef.current) {
        console.log("[AgentContext] Execution aborted");
        break;
      }

      // Wait if paused
      while (executionPausedRef.current && !executionAbortRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (executionAbortRef.current) break;

      // Execute action
      const result = await executeAction(action);

      console.log(`[AgentContext] Action result:`, {
        success: result.success,
        error: result.error,
      });

      // Remove from queue
      setState((prev) => ({
        ...prev,
        actionQueue: prev.actionQueue.filter((a) => a.id !== action.id),
      }));

      // If action failed, stop execution
      if (!result.success) {
        console.log("[AgentContext] Action failed, stopping execution");
        break;
      }

      // Small delay between actions for UI to update
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log("[AgentContext] Execution loop completed");

    setState((prev) => ({
      ...prev,
      isExecuting: false,
      canStop: false,
      executionState: "idle",
    }));
  }, [state.actionQueue, executeAction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      executionAbortRef.current = true;
    };
  }, []);

  // Reset on location change (new page)
  useEffect(() => {
    highlightElement(null);
  }, [location.pathname, highlightElement]);

  const value: AgentContextValue = {
    state,
    setMode,
    queueActions,
    executeActions,
    stopExecution,
    pauseExecution,
    resumeExecution,
    clearQueue,
    setThinking,
    highlightElement,
    handleConfirmation,
    confirmationRequest,
    isAgentModeAvailable,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

/**
 * Hook to access agent context
 * Must be used within an AgentProvider
 */
export function useAgent(): AgentContextValue {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}

export default AgentContext;

