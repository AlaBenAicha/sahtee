/**
 * Health Types - Occupational Health & Safety Management
 */

import type { Timestamp } from "firebase/firestore";
import type { FirestoreDocument, AuditInfo, FileMetadata, Address } from "./common";

/** Risk level classification */
export type RiskLevel = "negligible" | "low" | "medium" | "high" | "critical";

/** Hazard category */
export type HazardCategory =
  | "physical"         // Noise, vibration, radiation
  | "chemical"         // Toxic, corrosive, flammable
  | "biological"       // Bacteria, viruses, fungi
  | "ergonomic"        // Posture, repetitive motion
  | "psychosocial"     // Stress, harassment, workload
  | "mechanical"       // Moving parts, sharp objects
  | "electrical"       // Shock, arc flash
  | "thermal"          // Heat, cold, fire
  | "environmental";   // Weather, lighting, confined spaces

/** Employee health record in Firestore */
export interface HealthRecord extends FirestoreDocument {
  organizationId: string;
  employeeId: string;
  
  // Personal info (reference)
  employeeName: string;
  departmentId: string;
  jobTitle: string;
  
  // Medical fitness
  fitnessStatus: FitnessStatus;
  restrictions: MedicalRestriction[];
  
  // Examinations
  examinations: MedicalExamination[];
  nextExaminationDue: Timestamp;
  
  // Vaccinations
  vaccinations: Vaccination[];
  
  // Exposure tracking
  exposures: ExposureRecord[];
  
  // Work accidents
  accidents: AccidentRecord[];
  
  // Confidential notes (encrypted reference)
  hasConfidentialNotes: boolean;
  
  // Audit
  audit: AuditInfo;
}

/** Medical fitness status */
export type FitnessStatus = 
  | "fit"
  | "fit_with_restrictions"
  | "temporarily_unfit"
  | "permanently_unfit"
  | "pending_examination";

/** Medical restriction */
export interface MedicalRestriction {
  id: string;
  type: string;
  description: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  permanent: boolean;
  issuedBy: string;
}

/** Medical examination record */
export interface MedicalExamination {
  id: string;
  type: ExaminationType;
  date: Timestamp;
  conductedBy: string;
  location: string;
  result: FitnessStatus;
  notes?: string;
  documents: FileMetadata[];
  nextDueDate?: Timestamp;
}

/** Types of medical examinations */
export type ExaminationType =
  | "pre_employment"
  | "periodic"
  | "return_to_work"
  | "special_surveillance"
  | "exit";

/** Vaccination record */
export interface Vaccination {
  id: string;
  name: string;
  date: Timestamp;
  batchNumber?: string;
  administeredBy?: string;
  nextDoseDate?: Timestamp;
  required: boolean;
}

/** Exposure record for hazardous substances */
export interface ExposureRecord {
  id: string;
  hazardType: HazardCategory;
  substance?: string;
  exposureLevel: "low" | "medium" | "high";
  duration: string;
  frequency: string;
  controlMeasures: string[];
  monitoringResults?: MonitoringResult[];
  startDate: Timestamp;
  endDate?: Timestamp;
}

/** Monitoring result for exposure */
export interface MonitoringResult {
  date: Timestamp;
  type: string;
  value: number;
  unit: string;
  limitValue: number;
  withinLimits: boolean;
}

/** Work accident record */
export interface AccidentRecord {
  id: string;
  incidentId: string;
  date: Timestamp;
  type: AccidentType;
  severity: "minor" | "moderate" | "severe" | "fatal";
  daysLost: number;
  returnToWorkDate?: Timestamp;
  permanentDisability: boolean;
  compensationClaimed: boolean;
}

/** Types of work accidents */
export type AccidentType =
  | "fall"
  | "struck_by"
  | "caught_in"
  | "overexertion"
  | "contact_with"
  | "transportation"
  | "exposure"
  | "other";

/** Risk assessment document */
export interface RiskAssessment extends FirestoreDocument {
  organizationId: string;
  
  // Assessment details
  title: string;
  reference: string;
  description: string;
  
  // Scope
  departmentId?: string;
  siteId?: string;
  processId?: string;
  area: string;
  
  // Status
  status: RiskAssessmentStatus;
  
  // Assessment data
  hazards: HazardAssessment[];
  
  // Summary
  overallRiskLevel: RiskLevel;
  residualRiskLevel: RiskLevel;
  
  // Review
  assessedBy: string;
  assessedAt: Timestamp;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  nextReviewDate: Timestamp;
  
