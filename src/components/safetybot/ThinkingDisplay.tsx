/**
 * Thinking Display Component
 * 
 * Shows the AI's thinking/reasoning process in the SafetyBot panel.
 * Displays streaming thought content with a distinctive visual style.
 */

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ThinkingDisplayProps {
  /** Current thinking content */
  thinking: string;
  /** Whether the AI is currently thinking */
  isThinking: boolean;
  /** Whether to show the thinking section expanded by default */
  defaultExpanded?: boolean;
  /** Custom class names */
  className?: string;
}

export function ThinkingDisplay({
  thinking,
  isThinking,
  defaultExpanded = true,
  className,
}: ThinkingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new content arrives
  useEffect(() => {
    if (isThinking && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [thinking, isThinking]);

  // Don't render if there's no thinking content and not currently thinking
  if (!thinking && !isThinking) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-all duration-300",
        "bg-gradient-to-br from-blue-500/5 to-purple-500/5",
        "border-blue-200/50 dark:border-blue-800/50",
        className
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-3",
          "hover:bg-blue-500/5 transition-colors",
          "text-left"
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-1.5 rounded-md",
              "bg-gradient-to-br from-blue-500 to-purple-500",
              isThinking && "animate-pulse"
            )}
          >
            <Brain className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-foreground">
            Raisonnement de l'agent
          </span>
          {isThinking && (
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />
              <span className="text-xs text-blue-600 dark:text-blue-400">
                En cours...
              </span>
            </div>
          )}
        </div>
        
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-60" : "max-h-0"
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            "px-3 pb-3 max-h-52 overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
          )}
        >
          {/* Thinking content with typewriter effect */}
          <div className="text-sm text-muted-foreground leading-relaxed">
            {thinking ? (
              <div className="space-y-2">
                {thinking.split("\n").map((line, index) => (
                  <p key={index} className="whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
            ) : isThinking ? (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <ThinkingAnimation />
                <span>L'agent analyse la situation...</span>
              </div>
            ) : null}
          </div>

          {/* Streaming indicator */}
          {isThinking && thinking && (
            <div className="mt-2 flex items-center gap-1">
              <ThinkingDots />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Animated thinking dots
 */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      <div 
        className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div 
        className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div 
        className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

/**
 * Animated brain icon for thinking state
 */
function ThinkingAnimation() {
  return (
    <div className="relative">
      <Brain className="h-4 w-4 text-blue-500" />
      <div className="absolute inset-0 animate-ping">
        <Brain className="h-4 w-4 text-blue-500 opacity-50" />
      </div>
    </div>
  );
}

/**
 * Compact thinking indicator for the message list
 */
export function ThinkingIndicator({ isThinking }: { isThinking: boolean }) {
  if (!isThinking) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ThinkingAnimation />
        <span>L'agent réfléchit...</span>
        <ThinkingDots />
      </div>
    </div>
  );
}

/**
 * Collapsible thinking section for a completed message
 */
export function ThinkingSection({ thinking }: { thinking: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!thinking) return null;

  // Truncate for preview
  const previewLength = 100;
  const shouldTruncate = thinking.length > previewLength;
  const preview = shouldTruncate
    ? thinking.substring(0, previewLength) + "..."
    : thinking;

  return (
    <div className="mt-2 rounded-md bg-blue-50/50 dark:bg-blue-950/30 p-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Brain className="h-3 w-3" />
        <span>Voir le raisonnement</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
          {thinking}
        </div>
      )}
    </div>
  );
}

export default ThinkingDisplay;

