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
}

/**
 * Streaming chunk from AI
 */
export interface AIStreamChunk {
  type: "text" | "function_call" | "done" | "error";
  content?: string;
  functionCall?: FunctionCall;
  error?: string;
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

