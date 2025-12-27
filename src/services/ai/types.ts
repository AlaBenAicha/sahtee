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

// =============================================================================
// Multi-Methodology Root Cause Analysis Types
// =============================================================================

/**
 * Available root cause analysis methodologies
 */
export type RCAMethodologyType = 
  | "5why" 
  | "ishikawa" 
  | "fta" 
  | "barrier" 
  | "bowtie" 
  | "tripod" 
  | "hybrid";

/**
 * Root cause analysis methodology configuration and results
 */
export interface RootCauseMethodology {
  type: RCAMethodologyType;
  name: string;
  description: string;
  categories?: IshikawaCategory[];
  faultTree?: FaultTreeNode;
  barriers?: BarrierAnalysis[];
  bowtieData?: BowTieModel;
  tripodData?: TripodAnalysis;
  fiveWhys?: FiveWhysAnalysis;
  confidence: number;
  analysisDate: Date;
  analystId?: string;
}

/**
 * 5 Whys analysis structure
 */
export interface FiveWhysAnalysis {
  problem: string;
  whys: WhyStep[];
  rootCause: string;
  contributingFactors: ContributingFactor[];
  verificationMethod?: string;
}

export interface WhyStep {
  level: number;
  question: string;
  answer: string;
  evidence?: string;
  validated: boolean;
}

/**
 * Ishikawa (Fishbone) diagram categories - 6M model
 */
export type IshikawaCategoryName = 
  | "man" 
  | "machine" 
  | "method" 
  | "material" 
  | "measurement" 
  | "environment";

export interface IshikawaCategory {
  name: IshikawaCategoryName;
  label: string;
  factors: ContributingFactor[];
  subFactors: ContributingFactor[][];
  weight: number; // 0-1, contribution weight
}

export interface ContributingFactor {
  id: string;
  description: string;
  category: string;
  isPrimary: boolean;
  evidence?: string;
  linkedIncidentIds?: string[];
  confidence: number;
}

export interface IshikawaAnalysis {
  problem: string;
  categories: IshikawaCategory[];
  primaryCause: ContributingFactor;
  rootCause: string;
  analysisNotes?: string;
}

/**
 * Fault Tree Analysis (FTA) types
 */
export type FaultTreeNodeType = 
  | "top_event" 
  | "intermediate" 
  | "basic" 
  | "undeveloped" 
  | "conditioning" 
  | "transfer";

export type FaultTreeGateType = 
  | "AND" 
  | "OR" 
  | "INHIBIT" 
  | "XOR" 
  | "PRIORITY_AND" 
  | "VOTING";

export interface FaultTreeNode {
  id: string;
  type: FaultTreeNodeType;
  gateType?: FaultTreeGateType;
  description: string;
  probability?: number;
  children?: FaultTreeNode[];
  isMinimalCutSet?: boolean;
  evidence?: string;
  linkedCauseId?: string;
}

export interface FaultTreeAnalysis {
  topEvent: FaultTreeNode;
  minimalCutSets: string[][];
  criticalPath: string[];
  systemProbability: number;
  analysisNotes?: string;
}

/**
 * Barrier Analysis types
 */
export type BarrierType = 
  | "physical" 
  | "procedural" 
  | "administrative" 
  | "training" 
  | "ppe" 
  | "detection" 
  | "response";

export type BarrierStatus = 
  | "effective" 
  | "partially_effective" 
  | "failed" 
  | "missing" 
  | "bypassed";

export interface BarrierAnalysis {
  id: string;
  name: string;
  type: BarrierType;
  description: string;
  status: BarrierStatus;
  failureMode?: string;
  expectedFunction: string;
  actualPerformance: string;
  effectiveness: number; // 0-100
  recommendations: string[];
  linkedCapaIds?: string[];
}

export interface BarrierAnalysisResult {
  barriers: BarrierAnalysis[];
  failedBarriers: BarrierAnalysis[];
  missingBarriers: BarrierAnalysis[];
  overallDefenseScore: number;
  criticalGaps: string[];
  recommendations: string[];
}

