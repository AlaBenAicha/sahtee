/**
 * Gemini API Client with Function Calling Support
 * 
 * Central AI engine for SAHTEE platform supporting:
 * - Streaming responses
 * - Function calling (tools)
 * - Organization-scoped context
 */

import {
    GoogleGenerativeAI,
    type GenerativeModel,
    type ChatSession,
    type Content,
    type FunctionDeclaration,
    type Part,
    type FunctionResponsePart,
} from "@google/generative-ai";
import type {
    AIContext,
    AITool,
    AIResponse,
    AIMessage,
    FunctionCall,
    AIBotType,
    ThinkingConfig,
    ThinkingCallback,
    StreamOptions,
    SafetyBotMode,
} from "./types";

// Get API key from environment
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Check if Gemini AI is enabled
 */
export function isGeminiEnabled(): boolean {
    return Boolean(GEMINI_API_KEY);
}

/**
 * Configuration for different AI models
 * 
 * Model hierarchy (from fastest/cheapest to most capable):
 * - flashLite: Ultra fast, cost-efficient for simple tasks
 * - flash: Best price-performance for chat (stable)
 * - flashThinking: Gemini 3 Flash with thinking for agent mode
 * - pro: Advanced reasoning for complex analysis (stable)
 * - proThinking: Gemini 3 Pro - most powerful for complex agent tasks
 * 
 * @see https://ai.google.dev/gemini-api/docs/models
 */
export const MODEL_CONFIG = {
    // Ultra fast model for cost-efficient, high-throughput operations
    flashLite: {
        model: "gemini-2.5-flash-lite",
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
    },
    // Fast model for quick responses (chat mode) - Stable, best price-performance
    flash: {
        model: "gemini-2.5-flash",
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
    },
    // Gemini 3 Flash with thinking enabled (agent mode) - Latest with frontier intelligence
    flashThinking: {
        model: "gemini-3-flash-preview",
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        thinkingConfig: {
            thinkingBudget: 2048,
            includeThoughts: true,
        } as ThinkingConfig,
    },
    // Pro model for complex analysis - Stable, state-of-the-art reasoning
    pro: {
        model: "gemini-2.5-pro",
        maxOutputTokens: 4096,
        temperature: 0.5,
        topP: 0.9,
        topK: 40,
    },
    // Gemini 3 Pro with thinking enabled - Most powerful agentic model
    proThinking: {
        model: "gemini-3-pro-preview",
        maxOutputTokens: 8192,
        temperature: 0.5,
        topP: 0.9,
        topK: 40,
        thinkingConfig: {
            thinkingBudget: 4096,
            includeThoughts: true,
        } as ThinkingConfig,
    },
} as const;

export type ModelConfigKey = keyof typeof MODEL_CONFIG;

/**
 * Convert AITool to Gemini FunctionDeclaration format
 */
function toolToFunctionDeclaration(tool: AITool): FunctionDeclaration {
    return {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as FunctionDeclaration["parameters"],
    };
}

/**
 * Convert AIMessage array to Gemini Content format
 */
function messagesToContents(messages: AIMessage[]): Content[] {
    return messages
        .filter((msg) => msg.role !== "system")
        .map((msg): Content => {
            if (msg.role === "function" && msg.functionResponse) {
                // Ensure response is always an object (Gemini API requirement)
                const responseObj = ensureResponseIsObject(msg.functionResponse.response);
                const functionResponsePart: FunctionResponsePart = {
                    functionResponse: {
                        name: msg.functionResponse.name,
                        response: responseObj,
                    },
                };
                return {
                    role: "function" as const,
                    parts: [functionResponsePart],
                };
            }

            return {
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }],
            };
        });
}

/**
 * Ensure a value is an object (not array or primitive) for Gemini API
 */
function ensureResponseIsObject(value: unknown): object {
    if (value === null || value === undefined) {
        return { result: null };
    }
    if (Array.isArray(value)) {
        return { result: value };
    }
    if (typeof value !== "object") {
        return { result: value };
    }
    return value as object;
}

