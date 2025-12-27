/**
 * Seed Organization and Template Roles
 */

import { db, COLLECTIONS, DEMO_ORG, DEPARTMENTS } from "./config";
import { now, createAuditInfo, log, generateId } from "./utils";

// Template roles configuration (matching src/services/roleService.ts)
const TEMPLATE_ROLES = [
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
      health: { create: true, read: true, update: true, delete: false },
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
      capa: { create: true, read: true, update: false, delete: false },
      training: { create: false, read: true, update: false, delete: false },
      compliance: { create: false, read: true, update: false, delete: false },
      health: { create: true, read: true, update: true, delete: true },
      analytics: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
      users: { create: false, read: true, update: false, delete: false },
      roles: { create: false, read: false, update: false, delete: false },
    },
  },
  {
    name: "Employé",
    description: "Employé avec accès basique",
    isTemplate: true,
    permissions: {
      dashboard: { create: false, read: true, update: false, delete: false },
      incidents: { create: true, read: true, update: false, delete: false },
      capa: { create: false, read: true, update: false, delete: false },
      training: { create: false, read: true, update: false, delete: false },
      compliance: { create: false, read: false, update: false, delete: false },
      health: { create: false, read: false, update: false, delete: false },
      analytics: { create: false, read: false, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
      users: { create: false, read: false, update: false, delete: false },
      roles: { create: false, read: false, update: false, delete: false },
    },
  },
];

interface SeedResult {
  organizationId: string;
  roleIds: Record<string, string>;
  departmentIds: Record<string, string>;
}

/**
 * Check if demo organization already exists
 */
export async function checkExistingOrg(): Promise<string | null> {
  const snapshot = await db
    .collection(COLLECTIONS.organizations)
    .where("name", "==", DEMO_ORG.name)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  return null;
}

/**
 * Delete existing demo data
 */
export async function cleanupExistingData(orgId: string): Promise<void> {
  log(`Cleaning up existing data for org ${orgId}...`, "warn");

  const batch = db.batch();
  const collections = Object.values(COLLECTIONS);

  for (const collectionName of collections) {
    const snapshot = await db
      .collection(collectionName)
      .where("organizationId", "==", orgId)
      .get();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
  }

  // Delete organization document itself
  batch.delete(db.collection(COLLECTIONS.organizations).doc(orgId));

  await batch.commit();
  log("Cleanup completed", "success");
}

/**
 * Seed the demo organization, roles, and departments
 */
export async function seedOrganization(adminUserId: string): Promise<SeedResult> {
  log("Creating organization...");

  const timestamp = now();

  // Create organization document
  const orgRef = db.collection(COLLECTIONS.organizations).doc();
  const organizationId = orgRef.id;

  const organization = {
    ...DEMO_ORG,
    plan: "professional",
    status: "active",
    features: {
      capa: true,
      incidents: true,
      training: true,
      compliance: true,
      health: true,
      analytics: true,
      aiAssistant: true,
      mobileApp: false,
      apiAccess: false,
      customBranding: false,
    },
    limits: {
      maxUsers: 100,
      maxDepartments: 20,
      maxStorageGB: 10,
      maxMonthlyReports: 50,
      maxAIQueries: 500,
    },
    onboarding: {
      completed: true,
      completedAt: timestamp,
      currentStep: 6,
      compliance: {
        hasExistingSystem: true,
        currentTools: ["Excel", "Papier"],
        certifications: ["ISO 9001"],
        targetCertifications: ["ISO 45001", "ISO 14001"],
        regulatoryBodies: ["Inspection du Travail", "CNAM"],
        auditFrequency: "quarterly",
      },
      incidents: {
        hasExistingSystem: true,
        currentSystem: "spreadsheet",
        averageMonthlyIncidents: 3,
        incidentCategories: ["Accidents", "Presqu'accidents", "Situations dangereuses"],
        reportingWorkflow: "Signalement par chef d'équipe puis validation QHSE",
      },
      health: {
        hasOccupationalDoctor: true,
        hasSafetyCommittee: true,
        safetyCommitteeMembers: 6,
        hasFirstAidTraining: true,
        firstAidTrainedCount: 15,
        hasEmergencyPlan: true,
        hazardTypes: ["Bruit", "Poussières", "Manutention", "Machines", "Chimique"],
      },
      objectives: {
        primaryGoals: [
          "Réduire les accidents de 30%",
          "Obtenir la certification ISO 45001",
          "Améliorer le suivi médical",
        ],
        painPoints: [
          "Traçabilité des actions",
          "Suivi des formations",
          "Centralisation des données",
        ],
        expectedOutcomes: [
          "Tableaux de bord en temps réel",
          "Gestion centralisée des CAPA",
          "Meilleur suivi de conformité",
        ],
        implementationTimeline: "3_months",
        priorityModules: ["incidents", "capa", "compliance", "health"],
      },
      documents: {
        uploadedDocuments: [],
        pendingImports: false,
      },
    },
    settings: {
      language: "fr",
      timezone: "Africa/Tunis",
      dateFormat: "DD/MM/YYYY",
      currency: "TND",
      requireIncidentPhotos: false,
      requireWitnesses: false,
      autoGenerateCapa: true,
      adminNotifications: true,
      weeklyDigest: true,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    audit: createAuditInfo(adminUserId),
  };

  await orgRef.set(organization);
  log(`Organization created: ${organizationId}`, "success");

  // Create template roles
  log("Creating template roles...");
  const roleIds: Record<string, string> = {};

  for (const templateRole of TEMPLATE_ROLES) {
    const roleRef = db.collection(COLLECTIONS.roles).doc();
    roleIds[templateRole.name] = roleRef.id;

    await roleRef.set({
      ...templateRole,
      organizationId,
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(adminUserId),
    });
  }
  log(`Created ${TEMPLATE_ROLES.length} roles`, "success");

  // Create departments
  log("Creating departments...");
  const departmentIds: Record<string, string> = {};

  for (const dept of DEPARTMENTS) {
    const deptRef = db.collection("departments").doc();
    departmentIds[dept.name] = deptRef.id;

    await deptRef.set({
      organizationId,
      name: dept.name,
      description: `Département ${dept.name}`,
      employeeCount: Math.floor(Math.random() * 50) + 20,
      riskLevel: dept.riskLevel,
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(adminUserId),
    });
  }
  log(`Created ${DEPARTMENTS.length} departments`, "success");

  return { organizationId, roleIds, departmentIds };
}

