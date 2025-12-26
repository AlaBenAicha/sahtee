/**
 * Chat Input Component
 * Text input for sending messages to SafetyBot
 */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickSuggestion } from "@/types/safetybot";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  suggestions?: QuickSuggestion[];
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  isLoading = false,
  suggestions = [],
  placeholder = "Posez votre question...",
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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
      {/* Quick Suggestions */}
      {suggestions.length > 0 && !message && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-2">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border border-slate-200",
                  "bg-white hover:bg-slate-50 text-slate-700",
                  "transition-colors duration-150",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className={cn(
            "flex-1 resize-none min-h-[44px] max-h-[120px] py-3 px-4",
            "rounded-2xl border-slate-200",
            "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            "placeholder:text-slate-400"
          )}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isLoading}
          className={cn(
            "h-11 w-11 rounded-full flex-shrink-0",
            "bg-emerald-500 hover:bg-emerald-600 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>

      {/* Helper text */}
      <p className="text-[9px] text-slate-400/70 mt-1.5 text-center">
        Entrée pour envoyer · Maj+Entrée pour retour à la ligne
      </p>
    </div>
  );
}

export default ChatInput;
