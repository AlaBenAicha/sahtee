# SAHTEE — Technical Product Requirements Document (PRD)

**Version:** 1.1  
**Last Updated:** December 24, 2025  
**Author:** Development Team  
**Source:** Cahier-des-charges.md (Functional Specification)

---

## Table of Contents

1. [Technical Overview](#1-technical-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Database Schema (Firebase)](#4-database-schema-firebase)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Core Modules Technical Specs](#6-core-modules-technical-specs)
7. [AI Integration (Gemini API)](#7-ai-integration-gemini-api)
8. [API Endpoints](#8-api-endpoints)
9. [Security Requirements](#9-security-requirements)
10. [Performance Requirements](#10-performance-requirements)
11. [Development Phases](#11-development-phases)

---

## 1. Technical Overview

SAHTEE is a modular HSE (Health, Safety & Environment) management platform consisting of:

| Module | Purpose | Priority |
|--------|---------|----------|
| **360° Board** | Central dashboard with KPIs, risk mapping, alerts | P0 |
| **Conformity Room** | Regulatory compliance, audits, certifications | P0 |
| **CAPA Room** | Action plans, incidents, training, equipment | P0 |
| **Healthmeter** | Occupational health, medical records, exposures | P0 |
| **SafetyBot** | AI conversational assistant | P1 |
| **Optional Modules** | Impact Calculator, Ergolab, ESGreport, IoT, Mobile App | P2 (placeholder UI only) |

---

## 2. Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** React Context + React Query (for server state)
- **Routing:** React Router v6
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation

### Backend & Database
- **Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **Storage:** Firebase Storage (documents, images)
- **Functions:** Firebase Cloud Functions (for server-side logic)
- **Hosting:** Firebase Hosting

### AI Services
- **Primary AI:** Google Gemini API (gemini-1.5-pro)
- **Use Cases:** SafetyBot, Health-AI, Conformity-AI, CAPA-AI

### External Integrations (Future)
- ERP API integration (configurable per client)
- QR code generation for incident reporting

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │360° Board│ │Conformity│ │CAPA Room │ │Healthmeter│ │SafetyBot│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Firestore  │  │   Storage    │  │  Cloud Functions     │   │
│  │  (Database)  │  │  (Documents) │  │  (Business Logic)    │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                              │                                   │
│  ┌──────────────┐            │                                   │
│  │     Auth     │            │                                   │
│  │ (Users/Roles)│            │                                   │
│  └──────────────┘            │                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Gemini API  │  │  ERP APIs    │  │  Email/Notification  │   │
│  │  (AI Engine) │  │  (Optional)  │  │  Services            │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (Firebase Firestore)

### Collections Structure

```typescript
// /src/types/database.ts

// ============ ORGANIZATION ============
interface Organization {
  id: string;
  name: string;
  logo?: string;
  sectors: string[];
  sites: Site[];
  employeeCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  onboardingCompleted: boolean;
  subscription: SubscriptionTier;
}

interface Site {
  id: string;
  name: string;
  address: string;
  departments: Department[];
}

interface Department {
  id: string;
  name: string;
  managerId: string;
  employeeCount: number;
}

// ============ USERS ============
interface User {
  id: string;                    // Firebase Auth UID
  organizationId: string;
  email: string;
  displayName: string;
  role: UserRole;
  siteIds: string[];             // Sites the user has access to
  departmentIds: string[];       // Departments the user manages
  permissions: Permission[];
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
}

type UserRole = 
  | 'admin'           // QHSE Manager - full access
  | 'hr_manager'      // HR Manager - read access + limited write
  | 'department_head' // Chef de département - CAPA actions for their dept
  | 'physician'       // Médecin du travail - Healthmeter full access
  | 'employee';       // Basic access (incident reporting only)

type Permission = 
  | 'dashboard:read'
  | 'conformity:read' | 'conformity:write'
  | 'capa:read' | 'capa:write'
  | 'health:read' | 'health:write' | 'health:medical'  // medical = PHI access
  | 'incidents:report' | 'incidents:manage'
  | 'audits:read' | 'audits:write'
  | 'users:manage'
  | 'settings:manage';

// ============ ONBOARDING ============
interface OnboardingData {
  id: string;
  organizationId: string;
  
  // Step 1: Organization & Structure
  organization: {
    sectors: string[];
    employeeCount: number;
    sites: Site[];
    contacts: {
      direction: ContactInfo;
      qhse: ContactInfo;
      hr: ContactInfo;
      physician: ContactInfo;
      employeeReps: ContactInfo[];
    };
  };
  
  // Step 2: Compliance & Regulation
  compliance: {
    hasISO45001: boolean;
    hasDUER: boolean;
    hasSSTProcedures: boolean;
    hasEmergencyPlans: boolean;
    auditHistory: string;
    certifications: string[];
  };
  
  // Step 3: Incidents & Actions
  incidents: {
    hasIncidentSystem: boolean;
    severeIncidentVolume: 'none' | 'low' | 'medium' | 'high';
    recurringIncidentVolume: 'none' | 'low' | 'medium' | 'high';
    hasExistingActionPlan: boolean;
  };
  
  // Step 4: Health & Exposures
  health: {
    mainRisks: HealthRisk[];
    medicalFollowupType: string;
    monitoredExposures: ExposureType[];
  };
  
  // Step 5: SST Objectives
  objectives: {
    complianceGoals: string[];
    performanceGoals: string[];
    useAISuggestions: boolean;
  };
  
  // Uploaded documents
  documents: DocumentRef[];
  
  completedAt?: Timestamp;
  status: 'in_progress' | 'completed';
}

// ============ 360° BOARD ============
interface DashboardKPI {
  id: string;
  organizationId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Timestamp;
  
  // Lag Indicators (reactive)
  accidents: {
    workAccidents: number;        // AT
    occupationalDiseases: number; // MP
    lostDays: number;
    frequencyRate: number;        // Taux de fréquence
    severityRate: number;         // Taux de gravité
  };
  
  // Lead Indicators (proactive)
  proactive: {
    nearMissReports: number;
    safetyObservations: number;
    trainingsCompleted: number;
    inspectionsCompleted: number;
  };
  
  // Compliance
  compliance: {
    overallScore: number;         // 0-100
    normsByStatus: Record<string, number>;
    upcomingAudits: number;
    overdueActions: number;
  };
  
  // Health
  health: {
    absenteeismRate: number;
    activeCases: number;
    pendingVisits: number;
  };
  
  // CAPA
  capa: {
    total: number;
    urgent: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

interface RiskMapItem {
  id: string;
  organizationId: string;
  siteId: string;
  departmentId?: string;
  
  category: RiskCategory;
  description: string;
  likelihood: 1 | 2 | 3 | 4 | 5;    // Probabilité
  severity: 1 | 2 | 3 | 4 | 5;      // Gravité
  riskScore: number;                 // likelihood * severity
  
  controls: string[];
  residualRisk: number;
  lastAssessedAt: Timestamp;
  nextReviewAt: Timestamp;
  
  linkedCapaIds: string[];
}

type RiskCategory = 
  | 'physical' | 'chemical' | 'biological' 
  | 'ergonomic' | 'psychosocial' | 'environmental';

// ============ CONFORMITY ROOM ============
interface Norm {
  id: string;
  organizationId: string;
  
  code: string;                      // e.g., "ISO 45001:2018"
  name: string;
  category: NormCategory;
  
  status: 'not_started' | 'in_progress' | 'compliant' | 'non_compliant';
  complianceScore: number;           // 0-100
  
  requirements: Requirement[];
  
  lastAuditId?: string;
  nextAuditDate?: Timestamp;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type NormCategory = 'ISO' | 'OSHA' | 'COR' | 'IAP' | 'CodeTravail' | 'Other';

interface Requirement {
  id: string;
  normId: string;
  clause: string;                    // e.g., "4.1"
  description: string;
  status: 'not_assessed' | 'compliant' | 'partial' | 'non_compliant';
  evidence: DocumentRef[];
  linkedCapaIds: string[];
  notes: string;
}

interface Audit {
  id: string;
  organizationId: string;
  
  title: string;
  type: 'internal' | 'external' | 'certification';
  normIds: string[];
  siteIds: string[];
  
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Timestamp;
  completedDate?: Timestamp;
  
  auditorName: string;
  auditorType: 'internal' | 'external';
  
  findings: AuditFinding[];
  overallScore?: number;
  
  reportDocumentId?: string;
  createdCapaIds: string[];
  
  createdAt: Timestamp;
  createdBy: string;
}

interface AuditFinding {
  id: string;
  type: 'observation' | 'minor_nc' | 'major_nc' | 'opportunity';
  clause: string;
  description: string;
  evidence: string;
  recommendation: string;
  linkedCapaId?: string;
}

// ============ CAPA ROOM ============
interface CAPA {
  id: string;
  organizationId: string;
  
  title: string;
  description: string;
  type: 'corrective' | 'preventive' | 'improvement';
  
  // Classification
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: CAPACategory;
  
  // Status tracking
  status: CAPAStatus;
  kanbanColumn: 'urgent' | 'to_plan' | 'todo' | 'in_progress' | 'done';
  
  // Assignment
  assigneeId: string;
  siteId: string;
  departmentId?: string;
  
  // Dates
  createdAt: Timestamp;
  dueDate: Timestamp;
  plannedStartDate?: Timestamp;
  plannedEndDate?: Timestamp;
  completedAt?: Timestamp;
  
  // Links
  sourceType?: 'incident' | 'audit' | 'risk' | 'health' | 'ai_recommendation';
  sourceId?: string;
  
  // Progress
  checklist: ChecklistItem[];
  progress: number;                  // 0-100
  
  // Evidence
  attachments: DocumentRef[];
  completionProof?: DocumentRef;
  
  // AI
  aiGenerated: boolean;
  aiRecommendations?: string[];
  
  createdBy: string;
  updatedAt: Timestamp;
}

type CAPAStatus = 'draft' | 'open' | 'in_progress' | 'review' | 'closed' | 'cancelled';
type CAPACategory = 'safety' | 'health' | 'environment' | 'compliance' | 'training' | 'equipment';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Timestamp;
  completedBy?: string;
}

interface Incident {
  id: string;
  organizationId: string;
  
  // Basic info
  title: string;
  description: string;
  type: 'work_accident' | 'near_miss' | 'dangerous_situation' | 'occupational_disease';
  
  // Location & time
  occurredAt: Timestamp;
  siteId: string;
  departmentId: string;
  location: string;                  // Specific location description
  
  // Severity
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  
  // People involved
  reportedBy: string;
  affectedPersonIds: string[];
  witnessIds: string[];
  
  // Investigation
  status: 'reported' | 'under_investigation' | 'closed';
  rootCause?: string;
  contributingFactors?: string[];
  
  // Attachments
  attachments: DocumentRef[];
  
  // Generated CAPA
  linkedCapaId?: string;
  
  // AI Analysis
  aiAnalysis?: {
    suggestedRootCause: string;
    suggestedActions: string[];
    riskLevel: number;
    similarIncidents: string[];
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Training {
  id: string;
  organizationId: string;
  
  title: string;
  description: string;
  category: TrainingCategory;
  
  // Content
  modules: TrainingModule[];
  durationMinutes: number;
  
  // Requirements
  isRequired: boolean;
  requiredForRoles: UserRole[];
  validityMonths: number;            // Certificate validity
  
  // Status
  isActive: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type TrainingCategory = 
  | 'safety_general' | 'fire_safety' | 'first_aid' 
  | 'chemical_handling' | 'ergonomics' | 'ppe_usage'
  | 'machine_safety' | 'electrical_safety' | 'other';

interface TrainingModule {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'document' | 'quiz' | 'interactive';
  resourceUrl?: string;
  durationMinutes: number;
  order: number;
}

interface TrainingEnrollment {
  id: string;
  trainingId: string;
  userId: string;
  organizationId: string;
  
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  progress: number;                  // 0-100
  completedModules: string[];
  
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  expiresAt?: Timestamp;
  
  certificateUrl?: string;
  linkedCapaId?: string;
}

interface Equipment {
  id: string;
  organizationId: string;
  
  name: string;
  description: string;
  category: EquipmentCategory;
  type: 'ppe' | 'safety_equipment' | 'ergonomic';
  
  // For PPE
  protectionType?: string[];         // e.g., ['head', 'eyes', 'respiratory']
  
  // Catalog info
  manufacturer?: string;
  model?: string;
  specifications?: string;
  imageUrl?: string;
  
  // Recommendations
  recommendedForRisks: RiskCategory[];
  
  isActive: boolean;
  createdAt: Timestamp;
}

type EquipmentCategory = 
  | 'head_protection' | 'eye_protection' | 'hearing_protection'
  | 'respiratory_protection' | 'hand_protection' | 'foot_protection'
  | 'fall_protection' | 'body_protection' | 'ergonomic_equipment';

// ============ HEALTHMETER ============
interface MedicalRecord {
  id: string;
  organizationId: string;
  employeeId: string;                // Reference to User
  
  // PHI - Protected Health Information (restricted access)
  dateOfBirth: Timestamp;
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  
  // Occupational health
  workRestrictions: WorkRestriction[];
  exposures: ExposureRecord[];
  
  // Visits
  lastVisitDate?: Timestamp;
  nextScheduledVisit?: Timestamp;
  visitHistory: MedicalVisit[];
  
  // Status
  fitnessStatus: 'fit' | 'fit_with_restrictions' | 'temporarily_unfit' | 'pending_evaluation';
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;                 // Must be physician role
}

interface WorkRestriction {
  id: string;
  type: string;
  description: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  isActive: boolean;
}

interface ExposureRecord {
  id: string;
  type: ExposureType;
  agent: string;                     // e.g., "Silica dust", "Noise > 85dB"
  department: string;
  
  lastMeasurement: number;
  unit: string;
  limit: number;                     // Regulatory limit
  percentOfLimit: number;
  
  measurementDate: Timestamp;
  frequency: 'continuous' | 'intermittent' | 'occasional';
  
  linkedCapaIds: string[];
}

type ExposureType = 
  | 'chemical' | 'noise' | 'vibration' | 'radiation'
  | 'biological' | 'thermal' | 'dust';

interface MedicalVisit {
  id: string;
  employeeId: string;
  
  type: 'periodic' | 'pre_employment' | 'return_to_work' | 'special';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  
  scheduledDate: Timestamp;
  completedDate?: Timestamp;
  
  // Findings (physician only)
  findings?: string;
  recommendations?: string[];
  fitnessDecision?: 'fit' | 'fit_with_restrictions' | 'temporarily_unfit';
  
  nextVisitRecommended?: Timestamp;
  
  physicianId: string;
}

interface HealthAlert {
  id: string;
  organizationId: string;
  
  type: 'exposure_threshold' | 'visit_overdue' | 'trend_detected' | 'outbreak';
  severity: 'info' | 'warning' | 'critical';
  
  title: string;
  description: string;
  
  affectedDepartments?: string[];
  affectedEmployeeCount?: number;
  
  status: 'active' | 'acknowledged' | 'resolved';
  
  linkedCapaId?: string;
  
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}

// ============ SHARED TYPES ============
interface DocumentRef {
  id: string;
  name: string;
  type: string;                      // MIME type
  url: string;                       // Firebase Storage URL
  size: number;
  uploadedAt: Timestamp;
  uploadedBy: string;
}

interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface ActivityLog {
  id: string;
  organizationId: string;
  
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  
  details: Record<string, any>;
  timestamp: Timestamp;
}

interface Notification {
  id: string;
  userId: string;
  
  type: NotificationType;
  title: string;
  message: string;
  
  entityType?: string;
  entityId?: string;
  
  isRead: boolean;
  createdAt: Timestamp;
}

type NotificationType = 
  | 'capa_assigned' | 'capa_due' | 'capa_overdue'
  | 'audit_scheduled' | 'audit_reminder'
  | 'visit_scheduled' | 'visit_reminder'
  | 'training_assigned' | 'training_due'
  | 'alert' | 'system';

// ============ AI TYPES ============
interface AIConversation {
  id: string;
  organizationId: string;
  userId: string;
  
  botType: 'safetybot' | 'health_ai' | 'conformity_ai' | 'capa_ai';
  
  messages: AIMessage[];
  context: Record<string, any>;      // Relevant data for context
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
  
  // For assistant messages
  sources?: string[];                // References to documents/data used
  suggestedActions?: SuggestedAction[];
}

interface SuggestedAction {
  type: 'create_capa' | 'schedule_audit' | 'view_document' | 'navigate';
  label: string;
  payload: Record<string, any>;
}

interface AIRecommendation {
  id: string;
  organizationId: string;
  
  source: 'health_ai' | 'conformity_ai' | 'capa_ai';
  type: 'capa' | 'training' | 'equipment' | 'audit' | 'alert';
  
  title: string;
  description: string;
  reasoning: string;
  
  priority: 'high' | 'medium' | 'low';
  confidence: number;                // 0-1
  
  status: 'pending' | 'accepted' | 'modified' | 'rejected';
  
  linkedEntityId?: string;           // Created CAPA, training, etc.
  
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}
```

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function hasRole(role) {
      return getUserData().role == role;
    }
    
    function hasPermission(permission) {
      return permission in getUserData().permissions;
    }
    
    function belongsToOrg(orgId) {
      return getUserData().organizationId == orgId;
    }
    
    // Organizations
    match /organizations/{orgId} {
      allow read: if isAuthenticated() && belongsToOrg(orgId);
      allow write: if isAuthenticated() && belongsToOrg(orgId) && hasRole('admin');
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == userId || 
        (belongsToOrg(resource.data.organizationId) && hasPermission('users:manage'))
      );
      allow write: if isAuthenticated() && hasPermission('users:manage');
    }
    
    // Medical Records - PHI protection
    match /medicalRecords/{recordId} {
      allow read: if isAuthenticated() && 
        belongsToOrg(resource.data.organizationId) && 
        hasPermission('health:medical');
      allow write: if isAuthenticated() && 
        belongsToOrg(resource.data.organizationId) && 
        hasRole('physician');
    }
    
    // CAPA
    match /capas/{capaId} {
      allow read: if isAuthenticated() && 
        belongsToOrg(resource.data.organizationId) && 
        hasPermission('capa:read');
      allow write: if isAuthenticated() && 
        belongsToOrg(resource.data.organizationId) && 
        hasPermission('capa:write');
    }
    
    // Incidents
    match /incidents/{incidentId} {
      allow read: if isAuthenticated() && 
        belongsToOrg(resource.data.organizationId) && 
        hasPermission('incidents:manage');
      allow create: if isAuthenticated() && 
        belongsToOrg(request.resource.data.organizationId) && 
        hasPermission('incidents:report');
      allow update, delete: if isAuthenticated() && 
        belongsToOrg(resource.data.organizationId) && 
        hasPermission('incidents:manage');
    }
    
    // Other collections follow similar patterns...
  }
}
```

---

## 5. Authentication & Authorization

### Role-Based Access Control (RBAC)

SAHTEE implements a **flexible RBAC system** where organization administrators can create custom roles with granular CRUD permissions per feature module.

#### System Roles

| Role | Scope | Description |
|------|-------|-------------|
| `super_admin` | Platform | SAHTEE team only. Full access to all organizations. |
| `org_admin` | Organization | First user who creates the organization. Can manage roles, invite users, and configure settings. |
| Regular users | Organization | Permissions defined by their assigned `CustomRole`. |

#### Custom Roles (Template Defaults)

When a new organization is created, these template roles are auto-generated. The `org_admin` can edit, delete, or create new roles.

| Role | Description | Default Access |
|------|-------------|----------------|
| **QHSE** | Responsable Qualité Hygiène Sécurité Environnement | Full CRUD on all modules except health:delete |
| **RH** | Responsable Ressources Humaines | Training CRUD, read-only on others |
| **Chef de département** | Department/Workshop Manager | Incidents & CAPA CRUD, read on training |
| **Médecin du travail** | Occupational Physician | Full health access including medical records |
| **Employé** | Basic Employee | Incident reporting, training read-only |

#### Permission Structure

Each `CustomRole` has granular permissions per feature module:

```typescript
interface FeaturePermissions {
  dashboard: CRUDPermissions;
  incidents: CRUDPermissions;
  capa: CRUDPermissions;
  training: CRUDPermissions;
  compliance: CRUDPermissions;
  health: CRUDPermissions;
  analytics: CRUDPermissions;
  settings: CRUDPermissions;
  users: CRUDPermissions;
}

interface CRUDPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}
```

### Authentication Flow

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextValue {
  user: FirebaseUser | null;
  userProfile: User | null;
  session: UserSession | null;
  loading: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  
  // Legacy permission check
  hasPermission: (permission: Permission) => boolean;
  
  // Feature-level access control
  canAccessFeature: (feature: FeatureModule) => boolean;  // Checks read permission
  
  // Granular CRUD permission checks
  canPerformAction: (feature: FeatureModule, action: keyof CRUDPermissions) => boolean;
  getFeaturePermissions: (feature: FeatureModule) => CRUDPermissions;
  
  // Helpers
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isOnboarded: boolean;
}

interface UserSession {
  uid: string;
  organizationId: string;
  roleId: string;
  roleName: string;
  isOrgAdmin: boolean;
  featurePermissions: FeaturePermissions;
}
```

### Permission Guards & Hooks

```typescript
// Route-level feature access guard
// src/components/auth/FeatureGuard.tsx
<FeatureGuard feature="compliance">
  <CompliancePage />
</FeatureGuard>

// CRUD-level action guard (for pages like edit/create)
// src/components/auth/CRUDGuard.tsx
<CRUDGuard feature="capa" action="update">
  <EditCAPAPage />
</CRUDGuard>

// Hook for granular CRUD checks in components
// src/hooks/useFeaturePermissions.ts
const { canCreate, canRead, canUpdate, canDelete } = useFeaturePermissions("compliance");
<Button disabled={!canCreate}>Nouvel audit</Button>
```

### Signup Flow (Atomic Creation)

When a user signs up with company information:

1. **Create Organization** document in `/organizations/{orgId}`
2. **Create Template Roles** (5 roles) in `/roles/{roleId}` with `organizationId`
3. **Create User** in `/users/{userId}` with:
   - `organizationId`: the new org ID
   - `roleId`: QHSE role ID
   - `isOrgAdmin: true`
   - `role: "org_admin"` (legacy field)

All three operations are performed atomically using Firestore `writeBatch`.

### User Invitation Flow

1. `org_admin` creates invitation via `createInvitation(email, orgId, roleId)`
2. System sends email with invitation link or provides shareable link
3. Invited user clicks `/join?token=xxx`
4. System validates token and creates user with specified `roleId`

---

## 6. Core Modules Technical Specs

### 6.1 Onboarding Flow (First Visit Form)

**Route:** `/onboarding`

**Steps:**
1. Organization & Structure
2. Compliance & Regulation
3. Incidents & Actions
4. Health & Exposures
5. SST Objectives
6. Document Upload
7. Review & Submit

**Implementation:**
- Multi-step form with React Hook Form
- Progress saved to Firestore after each step
- Document upload to Firebase Storage
- AI analysis triggered on completion (Gemini)

### 6.2 360° Board

**Route:** `/dashboard`

**Components:**
- `KPIBanner` - Top-level metrics (AT/MP, compliance %, CAPA status)
- `RiskMap` - Interactive heatmap (likelihood × severity matrix)
- `TrendCharts` - Lead/Lag indicator trends
- `AlertFeed` - Real-time notifications and actions
- `QuickActions` - Shortcut buttons to common tasks

**Data Flow:**
- KPIs aggregated by Cloud Function (runs daily + on-demand)
- Real-time listeners for alerts and activity
- Risk map data from `riskMapItems` collection

### 6.3 Conformity Room

**Routes:**
- `/conformity` - Dashboard
- `/conformity/norms` - Regulatory library
- `/conformity/audits` - Audit planning & tracking
- `/conformity/audit/:id` - Audit detail/execution

**Features:**
- Norm status tracking with requirement breakdown
- Audit scheduling with calendar integration
- Audit execution with finding capture
- Auto-generation of CAPA from findings
- Conformity-AI for gap analysis

### 6.4 CAPA Room

**Routes:**
- `/capa` - Kanban board
- `/capa/:id` - CAPA detail
- `/capa/incidents` - Incident management
- `/capa/training` - Training catalog & progress
- `/capa/equipment` - PPE & equipment catalog
- `/capa/planning` - AI-powered scheduling

**Kanban Columns:**
1. CAPA Urgentes (Critical)
2. À Planifier (To Plan)
3. À Faire (To Do)
4. En Cours (In Progress)
5. Terminées (Done)

**Features:**
- Drag-and-drop Kanban (react-beautiful-dnd or dnd-kit)
- Incident reporting with QR code generation
- Training enrollment and progress tracking
- Equipment catalog with risk-based recommendations
- AI planning assistant (CAPA-AI)

### 6.5 Healthmeter

**Routes:**
- `/health` - Dashboard (aggregate stats only for non-physicians)
- `/health/status` - Health status tiles
- `/health/records` - Medical records (physician only)
- `/health/visits` - Visit planning
- `/health/exposures` - Exposure monitoring

**Access Control:**
- QHSE/HR see aggregate data only (tiles, trends, no PHI)
- Physician has full access to medical records
- All PHI encrypted at rest

**Features:**
- Health status dashboard with TMS/RPS trends
- Medical record management (physician only)
- Visit scheduling and tracking
- Exposure monitoring with threshold alerts
- Health-AI for trend analysis and prevention recommendations

### 6.6 SafetyBot

**Component:** `SafetyBot` (sidebar/modal chat interface)

**Capabilities:**
- Answer questions about platform usage
- Query organization HSE data
- Provide regulatory guidance
- Suggest actions and navigate to relevant screens
- Context-aware responses based on current page

---

## 7. AI Integration (Gemini API)

### Configuration

```typescript
// src/config/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const models = {
  safetyBot: genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }),
  analysis: genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),
};
```

### AI Modules

#### SafetyBot
- **Purpose:** General assistant for platform navigation and HSE questions
- **Context:** Current page, user role, organization data
- **System Prompt:** HSE expert persona with knowledge of platform features

#### Health-AI
- **Purpose:** Analyze health trends, detect patterns, suggest prevention
- **Input:** Aggregated health data, exposure records, incident history
- **Output:** Trend analysis, risk groups, prevention recommendations
- **Triggers:** On-demand, scheduled weekly analysis

#### Conformity-AI
- **Purpose:** Gap analysis, compliance scoring, audit recommendations
- **Input:** Norm requirements, evidence status, audit history
- **Output:** Compliance gaps, priority actions, audit scheduling suggestions
- **Triggers:** On-demand, after audit completion

#### CAPA-AI
- **Purpose:** Action prioritization, intelligent scheduling, root cause analysis
- **Input:** Open CAPAs, resource availability, incident data, risk scores
- **Output:** Priority matrix, timeline suggestions, action recommendations
- **Triggers:** On-demand, on incident creation

### AI Request Flow

```typescript
// src/utils/aiEngine.ts
interface AIRequest {
  botType: 'safetybot' | 'health_ai' | 'conformity_ai' | 'capa_ai';
  prompt: string;
  context: {
    organizationId: string;
    userId: string;
    currentPage?: string;
    relevantData?: Record<string, any>;
  };
}

interface AIResponse {
  content: string;
  sources?: string[];
  suggestedActions?: SuggestedAction[];
  confidence?: number;
}

async function queryAI(request: AIRequest): Promise<AIResponse>;
```

### System Prompts

```typescript
// src/prompts/safetyBot.ts
export const SAFETYBOT_SYSTEM_PROMPT = `
You are SafetyBot, an AI assistant for the SAHTEE platform - an HSE (Health, Safety & Environment) management system.

Your role is to:
1. Help users navigate the platform and understand its features
2. Answer questions about HSE regulations (ISO 45001, OSHA, French Code du Travail)
3. Provide guidance on best practices for workplace safety
4. Suggest relevant actions based on the user's context

Current user context:
- Role: {userRole}
- Current page: {currentPage}
- Organization: {organizationName}

Always be helpful, accurate, and safety-focused. If unsure, recommend consulting with a qualified HSE professional.
`;
```

---

## 8. API Endpoints

### Firebase Cloud Functions

```typescript
// functions/src/index.ts

// ===== Dashboard =====
exports.aggregateKPIs = functions.pubsub
  .schedule('0 6 * * *')  // Daily at 6 AM
  .onRun(async (context) => {
    // Aggregate KPIs for all organizations
  });

exports.calculateKPIs = functions.https.onCall(async (data, context) => {
  // On-demand KPI calculation for specific org
});

// ===== CAPA =====
exports.onIncidentCreate = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    // Auto-create CAPA draft from incident
    // Trigger CAPA-AI analysis
  });

exports.onCapaDue = functions.pubsub
  .schedule('0 8 * * *')
  .onRun(async (context) => {
    // Send notifications for due/overdue CAPAs
  });

// ===== Audits =====
exports.onAuditComplete = functions.firestore
  .document('audits/{auditId}')
  .onUpdate(async (change, context) => {
    // When status changes to 'completed'
    // Create CAPAs from non-conformities
    // Update norm compliance scores
  });

// ===== Health =====
exports.checkExposureThresholds = functions.pubsub
  .schedule('0 7 * * *')
  .onRun(async (context) => {
    // Check for exposure limit breaches
    // Create alerts and CAPAs as needed
  });

exports.sendVisitReminders = functions.pubsub
  .schedule('0 9 * * *')
  .onRun(async (context) => {
    // Send reminders for upcoming medical visits
  });

// ===== AI =====
exports.analyzeWithAI = functions.https.onCall(async (data, context) => {
  const { botType, prompt, contextData } = data;
  // Call Gemini API with appropriate system prompt
  // Return structured response
});

exports.generateAIRecommendations = functions.pubsub
  .schedule('0 2 * * 1')  // Weekly on Monday at 2 AM
  .onRun(async (context) => {
    // Generate AI recommendations for all organizations
  });

// ===== Notifications =====
exports.sendNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    // Send push/email notification
  });

// ===== Reports =====
exports.generateReport = functions.https.onCall(async (data, context) => {
  const { reportType, filters, format } = data;
  // Generate PDF/Excel report
  // Upload to Storage and return URL
});
```

---

## 9. Security Requirements

### Data Protection

1. **PHI (Protected Health Information)**
   - All medical data encrypted at rest (Firestore encryption)
   - Access restricted to `physician` role only
   - Audit logging for all PHI access

2. **Authentication**
   - Firebase Authentication with email/password
   - Password requirements: min 12 chars, complexity rules
   - Session timeout: 8 hours of inactivity
   - MFA optional (recommended for admin roles)

3. **Authorization**
   - Role-based access control (RBAC)
   - Permission checks at both client and server (Firestore rules)
   - Organization isolation - users can only access their org's data

4. **Data Transmission**
   - All traffic over HTTPS
   - API keys stored in environment variables
   - Sensitive config in Firebase Remote Config

### Compliance Considerations

- GDPR compliance for EU users (data export, deletion)
- Audit trail for all significant actions
- Data retention policies configurable per organization

---

## 10. Performance Requirements

| Metric | Target |
|--------|--------|
| Initial Load Time | < 3 seconds |
| Time to Interactive | < 5 seconds |
| API Response Time | < 500ms (p95) |
| AI Response Time | < 5 seconds |
| Dashboard Refresh | < 2 seconds |
| Concurrent Users | 1000 per organization |
| Data Sync Latency | < 1 second (real-time) |

### Optimization Strategies

1. **Code Splitting** - Lazy load modules
2. **Caching** - React Query for API cache, Service Worker for assets
3. **Pagination** - Virtual scrolling for long lists
4. **Indexing** - Composite indexes for common Firestore queries
5. **CDN** - Firebase Hosting CDN for static assets

---

## 11. Development Phases

### Phase 1: Foundation (Weeks 1-4)
- [x] Firebase project setup (Auth, Firestore, Storage, Hosting)
- [x] Type definitions in `/src/types/` (single source of truth)
- [x] Basic navigation and layout
- [x] Authentication system with Firebase Auth
- [x] **Atomic Organization + User creation during signup**
  - When user signs up with company info, create Organization → Template Roles → User atomically
  - First user becomes `org_admin` with full organization permissions
- [x] **Custom role system with CRUD permissions per feature module**
  - `CustomRole` type with granular permissions: `{ dashboard, incidents, capa, training, compliance, health, analytics, settings, users }`
  - Each feature has CRUD permissions: `{ create, read, update, delete }`
- [x] **Pre-configured template roles (auto-created for new organizations)**
  - QHSE: Full access to all modules except medical records
  - RH: Training management, read access to incidents/CAPA
  - Chef de département: CAPA/incidents for their department
  - Médecin du travail: Full health/medical access
  - Employé: Incident reporting and training read-only
- [x] **Feature-level access control (UI + routing)**
  - Sidebar navigation filtered based on user's `read` permission per feature
  - `FeatureGuard` component for route-level protection
  - `AccessDeniedPage` for unauthorized access attempts
  - `canAccessFeature()` helper in AuthContext
- [x] **CRUD permission enforcement in components**
  - `useFeaturePermissions(feature)` hook for granular CRUD checks
  - `CRUDGuard` component for protecting CRUD-specific pages/actions
  - `canPerformAction()` and `getFeaturePermissions()` helpers in AuthContext
  - UI elements (buttons, forms) disabled based on user's CRUD permissions
- [x] **Role management UI for org_admin**
  - View/edit/delete template roles
  - Create custom roles with granular permissions
  - Visual permission matrix editor
- [x] User management (CRUD, role assignment via roleId)
- [x] **User invitation system (email + shareable link)**
  - `createInvitation(email, orgId, roleId)` - send email invite
  - `generateInvitationLink(token)` - shareable link for org_admin
  - `isInvitationValid(token)` - validate before accepting
- [x] **Invitation acceptance flow**
  - `/join?token=xxx` page to accept invitations
  - Auto-assign role from invitation
  - Create user with correct organizationId and roleId
- [x] Organization setup and extended onboarding form

### Phase 2: 360° Board (Weeks 5-6)
- [x] KPI calculation Cloud Functions
- [x] Dashboard layout with KPI banner
- [x] Risk map component
- [x] Trend charts (lead/lag indicators)
- [x] Alert feed with real-time updates

### Phase 3: CAPA Room (Weeks 7-10)
- [x] CAPA CRUD operations
- [x] Kanban board with drag-and-drop
- [x] Incident reporting (web form)
- [x] QR code generation for incidents
- [x] Training catalog and enrollment
- [x] Equipment catalog
- [ ] CAPA-AI integration (prioritization, suggestions)

### Phase 4: Conformity Room (Weeks 11-13)
- [ ] Norm library (seed with ISO 45001, OSHA, etc.)
- [ ] Requirement tracking
- [ ] Audit scheduling and calendar
- [ ] Audit execution and findings capture
- [ ] Auto-CAPA creation from findings
- [ ] Conformity-AI integration

### Phase 5: Healthmeter (Weeks 14-16)
- [ ] Health dashboard (aggregate view)
- [ ] Medical record management (physician only)
- [ ] Visit scheduling and tracking
- [ ] Exposure monitoring
- [ ] Health alerts
- [ ] Health-AI integration

### Phase 6: SafetyBot & Polish (Weeks 17-18)
- [ ] SafetyBot chat interface
- [ ] Context-aware responses
- [ ] Platform navigation assistance
- [ ] Optional modules placeholders (UI only)
- [ ] Report generation (PDF/Excel)
- [ ] Performance optimization
- [ ] Testing and bug fixes

### Phase 7: Launch Prep (Weeks 19-20)
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Admin training materials
- [ ] Production deployment
- [ ] Monitoring setup (Firebase Analytics, Crashlytics)

---

## Appendix A: Environment Variables

```bash
# .env.local (do not commit)

# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Gemini AI
VITE_GEMINI_API_KEY=

# Feature Flags
VITE_ENABLE_SAFETYBOT=true
VITE_ENABLE_AI_RECOMMENDATIONS=true
```

---

## Appendix B: File Structure

```
src/
├── components/
│   ├── auth/            # Auth guards & permission components
│   │   ├── FeatureGuard.tsx    # Route-level feature access
│   │   ├── CRUDGuard.tsx       # CRUD action protection
│   │   └── ProtectedRoute.tsx  # Authentication guard
│   ├── common/           # Shared components
│   ├── dashboard/        # 360° Board components
│   ├── conformity/       # Conformity Room components
│   ├── capa/            # CAPA Room components
│   ├── health/          # Healthmeter components
│   ├── safetybot/       # SafetyBot components
│   ├── onboarding/      # First visit form
│   └── ui/              # shadcn/ui components
├── pages/
│   ├── errors/          # Error pages
│   │   └── AccessDeniedPage.tsx  # 403 Forbidden page
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useFeaturePermissions.ts  # CRUD permission hook
│   ├── useFirestore.ts
│   ├── useAI.ts
│   └── ...
├── lib/
│   ├── firebase.ts      # Firebase initialization
│   ├── gemini.ts        # Gemini API setup
│   └── utils.ts
├── types/
│   ├── database.ts      # All Firestore types
│   ├── auth.ts          # Auth types
│   ├── ai.ts            # AI types
│   └── index.ts         # Re-exports
├── utils/
│   ├── permissions.ts   # Permission helpers
│   ├── formatters.ts    # Date, number formatters
│   └── validators.ts    # Zod schemas
├── prompts/
│   ├── safetyBot.ts
│   ├── healthAI.ts
│   ├── conformityAI.ts
│   └── capaAI.ts
├── App.tsx
└── main.tsx

functions/
├── src/
│   ├── index.ts         # Cloud Functions entry
│   ├── kpi/            
│   ├── notifications/   
│   ├── ai/             
│   └── reports/        
└── package.json
```

---

*End of PRD*

