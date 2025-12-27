/**
 * SafetyBot Hook
 * Provides SafetyBot functionality with session persistence and context awareness
 * Supports both chat mode and agent mode
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSafetyBotService,
  isSafetyBotEnabled,
  createUserMessage,
  createAssistantMessage,
  type SafetyBotMessage,
} from "@/services/safetyBotService";
import type { AIContext, AISessionSummary, SafetyBotMode } from "@/services/ai/types";
import { getModuleByPath, getSuggestionsForPage } from "@/data/platformKnowledge";
import type { QuickSuggestion } from "@/types/safetybot";
import type { AgentAction } from "@/types/agent";

/**
 * SafetyBot state
 */
interface SafetyBotState {
  isOpen: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  isInitializing: boolean;
  error: string | null;
  messages: SafetyBotMessage[];
  currentSessionId: string | null;
  sessions: AISessionSummary[];
  isSessionsLoading: boolean;
  // Agent mode state
  mode: SafetyBotMode;
  thinking: string;
  isThinking: boolean;
  pendingActions: AgentAction[];
}

/**
 * Hook for SafetyBot context collection
 */
export function useSafetyBotContext(): AIContext {
  const { user, userProfile, session } = useAuth();
  const location = useLocation();

  // Determine current module from path
  const currentModule = getModuleByPath(location.pathname);

  return {
    currentPage: location.pathname,
    currentModule: currentModule?.id,
    userRole: session?.roleName || userProfile?.role || "user",
    userName: userProfile?.firstName
      ? `${userProfile.firstName} ${userProfile.lastName || ""}`
      : user?.email || "Utilisateur",
    userId: user?.uid || "",
    organizationId: session?.organizationId || userProfile?.organizationId || "",
    organizationName: userProfile?.organizationId || "Organisation",
  };
}

/**
 * Main SafetyBot hook with session support
 */