/**
 * Bow-Tie Analysis types
 */
export interface BowTieThreat {
  id: string;
  description: string;
  category: string;
  likelihood: number; // 1-5
  preventiveBarriers: string[]; // BarrierAnalysis IDs
}

export interface BowTieConsequence {
  id: string;
  description: string;
  category: string;
  severity: number; // 1-5
  mitigatingBarriers: string[]; // BarrierAnalysis IDs
}

export interface BowTieModel {
  hazard: string;
  hazardDescription: string;
  threats: BowTieThreat[];
  consequences: BowTieConsequence[];
  preventiveBarriers: BarrierAnalysis[];
  mitigatingBarriers: BarrierAnalysis[];
  residualRiskScore: number;
  analysisNotes?: string;
}

/**
 * TRIPOD Beta Analysis types
 */
export type TripodPreconditionCategory = 
  | "hardware" 
  | "design" 
  | "procedures" 
  | "error_enforcing" 
  | "housekeeping" 
  | "incompatible_goals" 
  | "communication" 
  | "organization" 
  | "training" 
  | "defenses";

export interface TripodPrecondition {
  id: string;
  category: TripodPreconditionCategory;
  description: string;
  isLatentFailure: boolean;
  organizationalFactor?: string;
  linkedActions?: string[];
}

export interface TripodAnalysis {
  activeFailures: string[];
  preconditions: TripodPrecondition[];
  latentFailures: TripodPrecondition[];
  organizationalFactors: string[];
  recoveryOpportunities: string[];
  systemicIssues: string[];
}

/**
 * Enhanced incident analysis result with multi-methodology support
 */
export interface EnhancedIncidentAnalysis extends IncidentAnalysisResult {
  methodology: RootCauseMethodology;
  ishikawaAnalysis?: IshikawaAnalysis;
  faultTreeAnalysis?: FaultTreeAnalysis;
  barrierAnalysis?: BarrierAnalysisResult;
  bowtieAnalysis?: BowTieModel;
  tripodAnalysis?: TripodAnalysis;
  fiveWhysAnalysis?: FiveWhysAnalysis;
  hybridInsights?: string[];
  aiRecommendedMethodology?: RCAMethodologyType;
  methodologyRationale?: string;
}

// =============================================================================
// Predictive Intelligence Types
// =============================================================================

/**
 * Predictive insight types
 */
export type PredictionType = 
  | "imminent_risk" 
  | "trend_deviation" 
  | "pattern_recurrence" 
  | "exposure_threshold"
  | "seasonal_risk"
  | "resource_constraint";

/**
 * Predictive insight from AI analysis
 */
export interface PredictiveInsight {
  id: string;
  predictionType: PredictionType;
  riskScore: number; // 0-100
  confidenceInterval: { lower: number; upper: number };
  timeHorizon: "24h" | "7d" | "30d" | "90d";
  affectedAreas: {
    departments: string[];
    processes: string[];
    equipmentIds: string[];
    employeeGroups: string[];
  };
  triggeringFactors: PredictiveFactor[];
  preventiveActions: SuggestedCapa[];
  historicalBasis: string[]; // Incident IDs used for prediction
  createdAt: Date;
  expiresAt: Date;
  status: "active" | "mitigated" | "occurred" | "expired";
}

/**
 * Factor contributing to a prediction
 */
export interface PredictiveFactor {
  category: "behavioral" | "environmental" | "equipment" | "process" | "temporal";
  factor: string;
  currentValue: number;
  thresholdValue: number;
  trendDirection: "increasing" | "stable" | "decreasing";
  contribution: number; // % contribution to risk
  dataSource: string;
}

/**
 * Pattern cluster from incident analysis
 */
