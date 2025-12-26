/**
 * AI Services Index
 * 
 * Central export for all AI-related services and tools.
 */

// Core types
export type {
    AIContext,
    AIBotType,
    AIMessage,
    AIMessageRole,
    AISession,
    AISessionSummary,
    AITool,
    AIResponse,
    AIStreamChunk,
    AISuggestedAction,
    AISource,
    FunctionCall,
    ToolExecutionResult,
    IncidentAnalysisResult,
    SuggestedCapa,
    ComplianceGapResult,
    HealthTrendResult,
} from "./types";

// Gemini client
export {
    GeminiClient,
    createGeminiClient,
    getDefaultGeminiClient,
    isGeminiEnabled,
    MODEL_CONFIG,
} from "./geminiClient";

// Tool executor
export {
    ToolExecutor,
    createToolExecutor,
    getDefaultToolExecutor,
    getToolRegistry,
    createTool,
    createServiceTool,
    buildParameterSchema,
    paramTypes,
} from "./toolExecutor";

// Tools
export {
    registerAllTools,
    getToolsForBot,
    getToolByName,
    getAllTools,
    incidentTools,
    capaTools,
    complianceTools,
    healthTools,
    organizationTools,
} from "./tools";

// Session service
export {
    createSession,
    getSession,
    getUserSessions,
    updateSession,
    addMessageToSession,
    deleteSession,
    archiveSession,
} from "./sessionService";

// SafetyBot service (re-export from services folder)
export {
    SafetyBotService,
    getSafetyBotService,
    resetSafetyBotService,
    isSafetyBotEnabled,
} from "@/services/safetyBotService";

// CAPA-AI service
export {
    CAPAAIService,
    getCAPAAIService,
    resetCAPAAIService,
    isCAPAAIEnabled,
} from "./capaAIService";

// Conformity-AI service
export {
    ConformityAIService,
    getConformityAIService,
    resetConformityAIService,
    isConformityAIEnabled,
} from "./conformityAIService";

// Health-AI service
export {
    HealthAIService,
    getHealthAIService,
    resetHealthAIService,
    isHealthAIEnabled,
} from "./healthAIService";

