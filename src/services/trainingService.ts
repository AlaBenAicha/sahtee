/**
 * Training Firestore Service
 * 
 * Handles all training-related database operations including:
 * - Training plan CRUD operations
 * - Training records and progress tracking
 * - Employee enrollment
 * - Certificate generation
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit as firestoreLimit,
  onSnapshot,
  Timestamp,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  TrainingPlan,
  TrainingRecord,
  TrainingPriority,
  TrainingSource,
  TrainingCompletionStatus,
} from "@/types/capa";
import type { AuditInfo } from "@/types/common";

const TRAINING_PLANS_COLLECTION = "trainingPlans";
const TRAINING_RECORDS_COLLECTION = "trainingRecords";

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

// =============================================================================
// Training Plan CRUD Operations
// =============================================================================

/**
 * Create a new training plan
 */
export async function createTrainingPlan(
  data: Omit<TrainingPlan, "id" | "createdAt" | "updatedAt" | "audit" | "completionStatus">,
  userId: string
): Promise<TrainingPlan> {
  const docRef = doc(collection(db, TRAINING_PLANS_COLLECTION));
  const now = Timestamp.now();

  const completionStatus: TrainingCompletionStatus = {
    total: data.assignedEmployees.length,
    completed: 0,
    inProgress: 0,
    notStarted: data.assignedEmployees.length,
    overdue: 0,
  };

  const trainingPlan: Omit<TrainingPlan, "id"> = {
    ...data,
    completionStatus,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };

  await setDoc(docRef, trainingPlan);

  // Create training records for each assigned employee
  if (data.assignedEmployees.length > 0) {
    const batch = writeBatch(db);

    for (const employeeId of data.assignedEmployees) {
      const recordRef = doc(collection(db, TRAINING_RECORDS_COLLECTION));
      const record: Omit<TrainingRecord, "id"> = {
        organizationId: data.organizationId,
        trainingPlanId: docRef.id,
        employeeId,
        status: "not_started",
        progress: 0,
        createdAt: now,
        updatedAt: now,
        audit: createAuditInfo(userId),
      };
      batch.set(recordRef, record);
    }

    await batch.commit();
  }

  return { id: docRef.id, ...trainingPlan };
}

/**
 * Get a single training plan by ID
 */
export async function getTrainingPlan(planId: string): Promise<TrainingPlan | null> {
  const docRef = doc(db, TRAINING_PLANS_COLLECTION, planId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as TrainingPlan;
}

/**
 * Update an existing training plan
 */
export async function updateTrainingPlan(
  planId: string,
  data: Partial<Omit<TrainingPlan, "id" | "createdAt" | "audit" | "organizationId">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, TRAINING_PLANS_COLLECTION, planId);

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Delete a training plan and its records
 */
export async function deleteTrainingPlan(planId: string): Promise<void> {
  const batch = writeBatch(db);

  // Delete the training plan
  batch.delete(doc(db, TRAINING_PLANS_COLLECTION, planId));

  // Delete all associated records
  const recordsQuery = query(
    collection(db, TRAINING_RECORDS_COLLECTION),
    where("trainingPlanId", "==", planId)
  );
  const recordsSnapshot = await getDocs(recordsQuery);

  for (const recordDoc of recordsSnapshot.docs) {
    batch.delete(recordDoc.ref);
  }

  await batch.commit();
}

/**
 * Get training plans for an organization
 */
export async function getTrainingPlans(
  organizationId: string,
  filters: {
    priority?: TrainingPriority[];
    source?: TrainingSource[];
    mandatory?: boolean;
    departmentId?: string;
    searchQuery?: string;
  } = {},
  limit = 100
): Promise<TrainingPlan[]> {
  // Query without orderBy to avoid composite index requirements
  const q = query(
    collection(db, TRAINING_PLANS_COLLECTION),
    where("organizationId", "==", organizationId),
    firestoreLimit(limit)
  );

  const snapshot = await getDocs(q);
  let plans = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as TrainingPlan[];

  // Client-side sorting by dueDate
  plans.sort((a, b) => {
    const aTime = a.dueDate?.toMillis?.() || 0;
    const bTime = b.dueDate?.toMillis?.() || 0;
    return aTime - bTime;
  });

  // Client-side filtering
  if (filters.priority && filters.priority.length > 0) {
    plans = plans.filter(p => filters.priority!.includes(p.priority));
  }
  if (filters.source && filters.source.length > 0) {
    plans = plans.filter(p => filters.source!.includes(p.source));
  }
  if (filters.mandatory !== undefined) {
    plans = plans.filter(p => p.mandatory === filters.mandatory);
  }
  if (filters.departmentId) {
    plans = plans.filter(p => p.departmentIds.includes(filters.departmentId!));
  }
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    plans = plans.filter(
      p =>
        p.courseName.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    );
  }

  return plans;
}

