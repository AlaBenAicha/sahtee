/**
 * Agent Active Overlay
 * 
 * A Siri-style glowing border that appears around the main content
 * when the agent mode is active and executing actions.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAgent } from "@/contexts/AgentContext";

interface AgentActiveOverlayProps {
  /** Custom class names */
  className?: string;
  /** Whether to exclude the SafetyBot panel area */
  excludePanelSelector?: string;
}

/**
 * Get the overlay color based on execution state
 */
function getOverlayColors(state: string): { primary: string; secondary: string } {
  switch (state) {
    case "thinking":
      return { primary: "#3b82f6", secondary: "#60a5fa" }; // Blue
    case "executing":
      return { primary: "#10b981", secondary: "#34d399" }; // Green
    case "waiting_confirm":
      return { primary: "#f59e0b", secondary: "#fbbf24" }; // Amber
    case "paused":
      return { primary: "#8b5cf6", secondary: "#a78bfa" }; // Purple
    case "error":
      return { primary: "#ef4444", secondary: "#f87171" }; // Red
    default:
      return { primary: "#10b981", secondary: "#34d399" }; // Green default
  }
}

export function AgentActiveOverlay({
  className,
}: AgentActiveOverlayProps) {
  const { state } = useAgent();
  const [isVisible, setIsVisible] = useState(false);
  
  // Determine visibility
  useEffect(() => {
    const shouldBeVisible = state.mode === "agent" && (
      state.isExecuting ||
      state.executionState === "thinking" ||
      state.executionState === "executing" ||
      state.executionState === "waiting_confirm"
    );
    
    if (shouldBeVisible) {
      setIsVisible(true);
    } else {
      // Delay hiding for smooth transition
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [state.mode, state.isExecuting, state.executionState]);

  const colors = getOverlayColors(state.executionState);

  if (!isVisible && state.mode !== "agent") {
    return null;
  }

  return (
    <>
      {/* CSS for the overlay */}
      <style>{`
        @keyframes agent-glow-sweep {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes agent-pulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
        
        .agent-overlay-border {
          background: linear-gradient(
            90deg,
            ${colors.primary},
            ${colors.secondary},
            ${colors.primary},
            ${colors.secondary}
          );
          background-size: 300% 100%;
          animation: agent-glow-sweep 3s ease infinite, agent-pulse 2s ease-in-out infinite;
        }
        
        .agent-overlay-glow {
          box-shadow: 
            inset 0 0 30px ${colors.primary}40,
            inset 0 0 60px ${colors.primary}20;
        }
      `}</style>
      
      {/* Main overlay container */}
      <div
        className={cn(
          "fixed inset-0 pointer-events-none z-[9998] transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
          className
        )}
        aria-hidden="true"
      >
        {/* Top border */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 agent-overlay-border"
          style={{ 
            marginRight: "420px" // Exclude SafetyBot panel area
          }} 
        />
        
        {/* Bottom border */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 agent-overlay-border"
          style={{ 
            marginRight: "420px"
          }} 
        />
        
        {/* Left border */}
        <div 
          className="absolute top-0 bottom-0 left-0 w-1 agent-overlay-border"
        />
        
        {/* Right border (stops before SafetyBot panel) */}
        <div 
          className="absolute top-0 bottom-0 w-1 agent-overlay-border"
          style={{ 
            right: "420px" 
          }}
        />
        
        {/* Inner glow effect */}
        <div 
          className="absolute inset-0 agent-overlay-glow rounded-sm transition-all duration-500"
          style={{
            marginRight: "420px",
            border: `2px solid ${colors.primary}30`,
          }}
        />
        
        {/* Corner accents */}
        <div 
          className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg"
          style={{ borderColor: colors.primary }}
        />
        <div 
          className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg"
          style={{ borderColor: colors.primary }}
        />
      </div>
    </>
  );
}

/**
 * Minimal version of the overlay for use when the SafetyBot panel is closed
 */
export function AgentActiveOverlayMinimal() {
  const { state } = useAgent();
  
  const isActive = state.mode === "agent" && (
    state.isExecuting ||
    state.executionState === "thinking" ||
    state.executionState === "executing"
  );

  if (!isActive) return null;

  const colors = getOverlayColors(state.executionState);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9998]"
      aria-hidden="true"
    >
      <style>{`
        @keyframes agent-minimal-sweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      {/* All four borders */}
      <div 
        className="absolute inset-0 border-2 rounded-sm"
        style={{
          borderColor: colors.primary,
          boxShadow: `0 0 20px ${colors.primary}40`,
          animation: "agent-minimal-sweep 3s ease infinite",
        }}
      />
    </div>
  );
}

export default AgentActiveOverlay;