/**
 * Extract function calls from Gemini response parts
 */
function extractFunctionCalls(parts: Part[]): FunctionCall[] {
    const calls: FunctionCall[] = [];

    for (const part of parts) {
        if ("functionCall" in part && part.functionCall) {
            calls.push({
                name: part.functionCall.name,
                args: (part.functionCall.args as Record<string, unknown>) || {},
            });
        }
    }

    return calls;
}

/**
 * Extract text content from Gemini response parts
 */
function extractTextContent(parts: Part[]): string {
    return parts
        .filter((part) => "text" in part && part.text)
        .map((part) => ("text" in part ? part.text : ""))
        .join("");
}

/**
 * Extract thinking content from Gemini response parts
 * Thinking content is returned with thought: true flag
 */
function extractThinkingContent(parts: Part[]): string {
    // In Gemini API, thinking content comes as parts with thought: true
    return parts
        .filter((part) => "thought" in part && part.thought === true && "text" in part)
        .map((part) => ("text" in part ? part.text : ""))
        .join("");
}

/**
 * Check if a part is thinking content
 */
function isThinkingPart(part: Part): boolean {
    return "thought" in part && (part as Record<string, unknown>).thought === true;
}

/**
 * GeminiClient class for interacting with Gemini API
 */
export class GeminiClient {
    private genAI: GoogleGenerativeAI | null = null;
    private model: GenerativeModel | null = null;
    private thinkingModel: GenerativeModel | null = null;
    private chat: ChatSession | null = null;
    private thinkingChat: ChatSession | null = null;
    private tools: AITool[] = [];
    private systemPrompt: string = "";
    private context: AIContext | null = null;
    private botType: AIBotType = "safetybot";
    private mode: SafetyBotMode = "chat";
    private thinkingEnabled: boolean = false;
    private currentModelType: ModelConfigKey = "flash";

    constructor() {
        if (GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        }
    }

    /**
     * Initialize the client with context, tools, and system prompt
     */
    initialize(options: {
        botType: AIBotType;
        context: AIContext;
        tools: AITool[];
        systemPrompt: string;
        modelType?: ModelConfigKey;
        enableThinking?: boolean;
    }): void {
        if (!this.genAI) {
            console.warn("GeminiClient: API key not configured");
            return;
        }

        this.botType = options.botType;
        this.context = options.context;
        this.tools = options.tools;
        this.systemPrompt = options.systemPrompt;
        this.thinkingEnabled = options.enableThinking ?? false;
        this.currentModelType = options.modelType || "flash";

        const config = MODEL_CONFIG[this.currentModelType];

        // Convert tools to function declarations
        const functionDeclarations = this.tools.map(toolToFunctionDeclaration);

        // Create standard model
        this.model = this.genAI.getGenerativeModel({
            model: config.model,
            generationConfig: {
                maxOutputTokens: config.maxOutputTokens,
                temperature: config.temperature,
                topP: config.topP,
                topK: config.topK,
            },
            systemInstruction: this.systemPrompt,
            tools:
                functionDeclarations.length > 0
                    ? [{ functionDeclarations }]
                    : undefined,
        });

        // Create thinking-enabled model if requested
        if (this.thinkingEnabled) {
            const thinkingConfig = MODEL_CONFIG.flashThinking;
            this.thinkingModel = this.genAI.getGenerativeModel({
                model: thinkingConfig.model,
                generationConfig: {
                    maxOutputTokens: thinkingConfig.maxOutputTokens,
                    temperature: thinkingConfig.temperature,
                    topP: thinkingConfig.topP,
                    topK: thinkingConfig.topK,
                    // Note: thinkingConfig is passed via generateContent options
                },
                systemInstruction: this.systemPrompt,
                tools:
                    functionDeclarations.length > 0
                        ? [{ functionDeclarations }]
                        : undefined,
            });
        }
    }

    /**
     * Set the current mode (chat or agent)
     */
    setMode(mode: SafetyBotMode): void {
        this.mode = mode;
    }

