/**
 * Agent Action Executor
 *
 * Watches for pending actions from SafetyBot and executes them
 * via the AgentContext. Shows visual feedback during execution.
 */

import { useEffect, useRef, useCallback } from "react";
import { useAgent } from "@/contexts/AgentContext";
import { Loader2, Square, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgentAction } from "@/types/agent";
import { cn } from "@/lib/utils";

interface AgentActionExecutorProps {
  /** Pending actions to execute */
  pendingActions: AgentAction[];
  /** Callback when actions are cleared */
  onActionsClear: () => void;
  /** Whether execution is enabled */
  enabled?: boolean;
}

export function AgentActionExecutor({
  pendingActions,
  onActionsClear,
  enabled = true,
}: AgentActionExecutorProps) {
  const {
    state,
    queueActions,
    executeActions,
    stopExecution,
    isAgentModeAvailable,
  } = useAgent();

  // Track which action IDs have been queued (not executed yet, just added to queue)
  const queuedActionIdsRef = useRef<Set<string>>(new Set());
  // Track if we're currently in the middle of a batch execution
  const batchExecutingRef = useRef(false);
  // Store actions waiting for batch execution
  const pendingBatchRef = useRef<AgentAction[]>([]);
  // Debounce timer for batching
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Execute all pending batched actions
   */
  const executeBatch = useCallback(async () => {
    if (!enabled || !isAgentModeAvailable) {
      console.log("[AgentActionExecutor] Skipping batch execution - not enabled:", {
        enabled,
        isAgentModeAvailable,
      });
      return;
    }

    // If a batch is already executing, schedule a retry instead of skipping
    if (batchExecutingRef.current) {
      console.log("[AgentActionExecutor] Batch already executing, scheduling retry...");
      // Schedule retry after a delay
      setTimeout(() => {
        if (pendingBatchRef.current.length > 0) {
          console.log("[AgentActionExecutor] Retrying batch execution...");
          executeBatch();
        }
      }, 500);
      return;
    }

    const actionsToExecute = [...pendingBatchRef.current];
    if (actionsToExecute.length === 0) {
      console.log("[AgentActionExecutor] No actions to execute in batch");
      return;
    }

    batchExecutingRef.current = true;
    pendingBatchRef.current = [];

    console.log("[AgentActionExecutor] Starting batch execution:", {
      count: actionsToExecute.length,
      types: actionsToExecute.map((a) => a.type),
      targets: actionsToExecute.map((a) => a.target),
    });

    try {
      // Queue all actions at once
      queueActions(actionsToExecute);

      // Wait for state to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Execute all queued actions
      console.log("[AgentActionExecutor] Calling executeActions...");
      await executeActions();
      console.log("[AgentActionExecutor] Batch execution completed");
    } catch (error) {
      console.error("[AgentActionExecutor] Batch execution error:", error);
    } finally {
      batchExecutingRef.current = false;
      
      // Check if more actions were added during execution
      if (pendingBatchRef.current.length > 0) {
        console.log("[AgentActionExecutor] More actions pending after batch, executing...");
        // Use setTimeout to avoid stack overflow
        setTimeout(() => executeBatch(), 100);
      }
    }
  }, [enabled, isAgentModeAvailable, queueActions, executeActions]);

  /**
   * Add actions to pending batch and schedule execution
   */
  const addToBatch = useCallback(
    (actions: AgentAction[]) => {
      // Filter out already queued actions
      const newActions = actions.filter(
        (action) => !queuedActionIdsRef.current.has(action.id)
      );

      if (newActions.length === 0) {
        return;
      }

      // Mark as queued
      newActions.forEach((action) => {
        queuedActionIdsRef.current.add(action.id);
      });

      // Add to pending batch
      pendingBatchRef.current.push(...newActions);

      console.log("[AgentActionExecutor] Added to batch:", {
        newCount: newActions.length,
        batchSize: pendingBatchRef.current.length,
        types: newActions.map((a) => a.type),
      });

      // Clear existing timer
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }

      // Schedule batch execution after a short delay to allow more actions to queue
      // This is important because the AI sends actions one at a time via function calls
      batchTimerRef.current = setTimeout(() => {
        console.log("[AgentActionExecutor] Batch timer fired, executing...");
        executeBatch();
      }, 500); // Wait 500ms for more actions before executing
    },
    [executeBatch]
  );

  // Watch for new pending actions
  useEffect(() => {
    if (pendingActions.length > 0 && enabled) {
      addToBatch(pendingActions);
    }
  }, [pendingActions, enabled, addToBatch]);

  // Clear queued IDs when pending actions are cleared
  useEffect(() => {
    if (pendingActions.length === 0 && !state.isExecuting) {
      // Only clear if we're not executing
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    }
  }, [pendingActions.length, state.isExecuting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    };
  }, []);

  // Don't render if no actions and not executing
  if (
    pendingActions.length === 0 &&
    !state.isExecuting &&
    state.actionQueue.length === 0 &&
    pendingBatchRef.current.length === 0
  ) {
    return null;
  }

  const totalActions =
    pendingActions.length +
    state.actionQueue.length +
    pendingBatchRef.current.length;
  const completedActions = state.actionHistory.length;
  const hasError = !!state.error;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
        "bg-primary/10 border border-primary/20",
        hasError && "bg-red-500/10 border-red-500/20"
      )}
    >
      {/* Status icon */}
      {state.isExecuting ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : hasError ? (
        <XCircle className="h-4 w-4 text-red-500" />
      ) : state.executionState === "waiting_confirm" ? (
        <AlertCircle className="h-4 w-4 text-amber-500" />
      ) : completedActions > 0 ? (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ) : (
        <Loader2 className="h-4 w-4 text-muted-foreground" />
      )}

      {/* Status text */}
      <span className="flex-1 text-muted-foreground">
        {state.isExecuting ? (
          <>
            Exécution en cours...
            {state.currentAction && (
              <span className="ml-1 text-foreground">
                {state.currentAction.label || state.currentAction.description}
              </span>
            )}
          </>
        ) : hasError ? (
          <span className="text-red-500">{state.error}</span>
        ) : state.executionState === "waiting_confirm" ? (
          "En attente de confirmation..."
        ) : completedActions > 0 ? (
          `${completedActions} action${completedActions > 1 ? "s" : ""} effectuée${completedActions > 1 ? "s" : ""}`
        ) : totalActions > 0 ? (
          `${totalActions} action${totalActions > 1 ? "s" : ""} en attente`
        ) : (
          "Prêt"
        )}
      </span>

      {/* Stop button */}
      {state.canStop && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            stopExecution();
            onActionsClear();
            queuedActionIdsRef.current.clear();
            pendingBatchRef.current = [];
            if (batchTimerRef.current) {
              clearTimeout(batchTimerRef.current);
            }
          }}
          className="h-6 px-2 text-xs hover:bg-red-500/20 hover:text-red-500"
        >
          <Square className="h-3 w-3 mr-1" />
          Stop
        </Button>
      )}

      {/* Clear button when done */}
      {!state.isExecuting && (completedActions > 0 || hasError) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onActionsClear();
            queuedActionIdsRef.current.clear();
          }}
          className="h-6 px-2 text-xs"
        >
          Fermer
        </Button>
      )}
    </div>
  );
}

export default AgentActionExecutor;
