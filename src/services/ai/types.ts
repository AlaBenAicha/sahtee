/**
 * AI Service Types
 * Shared types for all AI-powered features in SAHTEE
 */

import type { Timestamp } from "firebase/firestore";

// =============================================================================
// Core AI Types
// =============================================================================

/**
 * Context passed to every AI call for security and personalization
 */
export interface AIContext {
  organizationId: string;
  userId: string;
  userRole: string;
  userName: string;
  organizationName?: string;
  currentModule?: string;
  currentPage?: string;
}

/**
 * Bot types available in the platform
 */
export type AIBotType = "safetybot" | "capa_ai" | "conformity_ai" | "health_ai";

/**
 * Message role in a conversation
 */
export type AIMessageRole = "user" | "assistant" | "system" | "function";

/**
 * A single message in an AI conversation
 */
export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: Date | Timestamp;
  functionCall?: {
    name: string;
    arguments: Record<string, unknown>;
  };
  functionResponse?: {
    name: string;
    response: unknown;
  };
  sources?: AISource[];
  suggestedActions?: AISuggestedAction[];
  isStreaming?: boolean;
  isError?: boolean;
}

/**
 * Source reference for AI responses
 */
export interface AISource {
  type: "document" | "data" | "regulation" | "module" | "incident" | "capa";
  title: string;
  description?: string;
  link?: string;
  id?: string;
}

/**
 * Action suggested by AI
 */
export interface AISuggestedAction {
  type:
    | "navigate"
    | "create_capa"
    | "create_incident"
    | "schedule_audit"
    | "view_document"
    | "generate_report"
    | "view_training"
    | "view_health"
    | "apply_recommendation";
  label: string;
  icon?: string;
  path?: string;
  payload?: Record<string, unknown>;
}

// =============================================================================
// Tool Types
// =============================================================================

/**
 * JSON Schema for tool parameters
 */
