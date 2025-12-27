/**
 * Seed Health Records, Medical Visits, and Exposure Data
 */

import { db, COLLECTIONS } from "./config";
import {
  now,
  createAuditInfo,
  log,
  generateId,
  toTimestamp,
  daysAgo,
  daysFromNow,
  monthsAgo,
  randomItem,
} from "./utils";

// Health record configurations per user role
const HEALTH_RECORD_CONFIGS = [
  {
    roleName: "Org Admin",
    fitnessStatus: "fit" as const,
    restrictions: [],
    exposures: [],
    vaccinations: ["Hépatite B", "Tétanos"],
  },
  {
    roleName: "QHSE",
    fitnessStatus: "fit" as const,
    restrictions: [],
    exposures: ["Bruit", "Poussières"],
    vaccinations: ["Hépatite B", "Tétanos", "Grippe"],
  },
  {
    roleName: "RH",
    fitnessStatus: "fit" as const,
    restrictions: [],
    exposures: [],
    vaccinations: ["Tétanos"],
  },
  {
    roleName: "Chef de département",
    fitnessStatus: "fit" as const,
    restrictions: [],
    exposures: ["Bruit", "Vibrations"],
    vaccinations: ["Tétanos", "Hépatite B"],
  },
  {
    roleName: "Médecin du travail",
    fitnessStatus: "fit" as const,
    restrictions: [],
    exposures: [],
    vaccinations: ["Hépatite B", "Tétanos", "Grippe", "COVID-19"],
  },
  {
    roleName: "Employé",
    fitnessStatus: "fit_with_restrictions" as const,
    restrictions: [
      {
        type: "physical" as const,
        description: "Éviter le port de charges supérieures à 15 kg",
        startDate: daysAgo(90),
        endDate: daysFromNow(90),
        isActive: true,
      },
    ],
    exposures: ["Bruit", "Poussières", "Vibrations", "Solvants"],
    vaccinations: ["Tétanos"],
  },
];

// Medical visit configurations
const MEDICAL_VISIT_DATA = [
  {
    type: "embauche" as const,
    status: "completed" as const,
    daysAgoScheduled: 180,
    daysAgoCompleted: 180,
    conclusion: "Apte au poste sans restriction",
  },
  {
    type: "periodique" as const,
    status: "completed" as const,
    daysAgoScheduled: 60,
    daysAgoCompleted: 58,
    conclusion: "Apte au poste - Surveillance audiométrique recommandée",
  },
  {
    type: "periodique" as const,
    status: "scheduled" as const,
    daysAgoScheduled: -15, // 15 days in future
    daysAgoCompleted: null,
    conclusion: null,
  },
  {
    type: "reprise" as const,
    status: "completed" as const,
    daysAgoScheduled: 40,
    daysAgoCompleted: 40,
    conclusion: "Apte au poste avec restriction temporaire - Pas de port de charges > 15 kg pendant 6 mois",
  },
  {
    type: "a_demande" as const,
    status: "completed" as const,
    daysAgoScheduled: 25,
    daysAgoCompleted: 25,
    conclusion: "Pas de contre-indication particulière - Fatigue visuelle à surveiller",
  },
  {
    type: "periodique" as const,
    status: "missed" as const,
    daysAgoScheduled: 30,
    daysAgoCompleted: null,
    conclusion: null,
  },
  {
    type: "periodique" as const,
    status: "scheduled" as const,
    daysAgoScheduled: -7,
    daysAgoCompleted: null,
    conclusion: null,
  },
  {
    type: "surveillance_speciale" as const,
    status: "completed" as const,
    daysAgoScheduled: 45,
    daysAgoCompleted: 44,
    conclusion: "Surveillance trimestrielle maintenue pour exposition au bruit",
  },
  {
    type: "periodique" as const,
    status: "scheduled" as const,
    daysAgoScheduled: -30,
    daysAgoCompleted: null,
    conclusion: null,
  },
  {
    type: "embauche" as const,
    status: "completed" as const,
    daysAgoScheduled: 365,
    daysAgoCompleted: 365,
    conclusion: "Apte au poste - Formation sécurité obligatoire",
  },
];

