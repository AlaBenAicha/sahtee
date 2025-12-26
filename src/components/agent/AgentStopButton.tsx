/**
 * Agent Stop Button
 * 
 * A floating button that allows users to stop the agent's execution.
 * Appears when the agent is actively executing actions.
 */

import { useEffect, useCallback } from "react";
import { Square, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAgent } from "@/contexts/AgentContext";

interface AgentStopButtonProps {
  /** Custom class names */
  className?: string;
  /** Position from bottom */
  bottomOffset?: number;
}

export function AgentStopButton({
  className,
  bottomOffset = 24,
}: AgentStopButtonProps) {
  const { state, stopExecution, pauseExecution, resumeExecution } = useAgent();

  // Determine if button should be visible
  const isVisible = state.mode === "agent" && (
    state.isExecuting ||
    state.executionState === "thinking" ||
    state.executionState === "executing" ||
    state.executionState === "paused"
  );

  const isPaused = state.executionState === "paused";

  // Handle stop
  const handleStop = useCallback(() => {
    stopExecution(true); // Notify AI that user stopped
  }, [stopExecution]);

  // Handle pause/resume
  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      resumeExecution();
    } else {
      pauseExecution();
    }
  }, [isPaused, pauseExecution, resumeExecution]);

  // Keyboard shortcut (Escape to stop)
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleStop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleStop]);

  if (!isVisible) {
    return null;
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-[9999]",
          "flex items-center gap-2 p-2 rounded-full",
          "bg-background/95 backdrop-blur-sm border shadow-lg",
          "animate-in fade-in slide-in-from-bottom-4 duration-300",
          className
        )}
        style={{ bottom: bottomOffset }}
      >
        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3">
          <div
            className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              state.executionState === "thinking" && "bg-blue-500",
              state.executionState === "executing" && "bg-green-500",
              state.executionState === "paused" && "bg-purple-500"
            )}
          />
          <span className="text-sm font-medium text-muted-foreground">
            {state.executionState === "thinking" && "Agent réfléchit..."}
            {state.executionState === "executing" && "Agent en action..."}
            {state.executionState === "paused" && "Agent en pause"}
          </span>
        </div>

        {/* Pause/Resume button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePauseResume}
              className="h-10 w-10 rounded-full"
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPaused ? "Reprendre" : "Mettre en pause"}
          </TooltipContent>
        </Tooltip>

        {/* Stop button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleStop}
              className="h-10 w-10 rounded-full"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <span>Arrêter l'agent</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Échap</kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/**
 * Compact version of the stop button for smaller spaces
 */
export function AgentStopButtonCompact({ className }: { className?: string }) {
  const { state, stopExecution } = useAgent();

  const isVisible = state.mode === "agent" && state.isExecuting;

  if (!isVisible) return null;

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => stopExecution(true)}
      className={cn("gap-2", className)}
    >
      <Square className="h-3 w-3 fill-current" />
      Arrêter
    </Button>
  );
}

export default AgentStopButton;

