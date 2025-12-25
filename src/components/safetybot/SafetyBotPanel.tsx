/**
 * SafetyBot Panel Component
 * Sliding panel containing the chat interface
 */

import { Button } from "@/components/ui/button";
import { X, Trash2, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatInterface from "./ChatInterface";
import ChatInput from "./ChatInput";
import type { SafetyBotMessage, QuickSuggestion, SuggestedAction } from "@/types/safetybot";

interface SafetyBotPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  messages: SafetyBotMessage[];
  suggestions: QuickSuggestion[];
  onClose: () => void;
  onSend: (message: string) => void;
  onClear: () => void;
  onActionClick?: (action: SuggestedAction) => void;
}

export function SafetyBotPanel({
  isOpen,
  isLoading,
  messages,
  suggestions,
  onClose,
  onSend,
  onClear,
  onActionClick,
}: SafetyBotPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50",
          "w-full sm:w-[400px] lg:w-[420px]",
          "bg-white shadow-2xl",
          "flex flex-col",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-emerald-500 to-emerald-600">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white flex items-center gap-1.5">
                SafetyBot
                <Sparkles className="h-4 w-4" />
              </h2>
              <p className="text-xs text-white/80">Assistant HSE intelligent</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="text-white/80 hover:text-white hover:bg-white/20"
              title="Effacer l'historique"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <ChatInterface
          messages={messages}
          onActionClick={onActionClick}
          className="flex-1"
        />

        {/* Input Area */}
        <ChatInput
          onSend={onSend}
          isLoading={isLoading}
          suggestions={suggestions}
          placeholder="Posez une question sur la SST..."
        />
      </div>
    </>
  );
}

export default SafetyBotPanel;
