/**
 * SafetyBot Hook
 * Provides SafetyBot functionality with context awareness
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSafetyBotService,
  isSafetyBotEnabled,
  createUserMessage,
  createAssistantMessage,
} from "@/services/safetyBotService";
import { getModuleByPath, getSuggestionsForPage } from "@/data/platformKnowledge";
import type {
  ConversationContext,
  SafetyBotState,
  QuickSuggestion,
} from "@/types/safetybot";

/**
 * Hook for SafetyBot context collection
 */
export function useSafetyBotContext(): ConversationContext {
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
    organizationId: session?.organizationId || userProfile?.organizationId || "",
    organizationName: "Organisation", // TODO: Fetch from organization service
    stats: {
      // TODO: These would be fetched from dashboard service
      activeIncidents: undefined,
      pendingCapas: undefined,
      overdueCapas: undefined,
      complianceScore: undefined,
      upcomingAudits: undefined,
      pendingVisits: undefined,
    },
  };
}

/**
 * Main SafetyBot hook
 */
export function useSafetyBot() {
  const context = useSafetyBotContext();
  const serviceRef = useRef(getSafetyBotService());
  const initializedRef = useRef(false);

  const [state, setState] = useState<SafetyBotState>({
    isOpen: false,
    isLoading: false,
    isStreaming: false,
    error: null,
    messages: [],
    conversationId: null,
  });

  // Initialize chat session when context changes
  useEffect(() => {
    if (context.organizationId && !initializedRef.current) {
      serviceRef.current.initializeChat(context);
      initializedRef.current = true;

      // Add greeting message
      const greeting = serviceRef.current.getGreeting();
      setState((prev) => ({
        ...prev,
        messages: [createAssistantMessage(greeting)],
      }));
    }
  }, [context]);

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
    }));

    // Create placeholder for assistant response
    const assistantMessage = createAssistantMessage("", { isStreaming: true });
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, assistantMessage],
    }));

    try {
      // Stream the response
      let fullContent = "";
      const response = await serviceRef.current.streamMessage(content, (chunk) => {
        fullContent += chunk;
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === assistantMessage.id ? { ...msg, content: fullContent } : msg
          ),
        }));
      });

      // Update final message with full response and metadata
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
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
    } catch (error) {
      console.error("SafetyBot error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
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
  }, []);

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(() => {
    serviceRef.current.clearHistory();
    const greeting = serviceRef.current.getGreeting();
    setState((prev) => ({
      ...prev,
      messages: [createAssistantMessage(greeting)],
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

  return {
    // State
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    error: state.error,
    messages: state.messages,
    isEnabled: isSafetyBotEnabled(),

    // Actions
    open,
    close,
    toggle,
    sendMessage,
    clearHistory,
    getSuggestions,

    // Context
    context,
  };
}

export default useSafetyBot;