export interface PatternCluster {
  id: string;
  name: string;
  description: string;
  incidentIds: string[];
  commonFactors: string[];
  category: string;
  severity: "high" | "medium" | "low";
  frequency: number; // incidents per month
  lastOccurrence: Date;
  trendDirection: "increasing" | "stable" | "decreasing";
  suggestedActions: SuggestedCapa[];
}

// =============================================================================
// CAPA Dependency & Orchestration Types
// =============================================================================

/**
 * CAPA node in dependency graph
 */
export interface CAPANode {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date;
  progress: number;
  assigneeId?: string;
  estimatedDuration: number; // days
  actualDuration?: number;
  criticalityScore: number; // 0-100
}

/**
 * Edge type in CAPA dependency graph
 */
export type CAPAEdgeType = 
  | "blocks" 
  | "informs" 
  | "supersedes" 
  | "conflicts" 
  | "enhances"
  | "requires";

/**
 * CAPA dependency edge
 */
export interface CAPAEdge {
  from: string;
  to: string;
  type: CAPAEdgeType;
  strength: number; // 0-1
  description?: string;
}

/**
 * Full CAPA dependency graph
 */
export interface CAPADependencyGraph {
  nodes: CAPANode[];
  edges: CAPAEdge[];
  criticalPath: string[]; // IDs of CAPAs on critical path
  estimatedTotalDuration: number; // days
  bottlenecks: string[]; // IDs of bottleneck CAPAs
  parallelizableGroups: string[][];
}

// =============================================================================
// CAPA Health & Monitoring Types
// =============================================================================

/**
 * CAPA health risk factors
 */
export type CAPAHealthRiskFactor = 
  | "progress_stalled" 
  | "due_date_approaching" 
  | "resource_conflict" 
  | "dependency_blocked" 
  | "no_recent_updates" 
  | "effectiveness_declining"
  | "scope_creep"
  | "missing_verification";

/**
 * CAPA health risk
 */
export interface CAPAHealthRisk {
  factor: CAPAHealthRiskFactor;
  severity: "low" | "medium" | "high";
  description: string;
  daysToImpact?: number;
  suggestedAction?: string;
}

/**
 * Intervention suggestion for at-risk CAPAs
 */
export interface CAPAIntervention {
  type: "escalate" | "reassign" | "extend" | "split" | "merge" | "cancel";
  description: string;
  rationale: string;
  expectedOutcome: string;
  urgency: "immediate" | "soon" | "planned";
}

/**
 * CAPA health status
 */
export interface CAPAHealthStatus {
  capaId: string;
  healthScore: number; // 0-100
  status: "healthy" | "at_risk" | "critical" | "overdue";
  riskFactors: CAPAHealthRisk[];
  suggestedInterventions: CAPAIntervention[];
  lastAssessedAt: Date;
  trendDirection: "improving" | "stable" | "declining";
}

// =============================================================================
// Escalation Types
// =============================================================================

/**
 * Escalation trigger condition
 */
export interface EscalationTrigger {
  type: "overdue" | "stalled" | "blocked" | "risk_increase" | "manual";
  threshold?: number;
  daysThreshold?: number;
  condition?: string;
}

/**
 * Escalation step recipient
 */
export interface EscalationRecipient {
  role: string;
  specificUsers?: string[];
}

/**
 * Escalation step action
 */
export type EscalationAction = 
  | "notify" 
  | "request_approval" 
  | "auto_reassign" 
  | "create_meeting"
  | "create_follow_up";

/**
 * Single step in escalation path
 */
export interface EscalationStep {
  level: number;
  recipients: EscalationRecipient[];
  action: EscalationAction;
  deadline: number; // hours to respond
  messageTemplate: string;
  autoEscalateOnNoResponse: boolean;
}

/**
 * Escalation policy configuration
 */
export interface EscalationPolicy {
  id: string;
  name: string;
  description: string;
  triggerConditions: EscalationTrigger[];
  escalationPath: EscalationStep[];
  notificationChannels: ("email" | "push" | "sms" | "teams")[];
  cooldownPeriod: number; // hours
  isActive: boolean;
  organizationId: string;
}