/**
 * Subscribe to real-time training plan updates
 */
export function subscribeToTrainingPlans(
  organizationId: string,
  callback: (plans: TrainingPlan[]) => void
): Unsubscribe {
  // Query without orderBy to avoid composite index requirements
  const q = query(
    collection(db, TRAINING_PLANS_COLLECTION),
    where("organizationId", "==", organizationId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const plans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainingPlan[];

      // Client-side sorting by dueDate
      plans.sort((a, b) => {
        const aTime = a.dueDate?.toMillis?.() || 0;
        const bTime = b.dueDate?.toMillis?.() || 0;
        return aTime - bTime;
      });

      callback(plans);
    },
    (error) => {
      console.error("Training plans subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Training Record Operations
// =============================================================================

/**
 * Get training record for a specific employee and plan
 */
export async function getTrainingRecord(
  planId: string,
  employeeId: string
): Promise<TrainingRecord | null> {
  const q = query(
    collection(db, TRAINING_RECORDS_COLLECTION),
    where("trainingPlanId", "==", planId),
    where("employeeId", "==", employeeId),
    firestoreLimit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TrainingRecord;
}

/**
 * Get all training records for an employee
 */
export async function getEmployeeTrainingRecords(
  organizationId: string,
  employeeId: string
): Promise<TrainingRecord[]> {
  // Simple query without orderBy to avoid composite index requirements
  const q = query(
    collection(db, TRAINING_RECORDS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("employeeId", "==", employeeId)
  );

  const snapshot = await getDocs(q);

  const records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as TrainingRecord[];

  // Sort client-side by createdAt descending
  records.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });

  return records;
}

/**
 * Get all training records for a training plan
 */
export async function getPlanTrainingRecords(planId: string): Promise<TrainingRecord[]> {
  const q = query(
    collection(db, TRAINING_RECORDS_COLLECTION),
    where("trainingPlanId", "==", planId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as TrainingRecord[];
}

/**
 * Subscribe to training records for an employee
 */
export function subscribeToEmployeeTrainingRecords(
  organizationId: string,
  employeeId: string,
  callback: (records: TrainingRecord[]) => void
): Unsubscribe {
  // Simple query without orderBy to avoid composite index requirements
  const q = query(
    collection(db, TRAINING_RECORDS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("employeeId", "==", employeeId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainingRecord[];

      // Sort client-side by createdAt descending
      records.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      callback(records);
    },
    (error) => {
      console.error("Training records subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Enrollment Operations
// =============================================================================

/**
 * Enroll an employee in a training plan
 */
export async function enrollEmployee(
  planId: string,
  employeeId: string,
  organizationId: string,
  userId: string
): Promise<TrainingRecord> {
  // Check if already enrolled
  const existing = await getTrainingRecord(planId, employeeId);
  if (existing) {
    return existing;
  }

  const now = Timestamp.now();
  const docRef = doc(collection(db, TRAINING_RECORDS_COLLECTION));

  const record: Omit<TrainingRecord, "id"> = {
    organizationId,
    trainingPlanId: planId,
    employeeId,
    status: "not_started",
    progress: 0,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };

  await setDoc(docRef, record);

  // Update training plan with new employee
  const plan = await getTrainingPlan(planId);
  if (plan && !plan.assignedEmployees.includes(employeeId)) {
    await updateTrainingPlan(
      planId,
      {
        assignedEmployees: [...plan.assignedEmployees, employeeId],
        completionStatus: {
          ...plan.completionStatus,
          total: plan.completionStatus.total + 1,
          notStarted: plan.completionStatus.notStarted + 1,
        },
      },
      userId
    );
  }

  return { id: docRef.id, ...record };
}

/**
 * Bulk enroll employees in a training plan
 */
export async function bulkEnrollEmployees(
  planId: string,
  employeeIds: string[],
  organizationId: string,
  userId: string
): Promise<void> {
  const now = Timestamp.now();
  const batch = writeBatch(db);

  // Get existing records to avoid duplicates
  const existingRecords = await getPlanTrainingRecords(planId);
  const existingEmployeeIds = new Set(existingRecords.map(r => r.employeeId));

  const newEmployeeIds = employeeIds.filter(id => !existingEmployeeIds.has(id));

  for (const employeeId of newEmployeeIds) {
    const recordRef = doc(collection(db, TRAINING_RECORDS_COLLECTION));
    const record: Omit<TrainingRecord, "id"> = {
      organizationId,
      trainingPlanId: planId,
      employeeId,
      status: "not_started",
      progress: 0,
      createdAt: now,
      updatedAt: now,
      audit: createAuditInfo(userId),
    };
    batch.set(recordRef, record);
  }

  await batch.commit();

  // Update training plan
  const plan = await getTrainingPlan(planId);
  if (plan) {
    const allEmployees = [...new Set([...plan.assignedEmployees, ...newEmployeeIds])];
    await updateTrainingPlan(
      planId,
      {
        assignedEmployees: allEmployees,
        completionStatus: {
          ...plan.completionStatus,
          total: allEmployees.length,
          notStarted: plan.completionStatus.notStarted + newEmployeeIds.length,
        },
      },
      userId
    );
  }
}

// =============================================================================
// Progress Operations
// =============================================================================

/**
 * Start a training
 */
export async function startTraining(
  recordId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, TRAINING_RECORDS_COLLECTION, recordId);

  await updateDoc(docRef, {
    status: "in_progress",
    startedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });

  // Update plan completion status
  const record = (await getDoc(docRef)).data() as TrainingRecord;
  await updatePlanCompletionStatus(record.trainingPlanId, userId);
}

/**
 * Update training progress
 */
export async function updateTrainingProgress(
  recordId: string,
  progress: number,
  userId: string
): Promise<void> {
  const docRef = doc(db, TRAINING_RECORDS_COLLECTION, recordId);

  const updates: Record<string, unknown> = {
    progress: Math.min(100, Math.max(0, progress)),
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  };

  // If progress is 100%, mark as completed
  if (progress >= 100) {
    updates.status = "completed";
    updates.completedAt = Timestamp.now();
  } else if (progress > 0) {
    updates.status = "in_progress";
    if (!updates.startedAt) {
      updates.startedAt = Timestamp.now();
    }
  }

  await updateDoc(docRef, updates);

  // Update plan completion status
  const record = (await getDoc(docRef)).data() as TrainingRecord;
  await updatePlanCompletionStatus(record.trainingPlanId, userId);
}

/**
 * Complete a training with optional score
 */
export async function completeTraining(
  recordId: string,
  score: number | undefined,
  userId: string
): Promise<void> {
  const docRef = doc(db, TRAINING_RECORDS_COLLECTION, recordId);
  const record = (await getDoc(docRef)).data() as TrainingRecord;
  const plan = await getTrainingPlan(record.trainingPlanId);

  const updates: Record<string, unknown> = {
    status: "completed",
    progress: 100,
    completedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  };

  if (score !== undefined) {
    updates.score = score;
  }

  // Set expiration date if plan has validity period
  if (plan && plan.linkedActionPlanId) {
    // Training linked to a CAPA doesn't expire
  } else {
    // Default to 1 year validity
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    updates.expiresAt = Timestamp.fromDate(expiresAt);
  }

  await updateDoc(docRef, updates);

  // Update plan completion status
  await updatePlanCompletionStatus(record.trainingPlanId, userId);
}

/**
 * Update training plan completion status
 */
async function updatePlanCompletionStatus(
  planId: string,
  userId: string
): Promise<void> {
  const records = await getPlanTrainingRecords(planId);
  const plan = await getTrainingPlan(planId);

  if (!plan) return;

  const now = plan.dueDate.toMillis();
  const currentTime = Date.now();

  const completionStatus: TrainingCompletionStatus = {
    total: records.length,
    completed: records.filter(r => r.status === "completed").length,
    inProgress: records.filter(r => r.status === "in_progress").length,
    notStarted: records.filter(r => r.status === "not_started").length,
    overdue: records.filter(r =>
      r.status !== "completed" && now < currentTime
    ).length,
  };

  await updateTrainingPlan(planId, { completionStatus }, userId);
}

// =============================================================================
// Certificate Operations
// =============================================================================

/**
 * Generate certificate URL for completed training
 */
export async function generateCertificate(
  recordId: string,
  certificateUrl: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, TRAINING_RECORDS_COLLECTION, recordId);

  await updateDoc(docRef, {
    certificateUrl,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Get training statistics for an organization
 */
export async function getTrainingStats(organizationId: string): Promise<{
  totalPlans: number;
  activePlans: number;
  mandatoryPlans: number;
  totalEnrollments: number;
  completedEnrollments: number;
  overallCompletionRate: number;
  byPriority: Record<TrainingPriority, number>;
}> {
  const plans = await getTrainingPlans(organizationId);

  let totalEnrollments = 0;
  let completedEnrollments = 0;
  const byPriority: Record<TrainingPriority, number> = {
    obligatoire: 0,
    recommandee: 0,
    optionnelle: 0,
  };

  const now = Date.now();
  const activePlans = plans.filter(p => p.dueDate.toMillis() > now);
  const mandatoryPlans = plans.filter(p => p.mandatory);

  for (const plan of plans) {
    byPriority[plan.priority] = (byPriority[plan.priority] || 0) + 1;
    totalEnrollments += plan.completionStatus.total;
    completedEnrollments += plan.completionStatus.completed;
  }

  const overallCompletionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0;

  return {
    totalPlans: plans.length,
    activePlans: activePlans.length,
    mandatoryPlans: mandatoryPlans.length,
    totalEnrollments,
    completedEnrollments,
    overallCompletionRate,
    byPriority,
  };
}

/**
 * Get training statistics for an employee
 */
export async function getEmployeeTrainingStats(
  organizationId: string,
  employeeId: string
): Promise<{
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
  expiringWithin30Days: number;
  completionRate: number;
}> {
  const records = await getEmployeeTrainingRecords(organizationId, employeeId);
  const now = Date.now();
  const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

  const stats = {
    total: records.length,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    overdue: 0,
    expiringWithin30Days: 0,
    completionRate: 0,
  };

  for (const record of records) {
    switch (record.status) {
      case "completed":
        stats.completed++;
        if (record.expiresAt && record.expiresAt.toMillis() <= thirtyDaysFromNow) {
          stats.expiringWithin30Days++;
        }
        break;
      case "in_progress":
        stats.inProgress++;
        break;
      case "not_started":
        stats.notStarted++;
        break;
      case "failed":
        // Could be counted separately if needed
        break;
    }
  }

  stats.completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return stats;
}

