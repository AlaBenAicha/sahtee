/**
 * CAPA Types - Corrective and Preventive Action Management
 * 
 * This module defines types for:
 * - Action Plans (CAPA)
 * - Incidents
 * - Training Plans
 * - Equipment Recommendations
 * - AI Analysis
 */

import type { Timestamp } from "firebase/firestore";
import type { FirestoreDocument, AuditInfo, FileMetadata, Priority } from "./common";

// =============================================================================
// Action Plan Types
// =============================================================================

/** CAPA priority levels (French terminology) */
export type ActionPriority = "critique" | "haute" | "moyenne" | "basse";

/** Action plan status */
export type ActionStatus = 
  | "draft"
  | "pending_approval"
  | "approved"
  | "in_progress"
  | "blocked"
  | "completed"
  | "verified"
  | "closed";

/** Action plan category */
export type ActionCategory = "correctif" | "preventif";

/** Action Plan document in Firestore */
export interface ActionPlan extends FirestoreDocument {
  organizationId: string;
  
  // Basic info
  reference: string;
  title: string;
  description: string;
  
  // Classification
  category: ActionCategory;
  priority: ActionPriority;
  status: ActionStatus;
  
  // Risk info
  riskId?: string;
  riskDescription?: string;
  
  // Assignment
  assigneeId: string;
  assigneeName: string;
  departmentId?: string;
  reviewerId?: string;
  
  // Timeline
  dueDate: Timestamp;
  completedAt?: Timestamp;
  verifiedAt?: Timestamp;
  
  // Progress
  progress: number; // 0-100
  checklistItems: ChecklistItem[];
  
  // Source
  sourceType: "incident" | "audit" | "risk_assessment" | "observation" | "ai_suggestion" | "manual";
  sourceIncidentId?: string;
  sourceAuditId?: string;
  sourceFindingId?: string;

  // Linked items
  linkedTrainingIds: string[];
  linkedEquipmentIds: string[];
  linkedDocumentIds: string[];
  
  // AI integration
  aiGenerated: boolean;
  aiConfidence: number; // 0-100
  aiSuggestions?: string[];
  
  // Completion
  completionProof?: CompletionProof;
  effectivenessReview?: EffectivenessReview;
  
  // Comments
  comments: ActionComment[];
  
  // Audit
  audit: AuditInfo;
}

/** Checklist item within an action plan */
export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Timestamp;
  order: number;
}

/** Proof of completion for action plan */
export interface CompletionProof {
  photos: FileMetadata[];
  documents: FileMetadata[];
  notes?: string;
  verifiedBy: string;
  verifiedAt: Timestamp;
}

/** Effectiveness review after action completion */
export interface EffectivenessReview {
  reviewDate: Timestamp;
  reviewedBy: string;
  effective: boolean;
  notes: string;
  followUpRequired: boolean;
  followUpCapaId?: string;
}

/** Comment on action plan */
export interface ActionComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Timestamp;
  attachments?: FileMetadata[];
}

// =============================================================================
// Training Types
// =============================================================================

/** Training priority */
export type TrainingPriority = "obligatoire" | "recommandee" | "optionnelle";

/** Training plan source */
export type TrainingSource = "manual" | "ai_recommendation" | "incident_derived" | "compliance";

/** Training plan document */
export interface TrainingPlan extends FirestoreDocument {
  organizationId: string;
  
  // Course info
  courseId: string;
  courseName: string;
  description: string;
  category: string;
  duration: number; // in minutes
  
  // Assignment
  assignedEmployees: string[];
  departmentIds: string[];
  
  // Timeline
  dueDate: Timestamp;
  availableFrom: Timestamp;
  
  // Priority & Source
  priority: TrainingPriority;
  source: TrainingSource;
  mandatory: boolean;
  
  // Links
  linkedActionPlanId?: string;
  linkedIncidentId?: string;
  
  // Progress
  completionStatus: TrainingCompletionStatus;
  
  // Audit
  audit: AuditInfo;
}

/** Training completion statistics */
export interface TrainingCompletionStatus {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
}

/** Individual training record */
export interface TrainingRecord extends FirestoreDocument {
  organizationId: string;
  trainingPlanId: string;
  employeeId: string;
  
  // Status
  status: "not_started" | "in_progress" | "completed" | "failed";
  
  // Progress
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  progress: number; // 0-100
  score?: number;
  
  // Certification
  certificateUrl?: string;
  expiresAt?: Timestamp;
  
  // Audit
  audit: AuditInfo;
}

// =============================================================================
// Equipment Types
// =============================================================================

/** Equipment category */
export type EquipmentCategory = "epi" | "ergonomie" | "securite" | "signalisation" | "autre";

/** Equipment recommendation priority */
export type EquipmentPriority = "urgent" | "important" | "suggere";

/** Equipment status */
export type EquipmentStatus = "pending" | "ordered" | "received" | "deployed" | "rejected";

/** Equipment recommendation document */
export interface EquipmentRecommendation extends FirestoreDocument {
  organizationId: string;
  
  // Equipment details
  name: string;
  category: EquipmentCategory;
  description: string;
  manufacturer?: string;
  model?: string;
  
  // Specifications
  certifications: string[];
  features: string[];
  specifications?: Record<string, string>;
  
  // AI reasoning
  aiReason: string;
  aiConfidence: number; // 0-100
  
