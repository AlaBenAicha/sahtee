/**
 * Chat Input Component
 * Text input for sending messages to SafetyBot
 * Modern design with mode toggle and refined interactions
 */

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SafetyBotMode } from "@/services/ai/types";
import type { QuickSuggestion } from "@/types/safetybot";
import {
  Lightbulb,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  suggestions?: QuickSuggestion[];
  placeholder?: string;
  className?: string;
  mode?: SafetyBotMode;
  onModeChange?: (mode: SafetyBotMode) => void;
}

export function ChatInput({
  onSend,
  isLoading = false,
  suggestions = [],
  placeholder = "Posez votre question...",
  className,
  mode = "chat",
  onModeChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: QuickSuggestion) => {
    onSend(suggestion.text);
  };

  return (
    <div className={cn("border-t border-slate-200 bg-white p-4", className)}>
      {/* Mode Toggle - Pill style segmented control */}
      {onModeChange && (
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onModeChange("chat")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                mode === "chat"
                  ? "bg-white text-primary shadow-sm border border-secondary"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
              {mode === "chat" && (
                <Sparkles className="h-3 w-3 text-primary" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onModeChange("agent")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                mode === "agent"
                  ? "bg-white text-violet-700 shadow-sm border border-violet-200"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Wand2 className="h-4 w-4" />
              <span>Agent</span>
              {mode === "agent" && (
                <Sparkles className="h-3 w-3 text-violet-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Suggestions - Card grid layout */}
      {suggestions.length > 0 && !message && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-slate-500">
              Suggestions
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.slice(0, 4).map((suggestion) => (
              <button
                type="button"
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className={cn(
                  "text-left px-3 py-2.5 rounded-xl text-xs",
                  "bg-white border border-slate-200 shadow-sm",
                  "hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                  mode === "agent"
                    ? "hover:border-violet-200 focus:border-violet-300"
                    : "hover:border-secondary focus:border-secondary"
                )}
              >
                <span className="text-slate-700 line-clamp-2 leading-relaxed">
                  {suggestion.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              "w-full resize-none !min-h-[44px] max-h-[120px] py-3 px-4",
              "rounded-xl border-slate-200 bg-slate-50",
              "text-sm",
              "transition-all duration-200",
              mode === "agent"
                ? "focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:bg-white"
                : "focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white",
              "placeholder:text-slate-400"
            )}
          />
        </div>

        {/* Send button with gradient */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={cn(
            "h-11 w-11 rounded-xl flex-shrink-0",
            "flex items-center justify-center",
            "shadow-md transition-all duration-200",
            "hover:scale-105 hover:shadow-lg",
            mode === "agent"
              ? "bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              : "bg-gradient-to-br from-primary to-teal-600 hover:from-primary hover:to-teal-700",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Send className="h-5 w-5 text-white" />
          )}
        </button>
      </form>

      {/* Helper text */}
      <p className="text-[10px] text-slate-400 mt-2 text-center">
        Entrée pour envoyer
      </p>
    </div>
  );
}

export default ChatInput;
