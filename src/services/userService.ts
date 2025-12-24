/**
 * User Firestore Service
 * 
 * Handles all user-related database operations.
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
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { User, UserInvitation, UserRole, UserStatus } from "@/types/user";
import type { PaginatedResponse, PaginationParams } from "@/types/common";

const USERS_COLLECTION = "users";
const INVITATIONS_COLLECTION = "invitations";

// =============================================================================
// User CRUD Operations
// =============================================================================

/**
 * Get a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as User;
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("email", "==", email.toLowerCase()),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

/**
 * Get users by organization with pagination
 */
export async function getUsersByOrganization(
  organizationId: string,
  params: PaginationParams = { page: 1, limit: 20 },
  lastDoc?: DocumentSnapshot
): Promise<PaginatedResponse<User>> {
  let q = query(
    collection(db, USERS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy(params.sortBy || "displayName", params.sortOrder || "asc"),
    limit(params.limit + 1) // Fetch one extra to check if there are more
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;
  const hasMore = docs.length > params.limit;
  
  // Remove the extra document if it exists
  const items = docs.slice(0, params.limit).map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
  
  return {
    items,
    total: -1, // Firestore doesn't provide total count efficiently
    page: params.page,
    limit: params.limit,
    hasMore,
  };
}

/**
 * Get users by department
 */
export async function getUsersByDepartment(
  organizationId: string,
  departmentId: string
): Promise<User[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("departmentId", "==", departmentId),
    orderBy("displayName", "asc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

/**
 * Get users by legacy role
 * @deprecated Use getUsersByRoleId instead
 */
export async function getUsersByRole(
  organizationId: string,
  role: UserRole
): Promise<User[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("role", "==", role),
    orderBy("displayName", "asc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

/**
 * Get users by custom role ID
 */
export async function getUsersByRoleId(
  organizationId: string,
  roleId: string
): Promise<User[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("roleId", "==", roleId),
    orderBy("displayName", "asc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

/**
 * Get organization admins
 */
export async function getOrganizationAdmins(organizationId: string): Promise<User[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("isOrgAdmin", "==", true),
    orderBy("displayName", "asc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

/**
 * Update a user
 */
export async function updateUser(
  userId: string,
  data: Partial<User>,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);
  
  await updateDoc(docRef, {
    ...data,
    "audit.updatedBy": updatedBy,
    "audit.updatedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update user status
 */
export async function updateUserStatus(
  userId: string,
  status: UserStatus,
  updatedBy: string
): Promise<void> {
  await updateUser(userId, { status }, updatedBy);
}

/**
 * Update user legacy role
 * @deprecated Use updateUserRoleId instead
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
  updatedBy: string
): Promise<void> {
  await updateUser(userId, { role }, updatedBy);
}

/**
 * Update user's custom role ID
 */
export async function updateUserRoleId(
  userId: string,
  roleId: string,
  updatedBy: string
): Promise<void> {
  await updateUser(userId, { roleId }, updatedBy);
}

/**
 * Update user's org_admin status
 */
export async function updateUserOrgAdminStatus(
  userId: string,
  isOrgAdmin: boolean,
  updatedBy: string
): Promise<void> {
  await updateUser(userId, { isOrgAdmin }, updatedBy);
}

/**
 * Delete a user (soft delete by setting status to deactivated)
 */
export async function deactivateUser(
  userId: string,
  updatedBy: string
): Promise<void> {
  await updateUserStatus(userId, "deactivated", updatedBy);
}

/**
 * Hard delete a user (use with caution)
 */
export async function deleteUser(userId: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(docRef);
}

// =============================================================================
// User Invitation Operations
// =============================================================================

/**
 * Create a user invitation with custom role
 */
export async function createInvitation(
  email: string,
  organizationId: string,
  roleId: string,
  invitedBy: string,
  departmentId?: string
): Promise<UserInvitation> {
  // Generate a unique token
  const token = generateInvitationToken();
  
  // Set expiration to 7 days from now
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  
  const now = Timestamp.now();
  const invitation: Omit<UserInvitation, "id"> = {
    email: email.toLowerCase(),
    organizationId,
    roleId,
    departmentId,
    invitedBy,
    expiresAt,
    status: "pending",
    token,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = doc(collection(db, INVITATIONS_COLLECTION));
  await setDoc(docRef, invitation);
  
  return { id: docRef.id, ...invitation };
}

/**
 * Generate a shareable invitation link
 */
export function generateInvitationLink(token: string, baseUrl: string = window.location.origin): string {
  return `${baseUrl}/join?token=${token}`;
}

/**
 * Check if an invitation is valid (not expired and pending)
 */
export async function isInvitationValid(token: string): Promise<{
  valid: boolean;
  invitation: UserInvitation | null;
  error?: string;
}> {
  const invitation = await getInvitationByToken(token);
  
  if (!invitation) {
    return { valid: false, invitation: null, error: "Invitation non trouvée" };
  }
  
  if (invitation.status !== "pending") {
    return { valid: false, invitation, error: "Cette invitation a déjà été utilisée ou annulée" };
  }
  
  const now = new Date();
  const expiresAt = invitation.expiresAt.toDate();
  
  if (now > expiresAt) {
    return { valid: false, invitation, error: "Cette invitation a expiré" };
  }
  
  return { valid: true, invitation };
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string): Promise<UserInvitation | null> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where("token", "==", token),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as UserInvitation;
}

/**
 * Get pending invitations for an organization
 */
export async function getPendingInvitations(organizationId: string): Promise<UserInvitation[]> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as UserInvitation[];
}

/**
 * Get all invitations for an organization (all statuses)
 */
export async function getInvitationsByOrganization(organizationId: string): Promise<UserInvitation[]> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as UserInvitation[];
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(invitationId: string): Promise<void> {
  const docRef = doc(db, INVITATIONS_COLLECTION, invitationId);
  await updateDoc(docRef, {
    status: "accepted",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  const docRef = doc(db, INVITATIONS_COLLECTION, invitationId);
  await updateDoc(docRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Check and expire old invitations
 */
export async function expireOldInvitations(organizationId: string): Promise<number> {
  const now = Timestamp.now();
  
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("status", "==", "pending"),
    where("expiresAt", "<", now)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return 0;
  }
  
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      status: "expired",
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
  return querySnapshot.size;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a unique invitation token
 */
function generateInvitationToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Get user count by organization
 */
export async function getUserCount(organizationId: string): Promise<number> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("status", "!=", "deactivated")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
}

/**
 * Search users by name or email
 */
export async function searchUsers(
  organizationId: string,
  searchTerm: string,
  maxResults: number = 10
): Promise<User[]> {
  // Firestore doesn't support full-text search natively
  // This is a simple prefix match on displayName
  // For production, consider using Algolia or Elasticsearch
  const searchTermLower = searchTerm.toLowerCase();
  
  const q = query(
    collection(db, USERS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("status", "!=", "deactivated"),
    orderBy("displayName"),
    limit(maxResults * 3) // Fetch more and filter client-side
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as User))
    .filter(user => 
      user.displayName.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower)
    )
    .slice(0, maxResults);
}

