/**
 * User Types - Authentication and User Management
 */

import type { Timestamp } from "firebase/firestore";
import type { FirestoreDocument, AuditInfo } from "./common";

/** User roles within an organization */
export type UserRole = 
  | "super_admin"    // Platform administrator (SAHTEE team)
  | "org_admin"      // Organization administrator
  | "manager"        // Department/team manager  
  | "user"           // Regular user
  | "viewer";        // Read-only access

/** User account status */
export type UserStatus = "active" | "pending" | "suspended" | "deactivated";

/** User profile stored in Firestore */
export interface User extends FirestoreDocument {
  // Firebase Auth UID (same as document ID)
  uid: string;
  
  // Basic info
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  
  // Organization membership
  organizationId: string;
  role: UserRole;
  departmentId?: string;
  
  // Contact
  phone?: string;
  mobile?: string;
  
  // Account status
  status: UserStatus;
  lastLoginAt?: Timestamp;
  emailVerified: boolean;
  
  // Preferences
  preferences: UserPreferences;
  
  // Onboarding
  onboardingCompleted: boolean;
  onboardingStep?: number;
  
  // Audit
  audit: AuditInfo;
}

/** User preferences and settings */
export interface UserPreferences {
  language: "fr" | "en";
  theme: "light" | "dark" | "system";
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

/** Notification preferences */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  digest: "daily" | "weekly" | "never";
  categories: {
    incidents: boolean;
    capa: boolean;
    training: boolean;
    compliance: boolean;
    system: boolean;
  };
}

/** Dashboard customization preferences */
export interface DashboardPreferences {
  defaultView: "overview" | "incidents" | "capa" | "training";
  widgets: string[];
  refreshInterval: number; // in minutes
}

/** User invitation for new users */
export interface UserInvitation extends FirestoreDocument {
  email: string;
  organizationId: string;
  role: UserRole;
  departmentId?: string;
  invitedBy: string;
  expiresAt: Timestamp;
  status: "pending" | "accepted" | "expired" | "cancelled";
  token: string;
}

/** User session data */
export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
}

/** Granular permissions for RBAC */
export type Permission =
  // Organization
  | "org:read"
  | "org:update"
  | "org:delete"
  // Users
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "users:invite"
  // Incidents
  | "incidents:read"
  | "incidents:create"
  | "incidents:update"
  | "incidents:delete"
  | "incidents:assign"
  // CAPA
  | "capa:read"
  | "capa:create"
  | "capa:update"
  | "capa:delete"
  | "capa:approve"
  // Training
  | "training:read"
  | "training:create"
  | "training:update"
  | "training:delete"
  | "training:assign"
  // Compliance
  | "compliance:read"
  | "compliance:create"
  | "compliance:update"
  | "compliance:delete"
  // Health
  | "health:read"
  | "health:create"
  | "health:update"
  | "health:delete"
  // Analytics
  | "analytics:read"
  | "analytics:export"
  // Settings
  | "settings:read"
  | "settings:update";

/** Role to permissions mapping */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "org:read", "org:update", "org:delete",
    "users:read", "users:create", "users:update", "users:delete", "users:invite",
    "incidents:read", "incidents:create", "incidents:update", "incidents:delete", "incidents:assign",
    "capa:read", "capa:create", "capa:update", "capa:delete", "capa:approve",
    "training:read", "training:create", "training:update", "training:delete", "training:assign",
    "compliance:read", "compliance:create", "compliance:update", "compliance:delete",
    "health:read", "health:create", "health:update", "health:delete",
    "analytics:read", "analytics:export",
    "settings:read", "settings:update",
  ],
  org_admin: [
    "org:read", "org:update",
    "users:read", "users:create", "users:update", "users:invite",
    "incidents:read", "incidents:create", "incidents:update", "incidents:assign",
    "capa:read", "capa:create", "capa:update", "capa:approve",
    "training:read", "training:create", "training:update", "training:assign",
    "compliance:read", "compliance:create", "compliance:update",
    "health:read", "health:create", "health:update",
    "analytics:read", "analytics:export",
    "settings:read", "settings:update",
  ],
  manager: [
    "org:read",
    "users:read",
    "incidents:read", "incidents:create", "incidents:update", "incidents:assign",
    "capa:read", "capa:create", "capa:update",
    "training:read", "training:create", "training:assign",
    "compliance:read", "compliance:create",
    "health:read", "health:create",
    "analytics:read",
    "settings:read",
  ],
  user: [
    "org:read",
    "incidents:read", "incidents:create",
    "capa:read",
    "training:read",
    "compliance:read",
    "health:read",
  ],
  viewer: [
    "org:read",
    "incidents:read",
    "capa:read",
    "training:read",
    "compliance:read",
    "health:read",
  ],
};

