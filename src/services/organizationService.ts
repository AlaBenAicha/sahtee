/**
 * Organization Firestore Service
 * 
 * Handles all organization-related database operations.
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
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  Organization,
  Department,
  Site,
  OnboardingData,
  OrganizationStatus,
  SubscriptionPlan,
  OrganizationFeatures,
  OrganizationLimits,
} from "@/types/organization";

const ORGANIZATIONS_COLLECTION = "organizations";
const DEPARTMENTS_COLLECTION = "departments";
const SITES_COLLECTION = "sites";

// =============================================================================
// Organization CRUD Operations
// =============================================================================

/**
 * Get an organization by ID
 */
export async function getOrganizationById(orgId: string): Promise<Organization | null> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as Organization;
}

/**
 * Create a new organization
 */
export async function createOrganization(
  data: Omit<Organization, "id" | "createdAt" | "updatedAt" | "audit">,
  createdBy: string
): Promise<Organization> {
  const now = Timestamp.now();
  
  const organization: Omit<Organization, "id"> = {
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
  
  const docRef = doc(collection(db, ORGANIZATIONS_COLLECTION));
  await setDoc(docRef, organization);
  
  return { id: docRef.id, ...organization };
}

/**
 * Update an organization
 */
export async function updateOrganization(
  orgId: string,
  data: Partial<Organization>,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  
  await updateDoc(docRef, {
    ...data,
    "audit.updatedBy": updatedBy,
    "audit.updatedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update organization status
 */
export async function updateOrganizationStatus(
  orgId: string,
  status: OrganizationStatus,
  updatedBy: string
): Promise<void> {
  await updateOrganization(orgId, { status }, updatedBy);
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  orgId: string,
  plan: SubscriptionPlan,
  updatedBy: string
): Promise<void> {
  const features = getDefaultFeatures(plan);
  const limits = getDefaultLimits(plan);
  
  await updateOrganization(
    orgId,
    {
      plan,
      features,
      limits,
      subscriptionStartedAt: Timestamp.now(),
    },
    updatedBy
  );
}

// =============================================================================
// Onboarding Operations
// =============================================================================

/**
 * Update onboarding data
 */
export async function updateOnboardingData(
  orgId: string,
  onboarding: Partial<OnboardingData>,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  
  // Build update object with dot notation for nested fields
  const updateData: Record<string, unknown> = {
    "audit.updatedBy": updatedBy,
    "audit.updatedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Flatten onboarding updates
  Object.entries(onboarding).forEach(([key, value]) => {
    updateData[`onboarding.${key}`] = value;
  });
  
  await updateDoc(docRef, updateData);
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(
  orgId: string,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  
  await updateDoc(docRef, {
    "onboarding.completed": true,
    "onboarding.completedAt": serverTimestamp(),
    "audit.updatedBy": updatedBy,
    "audit.updatedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update onboarding step
 */
export async function updateOnboardingStep(
  orgId: string,
  step: number,
  stepData: Record<string, unknown>,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, ORGANIZATIONS_COLLECTION, orgId);
  
  const updateData: Record<string, unknown> = {
    "onboarding.currentStep": step,
    "audit.updatedBy": updatedBy,
    "audit.updatedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...Object.entries(stepData).reduce((acc, [key, value]) => {
      acc[`onboarding.${key}`] = value;
      return acc;
    }, {} as Record<string, unknown>),
  };
  
  await updateDoc(docRef, updateData);
}

// =============================================================================
// Department Operations
// =============================================================================

/**
 * Get departments by organization
 */
export async function getDepartmentsByOrganization(orgId: string): Promise<Department[]> {
  const q = query(
    collection(db, DEPARTMENTS_COLLECTION),
    where("organizationId", "==", orgId),
    orderBy("name", "asc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Department[];
}

/**
 * Get a department by ID
 */
export async function getDepartmentById(deptId: string): Promise<Department | null> {
  const docRef = doc(db, DEPARTMENTS_COLLECTION, deptId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as Department;
}

/**
 * Create a department
 */
export async function createDepartment(
  data: Omit<Department, "id" | "createdAt" | "updatedAt" | "audit">,
  createdBy: string
): Promise<Department> {
  const now = Timestamp.now();
  
  const department: Omit<Department, "id"> = {
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
  
  const docRef = doc(collection(db, DEPARTMENTS_COLLECTION));
  await setDoc(docRef, department);
  
  return { id: docRef.id, ...department };
}

/**
 * Update a department
 */
export async function updateDepartment(
  deptId: string,
  data: Partial<Department>,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, DEPARTMENTS_COLLECTION, deptId);
  
  await updateDoc(docRef, {
    ...data,
    "audit.updatedBy": updatedBy,
    "audit.updatedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a department
 */
export async function deleteDepartment(deptId: string): Promise<void> {
  const docRef = doc(db, DEPARTMENTS_COLLECTION, deptId);
  // Soft delete by updating instead of deleting
  await updateDoc(docRef, {
    deleted: true,
    updatedAt: serverTimestamp(),
  });
}

// =============================================================================
// Site Operations
// =============================================================================

/**
 * Get sites by organization
 */
export async function getSitesByOrganization(orgId: string): Promise<Site[]> {
  const q = query(
    collection(db, SITES_COLLECTION),
    where("organizationId", "==", orgId),
    orderBy("name", "asc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Site[];
}

/**
 * Get a site by ID
 */
export async function getSiteById(siteId: string): Promise<Site | null> {
  const docRef = doc(db, SITES_COLLECTION, siteId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as Site;
}

/**
 * Create a site
 */
export async function createSite(
  data: Omit<Site, "id" | "createdAt" | "updatedAt" | "audit">,
  createdBy: string
): Promise<Site> {
  const now = Timestamp.now();
  
  const site: Omit<Site, "id"> = {
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
  
  const docRef = doc(collection(db, SITES_COLLECTION));
  await setDoc(docRef, site);
  
  return { id: docRef.id, ...site };
}

/**
 * Update a site
 */
export async function updateSite(
  siteId: string,
  data: Partial<Site>,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, SITES_COLLECTION, siteId);
  
  await updateDoc(docRef, {
    ...data,
    "audit.updatedBy": updatedBy,
    "audit.updatedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get default features for a subscription plan
 */
function getDefaultFeatures(plan: SubscriptionPlan): OrganizationFeatures {
  const features: Record<SubscriptionPlan, OrganizationFeatures> = {
    starter: {
      capa: true,
      incidents: true,
      training: false,
      compliance: false,
      health: false,
      analytics: false,
      aiAssistant: false,
      mobileApp: false,
      apiAccess: false,
      customBranding: false,
    },
    professional: {
      capa: true,
      incidents: true,
      training: true,
      compliance: true,
      health: true,
      analytics: true,
      aiAssistant: true,
      mobileApp: true,
      apiAccess: false,
      customBranding: false,
    },
    enterprise: {
      capa: true,
      incidents: true,
      training: true,
      compliance: true,
      health: true,
      analytics: true,
      aiAssistant: true,
      mobileApp: true,
      apiAccess: true,
      customBranding: true,
    },
  };
  
  return features[plan];
}

/**
 * Get default limits for a subscription plan
 */
function getDefaultLimits(plan: SubscriptionPlan): OrganizationLimits {
  const limits: Record<SubscriptionPlan, OrganizationLimits> = {
    starter: {
      maxUsers: 10,
      maxDepartments: 3,
      maxStorageGB: 5,
      maxMonthlyReports: 10,
      maxAIQueries: 0,
    },
    professional: {
      maxUsers: 50,
      maxDepartments: 10,
      maxStorageGB: 50,
      maxMonthlyReports: 100,
      maxAIQueries: 500,
    },
    enterprise: {
      maxUsers: -1, // Unlimited
      maxDepartments: -1,
      maxStorageGB: 500,
      maxMonthlyReports: -1,
      maxAIQueries: -1,
    },
  };
  
  return limits[plan];
}

/**
 * Initialize default onboarding data
 */
export function getDefaultOnboardingData(): OnboardingData {
  return {
    completed: false,
    currentStep: 0,
    compliance: {
      hasExistingSystem: false,
      currentTools: [],
      certifications: [],
      targetCertifications: [],
      regulatoryBodies: [],
      auditFrequency: "never",
    },
    incidents: {
      hasExistingSystem: false,
      currentSystem: "none",
      averageMonthlyIncidents: 0,
      incidentCategories: [],
      reportingWorkflow: "",
    },
    health: {
      hasOccupationalDoctor: false,
      hasSafetyCommittee: false,
      hasFirstAidTraining: false,
      hasEmergencyPlan: false,
      hazardTypes: [],
    },
    objectives: {
      primaryGoals: [],
      painPoints: [],
      expectedOutcomes: [],
      implementationTimeline: "3_months",
      priorityModules: [],
    },
    documents: {
      uploadedDocuments: [],
      pendingImports: false,
    },
  };
}