    /**
     * Get current mode
     */
    getMode(): SafetyBotMode {
        return this.mode;
    }

    /**
     * Enable or disable thinking mode
     */
    setThinkingEnabled(enabled: boolean): void {
        this.thinkingEnabled = enabled;
        if (enabled && !this.thinkingModel && this.genAI) {
            // Create thinking model on demand
            const thinkingConfig = MODEL_CONFIG.flashThinking;
            const functionDeclarations = this.tools.map(toolToFunctionDeclaration);

            this.thinkingModel = this.genAI.getGenerativeModel({
                model: thinkingConfig.model,
                generationConfig: {
                    maxOutputTokens: thinkingConfig.maxOutputTokens,
                    temperature: thinkingConfig.temperature,
                    topP: thinkingConfig.topP,
                    topK: thinkingConfig.topK,
                },
                systemInstruction: this.systemPrompt,
                tools:
                    functionDeclarations.length > 0
                        ? [{ functionDeclarations }]
                        : undefined,
            });
        }
    }

    /**
     * Start a new chat session with optional history
     */
    startChat(history: AIMessage[] = []): void {
        if (!this.model) {
            console.warn("GeminiClient: Model not initialized");
            return;
        }

        const contents = messagesToContents(history);

        this.chat = this.model.startChat({
            history: contents,
        });
    }

    /**
     * Update the conversation context
     */
    updateContext(context: Partial<AIContext>): void {
        if (this.context) {
            this.context = { ...this.context, ...context };
        }
    }

    /**
     * Send a message and get a response (non-streaming)
     */
    async sendMessage(
        message: string,
        executeTools: boolean = true
    ): Promise<AIResponse> {
        if (!this.chat || !this.model || !this.context) {
            return {
                content: "L'assistant IA n'est pas disponible pour le moment.",
                confidence: 0,
            };
        }

        try {
            const result = await this.chat.sendMessage(message);
            const response = result.response;
            const parts = response.candidates?.[0]?.content?.parts || [];

            // Check for function calls
            const functionCalls = extractFunctionCalls(parts);

            if (functionCalls.length > 0 && executeTools) {
                // Execute tools and continue conversation (use the same chat session)
                return await this.handleFunctionCalls(functionCalls, this.chat);
            }

            // Return text response
            const textContent = extractTextContent(parts);

            return {
                content: textContent,
                functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
                confidence: 0.85,
            };
        } catch (error) {
            console.error("GeminiClient sendMessage error:", error);
            return {
                content:
                    "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.",
                confidence: 0,
            };
        }
    }

    /**
     * Send a message with streaming response
     */
    async streamMessage(
        message: string,
        onChunk: (chunk: string) => void,
        executeTools: boolean = true
    ): Promise<AIResponse> {
        if (!this.chat || !this.model || !this.context) {
            const errorMsg = "L'assistant IA n'est pas disponible pour le moment.";
            onChunk(errorMsg);
            return { content: errorMsg, confidence: 0 };
        }

        try {
            const result = await this.chat.sendMessageStream(message);

            let fullText = "";

            // Stream content to UI as it arrives
            for await (const chunk of result.stream) {
                const parts = chunk.candidates?.[0]?.content?.parts || [];

                const chunkText = extractTextContent(parts);
                if (chunkText) {
                    fullText += chunkText;
                    onChunk(chunkText);
                }
            }

            // IMPORTANT: Wait for the finalized response to ensure chat history is properly updated
            // This is required before sending function responses
            const finalResponse = await result.response;
            const finalParts = finalResponse.candidates?.[0]?.content?.parts || [];

            // Check for function calls from the finalized response
            const functionCalls = extractFunctionCalls(finalParts);

            if (functionCalls.length > 0 && executeTools) {
                // Execute tools and continue conversation (use the same chat session)
                const toolResponse = await this.handleFunctionCalls(functionCalls, this.chat);

                // Stream the tool response
                if (toolResponse.content) {
                    onChunk("\n\n" + toolResponse.content);
                    fullText += "\n\n" + toolResponse.content;
                }

                return {
                    content: fullText,
                    functionCalls,
                    confidence: 0.85,
                };
            }

            return {
                content: fullText,
                confidence: 0.85,
            };
        } catch (error) {
            console.error("GeminiClient streamMessage error:", error);
            const errorMsg =
                "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.";
            onChunk(errorMsg);
            return { content: errorMsg, confidence: 0 };
        }
    }

