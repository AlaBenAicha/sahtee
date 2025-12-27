/**
 * User Types - Authentication and User Management
 */

import type { Timestamp } from "firebase/firestore";
import type { FirestoreDocument, AuditInfo } from "./common";
import type { FeaturePermissions } from "./organization";

/** 
 * System-level user role (platform-wide, not organization-specific)
 * Regular organization users get their permissions from CustomRole via roleId
 */
export type SystemRole = "super_admin" | "regular";

/**
 * @deprecated Use roleId with CustomRole instead for organization-level roles
 * Kept for backwards compatibility during migration
 */
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
  /**
   * @deprecated Use roleId + isOrgAdmin instead. Kept for super_admin check only.
   */
  role: UserRole;
  /**
   * Reference to CustomRole document in /roles collection.
   * Determines feature-level CRUD permissions for non-super_admin users.
   * Empty string for super_admin users (they have full access via systemRole).
   */
  roleId: string;
  /**
   * Whether this user is the organization administrator.
   * org_admin can manage roles, invite users, and configure organization settings.
   */
  isOrgAdmin: boolean;
  departmentId?: string;
  jobTitle?: string;

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
  /**
   * Reference to CustomRole document in /roles collection.
   * The invited user will be assigned this role upon accepting.
   */
  roleId: string;
  /**
   * @deprecated Use roleId instead. Kept for backwards compatibility.
   */
  role?: UserRole;
  /** Optional pre-filled first name for the invited user */
  firstName?: string;
  /** Optional pre-filled last name for the invited user */
  lastName?: string;
  departmentId?: string;
  jobTitle?: string;
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
  /**
   * @deprecated Use roleId + isOrgAdmin + featurePermissions instead.
   * Kept for backwards compatibility and super_admin checks.
   */
  role: UserRole;
  /** Reference to CustomRole document */
  roleId: string;
  /** Role name for display purposes */
  roleName: string;
  /** Whether this user is the organization administrator */
  isOrgAdmin: boolean;
  /** 
   * Feature-level CRUD permissions loaded from CustomRole.
   * For super_admin, this is full access to all features.
   */
  featurePermissions: FeaturePermissions;
  /**
   * @deprecated Use featurePermissions instead for granular access control.
   * Kept for backwards compatibility during migration.
   */
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

/** 
 * @deprecated Use CustomRole.permissions (FeaturePermissions) instead.
 * Kept for backwards compatibility during migration.
 * Role to permissions mapping 
 */
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

// =============================================================================
// Full Access Permissions (for super_admin and org_admin)
// =============================================================================

import type { CRUDPermissions } from "./organization";

/** Full CRUD permissions (all true) */
export const FULL_CRUD_PERMISSIONS: CRUDPermissions = {
  create: true,
  read: true,
  update: true,
  delete: true,
};

/** Full feature permissions for super_admin */
export const SUPER_ADMIN_PERMISSIONS: FeaturePermissions = {
  dashboard: { ...FULL_CRUD_PERMISSIONS },
  incidents: { ...FULL_CRUD_PERMISSIONS },
  capa: { ...FULL_CRUD_PERMISSIONS },
  training: { ...FULL_CRUD_PERMISSIONS },
  compliance: { ...FULL_CRUD_PERMISSIONS },
  health: { ...FULL_CRUD_PERMISSIONS },
  analytics: { ...FULL_CRUD_PERMISSIONS },
  settings: { ...FULL_CRUD_PERMISSIONS },
  users: { ...FULL_CRUD_PERMISSIONS },
  roles: { ...FULL_CRUD_PERMISSIONS },
};

/** Full feature permissions for org_admin (same as super_admin within their org) */
export const ORG_ADMIN_PERMISSIONS: FeaturePermissions = {
  dashboard: { ...FULL_CRUD_PERMISSIONS },
  incidents: { ...FULL_CRUD_PERMISSIONS },
  capa: { ...FULL_CRUD_PERMISSIONS },
  training: { ...FULL_CRUD_PERMISSIONS },
  compliance: { ...FULL_CRUD_PERMISSIONS },
  health: { ...FULL_CRUD_PERMISSIONS },
  analytics: { ...FULL_CRUD_PERMISSIONS },
  settings: { ...FULL_CRUD_PERMISSIONS },
  users: { ...FULL_CRUD_PERMISSIONS },
  roles: { ...FULL_CRUD_PERMISSIONS },
};

/**
 * Convert FeaturePermissions to legacy Permission[] format.
 * Used for backwards compatibility during migration.
 */
export function featurePermissionsToLegacy(fp: FeaturePermissions): Permission[] {
  const permissions: Permission[] = [];

  // Dashboard doesn't have legacy permissions, but org:read covers it
  if (fp.dashboard.read) permissions.push("org:read");

  // Incidents
  if (fp.incidents.read) permissions.push("incidents:read");
  if (fp.incidents.create) permissions.push("incidents:create");
  if (fp.incidents.update) permissions.push("incidents:update", "incidents:assign");
  if (fp.incidents.delete) permissions.push("incidents:delete");

  // CAPA
  if (fp.capa.read) permissions.push("capa:read");
  if (fp.capa.create) permissions.push("capa:create");
  if (fp.capa.update) permissions.push("capa:update", "capa:approve");
  if (fp.capa.delete) permissions.push("capa:delete");

  // Training
  if (fp.training.read) permissions.push("training:read");
  if (fp.training.create) permissions.push("training:create");
  if (fp.training.update) permissions.push("training:update", "training:assign");
  if (fp.training.delete) permissions.push("training:delete");

  // Compliance
  if (fp.compliance.read) permissions.push("compliance:read");
  if (fp.compliance.create) permissions.push("compliance:create");
  if (fp.compliance.update) permissions.push("compliance:update");
  if (fp.compliance.delete) permissions.push("compliance:delete");

  // Health
  if (fp.health.read) permissions.push("health:read");
  if (fp.health.create) permissions.push("health:create");
  if (fp.health.update) permissions.push("health:update");
  if (fp.health.delete) permissions.push("health:delete");

  // Analytics
  if (fp.analytics.read) permissions.push("analytics:read", "analytics:export");

  // Settings
  if (fp.settings.read) permissions.push("settings:read");
  if (fp.settings.update) permissions.push("settings:update", "org:update");
  if (fp.settings.delete) permissions.push("org:delete");

  // Users
  if (fp.users.read) permissions.push("users:read");
  if (fp.users.create) permissions.push("users:create", "users:invite");
  if (fp.users.update) permissions.push("users:update");
  if (fp.users.delete) permissions.push("users:delete");

  return [...new Set(permissions)]; // Remove duplicates
}

