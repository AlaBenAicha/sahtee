/**
 * SafetyBot Service
 * Handles AI interactions using Google Gemini API
 */

import { GoogleGenerativeAI, type GenerativeModel, type ChatSession } from "@google/generative-ai";
import type {
  SafetyBotMessage,
  SafetyBotResponse,
  ConversationContext,
  SuggestedAction,
  MessageSource,
} from "@/types/safetybot";
import { buildSystemPrompt, QUICK_RESPONSES } from "@/prompts/safetyBot";
import {
  PLATFORM_MODULES,
  COMMON_WORKFLOWS,
  FAQ_ITEMS,
  searchModules,
  searchFAQs,
} from "@/data/platformKnowledge";

// Get API key from environment
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Check if SafetyBot is enabled
 */
export function isSafetyBotEnabled(): boolean {
  return Boolean(GEMINI_API_KEY) && import.meta.env.VITE_ENABLE_SAFETYBOT !== "false";
}

/**
 * SafetyBot Service Class
 */
export class SafetyBotService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private chat: ChatSession | null = null;
  private context: ConversationContext | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  /**
   * Initialize a new chat session with context
   */
  initializeChat(context: ConversationContext): void {
    if (!this.model) {
      console.warn("SafetyBot: Gemini API not configured");
      return;
    }

    this.context = context;
    const systemPrompt = buildSystemPrompt(context);

    this.chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Initialisation du contexte." }],
        },
        {
          role: "model",
          parts: [{ text: QUICK_RESPONSES.greeting }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
      systemInstruction: systemPrompt,
    });
  }

  /**
   * Update the conversation context
   */
  updateContext(context: Partial<ConversationContext>): void {
    if (this.context) {
      this.context = { ...this.context, ...context };
    }
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(message: string): Promise<SafetyBotResponse> {
    if (!this.chat || !this.model) {
      // Return offline response with local knowledge
      return this.getOfflineResponse(message);
    }

    try {
      // Check for local knowledge first (faster response)
      const localResponse = this.checkLocalKnowledge(message);
      if (localResponse) {
        return localResponse;
      }

      // Send to Gemini
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      // Parse response for suggested actions
      const suggestedActions = this.extractSuggestedActions(text, message);
      const sources = this.extractSources(text);

      return {
        content: text,
        suggestedActions,
        sources,
        confidence: 0.85,
      };
    } catch (error) {
      console.error("SafetyBot API error:", error);
      return {
        content: QUICK_RESPONSES.error,
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
    if (!this.chat || !this.model) {
      const offlineResponse = this.getOfflineResponse(message);
      onChunk(offlineResponse.content);
      return offlineResponse;
    }

    try {
      // Check local knowledge first
      const localResponse = this.checkLocalKnowledge(message);
      if (localResponse) {
        onChunk(localResponse.content);
        return localResponse;
      }

      const result = await this.chat.sendMessageStream(message);

      let fullText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(chunkText);
      }

      const suggestedActions = this.extractSuggestedActions(fullText, message);
      const sources = this.extractSources(fullText);

      return {
        content: fullText,
        suggestedActions,
        sources,
        confidence: 0.85,
      };
    } catch (error) {
      console.error("SafetyBot streaming error:", error);
      const errorResponse = QUICK_RESPONSES.error;
      onChunk(errorResponse);
      return { content: errorResponse, confidence: 0 };
    }
  }

  /**
   * Get greeting message
   */
  getGreeting(): string {
    return QUICK_RESPONSES.greeting;
  }

  /**
   * Clear chat history and start fresh
   */
  clearHistory(): void {
    if (this.context) {
      this.initializeChat(this.context);
    }
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
          content: `Pour accéder à **${module.nameFr}** (${module.name}) :\n\n1. Cliquez sur "${module.nameFr}" dans le menu latéral\n2. Ou utilisez ce lien direct\n\n**Description** : ${module.description}\n\n**Fonctionnalités** :\n${module.features.map((f) => `- ${f}`).join("\n")}`,
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

    // Check for workflow questions
    for (const [key, workflow] of Object.entries(COMMON_WORKFLOWS)) {
      const workflowKeywords = key.split("_");
      if (workflowKeywords.every((kw) => lowerMessage.includes(kw))) {
        return {
          content: `## ${workflow.title}\n\n${workflow.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n💡 **Astuce** : ${workflow.tip}`,
          suggestedActions: [
            {
              type: "navigate",
              label: `Aller vers ${workflow.relatedModule}`,
              path: `/app/${workflow.relatedModule}`,
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
   * Get offline response when API is not available
   */
  private getOfflineResponse(message: string): SafetyBotResponse {
    const localResponse = this.checkLocalKnowledge(message);
    if (localResponse) {
      return localResponse;
    }

    // Generic offline response
    return {
      content: `Je suis actuellement en mode hors-ligne et ne peux pas traiter votre demande complètement.

Voici ce que vous pouvez faire :
- Consultez directement le module concerné dans le menu latéral
- Utilisez les boutons d'aide (?) présents dans chaque module
- Rafraîchissez la page et réessayez

**Modules disponibles** :
${PLATFORM_MODULES.map((m) => `- **${m.nameFr}** : ${m.description}`).join("\n")}`,
      suggestedActions: PLATFORM_MODULES.slice(0, 4).map((m) => ({
        type: "navigate" as const,
        label: m.nameFr,
        path: m.path,
      })),
      confidence: 0.5,
    };
  }

  /**
   * Extract suggested actions from response text
   */
  private extractSuggestedActions(text: string, originalMessage: string): SuggestedAction[] {
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

    if (lowerMessage.includes("incident") && lowerMessage.includes("déclarer")) {
      actions.push({
        type: "create_incident",
        label: "Déclarer un incident",
        path: "/app/incidents",
      });
    }

    // Limit to 3 actions
    return actions.slice(0, 3);
  }

  /**
   * Extract source references from response
   */
  private extractSources(text: string): MessageSource[] {
    const sources: MessageSource[] = [];
    const lowerText = text.toLowerCase();

    // Check for regulation mentions
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

// Singleton instance
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
