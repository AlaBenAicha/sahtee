/**
 * CAPA Firestore Service
 * 
 * Handles all CAPA (Corrective and Preventive Action) database operations including:
 * - Action plan CRUD operations
 * - Kanban column management
 * - Progress tracking
 * - Comments and attachments
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
  limit as firestoreLimit,
  onSnapshot,
  Timestamp,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  ActionPlan,
  ActionStatus,
  ActionPriority,
  ActionCategory,
  ChecklistItem,
  ActionComment,
  CompletionProof,
  CAPAFilters,
} from "@/types/capa";
import type { AuditInfo } from "@/types/common";

const ACTION_PLANS_COLLECTION = "actionPlans";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create audit info for a new document
 */
function createAuditInfo(userId: string): AuditInfo {
  const now = Timestamp.now();
  return {
    createdBy: userId,
    createdAt: now,
    updatedBy: userId,
    updatedAt: now,
  };
}

/**
 * Update audit info for an existing document
 */
function updateAuditInfo(userId: string): Partial<AuditInfo> {
  return {
    updatedBy: userId,
    updatedAt: Timestamp.now(),
  };
}

/**
 * Generate a unique reference for a new CAPA
 */
export async function generateCAPAReference(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CAPA-${year}`;
  
  // Get the latest CAPA with this prefix to determine the next number
  const q = query(
    collection(db, ACTION_PLANS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("reference", ">=", prefix),
    where("reference", "<", `${prefix}~`),
    orderBy("reference", "desc"),
    firestoreLimit(1)
  );
  
  try {
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return `${prefix}-001`;
    }
    
    const lastRef = snapshot.docs[0].data().reference as string;
    const lastNumber = parseInt(lastRef.split("-").pop() || "0", 10);
    const nextNumber = (lastNumber + 1).toString().padStart(3, "0");
    
    return `${prefix}-${nextNumber}`;
  } catch {
    // Fallback to timestamp-based reference if query fails
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${timestamp}`;
  }
}

// =============================================================================
// CAPA CRUD Operations
// =============================================================================

/**
 * Create a new CAPA
 */
export async function createCAPA(
  data: Omit<ActionPlan, "id" | "createdAt" | "updatedAt" | "audit" | "reference">,
  userId: string
): Promise<ActionPlan> {
  const docRef = doc(collection(db, ACTION_PLANS_COLLECTION));
  const now = Timestamp.now();
  const reference = await generateCAPAReference(data.organizationId);
  
  const capa: Omit<ActionPlan, "id"> = {
    ...data,
    reference,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, capa);
  
  return { id: docRef.id, ...capa };
}

/**
 * Get a single CAPA by ID
 */
export async function getCAPA(capaId: string): Promise<ActionPlan | null> {
  const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as ActionPlan;
}

/**
 * Update an existing CAPA
 */
export async function updateCAPA(
  capaId: string,
  data: Partial<Omit<ActionPlan, "id" | "createdAt" | "audit" | "reference" | "organizationId">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Delete a CAPA
 */
export async function deleteCAPA(capaId: string): Promise<void> {
  const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
  await deleteDoc(docRef);
}

/**
 * Get CAPAs for an organization with optional filters
 */
export async function getCAPAs(
  organizationId: string,
  filters: CAPAFilters = {},
  limit = 100
): Promise<ActionPlan[]> {
  // Simple query without orderBy to avoid needing composite indexes
  // Sorting is done client-side
  const q = query(
    collection(db, ACTION_PLANS_COLLECTION),
    where("organizationId", "==", organizationId),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  let capas = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ActionPlan[];
  
  // Sort by dueDate client-side (ascending, nulls last)
  capas.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    const aTime = a.dueDate.toMillis ? a.dueDate.toMillis() : 0;
    const bTime = b.dueDate.toMillis ? b.dueDate.toMillis() : 0;
    return aTime - bTime;
  });
  
  // Client-side filtering
  if (filters.status && filters.status.length > 0) {
    capas = capas.filter(c => filters.status!.includes(c.status));
  }
  if (filters.priority && filters.priority.length > 0) {
    capas = capas.filter(c => filters.priority!.includes(c.priority));
  }
  if (filters.category && filters.category.length > 0) {
    capas = capas.filter(c => filters.category!.includes(c.category));
  }
  if (filters.assigneeId) {
    capas = capas.filter(c => c.assigneeId === filters.assigneeId);
  }
  if (filters.departmentId) {
    capas = capas.filter(c => c.departmentId === filters.departmentId);
  }
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    capas = capas.filter(
      c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.reference.toLowerCase().includes(searchLower)
    );
  }
  if (filters.dateRange) {
    const start = filters.dateRange.start.getTime();
    const end = filters.dateRange.end.getTime();
    capas = capas.filter(c => {
      const dueTime = c.dueDate.toMillis();
      return dueTime >= start && dueTime <= end;
    });
  }
  
  return capas;
}

/**
 * Subscribe to real-time CAPA updates for an organization
 */
