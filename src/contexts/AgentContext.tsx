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
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  canAgentExecuteAction,
  actionRequiresConfirmation,
  isPathBlocked,
} from "@/services/agent/agentPermissions";
import type {
  AgentState,
  AgentAction,
  AgentMode,
  AgentContextValue,
  AgentConfirmationRequest,
  AgentActionResult,
  AgentExecutionState,
} from "@/types/agent";
import { DEFAULT_AGENT_STATE, generateActionId } from "@/types/agent";

// Create context with undefined default
const AgentContext = createContext<AgentContextValue | undefined>(undefined);

interface AgentProviderProps {
  children: React.ReactNode;
}

/**
 * Agent Provider Component
 * Wraps the app and provides agent context
 */
export function AgentProvider({ children }: AgentProviderProps) {
  const navigate = useNavigate();
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
        case "navigate": {
          if (!isPathBlocked(action.target)) {
            navigate(action.target);
            // Wait for navigation to complete
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          break;
        }

        case "click": {
          const element = document.querySelector(action.target);
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
          const input = document.querySelector(action.target);
          if (input && (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
            highlightElement(action.target);
            await new Promise((resolve) => setTimeout(resolve, 200));
            input.focus();
            
            // Set value
            const value = String(action.params?.value ?? "");
            input.value = value;
            
            // Trigger input events for React
            const inputEvent = new Event("input", { bubbles: true });
            input.dispatchEvent(inputEvent);
            const changeEvent = new Event("change", { bubbles: true });
            input.dispatchEvent(changeEvent);
            
            await new Promise((resolve) => setTimeout(resolve, 100));
            highlightElement(null);
          } else {
            throw new Error(`Champ non trouvé: ${action.target}`);
          }
          break;
        }

        case "select_option": {
          const select = document.querySelector(action.target);
          if (select && select instanceof HTMLSelectElement) {
            highlightElement(action.target);
            await new Promise((resolve) => setTimeout(resolve, 200));
            
            const value = String(action.params?.value ?? "");
            select.value = value;
            
            const changeEvent = new Event("change", { bubbles: true });
            select.dispatchEvent(changeEvent);
            
            await new Promise((resolve) => setTimeout(resolve, 100));
            highlightElement(null);
          } else {
            throw new Error(`Sélecteur non trouvé: ${action.target}`);
          }
          break;
        }

        case "toggle": {
          const toggle = document.querySelector(action.target);
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
          const form = document.querySelector(action.target);
          if (form && form instanceof HTMLFormElement) {
            highlightElement(action.target);
            await new Promise((resolve) => setTimeout(resolve, 300));
            form.requestSubmit();
            await new Promise((resolve) => setTimeout(resolve, 500));
            highlightElement(null);
          } else {
            // Try to find and click a submit button
            const submitBtn = document.querySelector(`${action.target} button[type="submit"], ${action.target} input[type="submit"]`);
            if (submitBtn && submitBtn instanceof HTMLElement) {
              submitBtn.click();
            } else {
              throw new Error(`Formulaire non trouvé: ${action.target}`);
            }
          }
          break;
        }

        case "scroll": {
          const scrollTarget = document.querySelector(action.target);
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
          const searchInput = document.querySelector(action.target);
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
  }, [session, navigate, highlightElement, requestConfirmation]);

  /**
   * Execute all queued actions
   */
  const executeActions = useCallback(async () => {
    if (state.actionQueue.length === 0) return;
    
    executionAbortRef.current = false;
    executionPausedRef.current = false;

    setState((prev) => ({
      ...prev,
      isExecuting: true,
      canStop: true,
      executionState: "executing",
      error: null,
    }));

    const queue = [...state.actionQueue];
    
    for (const action of queue) {
      // Check if aborted
      if (executionAbortRef.current) {
        break;
      }

      // Wait if paused
      while (executionPausedRef.current && !executionAbortRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (executionAbortRef.current) break;

      // Execute action
      const result = await executeAction(action);
      
      // Remove from queue
      setState((prev) => ({
        ...prev,
        actionQueue: prev.actionQueue.filter((a) => a.id !== action.id),
      }));

      // If action failed, stop execution
      if (!result.success) {
        break;
      }

      // Small delay between actions
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

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

