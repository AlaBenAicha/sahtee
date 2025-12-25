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

