/**
 * SafetyBot Panel Component
 * Sliding panel containing the chat interface with session management
 * Modern glassmorphism design with refined interactions
 */

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AISessionSummary, SafetyBotMode } from "@/services/ai/types";
import type {
  QuickSuggestion,
  SafetyBotMessage,
  SuggestedAction,
} from "@/types/safetybot";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Archive, Bot, History, Plus, Wand2, X } from "lucide-react";
import { useState } from "react";
import ChatInput from "./ChatInput";
import ChatInterface from "./ChatInterface";
import { ThinkingDisplay } from "./ThinkingDisplay";
import { AgentActionExecutor } from "./AgentActionExecutor";
import type { AgentAction } from "@/types/agent";

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
  // Agent mode
  mode?: SafetyBotMode;
  onModeChange?: (mode: SafetyBotMode) => void;
  thinking?: string;
  isThinking?: boolean;
  // Agent actions
  pendingActions?: AgentAction[];
  onClearPendingActions?: () => void;
}

export function SafetyBotPanel({
  isOpen,
  isLoading,
  messages,
  suggestions,
  onClose,
  onSend,
  onClear: _onClear, // Reserved for future use
  onActionClick,
  // Session props
  currentSessionId,
  sessions = [],
  isSessionsLoading,
  onNewSession,
  onSwitchSession,
  onArchiveSession,
  onDeleteSession: _onDeleteSession, // Reserved for future use
  // Agent mode props
  mode = "chat",
  onModeChange,
  thinking = "",
  isThinking = false,
  // Agent actions props
  pendingActions = [],
  onClearPendingActions,
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
          "w-[100vw] sm:w-[420px] lg:w-[440px] max-w-full",
          "bg-white",
          "shadow-2xl border-l border-slate-200",
          "flex flex-col",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header - Modern design */}
        <div className="relative px-4 py-4 border-b border-slate-200 bg-white">
          {/* Subtle gradient accent line at top */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1",
              mode === "agent"
                ? "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"
                : "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"
            )}
          />

          <div className="flex items-center justify-between gap-2">
            {/* Left: Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Icon */}
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                style={{
                  background:
                    mode === "agent"
                      ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                }}
              >
                {mode === "agent" ? (
                  <Wand2 className="h-5 w-5 text-white" />
                ) : (
                  <Bot className="h-5 w-5 text-white" />
                )}
              </div>

              {/* Title block */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900 text-base tracking-tight">
                    SafetyBot
                  </h2>
                  {mode === "agent" && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      Agent
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {currentSession
                    ? currentSession.title
                    : mode === "agent"
                    ? "Mode agent actif"
                    : "Nouvelle conversation"}
                </p>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={300}>
                {/* New Session Button */}
                {onNewSession && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNewSession}
                        className={cn(
                          "h-9 w-9 rounded-xl text-slate-500 transition-all duration-200",
                          mode === "agent"
                            ? "hover:text-violet-600 hover:bg-violet-50"
                            : "hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Nouvelle session</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Session History */}
                {onSwitchSession && sessions.length > 0 && (
                  <DropdownMenu
                    open={showSessionMenu}
                    onOpenChange={setShowSessionMenu}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-9 w-9 rounded-xl text-slate-500 transition-all duration-200",
                              mode === "agent"
                                ? "hover:text-violet-600 hover:bg-violet-50"
                                : "hover:text-emerald-600 hover:bg-emerald-50"
                            )}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Historique</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent
                      align="end"
                      className="w-72 shadow-xl border-slate-200"
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Sessions récentes
                        </p>
                      </div>

                      {/* Recent Sessions */}
                      <div className="max-h-64 overflow-y-auto py-1">
                        {isSessionsLoading ? (
                          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                              Chargement...
                            </div>
                          </div>
                        ) : sessions.length === 0 ? (
                          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                            Aucune conversation
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
                                "flex flex-col items-start gap-1 py-2.5 px-3 mx-1 rounded-lg cursor-pointer",
                                session.id === currentSessionId
                                  ? "bg-emerald-50 border border-emerald-200"
                                  : "hover:bg-slate-50"
                              )}
                            >
                              <span className="text-sm font-medium truncate w-full text-slate-800">
                                {session.title}
                              </span>
                              <span className="text-xs text-slate-500">
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
                            className="gap-2 text-amber-600 mx-1 rounded-lg"
                          >
                            <Archive className="h-4 w-4" />
                            Archiver cette conversation
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Close Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-9 w-9 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Fermer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Thinking Display (Agent Mode) */}
        {mode === "agent" && (thinking || isThinking) && (
          <div className="px-4 pt-3">
            <ThinkingDisplay thinking={thinking} isThinking={isThinking} />
          </div>
        )}

        {/* Agent Action Executor (Agent Mode) */}
        {mode === "agent" && onClearPendingActions && (
          <div className="px-4 pt-2">
            <AgentActionExecutor
              pendingActions={pendingActions}
              onActionsClear={onClearPendingActions}
              enabled={true}
            />
          </div>
        )}

        {/* Chat Area */}
        <ChatInterface
          messages={messages}
          onActionClick={onActionClick}
          className="flex-1"
          mode={mode}
        />

        {/* Input Area */}
        <ChatInput
          onSend={onSend}
          isLoading={isLoading}
          suggestions={suggestions}
          placeholder={
            mode === "agent"
              ? "Demandez à l'agent d'effectuer une action..."
              : "Posez une question sur la SST..."
          }
          mode={mode}
          onModeChange={onModeChange}
        />
      </div>
    </>
  );
}

export default SafetyBotPanel;