// Exposure data for the organization
const EXPOSURE_DATA = [
  {
    name: "Bruit",
    hazardCategory: "physical" as const,
    description: "Exposition au bruit dans les zones de production",
    riskLevel: "medium" as const,
    exposedDepartments: ["Production", "Maintenance"],
    exposedCount: 85,
    measurements: [
      { value: 82, unit: "dB(A)", daysAgo: 90, location: "Zone Production A", status: "above_limit" as const },
      { value: 78, unit: "dB(A)", daysAgo: 60, location: "Zone Production B", status: "compliant" as const },
      { value: 85, unit: "dB(A)", daysAgo: 30, location: "Atelier Mécanique", status: "above_limit" as const },
    ],
    legalLimit: 80,
    actionLimit: 85,
    controlMeasures: ["Port de protections auditives obligatoire", "Encoffrement des machines bruyantes", "Rotation des postes"],
  },
  {
    name: "Poussières métalliques",
    hazardCategory: "chemical" as const,
    description: "Exposition aux poussières lors des opérations d'usinage",
    riskLevel: "medium" as const,
    exposedDepartments: ["Production", "Maintenance", "Qualité"],
    exposedCount: 45,
    measurements: [
      { value: 3.2, unit: "mg/m³", daysAgo: 45, location: "Atelier Mécanique", status: "compliant" as const },
      { value: 4.8, unit: "mg/m³", daysAgo: 15, location: "Zone Production A", status: "near_limit" as const },
    ],
    legalLimit: 5,
    actionLimit: 4,
    controlMeasures: ["Aspiration à la source", "Port de masques FFP2", "Nettoyage quotidien"],
  },
  {
    name: "Vibrations main-bras",
    hazardCategory: "physical" as const,
    description: "Exposition aux vibrations lors de l'utilisation d'outils portatifs",
    riskLevel: "low" as const,
    exposedDepartments: ["Maintenance"],
    exposedCount: 12,
    measurements: [
      { value: 2.1, unit: "m/s²", daysAgo: 60, location: "Atelier Maintenance", status: "compliant" as const },
    ],
    legalLimit: 5,
    actionLimit: 2.5,
    controlMeasures: ["Outils anti-vibrations", "Rotation des tâches", "Gants anti-vibrations"],
  },
  {
    name: "Solvants organiques",
    hazardCategory: "chemical" as const,
    description: "Exposition aux solvants dans le laboratoire qualité et zone peinture",
    riskLevel: "high" as const,
    exposedDepartments: ["Qualité", "Production"],
    exposedCount: 18,
    measurements: [
      { value: 45, unit: "ppm", daysAgo: 30, location: "Laboratoire Qualité", status: "compliant" as const },
      { value: 120, unit: "ppm", daysAgo: 30, location: "Zone Peinture", status: "above_limit" as const },
    ],
    legalLimit: 100,
    actionLimit: 80,
    controlMeasures: ["Ventilation mécanique", "Port de masques à cartouche", "Stockage ventilé", "Surveillance biologique"],
  },
];

interface HealthResult {
  healthRecordCount: number;
  medicalVisitCount: number;
  exposureCount: number;
  measurementCount: number;
}

/**
 * Seed health records for all users
 */
