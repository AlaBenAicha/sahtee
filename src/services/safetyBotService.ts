/**
 * SafetyBot Service
 *
 * Enhanced AI service with:
 * - Function calling (tools) for data access
 * - Session persistence in Firestore
 * - Streaming responses
 * - Context-aware prompts
 * - Agent mode with UI actions
 * - Thinking mode with reasoning display
 */

import {
  PLATFORM_MODULES,
  searchFAQs,
  searchModules,
} from "@/data/platformKnowledge";
import {
  buildSafetyBotPrompt,
  getSafetyBotGreeting,
  getSuggestedQuestions,
  SAFETYBOT_QUICK_RESPONSES,
} from "@/prompts/safetyBot";
import { GeminiClient, isGeminiEnabled } from "@/services/ai/geminiClient";
import {
  addMessageToSession,
  archiveSession,
  createSession,
  deleteSession,
  getSession,
  getUserSessions,
} from "@/services/ai/sessionService";
import { getToolsForBot } from "@/services/ai/tools";
import type {
  AgentActionRequest,
  AIContext,
  AIMessage,
  AISession,
  AISessionSummary,
  SafetyBotMode,
  ThinkingCallback,
} from "@/services/ai/types";
import type { AgentAction } from "@/types/agent";
import { createAction } from "@/types/agent";
import type { MessageSource, SuggestedAction } from "@/types/safetybot";

export type { MessageSource, SuggestedAction };

/**
 * Response from SafetyBot
 */
export interface SafetyBotResponse {
  content: string;
  suggestedActions?: SuggestedAction[];
  sources?: MessageSource[];
  confidence: number;
  /** Thinking content from AI (for agent mode) */
  thinking?: string;
  /** Agent actions to execute (for agent mode) */
  agentActions?: AgentAction[];
}

/**
 * SafetyBot message type
 */
export interface SafetyBotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedActions?: SuggestedAction[];
  sources?: MessageSource[];
  isStreaming?: boolean;
  isError?: boolean;
  /** Thinking content (for agent mode) */
  thinking?: string;
  /** Agent actions (for agent mode) */
  agentActions?: AgentAction[];
}

/**
 * Check if SafetyBot is enabled
 */
export function isSafetyBotEnabled(): boolean {
  return isGeminiEnabled() && import.meta.env.VITE_ENABLE_SAFETYBOT !== "false";
}

/**
 * SafetyBot Service Class
 */
export class SafetyBotService {
  private client: GeminiClient;
  private context: AIContext | null = null;
  private currentSessionId: string | null = null;
  private isInitialized: boolean = false;
  private mode: SafetyBotMode = "chat";
  private executionStopped: boolean = false;

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Initialize SafetyBot with user context
   */
  async initialize(context: AIContext, sessionId?: string): Promise<void> {
    this.context = context;

    // Get tools for SafetyBot (mode will be updated when switching)
    const tools = getToolsForBot("safetybot", this.mode);

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(context);

    // Initialize Gemini client with thinking support for agent mode
    this.client.initialize({
      botType: "safetybot",
      context,
      tools,
      systemPrompt,
      modelType: this.mode === "agent" ? "flashThinking" : "flash",
      enableThinking: this.mode === "agent",
    });

    // Load or create session
    if (sessionId) {
      await this.loadSession(sessionId);
    } else {
      // Start with empty chat
      this.client.startChat([]);
      this.currentSessionId = null;
    }

    this.isInitialized = true;
  }

  /**
   * Set the current mode (chat or agent)
   */
  setMode(mode: SafetyBotMode): void {
    if (this.mode === mode) return;

    this.mode = mode;
    this.client.setMode(mode);
    this.client.setThinkingEnabled(mode === "agent");

    // Reinitialize with appropriate tools
    if (this.context) {
      const tools = getToolsForBot("safetybot", mode);
      const systemPrompt = this.buildSystemPrompt(this.context);

      this.client.initialize({
        botType: "safetybot",
        context: this.context,
        tools,
        systemPrompt,
        modelType: mode === "agent" ? "flashThinking" : "flash",
        enableThinking: mode === "agent",
      });

      // Start fresh chat (this will also start thinking chat if in agent mode)
      this.client.startChat([]);
    }
  }

