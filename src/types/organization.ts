/**
 * Organization Types - Multi-tenancy and Company Structure
 */

import type { Timestamp } from "firebase/firestore";
import type { FirestoreDocument, AuditInfo, Address, ContactInfo } from "./common";

/** Organization subscription plan */
export type SubscriptionPlan = "starter" | "professional" | "enterprise";

/** Organization status */
export type OrganizationStatus = "active" | "trial" | "suspended" | "cancelled";

/** Industry sectors */
export type IndustrySector =
  | "manufacturing"
  | "construction"
  | "healthcare"
  | "food_processing"
  | "chemical"
  | "pharmaceutical"
  | "logistics"
  | "mining"
  | "energy"
  | "agriculture"
  | "textile"
  | "automotive"
  | "other";

/** Company size ranges */
export type CompanySize = 
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+";

/** Organization document in Firestore */
export interface Organization extends FirestoreDocument {
  // Basic info
  name: string;
  legalName: string;
  registrationNumber: string; // Matricule fiscal
  logo?: string;
  
  // Contact & Location
  address: Address;
  contact: ContactInfo;
  website?: string;
  
  // Business details
  sector: IndustrySector;
  size: CompanySize;
  employeeCount: number;
  
  // Subscription
  plan: SubscriptionPlan;
  status: OrganizationStatus;
  trialEndsAt?: Timestamp;
  subscriptionStartedAt?: Timestamp;
  subscriptionEndsAt?: Timestamp;
  
  // Features & Limits
  features: OrganizationFeatures;
  limits: OrganizationLimits;
  
  // Onboarding data
  onboarding: OnboardingData;
  
  // Settings
  settings: OrganizationSettings;
  
  // Audit
  audit: AuditInfo;
}

/** Features enabled for organization */
export interface OrganizationFeatures {
  capa: boolean;
  incidents: boolean;
  training: boolean;
  compliance: boolean;
  health: boolean;
  analytics: boolean;
  aiAssistant: boolean;
  mobileApp: boolean;
  apiAccess: boolean;
  customBranding: boolean;
}

/** Usage limits for organization */
export interface OrganizationLimits {
  maxUsers: number;
  maxDepartments: number;
  maxStorageGB: number;
  maxMonthlyReports: number;
  maxAIQueries: number;
}

/** Organization settings */
export interface OrganizationSettings {
  language: "fr" | "en";
  timezone: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  currency: "TND" | "EUR" | "USD";
  
  // Compliance settings
  requireIncidentPhotos: boolean;
  requireWitnesses: boolean;
  autoGenerateCapa: boolean;
  
  // Notification settings
  adminNotifications: boolean;
  weeklyDigest: boolean;
  
  // Branding
  primaryColor?: string;
  secondaryColor?: string;
}

/** Onboarding data collected during setup */
export interface OnboardingData {
  completed: boolean;
  completedAt?: Timestamp;
  currentStep: number;
  
  // Step 1: Organization basics (covered by main Organization fields)
  
  // Step 2: Compliance context
  compliance: ComplianceOnboarding;
  
  // Step 3: Incident management status
  incidents: IncidentOnboarding;
  
  // Step 4: Health & Safety
  health: HealthOnboarding;
  
  // Step 5: Goals & Objectives
  objectives: ObjectivesOnboarding;
  
  // Step 6: Document upload
  documents: DocumentOnboarding;
}

/** Compliance onboarding data */
export interface ComplianceOnboarding {
  hasExistingSystem: boolean;
  currentTools: string[];
  certifications: string[];
  targetCertifications: string[];
  regulatoryBodies: string[];
  auditFrequency: "monthly" | "quarterly" | "annually" | "never";
  lastAuditDate?: Date;
}

/** Incident management onboarding data */
export interface IncidentOnboarding {
  hasExistingSystem: boolean;
  currentSystem: "none" | "spreadsheet" | "software" | "paper";
  averageMonthlyIncidents: number;
  incidentCategories: string[];
  reportingWorkflow: string;
}

/** Health & Safety onboarding data */
export interface HealthOnboarding {
  hasOccupationalDoctor: boolean;
  hasSafetyCommittee: boolean;
  safetyCommitteeMembers?: number;
  hasFirstAidTraining: boolean;
  firstAidTrainedCount?: number;
  hasEmergencyPlan: boolean;
  hazardTypes: string[];
}

/** Objectives onboarding data */
export interface ObjectivesOnboarding {
  primaryGoals: string[];
  painPoints: string[];
  expectedOutcomes: string[];
  implementationTimeline: "1_month" | "3_months" | "6_months" | "1_year";
  priorityModules: string[];
}

/** Document onboarding data */
export interface DocumentOnboarding {
  uploadedDocuments: UploadedDocument[];
  pendingImports: boolean;
}

/** Uploaded document reference */
export interface UploadedDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: Timestamp;
}

/** Document types for organization */
export type DocumentType =
  | "safety_policy"
  | "risk_assessment"
  | "emergency_plan"
  | "training_records"
  | "incident_records"
  | "audit_report"
  | "certification"
  | "procedure"
  | "other";

/** Department within an organization */
export interface Department extends FirestoreDocument {
  organizationId: string;
  name: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  employeeCount: number;
  riskLevel: "low" | "medium" | "high";
  audit: AuditInfo;
}

/** Site/Location for organizations with multiple locations */
export interface Site extends FirestoreDocument {
  organizationId: string;
  name: string;
  address: Address;
  isHeadquarters: boolean;
  employeeCount: number;
  departments: string[];
  audit: AuditInfo;
}

