/**
 * Compliance Firestore Service
 * 
 * Handles all compliance-related database operations including:
 * - Norm/Standard CRUD operations
 * - Requirement management
 * - Audit CRUD operations
 * - Findings management
 * - Compliance metrics calculation
 * - Auto-CAPA creation from findings
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
  Norm,
  NormWithRequirements,
  NormRequirement,
  NormStatus,
  NormFilters,
  Audit,
  AuditStatus,
  AuditFilters,
  AuditSummary,
  Finding,
  FindingCategory,
  FindingSeverity,
  FindingStatus,
  FindingFilters,
  Evidence,
  ComplianceMetrics,
  RegulatoryFramework,
  ComplianceStatus,
  AuditorInfo,
  AIAnalysis,
  AIAnalysisFilters,
  AIRecommendationRecord,
  AIGapRecord,
  AIAuditRecommendationRecord,
  AIAnalysisType,
} from "@/types/conformity";
import type { AuditInfo, FileMetadata } from "@/types/common";
import { createCAPA } from "./capaService";
import type { ActionPlan, ActionPriority } from "@/types/capa";

// Collection names
const NORMS_COLLECTION = "norms";
const AUDITS_COLLECTION = "audits";
const FINDINGS_COLLECTION = "findings";
const AI_ANALYSES_COLLECTION = "aiAnalyses";

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
function updateAuditInfoFields(userId: string): Record<string, unknown> {
  return {
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  };
}

/**
 * Map finding severity to CAPA priority
 */
function mapSeverityToPriority(severity: FindingSeverity): ActionPriority {
  const mapping: Record<FindingSeverity, ActionPriority> = {
    critical: "critique",
    major: "haute",
    minor: "moyenne",
    observation: "basse",
  };
  return mapping[severity];
}

/**
 * Generate a unique reference for a new finding
 */
export async function generateFindingReference(
  organizationId: string,
  auditId: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FIND-${year}`;
  
  const q = query(
    collection(db, FINDINGS_COLLECTION),
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
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${timestamp}`;
  }
}

/**
 * Generate a unique reference for a new audit
 */
