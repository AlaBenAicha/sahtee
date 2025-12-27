/**
 * Health Firestore Service
 * 
 * Handles all health-related database operations including:
 * - Health record CRUD operations (physician-only for PHI)
 * - Medical visit scheduling and tracking
 * - Exposure monitoring
 * - Health alerts management
 * - Aggregate statistics for dashboard
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  HealthRecord,
  MedicalVisit,
  MedicalVisitStatus,
  HealthAlert,
  HealthAlertStatus,
  HealthAlertSeverity,
  HealthAlertType,
  HealthStats,
  OrganizationExposure,
  ExposureMeasurement,
  FitnessStatus,
  ExaminationType,
  PathologyType,
  HazardCategory,
} from "@/types/health";
import type { AuditInfo, FileMetadata } from "@/types/common";

// Collection names
const HEALTH_RECORDS_COLLECTION = "healthRecords";
const MEDICAL_VISITS_COLLECTION = "medicalVisits";
const HEALTH_ALERTS_COLLECTION = "healthAlerts";
const EXPOSURES_COLLECTION = "exposures";
const MEASUREMENTS_COLLECTION = "measurements";
const HEALTH_STATS_COLLECTION = "healthStats";

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
 * Generate a unique reference for a medical visit
 */
export async function generateVisitReference(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const prefix = `VIS-${year}${month}`;
  
  const q = query(
    collection(db, MEDICAL_VISITS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
    firestoreLimit(1)
  );
  
  try {
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return `${prefix}-001`;
    }
    
    const lastId = snapshot.docs[0].id;
    const lastNumber = parseInt(lastId.split("-").pop() || "0", 10);
    const nextNumber = (lastNumber + 1).toString().padStart(3, "0");
    
    return `${prefix}-${nextNumber}`;
  } catch {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${timestamp}`;
  }
}

// =============================================================================
// Health Record CRUD Operations (Physician-Only for PHI)
// =============================================================================

/**
 * Check if an employee already has a health record
 */
export async function employeeHasHealthRecord(
  organizationId: string,
  employeeId: string
): Promise<boolean> {
  const existing = await getHealthRecordByEmployee(organizationId, employeeId);
  return existing !== null;
}

/**
 * Create a new health record
 * Note: Only physicians should be able to create health records
 * Throws error if employee already has a health record (one per employee)
 */
export async function createHealthRecord(
  data: Omit<HealthRecord, "id" | "createdAt" | "updatedAt" | "audit">,
  userId: string
): Promise<HealthRecord> {
  // Check if employee already has a health record
  const existingRecord = await getHealthRecordByEmployee(data.organizationId, data.employeeId);
  if (existingRecord) {
    throw new Error("EMPLOYEE_ALREADY_HAS_RECORD");
  }
  
  const docRef = doc(collection(db, HEALTH_RECORDS_COLLECTION));
  const now = Timestamp.now();
  
  const healthRecord: Omit<HealthRecord, "id"> = {
    ...data,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, healthRecord);
  
  return { id: docRef.id, ...healthRecord };
}

/**
 * Get a single health record by ID
 * Note: Access should be restricted to physicians only
 */
export async function getHealthRecord(recordId: string): Promise<HealthRecord | null> {
  const docRef = doc(db, HEALTH_RECORDS_COLLECTION, recordId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as HealthRecord;
}

/**
 * Get health record by employee ID
 */
export async function getHealthRecordByEmployee(
  organizationId: string,
  employeeId: string
): Promise<HealthRecord | null> {
  const q = query(
    collection(db, HEALTH_RECORDS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("employeeId", "==", employeeId),
    firestoreLimit(1)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as HealthRecord;
}

/**
 * Update an existing health record
 */
export async function updateHealthRecord(
  recordId: string,
  data: Partial<Omit<HealthRecord, "id" | "createdAt" | "audit" | "organizationId">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, HEALTH_RECORDS_COLLECTION, recordId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Delete a health record
 */
export async function deleteHealthRecord(recordId: string): Promise<void> {
  const docRef = doc(db, HEALTH_RECORDS_COLLECTION, recordId);
  await deleteDoc(docRef);
}

/**
 * Get all health records for an organization (physician only)
 */
export async function getHealthRecords(
  organizationId: string,
  filters: {
    fitnessStatus?: FitnessStatus[];
    departmentId?: string;
    searchQuery?: string;
  } = {},
  limit = 100
): Promise<HealthRecord[]> {
  const q = query(
    collection(db, HEALTH_RECORDS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("updatedAt", "desc"),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  let records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as HealthRecord[];
  
  // Client-side filtering
  if (filters.fitnessStatus && filters.fitnessStatus.length > 0) {
    records = records.filter(r => filters.fitnessStatus!.includes(r.fitnessStatus));
  }
  if (filters.departmentId) {
    records = records.filter(r => r.departmentId === filters.departmentId);
  }
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    records = records.filter(
      r =>
        r.employeeName.toLowerCase().includes(searchLower) ||
        r.jobTitle.toLowerCase().includes(searchLower)
    );
  }
  
  return records;
}

/**
 * Subscribe to real-time health record updates
 */
export function subscribeToHealthRecords(
  organizationId: string,
  callback: (records: HealthRecord[]) => void
): Unsubscribe {
  const q = query(
    collection(db, HEALTH_RECORDS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("updatedAt", "desc")
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as HealthRecord[];
      
      callback(records);
    },
    (error) => {
      console.error("Health records subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Medical Visit Operations
// =============================================================================

/**
 * Create a new medical visit
 */
export async function createMedicalVisit(
  data: Omit<MedicalVisit, "id" | "createdAt" | "updatedAt" | "audit">,
  userId: string
): Promise<MedicalVisit> {
  const docRef = doc(collection(db, MEDICAL_VISITS_COLLECTION));
  const now = Timestamp.now();
  
  const visit: Omit<MedicalVisit, "id"> = {
    ...data,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, visit);
  
  return { id: docRef.id, ...visit };
}

/**
 * Get a single medical visit by ID
 */
export async function getMedicalVisit(visitId: string): Promise<MedicalVisit | null> {
  const docRef = doc(db, MEDICAL_VISITS_COLLECTION, visitId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as MedicalVisit;
}

/**
 * Update a medical visit
 */
export async function updateMedicalVisit(
  visitId: string,
  data: Partial<Omit<MedicalVisit, "id" | "createdAt" | "audit" | "organizationId">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, MEDICAL_VISITS_COLLECTION, visitId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Delete a medical visit
 */
export async function deleteMedicalVisit(visitId: string): Promise<void> {
  const docRef = doc(db, MEDICAL_VISITS_COLLECTION, visitId);
  await deleteDoc(docRef);
}

/**
 * Get medical visits for an organization with filters
 */
export async function getMedicalVisits(
  organizationId: string,
  filters: {
    status?: MedicalVisitStatus[];
    type?: ExaminationType[];
    physicianId?: string;
    employeeId?: string;
    departmentId?: string;
    dateRange?: { start: Date; end: Date };
  } = {},
  limit = 100
): Promise<MedicalVisit[]> {
  const q = query(
    collection(db, MEDICAL_VISITS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("scheduledDate", "desc"),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  let visits = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as MedicalVisit[];
  
  // Client-side filtering
  if (filters.status && filters.status.length > 0) {
    visits = visits.filter(v => filters.status!.includes(v.status));
  }
  if (filters.type && filters.type.length > 0) {
    visits = visits.filter(v => filters.type!.includes(v.type));
  }
  if (filters.physicianId) {
    visits = visits.filter(v => v.physicianId === filters.physicianId);
  }
  if (filters.employeeId) {
    visits = visits.filter(v => v.employeeId === filters.employeeId);
  }
  if (filters.departmentId) {
    visits = visits.filter(v => v.departmentId === filters.departmentId);
  }
  if (filters.dateRange) {
    const start = filters.dateRange.start.getTime();
    const end = filters.dateRange.end.getTime();
    visits = visits.filter(v => {
      const scheduledTime = v.scheduledDate.toMillis();
      return scheduledTime >= start && scheduledTime <= end;
    });
  }
  
  return visits;
}

/**
 * Get medical visits linked to a specific health record
 */
export async function getMedicalVisitsByHealthRecord(
  healthRecordId: string,
  organizationId: string
): Promise<MedicalVisit[]> {
  const q = query(
    collection(db, MEDICAL_VISITS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("healthRecordId", "==", healthRecordId),
    orderBy("scheduledDate", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as MedicalVisit[];
}

/**
 * Get upcoming visits (scheduled in the future)
 */
export async function getUpcomingVisits(
  organizationId: string,
  limit = 10
): Promise<MedicalVisit[]> {
  const now = Timestamp.now();
  
  const q = query(
    collection(db, MEDICAL_VISITS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("status", "==", "scheduled"),
    where("scheduledDate", ">=", now),
    orderBy("scheduledDate", "asc"),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as MedicalVisit[];
}

/**
 * Get overdue visits
 */
export async function getOverdueVisits(organizationId: string): Promise<MedicalVisit[]> {
  const now = Timestamp.now();
  
  const q = query(
    collection(db, MEDICAL_VISITS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("status", "==", "scheduled"),
    where("scheduledDate", "<", now),
    orderBy("scheduledDate", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as MedicalVisit[];
}

/**
 * Complete a medical visit with findings
 */
export async function completeMedicalVisit(
  visitId: string,
  findings: {
    findings: string;
    recommendations?: string[];
    fitnessDecision: FitnessStatus;
    nextVisitRecommended?: Timestamp;
    nextVisitType?: ExaminationType;
  },
  userId: string
): Promise<void> {
  const docRef = doc(db, MEDICAL_VISITS_COLLECTION, visitId);
  
  await updateDoc(docRef, {
    ...findings,
    status: "completed",
    completedDate: Timestamp.now(),
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Subscribe to real-time visit updates
 */
export function subscribeToMedicalVisits(
  organizationId: string,
  callback: (visits: MedicalVisit[]) => void
): Unsubscribe {
  const q = query(
    collection(db, MEDICAL_VISITS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("scheduledDate", "desc")
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const visits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as MedicalVisit[];
      
      callback(visits);
    },
    (error) => {
      console.error("Medical visits subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Exposure Monitoring Operations
// =============================================================================

/**
 * Create a new exposure record
 */
export async function createExposure(
  data: Omit<OrganizationExposure, "id" | "createdAt" | "updatedAt" | "audit">,
  userId: string
): Promise<OrganizationExposure> {
  const docRef = doc(collection(db, EXPOSURES_COLLECTION));
  const now = Timestamp.now();
  
  const exposure: Omit<OrganizationExposure, "id"> = {
    ...data,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, exposure);
  
  return { id: docRef.id, ...exposure };
}

/**
 * Get a single exposure record
 */
export async function getExposure(exposureId: string): Promise<OrganizationExposure | null> {
  const docRef = doc(db, EXPOSURES_COLLECTION, exposureId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as OrganizationExposure;
}

/**
 * Update an exposure record
 */
export async function updateExposure(
  exposureId: string,
  data: Partial<Omit<OrganizationExposure, "id" | "createdAt" | "audit" | "organizationId">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, EXPOSURES_COLLECTION, exposureId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Delete an exposure record
 */
export async function deleteExposure(exposureId: string): Promise<void> {
  const docRef = doc(db, EXPOSURES_COLLECTION, exposureId);
  await deleteDoc(docRef);
}

/**
 * Get all exposures for an organization
 */
export async function getExposures(
  organizationId: string,
  filters: {
    hazardType?: HazardCategory[];
    alertLevel?: ("low" | "moderate" | "elevated" | "critical")[];
    siteId?: string;
    departmentId?: string;
  } = {},
  limit = 100
): Promise<OrganizationExposure[]> {
  const q = query(
    collection(db, EXPOSURES_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("lastMeasurementDate", "desc"),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  let exposures = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as OrganizationExposure[];
  
  // Client-side filtering
  if (filters.hazardType && filters.hazardType.length > 0) {
    exposures = exposures.filter(e => filters.hazardType!.includes(e.hazardType));
  }
  if (filters.alertLevel && filters.alertLevel.length > 0) {
    exposures = exposures.filter(e => filters.alertLevel!.includes(e.alertLevel));
  }
  if (filters.siteId) {
    exposures = exposures.filter(e => e.siteId === filters.siteId);
  }
  if (filters.departmentId) {
    exposures = exposures.filter(e => e.departmentId === filters.departmentId);
  }
  
  return exposures;
}

/**
 * Get critical exposures (exceeding limits)
 */
export async function getCriticalExposures(organizationId: string): Promise<OrganizationExposure[]> {
  const q = query(
    collection(db, EXPOSURES_COLLECTION),
    where("organizationId", "==", organizationId),
    where("alertLevel", "in", ["elevated", "critical"]),
    orderBy("percentOfLimit", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as OrganizationExposure[];
}

// =============================================================================
// Measurement Functions (Separate Collection)
// =============================================================================

/**
 * Create a new measurement in the measurements collection
 */
export async function createMeasurement(
  measurementData: Omit<ExposureMeasurement, "id" | "createdAt" | "updatedAt">,
  userId: string
): Promise<ExposureMeasurement> {
  const now = Timestamp.now();
  
  const docRef = await addDoc(collection(db, MEASUREMENTS_COLLECTION), {
    ...measurementData,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });
  
  // Update the parent exposure with latest measurement data
  await updateExposureFromMeasurement(measurementData.exposureId, measurementData, userId);
  
  return {
    id: docRef.id,
    ...measurementData,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  } as ExposureMeasurement;
}

/**
 * Get all measurements for a specific exposure, ordered by date descending
 */
export async function getMeasurementsByExposure(
  exposureId: string
): Promise<ExposureMeasurement[]> {
  const q = query(
    collection(db, MEASUREMENTS_COLLECTION),
    where("exposureId", "==", exposureId),
    orderBy("date", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ExposureMeasurement[];
}

/**
 * Get latest measurement for an exposure
 */
export async function getLatestMeasurement(
  exposureId: string
): Promise<ExposureMeasurement | null> {
  const q = query(
    collection(db, MEASUREMENTS_COLLECTION),
    where("exposureId", "==", exposureId),
    orderBy("date", "desc"),
    firestoreLimit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as ExposureMeasurement;
}

/**
 * Update parent exposure with latest measurement data
 */
async function updateExposureFromMeasurement(
  exposureId: string,
  measurement: Omit<ExposureMeasurement, "id" | "createdAt" | "updatedAt">,
  userId: string
): Promise<void> {
  const exposure = await getExposure(exposureId);
  if (!exposure) throw new Error("Exposure record not found");
  
  const percentOfLimit = (measurement.value / exposure.regulatoryLimit) * 100;
  
  // Determine alert level
  let alertLevel: "low" | "moderate" | "elevated" | "critical";
  if (percentOfLimit >= 100) {
    alertLevel = "critical";
  } else if (percentOfLimit >= 80) {
    alertLevel = "elevated";
  } else if (percentOfLimit >= 50) {
    alertLevel = "moderate";
  } else {
    alertLevel = "low";
  }
  
  const docRef = doc(db, EXPOSURES_COLLECTION, exposureId);
  await updateDoc(docRef, {
    lastMeasurement: measurement.value,
    lastMeasurementDate: measurement.date,
    percentOfLimit,
    alertLevel,
    exceedanceCount: measurement.withinLimits ? exposure.exceedanceCount : (exposure.exceedanceCount || 0) + 1,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
  
  // Create alert if threshold exceeded
  if (!measurement.withinLimits) {
    await createHealthAlert(
      {
        organizationId: exposure.organizationId,
        type: "exposure_threshold",
        severity: alertLevel === "critical" ? "critical" : "warning",
        title: `Dépassement de limite d'exposition: ${exposure.agent}`,
        description: `Le niveau d'exposition à ${exposure.agent} (${measurement.value} ${measurement.unit}) dépasse la limite réglementaire (${exposure.regulatoryLimit} ${exposure.unit}).`,
        affectedDepartments: exposure.departmentId ? [exposure.departmentId] : undefined,
        affectedEmployeeCount: exposure.exposedEmployeeCount,
        siteId: exposure.siteId,
        status: "active",
        sourceType: "exposure",
        sourceId: exposureId,
      },
      userId
    );
  }
}

