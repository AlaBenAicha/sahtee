/**
 * Chat Interface Component
 * Main chat area with message history
 */

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import type { SafetyBotMessage, SuggestedAction } from "@/types/safetybot";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: SafetyBotMessage[];
  onActionClick?: (action: SuggestedAction) => void;
  className?: string;
}

export function ChatInterface({
  messages,
  onActionClick,
  className,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <ScrollArea className={cn("flex-1", className)} ref={scrollRef}>
      <div className="min-h-full flex flex-col">
        {/* Messages */}
        <div className="flex-1">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center text-slate-500">
                <p className="text-lg font-medium mb-2">Bienvenue !</p>
                <p className="text-sm">
                  Posez une question pour commencer la conversation.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-2">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onActionClick={onActionClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-px" />
      </div>
    </ScrollArea>
  );
}

export default ChatInterface;
