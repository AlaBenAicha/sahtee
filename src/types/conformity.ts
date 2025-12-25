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

