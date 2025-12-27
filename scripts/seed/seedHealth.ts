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

// Medical visit configurations matching ExaminationType and MedicalVisitStatus
type ExaminationType = "pre_employment" | "periodic" | "return_to_work" | "special_surveillance" | "exit";
type MedicalVisitStatus = "scheduled" | "completed" | "cancelled" | "no_show" | "overdue";

const MEDICAL_VISIT_DATA: Array<{
  type: ExaminationType;
  status: MedicalVisitStatus;
  daysAgoScheduled: number;
  daysAgoCompleted: number | null;
  conclusion: string | null;
}> = [
  {
    type: "pre_employment",
    status: "completed",
    daysAgoScheduled: 180,
    daysAgoCompleted: 180,
    conclusion: "Apte au poste sans restriction",
  },
  {
    type: "periodic",
    status: "completed",
    daysAgoScheduled: 60,
    daysAgoCompleted: 58,
    conclusion: "Apte au poste - Surveillance audiométrique recommandée",
  },
  {
    type: "periodic",
    status: "scheduled",
    daysAgoScheduled: -15, // 15 days in future
    daysAgoCompleted: null,
    conclusion: null,
  },
  {
    type: "return_to_work",
    status: "completed",
    daysAgoScheduled: 40,
    daysAgoCompleted: 40,
    conclusion: "Apte au poste avec restriction temporaire - Pas de port de charges > 15 kg pendant 6 mois",
  },
  {
    type: "periodic",
    status: "completed",
    daysAgoScheduled: 25,
    daysAgoCompleted: 25,
    conclusion: "Pas de contre-indication particulière - Fatigue visuelle à surveiller",
  },
  {
    type: "periodic",
    status: "no_show",
    daysAgoScheduled: 30,
    daysAgoCompleted: null,
    conclusion: null,
  },
  {
    type: "periodic",
    status: "scheduled",
    daysAgoScheduled: -7,
    daysAgoCompleted: null,
    conclusion: null,
  },
  {
    type: "special_surveillance",
    status: "completed",
    daysAgoScheduled: 45,
    daysAgoCompleted: 44,
    conclusion: "Surveillance trimestrielle maintenue pour exposition au bruit",
  },
  {
    type: "periodic",
    status: "scheduled",
    daysAgoScheduled: -30,
    daysAgoCompleted: null,
    conclusion: null,
  },
  {
    type: "pre_employment",
    status: "completed",
    daysAgoScheduled: 365,
    daysAgoCompleted: 365,
    conclusion: "Apte au poste - Formation sécurité obligatoire",
  },
];