export function useSafetyBot() {
  const context = useSafetyBotContext();
  const serviceRef = useRef(getSafetyBotService());
  const initializedRef = useRef(false);

  const [state, setState] = useState<SafetyBotState>({
    isOpen: false,
    isLoading: false,
    isStreaming: false,
    isInitializing: true,
    error: null,
    messages: [],
    currentSessionId: null,
    sessions: [],
    isSessionsLoading: false,
    // Agent mode defaults
    mode: "chat",
    thinking: "",
    isThinking: false,
    pendingActions: [],
  });

  // Initialize SafetyBot when context is ready
  useEffect(() => {
    const initializeSafetyBot = async () => {
      if (!context.organizationId || !context.userId || initializedRef.current) {
        return;
      }

      try {
        await serviceRef.current.initialize(context);
        initializedRef.current = true;

        // Add greeting message
        const greeting = serviceRef.current.getGreeting();
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          messages: [createAssistantMessage(greeting)],
        }));

        // Load sessions in background
        loadSessions();
      } catch (error) {
        console.error("Failed to initialize SafetyBot:", error);
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          error: "Erreur d'initialisation de SafetyBot",
        }));
      }
    };

    initializeSafetyBot();
  }, [context.organizationId, context.userId]);

  // Update context when page changes
  useEffect(() => {
    if (initializedRef.current) {
      serviceRef.current.updateContext({
        currentPage: context.currentPage,
        currentModule: context.currentModule,
      });
    }
  }, [context.currentPage, context.currentModule]);

  /**
   * Load user's sessions
   */
  const loadSessions = useCallback(async () => {
    if (!context.userId || !context.organizationId) return;

    setState((prev) => ({ ...prev, isSessionsLoading: true }));

    try {
      const sessions = await serviceRef.current.getSessions();
      setState((prev) => ({
        ...prev,
        sessions,
        isSessionsLoading: false,
      }));
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setState((prev) => ({ ...prev, isSessionsLoading: false }));
    }
  }, [context.userId, context.organizationId]);

  /**
   * Create a new session
   */
  const createNewSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const sessionId = await serviceRef.current.createNewSession();
      const greeting = serviceRef.current.getGreeting();

      setState((prev) => ({
        ...prev,
        isLoading: false,
        currentSessionId: sessionId,
        messages: [createAssistantMessage(greeting)],
        error: null,
      }));

      // Refresh sessions list
      loadSessions();

      return sessionId;
    } catch (error) {
      console.error("Failed to create session:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Impossible de créer une nouvelle session",
      }));
      return null;
    }
  }, [loadSessions]);

  /**
   * Switch to a different session
   */
  const switchSession = useCallback(async (sessionId: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const session = await serviceRef.current.loadSession(sessionId);

      if (session) {
        // Convert session messages to SafetyBotMessage format
        const messages: SafetyBotMessage[] = session.messages.map((msg) => ({
          id: msg.id,
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
          timestamp:
            msg.timestamp instanceof Date
              ? msg.timestamp
              : (msg.timestamp as { toDate: () => Date }).toDate(),
          suggestedActions: msg.suggestedActions?.map((a) => ({
            type: a.type as SafetyBotMessage["suggestedActions"][number]["type"],
            label: a.label,
            path: a.path,
          })),
        }));

        setState((prev) => ({
          ...prev,
          isLoading: false,
          currentSessionId: sessionId,
          messages,
          error: null,
        }));
      }
    } catch (error) {
      console.error("Failed to switch session:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Impossible de charger la session",
      }));
    }
  }, []);

  /**
   * Archive current session and start new
   */
  const archiveCurrentSession = useCallback(async () => {
    try {
      await serviceRef.current.archiveCurrentSession();
      setState((prev) => ({
        ...prev,
        currentSessionId: null,
        messages: [createAssistantMessage(serviceRef.current.getGreeting())],
      }));
      loadSessions();
    } catch (error) {
      console.error("Failed to archive session:", error);
    }
  }, [loadSessions]);

  /**
   * Delete a session
   */
  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await serviceRef.current.deleteSession(sessionId);

        if (state.currentSessionId === sessionId) {
          setState((prev) => ({
            ...prev,
            currentSessionId: null,
            messages: [createAssistantMessage(serviceRef.current.getGreeting())],
          }));
        }

        loadSessions();
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    },
    [state.currentSessionId, loadSessions]
  );

  /**
   * Open SafetyBot panel
   */
  const open = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  /**
   * Close SafetyBot panel
   */
  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Toggle SafetyBot panel
   */
  const toggle = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  /**
   * Set SafetyBot mode (chat or agent)
   */
  const setMode = useCallback((mode: SafetyBotMode) => {
    serviceRef.current.setMode(mode);
    setState((prev) => ({
      ...prev,
      mode,
      thinking: "",
      isThinking: false,
      pendingActions: [],
    }));
  }, []);

  /**
   * Handle agent action from AI response
   */
  const handleAgentAction = useCallback((action: AgentAction) => {
    setState((prev) => ({
      ...prev,
      pendingActions: [...prev.pendingActions, action],
    }));
  }, []);

  /**
   * Clear pending actions
   */
  const clearPendingActions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pendingActions: [],
    }));
  }, []);

  /**
   * Send a message to SafetyBot
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage = createUserMessage(content);
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      isStreaming: true,
      error: null,
      thinking: "",
      isThinking: state.mode === "agent",
      pendingActions: [],
    }));

    // Create placeholder for assistant response
    const assistantMessage = createAssistantMessage("", { isStreaming: true });
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, assistantMessage],
    }));

    try {
      let fullContent = "";
      let fullThinking = "";
      const actions: AgentAction[] = [];

      // Use agent mode streaming if in agent mode
      if (state.mode === "agent") {
        const response = await serviceRef.current.streamAgentMessage(
          content,
          (chunk) => {
            fullContent += chunk;
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: fullContent }
                  : msg
              ),
            }));
          },
          // Thinking callback
          (thinkingChunk) => {
            fullThinking += thinkingChunk;
            setState((prev) => ({
              ...prev,
              thinking: fullThinking,
            }));
          },
          // Agent action callback
          (action) => {
            actions.push(action);
            setState((prev) => ({
              ...prev,
              pendingActions: [...prev.pendingActions, action],
            }));
          }
        );

        // Update current session ID if it was created
        const sessionId = serviceRef.current.getCurrentSessionId();

        // Update final message with full response and metadata
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
          isThinking: false,
          currentSessionId: sessionId,
          messages: prev.messages.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: response.content,
                  sources: response.sources,
                  suggestedActions: response.suggestedActions,
                  thinking: response.thinking,
                  agentActions: response.agentActions,
                  isStreaming: false,
                }
              : msg
          ),
        }));

        // Refresh sessions if new session was created
        if (sessionId && !state.currentSessionId) {
          loadSessions();
        }
      } else {
        // Standard chat mode streaming
        const response = await serviceRef.current.streamMessage(
          content,
          (chunk) => {
            fullContent += chunk;
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: fullContent }
                  : msg
              ),
            }));
          }
        );

        // Update current session ID if it was created
        const sessionId = serviceRef.current.getCurrentSessionId();

        // Update final message with full response and metadata
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
          currentSessionId: sessionId,
          messages: prev.messages.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: response.content,
                  sources: response.sources,
                  suggestedActions: response.suggestedActions,
                  isStreaming: false,
                }
              : msg
          ),
        }));

        // Refresh sessions if new session was created
        if (sessionId && !state.currentSessionId) {
          loadSessions();
        }
      }
    } catch (error) {
      console.error("SafetyBot error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        isThinking: false,
        error: "Une erreur s'est produite. Veuillez réessayer.",
        messages: prev.messages.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
                isStreaming: false,
                isError: true,
              }
            : msg
        ),
      }));
    }
  }, [state.currentSessionId, state.mode, loadSessions]);

  /**
   * Clear current chat (start fresh without saving)
   */
  const clearHistory = useCallback(() => {
    serviceRef.current.clearHistory();
    const greeting = serviceRef.current.getGreeting();
    setState((prev) => ({
      ...prev,
      messages: [createAssistantMessage(greeting)],
      currentSessionId: null,
      error: null,
    }));
  }, []);

  /**
   * Get quick suggestions for current page
   */
  const getSuggestions = useCallback((): QuickSuggestion[] => {
    const moduleId = context.currentModule || "default";
    return getSuggestionsForPage(moduleId);
  }, [context.currentModule]);

  /**
   * Get suggested questions from the service
   */
  const getSuggestedQuestions = useCallback((): string[] => {
    return serviceRef.current.getSuggestedQuestions();
  }, []);

  return {
    // State
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    isInitializing: state.isInitializing,
    error: state.error,
    messages: state.messages,
    isEnabled: isSafetyBotEnabled(),

    // Session state
    currentSessionId: state.currentSessionId,
    sessions: state.sessions,
    isSessionsLoading: state.isSessionsLoading,

    // Agent mode state
    mode: state.mode,
    thinking: state.thinking,
    isThinking: state.isThinking,
    pendingActions: state.pendingActions,

    // Panel actions
    open,
    close,
    toggle,

    // Message actions
    sendMessage,
    clearHistory,

    // Session actions
    createNewSession,
    switchSession,
    archiveCurrentSession,
    deleteSession,
    loadSessions,

    // Agent mode actions
    setMode,
    handleAgentAction,
    clearPendingActions,

    // Suggestions
    getSuggestions,
    getSuggestedQuestions,

    // Context
    context,
  };
}

export default useSafetyBot;