  // Documents
  documents: FileMetadata[];
  
  // Audit
  audit: AuditInfo;
}

/** Risk assessment status */
export type RiskAssessmentStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "requires_update"
  | "archived";

/** Individual hazard assessment within a risk assessment */
export interface HazardAssessment {
  id: string;
  
  // Hazard identification
  hazardCategory: HazardCategory;
  hazardDescription: string;
  source: string;
  affectedPersons: string[];
  
  // Initial risk evaluation
  initialLikelihood: 1 | 2 | 3 | 4 | 5;
  initialSeverity: 1 | 2 | 3 | 4 | 5;
  initialRiskScore: number;
  initialRiskLevel: RiskLevel;
  
  // Control measures
  existingControls: string[];
  additionalControls: ControlMeasure[];
  
  // Residual risk evaluation
  residualLikelihood: 1 | 2 | 3 | 4 | 5;
  residualSeverity: 1 | 2 | 3 | 4 | 5;
  residualRiskScore: number;
  residualRiskLevel: RiskLevel;
  
  // Action required
  actionRequired: boolean;
  linkedCapaId?: string;
  priority: "immediate" | "short_term" | "medium_term" | "long_term";
}

/** Control measure */
export interface ControlMeasure {
  id: string;
  type: ControlType;
  description: string;
  responsibleUserId: string;
  dueDate: Timestamp;
  status: "planned" | "in_progress" | "implemented" | "verified";
  implementedDate?: Timestamp;
  effectiveness?: "effective" | "partially_effective" | "ineffective";
}

/** Hierarchy of control measures */
export type ControlType =
  | "elimination"       // Remove the hazard
  | "substitution"      // Replace with less hazardous
  | "engineering"       // Isolate people from hazard
  | "administrative"    // Change the way people work
  | "ppe";              // Personal protective equipment

/** PPE (Personal Protective Equipment) record */
export interface PPERecord extends FirestoreDocument {
  organizationId: string;
  
  // Equipment details
  name: string;
  type: PPEType;
  manufacturer: string;
  model: string;
  size?: string;
  
  // Assignment
  assignedTo: string;
  departmentId: string;
  
  // Status
  status: "in_use" | "available" | "maintenance" | "retired";
  condition: "good" | "fair" | "poor" | "damaged";
  
  // Lifecycle
  issueDate: Timestamp;
  expiryDate?: Timestamp;
  lastInspectionDate?: Timestamp;
  nextInspectionDate?: Timestamp;
  
  // Training
  trainingRequired: boolean;
  trainingCompleted: boolean;
  
  // Certification
  certificationNumber?: string;
  certificationStandard?: string;
  
  // Audit
  audit: AuditInfo;
}

/** Types of PPE */
export type PPEType =
  | "head"          // Helmets, hard hats
  | "eye"           // Safety glasses, goggles
  | "face"          // Face shields
  | "hearing"       // Earplugs, earmuffs
  | "respiratory"   // Masks, respirators
  | "hand"          // Gloves
  | "foot"          // Safety boots
  | "body"          // Coveralls, aprons
  | "fall"          // Harnesses, lanyards
  | "other";

/** Health & Safety metrics */
export interface HealthMetrics {
  organizationId: string;
  calculatedAt: Timestamp;
  period: "monthly" | "quarterly" | "yearly";
  periodStart: Timestamp;
  periodEnd: Timestamp;
  
  // Accident rates
  totalAccidents: number;
  lostTimeAccidents: number;
  daysLost: number;
  ltifr: number; // Lost Time Injury Frequency Rate
  trir: number;  // Total Recordable Incident Rate
  
  // Near misses
  nearMisses: number;
  nearMissReportingRate: number;
  
  // Health surveillance
  examinationsCompleted: number;
  examinationsOverdue: number;
  fitForWork: number;
  restrictedDuty: number;
  
  // Risk assessments
  totalRiskAssessments: number;
  overdueReviews: number;
  highRiskHazards: number;
  
  // Training
  safetyTrainingCompleted: number;
  trainingComplianceRate: number;
}

// =============================================================================
// Medical Visit Types (Visit Planning)
// =============================================================================

/** Medical visit status */
export type MedicalVisitStatus = 
  | "scheduled" 
  | "completed" 
  | "cancelled" 
  | "no_show" 
  | "overdue";

/** Medical visit record for planning and tracking */
export interface MedicalVisit {
  id: string;
  organizationId: string;
  
  // Employee info
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  
  // Visit details
  type: ExaminationType;
  status: MedicalVisitStatus;
  reason?: string;
  