async function seedHealthRecords(
  organizationId: string,
  users: { userId: string; roleName: string; displayName: string }[],
  departmentIds: Record<string, string>,
  creatorId: string
): Promise<number> {
  log("Creating health records...");
  let count = 0;
  const timestamp = now();

  for (const user of users) {
    const config = HEALTH_RECORD_CONFIGS.find((c) => c.roleName === user.roleName);
    if (!config) continue;

    const recordRef = db.collection(COLLECTIONS.healthRecords).doc();

    // Determine department
    const deptName = user.roleName === "Employé" || user.roleName === "Chef de département" 
      ? "Production" 
      : user.roleName === "RH" 
        ? "RH" 
        : "Administration";
    
    const vaccinations = config.vaccinations.map((name) => ({
      id: generateId(),
      name,
      date: toTimestamp(monthsAgo(Math.floor(Math.random() * 24) + 6)),
      expiryDate: toTimestamp(daysFromNow(365 * (Math.floor(Math.random() * 3) + 1))),
      provider: "Centre de Vaccination Sousse",
    }));

    const healthRecord = {
      organizationId,
      employeeId: user.userId,
      employeeName: user.displayName,
      departmentId: departmentIds[deptName] || "",
      fitnessStatus: config.fitnessStatus,
      lastExamDate: toTimestamp(daysAgo(60)),
      nextExamDate: toTimestamp(daysFromNow(305)),
      bloodType: randomItem(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
      allergies: user.roleName === "Employé" ? ["Latex"] : [],
      chronicConditions: [],
      vaccinations,
      restrictions: config.restrictions.map((r) => ({
        ...r,
        id: generateId(),
        startDate: toTimestamp(r.startDate),
        endDate: r.endDate ? toTimestamp(r.endDate) : null,
      })),
      exposureHistory: config.exposures,
      medicalVisitIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(creatorId),
    };

    await recordRef.set(healthRecord);
    count++;
  }

  log(`Created ${count} health records`, "success");
  return count;
}

/**
 * Seed medical visits
 */
async function seedMedicalVisits(
  organizationId: string,
  users: { userId: string; roleName: string; displayName: string }[],
  creatorId: string
): Promise<number> {
  log("Creating medical visits...");
  let count = 0;
  const timestamp = now();

  const doctor = users.find((u) => u.roleName === "Médecin du travail");
  const doctorName = doctor?.displayName || "Dr. Leila Mansouri";

  // Distribute visits among employees
  const employees = users.filter((u) => 
    ["Employé", "Chef de département", "QHSE"].includes(u.roleName)
  );

  for (let i = 0; i < MEDICAL_VISIT_DATA.length; i++) {
    const visitData = MEDICAL_VISIT_DATA[i];
    const employee = employees[i % employees.length];
    const visitRef = db.collection(COLLECTIONS.medicalVisits).doc();

    const scheduledDate = visitData.daysAgoScheduled >= 0
      ? toTimestamp(daysAgo(visitData.daysAgoScheduled))
      : toTimestamp(daysFromNow(Math.abs(visitData.daysAgoScheduled)));

    const completedDate = visitData.daysAgoCompleted !== null
      ? toTimestamp(daysAgo(visitData.daysAgoCompleted))
      : null;

    // Determine reason based on visit type
    let reason = "";
    if (visitData.type === "reprise") {
      reason = "Reprise suite à accident du travail";
    } else if (visitData.type === "a_demande") {
      reason = "Demande du salarié - Fatigue";
    } else if (visitData.type === "surveillance_speciale") {
      reason = "Surveillance spéciale exposition au bruit";
    }

    const visit = {
      organizationId,
      employeeId: employee.userId,
      employeeName: employee.displayName,
      type: visitData.type,
      status: visitData.status,
      scheduledDate,
      completedDate,
      doctorName,
      doctorId: doctor?.userId || "",
      location: "Infirmerie TechManuf",
      reason,
      conclusion: visitData.conclusion || "",
      nextVisitDate: visitData.status === "completed" 
        ? toTimestamp(daysFromNow(365))
        : null,
      documents: [],
      notes: "",
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(creatorId),
    };

    await visitRef.set(visit);
    count++;
  }

  log(`Created ${count} medical visits`, "success");
  return count;
}

/**
 * Seed organization exposures and measurements
 */
async function seedExposures(
  organizationId: string,
  departmentIds: Record<string, string>,
  creatorId: string
): Promise<{ exposureCount: number; measurementCount: number }> {
  log("Creating exposure monitoring data...");
  let exposureCount = 0;
  let measurementCount = 0;
  const timestamp = now();

  for (const expData of EXPOSURE_DATA) {
    const exposureRef = db.collection(COLLECTIONS.exposures).doc();

    const exposure = {
      organizationId,
      name: expData.name,
      hazardCategory: expData.hazardCategory,
      description: expData.description,
      riskLevel: expData.riskLevel,
      exposedDepartmentIds: expData.exposedDepartments.map((d) => departmentIds[d] || ""),
      exposedDepartments: expData.exposedDepartments,
      exposedEmployeeCount: expData.exposedCount,
      legalLimit: expData.legalLimit,
      actionLimit: expData.actionLimit,
      unit: expData.measurements[0]?.unit || "",
      controlMeasures: expData.controlMeasures,
      lastMeasurementDate: toTimestamp(daysAgo(expData.measurements[0]?.daysAgo || 30)),
      nextMeasurementDate: toTimestamp(daysFromNow(90)),
      measurementIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(creatorId),
    };

    await exposureRef.set(exposure);
    exposureCount++;

    // Create measurements
    for (const mData of expData.measurements) {
      const measurementRef = db.collection(COLLECTIONS.measurements).doc();

      const measurement = {
        organizationId,
        exposureId: exposureRef.id,
        exposureName: expData.name,
        value: mData.value,
        unit: mData.unit,
        measurementDate: toTimestamp(daysAgo(mData.daysAgo)),
        location: mData.location,
        status: mData.status,
        measuredBy: "Laboratoire COTUTELLE",
        method: "Méthode normalisée",
        notes: mData.status === "above_limit" 
          ? "Dépassement détecté - Action corrective requise"
          : "",
        createdAt: timestamp,
        updatedAt: timestamp,
        audit: createAuditInfo(creatorId),
      };

      await measurementRef.set(measurement);
      measurementCount++;

      // Update exposure with measurement ID
      await exposureRef.update({
        measurementIds: [...exposure.measurementIds, measurementRef.id],
      });
    }

    log(`Created exposure: ${expData.name} (${expData.measurements.length} measurements)`, "success");
  }

  return { exposureCount, measurementCount };
}

/**
 * Seed all health data
 */
export async function seedHealth(
  organizationId: string,
  users: { userId: string; roleName: string; displayName: string }[],
  departmentIds: Record<string, string>
): Promise<HealthResult> {
  const doctor = users.find((u) => u.roleName === "Médecin du travail");
  const creatorId = doctor?.userId || users[0].userId;

  const healthRecordCount = await seedHealthRecords(organizationId, users, departmentIds, creatorId);
  const medicalVisitCount = await seedMedicalVisits(organizationId, users, creatorId);
  const { exposureCount, measurementCount } = await seedExposures(organizationId, departmentIds, creatorId);

  return {
    healthRecordCount,
    medicalVisitCount,
    exposureCount,
    measurementCount,
  };
}

