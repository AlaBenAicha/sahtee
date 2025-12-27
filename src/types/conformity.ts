/**
 * Conformity Types - Regulatory compliance and audits
 */

import type { Timestamp } from "firebase/firestore";
import type { FirestoreDocument, AuditInfo, FileMetadata } from "./common";

/** Regulatory framework type */
export type RegulatoryFramework =
  | "iso_45001"       // Occupational Health & Safety
  | "iso_14001"       // Environmental Management
  | "iso_9001"        // Quality Management
  | "ohsas_18001"     // OH&S (deprecated, replaced by ISO 45001)
  | "tunisian_labor"  // Code du travail tunisien
  | "cnam"            // Caisse Nationale d'Assurance Maladie
  | "ancsep"          // Agence Nationale de Contrôle Sanitaire
  | "custom";         // Custom organizational requirements

/** Compliance status */
export type ComplianceStatus = 
  | "compliant"
  | "non_compliant"
  | "partially_compliant"
  | "not_applicable"
  | "pending_review";

/** Audit type */
export type AuditType = 
  | "internal"
  | "external"
  | "certification"
  | "surveillance"
  | "regulatory";

/** Requirement document in Firestore */
export interface Requirement extends FirestoreDocument {
  organizationId: string;
  
  // Requirement details
  code: string;
  title: string;
  description: string;
  framework: RegulatoryFramework;
  category: string;
  subcategory?: string;
  
  // Status
  status: ComplianceStatus;
  applicability: boolean;
  
  // Evidence
  evidenceRequired: boolean;
  evidence: Evidence[];
  
  // Timeline
  dueDate?: Timestamp;
  reviewFrequency: "monthly" | "quarterly" | "semi_annually" | "annually";
  lastReviewedAt?: Timestamp;
  nextReviewAt?: Timestamp;
  
  // Responsibility
  responsibleUserId: string;
  reviewerUserId?: string;
  
  // Linked items
  linkedCapaIds: string[];
  linkedDocumentIds: string[];
  
  // Notes
  notes?: string;
  
  // Audit
  audit: AuditInfo;
}

/** Evidence for compliance */
export interface Evidence {
  id: string;
  type: "document" | "photo" | "record" | "certificate" | "other";
  title: string;
  description?: string;
  file: FileMetadata;
  validUntil?: Timestamp;
  uploadedBy: string;
  uploadedAt: Timestamp;
}

/** Audit document in Firestore */
export interface Audit extends FirestoreDocument {
  organizationId: string;
  
  // Audit details
  title: string;
  type: AuditType;
  framework: RegulatoryFramework;
  scope: string;
  
  // Schedule
  plannedStartDate: Timestamp;
  plannedEndDate: Timestamp;
  actualStartDate?: Timestamp;
  actualEndDate?: Timestamp;
  
  // Participants
  leadAuditorId?: string;
  leadAuditorName?: string;
  auditors: AuditorInfo[];
  auditeeIds: string[];
  
  // Status
  status: AuditStatus;
  
  // Findings
  findings: Finding[];
  
  // Summary
  summary?: AuditSummary;
  
  // Documents
  documents: FileMetadata[];
  reportUrl?: string;
  
  // Audit
  audit: AuditInfo;
}

/** Audit status */
export type AuditStatus = 
  | "planned"
  | "in_progress"
  | "pending_report"
  | "completed"
  | "cancelled";

/** Auditor information */
export interface AuditorInfo {
  userId?: string;
  name: string;
  organization?: string;
  role: "lead" | "auditor" | "observer";
  external: boolean;
}

/** Audit finding */
export interface Finding extends FirestoreDocument {
  auditId: string;
  organizationId: string;
  
  // Finding details
  reference: string;
  requirement?: string;
  category: FindingCategory;
  severity: FindingSeverity;
  
  // Description
  title: string;
  description: string;
  objectiveEvidence: string;
  location?: string;
  
  // Status
  status: FindingStatus;
  
  // Response
  rootCause?: string;
  correction?: string;
  correctiveAction?: string;
  
  // Timeline
  responseDueDate?: Timestamp;
  responseDate?: Timestamp;
  closureDueDate?: Timestamp;
  closureDate?: Timestamp;
  
  // Verification
  verificationRequired: boolean;
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  verificationNotes?: string;
  
  // Links
  linkedCapaId?: string;
  
  // Evidence
  evidence: FileMetadata[];
  
  // Audit
  audit: AuditInfo;
}

/** Finding category */
export type FindingCategory =
  | "major_nonconformity"
  | "minor_nonconformity"
  | "observation"
  | "opportunity_for_improvement"
  | "positive_finding";

/** Finding severity */
export type FindingSeverity = "critical" | "major" | "minor" | "observation";

/** Finding status */
export type FindingStatus =
  | "open"
  | "response_pending"
  | "response_submitted"
  | "verification_pending"
  | "closed"
  | "closed_effective"
  | "closed_ineffective";