export interface JSONSchemaProperty {
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  enum?: string[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface JSONSchema {
  type: "object";
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

/**
 * Tool definition for Gemini function calling
 */
export interface AITool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (params: Record<string, unknown>, context: AIContext) => Promise<unknown>;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Function call from Gemini
 */
export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

// =============================================================================
// Session Types
// =============================================================================

/**
 * AI conversation session stored in Firestore
 */
export interface AISession {
  id: string;
  organizationId: string;
  userId: string;
  botType: AIBotType;
  title: string;
  messages: AIMessage[];
  context: AIContext;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  isArchived: boolean;
}

/**
 * Session summary for list display
 */
export interface AISessionSummary {
  id: string;
  title: string;
  botType: AIBotType;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

// =============================================================================
// Response Types
// =============================================================================

/**
 * AI response from the Gemini API
 */
export interface AIResponse {
  content: string;
  sources?: AISource[];
  suggestedActions?: AISuggestedAction[];
  confidence?: number;
  functionCalls?: FunctionCall[];
  /** Thinking content from Gemini thinking mode */
  thinking?: string;
  /** Agent actions to execute (when in agent mode) */
  agentActions?: AgentActionRequest[];
}

/**
 * Streaming chunk from AI
 */
export interface AIStreamChunk {
  type: "text" | "thinking" | "function_call" | "agent_action" | "done" | "error";
  content?: string;
  thinking?: string;
  functionCall?: FunctionCall;
  agentAction?: AgentActionRequest;
  error?: string;
}

// =============================================================================
// Thinking Mode Types
// =============================================================================

/**
 * Thinking mode configuration for Gemini
 */
export interface ThinkingConfig {
  /** Token budget for thinking (1-24576) */
  thinkingBudget: number;
  /** Whether to include thought summaries in response */
  includeThoughts: boolean;
}

/**
 * Thought content from Gemini
 */
export interface ThinkingContent {
  /** The thinking/reasoning text */
  text: string;
  /** Whether this is the final thought */
  isFinal: boolean;
}

// =============================================================================
// Agent Mode Types
// =============================================================================

/**
 * Agent action request from AI
 */
export interface AgentActionRequest {
  /** Action type */
  type: string;
  /** Target element or path */
  target: string;
  /** Action parameters */
  params?: Record<string, unknown>;
  /** Human-readable description */
  description: string;
  /** Whether action requires confirmation */
  requiresConfirmation?: boolean;
}

/**
 * Agent mode for SafetyBot
 */
export type SafetyBotMode = "chat" | "agent";

/**
 * Extended context for agent mode
 */
export interface AgentModeContext extends AIContext {
  /** Current mode */
  mode: SafetyBotMode;
  /** Available features for the user */
  availableFeatures: string[];
  /** Current visible elements (for action targeting) */
  visibleElements?: string[];
}

// =============================================================================
// Analysis Types
// =============================================================================

/**
 * Incident analysis result from CAPA-AI
 */
export interface IncidentAnalysisResult {
  incidentId: string;
  rootCause: string;
  rootCauseCategory: string;
  confidence: number;
  contributingFactors: string[];
  immediateActions: string[];
  preventiveMeasures: string[];
  similarIncidents: SimilarIncidentMatch[];
  suggestedCapas: SuggestedCapa[];
}

/**
 * Similar incident match
 */
export interface SimilarIncidentMatch {
  incidentId: string;
  reference: string;
  similarity: number;
  commonFactors: string[];
  date: Date;
}

/**
 * Suggested CAPA from AI analysis
 */
export interface SuggestedCapa {
  title: string;
  description: string;
  category: "correctif" | "preventif";
  priority: "critique" | "haute" | "moyenne" | "basse";
  reasoning: string;
  confidence: number;
  suggestedDueDate?: Date;
  suggestedDueDays?: number;
  linkedTrainings?: string[];
  linkedEquipment?: string[];
  sourceIncidentId?: string;
}

/**
 * Compliance gap analysis result
 */
export interface ComplianceGapResult {
  overallScore: number;
  gaps: ComplianceGap[];
  recommendations: ComplianceRecommendation[];
  prioritizedAudits: AuditRecommendation[];
}

export interface ComplianceGap {
  normId: string;
  normCode: string;
  requirementId: string;
  clause: string;
  description: string;
  severity: "critical" | "major" | "minor";
  suggestedAction: string;
}

export interface ComplianceRecommendation {
  type: "capa" | "audit" | "documentation" | "training";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  relatedNormIds: string[];
}

export interface AuditRecommendation {
  normId: string;
  normCode: string;
  reason: string;
  priority: "urgent" | "soon" | "planned";
  suggestedDate?: Date;
}

/**
 * Health trend analysis result
 */
export interface HealthTrendResult {
  trends: HealthTrend[];
  riskGroups: RiskGroup[];
  recommendations: PreventionRecommendation[];
  alerts: HealthAlert[];
}

export interface HealthTrend {
  type: string;
  direction: "increasing" | "stable" | "decreasing";
  changePercent: number;
  affectedDepartments: string[];
  affectedEmployeeCount: number;
  severity: "high" | "medium" | "low";
  confidence: number;
  periodMonths: number;
}

export interface RiskGroup {
  name: string;
  description: string;
  riskFactors: string[];
  primaryRisk: string;
  riskLevel: "high" | "medium" | "low";
  employeeCount: number;
  departmentIds: string[];
  suggestedActions: string[];
  priority: "immediate" | "short_term" | "medium_term";
}

export interface PreventionRecommendation {
  type: "prevention" | "training" | "equipment" | "monitoring";
  title: string;
  description: string;
  rationale: string;
  priority: "haute" | "moyenne" | "basse";
  expectedImpact: "high" | "medium" | "low";
  confidence: number;
  targetDepartments: string[];
  targetEmployeeCount?: number;
  suggestedCapaTitle?: string;
}

export interface HealthAlert {
  type: "exposure_threshold" | "trend_detected" | "visit_overdue";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  affectedCount?: number;
}

// =============================================================================
// Model Configuration Types
// =============================================================================

/**
 * Model configuration with thinking support
 */
export interface ModelConfig {
  /** Model name */
  model: string;
  /** Maximum output tokens */
  maxOutputTokens: number;
  /** Temperature for responses */
  temperature: number;
  /** Top P sampling */
  topP: number;
  /** Top K sampling */
  topK: number;
  /** Optional thinking configuration */
  thinkingConfig?: ThinkingConfig;
}

/**
 * Callback for thinking updates
 */
export type ThinkingCallback = (thinking: string) => void;

/**
 * Callback for agent action requests
 */
export type AgentActionCallback = (action: AgentActionRequest) => void;

/**
 * Extended stream options
 */
export interface StreamOptions {
  /** Enable tool execution */
  executeTools?: boolean;
  /** Callback for thinking updates */
  onThinking?: ThinkingCallback;
  /** Callback for agent actions */
  onAgentAction?: AgentActionCallback;
}