  // Scheduling
  scheduledDate: Timestamp;
  scheduledTime?: string;
  completedDate?: Timestamp;
  
  // Location and physician
  physicianId: string;
  physicianName: string;
  location: string;
  
  // Findings (physician-only, filled after completion)
  findings?: string;
  recommendations?: string[];
  fitnessDecision?: FitnessStatus;
  restrictionsIssued?: MedicalRestriction[];
  
  // Follow-up
  nextVisitRecommended?: Timestamp;
  nextVisitType?: ExaminationType;
  
  // Documents
  documents: FileMetadata[];
  
  // Audit
  audit: AuditInfo;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// =============================================================================
// Health Alert Types
// =============================================================================

/** Types of health alerts */
export type HealthAlertType = 
  | "exposure_threshold"   // Exposure exceeds regulatory limits
  | "visit_overdue"        // Medical visit overdue
  | "trend_detected"       // AI detected concerning trend
  | "outbreak"             // Potential outbreak detected
  | "fitness_change"       // Employee fitness status changed
  | "restriction_expiry";  // Medical restriction expiring

/** Health alert severity levels */
export type HealthAlertSeverity = "info" | "warning" | "critical";

/** Health alert status */
export type HealthAlertStatus = "active" | "acknowledged" | "resolved";

/** Health alert record */
export interface HealthAlert {
  id: string;
  organizationId: string;
  
  // Alert details
  type: HealthAlertType;
  severity: HealthAlertSeverity;
  title: string;
  description: string;
  
  // Scope
  affectedDepartments?: string[];
  affectedEmployeeCount?: number;
  siteId?: string;
  
  // Status
  status: HealthAlertStatus;
  acknowledgedAt?: Timestamp;
  acknowledgedBy?: string;
  resolvedAt?: Timestamp;
  resolvedBy?: string;
  resolutionNotes?: string;
  
  // Linked actions
  linkedCapaId?: string;
  linkedVisitIds?: string[];
  
  // Source data
  sourceType?: "exposure" | "visit" | "ai_analysis" | "manual";
  sourceId?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// =============================================================================
// Health Statistics Types (for Dashboard)
// =============================================================================

/** Aggregate health statistics for dashboard tiles */
export interface HealthStats {
  organizationId: string;
  calculatedAt: Timestamp;
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Active cases
  activeCases: number;
  activeCasesChange: number; // vs previous period
  
  // Medical surveillance
  employeesUnderSurveillance: number;
  pendingVisits: number;
  overdueVisits: number;
  
  // Absenteeism
  absenteeismRate: number; // percentage
  absenteeismDays: number;
  absenteeismChange: number; // vs previous period
  
  // Fitness status breakdown
  fitnessByStatus: Record<FitnessStatus, number>;
  
  // Alerts
  activeAlerts: number;
  criticalAlerts: number;
  
  // By pathology type
  byPathology: PathologyStats[];
  
  // By department
  byDepartment: DepartmentHealthStats[];
}

/** Pathology statistics */
export interface PathologyStats {
  type: PathologyType;
  count: number;
  trend: "increasing" | "stable" | "decreasing";
  changePercent: number;
}

/** Pathology types for health tracking */
export type PathologyType = 
  | "tms"           // Troubles musculo-squelettiques
  | "rps"           // Risques psychosociaux
  | "respiratory"   // Affections respiratoires
  | "cardiovascular" // Affections cardiovasculaires
  | "dermatological" // Affections dermatologiques
  | "hearing"       // Troubles auditifs
  | "vision"        // Troubles visuels
  | "other";

/** Department health statistics */
export interface DepartmentHealthStats {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  activeCases: number;
  absenteeismRate: number;
  riskLevel: RiskLevel;
}

// =============================================================================
// Exposure Monitoring Types
// =============================================================================

/** Organization-level exposure record (aggregated) */
export interface OrganizationExposure {
  id: string;
  organizationId: string;
  
  // Exposure identification
  hazardType: HazardCategory;
  agent: string; // e.g., "Silica dust", "Noise > 85dB", "Benzene"
  
  // Location
  siteId?: string;
  siteName?: string;
  departmentId?: string;
  departmentName?: string;
  area: string;
  
  // Regulatory limits
  regulatoryLimit: number;
  unit: string;
  regulatoryReference?: string; // e.g., "VLEP 8h"
  
  // Current measurement
  lastMeasurement: number;
  lastMeasurementDate: Timestamp;
  percentOfLimit: number;
  
