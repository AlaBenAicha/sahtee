/**
 * Chat Message Component
 * Renders individual messages in the SafetyBot chat
 */

import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  User,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SafetyBotMessage, SuggestedAction } from "@/types/safetybot";

interface ChatMessageProps {
  message: SafetyBotMessage;
  onActionClick?: (action: SuggestedAction) => void;
}

export function ChatMessage({ message, onActionClick }: ChatMessageProps) {
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
    // Split by lines and process
    const lines = content.split("\n");
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="font-semibold text-slate-900 mt-3 mb-2">
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
                <strong key={i} className="font-semibold">
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
          <li key={index} className="ml-4 mb-0.5">
            {line.replace(/^[-•]\s/, "")}
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={index} className="ml-4 mb-0.5 list-decimal">
            {line.replace(/^\d+\.\s/, "")}
          </li>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <br key={index} />;
      }
      // Regular text
      return (
        <p key={index} className="mb-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn("h-8 w-8 flex-shrink-0", isUser ? "bg-emerald-500" : "bg-slate-100")}>
        <AvatarFallback className={cn(isUser ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600")}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          "flex-1 max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-emerald-500 text-white rounded-tr-sm"
            : "bg-slate-100 text-slate-900 rounded-tl-sm",
          isError && "bg-red-50 border border-red-200"
        )}
      >
        {/* Error indicator */}
        {isError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-2">
            <AlertCircle className="h-4 w-4" />
            <span>Erreur</span>
          </div>
        )}

        {/* Message text */}
        <div className={cn("text-sm leading-relaxed", isUser && "text-white")}>
          {isStreaming && !message.content ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Réflexion en cours...</span>
            </div>
          ) : (
            formatContent(message.content)
          )}
        </div>

        {/* Streaming indicator */}
        {isStreaming && message.content && (
          <div className="flex items-center gap-1 mt-2 text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" />
          </div>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && !isStreaming && (
          <div className="mt-3 pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Sources :</p>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((source, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-white"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {source.title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        {message.suggestedActions && message.suggestedActions.length > 0 && !isStreaming && (
          <div className="mt-3 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              {message.suggestedActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white hover:bg-slate-50"
                  onClick={() => handleActionClick(action)}
                >
                  {action.path && <ExternalLink className="h-3 w-3 mr-1" />}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={cn(
            "text-[10px] mt-2 opacity-60",
            isUser ? "text-right text-white" : "text-right text-slate-500"
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