  /**
   * Get current mode
   */
  getMode(): SafetyBotMode {
    return this.mode;
  }

  /**
   * Notify that execution was stopped by user
   */
  notifyExecutionStopped(): void {
    this.executionStopped = true;
  }

  /**
   * Reset execution stopped flag
   */
  resetExecutionStopped(): void {
    this.executionStopped = false;
  }

  /**
   * Build system prompt based on mode
   */
  private buildSystemPrompt(context: AIContext): string {
    const basePrompt = buildSafetyBotPrompt(context);

    if (this.mode === "agent") {
      return `${basePrompt}

## Mode Agent

Tu es maintenant en MODE AGENT. En plus de répondre aux questions, tu peux effectuer des actions dans l'application.

### RÈGLE CRITIQUE : Agir comme un utilisateur humain
Tu dois TOUJOURS interagir avec l'interface comme le ferait un utilisateur humain :
1. **CLIQUE sur les liens de la barre latérale** pour naviguer (utilise navigate_to_page)
2. **CLIQUE sur les boutons** pour ouvrir les formulaires (ex: "Déclarer un incident", "Nouvelle CAPA")
3. **NE JAMAIS utiliser d'URL directes** - pas de paramètres comme "?action=new"
4. **NE JAMAIS naviguer programmatiquement** - toujours cliquer sur des éléments visibles
5. L'utilisateur doit pouvoir suivre visuellement chaque action que tu effectues
6. Chaque navigation se fait en CLIQUANT sur un lien dans le menu latéral

### FORMULAIRE D'INCIDENT - Wizard Multi-étapes IMPORTANT
Le formulaire de création d'incident est un assistant multi-étapes avec 4 onglets. TU DOIS PASSER PAR TOUTES LES ÉTAPES.

**Étape 1 - Type d'incident :**
- Utilise select_incident_type pour choisir : accident, near_miss, unsafe_condition, unsafe_act
- Utilise select_severity_level pour choisir : minor, moderate, severe, critical
- Utilise incident_wizard_navigation (direction: "next") pour passer à l'étape suivante

**Étape 2 - Lieu et moment :**
- Utilise fill_incident_location pour saisir le lieu
- Utilise fill_incident_datetime pour la date (format YYYY-MM-DD)
- Utilise fill_incident_time pour l'heure (format HH:MM)
- Utilise incident_wizard_navigation (direction: "next") pour continuer

**Étape 3 - Description :**
- Utilise fill_incident_description pour décrire ce qui s'est passé (MINIMUM 10 caractères)
- Utilise fill_immediate_actions pour les actions immédiates (optionnel mais recommandé)
- Utilise incident_wizard_navigation (direction: "next") pour ALLER À L'ÉTAPE 4

**Étape 4 - Déclarant (OBLIGATOIRE avant soumission) :**
- Utilise fill_reporter_name pour saisir le nom du déclarant (minimum 2 caractères)
- OU utilise set_anonymous_reporting(anonymous: true) pour un signalement anonyme
- **OBLIGATOIRE** : Tu DOIS appeler submit_incident_form pour soumettre

### RÈGLE CRITIQUE : TOUJOURS APPELER submit_incident_form
- Tu DOIS OBLIGATOIREMENT appeler submit_incident_form après fill_reporter_name
- NE JAMAIS dire "l'incident a été créé/soumis" SANS avoir appelé submit_incident_form
- Si tu n'appelles pas submit_incident_form, le formulaire NE SERA PAS soumis
- L'étape fill_reporter_name NE SOUMET PAS le formulaire - elle remplit juste le champ nom
- La séquence DOIT être : fill_reporter_name → submit_incident_form (les deux sont obligatoires)

### Séquence d'actions COMPLÈTE pour créer un incident :
1. navigate_to_page(page: "incidents") - aller sur la page Incidents
2. wait(duration: 500) - attendre le chargement
3. create_incident - cliquer sur "Déclarer un incident"
4. wait(duration: 500) - attendre l'ouverture du modal
5. select_incident_type(type: "near_miss") - choisir le type
6. select_severity_level(severity: "moderate") - choisir la gravité
7. incident_wizard_navigation(direction: "next") - aller à l'étape 2
8. wait(duration: 300) - attendre la transition
9. fill_incident_location(location: "Zone de production") - saisir le lieu
10. fill_incident_datetime(date: "2024-12-26") - saisir la date
11. fill_incident_time(time: "14:30") - saisir l'heure
12. incident_wizard_navigation(direction: "next") - aller à l'étape 3
13. wait(duration: 300) - attendre la transition
14. fill_incident_description(description: "Un incident s'est produit...") - minimum 10 caractères
15. fill_immediate_actions(actions: "Premiers secours administrés") - optionnel
16. incident_wizard_navigation(direction: "next") - aller à l'étape 4 (OBLIGATOIRE)
17. wait(duration: 300) - attendre la transition
18. fill_reporter_name(name: "Jean Dupont") - saisir le nom (NE SOUMET PAS)
19. submit_incident_form - **OBLIGATOIRE** - cliquer sur "Signaler l'incident" pour SOUMETTRE

**ATTENTION** : L'étape 19 est OBLIGATOIRE. Sans submit_incident_form, l'incident N'EST PAS créé !

### NE PAS utiliser ces outils génériques pour les incidents :
- NE PAS utiliser fill_form_field - utilise les outils spécifiques (fill_incident_location, etc.)
- NE PAS utiliser select_option - utilise select_incident_type ou select_severity_level
- NE PAS utiliser submit_form - utilise submit_incident_form

### Capacités d'action
- Naviguer en cliquant sur les liens de la barre latérale
- Créer des incidents et des CAPA en utilisant les outils dédiés
- Remplir des formulaires avec les outils spécifiques à chaque module
- Appliquer des filtres et effectuer des recherches
- Cliquer sur des boutons et interagir avec l'interface

### Restrictions importantes
- Tu ne peux PAS accéder au profil utilisateur (/app/profile)
- Tu ne peux PAS accéder aux paramètres (/app/settings)
- Tu ne peux PAS déconnecter l'utilisateur
- Tu dois respecter les permissions de l'utilisateur
- Tu ne dois JAMAIS utiliser d'URL directes ou de navigation programmatique
- Tu dois TOUJOURS cliquer sur des éléments visibles (liens, boutons, onglets)
- NE JAMAIS générer d'action de type "navigate" avec une URL - utilise toujours "click" sur un lien

### Processus de réflexion
Avant chaque action, explique ton raisonnement :
1. Comprendre la demande de l'utilisateur
2. Vérifier sur quelle page l'utilisateur se trouve actuellement
3. Naviguer vers la bonne page si nécessaire (en cliquant sur le lien)
4. Identifier les boutons/éléments à cliquer
5. Exécuter les actions dans l'ordre approprié

### Communication
- Décris ce que tu vas faire AVANT de le faire
- NE DIS PAS que l'action est terminée tant que le formulaire n'est pas vraiment soumis
- Si l'utilisateur arrête l'exécution, confirme l'arrêt et propose de l'aide
- En cas d'erreur, explique le problème et propose des alternatives`;
    }

    return basePrompt;
  }

