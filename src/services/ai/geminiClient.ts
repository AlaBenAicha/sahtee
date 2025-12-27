/**
 * Gemini API Client with Function Calling Support
 *
 * Central AI engine for SAHTEE platform supporting:
 * - Streaming responses
 * - Function calling (tools)
 * - Organization-scoped context
 *
 * Uses the new unified @google/genai SDK
 */

import {
    FunctionCallingConfigMode,
    GoogleGenAI,
    createPartFromFunctionResponse,
    type Chat,
    type Content,
    type FunctionDeclaration,
    type GenerateContentConfig,
    type Part,
} from "@google/genai";
import type {
    AgentActionRequest,
    AIBotType,
    AIContext,
    AIMessage,
    AIResponse,
    AITool,
    FunctionCall,
    SafetyBotMode,
    StreamOptions,
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
    // Agent mode - Using stable 2.5 Flash for reliable function calling
    // Note: gemini-3-flash-preview has thinking but is unstable (500 errors)
    flashThinking: {
        model: "gemini-2.5-flash",
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        // Thinking disabled - 2.5 models don't support it, but are more stable
    },
    // Pro model for complex analysis - Stable, state-of-the-art reasoning
    pro: {
        model: "gemini-2.5-pro",
        maxOutputTokens: 4096,
        temperature: 0.5,
        topP: 0.9,
        topK: 40,
    },
    // Pro model for complex agent tasks - Using stable 2.5 Pro
    // Note: gemini-3-pro-preview has thinking but is unstable
    proThinking: {
        model: "gemini-2.5-pro",
        maxOutputTokens: 8192,
        temperature: 0.5,
        topP: 0.9,
        topK: 40,
        // Thinking disabled - 2.5 models don't support it, but are more stable
    },
} as const;

export type ModelConfigKey = keyof typeof MODEL_CONFIG;

/**
 * Convert AITool to Gemini FunctionDeclaration format
 * Uses parametersJsonSchema for the new SDK
 */