/**
 * @deprecated Use createMeasurement instead. This function is kept for backwards compatibility.
 * Add a new measurement to an exposure record (legacy - updates embedded array)
 */
export async function addExposureMeasurement(
  exposureId: string,
  measurement: ExposureMeasurement,
  userId: string
): Promise<void> {
  // Use the new createMeasurement function
  await createMeasurement(
    {
      exposureId,
      organizationId: "", // Will be fetched from exposure
      date: measurement.date,
      value: measurement.value,
      unit: measurement.unit,
      measuredBy: measurement.measuredBy,
      method: measurement.method,
      duration: measurement.duration,
      withinLimits: measurement.withinLimits,
      notes: measurement.notes,
      createdBy: userId,
    },
    userId
  );
}

/**
 * Subscribe to real-time exposure updates
 */
export function subscribeToExposures(
  organizationId: string,
  callback: (exposures: OrganizationExposure[]) => void
): Unsubscribe {
  const q = query(
    collection(db, EXPOSURES_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("lastMeasurementDate", "desc")
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const exposures = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as OrganizationExposure[];
      
      callback(exposures);
    },
    (error) => {
      console.error("Exposures subscription error:", error);
      callback([]);
    }
  );
}

/**
 * Get multiple exposure records by their IDs
 */
export async function getExposuresByIds(exposureIds: string[]): Promise<OrganizationExposure[]> {
  if (exposureIds.length === 0) return [];
  
  const exposures: OrganizationExposure[] = [];
  
  // Firestore 'in' query supports max 30 items, so we batch if needed
  const batchSize = 30;
  for (let i = 0; i < exposureIds.length; i += batchSize) {
    const batch = exposureIds.slice(i, i + batchSize);
    const q = query(
      collection(db, EXPOSURES_COLLECTION),
      where("__name__", "in", batch)
    );
    
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(doc => {
      exposures.push({ id: doc.id, ...doc.data() } as OrganizationExposure);
    });
  }
  
  return exposures;
}