  /**
   * Update context (e.g., when user navigates)
   */
  updateContext(context: Partial<AIContext>): void {
    if (this.context) {
      this.context = { ...this.context, ...context };
      this.client.updateContext(context);
    }
  }

  /**
   * Create a new session
   */
  async createNewSession(): Promise<string> {
    if (!this.context) {
      throw new Error("SafetyBot not initialized");
    }

    // Create greeting message
    const greeting = this.getGreeting();
    const greetingMessage: AIMessage = {
      id: generateMessageId(),
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    };

    // Create session in Firestore
    const session = await createSession(
      this.context.userId,
      this.context.organizationId,
      "safetybot",
      this.context,
      greetingMessage
    );

    this.currentSessionId = session.id;

    // Start fresh chat
    this.client.startChat([]);

    return session.id;
  }

  /**
   * Load an existing session
   */
  async loadSession(sessionId: string): Promise<AISession | null> {
    const session = await getSession(sessionId);

    if (!session) {
      return null;
    }

    // Verify access
    if (
      this.context &&
      (session.userId !== this.context.userId ||
        session.organizationId !== this.context.organizationId)
    ) {
      throw new Error("Access denied to session");
    }

    this.currentSessionId = sessionId;

    // Load chat history into Gemini
    this.client.startChat(session.messages);

    return session;
  }

