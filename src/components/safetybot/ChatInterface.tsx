/**
 * Chat Interface Component
 * Main chat area with message history
 * Modern design with decorative empty state
 */

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SafetyBotMode } from "@/services/ai/types";
import type { SafetyBotMessage, SuggestedAction } from "@/types/safetybot";
import {
  ArrowRight,
  FileText,
  HelpCircle,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

interface ChatInterfaceProps {
  messages: SafetyBotMessage[];
  onActionClick?: (action: SuggestedAction) => void;
  className?: string;
  /** Current mode (chat or agent) */
  mode?: SafetyBotMode;
}

// Quick start action cards for the empty state
const chatQuickActions = [
  {
    icon: ShieldCheck,
    title: "Réglementation SST",
    description: "Questions sur les normes",
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Aide sur les procédures",
  },
  {
    icon: HelpCircle,
    title: "Conseils pratiques",
    description: "Meilleures pratiques",
  },
];

const agentQuickActions = [
  {
    icon: Navigation,
    title: "Navigation",
    description: "Aller vers une page",
  },
  {
    icon: FileText,
    title: "Créer",
    description: "Nouvelle CAPA, incident...",
  },
  {
    icon: Zap,
    title: "Actions rapides",
    description: "Filtrer, rechercher...",
  },
];

export function ChatInterface({
  messages,
  onActionClick,
  className,
  mode = "chat",
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const quickActions = mode === "agent" ? agentQuickActions : chatQuickActions;

  return (
    <ScrollArea className={cn("flex-1 min-h-0", className)} ref={scrollRef}>
      <div className="p-4">
        {/* Empty State */}
        {messages.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center min-h-[350px] py-8">
            {/* Decorative gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className={cn(
                  "absolute top-8 left-1/4 w-32 h-32 rounded-full blur-3xl opacity-20",
                  mode === "agent" ? "bg-violet-400" : "bg-emerald-400"
                )}
              />
              <div
                className={cn(
                  "absolute bottom-12 right-1/4 w-24 h-24 rounded-full blur-2xl opacity-15",
                  mode === "agent" ? "bg-purple-300" : "bg-teal-300"
                )}
              />
              <div
                className={cn(
                  "absolute top-1/2 right-8 w-16 h-16 rounded-full blur-xl opacity-10",
                  mode === "agent" ? "bg-indigo-400" : "bg-emerald-300"
                )}
              />
            </div>

            {/* Main content */}
            <div className="relative z-10 text-center">
              {/* Animated icon */}
              <div
                className={cn(
                  "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg",
                  "border-2 transition-all duration-300",
                  mode === "agent"
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 border-violet-300/50"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-300/50"
                )}
              >
                {mode === "agent" ? (
                  <Wand2 className="h-7 w-7 text-white drop-shadow-sm" />
                ) : (
                  <MessageCircle className="h-7 w-7 text-white drop-shadow-sm" />
                )}
                {/* Sparkle decorations */}
                <Sparkles
                  className={cn(
                    "absolute -top-2 -right-2 h-5 w-5",
                    mode === "agent" ? "text-violet-400" : "text-emerald-400"
                  )}
                />
              </div>

              {/* Title */}
              <h3
                className={cn(
                  "text-xl font-bold mb-2",
                  mode === "agent" ? "text-violet-900" : "text-emerald-900"
                )}
              >
                {mode === "agent" ? "Mode Agent activé" : "Bienvenue !"}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                {mode === "agent"
                  ? "Je peux effectuer des actions dans l'application pour vous. Dites-moi ce que vous voulez faire !"
                  : "Je suis votre assistant SST. Posez-moi vos questions sur la santé et sécurité au travail."}
              </p>

              {/* Quick action cards */}
              <div className="mt-6 grid grid-cols-3 gap-2 max-w-[340px] mx-auto">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-xl cursor-default",
                      "bg-white/80 backdrop-blur-sm border shadow-sm",
                      "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                      mode === "agent"
                        ? "border-violet-100 hover:border-violet-200"
                        : "border-emerald-100 hover:border-emerald-200"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                        mode === "agent"
                          ? "bg-violet-100 text-violet-600"
                          : "bg-emerald-100 text-emerald-600"
                      )}
                    >
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      {action.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 text-center leading-tight">
                      {action.description}
                    </span>
                  </div>
                ))}
              </div>

              {/* Example prompts */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-3">
                  {mode === "agent"
                    ? "Essayez par exemple :"
                    : "Questions populaires :"}
                </p>
                <div className="space-y-2">
                  {mode === "agent" ? (
                    <>
                      <ExamplePrompt
                        text="Va sur la page des incidents"
                        mode={mode}
                      />
                      <ExamplePrompt
                        text="Crée une nouvelle CAPA"
                        mode={mode}
                      />
                    </>
                  ) : (
                    <>
                      <ExamplePrompt
                        text="Quelles sont les obligations EPI ?"
                        mode={mode}
                      />
                      <ExamplePrompt
                        text="Comment déclarer un incident ?"
                        mode={mode}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Messages list with animation */
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
              >
                <ChatMessage
                  message={message}
                  onActionClick={onActionClick}
                  mode={mode}
                />
              </div>
            ))}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-px" />
      </div>
    </ScrollArea>
  );
}

/** Example prompt pill component */
function ExamplePrompt({ text, mode }: { text: string; mode: SafetyBotMode }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs",
        "border cursor-default transition-colors",
        mode === "agent"
          ? "bg-violet-50 border-violet-200 text-violet-700"
          : "bg-emerald-50 border-emerald-200 text-emerald-700"
      )}
    >
      <span>{text}</span>
      <ArrowRight className="h-3 w-3 opacity-50" />
    </div>
  );
}

export default ChatInterface;
