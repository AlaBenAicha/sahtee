/**
 * Role Firestore Service
 * 
 * Handles all role-related database operations including:
 * - Template role initialization for new organizations
 * - Custom role CRUD operations
 * - Role permission management
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  CustomRole,
  FeaturePermissions,
  CRUDPermissions,
} from "@/types/organization";
import type { AuditInfo } from "@/types/common";

const ROLES_COLLECTION = "roles";
const USERS_COLLECTION = "users";

// =============================================================================
// Template Roles Configuration
// =============================================================================

/**
 * Pre-configured template roles based on common HSE company structures.
 * These are automatically created when a new organization is set up.
 * The org_admin can edit, keep, delete, or add new roles.
 */
export const TEMPLATE_ROLES: Omit<CustomRole, "id" | "organizationId" | "createdAt" | "updatedAt" | "audit">[] = [
  {
    name: "Org Admin",
    description: "Administrateur de l'organisation avec accès complet",
    isTemplate: true,
    permissions: {
      dashboard: { create: true, read: true, update: true, delete: true },
      incidents: { create: true, read: true, update: true, delete: true },
      capa: { create: true, read: true, update: true, delete: true },
      training: { create: true, read: true, update: true, delete: true },
      compliance: { create: true, read: true, update: true, delete: true },
      health: { create: true, read: true, update: true, delete: true },
      analytics: { create: true, read: true, update: true, delete: true },
      settings: { create: true, read: true, update: true, delete: true },
      users: { create: true, read: true, update: true, delete: true },
      roles: { create: true, read: true, update: true, delete: true },
    },
  },
  {
    name: "QHSE",
    description: "Responsable Qualité Hygiène Sécurité Environnement",
    isTemplate: true,
    permissions: {
      dashboard: { create: false, read: true, update: false, delete: false },
      incidents: { create: true, read: true, update: true, delete: true },
      capa: { create: true, read: true, update: true, delete: true },
      training: { create: true, read: true, update: true, delete: true },
      compliance: { create: true, read: true, update: true, delete: true },
      health: { create: true, read: true, update: true, delete: false }, // No medical record deletion
      analytics: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: true, update: true, delete: false },
      users: { create: false, read: true, update: false, delete: false },
      roles: { create: false, read: true, update: false, delete: false },
    },
  },
  {
    name: "RH",
    description: "Responsable Ressources Humaines",
    isTemplate: true,
    permissions: {
      dashboard: { create: false, read: true, update: false, delete: false },
      incidents: { create: false, read: true, update: false, delete: false },
      capa: { create: false, read: true, update: false, delete: false },
      training: { create: true, read: true, update: true, delete: false },
      compliance: { create: false, read: true, update: false, delete: false },
      health: { create: false, read: true, update: false, delete: false },
      analytics: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: true, update: false, delete: false },
      users: { create: false, read: true, update: false, delete: false },
      roles: { create: false, read: false, update: false, delete: false },
    },
  },
  {
    name: "Chef de département",
    description: "Responsable de département ou d'atelier",
    isTemplate: true,
    permissions: {
      dashboard: { create: false, read: true, update: false, delete: false },
      incidents: { create: true, read: true, update: true, delete: false },
      capa: { create: true, read: true, update: true, delete: false },
      training: { create: false, read: true, update: false, delete: false },
      compliance: { create: false, read: true, update: false, delete: false },
      health: { create: false, read: true, update: false, delete: false },
      analytics: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
      users: { create: false, read: false, update: false, delete: false },
      roles: { create: false, read: false, update: false, delete: false },
    },
  },
  {
    name: "Médecin du travail",
    description: "Médecin responsable de la santé au travail",
    isTemplate: true,
    permissions: {
      dashboard: { create: false, read: true, update: false, delete: false },
      incidents: { create: false, read: true, update: false, delete: false },
      capa: { create: true, read: true, update: false, delete: false }, // Can create prevention CAPAs
      training: { create: false, read: true, update: false, delete: false },
      compliance: { create: false, read: true, update: false, delete: false },
      health: { create: true, read: true, update: true, delete: true }, // Full medical access
      analytics: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
      users: { create: false, read: false, update: false, delete: false },
      roles: { create: false, read: false, update: false, delete: false },
    },
  },
  {
    name: "Employé",
    description: "Employé avec accès basique",
    isTemplate: true,
    permissions: {
      dashboard: { create: false, read: false, update: false, delete: false },
      incidents: { create: true, read: true, update: false, delete: false }, // Can report incidents
      capa: { create: false, read: false, update: false, delete: false },
      training: { create: false, read: true, update: false, delete: false }, // Can view training
      compliance: { create: false, read: false, update: false, delete: false },
      health: { create: false, read: false, update: false, delete: false },
      analytics: { create: false, read: false, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
      users: { create: false, read: false, update: false, delete: false },
      roles: { create: false, read: false, update: false, delete: false },
    },
  },
];

