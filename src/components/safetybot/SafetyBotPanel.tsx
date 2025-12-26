/**
 * SafetyBot Panel Component
 * Sliding panel containing the chat interface with session management
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Trash2,
  Bot,
  Sparkles,
  Plus,
  History,
  ChevronDown,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ChatInterface from "./ChatInterface";
import ChatInput from "./ChatInput";
import type {
  SafetyBotMessage,
  QuickSuggestion,
  SuggestedAction,
} from "@/types/safetybot";
import type { AISessionSummary } from "@/services/ai/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface SafetyBotPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  messages: SafetyBotMessage[];
  suggestions: QuickSuggestion[];
  onClose: () => void;
  onSend: (message: string) => void;
  onClear: () => void;
  onActionClick?: (action: SuggestedAction) => void;
  // Session management
  currentSessionId?: string | null;
  sessions?: AISessionSummary[];
  isSessionsLoading?: boolean;
  onNewSession?: () => void;
  onSwitchSession?: (sessionId: string) => void;
  onArchiveSession?: () => void;
  onDeleteSession?: (sessionId: string) => void;
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
  // Session props
  currentSessionId,
  sessions = [],
  isSessionsLoading,
  onNewSession,
  onSwitchSession,
  onArchiveSession,
  onDeleteSession,
}: SafetyBotPanelProps) {
  const [showSessionMenu, setShowSessionMenu] = useState(false);

  // Find current session info
  const currentSession = sessions.find((s) => s.id === currentSessionId);

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
              {currentSession ? (
                <p className="text-xs text-white/80 truncate max-w-[180px]">
                  {currentSession.title}
                </p>
              ) : (
                <p className="text-xs text-white/80">Nouvelle conversation</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Session Menu */}
            {(onNewSession || onSwitchSession) && (
              <DropdownMenu
                open={showSessionMenu}
                onOpenChange={setShowSessionMenu}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/80 hover:text-white hover:bg-white/20"
                    title="Sessions"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {/* New Session */}
                  {onNewSession && (
                    <DropdownMenuItem
                      onClick={() => {
                        onNewSession();
                        setShowSessionMenu(false);
                      }}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Nouvelle conversation
                    </DropdownMenuItem>
                  )}

                  {sessions.length > 0 && <DropdownMenuSeparator />}

                  {/* Recent Sessions */}
                  <div className="max-h-64 overflow-y-auto">
                    {isSessionsLoading ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                        Chargement...
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                        Aucune conversation précédente
                      </div>
                    ) : (
                      sessions.slice(0, 10).map((session) => (
                        <DropdownMenuItem
                          key={session.id}
                          onClick={() => {
                            onSwitchSession?.(session.id);
                            setShowSessionMenu(false);
                          }}
                          className={cn(
                            "flex flex-col items-start gap-0.5 py-2",
                            session.id === currentSessionId &&
                              "bg-accent"
                          )}
                        >
                          <span className="text-sm font-medium truncate w-full">
                            {session.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.messageCount} messages •{" "}
                            {formatDistanceToNow(session.updatedAt, {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>

                  {/* Archive Current */}
                  {currentSessionId && onArchiveSession && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          onArchiveSession();
                          setShowSessionMenu(false);
                        }}
                        className="gap-2 text-amber-600"
                      >
                        <Archive className="h-4 w-4" />
                        Archiver cette conversation
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Clear Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="text-white/80 hover:text-white hover:bg-white/20"
              title="Effacer et recommencer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {/* Close Button */}
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
