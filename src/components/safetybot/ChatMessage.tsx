/**
 * Chat Message Component
 * Renders individual messages in the SafetyBot chat
 * Modern design with gradient bubbles and refined interactions
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SafetyBotMode } from "@/services/ai/types";
import type { SafetyBotMessage, SuggestedAction } from "@/types/safetybot";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Bot,
  ExternalLink,
  FileText,
  Loader2,
  User,
  Wand2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMessageProps {
  message: SafetyBotMessage;
  onActionClick?: (action: SuggestedAction) => void;
  mode?: SafetyBotMode;
}

export function ChatMessage({
  message,
  onActionClick,
  mode = "chat",
}: ChatMessageProps) {
  const navigate = useNavigate();
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;
  const isError = message.isError;

  const handleActionClick = (action: SuggestedAction) => {
    if (action.path) {
      navigate(action.path);
    }
    onActionClick?.(action);
  };

  // Format message content with markdown-like styling
  const formatContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("## ")) {
        return (
          <h3
            key={index}
            className="font-semibold text-slate-800 mt-3 mb-2 text-sm"
          >
            {line.replace("## ", "")}
          </h3>
        );
      }
      // Bold text
      if (line.includes("**")) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={index} className="mb-1">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-semibold text-slate-800">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      // List items
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li
            key={index}
            className="ml-3 mb-0.5 text-slate-600 flex items-start gap-1.5"
          >
            <span
              className={cn(
                "mt-2 w-1 h-1 rounded-full flex-shrink-0",
                mode === "agent" ? "bg-violet-400" : "bg-primary"
              )}
            />
            <span>{line.replace(/^[-•]\s/, "")}</span>
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        const number = line.match(/^(\d+)\./)?.[1];
        return (
          <li
            key={index}
            className="ml-3 mb-0.5 text-slate-600 flex items-start gap-2"
          >
            <span
              className={cn(
                "text-xs font-medium mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0",
                mode === "agent"
                  ? "bg-violet-100 text-violet-600"
                  : "bg-secondary text-primary"
              )}
            >
              {number}
            </span>
            <span>{line.replace(/^\d+\.\s/, "")}</span>
          </li>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }
      // Regular text
      return (
        <p key={index} className="mb-1 text-slate-600">
          {line}
        </p>
      );
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3 py-3 px-2",
        isUser ? "flex-row-reverse" : "flex-row",
        "items-start" // Align items to top
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm mt-0.5",
          isUser
            ? mode === "agent"
              ? "bg-gradient-to-br from-violet-500 to-purple-600"
              : "bg-gradient-to-br from-primary to-teal-600"
            : "bg-white border border-slate-200"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : mode === "agent" ? (
          <Wand2 className="h-4 w-4 text-violet-600" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? cn(
                "rounded-tr-md ml-auto",
                mode === "agent"
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                  : "bg-gradient-to-br from-primary to-teal-600 text-white"
              )
            : cn(
                "rounded-tl-md bg-white border mr-auto",
                mode === "agent"
                  ? "border-l-[3px] border-l-violet-400 border-t-slate-100 border-r-slate-100 border-b-slate-100"
                  : "border-l-[3px] border-l-primary border-t-slate-100 border-r-slate-100 border-b-slate-100"
              ),
          isError && "bg-red-50 border-l-red-400 border-red-200"
        )}
      >
        {/* Error indicator */}
        {isError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Une erreur est survenue</span>
          </div>
        )}

        {/* Message text */}
        <div
          className={cn(
            "text-sm leading-relaxed min-h-[1.25rem]",
            isUser ? "text-white" : "text-slate-700"
          )}
        >
          {isStreaming && !message.content ? (
            <div className="flex items-center gap-2 py-0.5">
              <div className="flex gap-1">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full animate-bounce",
                    mode === "agent" ? "bg-violet-400" : "bg-primary"
                  )}
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className={cn(
                    "w-2 h-2 rounded-full animate-bounce",
                    mode === "agent" ? "bg-violet-400" : "bg-primary"
                  )}
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className={cn(
                    "w-2 h-2 rounded-full animate-bounce",
                    mode === "agent" ? "bg-violet-400" : "bg-primary"
                  )}
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-slate-500 text-xs">
                Réflexion en cours...
              </span>
            </div>
          ) : message.content ? (
            <div className="space-y-0.5">{formatContent(message.content)}</div>
          ) : (
            <span className="text-slate-400 italic text-xs">Message vide</span>
          )}
        </div>

        {/* Streaming indicator */}
        {isStreaming && message.content && (
          <div className="flex items-center gap-1.5 mt-2">
            <Loader2
              className={cn(
                "h-3 w-3 animate-spin",
                mode === "agent" ? "text-violet-400" : "text-primary"
              )}
            />
            <span className="text-xs text-slate-400">En train d'écrire...</span>
          </div>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && !isStreaming && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Sources
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((source, index) => (
                <div
                  key={index}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs",
                    "bg-slate-50 border border-slate-200 text-slate-600",
                    "hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-default"
                  )}
                >
                  <FileText className="h-3 w-3 text-slate-400" />
                  <span className="font-medium">{source.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        {message.suggestedActions &&
          message.suggestedActions.length > 0 &&
          !isStreaming && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-2">
                {message.suggestedActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 text-xs font-medium rounded-lg gap-1.5",
                      "bg-white hover:shadow-sm transition-all",
                      mode === "agent"
                        ? "border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
                        : "border-secondary text-primary hover:bg-secondary hover:border-secondary"
                    )}
                    onClick={() => handleActionClick(action)}
                  >
                    {action.path ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ExternalLink className="h-3 w-3" />
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

        {/* Timestamp */}
        <div
          className={cn(
            "text-[10px] mt-2 text-right",
            isUser ? "text-white/60" : "text-slate-400"
          )}
        >
          {message.timestamp.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