// =============================================================================
// Role CRUD Operations
// =============================================================================

/**
 * Get a role by ID
 */
export async function getRoleById(roleId: string): Promise<CustomRole | null> {
  if (!roleId) return null;
  
  const docRef = doc(db, ROLES_COLLECTION, roleId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as CustomRole;
}

/**
 * Get all roles for an organization
 */
export async function getRolesByOrganization(orgId: string): Promise<CustomRole[]> {
  const q = query(
    collection(db, ROLES_COLLECTION),
    where("organizationId", "==", orgId),
    orderBy("name", "asc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CustomRole[];
}

/**
 * Create a new custom role
 */
export async function createRole(
  data: Omit<CustomRole, "id" | "createdAt" | "updatedAt" | "audit">,
  createdBy: string
): Promise<CustomRole> {
  const now = Timestamp.now();
  
  const role: Omit<CustomRole, "id"> = {
    ...data,
    createdAt: now,
    updatedAt: now,
    audit: {
      createdBy,
      createdAt: now,
      updatedBy: createdBy,
      updatedAt: now,
    },
  };
  
  const docRef = doc(collection(db, ROLES_COLLECTION));
  await setDoc(docRef, role);
  
  return { id: docRef.id, ...role };
}

/**
 * Update an existing role
 */
export async function updateRole(
  roleId: string,
  data: Partial<Pick<CustomRole, "name" | "description" | "permissions">>,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, ROLES_COLLECTION, roleId);
  
  await updateDoc(docRef, {
    ...data,
    "audit.updatedBy": updatedBy,
    "audit.updatedAt": Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update role permissions
 */
export async function updateRolePermissions(
  roleId: string,
  permissions: FeaturePermissions,
  updatedBy: string
): Promise<void> {
  await updateRole(roleId, { permissions }, updatedBy);
}

/**
 * Delete a role (only if no users are assigned)
 */
export async function deleteRole(roleId: string): Promise<{ success: boolean; error?: string }> {
  // Check if any users are assigned to this role
  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    where("roleId", "==", roleId)
  );
  const usersSnapshot = await getDocs(usersQuery);
  
  if (!usersSnapshot.empty) {
    return {
      success: false,
      error: `Impossible de supprimer ce rôle. ${usersSnapshot.size} utilisateur(s) sont encore assignés à ce rôle.`,
    };
  }
  
  // Safe to delete
  const docRef = doc(db, ROLES_COLLECTION, roleId);
  await deleteDoc(docRef);
  
  return { success: true };
}

/**
 * Check if a role can be deleted
 */
export async function canDeleteRole(roleId: string): Promise<{ canDelete: boolean; assignedUsersCount: number }> {
  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    where("roleId", "==", roleId)
  );
  const usersSnapshot = await getDocs(usersQuery);
  
  return {
    canDelete: usersSnapshot.empty,
    assignedUsersCount: usersSnapshot.size,
  };
}

// =============================================================================
// Template Role Operations
// =============================================================================

/**
 * Create all template roles for a new organization
 * Returns the created roles with their IDs
 */
export async function createTemplateRolesForOrganization(
  orgId: string,
  createdBy: string
): Promise<CustomRole[]> {
  const now = Timestamp.now();
  const batch = writeBatch(db);
  const createdRoles: CustomRole[] = [];
  
  for (const templateRole of TEMPLATE_ROLES) {
    const docRef = doc(collection(db, ROLES_COLLECTION));
    
    const role: Omit<CustomRole, "id"> = {
      ...templateRole,
      organizationId: orgId,
      createdAt: now,
      updatedAt: now,
      audit: {
        createdBy,
        createdAt: now,
        updatedBy: createdBy,
        updatedAt: now,
      },
    };
    
    batch.set(docRef, role);
    createdRoles.push({ id: docRef.id, ...role });
  }
  
  await batch.commit();
  
  return createdRoles;
}

/**
 * Get the default role for new users (Employé template)
 * Returns null if not found (should create template roles first)
 */
export async function getDefaultRoleForOrganization(orgId: string): Promise<CustomRole | null> {
  const q = query(
    collection(db, ROLES_COLLECTION),
    where("organizationId", "==", orgId),
    where("name", "==", "Employé"),
    where("isTemplate", "==", true)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as CustomRole;
}

/**
 * Get QHSE role (typically assigned to org_admin)
 * Returns null if not found
 */
export async function getQHSERoleForOrganization(orgId: string): Promise<CustomRole | null> {
  const q = query(
    collection(db, ROLES_COLLECTION),
    where("organizationId", "==", orgId),
    where("name", "==", "QHSE"),
    where("isTemplate", "==", true)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as CustomRole;
}

// =============================================================================
// Permission Helpers
// =============================================================================

/**
 * Create empty CRUD permissions
 */
export function createEmptyCRUDPermissions(): CRUDPermissions {
  return {
    create: false,
    read: false,
    update: false,
    delete: false,
  };
}

/**
 * Create full CRUD permissions
 */
export function createFullCRUDPermissions(): CRUDPermissions {
  return {
    create: true,
    read: true,
    update: true,
    delete: true,
  };
}

/**
 * Create empty feature permissions (no access to any module)
 */
export function createEmptyFeaturePermissions(): FeaturePermissions {
  return {
    dashboard: createEmptyCRUDPermissions(),
    incidents: createEmptyCRUDPermissions(),
    capa: createEmptyCRUDPermissions(),
    training: createEmptyCRUDPermissions(),
    compliance: createEmptyCRUDPermissions(),
    health: createEmptyCRUDPermissions(),
    analytics: createEmptyCRUDPermissions(),
    settings: createEmptyCRUDPermissions(),
    users: createEmptyCRUDPermissions(),
    roles: createEmptyCRUDPermissions(),
  };
}

/**
 * Create full feature permissions (admin access)
 */
export function createFullFeaturePermissions(): FeaturePermissions {
  return {
    dashboard: createFullCRUDPermissions(),
    incidents: createFullCRUDPermissions(),
    capa: createFullCRUDPermissions(),
    training: createFullCRUDPermissions(),
    compliance: createFullCRUDPermissions(),
    health: createFullCRUDPermissions(),
    analytics: createFullCRUDPermissions(),
    settings: createFullCRUDPermissions(),
    users: createFullCRUDPermissions(),
    roles: createFullCRUDPermissions(),
  };
}

/**
 * Check if a role has permission for a specific action on a feature
 */
export function hasPermission(
  permissions: FeaturePermissions,
  feature: keyof FeaturePermissions,
  action: keyof CRUDPermissions
): boolean {
  return permissions[feature]?.[action] ?? false;
}

/**
 * Check if a role has read access to any feature
 */
export function hasAnyReadAccess(permissions: FeaturePermissions): boolean {
  return Object.values(permissions).some(fp => fp.read);
}

