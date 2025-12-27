/**
 * Incident Firestore Service
 * 
 * Handles all incident-related database operations including:
 * - Incident CRUD operations
 * - Investigation management
 * - AI analysis integration
 * - Auto-CAPA generation
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
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  WitnessInfo,
  AffectedPerson,
  AIIncidentAnalysis,
} from "@/types/capa";
import type { AuditInfo, FileMetadata } from "@/types/common";
import { createCAPA } from "./capaService";

const INCIDENTS_COLLECTION = "incidents";

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
 * Generate a unique reference for a new incident
 */
export async function generateIncidentReference(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const prefix = `INC-${year}${month}`;
  
  // Get the latest incident with this prefix
  const q = query(
    collection(db, INCIDENTS_COLLECTION),
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
    // Fallback to timestamp-based reference
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${timestamp}`;
  }
}

// =============================================================================
// Incident CRUD Operations
// =============================================================================

/**
 * Create a new incident
 */
export async function createIncident(
  data: Omit<Incident, "id" | "createdAt" | "updatedAt" | "audit" | "reference">,
  userId: string
): Promise<Incident> {
  const docRef = doc(collection(db, INCIDENTS_COLLECTION));
  const now = Timestamp.now();
  const reference = await generateIncidentReference(data.organizationId);
  
  const incident: Omit<Incident, "id"> = {
    ...data,
    reference,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, incident);
  
  const createdIncident = { id: docRef.id, ...incident };
  
  // Auto-generate CAPA for severe/critical incidents
  if (data.severity === "severe" || data.severity === "critical") {
    await autoGenerateCAPAFromIncident(createdIncident, userId);
  }
  
  return createdIncident;
}

/**
 * Get a single incident by ID
 */
export async function getIncident(incidentId: string): Promise<Incident | null> {
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as Incident;
}

/**
 * Update an existing incident
 */
export async function updateIncident(
  incidentId: string,
  data: Partial<Omit<Incident, "id" | "createdAt" | "audit" | "reference" | "organizationId">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Delete an incident
 */
export async function deleteIncident(incidentId: string): Promise<void> {
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  await deleteDoc(docRef);
}

/**
 * Get incidents for an organization with optional filters
 */
export async function getIncidents(
  organizationId: string,
  filters: {
    status?: IncidentStatus[];
    severity?: IncidentSeverity[];
    type?: string[];
    siteId?: string;
    departmentId?: string;
    dateRange?: { start: Date; end: Date };
    searchQuery?: string;
  } = {},
  limit = 100
): Promise<Incident[]> {
  const q = query(
    collection(db, INCIDENTS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("reportedAt", "desc"),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  let incidents = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Incident[];
  
  // Client-side filtering
  if (filters.status && filters.status.length > 0) {
    incidents = incidents.filter(i => filters.status!.includes(i.status));
  }
  if (filters.severity && filters.severity.length > 0) {
    incidents = incidents.filter(i => filters.severity!.includes(i.severity));
  }
  if (filters.type && filters.type.length > 0) {
    incidents = incidents.filter(i => filters.type!.includes(i.type));
  }
  if (filters.siteId) {
    incidents = incidents.filter(i => i.siteId === filters.siteId);
  }
  if (filters.departmentId) {
    incidents = incidents.filter(i => i.departmentId === filters.departmentId);
  }
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    incidents = incidents.filter(
      i =>
        i.description.toLowerCase().includes(searchLower) ||
        i.reference.toLowerCase().includes(searchLower) ||
        i.location.toLowerCase().includes(searchLower)
    );
  }
  if (filters.dateRange) {
    const start = filters.dateRange.start.getTime();
    const end = filters.dateRange.end.getTime();
    incidents = incidents.filter(i => {
      const reportedTime = i.reportedAt.toMillis();
      return reportedTime >= start && reportedTime <= end;
    });
  }
  
  return incidents;
}

/**
 * Subscribe to real-time incident updates for an organization
 */
export function subscribeToIncidents(
  organizationId: string,
  callback: (incidents: Incident[]) => void
): Unsubscribe {
  const q = query(
    collection(db, INCIDENTS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("reportedAt", "desc")
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const incidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Incident[];
      
      callback(incidents);
    },
    (error) => {
      console.error("Incidents subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Investigation Operations
// =============================================================================

/**
 * Start investigation on an incident
 */
export async function startInvestigation(
  incidentId: string,
  investigatorId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  
  await updateDoc(docRef, {
    status: "investigating",
    investigatorId,
    investigationStartedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Complete investigation with findings
 */
export async function completeInvestigation(
  incidentId: string,
  rootCause: string,
  contributingFactors: string[],
  userId: string
): Promise<void> {
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  
  await updateDoc(docRef, {
    rootCause,
    contributingFactors,
    investigationCompletedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Close an incident
 */
export async function closeIncident(
  incidentId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  
  await updateDoc(docRef, {
    status: "closed",
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

// =============================================================================
// Witness & Affected Person Operations
// =============================================================================

/**
 * Add a witness to an incident
 */
export async function addWitness(
  incidentId: string,
  witness: Omit<WitnessInfo, "id">,
  userId: string
): Promise<WitnessInfo> {
  const incident = await getIncident(incidentId);
  if (!incident) throw new Error("Incident not found");
  
  const newWitness: WitnessInfo = {
    id: crypto.randomUUID(),
    ...witness,
  };
  
  const updatedWitnesses = [...incident.witnesses, newWitness];
  
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  await updateDoc(docRef, {
    witnesses: updatedWitnesses,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
  
  return newWitness;
}

/**
 * Add an affected person to an incident
 */
export async function addAffectedPerson(
  incidentId: string,
  person: Omit<AffectedPerson, "id">,
  userId: string
): Promise<AffectedPerson> {
  const incident = await getIncident(incidentId);
  if (!incident) throw new Error("Incident not found");
  
  const newPerson: AffectedPerson = {
    id: crypto.randomUUID(),
    ...person,
  };
  
  const updatedPersons = [...incident.affectedPersons, newPerson];
  
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  await updateDoc(docRef, {
    affectedPersons: updatedPersons,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
  
  return newPerson;
}

// =============================================================================
// Evidence Operations
// =============================================================================

/**
 * Add photos to an incident
 */
export async function addIncidentPhotos(
  incidentId: string,
  photos: FileMetadata[],
  userId: string
): Promise<void> {
  const incident = await getIncident(incidentId);
  if (!incident) throw new Error("Incident not found");
  
  const updatedPhotos = [...incident.photos, ...photos];
  
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  await updateDoc(docRef, {
    photos: updatedPhotos,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Add documents to an incident
 */
export async function addIncidentDocuments(
  incidentId: string,
  documents: FileMetadata[],
  userId: string
): Promise<void> {
  const incident = await getIncident(incidentId);
  if (!incident) throw new Error("Incident not found");
  
  const updatedDocuments = [...incident.documents, ...documents];
  
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  await updateDoc(docRef, {
    documents: updatedDocuments,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

// =============================================================================
// AI Analysis Operations
// =============================================================================

/**
 * Store AI analysis results for an incident
 */
export async function storeAIAnalysis(
  incidentId: string,
  analysis: AIIncidentAnalysis,
  userId: string
): Promise<void> {
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  
  await updateDoc(docRef, {
    aiAnalysis: analysis,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

// =============================================================================
// CAPA Integration
// =============================================================================

/**
 * Auto-generate a CAPA from a severe/critical incident
 */
export async function autoGenerateCAPAFromIncident(
  incident: Incident,
  userId: string
): Promise<string | null> {
  try {
    const capa = await createCAPA(
      {
        organizationId: incident.organizationId,
        title: `Action corrective: ${incident.description.substring(0, 50)}...`,
        description: `Action corrective automatiquement créée suite à l'incident ${incident.reference}.\n\nDescription de l'incident: ${incident.description}\n\nActions immédiates prises: ${incident.immediateActions}`,
        category: "correctif",
        priority: incident.severity === "critical" ? "critique" : "haute",
        status: "draft",
        assigneeId: incident.investigatorId || userId,
        assigneeName: "", // Will be updated when assignee is properly set
        dueDate: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        progress: 0,
        checklistItems: [],
        sourceType: "incident",
        sourceIncidentId: incident.id,
        linkedTrainingIds: [],
        linkedEquipmentIds: [],
        linkedDocumentIds: [],
        aiGenerated: true,
        aiConfidence: 85,
        aiSuggestions: [
          "Analyser les causes racines de l'incident",
          "Identifier les mesures préventives",
          "Former le personnel concerné",
          "Mettre à jour les procédures si nécessaire",
        ],
        comments: [],
      },
      userId
    );
    
    // Link the CAPA back to the incident
    const docRef = doc(db, INCIDENTS_COLLECTION, incident.id);
    await updateDoc(docRef, {
      linkedActionPlanId: capa.id,
      linkedCapaIds: [capa.id],
      status: "action_plan_created",
      updatedAt: Timestamp.now(),
    });
    
    return capa.id;
  } catch (error) {
    console.error("Failed to auto-generate CAPA from incident:", error);
    return null;
  }
}

/**
 * Link a CAPA to an incident
 */
export async function linkCAPAToIncident(
  incidentId: string,
  capaId: string,
  userId: string
): Promise<void> {
  const incident = await getIncident(incidentId);
  if (!incident) throw new Error("Incident not found");
  
  const linkedCapaIds = incident.linkedCapaIds.includes(capaId)
    ? incident.linkedCapaIds
    : [...incident.linkedCapaIds, capaId];
  
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  await updateDoc(docRef, {
    linkedCapaIds,
    linkedActionPlanId: capaId,
    status: "action_plan_created",
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

// =============================================================================
// Regulatory Reporting
// =============================================================================

/**
 * Mark incident as reported to authorities
 */
export async function markReportedToAuthorities(
  incidentId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
  
  await updateDoc(docRef, {
    reportedToAuthorities: true,
    reportedToAuthoritiesAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Get incident statistics for an organization
 */
export async function getIncidentStats(organizationId: string): Promise<{
  total: number;
  byStatus: Record<IncidentStatus, number>;
  bySeverity: Record<IncidentSeverity, number>;
  byType: Record<string, number>;
  thisMonth: number;
  lastMonth: number;
  pendingInvestigation: number;
}> {
  const incidents = await getIncidents(organizationId);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const stats = {
    total: incidents.length,
    byStatus: {} as Record<IncidentStatus, number>,
    bySeverity: {} as Record<IncidentSeverity, number>,
    byType: {} as Record<string, number>,
    thisMonth: 0,
    lastMonth: 0,
    pendingInvestigation: 0,
  };
  
  for (const incident of incidents) {
    // Count by status
    stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;
    
    // Count by severity
    stats.bySeverity[incident.severity] = (stats.bySeverity[incident.severity] || 0) + 1;
    
    // Count by type
    stats.byType[incident.type] = (stats.byType[incident.type] || 0) + 1;
    
    // Count this month
    const reportedDate = incident.reportedAt.toDate();
    if (reportedDate >= thisMonthStart) {
      stats.thisMonth++;
    }
    
    // Count last month
    if (reportedDate >= lastMonthStart && reportedDate <= lastMonthEnd) {
      stats.lastMonth++;
    }
    
    // Count pending investigation
    if (incident.status === "reported" || incident.status === "acknowledged") {
      stats.pendingInvestigation++;
    }
  }
  
  return stats;
}