// Exposure data for the organization (matches OrganizationExposure interface)
const EXPOSURE_DATA = [
  {
    agent: "Bruit industriel > 80 dB",
    hazardType: "physical" as const,
    area: "Zone Production A - Atelier Mécanique",
    regulatoryLimit: 80,
    unit: "dB(A)",
    regulatoryReference: "VLEP 8h - Code du Travail Art. R4431-2",
    lastMeasurement: 85,
    exposedCount: 85,
    monitoringFrequency: "quarterly" as const,
    measurements: [
      { value: 82, unit: "dB(A)", daysAgo: 90, location: "Zone Production A", compliant: false },
      { value: 78, unit: "dB(A)", daysAgo: 60, location: "Zone Production B", compliant: true },
      { value: 85, unit: "dB(A)", daysAgo: 30, location: "Atelier Mécanique", compliant: false },
    ],
    controlMeasures: ["Port de protections auditives obligatoire", "Encoffrement des machines bruyantes", "Rotation des postes"],
  },
  {
    agent: "Poussières métalliques (Fe, Al)",
    hazardType: "chemical" as const,
    area: "Atelier Mécanique - Zone Usinage",
    regulatoryLimit: 5,
    unit: "mg/m³",
    regulatoryReference: "VLEP 8h - Code du Travail",
    lastMeasurement: 4.8,
    exposedCount: 45,
    monitoringFrequency: "monthly" as const,
    measurements: [
      { value: 3.2, unit: "mg/m³", daysAgo: 45, location: "Atelier Mécanique", compliant: true },
      { value: 4.8, unit: "mg/m³", daysAgo: 15, location: "Zone Production A", compliant: true },
    ],
    controlMeasures: ["Aspiration à la source", "Port de masques FFP2", "Nettoyage quotidien"],
  },
  {
    agent: "Vibrations main-bras",
    hazardType: "physical" as const,
    area: "Atelier Maintenance - Outils portatifs",
    regulatoryLimit: 5,
    unit: "m/s²",
    regulatoryReference: "Décret 2005-746",
    lastMeasurement: 2.1,
    exposedCount: 12,
    monitoringFrequency: "annually" as const,
    measurements: [
      { value: 2.1, unit: "m/s²", daysAgo: 60, location: "Atelier Maintenance", compliant: true },
    ],
    controlMeasures: ["Outils anti-vibrations", "Rotation des tâches", "Gants anti-vibrations"],
  },
  {
    agent: "Solvants organiques (Toluène, Xylène)",
    hazardType: "chemical" as const,
    area: "Zone Peinture - Cabine",
    regulatoryLimit: 100,
    unit: "ppm",
    regulatoryReference: "VLEP 8h - Arrêté du 30/06/2004",
    lastMeasurement: 120,
    exposedCount: 18,
    monitoringFrequency: "monthly" as const,
    measurements: [
      { value: 45, unit: "ppm", daysAgo: 30, location: "Laboratoire Qualité", compliant: true },
      { value: 120, unit: "ppm", daysAgo: 30, location: "Zone Peinture", compliant: false },
    ],
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
  departmentIds: Record<string, string>,
  creatorId: string
): Promise<number> {
  log("Creating medical visits...");
  let count = 0;
  const timestamp = now();

  const doctor = users.find((u) => u.roleName === "Médecin du travail");
  const doctorName = doctor?.displayName || "Dr. Leila Mansouri";
  const doctorId = doctor?.userId || "";

  // Distribute visits among employees
  const employees = users.filter((u) => 
    ["Employé", "Chef de département", "QHSE"].includes(u.roleName)
  );

  // Map role to department for consistency
  const roleToDeptMap: Record<string, string> = {
    "Employé": "Production",
    "Chef de département": "Production",
    "QHSE": "Qualité",
  };

  for (let i = 0; i < MEDICAL_VISIT_DATA.length; i++) {
    const visitData = MEDICAL_VISIT_DATA[i];
    const employee = employees[i % employees.length];
    const visitRef = db.collection(COLLECTIONS.medicalVisits).doc();

    const scheduledDate = visitData.daysAgoScheduled >= 0
      ? toTimestamp(daysAgo(visitData.daysAgoScheduled))
      : toTimestamp(daysFromNow(Math.abs(visitData.daysAgoScheduled)));

    const completedDate = visitData.daysAgoCompleted !== null
      ? toTimestamp(daysAgo(visitData.daysAgoCompleted))
      : undefined;

    // Determine reason based on visit type
    let reason = "";
    if (visitData.type === "return_to_work") {
      reason = "Reprise suite à accident du travail";
    } else if (visitData.type === "special_surveillance") {
      reason = "Surveillance spéciale exposition au bruit";
    } else if (visitData.type === "pre_employment") {
      reason = "Visite d'embauche obligatoire";
    }

    // Get department info
    const deptName = roleToDeptMap[employee.roleName] || "Production";
    const departmentId = departmentIds[deptName] || "";

    const visit = {
      organizationId,
      healthRecordId: "", // Can be linked later
      employeeId: employee.userId,
      employeeName: employee.displayName,
      departmentId,
      departmentName: deptName,
      type: visitData.type,
      status: visitData.status,
      scheduledDate,
      scheduledTime: "09:00",
      completedDate,
      physicianId: doctorId,
      physicianName: doctorName,
      location: "Infirmerie TechManuf",
      reason,
      conclusion: visitData.conclusion || "",
      fitnessDecision: visitData.status === "completed" ? "fit" : undefined,
      restrictions: [],
      nextVisitDate: visitData.status === "completed" 
        ? toTimestamp(daysFromNow(365))
        : undefined,
      nextVisitType: "periodic" as const,
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

    // Calculate percentOfLimit and alertLevel
    const percentOfLimit = (expData.lastMeasurement / expData.regulatoryLimit) * 100;
    const alertLevel = percentOfLimit >= 100 ? "critical" as const :
                       percentOfLimit >= 80 ? "elevated" as const :
                       percentOfLimit >= 50 ? "moderate" as const : "low" as const;
    
    // Count exceedances
    const exceedanceCount = expData.measurements.filter(m => !m.compliant).length;

    const exposure = {
      organizationId,
      // Exposure identification
      hazardType: expData.hazardType,
      agent: expData.agent,
      // Location
      area: expData.area,
      // Regulatory limits
      regulatoryLimit: expData.regulatoryLimit,
      unit: expData.unit,
      regulatoryReference: expData.regulatoryReference,
      // Current measurement
      lastMeasurement: expData.lastMeasurement,
      lastMeasurementDate: toTimestamp(daysAgo(expData.measurements[0]?.daysAgo || 30)),
      percentOfLimit,
      // Status
      alertLevel,
      exceedanceCount,
      // Affected employees
      exposedEmployeeCount: expData.exposedCount,
      exposedEmployeeIds: [], // Would be populated with actual employee IDs
      // Control measures
      controlMeasures: expData.controlMeasures,
      linkedCapaIds: [],
      // Monitoring schedule
      monitoringFrequency: expData.monitoringFrequency,
      nextMeasurementDue: toTimestamp(daysFromNow(90)),
      // Timestamps and audit
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(creatorId),
    };

    await exposureRef.set(exposure);
    exposureCount++;

    // Create measurements
    const measurementIds: string[] = [];
    for (const mData of expData.measurements) {
      const measurementRef = db.collection(COLLECTIONS.measurements).doc();

      const measurement = {
        organizationId,
        exposureId: exposureRef.id,
        // Measurement data
        date: toTimestamp(daysAgo(mData.daysAgo)),
        value: mData.value,
        unit: mData.unit,
        measuredBy: "Laboratoire COTUTELLE",
        method: "Méthode normalisée NF EN 689",
        location: mData.location,
        // Compliance
        compliant: mData.compliant,
        notes: !mData.compliant 
          ? "Dépassement détecté - Action corrective requise"
          : "",
        // Timestamps and audit
        createdAt: timestamp,
        updatedAt: timestamp,
        audit: createAuditInfo(creatorId),
      };

      await measurementRef.set(measurement);
      measurementIds.push(measurementRef.id);
      measurementCount++;
    }

    log(`Created exposure: ${expData.agent} (${expData.measurements.length} measurements)`, "success");
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
  const medicalVisitCount = await seedMedicalVisits(organizationId, users, departmentIds, creatorId);
  const { exposureCount, measurementCount } = await seedExposures(organizationId, departmentIds, creatorId);

  return {
    healthRecordCount,
    medicalVisitCount,
    exposureCount,
    measurementCount,
  };
}