// =============================================================================
// Effectiveness Tracking Types
// =============================================================================

/**
 * CAPA effectiveness metrics
 */
export interface CAPAEffectivenessMetrics {
  capaId: string;
  measurementPeriod: { start: Date; end: Date };
  baselineIncidentRate: number; // per month before CAPA
  postImplementationRate: number; // per month after CAPA
  reductionPercentage: number;
  relatedIncidentsAfter: string[];
  qualitativeAssessment?: string;
  lessonsLearned: string[];
  reusabilityScore: number; // 0-100, how applicable to future similar situations
  verificationStatus: "pending" | "effective" | "partially_effective" | "ineffective";
  verifiedBy?: string;
  verifiedAt?: Date;
}

/**
 * Learning data for AI model improvement
 */
export interface AILearningData {
  id: string;
  capaId: string;
  incidentId?: string;
  recommendationType: string;
  wasAccepted: boolean;
  wasModified: boolean;
  finalOutcome: "success" | "partial" | "failure";
  feedbackNotes?: string;
  timestamp: Date;
  organizationId: string;
}

// =============================================================================
// Cross-Module Intelligence Types
// =============================================================================

/**
 * Holistic recommendation spanning multiple modules
 */
export interface HolisticRecommendation {
  id: string;
  primaryModule: "capa" | "health" | "conformity" | "training" | "equipment";
  secondaryModules: string[];
  recommendation: {
    capa?: SuggestedCapa;
    training?: TrainingRecommendation;
    audit?: AuditRecommendation;
    healthMonitoring?: HealthMonitoringPlan;
    equipmentAction?: EquipmentActionRecommendation;
  };
  impactAnalysis: {
    riskReduction: number; // Expected % reduction
    complianceImprovement: number;
    costEstimate: { min: number; max: number; currency: string };
    timeToImpact: number; // days
  };
  synergies: string[]; // How actions reinforce each other
  confidence: number;
  priority: "critique" | "haute" | "moyenne" | "basse";
}

/**
 * Training recommendation from AI
 */
export interface TrainingRecommendation {
  title: string;
  description: string;
  targetAudience: string[];
  estimatedDuration: number; // hours
  priority: "haute" | "moyenne" | "basse";
  linkedIncidentIds?: string[];
  competencyGaps?: string[];
}

/**
 * Health monitoring plan recommendation
 */
export interface HealthMonitoringPlan {
  title: string;
  description: string;
  targetDepartments: string[];
  monitoringFrequency: "daily" | "weekly" | "monthly" | "quarterly";
  metrics: string[];
  thresholds: { metric: string; warningLevel: number; criticalLevel: number }[];
}

/**
 * Equipment action recommendation
 */
export interface EquipmentActionRecommendation {
  equipmentId?: string;
  actionType: "maintenance" | "replacement" | "upgrade" | "inspection" | "calibration";
  description: string;
  priority: "haute" | "moyenne" | "basse";
  estimatedCost?: { min: number; max: number; currency: string };
  deadline?: Date;
}

// =============================================================================
// Investigation Report Types
// =============================================================================

/**
 * Investigation report section
 */
export interface ReportAppendix {
  title: string;
  type: "document" | "image" | "data" | "chart";
  content: string;
  reference?: string;
}

/**
 * Complete investigation report
 */
export interface InvestigationReport {
  id: string;
  incidentId: string;
  format: "detailed" | "executive" | "regulatory";
  language: "fr" | "en" | "ar";
  sections: {
    summary: string;
    incidentDescription: string;
    investigationProcess: string;
    rootCauseAnalysis: string;
    correctiveActions: string;
    preventiveMeasures: string;
    lessonsLearned: string;
    appendices: ReportAppendix[];
  };
  generatedAt: Date;
  generatedBy: string;
  exportFormats: ("pdf" | "docx" | "html")[];
  aiConfidence: number;
}

