/**
 * Seed Training Plans
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
  randomItems,
} from "./utils";

interface TrainingPlanData {
  courseName: string;
  description: string;
  category: string;
  duration: number; // minutes
  priority: "obligatoire" | "recommandee" | "optionnelle";
  mandatory: boolean;
  source: "manual" | "ai_recommendation" | "incident_derived" | "compliance";
}

const TRAINING_DATA: TrainingPlanData[] = [
  {
    courseName: "Sécurité Incendie et Évacuation",
    description:
      "Formation obligatoire sur les consignes de sécurité incendie, l'utilisation des extincteurs et les procédures d'évacuation d'urgence.",
    category: "Sécurité générale",
    duration: 120,
    priority: "obligatoire",
    mandatory: true,
    source: "compliance",
  },
  {
    courseName: "Gestes et Postures - Prévention TMS",
    description:
      "Formation sur les bonnes pratiques de manutention manuelle et les postures de travail pour prévenir les troubles musculo-squelettiques.",
    category: "Ergonomie",
    duration: 90,
    priority: "obligatoire",
    mandatory: true,
    source: "ai_recommendation",
  },
  {
    courseName: "Risques Chimiques - Niveau 1",
    description:
      "Sensibilisation aux risques liés à la manipulation de produits chimiques, lecture des étiquettes et fiches de données de sécurité.",
    category: "Risques chimiques",
    duration: 180,
    priority: "obligatoire",
    mandatory: true,
    source: "compliance",
  },
  {
    courseName: "Premiers Secours - SST",
    description:
      "Formation Sauveteur Secouriste du Travail : gestes de premiers secours, conduite à tenir face à un accident.",
    category: "Premiers secours",
    duration: 840, // 14 hours over 2 days
    priority: "recommandee",
    mandatory: false,
    source: "manual",
  },
  {
    courseName: "Sensibilisation SST Générale",
    description:
      "Formation d'accueil et de sensibilisation aux règles de santé et sécurité au travail de l'entreprise.",
    category: "Intégration",
    duration: 60,
    priority: "obligatoire",
    mandatory: true,
    source: "manual",
  },
];

interface TrainingResult {
  id: string;
  courseName: string;
  assignedCount: number;
}

/**
 * Seed training plans with employee assignments
 */
export async function seedTraining(
  organizationId: string,
  users: { userId: string; roleName: string; displayName: string }[],
  _departmentIds: Record<string, string>
): Promise<TrainingResult[]> {
  log("Creating training plans...");

  const results: TrainingResult[] = [];
  const timestamp = now();

  // Get the admin user for audit
  const adminUser = users.find((u) => u.roleName === "Org Admin" || u.roleName === "QHSE");
  const creatorId = adminUser?.userId || users[0].userId;

  // Get all user IDs for assignment
  const allUserIds = users.map((u) => u.userId);

  for (let i = 0; i < TRAINING_DATA.length; i++) {
    const data = TRAINING_DATA[i];
    const planRef = db.collection(COLLECTIONS.trainingPlans).doc();
    const courseId = `COURSE-${String(i + 1).padStart(3, "0")}`;

    // Assign varying numbers of employees
    const assignCount = data.mandatory ? allUserIds.length : Math.min(3, allUserIds.length);
    const assignedEmployees = data.mandatory
      ? allUserIds
      : randomItems(allUserIds, assignCount);

    // Set realistic dates
    const availableFrom = toTimestamp(daysAgo(30 + i * 10));
    const dueDate = toTimestamp(daysFromNow(30 + i * 15));

    // Calculate completion status
    const completedCount = Math.floor(assignedEmployees.length * (0.3 + Math.random() * 0.4));
    const inProgressCount = Math.floor(
      (assignedEmployees.length - completedCount) * 0.3
    );
    const notStartedCount = assignedEmployees.length - completedCount - inProgressCount;

    const trainingPlan = {
      organizationId,
      courseId,
      courseName: data.courseName,
      description: data.description,
      category: data.category,
      duration: data.duration,
      assignedEmployees,
      departmentIds: [],
      dueDate,
      availableFrom,
      priority: data.priority,
      source: data.source,
      mandatory: data.mandatory,
      completionStatus: {
        total: assignedEmployees.length,
        completed: completedCount,
        inProgress: inProgressCount,
        notStarted: notStartedCount,
        overdue: 0,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(creatorId),
    };

    await planRef.set(trainingPlan);

    // Create training records for each assigned employee
    for (let j = 0; j < assignedEmployees.length; j++) {
      const employeeId = assignedEmployees[j];
      const recordRef = db.collection(COLLECTIONS.trainingRecords).doc();

      let status: "not_started" | "in_progress" | "completed" = "not_started";
      let progress = 0;

      if (j < completedCount) {
        status = "completed";
        progress = 100;
      } else if (j < completedCount + inProgressCount) {
        status = "in_progress";
        progress = 20 + Math.floor(Math.random() * 60);
      }

      const record = {
        organizationId,
        trainingPlanId: planRef.id,
        employeeId,
        status,
        startedAt: status !== "not_started" ? toTimestamp(daysAgo(10 + j)) : null,
        completedAt: status === "completed" ? toTimestamp(daysAgo(j)) : null,
        progress,
        createdAt: timestamp,
        updatedAt: timestamp,
        audit: createAuditInfo(creatorId),
      };

      await recordRef.set(record);
    }

    results.push({
      id: planRef.id,
      courseName: data.courseName,
      assignedCount: assignedEmployees.length,
    });

    log(
      `Created training: ${data.courseName} (${assignedEmployees.length} assigned)`,
      "success"
    );
  }

  return results;
}