export async function generateAuditReference(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `AUD-${year}`;
  
  const q = query(
    collection(db, AUDITS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
    firestoreLimit(1)
  );
  
  try {
    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    return `${prefix}-${count.toString().padStart(3, "0")}`;
  } catch {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${timestamp}`;
  }
}

// =============================================================================
// Norm CRUD Operations
// =============================================================================

/**
 * Create a new norm
 */
export async function createNorm(
  data: Omit<NormWithRequirements, "id" | "createdAt" | "updatedAt" | "audit">,
  userId: string
): Promise<NormWithRequirements> {
  const docRef = doc(collection(db, NORMS_COLLECTION));
  const now = Timestamp.now();
  
  const norm: Omit<NormWithRequirements, "id"> = {
    ...data,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, norm);
  
  return { id: docRef.id, ...norm };
}

/**
 * Get a single norm by ID
 */
export async function getNorm(normId: string): Promise<NormWithRequirements | null> {
  const docRef = doc(db, NORMS_COLLECTION, normId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as NormWithRequirements;
}

/**
 * Get norms for an organization with optional filters
 */
export async function getNorms(
  organizationId: string,
  filters: NormFilters = {},
  limit = 100
): Promise<NormWithRequirements[]> {
  try {
    const q = query(
      collection(db, NORMS_COLLECTION),
      where("organizationId", "==", organizationId),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(q);
    let norms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as NormWithRequirements[];
    
    // Client-side filtering
    if (filters.framework && filters.framework.length > 0) {
      norms = norms.filter(n => filters.framework!.includes(n.framework));
    }
    if (filters.status && filters.status.length > 0) {
      norms = norms.filter(n => filters.status!.includes(n.status));
    }
    if (filters.isActive !== undefined) {
      norms = norms.filter(n => n.isActive === filters.isActive);
    }
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      norms = norms.filter(
        n =>
          n.code.toLowerCase().includes(searchLower) ||
          n.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by code
    norms.sort((a, b) => a.code.localeCompare(b.code));
    
    return norms;
  } catch (error) {
    console.warn("Failed to fetch norms, returning empty array:", error);
    return [];
  }
}

/**
 * Update an existing norm
 */
export async function updateNorm(
  normId: string,
  data: Partial<Omit<NormWithRequirements, "id" | "createdAt" | "audit" | "organizationId">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, NORMS_COLLECTION, normId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    ...updateAuditInfoFields(userId),
  });
}

/**
 * Delete a norm
 */
export async function deleteNorm(normId: string): Promise<void> {
  const docRef = doc(db, NORMS_COLLECTION, normId);
  await deleteDoc(docRef);
}

/**
 * Subscribe to real-time norm updates
 */
export function subscribeToNorms(
  organizationId: string,
  callback: (norms: NormWithRequirements[]) => void
): Unsubscribe {
  const q = query(
    collection(db, NORMS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("isActive", "==", true)
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const norms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as NormWithRequirements[];
      
      norms.sort((a, b) => a.code.localeCompare(b.code));
      callback(norms);
    },
    (error) => {
      console.error("Norms subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Requirement Operations
// =============================================================================

/**
 * Update a requirement within a norm
 */
export async function updateNormRequirement(
  normId: string,
  requirementId: string,
  data: Partial<NormRequirement>,
  userId: string
): Promise<void> {
  const norm = await getNorm(normId);
  if (!norm) throw new Error("Norm not found");
  
  const updatedRequirements = norm.requirements.map(req => {
    if (req.id === requirementId) {
      return { ...req, ...data };
    }
    return req;
  });
  
  // Recalculate compliance score
  const compliantCount = updatedRequirements.filter(
    r => r.status === "compliant"
  ).length;
  const totalCount = updatedRequirements.length;
  const complianceScore = totalCount > 0 
    ? Math.round((compliantCount / totalCount) * 100) 
    : 0;
  
  // Update norm status based on compliance score
  let normStatus: NormStatus = "in_progress";
  if (complianceScore === 100) {
    normStatus = "compliant";
  } else if (complianceScore === 0 && updatedRequirements.some(r => r.status === "non_compliant")) {
    normStatus = "non_compliant";
  }
  
  await updateNorm(normId, {
    requirements: updatedRequirements,
    complianceScore,
    status: normStatus,
  }, userId);
}

/**
 * Add a new requirement to a norm
 */
export async function addRequirementToNorm(
  normId: string,
  requirement: Omit<NormRequirement, "id" | "evidence" | "linkedCapaIds">,
  userId: string
): Promise<NormRequirement> {
  const norm = await getNorm(normId);
  if (!norm) throw new Error("Norm not found");

  const newRequirement: NormRequirement = {
    ...requirement,
    id: crypto.randomUUID(),
    evidence: [],
    linkedCapaIds: [],
  };

  const updatedRequirements = [...norm.requirements, newRequirement];
  const updatedRequirementIds = [...norm.requirementIds, newRequirement.id];

  await updateNorm(normId, {
    requirements: updatedRequirements,
    requirementIds: updatedRequirementIds,
  }, userId);

  return newRequirement;
}

/**
 * Delete a requirement from a norm
 */
export async function deleteRequirementFromNorm(
  normId: string,
  requirementId: string,
  userId: string
): Promise<void> {
  const norm = await getNorm(normId);
  if (!norm) throw new Error("Norm not found");

  const updatedRequirements = norm.requirements.filter(req => req.id !== requirementId);
  const updatedRequirementIds = norm.requirementIds.filter(id => id !== requirementId);

  // Recalculate compliance score
  const compliantCount = updatedRequirements.filter(r => r.status === "compliant").length;
  const totalCount = updatedRequirements.length;
  const complianceScore = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0;

  await updateNorm(normId, {
    requirements: updatedRequirements,
    requirementIds: updatedRequirementIds,
    complianceScore,
  }, userId);
}

/**
 * Add evidence to a requirement
 */
export async function addEvidenceToRequirement(
  normId: string,
  requirementId: string,
  evidence: Evidence,
  userId: string
): Promise<void> {
  const norm = await getNorm(normId);
  if (!norm) throw new Error("Norm not found");
  
  const updatedRequirements = norm.requirements.map(req => {
    if (req.id === requirementId) {
      return {
        ...req,
        evidence: [...req.evidence, evidence],
      };
    }
    return req;
  });
  
  await updateNorm(normId, { requirements: updatedRequirements }, userId);
}

/**
 * Remove evidence from a requirement
 */
export async function removeEvidenceFromRequirement(
  normId: string,
  requirementId: string,
  evidenceId: string,
  userId: string
): Promise<void> {
  const norm = await getNorm(normId);
  if (!norm) throw new Error("Norm not found");
  
  const updatedRequirements = norm.requirements.map(req => {
    if (req.id === requirementId) {
      return {
        ...req,
        evidence: req.evidence.filter(e => e.id !== evidenceId),
      };
    }
    return req;
  });
  
  await updateNorm(normId, { requirements: updatedRequirements }, userId);
}

/**
 * Link a CAPA to a requirement
 */
export async function linkCapaToRequirement(
  normId: string,
  requirementId: string,
  capaId: string,
  userId: string
): Promise<void> {
  const norm = await getNorm(normId);
  if (!norm) throw new Error("Norm not found");
  
  const updatedRequirements = norm.requirements.map(req => {
    if (req.id === requirementId && !req.linkedCapaIds.includes(capaId)) {
      return {
        ...req,
        linkedCapaIds: [...req.linkedCapaIds, capaId],
      };
    }
    return req;
  });
  
  await updateNorm(normId, { requirements: updatedRequirements }, userId);
}

// =============================================================================
// Audit CRUD Operations
// =============================================================================

/**
 * Create a new audit
 */
export async function createAudit(
  data: Omit<Audit, "id" | "createdAt" | "updatedAt" | "audit" | "findings">,
  userId: string
): Promise<Audit> {
  const docRef = doc(collection(db, AUDITS_COLLECTION));
  const now = Timestamp.now();
  
  const audit: Omit<Audit, "id"> = {
    ...data,
    findings: [],
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, audit);
  
  return { id: docRef.id, ...audit };
}

/**
 * Get a single audit by ID
 */
export async function getAudit(auditId: string): Promise<Audit | null> {
  const docRef = doc(db, AUDITS_COLLECTION, auditId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as Audit;
}

/**
 * Get audits for an organization with optional filters
 */
export async function getAudits(
  organizationId: string,
  filters: AuditFilters = {},
  limit = 100
): Promise<Audit[]> {
  try {
    const q = query(
      collection(db, AUDITS_COLLECTION),
      where("organizationId", "==", organizationId),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(q);
    let audits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Audit[];
  
    // Client-side filtering
    if (filters.status && filters.status.length > 0) {
      audits = audits.filter(a => filters.status!.includes(a.status));
    }
    if (filters.type && filters.type.length > 0) {
      audits = audits.filter(a => filters.type!.includes(a.type));
    }
    if (filters.framework && filters.framework.length > 0) {
      audits = audits.filter(a => filters.framework!.includes(a.framework));
    }
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      audits = audits.filter(
        a =>
          a.title.toLowerCase().includes(searchLower) ||
          a.scope.toLowerCase().includes(searchLower)
      );
    }
    if (filters.dateRange) {
      const start = filters.dateRange.start.getTime();
      const end = filters.dateRange.end.getTime();
      audits = audits.filter(a => {
        if (!a.plannedStartDate?.toMillis) return false;
        const plannedTime = a.plannedStartDate.toMillis();
        return plannedTime >= start && plannedTime <= end;
      });
    }
    
    // Sort by planned start date descending (handle missing dates)
    audits.sort((a, b) => {
      const aTime = a.plannedStartDate?.toMillis?.() ?? 0;
      const bTime = b.plannedStartDate?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
    
    return audits;
  } catch (error) {
    console.warn("Failed to fetch audits, returning empty array:", error);
    return [];
  }
}

/**
 * Update an existing audit
 */
export async function updateAudit(
  auditId: string,
  data: Partial<Omit<Audit, "id" | "createdAt" | "audit" | "organizationId">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, AUDITS_COLLECTION, auditId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    ...updateAuditInfoFields(userId),
  });
}

/**
 * Delete an audit
 */
export async function deleteAudit(auditId: string): Promise<void> {
  const docRef = doc(db, AUDITS_COLLECTION, auditId);
  await deleteDoc(docRef);
}

/**
 * Start an audit (change status to in_progress)
 */
export async function startAudit(auditId: string, userId: string): Promise<void> {
  await updateAudit(auditId, {
    status: "in_progress",
    actualStartDate: Timestamp.now(),
  }, userId);
}

/**
 * Complete an audit
 */
export async function completeAudit(
  auditId: string,
  summary: AuditSummary,
  userId: string
): Promise<void> {
  await updateAudit(auditId, {
    status: "completed",
    actualEndDate: Timestamp.now(),
    summary,
  }, userId);
}

/**
 * Cancel an audit
 */
export async function cancelAudit(auditId: string, userId: string): Promise<void> {
  await updateAudit(auditId, { status: "cancelled" }, userId);
}

/**
 * Subscribe to real-time audit updates
 */
export function subscribeToAudits(
  organizationId: string,
  callback: (audits: Audit[]) => void
): Unsubscribe {
  const q = query(
    collection(db, AUDITS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("plannedStartDate", "desc")
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const audits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Audit[];
      
      callback(audits);
    },
    (error) => {
      console.error("Audits subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Finding Operations
// =============================================================================

/**
 * Add a finding to an audit
 */
export async function addFinding(
  auditId: string,
  findingData: Omit<Finding, "id" | "auditId" | "createdAt" | "updatedAt" | "audit" | "reference">,
  userId: string
): Promise<Finding> {
  const audit = await getAudit(auditId);
  if (!audit) throw new Error("Audit not found");
  
  const reference = await generateFindingReference(audit.organizationId, auditId);
  const now = Timestamp.now();
  
  const finding: Finding = {
    ...findingData,
    id: crypto.randomUUID(),
    auditId,
    reference,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  const updatedFindings = [...audit.findings, finding];
  
  await updateAudit(auditId, { findings: updatedFindings }, userId);
  
  return finding;
}

/**
 * Update a finding
 */
export async function updateFinding(
  auditId: string,
  findingId: string,
  data: Partial<Omit<Finding, "id" | "auditId" | "createdAt" | "audit" | "reference" | "organizationId">>,
  userId: string
): Promise<void> {
  const audit = await getAudit(auditId);
  if (!audit) throw new Error("Audit not found");
  
  const updatedFindings = audit.findings.map(f => {
    if (f.id === findingId) {
      return {
        ...f,
        ...data,
        updatedAt: Timestamp.now(),
        audit: {
          ...f.audit,
          updatedBy: userId,
          updatedAt: Timestamp.now(),
        },
      };
    }
    return f;
  });
  
  await updateAudit(auditId, { findings: updatedFindings }, userId);
}

/**
 * Delete a finding
 */
export async function deleteFinding(
  auditId: string,
  findingId: string,
  userId: string
): Promise<void> {
  const audit = await getAudit(auditId);
  if (!audit) throw new Error("Audit not found");
  
  const updatedFindings = audit.findings.filter(f => f.id !== findingId);
  
  await updateAudit(auditId, { findings: updatedFindings }, userId);
}

/**
 * Submit a response to a finding
 */
export async function submitFindingResponse(
  auditId: string,
  findingId: string,
  response: {
    rootCause: string;
    correction?: string;
    correctiveAction: string;
  },
  userId: string
): Promise<void> {
  await updateFinding(auditId, findingId, {
    ...response,
    status: "response_submitted",
    responseDate: Timestamp.now(),
  }, userId);
}

/**
 * Verify and close a finding
 */
export async function verifyFinding(
  auditId: string,
  findingId: string,
  verificationNotes: string,
  effective: boolean,
  userId: string
): Promise<void> {
  await updateFinding(auditId, findingId, {
    status: effective ? "closed_effective" : "closed_ineffective",
    verifiedBy: userId,
    verifiedAt: Timestamp.now(),
    verificationNotes,
    closureDate: Timestamp.now(),
  }, userId);
}

// =============================================================================
// Auto-CAPA Creation
// =============================================================================

/**
 * Create a CAPA from an audit finding
 */
export async function createCAPAFromFinding(
  finding: Finding,
  auditId: string,
  organizationId: string,
  userId: string
): Promise<ActionPlan> {
  // Map finding to CAPA fields
  const capaData = {
    organizationId,
    title: `[Audit] ${finding.title}`,
    description: `${finding.description}\n\nÉvidence objective: ${finding.objectiveEvidence}`,
    category: finding.category.includes("nonconformity") ? "correctif" as const : "preventif" as const,
    priority: mapSeverityToPriority(finding.severity),
    status: "draft" as const,
    sourceType: "audit" as const,
    sourceIncidentId: undefined,
    riskDescription: finding.objectiveEvidence,
    assigneeId: "",
    assigneeName: "",
    departmentId: undefined,
    siteId: undefined,
    dueDate: finding.closureDueDate || Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    ),
    checklistItems: [],
    progress: 0,
    attachments: [],
    comments: [],
    linkedTrainingIds: [],
    linkedEquipmentIds: [],
    aiGenerated: false,
    aiRecommendations: [],
  };
  
  const capa = await createCAPA(capaData, userId);
  
  // Update finding with linked CAPA ID
  await updateFinding(auditId, finding.id, { linkedCapaId: capa.id }, userId);
  
  return capa;
}

// =============================================================================
// Compliance Metrics
// =============================================================================

/**
 * Calculate compliance metrics for an organization
 */
export async function getComplianceMetrics(
  organizationId: string
): Promise<ComplianceMetrics> {
  let norms: NormWithRequirements[] = [];
  let audits: Audit[] = [];
  
  try {
    [norms, audits] = await Promise.all([
      getNorms(organizationId, { isActive: true }),
      getAudits(organizationId),
    ]);
  } catch (error) {
    console.warn("Failed to fetch compliance data, returning empty metrics:", error);
    // Return empty metrics if data can't be fetched
    return {
      organizationId,
      calculatedAt: Timestamp.now(),
      overallComplianceRate: 0,
      frameworkCompliance: {} as Record<RegulatoryFramework, number>,
      totalRequirements: 0,
      compliantCount: 0,
      nonCompliantCount: 0,
      partiallyCompliantCount: 0,
      pendingCount: 0,
      openFindings: 0,
      overdueFindings: 0,
      upcomingAudits: 0,
      completedAuditsYTD: 0,
    };
  }
  
  // Calculate requirement stats
  let totalRequirements = 0;
  let compliantCount = 0;
  let nonCompliantCount = 0;
  let partiallyCompliantCount = 0;
  let pendingCount = 0;
  
  const frameworkCompliance: Record<string, number> = {};
  const frameworkRequirementCounts: Record<string, { compliant: number; total: number }> = {};
  
  for (const norm of norms) {
    const framework = norm.framework;
    if (!frameworkRequirementCounts[framework]) {
      frameworkRequirementCounts[framework] = { compliant: 0, total: 0 };
    }
    
    for (const req of norm.requirements) {
      totalRequirements++;
      frameworkRequirementCounts[framework].total++;
      
      switch (req.status) {
        case "compliant":
          compliantCount++;
          frameworkRequirementCounts[framework].compliant++;
          break;
        case "non_compliant":
          nonCompliantCount++;
          break;
        case "partially_compliant":
          partiallyCompliantCount++;
          frameworkRequirementCounts[framework].compliant += 0.5;
          break;
        case "pending_review":
          pendingCount++;
          break;
      }
    }
  }
  
  // Calculate framework compliance percentages
  for (const [framework, counts] of Object.entries(frameworkRequirementCounts)) {
    frameworkCompliance[framework] = counts.total > 0
      ? Math.round((counts.compliant / counts.total) * 100)
      : 0;
  }
  
  // Calculate overall compliance rate
  const overallComplianceRate = totalRequirements > 0
    ? Math.round((compliantCount / totalRequirements) * 100)
    : 0;
  
  // Count findings
  let openFindings = 0;
  let overdueFindings = 0;
  const now = Timestamp.now().toMillis();
  
  for (const audit of audits) {
    for (const finding of audit.findings) {
      if (!["closed", "closed_effective", "closed_ineffective"].includes(finding.status)) {
        openFindings++;
        
        if (finding.closureDueDate && finding.closureDueDate.toMillis() < now) {
          overdueFindings++;
        }
      }
    }
  }
  
  // Count audits
  const upcomingAudits = audits.filter(
    a => a.status === "planned" && a.plannedStartDate?.toMillis?.() && a.plannedStartDate.toMillis() > now
  ).length;
  
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
  const completedAuditsYTD = audits.filter(
    a => a.status === "completed" && 
         a.actualEndDate && 
         a.actualEndDate.toMillis() >= startOfYear
  ).length;
  
  return {
    organizationId,
    calculatedAt: Timestamp.now(),
    overallComplianceRate,
    frameworkCompliance: frameworkCompliance as Record<RegulatoryFramework, number>,
    totalRequirements,
    compliantCount,
    nonCompliantCount,
    partiallyCompliantCount,
    pendingCount,
    openFindings,
    overdueFindings,
    upcomingAudits,
    completedAuditsYTD,
  };
}

/**
 * Get audit statistics
 */
export async function getAuditStats(organizationId: string): Promise<{
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
  byFramework: Record<string, number>;
}> {
  const audits = await getAudits(organizationId);
  
  const stats = {
    total: audits.length,
    planned: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    byType: {} as Record<string, number>,
    byFramework: {} as Record<string, number>,
  };
  
  for (const audit of audits) {
    // Count by status
    switch (audit.status) {
      case "planned":
        stats.planned++;
        break;
      case "in_progress":
      case "pending_report":
        stats.inProgress++;
        break;
      case "completed":
        stats.completed++;
        break;
      case "cancelled":
        stats.cancelled++;
        break;
    }
    
    // Count by type
    stats.byType[audit.type] = (stats.byType[audit.type] || 0) + 1;
    
    // Count by framework
    stats.byFramework[audit.framework] = (stats.byFramework[audit.framework] || 0) + 1;
  }
  
  return stats;
}

/**
 * Calculate audit summary from findings
 */
export function calculateAuditSummary(findings: Finding[]): Omit<AuditSummary, "overallConclusion" | "recommendations" | "strengths" | "areasForImprovement"> {
  const summary = {
    totalFindings: findings.length,
    majorNonconformities: 0,
    minorNonconformities: 0,
    observations: 0,
    opportunities: 0,
    positiveFindings: 0,
  };
  
  for (const finding of findings) {
    switch (finding.category) {
      case "major_nonconformity":
        summary.majorNonconformities++;
        break;
      case "minor_nonconformity":
        summary.minorNonconformities++;
        break;
      case "observation":
        summary.observations++;
        break;
      case "opportunity_for_improvement":
        summary.opportunities++;
        break;
      case "positive_finding":
        summary.positiveFindings++;
        break;
    }
  }
  
  return summary;
}

// =============================================================================
// Batch Operations
// =============================================================================

/**
 * Bulk update requirement statuses
 */
export async function bulkUpdateRequirementStatus(
  normId: string,
  requirementIds: string[],
  status: ComplianceStatus,
  userId: string
): Promise<void> {
  const norm = await getNorm(normId);
  if (!norm) throw new Error("Norm not found");
  
  const updatedRequirements = norm.requirements.map(req => {
    if (requirementIds.includes(req.id)) {
      return { ...req, status };
    }
    return req;
  });
  
  // Recalculate compliance score
  const compliantCount = updatedRequirements.filter(r => r.status === "compliant").length;
  const complianceScore = updatedRequirements.length > 0
    ? Math.round((compliantCount / updatedRequirements.length) * 100)
    : 0;
  
  await updateNorm(normId, {
    requirements: updatedRequirements,
    complianceScore,
  }, userId);
}

/**
 * Link norm to an audit
 */
export async function linkNormToAudit(
  normId: string,
  auditId: string,
  userId: string
): Promise<void> {
  const audit = await getAudit(auditId);
  if (!audit) throw new Error("Audit not found");
  
  await updateNorm(normId, {
    lastAuditId: auditId,
    lastAuditDate: audit.actualEndDate || audit.plannedEndDate,
  }, userId);
}

// =============================================================================
// AI Analysis History Operations
// =============================================================================

/**
 * Generate a short title for an AI analysis based on its type and results
 */
function generateAnalysisTitle(
  type: AIAnalysisType,
  overallScore: number,
  gapsCount: number
): string {
  const date = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  const typeLabels: Record<AIAnalysisType, string> = {
    gap_analysis: "Analyse d'écarts",
    audit_planning: "Planification d'audits",
    capa_suggestions: "Suggestions CAPA",
    compliance_report: "Rapport de conformité",
  };
  return `${typeLabels[type]} - ${date} (${overallScore}%, ${gapsCount} écarts)`;
}

/**
 * Save an AI analysis to Firestore
 */
export async function saveAIAnalysis(
  data: Omit<AIAnalysis, "id" | "createdAt" | "updatedAt" | "audit" | "title">,
  userId: string,
  userName: string
): Promise<AIAnalysis> {
  const docRef = doc(collection(db, AI_ANALYSES_COLLECTION));
  const now = Timestamp.now();
  
  const title = generateAnalysisTitle(data.type, data.overallScore, data.gaps.length);
  
  const analysis: AIAnalysis = {
    ...data,
    id: docRef.id,
    title,
    analyzedBy: userId,
    analyzedByName: userName,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, analysis);
  return analysis;
}

/**
 * Get a single AI analysis by ID
 */
export async function getAIAnalysis(analysisId: string): Promise<AIAnalysis | null> {
  const docRef = doc(db, AI_ANALYSES_COLLECTION, analysisId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return { id: docSnap.id, ...docSnap.data() } as AIAnalysis;
}

/**
 * Get all AI analyses for an organization
 */
export async function getAIAnalyses(
  organizationId: string,
  filters: AIAnalysisFilters = {},
  limit = 50
): Promise<AIAnalysis[]> {
  try {
    // Try query with index (requires composite index: organizationId + createdAt)
    const q = query(
      collection(db, AI_ANALYSES_COLLECTION),
      where("organizationId", "==", organizationId),
      orderBy("createdAt", "desc"),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(q);
    let analyses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AIAnalysis[];
    
    return applyAIAnalysisFilters(analyses, filters);
  } catch (error: unknown) {
    // If index is missing, fall back to simple query with client-side sorting
    console.warn("AI Analyses index not available, using fallback query:", error);
    
    const q = query(
      collection(db, AI_ANALYSES_COLLECTION),
      where("organizationId", "==", organizationId),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(q);
    let analyses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AIAnalysis[];
    
    // Sort client-side (handle missing createdAt)
    analyses.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
    
    return applyAIAnalysisFilters(analyses, filters);
  }
}

/**
 * Apply client-side filters to AI analyses
 */
function applyAIAnalysisFilters(
  analyses: AIAnalysis[],
  filters: AIAnalysisFilters
): AIAnalysis[] {
  let filtered = analyses;
  
  // Client-side filtering
  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter(a => filters.type!.includes(a.type));
  }
  
  if (filters.dateRange) {
    const start = filters.dateRange.start.getTime();
    const end = filters.dateRange.end.getTime();
    filtered = filtered.filter(a => {
      if (!a.createdAt?.toMillis) return false;
      const createdTime = a.createdAt.toMillis();
      return createdTime >= start && createdTime <= end;
    });
  }
  
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(searchLower) ||
      a.description?.toLowerCase().includes(searchLower) ||
      a.recommendations.some(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower)
      )
    );
  }
  
  if (filters.minScore !== undefined) {
    filtered = filtered.filter(a => a.overallScore >= filters.minScore!);
  }
  
  if (filters.maxScore !== undefined) {
    filtered = filtered.filter(a => a.overallScore <= filters.maxScore!);
  }
  
  return filtered;
}

/**
 * Subscribe to real-time AI analysis updates
 */
export function subscribeToAIAnalyses(
  organizationId: string,
  callback: (analyses: AIAnalysis[]) => void,
  limit = 20
): Unsubscribe {
  // Use simple query without orderBy to avoid index requirement
  // Sort client-side instead
  const q = query(
    collection(db, AI_ANALYSES_COLLECTION),
    where("organizationId", "==", organizationId),
    firestoreLimit(limit)
  );
  
  return onSnapshot(q, (snapshot) => {
    let analyses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AIAnalysis[];
    
    // Sort client-side by createdAt descending (handle missing createdAt)
    analyses.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
    
    callback(analyses);
  });
}

/**
 * Delete an AI analysis
 */
export async function deleteAIAnalysis(analysisId: string): Promise<void> {
  const docRef = doc(db, AI_ANALYSES_COLLECTION, analysisId);
  await deleteDoc(docRef);
}

/**
 * Get the most recent AI analysis for an organization
 */
export async function getLatestAIAnalysis(
  organizationId: string,
  type?: AIAnalysisType
): Promise<AIAnalysis | null> {
  let q = query(
    collection(db, AI_ANALYSES_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
    firestoreLimit(1)
  );
  
  if (type) {
    q = query(
      collection(db, AI_ANALYSES_COLLECTION),
      where("organizationId", "==", organizationId),
      where("type", "==", type),
      orderBy("createdAt", "desc"),
      firestoreLimit(1)
    );
  }
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AIAnalysis;
}