  // Historical data
  measurementHistory: ExposureMeasurement[];
  
  // Status
  alertLevel: "low" | "moderate" | "elevated" | "critical";
  exceedanceCount: number; // Number of times limit exceeded
  
  // Affected employees
  exposedEmployeeCount: number;
  exposedEmployeeIds: string[];
  
  // Control measures
  controlMeasures: string[];
  linkedCapaIds: string[];
  
  // Monitoring schedule
  monitoringFrequency: "continuous" | "weekly" | "monthly" | "quarterly" | "annually";
  nextMeasurementDue: Timestamp;
  
  // Audit
  audit: AuditInfo;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Individual exposure measurement */
export interface ExposureMeasurement {
  id: string;
  date: Timestamp;
  value: number;
  unit: string;
  measuredBy: string;
  method: string;
  duration: string; // e.g., "8h TWA"
  withinLimits: boolean;
  notes?: string;
  documentId?: string;
}

// =============================================================================
// Health-AI Types
// =============================================================================

/** AI-generated health analysis */
export interface AIHealthAnalysis {
  id: string;
  organizationId: string;
  
  // Analysis metadata
  analyzedAt: Timestamp;
  analysisType: "trend" | "risk" | "prevention" | "comprehensive";
  periodAnalyzed: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Detected trends
  trends: HealthTrend[];
  
  // Risk groups
  riskGroups: RiskGroup[];
  
  // Recommendations
  recommendations: AIHealthRecommendation[];
  
  // Overall assessment
  overallRiskLevel: RiskLevel;
  confidence: number; // 0-1
  
  // Data sources used
  dataSources: string[];
  recordsAnalyzed: number;
  
  // Status
  status: "generated" | "reviewed" | "actioned";
  reviewedBy?: string;
  reviewedAt?: Timestamp;
}

/** Health trend detected by AI */
export interface HealthTrend {
  id: string;
  type: PathologyType | HazardCategory;
  description: string;
  
  // Trend direction
  direction: "increasing" | "stable" | "decreasing";
  changePercent: number;
  
  // Scope
  affectedDepartments: string[];
  affectedEmployeeCount: number;
  
  // Severity
  severity: "low" | "medium" | "high";
  confidence: number;
  
  // Time period
  periodMonths: number;
  dataPoints: TrendDataPoint[];
}

/** Data point for trend visualization */
export interface TrendDataPoint {
  date: Timestamp;
  value: number;
  label?: string;
}

/** Risk group identified by AI */
export interface RiskGroup {
  id: string;
  name: string;
  description: string;
  
  // Group characteristics
  riskFactors: string[];
  primaryRisk: PathologyType | HazardCategory;
  riskLevel: RiskLevel;
  
  // Affected employees
  employeeCount: number;
  departmentIds: string[];
  
  // Suggested actions
  suggestedActions: string[];
  priority: "immediate" | "short_term" | "medium_term" | "long_term";
}

/** AI-generated health recommendation */
export interface AIHealthRecommendation {
  id: string;
  type: "prevention" | "training" | "equipment" | "procedure" | "monitoring";
  
  // Recommendation details
  title: string;
  description: string;
  rationale: string;
  
  // Priority and impact
  priority: "haute" | "moyenne" | "basse";
  expectedImpact: "high" | "medium" | "low";
  confidence: number;
  
  // Scope
  targetDepartments?: string[];
  targetEmployeeCount?: number;
  
  // Actions
  suggestedCapaTitle?: string;
  suggestedCapaDescription?: string;
  linkedTrainingIds?: string[];
  linkedEquipmentIds?: string[];
  
  // Status
  status: "pending" | "accepted" | "modified" | "rejected";
  actionedAt?: Timestamp;
  actionedBy?: string;
  linkedCapaId?: string;
}

// =============================================================================
// Visit Template Types
// =============================================================================

/** Pre-configured visit template */
export interface VisitTemplate {
  id: string;
  organizationId: string;
  
  // Template details
  name: string;
  description: string;
  type: ExaminationType;
  
  // Default values
  defaultDuration: number; // in minutes
  defaultLocation: string;
  
  // Required fields
  requiredFields: string[];
  
  // Checklist items
  checklistItems: VisitChecklistItem[];
  
  // Documents to collect
  requiredDocuments: string[];
  
  // Active status
  isActive: boolean;
  
  // Audit
  audit: AuditInfo;
}

/** Visit checklist item */
export interface VisitChecklistItem {
  id: string;
  text: string;
  required: boolean;
  order: number;
}