/**
 * Link an employee to an exposure record
 * Adds the employee's ID to the exposure's exposedEmployeeIds array
 */
export async function linkEmployeeToExposure(
  exposureId: string,
  employeeId: string,
  userId: string
): Promise<void> {
  const exposure = await getExposure(exposureId);
  if (!exposure) throw new Error("Exposure record not found");
  
  // Check if employee is already linked
  if (exposure.exposedEmployeeIds.includes(employeeId)) {
    return; // Already linked, nothing to do
  }
  
  const updatedEmployeeIds = [...exposure.exposedEmployeeIds, employeeId];
  
  const docRef = doc(db, EXPOSURES_COLLECTION, exposureId);
  await updateDoc(docRef, {
    exposedEmployeeIds: updatedEmployeeIds,
    exposedEmployeeCount: updatedEmployeeIds.length,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Unlink an employee from an exposure record
 * Removes the employee's ID from the exposure's exposedEmployeeIds array
 */
export async function unlinkEmployeeFromExposure(
  exposureId: string,
  employeeId: string,
  userId: string
): Promise<void> {
  const exposure = await getExposure(exposureId);
  if (!exposure) throw new Error("Exposure record not found");
  
  const updatedEmployeeIds = exposure.exposedEmployeeIds.filter(id => id !== employeeId);
  
  const docRef = doc(db, EXPOSURES_COLLECTION, exposureId);
  await updateDoc(docRef, {
    exposedEmployeeIds: updatedEmployeeIds,
    exposedEmployeeCount: updatedEmployeeIds.length,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Sync employee-exposure links when updating a health record's exposureIds
 * Handles adding and removing the employee from the relevant OrganizationExposure documents
 */
export async function syncHealthRecordExposures(
  healthRecordId: string,
  employeeId: string,
  previousExposureIds: string[],
  newExposureIds: string[],
  userId: string
): Promise<void> {
  // Find exposures to add (in new but not in previous)
  const toAdd = newExposureIds.filter(id => !previousExposureIds.includes(id));
  // Find exposures to remove (in previous but not in new)
  const toRemove = previousExposureIds.filter(id => !newExposureIds.includes(id));
  
  // Link employee to new exposures
  for (const exposureId of toAdd) {
    await linkEmployeeToExposure(exposureId, employeeId, userId);
  }
  
  // Unlink employee from removed exposures
  for (const exposureId of toRemove) {
    await unlinkEmployeeFromExposure(exposureId, employeeId, userId);
  }
}

// =============================================================================
// Health Alert Operations
// =============================================================================

/**
 * Create a new health alert
 */
export async function createHealthAlert(
  data: Omit<HealthAlert, "id" | "createdAt" | "updatedAt">,
  userId: string
): Promise<HealthAlert> {
  const docRef = doc(collection(db, HEALTH_ALERTS_COLLECTION));
  const now = Timestamp.now();
  
  const alert: Omit<HealthAlert, "id"> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(docRef, alert);
  
  return { id: docRef.id, ...alert };
}

/**
 * Get a single health alert
 */
export async function getHealthAlert(alertId: string): Promise<HealthAlert | null> {
  const docRef = doc(db, HEALTH_ALERTS_COLLECTION, alertId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as HealthAlert;
}

/**
 * Get health alerts for an organization
 */
export async function getHealthAlerts(
  organizationId: string,
  filters: {
    status?: HealthAlertStatus[];
    severity?: HealthAlertSeverity[];
    type?: HealthAlertType[];
  } = {},
  limit = 50
): Promise<HealthAlert[]> {
  const q = query(
    collection(db, HEALTH_ALERTS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  let alerts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as HealthAlert[];
  
  // Client-side filtering
  if (filters.status && filters.status.length > 0) {
    alerts = alerts.filter(a => filters.status!.includes(a.status));
  }
  if (filters.severity && filters.severity.length > 0) {
    alerts = alerts.filter(a => filters.severity!.includes(a.severity));
  }
  if (filters.type && filters.type.length > 0) {
    alerts = alerts.filter(a => filters.type!.includes(a.type));
  }
  
  return alerts;
}

/**
 * Get active health alerts
 */
export async function getActiveHealthAlerts(organizationId: string): Promise<HealthAlert[]> {
  const q = query(
    collection(db, HEALTH_ALERTS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("status", "==", "active"),
    orderBy("severity", "desc"),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as HealthAlert[];
}

/**
 * Acknowledge a health alert
 */
export async function acknowledgeHealthAlert(
  alertId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, HEALTH_ALERTS_COLLECTION, alertId);
  
  await updateDoc(docRef, {
    status: "acknowledged",
    acknowledgedAt: Timestamp.now(),
    acknowledgedBy: userId,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Resolve a health alert
 */
export async function resolveHealthAlert(
  alertId: string,
  resolutionNotes: string,
  linkedCapaId: string | undefined,
  userId: string
): Promise<void> {
  const docRef = doc(db, HEALTH_ALERTS_COLLECTION, alertId);
  
  await updateDoc(docRef, {
    status: "resolved",
    resolvedAt: Timestamp.now(),
    resolvedBy: userId,
    resolutionNotes,
    linkedCapaId,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Subscribe to real-time health alert updates
 */
export function subscribeToHealthAlerts(
  organizationId: string,
  callback: (alerts: HealthAlert[]) => void
): Unsubscribe {
  const q = query(
    collection(db, HEALTH_ALERTS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as HealthAlert[];
      
      callback(alerts);
    },
    (error) => {
      console.error("Health alerts subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Aggregate Statistics (for Dashboard - non-PHI)
// =============================================================================

/**
 * Get aggregate health statistics for dashboard
 * This returns non-PHI aggregate data suitable for QHSE/HR view
 */
export async function getHealthStats(organizationId: string): Promise<HealthStats | null> {
  // Try to get cached stats first
  const q = query(
    collection(db, HEALTH_STATS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("calculatedAt", "desc"),
    firestoreLimit(1)
  );
  
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return { ...snapshot.docs[0].data() } as HealthStats;
  }
  
  // If no cached stats, calculate from data
  return calculateHealthStats(organizationId);
}

/**
 * Calculate health statistics from raw data
 */
export async function calculateHealthStats(organizationId: string): Promise<HealthStats> {
  const now = Timestamp.now();
  const thirtyDaysAgo = Timestamp.fromMillis(now.toMillis() - 30 * 24 * 60 * 60 * 1000);
  
  // Get health records
  const recordsQuery = query(
    collection(db, HEALTH_RECORDS_COLLECTION),
    where("organizationId", "==", organizationId)
  );
  const recordsSnapshot = await getDocs(recordsQuery);
  const records = recordsSnapshot.docs.map(doc => doc.data() as HealthRecord);
  
  // Get visits
  const visitsQuery = query(
    collection(db, MEDICAL_VISITS_COLLECTION),
    where("organizationId", "==", organizationId)
  );
  const visitsSnapshot = await getDocs(visitsQuery);
  const visits = visitsSnapshot.docs.map(doc => doc.data() as MedicalVisit);
  
  // Get alerts
  const alertsQuery = query(
    collection(db, HEALTH_ALERTS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("status", "==", "active")
  );
  const alertsSnapshot = await getDocs(alertsQuery);
  const activeAlerts = alertsSnapshot.docs.map(doc => doc.data() as HealthAlert);
  
  // Calculate fitness status breakdown
  const fitnessByStatus: Record<FitnessStatus, number> = {
    fit: 0,
    fit_with_restrictions: 0,
    temporarily_unfit: 0,
    permanently_unfit: 0,
    pending_examination: 0,
  };
  
  for (const record of records) {
    fitnessByStatus[record.fitnessStatus] = (fitnessByStatus[record.fitnessStatus] || 0) + 1;
  }
  
  // Calculate visit stats
  const scheduledVisits = visits.filter(v => v.status === "scheduled");
  const overdueVisits = scheduledVisits.filter(v => v.scheduledDate.toMillis() < now.toMillis());
  
  // Calculate active cases (employees with restrictions or unfit status)
  const activeCases = records.filter(
    r => r.fitnessStatus !== "fit" && r.fitnessStatus !== "pending_examination"
  ).length;
  
  const stats: HealthStats = {
    organizationId,
    calculatedAt: now,
    period: {
      start: thirtyDaysAgo,
      end: now,
    },
    activeCases,
    activeCasesChange: 0, // Would need historical data to calculate
    employeesUnderSurveillance: records.filter(r => r.exposures.length > 0).length,
    pendingVisits: scheduledVisits.length,
    overdueVisits: overdueVisits.length,
    absenteeismRate: 0, // Would need absence data
    absenteeismDays: 0,
    absenteeismChange: 0,
    fitnessByStatus,
    activeAlerts: activeAlerts.length,
    criticalAlerts: activeAlerts.filter(a => a.severity === "critical").length,
    byPathology: [], // Would need more detailed tracking
    byDepartment: [], // Would need department aggregation
  };
  
  // Cache the stats
  const statsDocRef = doc(collection(db, HEALTH_STATS_COLLECTION));
  await setDoc(statsDocRef, stats);
  
  return stats;
}

/**
 * Get visit statistics for dashboard
 */
export async function getVisitStats(organizationId: string): Promise<{
  total: number;
  scheduled: number;
  completed: number;
  overdue: number;
  thisMonth: number;
  byType: Record<ExaminationType, number>;
}> {
  const visits = await getMedicalVisits(organizationId, {}, 1000);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const stats = {
    total: visits.length,
    scheduled: 0,
    completed: 0,
    overdue: 0,
    thisMonth: 0,
    byType: {} as Record<ExaminationType, number>,
  };
  
  for (const visit of visits) {
    // Count by status
    if (visit.status === "scheduled") {
      stats.scheduled++;
      if (visit.scheduledDate.toMillis() < now.getTime()) {
        stats.overdue++;
      }
    } else if (visit.status === "completed") {
      stats.completed++;
    }
    
    // Count by type
    stats.byType[visit.type] = (stats.byType[visit.type] || 0) + 1;
    
    // Count this month
    if (visit.scheduledDate.toDate() >= thisMonthStart) {
      stats.thisMonth++;
    }
  }
  
  return stats;
}

/**
 * Get exposure statistics for dashboard
 */
export async function getExposureStats(organizationId: string): Promise<{
  total: number;
  critical: number;
  elevated: number;
  withinLimits: number;
  byHazardType: Record<HazardCategory, number>;
  totalExposedEmployees: number;
}> {
  const exposures = await getExposures(organizationId, {}, 1000);
  
  const stats = {
    total: exposures.length,
    critical: 0,
    elevated: 0,
    withinLimits: 0,
    byHazardType: {} as Record<HazardCategory, number>,
    totalExposedEmployees: 0,
  };
  
  const uniqueEmployees = new Set<string>();
  
  for (const exposure of exposures) {
    // Count by alert level
    if (exposure.alertLevel === "critical") {
      stats.critical++;
    } else if (exposure.alertLevel === "elevated") {
      stats.elevated++;
    } else {
      stats.withinLimits++;
    }
    
    // Count by hazard type
    stats.byHazardType[exposure.hazardType] = (stats.byHazardType[exposure.hazardType] || 0) + 1;
    
    // Count unique exposed employees
    for (const empId of exposure.exposedEmployeeIds) {
      uniqueEmployees.add(empId);
    }
  }
  
  stats.totalExposedEmployees = uniqueEmployees.size;
  
  return stats;
}

// =============================================================================
// Check for Overdue Visits (for scheduled jobs)
// =============================================================================

/**
 * Check and mark overdue visits, create alerts
 */
export async function checkOverdueVisits(organizationId: string, userId: string): Promise<number> {
  const overdueVisits = await getOverdueVisits(organizationId);
  const batch = writeBatch(db);
  let alertsCreated = 0;
  
  for (const visit of overdueVisits) {
    // Update visit status to overdue
    const visitRef = doc(db, MEDICAL_VISITS_COLLECTION, visit.id);
    batch.update(visitRef, {
      status: "overdue",
      updatedAt: Timestamp.now(),
    });
    
    // Create alert for overdue visit
    const alertRef = doc(collection(db, HEALTH_ALERTS_COLLECTION));
    const alert: Omit<HealthAlert, "id"> = {
      organizationId,
      type: "visit_overdue",
      severity: "warning",
      title: `Visite médicale en retard: ${visit.employeeName}`,
      description: `La visite médicale de type "${visit.type}" pour ${visit.employeeName} était prévue le ${visit.scheduledDate.toDate().toLocaleDateString("fr-FR")} et n'a pas été effectuée.`,
      affectedDepartments: visit.departmentId ? [visit.departmentId] : undefined,
      affectedEmployeeCount: 1,
      status: "active",
      sourceType: "visit",
      sourceId: visit.id,
      linkedVisitIds: [visit.id],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    batch.set(alertRef, alert);
    alertsCreated++;
  }
  
  await batch.commit();
  return alertsCreated;
}