function toolToFunctionDeclaration(tool: AITool): FunctionDeclaration {
    return {
        name: tool.name,
        description: tool.description,
        // New SDK uses parametersJsonSchema instead of parameters
        parametersJsonSchema: tool.parameters,
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
                const responseObj = ensureResponseIsObject(
                    msg.functionResponse.response
                );
                // Use createPartFromFunctionResponse for the new SDK
                const functionResponsePart = createPartFromFunctionResponse(
                    "", // id - not available in our AIMessage type
                    msg.functionResponse.name,
                    responseObj as Record<string, unknown>
                );
                return {
                    role: "user" as const, // Function responses are sent as user role in new SDK
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
        if (part.functionCall) {
            calls.push({
                name: part.functionCall.name || "",
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
 * Check if a part is thinking content
 */
function isThinkingPart(part: Part): boolean {
    return (
        "thought" in part && (part as Record<string, unknown>).thought === true
    );
}

/**
 * GeminiClient class for interacting with Gemini API
 * Uses the new unified @google/genai SDK
 */
export class GeminiClient {
    private genAI: GoogleGenAI | null = null;
    private chat: Chat | null = null;
    private thinkingChat: Chat | null = null;
    private tools: AITool[] = [];
    private systemPrompt: string = "";
    private context: AIContext | null = null;
    private botType: AIBotType = "safetybot";
    private mode: SafetyBotMode = "chat";
    private thinkingEnabled: boolean = false;
    private currentModelType: ModelConfigKey = "flash";
    private functionDeclarations: FunctionDeclaration[] = [];

    constructor() {
        if (GEMINI_API_KEY) {
            this.genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        }
    }

    /**
     * Build the config for chat creation
     */
    private buildChatConfig(
        modelConfig: (typeof MODEL_CONFIG)[ModelConfigKey]
    ): GenerateContentConfig {
        const config: GenerateContentConfig = {
            maxOutputTokens: modelConfig.maxOutputTokens,
            temperature: modelConfig.temperature,
            topP: modelConfig.topP,
            topK: modelConfig.topK,
        };

        // Add tools if available
        if (this.functionDeclarations.length > 0) {
            config.tools = [{ functionDeclarations: this.functionDeclarations }];
            config.toolConfig = {
                functionCallingConfig: {
                    mode: FunctionCallingConfigMode.AUTO,
                },
            };
        }

        // Add thinking config if available
        if ("thinkingConfig" in modelConfig && modelConfig.thinkingConfig) {
            config.thinkingConfig = modelConfig.thinkingConfig;
        }

        return config;
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
        console.log("[GeminiClient] initialize called", {
            botType: options.botType,
            hasContext: !!options.context,
            toolsCount: options.tools.length,
            toolNames: options.tools.map((t) => t.name),
            systemPromptLength: options.systemPrompt.length,
            modelType: options.modelType || "flash",
            enableThinking: options.enableThinking ?? false,
            hasGenAI: !!this.genAI,
        });

        if (!this.genAI) {
            console.warn("[GeminiClient] API key not configured");
            return;
        }

        this.botType = options.botType;
        this.context = options.context;
        this.tools = options.tools;
        this.systemPrompt = options.systemPrompt;
        this.thinkingEnabled = options.enableThinking ?? false;
        this.currentModelType = options.modelType || "flash";

        // Convert tools to function declarations
        this.functionDeclarations = this.tools.map(toolToFunctionDeclaration);
        console.log("[GeminiClient] Function declarations created:", {
            count: this.functionDeclarations.length,
            names: this.functionDeclarations.map((fd) => fd.name),
        });
    }

    /**
     * Set the current mode (chat or agent)
     */
    setMode(mode: SafetyBotMode): void {
        console.log("[GeminiClient] setMode:", mode);
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
        console.log("[GeminiClient] setThinkingEnabled:", enabled);
        this.thinkingEnabled = enabled;
        // Thinking chat will be created on next startChat call
    }

    /**
     * Start a new chat session with optional history
     */
    startChat(history: AIMessage[] = []): void {
        console.log("[GeminiClient] startChat called", {
            historyLength: history.length,
            hasGenAI: !!this.genAI,
            thinkingEnabled: this.thinkingEnabled,
            currentModelType: this.currentModelType,
        });

        if (!this.genAI) {
            console.warn("[GeminiClient] API not initialized");
            return;
        }

        const contents = messagesToContents(history);
        const config = MODEL_CONFIG[this.currentModelType];

        console.log("[GeminiClient] Creating standard chat session:", {
            model: config.model,
            historyContentsCount: contents.length,
            hasTools: this.functionDeclarations.length > 0,
            toolsCount: this.functionDeclarations.length,
        });

        // Create standard chat session
        this.chat = this.genAI.chats.create({
            model: config.model,
            config: {
                ...this.buildChatConfig(config),
                systemInstruction: this.systemPrompt,
            },
            history: contents,
        });
        console.log("[GeminiClient] Standard chat session created successfully");

        // Also start thinking chat if thinking is enabled
        if (this.thinkingEnabled) {
            const thinkingConfig = MODEL_CONFIG.flashThinking;
            console.log("[GeminiClient] Creating thinking chat session:", {
                model: thinkingConfig.model,
            });
            this.thinkingChat = this.genAI.chats.create({
                model: thinkingConfig.model,
                config: {
                    ...this.buildChatConfig(thinkingConfig),
                    systemInstruction: this.systemPrompt,
                },
                history: contents,
            });
            console.log("[GeminiClient] Thinking chat session created successfully");
        }
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
        console.log("[GeminiClient] sendMessage called", {
            messageLength: message.length,
            executeTools,
            hasChat: !!this.chat,
            hasContext: !!this.context,
        });

        if (!this.chat || !this.context) {
            console.warn("[GeminiClient] sendMessage: chat or context not available");
            return {
                content: "L'assistant IA n'est pas disponible pour le moment.",
                confidence: 0,
            };
        }

        try {
            console.log("[GeminiClient] Sending message to Gemini API...");
            const result = await this.chat.sendMessage({ message });
            console.log("[GeminiClient] Received response from Gemini API", {
                hasCandidates: !!result.candidates,
                candidatesCount: result.candidates?.length || 0,
            });

            const parts = result.candidates?.[0]?.content?.parts || [];
            console.log("[GeminiClient] Response parts:", {
                partsCount: parts.length,
                partTypes: parts.map((p) => Object.keys(p)),
            });

            // Check for function calls
            const functionCalls = extractFunctionCalls(parts);
            console.log("[GeminiClient] Function calls found:", functionCalls.length);

            if (functionCalls.length > 0 && executeTools) {
                console.log("[GeminiClient] Executing function calls:", functionCalls);
                // Execute tools and continue conversation (use the same chat session)
                return await this.handleFunctionCalls(functionCalls, this.chat);
            }

            // Return text response
            const textContent = extractTextContent(parts);
            console.log("[GeminiClient] Text response length:", textContent.length);

            return {
                content: textContent,
                functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
                confidence: 0.85,
            };
        } catch (error) {
            console.error("[GeminiClient] sendMessage error:", error);
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
        console.log("[GeminiClient] streamMessage called", {
            messageLength: message.length,
            executeTools,
            hasChat: !!this.chat,
            hasContext: !!this.context,
        });

        if (!this.chat || !this.context) {
            console.warn(
                "[GeminiClient] streamMessage: chat or context not available"
            );
            const errorMsg = "L'assistant IA n'est pas disponible pour le moment.";
            onChunk(errorMsg);
            return { content: errorMsg, confidence: 0 };
        }

        try {
            console.log("[GeminiClient] Starting stream to Gemini API...");
            const stream = await this.chat.sendMessageStream({ message });
            console.log("[GeminiClient] Stream started successfully");

            let fullText = "";
            let allParts: Part[] = [];
            let chunkCount = 0;

            // Stream content to UI as it arrives
            for await (const chunk of stream) {
                chunkCount++;
                const parts = chunk.candidates?.[0]?.content?.parts || [];
                allParts.push(...parts); // Accumulate all parts for function calls

                const chunkText = chunk.text || "";
                if (chunkText) {
                    fullText += chunkText;
                    onChunk(chunkText);
                }

                // Log first chunk with more detail
                if (chunkCount === 1) {
                    console.log("[GeminiClient] First chunk received:", {
                        partsCount: parts.length,
                        partTypes: parts.map((p) => Object.keys(p)),
                        hasText: !!chunkText,
                    });
                }
            }

            console.log("[GeminiClient] Stream completed", {
                totalChunks: chunkCount,
                fullTextLength: fullText.length,
                finalPartsCount: allParts.length,
            });

            // Check for function calls from the accumulated parts
            const functionCalls = extractFunctionCalls(allParts);
            console.log("[GeminiClient] Function calls found:", {
                count: functionCalls.length,
                names: functionCalls.map((fc) => fc.name),
            });

            if (functionCalls.length > 0 && executeTools) {
                console.log("[GeminiClient] Executing function calls...");
                // Execute tools and continue conversation (use the same chat session)
                const toolResponse = await this.handleFunctionCalls(
                    functionCalls,
                    this.chat
                );

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
            console.error("[GeminiClient] streamMessage error:", error);
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

        console.log("[GeminiClient] streamMessageWithThinking called", {
            messageLength: message.length,
            executeTools,
            hasOnThinking: !!onThinking,
            thinkingEnabled: this.thinkingEnabled,
            hasThinkingChat: !!this.thinkingChat,
            hasChat: !!this.chat,
        });

        // Use thinking chat if available and enabled
        const activeChat =
            this.thinkingEnabled && this.thinkingChat ? this.thinkingChat : this.chat;

        console.log("[GeminiClient] Using chat:", {
            isThinkingChat: activeChat === this.thinkingChat,
            hasActiveChat: !!activeChat,
        });

        if (!activeChat || !this.context) {
            console.warn(
                "[GeminiClient] streamMessageWithThinking: chat or context not available"
            );
            const errorMsg = "L'assistant IA n'est pas disponible pour le moment.";
            onChunk(errorMsg);
            return { content: errorMsg, confidence: 0 };
        }

        try {
            console.log("[GeminiClient] Starting thinking stream to Gemini API...", {
                message: message.substring(0, 100) + "...",
            });
            const stream = await activeChat.sendMessageStream({ message });
            console.log("[GeminiClient] Thinking stream started successfully");

            let fullText = "";
            let fullThinking = "";
            let allParts: Part[] = [];
            let chunkCount = 0;

            // Stream content to UI as it arrives
            for await (const chunk of stream) {
                chunkCount++;
                const parts = chunk.candidates?.[0]?.content?.parts || [];
                allParts.push(...parts); // Accumulate all parts for function calls

                // Log first chunk with more detail
                if (chunkCount === 1) {
                    console.log("[GeminiClient] First thinking chunk received:", {
                        partsCount: parts.length,
                        partTypes: parts.map((p) => Object.keys(p)),
                        hasFunctionCall: parts.some((p) => "functionCall" in p),
                    });
                }

                // Process each part for UI streaming
                for (const part of parts) {
                    if (isThinkingPart(part) && part.text) {
                        // This is thinking content
                        const thinkingText = part.text || "";
                        fullThinking += thinkingText;
                        if (onThinking) {
                            onThinking(thinkingText);
                        }
                    } else if (part.text && !isThinkingPart(part)) {
                        // Regular text content
                        fullText += part.text;
                        onChunk(part.text);
                    }
                }
            }

            console.log("[GeminiClient] Thinking stream completed", {
                totalChunks: chunkCount,
                fullTextLength: fullText.length,
                fullThinkingLength: fullThinking.length,
                finalPartsCount: allParts.length,
                finalPartTypes: allParts.map((p) => Object.keys(p)),
            });

            // Check for function calls from the accumulated parts
            const functionCalls = extractFunctionCalls(allParts);
            console.log("[GeminiClient] Function calls extracted:", {
                count: functionCalls.length,
                names: functionCalls.map((fc) => fc.name),
                args: functionCalls.map((fc) => fc.args),
            });

            if (functionCalls.length > 0 && executeTools) {
                console.log(
                    "[GeminiClient] Executing function calls from thinking stream..."
                );
                // Execute tools and continue conversation using the SAME chat session
                // This is critical: function responses must go to the same session that made the call
                const collectedAgentActions: AgentActionRequest[] = [];
                const toolResponse = await this.handleFunctionCalls(
                    functionCalls,
                    activeChat,
                    options.onAgentAction,
                    collectedAgentActions
                );

                console.log("[GeminiClient] Function call response received:", {
                    contentLength: toolResponse.content?.length || 0,
                    agentActionsCount: collectedAgentActions.length,
                });

                // Stream the tool response
                if (toolResponse.content) {
                    onChunk("\n\n" + toolResponse.content);
                    fullText += "\n\n" + toolResponse.content;
                }

                return {
                    content: fullText,
                    thinking: fullThinking || undefined,
                    functionCalls,
                    agentActions:
                        collectedAgentActions.length > 0 ? collectedAgentActions : undefined,
                    confidence: 0.85,
                };
            }

            return {
                content: fullText,
                thinking: fullThinking || undefined,
                confidence: 0.85,
            };
        } catch (error) {
            console.error("[GeminiClient] streamMessageWithThinking error:", error);
            console.error("[GeminiClient] Error details:", {
                name: (error as Error).name,
                message: (error as Error).message,
                stack: (error as Error).stack,
            });
            const errorMsg =
                "Désolé, une erreur s'est produite. Veuillez réessayer plus tard.";
            onChunk(errorMsg);
            return { content: errorMsg, confidence: 0 };
        }
    }

    /**
     * Start thinking chat session (now handled by startChat)
     */
    startThinkingChat(history: AIMessage[] = []): void {
        if (!this.genAI) {
            console.warn("GeminiClient: API not initialized");
            return;
        }

        const contents = messagesToContents(history);
        const thinkingConfig = MODEL_CONFIG.flashThinking;

        this.thinkingChat = this.genAI.chats.create({
            model: thinkingConfig.model,
            config: {
                ...this.buildChatConfig(thinkingConfig),
                systemInstruction: this.systemPrompt,
            },
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
        chatSession: Chat,
        onAgentAction?: (action: AgentActionRequest) => void,
        collectedAgentActions: AgentActionRequest[] = []
    ): Promise<AIResponse> {
        console.log("[GeminiClient] handleFunctionCalls called", {
            functionCount: functionCalls.length,
            functionNames: functionCalls.map((fc) => fc.name),
            hasChatSession: !!chatSession,
            hasContext: !!this.context,
        });

        if (!chatSession || !this.context) {
            console.error(
                "[GeminiClient] handleFunctionCalls: missing session/context"
            );
            return {
                content: "Impossible d'exécuter les outils.",
                confidence: 0,
            };
        }

        // Build function response parts using the new SDK helper
        const functionResponseParts: Part[] = [];

        for (const call of functionCalls) {
            console.log("[GeminiClient] Executing tool:", {
                name: call.name,
                args: call.args,
            });

            const tool = this.tools.find((t) => t.name === call.name);

            if (tool) {
                try {
                    console.log(`[GeminiClient] Tool ${call.name} found, executing...`);
                    const result = await tool.execute(call.args, this.context);
                    console.log(
                        `[GeminiClient] Tool ${call.name} executed successfully:`,
                        {
                            resultType: typeof result,
                            isArray: Array.isArray(result),
                            resultPreview: JSON.stringify(result).substring(0, 200),
                        }
                    );

                    // Check if the result contains an agent action
                    if (
                        result &&
                        typeof result === "object" &&
                        "agentAction" in result
                    ) {
                        const agentAction = (result as { agentAction: AgentActionRequest })
                            .agentAction;
                        console.log(`[GeminiClient] Agent action extracted:`, {
                            type: agentAction.type,
                            target: agentAction.target,
                            description: agentAction.description,
                        });
                        collectedAgentActions.push(agentAction);
                        if (onAgentAction) {
                            onAgentAction(agentAction);
                        }
                    }

                    // Ensure response is always a plain object (not array or primitive)
                    const wrappedResponse = this.wrapResponseAsObject(result);
                    // Use createPartFromFunctionResponse from the new SDK
                    const responsePart = createPartFromFunctionResponse(
                        "",
                        call.name,
                        wrappedResponse
                    );
                    console.log(`[GeminiClient] Created function response part:`, {
                        partKeys: Object.keys(responsePart),
                    });
                    functionResponseParts.push(responsePart);
                } catch (error) {
                    console.error(
                        `[GeminiClient] Error executing tool ${call.name}:`,
                        error
                    );
                    functionResponseParts.push(
                        createPartFromFunctionResponse("", call.name, {
                            error: `Erreur lors de l'exécution de ${call.name}`,
                        })
                    );
                }
            } else {
                console.warn(
                    `[GeminiClient] Tool ${call.name} not found in tools list:`,
                    {
                        availableTools: this.tools.map((t) => t.name),
                    }
                );
                functionResponseParts.push(
                    createPartFromFunctionResponse("", call.name, {
                        error: `Outil ${call.name} non trouvé`,
                    })
                );
            }
        }

        // Send function responses back to the model using the SAME chat session
        console.log("[GeminiClient] Sending function responses to model:", {
            responseCount: functionResponseParts.length,
            responseParts: functionResponseParts.map((p) => Object.keys(p)),
        });

        try {
            console.log(
                "[GeminiClient] Calling chatSession.sendMessage with function responses..."
            );
            const result = await chatSession.sendMessage({
                message: functionResponseParts,
            });
            console.log("[GeminiClient] Function response sent successfully", {
                hasCandidates: !!result.candidates,
                candidatesCount: result.candidates?.length || 0,
            });

            const parts = result.candidates?.[0]?.content?.parts || [];
            console.log("[GeminiClient] Response parts from function response:", {
                partsCount: parts.length,
                partTypes: parts.map((p) => Object.keys(p)),
            });

            // Check for more function calls (recursive) - pass same session and callbacks
            const moreCalls = extractFunctionCalls(parts);
            if (moreCalls.length > 0) {
                console.log("[GeminiClient] More function calls found, recursing:", {
                    count: moreCalls.length,
                    names: moreCalls.map((fc) => fc.name),
                });
                return await this.handleFunctionCalls(
                    moreCalls,
                    chatSession,
                    onAgentAction,
                    collectedAgentActions
                );
            }

            const textContent = extractTextContent(parts);
            console.log(
                "[GeminiClient] Final text response length:",
                textContent.length
            );

            return {
                content: textContent,
                functionCalls,
                agentActions:
                    collectedAgentActions.length > 0 ? collectedAgentActions : undefined,
                confidence: 0.85,
            };
        } catch (error) {
            console.error("[GeminiClient] Error sending function responses:", error);
            console.error("[GeminiClient] Error details:", {
                name: (error as Error).name,
                message: (error as Error).message,
                stack: (error as Error).stack,
            });
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
        if (!this.genAI || !this.context) {
            return {
                content: "L'assistant IA n'est pas disponible.",
                confidence: 0,
            };
        }

        try {
            const config = MODEL_CONFIG[this.currentModelType];
            const result = await this.genAI.models.generateContent({
                model: config.model,
                contents: prompt,
                config: {
                    ...this.buildChatConfig(config),
                    systemInstruction: this.systemPrompt,
                },
            });
            const parts = result.candidates?.[0]?.content?.parts || [];

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
        if (this.genAI) {
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
        return this.genAI !== null && this.context !== null;
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