export function subscribeToCAPAs(
  organizationId: string,
  callback: (capas: ActionPlan[]) => void,
  filters: CAPAFilters = {}
): Unsubscribe {
  const q = query(
    collection(db, ACTION_PLANS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("dueDate", "asc")
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      let capas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ActionPlan[];
      
      // Apply client-side filters
      if (filters.status && filters.status.length > 0) {
        capas = capas.filter(c => filters.status!.includes(c.status));
      }
      if (filters.priority && filters.priority.length > 0) {
        capas = capas.filter(c => filters.priority!.includes(c.priority));
      }
      
      callback(capas);
    },
    (error) => {
      console.error("CAPA subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Kanban Operations
// =============================================================================

/**
 * Map status to Kanban column
 */
export function statusToColumn(status: ActionStatus): string {
  const mapping: Record<ActionStatus, string> = {
    draft: "urgent",
    pending_approval: "to_plan",
    approved: "todo",
    in_progress: "in_progress",
    blocked: "in_progress",
    completed: "done",
    verified: "done",
    closed: "done",
  };
  return mapping[status] || "todo";
}

/**
 * Map Kanban column to status
 */
export function columnToStatus(column: string): ActionStatus {
  const mapping: Record<string, ActionStatus> = {
    urgent: "draft",
    to_plan: "pending_approval",
    todo: "approved",
    in_progress: "in_progress",
    done: "completed",
  };
  return mapping[column] || "approved";
}

/**
 * Move CAPA to a different Kanban column
 */
export async function moveCAPAToColumn(
  capaId: string,
  column: string,
  userId: string
): Promise<void> {
  const newStatus = columnToStatus(column);
  
  const updates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  };
  
  // Set completedAt if moving to done
  if (column === "done") {
    updates.completedAt = Timestamp.now();
  }
  
  const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
  await updateDoc(docRef, updates);
}

/**
 * Get CAPAs grouped by Kanban column
 */
export async function getCAPAsByColumn(
  organizationId: string
): Promise<Record<string, ActionPlan[]>> {
  const capas = await getCAPAs(organizationId);
  
  const columns: Record<string, ActionPlan[]> = {
    urgent: [],
    to_plan: [],
    todo: [],
    in_progress: [],
    done: [],
  };
  
  for (const capa of capas) {
    const column = statusToColumn(capa.status);
    if (columns[column]) {
      columns[column].push(capa);
    }
  }
  
  return columns;
}

// =============================================================================
// Progress & Checklist Operations
// =============================================================================

/**
 * Update CAPA progress and checklist
 */
export async function updateCAPAProgress(
  capaId: string,
  checklistItems: ChecklistItem[],
  userId: string
): Promise<void> {
  const completedCount = checklistItems.filter(item => item.completed).length;
  const progress = checklistItems.length > 0
    ? Math.round((completedCount / checklistItems.length) * 100)
    : 0;
  
  const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
  await updateDoc(docRef, {
    checklistItems,
    progress,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Toggle a checklist item
 */
export async function toggleChecklistItem(
  capaId: string,
  itemId: string,
  completed: boolean,
  userId: string
): Promise<void> {
  const capa = await getCAPA(capaId);
  if (!capa) throw new Error("CAPA not found");
  
  const updatedItems = capa.checklistItems.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        completed,
        completedBy: completed ? userId : undefined,
        completedAt: completed ? Timestamp.now() : undefined,
      };
    }
    return item;
  });
  
  await updateCAPAProgress(capaId, updatedItems, userId);
}

/**
 * Add a checklist item to a CAPA
 */
export async function addChecklistItem(
  capaId: string,
  description: string,
  userId: string
): Promise<ChecklistItem> {
  const capa = await getCAPA(capaId);
  if (!capa) throw new Error("CAPA not found");
  
  const newItem: ChecklistItem = {
    id: crypto.randomUUID(),
    description,
    completed: false,
    order: capa.checklistItems.length,
  };
  
  const updatedItems = [...capa.checklistItems, newItem];
  await updateCAPAProgress(capaId, updatedItems, userId);
  
  return newItem;
}

// =============================================================================
// Comments Operations
// =============================================================================

/**
 * Add a comment to a CAPA
 */
export async function addCAPAComment(
  capaId: string,
  content: string,
  userId: string,
  userName: string
): Promise<ActionComment> {
  const capa = await getCAPA(capaId);
  if (!capa) throw new Error("CAPA not found");
  
  const newComment: ActionComment = {
    id: crypto.randomUUID(),
    userId,
    userName,
    content,
    createdAt: Timestamp.now(),
  };
  
  const updatedComments = [...capa.comments, newComment];
  
  const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
  await updateDoc(docRef, {
    comments: updatedComments,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
  
  return newComment;
}

// =============================================================================
// Completion & Verification
// =============================================================================

/**
 * Mark CAPA as completed with proof
 */
export async function completeCAPA(
  capaId: string,
  proof: CompletionProof,
  userId: string
): Promise<void> {
  const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
  await updateDoc(docRef, {
    status: "completed",
    completedAt: Timestamp.now(),
    completionProof: proof,
    progress: 100,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Verify a completed CAPA
 */
export async function verifyCAPA(
  capaId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
  await updateDoc(docRef, {
    status: "verified",
    verifiedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Close a verified CAPA
 */
export async function closeCAPA(
  capaId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
  await updateDoc(docRef, {
    status: "closed",
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

// =============================================================================
// Linking Operations
// =============================================================================

/**
 * Link a training to a CAPA
 */
export async function linkTrainingToCAPA(
  capaId: string,
  trainingId: string,
  userId: string
): Promise<void> {
  const capa = await getCAPA(capaId);
  if (!capa) throw new Error("CAPA not found");
  
  if (!capa.linkedTrainingIds.includes(trainingId)) {
    const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
    await updateDoc(docRef, {
      linkedTrainingIds: [...capa.linkedTrainingIds, trainingId],
      updatedAt: Timestamp.now(),
      "audit.updatedBy": userId,
      "audit.updatedAt": Timestamp.now(),
    });
  }
}

/**
 * Link equipment to a CAPA
 */
export async function linkEquipmentToCAPA(
  capaId: string,
  equipmentId: string,
  userId: string
): Promise<void> {
  const capa = await getCAPA(capaId);
  if (!capa) throw new Error("CAPA not found");
  
  if (!capa.linkedEquipmentIds.includes(equipmentId)) {
    const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
    await updateDoc(docRef, {
      linkedEquipmentIds: [...capa.linkedEquipmentIds, equipmentId],
      updatedAt: Timestamp.now(),
      "audit.updatedBy": userId,
      "audit.updatedAt": Timestamp.now(),
    });
  }
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Get CAPA statistics for an organization
 */
export async function getCAPAStats(organizationId: string): Promise<{
  total: number;
  urgent: number;
  overdue: number;
  closedOnTime: number;
  byStatus: Record<ActionStatus, number>;
  byPriority: Record<ActionPriority, number>;
  byCategory: Record<ActionCategory, number>;
}> {
  const capas = await getCAPAs(organizationId);
  const now = Timestamp.now().toMillis();
  
  const stats = {
    total: capas.length,
    urgent: 0,
    overdue: 0,
    closedOnTime: 0,
    byStatus: {} as Record<ActionStatus, number>,
    byPriority: {} as Record<ActionPriority, number>,
    byCategory: {} as Record<ActionCategory, number>,
  };
  
  for (const capa of capas) {
    // Count by status
    stats.byStatus[capa.status] = (stats.byStatus[capa.status] || 0) + 1;
    
    // Count by priority
    stats.byPriority[capa.priority] = (stats.byPriority[capa.priority] || 0) + 1;
    
    // Count by category
    stats.byCategory[capa.category] = (stats.byCategory[capa.category] || 0) + 1;
    
    // Count urgent (critical priority and not done)
    if (capa.priority === "critique" && !["completed", "verified", "closed"].includes(capa.status)) {
      stats.urgent++;
    }
    
    // Count overdue (past due date and not done)
    if (capa.dueDate.toMillis() < now && !["completed", "verified", "closed"].includes(capa.status)) {
      stats.overdue++;
    }
    
    // Count closed on time
    if (["completed", "verified", "closed"].includes(capa.status)) {
      if (capa.completedAt && capa.completedAt.toMillis() <= capa.dueDate.toMillis()) {
        stats.closedOnTime++;
      }
    }
  }
  
  return stats;
}

// =============================================================================
// Batch Operations
// =============================================================================

/**
 * Bulk update CAPA statuses
 */
export async function bulkUpdateCAPAStatus(
  capaIds: string[],
  status: ActionStatus,
  userId: string
): Promise<void> {
  const batch = writeBatch(db);
  const now = Timestamp.now();
  
  for (const capaId of capaIds) {
    const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
    batch.update(docRef, {
      status,
      updatedAt: now,
      "audit.updatedBy": userId,
      "audit.updatedAt": now,
    });
  }
  
  await batch.commit();
}

/**
 * Bulk assign CAPAs to a user
 */
export async function bulkAssignCAPAs(
  capaIds: string[],
  assigneeId: string,
  assigneeName: string,
  userId: string
): Promise<void> {
  const batch = writeBatch(db);
  const now = Timestamp.now();
  
  for (const capaId of capaIds) {
    const docRef = doc(db, ACTION_PLANS_COLLECTION, capaId);
    batch.update(docRef, {
      assigneeId,
      assigneeName,
      updatedAt: now,
      "audit.updatedBy": userId,
      "audit.updatedAt": now,
    });
  }
  
  await batch.commit();
}

/**
 * Alias for getCAPAs - get all CAPAs for an organization
 * This is used by the CAPA AI service for analysis
 */
export async function getCAPAsByOrganization(
  organizationId: string
): Promise<ActionPlan[]> {
  return getCAPAs(organizationId, {});
}