    /**
     * Send a message with streaming response and thinking support
     * Used for agent mode where we want to show the AI's reasoning
     */
    async streamMessageWithThinking(
        message: string,
        onChunk: (chunk: string) => void,
        options: StreamOptions = {}
    ): Promise<AIResponse> {
        const { executeTools = true, onThinking } = options;

        // Use thinking model if available and enabled
        const activeChat = this.thinkingEnabled && this.thinkingChat
            ? this.thinkingChat
            : this.chat;
        const activeModel = this.thinkingEnabled && this.thinkingModel
            ? this.thinkingModel
            : this.model;

        if (!activeChat || !activeModel || !this.context) {
            const errorMsg = "L'assistant IA n'est pas disponible pour le moment.";
            onChunk(errorMsg);
            return { content: errorMsg, confidence: 0 };
        }

        try {
            const result = await activeChat.sendMessageStream(message);

            let fullText = "";
            let fullThinking = "";

            // Stream content to UI as it arrives
            for await (const chunk of result.stream) {
                const parts = chunk.candidates?.[0]?.content?.parts || [];

                // Process each part for UI streaming
                for (const part of parts) {
                    if (isThinkingPart(part) && "text" in part) {
                        // This is thinking content
                        const thinkingText = part.text || "";
                        fullThinking += thinkingText;
                        if (onThinking) {
                            onThinking(thinkingText);
                        }
                    } else if ("text" in part && part.text) {
                        // Regular text content
                        fullText += part.text;
                        onChunk(part.text);
                    }
                }
            }

            // IMPORTANT: Wait for the finalized response to ensure chat history is properly updated
            // This is required before sending function responses, as the Gemini API requires
            // function response turns to come immediately after function call turns in the history
            const finalResponse = await result.response;
            const finalParts = finalResponse.candidates?.[0]?.content?.parts || [];

            // Check for function calls from the finalized response
            const functionCalls = extractFunctionCalls(finalParts);

            if (functionCalls.length > 0 && executeTools) {
                // Execute tools and continue conversation using the SAME chat session
                // This is critical: function responses must go to the same session that made the call
                const toolResponse = await this.handleFunctionCalls(functionCalls, activeChat);

                // Stream the tool response
                if (toolResponse.content) {
                    onChunk("\n\n" + toolResponse.content);
                    fullText += "\n\n" + toolResponse.content;
                }

                return {
                    content: fullText,
                    thinking: fullThinking || undefined,
                    functionCalls,
                    confidence: 0.85,
                };
            }

            return {
                content: fullText,
                thinking: fullThinking || undefined,
                confidence: 0.85,
            };
        } catch (error) {
            console.error("GeminiClient streamMessageWithThinking error:", error);
            const errorMsg =
                "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.";
            onChunk(errorMsg);
            return { content: errorMsg, confidence: 0 };
        }
    }

    /**
     * Start thinking chat session
     */
    startThinkingChat(history: AIMessage[] = []): void {
        if (!this.thinkingModel) {
            console.warn("GeminiClient: Thinking model not initialized");
            return;
        }

        const contents = messagesToContents(history);

        this.thinkingChat = this.thinkingModel.startChat({
            history: contents,
        });
    }

    /**
     * Wrap a value in an object if it's not already a plain object.
     * Gemini API requires function_response.response to be an object, not an array or primitive.
     */
    private wrapResponseAsObject(value: unknown): Record<string, unknown> {
        // If it's null or undefined, wrap it
        if (value === null || value === undefined) {
            return { result: null };
        }

        // If it's an array, wrap it in an object
        if (Array.isArray(value)) {
            return { result: value };
        }

        // If it's a primitive (string, number, boolean), wrap it
        if (typeof value !== "object") {
            return { result: value };
        }

        // It's already an object, return as-is
        return value as Record<string, unknown>;
    }