/** Audit summary */
export interface AuditSummary {
  totalFindings: number;
  majorNonconformities: number;
  minorNonconformities: number;
  observations: number;
  opportunities: number;
  positiveFindings: number;
  overallConclusion: "pass" | "conditional_pass" | "fail";
  recommendations: string[];
  strengths: string[];
  areasForImprovement: string[];
}

/** Compliance dashboard metrics */
export interface ComplianceMetrics {
  organizationId: string;
  calculatedAt: Timestamp;
  
  // Overall
  overallComplianceRate: number;
  
  // By framework
  frameworkCompliance: Record<RegulatoryFramework, number>;
  
  // Requirements
  totalRequirements: number;
  compliantCount: number;
  nonCompliantCount: number;
  partiallyCompliantCount: number;
  pendingCount: number;
  
  // Findings
  openFindings: number;
  overdueFindings: number;
  
  // Audits
  upcomingAudits: number;
  completedAuditsYTD: number;
}

/** Norm status */
export type NormStatus = 
  | "not_started"
  | "in_progress"
  | "compliant"
  | "non_compliant";

/** Norm/Standard document in Firestore */
export interface Norm extends FirestoreDocument {
  organizationId: string;
  
  // Norm details
  code: string;
  name: string;
  description?: string;
  framework: RegulatoryFramework;
  category: string;
  
  // Status tracking
  status: NormStatus;
  complianceScore: number; // 0-100
  
  // Requirements embedded or referenced
  requirementIds: string[];
  
  // Audit info
  lastAuditId?: string;
  lastAuditDate?: Timestamp;
  nextAuditDate?: Timestamp;
  
  // Metadata
  isActive: boolean;
  isCustom: boolean; // true if created by organization, false if seeded
  
  // Audit trail
  audit: AuditInfo;
}

/** Norm requirement (embedded in Norm for seeded data) */
export interface NormRequirement {
  id: string;
  clause: string;
  title: string;
  description: string;
  status: ComplianceStatus;
  evidenceRequired: boolean;
  evidence: Evidence[];
  notes?: string;
  linkedCapaIds: string[];
}

/** Norm with embedded requirements */
export interface NormWithRequirements extends Norm {
  requirements: NormRequirement[];
}

/** Filters for norms */
export interface NormFilters {
  framework?: RegulatoryFramework[];
  status?: NormStatus[];
  searchQuery?: string;
  isActive?: boolean;
}

/** Filters for audits */
export interface AuditFilters {
  status?: AuditStatus[];
  type?: AuditType[];
  framework?: RegulatoryFramework[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

/** Filters for findings */
export interface FindingFilters {
  category?: FindingCategory[];
  severity?: FindingSeverity[];
  status?: FindingStatus[];
  hasLinkedCapa?: boolean;
}

// =============================================================================
// AI Analysis History Types
// =============================================================================

/** Type of AI analysis performed */
export type AIAnalysisType = 
  | "gap_analysis"
  | "audit_planning" 
  | "capa_suggestions"
  | "compliance_report";

/** Priority level for recommendations */
export type AIRecommendationPriority = "high" | "medium" | "low";

/** Recommendation type */
export type AIRecommendationType = "gap" | "audit" | "capa" | "training" | "documentation";

/** AI Recommendation stored in analysis */
export interface AIRecommendationRecord {
  id: string;
  type: AIRecommendationType;
  priority: AIRecommendationPriority;
  title: string;
  description: string;
  action?: string;
  normId?: string;
  normCode?: string;
  requirementId?: string;
  clause?: string;
}

/** Gap identified during analysis */
export interface AIGapRecord {
  normId: string;
  normCode: string;
  requirementId: string;
  clause: string;
  description: string;
  severity: "critical" | "major" | "minor";
  suggestedAction?: string;
}

/** Audit recommendation from AI */
export interface AIAuditRecommendationRecord {
  normId: string;
  normCode: string;
  priority: "urgent" | "soon" | "planned";
  reason: string;
  suggestedDate?: string;
}

/** AI Analysis record stored in Firestore */
export interface AIAnalysis extends FirestoreDocument {
  organizationId: string;
  
  // Analysis metadata
  type: AIAnalysisType;
  title: string;
  description?: string;
  
  // Results
  overallScore: number;
  gaps: AIGapRecord[];
  recommendations: AIRecommendationRecord[];
  auditRecommendations: AIAuditRecommendationRecord[];
  
  // Context at time of analysis
  totalNorms: number;
  totalRequirements: number;
  compliantCount: number;
  nonCompliantCount: number;
  
  // AI details
  aiModel?: string;
  rawResponse?: string;
  
  // Audit trail
  analyzedBy: string;
  analyzedByName: string;
  audit: AuditInfo;
}

/** Filters for AI analysis history */
export interface AIAnalysisFilters {
  type?: AIAnalysisType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
  minScore?: number;
  maxScore?: number;
}