  /**
   * Get user's sessions
   */
  async getSessions(includeArchived = false): Promise<AISessionSummary[]> {
    if (!this.context) {
      return [];
    }

    return getUserSessions(this.context.userId, this.context.organizationId, {
      botType: "safetybot",
      includeArchived,
    });
  }

  /**
   * Archive current session
   */
  async archiveCurrentSession(): Promise<void> {
    if (this.currentSessionId) {
      await archiveSession(this.currentSessionId);
      this.currentSessionId = null;
      this.client.startChat([]);
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await deleteSession(sessionId);
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
      this.client.startChat([]);
    }
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(message: string): Promise<SafetyBotResponse> {
    if (!this.isInitialized || !this.context) {
      return this.getOfflineResponse(message);
    }

    // Check local knowledge first for quick responses
    const localResponse = this.checkLocalKnowledge(message);
    if (localResponse) {
      await this.saveMessage(message, localResponse.content);
      return localResponse;
    }

    try {
      // Create session if needed
      if (!this.currentSessionId) {
        await this.createNewSession();
      }

      // Send to Gemini with tools
      const response = await this.client.sendMessage(message, true);

      // Save to session
      await this.saveMessage(message, response.content);

      // Extract suggested actions and sources
      const suggestedActions = this.extractSuggestedActions(
        response.content,
        message
      );
      const sources = this.extractSources(response.content);

      return {
        content: response.content,
        suggestedActions,
        sources,
        confidence: response.confidence || 0.85,
      };
    } catch (error) {
      console.error("SafetyBot API error:", error);
      return {
        content: SAFETYBOT_QUICK_RESPONSES.error,
        confidence: 0,
      };
    }
  }

  /**
   * Send a message with streaming response
   */
  async streamMessage(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<SafetyBotResponse> {
    if (!this.isInitialized || !this.context) {
      const offlineResponse = this.getOfflineResponse(message);
      onChunk(offlineResponse.content);
      return offlineResponse;
    }

    // Check local knowledge first
    const localResponse = this.checkLocalKnowledge(message);
    if (localResponse) {
      onChunk(localResponse.content);
      await this.saveMessage(message, localResponse.content);
      return localResponse;
    }

    try {
      // Create session if needed
      if (!this.currentSessionId) {
        await this.createNewSession();
      }

      // Stream from Gemini with tools
      const response = await this.client.streamMessage(message, onChunk, true);

      // Save to session
      await this.saveMessage(message, response.content);

      const suggestedActions = this.extractSuggestedActions(
        response.content,
        message
      );
      const sources = this.extractSources(response.content);

      return {
        content: response.content,
        suggestedActions,
        sources,
        confidence: response.confidence || 0.85,
      };
    } catch (error) {
      console.error("SafetyBot streaming error:", error);
      const errorMsg = SAFETYBOT_QUICK_RESPONSES.error;
      onChunk(errorMsg);
      return { content: errorMsg, confidence: 0 };
    }
  }

  /**
   * Send a message in agent mode with thinking and action support
   */
  async streamAgentMessage(
    message: string,
    onChunk: (chunk: string) => void,
    onThinking?: ThinkingCallback,
    onAgentAction?: (action: AgentAction) => void
  ): Promise<SafetyBotResponse> {
    console.log("[SafetyBotService] streamAgentMessage called", {
      messageLength: message.length,
      messagePreview: message.substring(0, 100),
      isInitialized: this.isInitialized,
      hasContext: !!this.context,
      hasOnThinking: !!onThinking,
      hasOnAgentAction: !!onAgentAction,
    });

    if (!this.isInitialized || !this.context) {
      console.warn(
        "[SafetyBotService] Not initialized or no context, returning offline response"
      );
      const offlineResponse = this.getOfflineResponse(message);
      onChunk(offlineResponse.content);
      return offlineResponse;
    }

    // Reset execution stopped flag
    this.resetExecutionStopped();

    try {
      // Create session if needed
      if (!this.currentSessionId) {
        console.log("[SafetyBotService] Creating new session...");
        await this.createNewSession();
      }

      // Collect thinking and actions
      let fullThinking = "";
      const agentActions: AgentAction[] = [];

      console.log(
        "[SafetyBotService] Calling client.streamMessageWithThinking..."
      );

      // Stream with thinking support
      const response = await this.client.streamMessageWithThinking(
        message,
        onChunk,
        {
          executeTools: true,
          onThinking: (chunk) => {
            fullThinking += chunk;
            onThinking?.(chunk);
          },
          onAgentAction: (actionRequest: AgentActionRequest) => {
            // Check if execution was stopped
            if (this.executionStopped) {
              return;
            }

            // Convert AgentActionRequest to AgentAction
            const action = this.convertActionRequestToAction(actionRequest);
            agentActions.push(action);
            onAgentAction?.(action);
          },
        }
      );

      console.log("[SafetyBotService] streamMessageWithThinking completed", {
        contentLength: response.content?.length || 0,
        hasThinking: !!response.thinking,
        hasFunctionCalls: !!response.functionCalls,
        functionCallCount: response.functionCalls?.length || 0,
        agentActionsCount: agentActions.length,
      });

      // Save to session
      await this.saveMessage(message, response.content);

      const suggestedActions = this.extractSuggestedActions(
        response.content,
        message
      );
      const sources = this.extractSources(response.content);

      return {
        content: response.content,
        suggestedActions,
        sources,
        confidence: response.confidence || 0.85,
        thinking: fullThinking || response.thinking,
        agentActions: agentActions.length > 0 ? agentActions : undefined,
      };
    } catch (error) {
      console.error("[SafetyBotService] Agent streaming error:", error);
      console.error("[SafetyBotService] Error details:", {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      const errorMsg = SAFETYBOT_QUICK_RESPONSES.error;
      onChunk(errorMsg);
      return { content: errorMsg, confidence: 0 };
    }
  }

  /**
   * Convert an AgentActionRequest to an AgentAction
   */
  private convertActionRequestToAction(
    request: AgentActionRequest
  ): AgentAction {
    return createAction(
      request.type as any,
      request.target,
      request.description,
      {
        params: request.params,
        requiresConfirmation: request.requiresConfirmation ?? false,
      }
    );
  }

  /**
   * Get greeting message
   */
  getGreeting(): string {
    if (this.context) {
      return getSafetyBotGreeting(this.context);
    }
    return SAFETYBOT_QUICK_RESPONSES.greeting({
      organizationId: "",
      userId: "",
      userRole: "",
      userName: "",
    });
  }

  /**
   * Get suggested questions based on context
   */
  getSuggestedQuestions(): string[] {
    if (this.context) {
      return getSuggestedQuestions(this.context);
    }
    return [
      "Quelle est la situation SST globale ?",
      "Y a-t-il des actions urgentes ?",
    ];
  }

  /**
   * Clear chat history (in-memory only)
   */
  clearHistory(): void {
    this.client.startChat([]);
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Save messages to session
   */
  private async saveMessage(
    userMessage: string,
    assistantResponse: string
  ): Promise<void> {
    if (!this.currentSessionId) return;

    // Save user message
    await addMessageToSession(this.currentSessionId, {
      id: generateMessageId(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    });

    // Save assistant response
    await addMessageToSession(this.currentSessionId, {
      id: generateMessageId(),
      role: "assistant",
      content: assistantResponse,
      timestamp: new Date(),
    });
  }

  /**
   * Check local knowledge base for quick answers
   */
  private checkLocalKnowledge(message: string): SafetyBotResponse | null {
    const lowerMessage = message.toLowerCase();

    // Check for navigation questions
    if (
      lowerMessage.includes("comment") &&
      (lowerMessage.includes("aller") ||
        lowerMessage.includes("trouver") ||
        lowerMessage.includes("accéder"))
    ) {
      const modules = searchModules(message);
      if (modules.length > 0) {
        const module = modules[0];
        return {
          content: `Pour accéder à **${module.nameFr}** :\n\n1. Cliquez sur "${module.nameFr
            }" dans le menu latéral\n2. Ou utilisez le lien direct\n\n**Description** : ${module.description
            }\n\n**Fonctionnalités** :\n${module.features
              .map((f) => `- ${f}`)
              .join("\n")}`,
          suggestedActions: [
            {
              type: "navigate",
              label: `Aller vers ${module.nameFr}`,
              path: module.path,
            },
          ],
          confidence: 0.95,
        };
      }
    }

    // Check FAQs
    const matchingFAQs = searchFAQs(message);
    if (matchingFAQs.length > 0) {
      const faq = matchingFAQs[0];
      const actions: SuggestedAction[] = faq.relatedModule
        ? [
          {
            type: "navigate",
            label: `Voir ${faq.relatedModule}`,
            path: `/app/${faq.relatedModule}`,
          },
        ]
        : [];

      return {
        content: `**${faq.question}**\n\n${faq.answer}`,
        suggestedActions: actions,
        confidence: 0.9,
      };
    }

    return null;
  }

  /**
   * Get offline response
   */
  private getOfflineResponse(message: string): SafetyBotResponse {
    const localResponse = this.checkLocalKnowledge(message);
    if (localResponse) {
      return localResponse;
    }

    return {
      content: SAFETYBOT_QUICK_RESPONSES.offline,
      suggestedActions: PLATFORM_MODULES.slice(0, 4).map((m) => ({
        type: "navigate" as const,
        label: m.nameFr,
        path: m.path,
      })),
      confidence: 0.3,
    };
  }

  /**
   * Extract suggested actions from response
   */
  private extractSuggestedActions(
    text: string,
    originalMessage: string
  ): SuggestedAction[] {
    const actions: SuggestedAction[] = [];
    const lowerText = text.toLowerCase();
    const lowerMessage = originalMessage.toLowerCase();

    // Check if response mentions specific modules
    for (const module of PLATFORM_MODULES) {
      if (
        lowerText.includes(module.name.toLowerCase()) ||
        lowerText.includes(module.nameFr.toLowerCase())
      ) {
        actions.push({
          type: "navigate",
          label: `Aller vers ${module.nameFr}`,
          path: module.path,
        });
      }
    }

    // Check for action keywords
    if (lowerMessage.includes("rapport") || lowerMessage.includes("export")) {
      actions.push({
        type: "generate_report",
        label: "Générer un rapport",
      });
    }

    if (lowerMessage.includes("capa") && lowerMessage.includes("créer")) {
      actions.push({
        type: "create_capa",
        label: "Créer une CAPA",
        path: "/app/capa",
      });
    }

    if (
      lowerMessage.includes("incident") &&
      lowerMessage.includes("déclarer")
    ) {
      actions.push({
        type: "create_incident",
        label: "Déclarer un incident",
        path: "/app/incidents",
      });
    }

    return actions.slice(0, 3);
  }

  /**
   * Extract source references from response
   */
  private extractSources(text: string): MessageSource[] {
    const sources: MessageSource[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes("iso 45001")) {
      sources.push({
        type: "regulation",
        title: "ISO 45001:2018",
        description: "Systèmes de management de la SST",
      });
    }

    if (lowerText.includes("code du travail")) {
      sources.push({
        type: "regulation",
        title: "Code du Travail",
        description: "Réglementation française du travail",
      });
    }

    return sources;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a user message object
 */
export function createUserMessage(content: string): SafetyBotMessage {
  return {
    id: generateMessageId(),
    role: "user",
    content,
    timestamp: new Date(),
  };
}

/**
 * Create an assistant message object
 */
export function createAssistantMessage(
  content: string,
  options?: Partial<SafetyBotMessage>
): SafetyBotMessage {
  return {
    id: generateMessageId(),
    role: "assistant",
    content,
    timestamp: new Date(),
    ...options,
  };
}

// =============================================================================
// Singleton
// =============================================================================

let safetyBotInstance: SafetyBotService | null = null;

/**
 * Get or create SafetyBot service instance
 */
export function getSafetyBotService(): SafetyBotService {
  if (!safetyBotInstance) {
    safetyBotInstance = new SafetyBotService();
  }
  return safetyBotInstance;
}

/**
 * Reset SafetyBot instance (for testing or logout)
 */
export function resetSafetyBotService(): void {
  safetyBotInstance = null;
}