    /**
     * Handle function calls by executing tools and sending results back
     * 
     * IMPORTANT: The chatSession parameter must be the same session that made the function call.
     * The Gemini API requires that function response turns come immediately after function call turns.
     */
    private async handleFunctionCalls(
        functionCalls: FunctionCall[],
        chatSession: ChatSession
    ): Promise<AIResponse> {
        if (!chatSession || !this.context) {
            return {
                content: "Impossible d'exécuter les outils.",
                confidence: 0,
            };
        }

        const functionResponses: FunctionResponsePart[] = [];

        for (const call of functionCalls) {
            const tool = this.tools.find((t) => t.name === call.name);

            if (tool) {
                try {
                    const result = await tool.execute(call.args, this.context);
                    // Ensure response is always a plain object (not array or primitive)
                    const wrappedResponse = this.wrapResponseAsObject(result);
                    functionResponses.push({
                        functionResponse: {
                            name: call.name,
                            response: wrappedResponse,
                        },
                    });
                } catch (error) {
                    console.error(`Error executing tool ${call.name}:`, error);
                    functionResponses.push({
                        functionResponse: {
                            name: call.name,
                            response: {
                                error: `Erreur lors de l'exécution de ${call.name}`,
                            },
                        },
                    });
                }
            } else {
                functionResponses.push({
                    functionResponse: {
                        name: call.name,
                        response: { error: `Outil ${call.name} non trouvé` },
                    },
                });
            }
        }

        // Send function responses back to the model using the SAME chat session
        try {
            const result = await chatSession.sendMessage(functionResponses);
            const response = result.response;
            const parts = response.candidates?.[0]?.content?.parts || [];

            // Check for more function calls (recursive) - pass same session
            const moreCalls = extractFunctionCalls(parts);
            if (moreCalls.length > 0) {
                return await this.handleFunctionCalls(moreCalls, chatSession);
            }

            const textContent = extractTextContent(parts);

            return {
                content: textContent,
                functionCalls,
                confidence: 0.85,
            };
        } catch (error) {
            console.error("Error sending function responses:", error);
            return {
                content: "Erreur lors du traitement des données.",
                confidence: 0,
            };
        }
    }

    /**
     * Generate content without chat context (single-shot)
     */
    async generateContent(
        prompt: string,
        _executeTools: boolean = true
    ): Promise<AIResponse> {
        if (!this.model || !this.context) {
            return {
                content: "L'assistant IA n'est pas disponible.",
                confidence: 0,
            };
        }

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const parts = response.candidates?.[0]?.content?.parts || [];

            const functionCalls = extractFunctionCalls(parts);
            const textContent = extractTextContent(parts);

            // For single-shot, we don't handle function calls recursively
            // The caller should handle them if needed

            return {
                content: textContent,
                functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
                confidence: 0.85,
            };
        } catch (error) {
            console.error("GeminiClient generateContent error:", error);
            return {
                content: "Erreur lors de la génération du contenu.",
                confidence: 0,
            };
        }
    }

    /**
     * Clear chat history and start fresh
     */
    clearHistory(): void {
        if (this.model) {
            this.startChat([]);
        }
    }

    /**
     * Get current context
     */
    getContext(): AIContext | null {
        return this.context;
    }

    /**
     * Get bot type
     */
    getBotType(): AIBotType {
        return this.botType;
    }

    /**
     * Check if client is initialized
     */
    isInitialized(): boolean {
        return this.model !== null && this.context !== null;
    }
}

/**
 * Create a new GeminiClient instance
 */
export function createGeminiClient(): GeminiClient {
    return new GeminiClient();
}

/**
 * Default singleton instance for simple use cases
 */
let defaultClient: GeminiClient | null = null;

export function getDefaultGeminiClient(): GeminiClient {
    if (!defaultClient) {
        defaultClient = createGeminiClient();
    }
    return defaultClient;
}