  // Links
  linkedActionPlanId?: string;
  linkedIncidentId?: string;
  linkedRiskAssessmentId?: string;
  
  // Priority & Status
  priority: EquipmentPriority;
  status: EquipmentStatus;
  
  // Quantity
  quantityRecommended: number;
  quantityOrdered?: number;
  quantityReceived?: number;
  
  // Cost
  estimatedCost?: number;
  actualCost?: number;
  
  // Images
  images: FileMetadata[];
  
  // Audit
  audit: AuditInfo;
}

// =============================================================================
// Incident Types
// =============================================================================

/** Incident severity */
export type IncidentSeverity = "minor" | "moderate" | "severe" | "critical";

/** Incident status */
export type IncidentStatus = 
  | "reported"
  | "acknowledged"
  | "investigating"
  | "action_plan_created"
  | "resolved"
  | "closed";

/** Incident document in Firestore */
export interface Incident extends FirestoreDocument {
  organizationId: string;
  
  // Reference
  reference: string;
  
  // Reporter
  reportedBy: string;
  reporterName: string;
  reportedAt: Timestamp;
  
  // Location
  siteId?: string;
  departmentId?: string;
  location: string;
  qrCodeId?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Classification
  category: string;
  subcategory?: string;
  severity: IncidentSeverity;
  type: "accident" | "near_miss" | "unsafe_condition" | "unsafe_act";
  
  // Description
  description: string;
  immediateActions: string;
  
  // People involved
  witnesses: WitnessInfo[];
  affectedPersons: AffectedPerson[];
  
  // Evidence
  photos: FileMetadata[];
  documents: FileMetadata[];
  
  // Investigation
  status: IncidentStatus;
  investigatorId?: string;
  investigationStartedAt?: Timestamp;
  investigationCompletedAt?: Timestamp;
  rootCause?: string;
  contributingFactors?: string[];
  
  // AI Analysis
  aiAnalysis?: AIIncidentAnalysis;
  
  // Linked items
  linkedActionPlanId?: string;
  linkedCapaIds: string[];
  
  // Regulatory
  reportableToAuthorities: boolean;
  reportedToAuthorities: boolean;
  reportedToAuthoritiesAt?: Timestamp;
  
  // Audit
  audit: AuditInfo;
}

/** Witness information */
export interface WitnessInfo {
  id: string;
  name: string;
  employeeId?: string;
  department?: string;
  statement?: string;
  contactInfo?: string;
}

/** Affected person information */
export interface AffectedPerson {
  id: string;
  name: string;
  employeeId?: string;
  type: "employee" | "contractor" | "visitor" | "other";
  injuryType?: string;
  injurySeverity?: "none" | "first_aid" | "medical_treatment" | "hospitalization" | "fatality";
  daysLost?: number;
}

/** AI analysis of incident */
export interface AIIncidentAnalysis {
  analyzedAt: Timestamp;
  confidence: number; // 0-100
  
  // Root cause analysis
  rootCause: string;
  rootCauseCategory: string;
  contributingFactors: string[];
  
  // Recommendations
  recommendedActions: AIRecommendedAction[];
  
  // Pattern matching
  similarIncidents: SimilarIncident[];
  patternIdentified: boolean;
  patternDescription?: string;
  
  // Prevention
  preventiveMeasures: string[];
  trainingRecommendations: string[];
  equipmentRecommendations: string[];
}

/** AI recommended action */
export interface AIRecommendedAction {
  id: string;
  type: "capa" | "training" | "equipment" | "process_change";
  title: string;
  description: string;
  priority: Priority;
  confidence: number;
}

/** Similar incident reference */
export interface SimilarIncident {
  id: string;
  reference: string;
  similarity: number; // 0-100
  date: Timestamp;
  summary: string;
}

// =============================================================================
// QR Code Types
// =============================================================================

/** QR Code configuration */
export interface QRCodeConfig extends FirestoreDocument {
  organizationId: string;
  
  // Code info
  code: string;
  label: string;
  
  // Location
  siteId?: string;
  location: string;
  equipmentId?: string;
  
  // Link
  deepLink: string;
  actionType: "report_incident" | "view_procedures" | "check_equipment" | "other";
  
  // Usage
  active: boolean;
  scannedCount: number;
  lastScannedAt?: Timestamp;
  lastScannedBy?: string;
  
  // Audit
  audit: AuditInfo;
}

// =============================================================================
// CAPA Room State Types (UI State)
// =============================================================================

/** Active tab in CAPA room */
export type CAPATabView =
  | "actions"
  | "training"
  | "equipment"
  | "incidents"
  | "scheduler";

/** View mode for lists */
export type ViewMode = "kanban" | "list" | "calendar" | "timeline";

/** CAPA room UI state */
export interface CAPARoomState {
  activeTab: CAPATabView;
  viewMode: ViewMode;
  filters: CAPAFilters;
  
  // Modals
  showIncidentModal: boolean;
  showActionModal: boolean;
  
  // Selection
  selectedActionId: string | null;
  selectedIncidentId: string | null;
  
  // AI
  aiRecommendations: AIRecommendedAction[];
  showAIPanel: boolean;
}

/** Filters for CAPA views */
export interface CAPAFilters {
  status?: ActionStatus[];
  priority?: ActionPriority[];
  category?: ActionCategory[];
  assigneeId?: string;
  departmentId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}
