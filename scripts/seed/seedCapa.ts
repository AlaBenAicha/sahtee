/**
 * Seed CAPA (Corrective and Preventive Actions)
 */

import { db, COLLECTIONS } from "./config";
import {
  now,
  createAuditInfo,
  log,
  generateReference,
  toTimestamp,
  daysAgo,
  daysFromNow,
  randomItem,
} from "./utils";
import type { ComplianceResult } from "./seedCompliance";

interface IncidentResult {
  id: string;
  reference: string;
  title: string;
  type: string;
  severity: string;
  hasLinkedCapa: boolean;
  daysAgo: number;
}

// CAPA configurations
interface CapaConfig {
  title: string;
  description: string;
  type: "corrective" | "preventive";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "cancelled" | "overdue";
  source: "incident" | "audit" | "observation" | "management_review" | "risk_assessment" | "other";
  sourceDescription: string;
  actionSteps: string[];
  responsibleRole: string;
  daysAgoCreated: number;
  dueDaysFromCreation: number;
  linkedToIncidentIndex?: number; // Index in incidents array
  linkedToAuditIndex?: number; // Index in audits array
  linkedToExposure?: string; // Exposure name
}

const CAPA_DATA: CapaConfig[] = [
  // Linked to incidents (4)
  {
    title: "Installation de bacs de rétention zone hydraulique",
    description: "Installer des bacs de rétention sous tous les équipements hydrauliques de la zone de production A pour prévenir les fuites d'huile.",
    type: "corrective",
    priority: "high",
    status: "completed",
    source: "incident",
    sourceDescription: "Suite à l'accident de chute sur flaque d'huile",
    actionSteps: [
      "Identifier tous les équipements hydrauliques",
      "Commander les bacs de rétention adaptés",
      "Installation par l'équipe maintenance",
      "Vérification et test d'étanchéité",
      "Formation du personnel de maintenance",
    ],
    responsibleRole: "Chef de département",
    daysAgoCreated: 42,
    dueDaysFromCreation: 30,
    linkedToIncidentIndex: 0,
  },
  {
    title: "Renforcement de la politique EPI - Gants de protection",
    description: "Renforcer le contrôle du port des gants de protection lors de la manipulation de pièces métalliques.",
    type: "corrective",
    priority: "medium",
    status: "in_progress",
    source: "incident",
    sourceDescription: "Suite à la coupure lors de manipulation de pièces",
    actionSteps: [
      "Rappel des consignes par affichage",
      "Distribution de nouveaux gants adaptés",
      "Sensibilisation par les chefs d'équipe",
      "Mise en place de contrôles inopinés",
    ],
    responsibleRole: "QHSE",
    daysAgoCreated: 10,
    dueDaysFromCreation: 21,
    linkedToIncidentIndex: 1,
  },
  {
    title: "Amélioration de la circulation zone de chargement",
    description: "Redéfinir les zones de circulation piétons et engins dans la zone de chargement pour éviter les croisements dangereux.",
    type: "preventive",
    priority: "high",
    status: "in_progress",
    source: "incident",
    sourceDescription: "Suite au presqu'accident chariot élévateur",
    actionSteps: [
      "Audit des flux de circulation actuels",
      "Conception du nouveau plan de circulation",
      "Marquage au sol",
      "Installation de miroirs et signalisation",
      "Formation des caristes et piétons",
      "Communication à tout le personnel",
    ],
    responsibleRole: "QHSE",
    daysAgoCreated: 28,
    dueDaysFromCreation: 45,
    linkedToIncidentIndex: 2,
  },
  {
    title: "Campagne anti-tabac renforcée",
    description: "Renforcer l'interdiction de fumer dans les ateliers et installer des zones fumeurs dédiées.",
    type: "preventive",
    priority: "medium",
    status: "completed",
    source: "incident",
    sourceDescription: "Suite au début d'incendie dans l'atelier électrique",
    actionSteps: [
      "Affichage renforcé interdiction de fumer",
      "Création de zones fumeurs extérieures",
      "Sanctions disciplinaires définies",
      "Communication à tout le personnel",
    ],
    responsibleRole: "RH",
    daysAgoCreated: 55,
    dueDaysFromCreation: 14,
    linkedToIncidentIndex: 4,
  },

  // Linked to audit findings (3)
  {
    title: "Documentation du processus d'évaluation des risques",
    description: "Rédiger et formaliser la procédure d'évaluation des risques SST conformément au §6.1.2 de l'ISO 45001.",
    type: "corrective",
    priority: "high",
    status: "in_progress",
    source: "audit",
    sourceDescription: "Non-conformité majeure audit ISO 45001",
    actionSteps: [
      "Rédaction de la procédure PR-SST-01",
      "Validation par la direction",
      "Formation des évaluateurs de risques",
      "Mise en application sur un processus pilote",
      "Déploiement généralisé",
      "Audit de suivi",
    ],
    responsibleRole: "QHSE",
    daysAgoCreated: 40,
    dueDaysFromCreation: 60,
    linkedToAuditIndex: 0,
  },
  {
    title: "Mise à jour du registre des formations",
    description: "Compléter le registre des formations avec les dates de validité manquantes.",
    type: "corrective",
    priority: "medium",
    status: "completed",
    source: "audit",
    sourceDescription: "Non-conformité mineure audit ISO 45001",
    actionSteps: [
      "Inventaire des formations sans date de validité",
      "Collecte des informations manquantes",
      "Mise à jour du registre",
      "Mise en place d'alertes de renouvellement",
    ],
    responsibleRole: "RH",
    daysAgoCreated: 38,
    dueDaysFromCreation: 21,
    linkedToAuditIndex: 0,
  },
  {
    title: "Amélioration du suivi des actions correctives",
    description: "Mettre en place un tableau de bord de suivi des actions correctives avec indicateurs de délai.",
    type: "preventive",
    priority: "low",
    status: "pending",
    source: "audit",
    sourceDescription: "Observation audit ISO 45001",
    actionSteps: [
      "Définir les indicateurs de suivi",
      "Créer le tableau de bord",
      "Former les utilisateurs",
      "Revue mensuelle du tableau de bord",
    ],
    responsibleRole: "QHSE",
    daysAgoCreated: 35,
    dueDaysFromCreation: 90,
    linkedToAuditIndex: 0,
  },

  // Linked to health/exposures (2)
  {
    title: "Réduction du bruit - Encoffrement machines",
    description: "Installer des capots acoustiques sur les machines les plus bruyantes de l'atelier mécanique.",
    type: "preventive",
    priority: "high",
    status: "in_progress",
    source: "risk_assessment",
    sourceDescription: "Dépassement des limites d'exposition au bruit",
    actionSteps: [
      "Étude acoustique détaillée",
      "Sélection des machines prioritaires",
      "Commande des équipements d'insonorisation",
      "Installation",
      "Mesures de contrôle post-installation",
    ],
    responsibleRole: "Chef de département",
    daysAgoCreated: 25,
    dueDaysFromCreation: 60,
    linkedToExposure: "Bruit",
  },
  {
    title: "Amélioration ventilation zone peinture",
    description: "Installer un système de ventilation mécanique renforcé dans la zone peinture pour réduire l'exposition aux solvants.",
    type: "corrective",
    priority: "critical",
    status: "in_progress",
    source: "risk_assessment",
    sourceDescription: "Dépassement des VLE solvants en zone peinture",
    actionSteps: [
      "Étude technique du système de ventilation",
      "Appel d'offres installateurs",
      "Travaux d'installation",
      "Tests et réglages",
      "Mesures de contrôle",
      "Formation du personnel",
    ],
    responsibleRole: "Chef de département",
    daysAgoCreated: 20,
    dueDaysFromCreation: 45,
    linkedToExposure: "Solvants organiques",
  },

  // Manual/proactive (3)
  {
    title: "Plan de formation SST 2025",
    description: "Élaborer et déployer le plan de formation SST annuel incluant les recyclages obligatoires.",
    type: "preventive",
    priority: "medium",
    status: "pending",
    source: "management_review",
    sourceDescription: "Revue de direction annuelle",
    actionSteps: [
      "Identification des besoins de formation",
      "Planification des sessions",
      "Réservation des formateurs",
      "Communication aux managers",
      "Suivi de réalisation",
    ],
    responsibleRole: "RH",
    daysAgoCreated: 10,
    dueDaysFromCreation: 30,
  },
  {
    title: "Révision du plan d'urgence",
    description: "Mettre à jour le plan d'urgence et d'évacuation et organiser un exercice d'évacuation.",
    type: "preventive",
    priority: "medium",
    status: "in_progress",
    source: "observation",
    sourceDescription: "Mise à jour annuelle requise",
    actionSteps: [
      "Révision du document plan d'urgence",
      "Mise à jour des numéros d'urgence",
      "Vérification des issues de secours",
      "Organisation de l'exercice d'évacuation",
      "Débriefing et améliorations",
    ],
    responsibleRole: "QHSE",
    daysAgoCreated: 15,
    dueDaysFromCreation: 30,
  },
  {
    title: "Audit fournisseurs EPI",
    description: "Évaluer les fournisseurs d'EPI actuels et améliorer la qualité des équipements fournis.",
    type: "preventive",
    priority: "low",
    status: "pending",
    source: "observation",
    sourceDescription: "Retours utilisateurs sur la qualité des gants",
    actionSteps: [
      "Collecte des retours utilisateurs",
      "Analyse comparative des fournisseurs",
      "Tests de nouveaux équipements",
      "Négociation et commande",
    ],
    responsibleRole: "QHSE",
    daysAgoCreated: 5,
    dueDaysFromCreation: 60,
  },
];

interface CapaResult {
  id: string;
  reference: string;
  title: string;
  status: string;
  linkedTo: string;
}

/**
 * Seed CAPA actions
 */
export async function seedCapa(
  organizationId: string,
  users: { userId: string; roleName: string; displayName: string }[],
  incidents: IncidentResult[],
  compliance: ComplianceResult
): Promise<CapaResult[]> {
  log("Creating CAPA actions...");

  const results: CapaResult[] = [];
  const timestamp = now();

  // Map roles to users
  const usersByRole: Record<string, { userId: string; displayName: string }> = {};
  for (const user of users) {
    usersByRole[user.roleName] = { userId: user.userId, displayName: user.displayName };
  }

  const qhseUser = usersByRole["QHSE"];

  for (const capaData of CAPA_DATA) {
    const capaRef = db.collection(COLLECTIONS.actionPlans).doc();
    const reference = generateReference("CAPA");

    // Get responsible user
    const responsible = usersByRole[capaData.responsibleRole] || qhseUser;

    // Determine linked entity
    let linkedIncidentId = "";
    let linkedIncidentRef = "";
    let linkedAuditId = "";
    let linkedExposureInfo = "";

    if (capaData.linkedToIncidentIndex !== undefined && incidents[capaData.linkedToIncidentIndex]) {
      const incident = incidents[capaData.linkedToIncidentIndex];
      linkedIncidentId = incident.id;
      linkedIncidentRef = incident.reference;
      linkedExposureInfo = `Incident: ${incident.reference}`;
    }

    if (capaData.linkedToAuditIndex !== undefined && compliance.audits[capaData.linkedToAuditIndex]) {
      const audit = compliance.audits[capaData.linkedToAuditIndex];
      linkedAuditId = audit.id;
      linkedExposureInfo = `Audit: ${audit.title}`;
    }

    if (capaData.linkedToExposure) {
      linkedExposureInfo = `Exposition: ${capaData.linkedToExposure}`;
    }

    if (!linkedExposureInfo) {
      linkedExposureInfo = capaData.sourceDescription;
    }

    // Calculate dates
    const createdAt = toTimestamp(daysAgo(capaData.daysAgoCreated));
    const dueDate = toTimestamp(daysAgo(capaData.daysAgoCreated - capaData.dueDaysFromCreation));

    // Determine progress based on status
    let progress = 0;
    let completedAt = null;

    switch (capaData.status) {
      case "pending":
        progress = 0;
        break;
      case "in_progress":
        progress = 30 + Math.floor(Math.random() * 40); // 30-70%
        break;
      case "completed":
        progress = 100;
        completedAt = toTimestamp(daysAgo(Math.max(0, capaData.daysAgoCreated - capaData.dueDaysFromCreation + 5)));
        break;
      case "overdue":
        progress = 20 + Math.floor(Math.random() * 30); // 20-50%
        break;
    }

    // Create action steps/checklist
    const checklist = capaData.actionSteps.map((step, idx) => {
      const isCompleted = capaData.status === "completed" || 
        (capaData.status === "in_progress" && idx < Math.floor(capaData.actionSteps.length * (progress / 100)));
      
      return {
        id: `step-${capaRef.id}-${idx}`,
        text: step,
        completed: isCompleted,
        completedAt: isCompleted ? toTimestamp(daysAgo(capaData.daysAgoCreated - idx * 3)) : null,
        completedBy: isCompleted ? responsible.userId : null,
      };
    });

    const capa = {
      organizationId,
      reference,
      title: capaData.title,
      description: capaData.description,
      type: capaData.type,
      priority: capaData.priority,
      status: capaData.status,
      source: capaData.source,
      sourceDescription: capaData.sourceDescription,
      linkedIncidentId,
      linkedIncidentRef,
      linkedAuditId,
      linkedFindingId: "",
      responsibleId: responsible.userId,
      responsibleName: responsible.displayName,
      verifierId: qhseUser?.userId || "",
      verifierName: qhseUser?.displayName || "",
      dueDate,
      completedAt,
      verifiedAt: capaData.status === "completed" ? completedAt : null,
      progress,
      checklist,
      rootCauseAnalysis: capaData.type === "corrective" ? {
        method: "5 Pourquoi",
        findings: "Analyse en cours...",
        contributingFactors: ["Facteur humain", "Facteur organisationnel"],
      } : null,
      effectivenessReview: capaData.status === "completed" ? {
        isEffective: true,
        reviewDate: completedAt,
        reviewedBy: qhseUser?.userId || "",
        notes: "Action efficace - Pas de récurrence observée",
      } : null,
      attachments: [],
      comments: [],
      history: [
        {
          action: "created",
          timestamp: createdAt,
          userId: qhseUser?.userId || "",
          userName: qhseUser?.displayName || "",
          details: "Action créée",
        },
      ],
      createdAt,
      updatedAt: timestamp,
      audit: {
        createdBy: qhseUser?.userId || "",
        createdAt,
        updatedBy: qhseUser?.userId || "",
        updatedAt: timestamp,
      },
    };

    await capaRef.set(capa);

    // Update linked incident if applicable
    if (linkedIncidentId) {
      await db.collection(COLLECTIONS.incidents).doc(linkedIncidentId).update({
        linkedCapaIds: [capaRef.id],
        status: capaData.status === "completed" ? "closed" : "action_plan_created",
      });
    }

    results.push({
      id: capaRef.id,
      reference,
      title: capaData.title,
      status: capaData.status,
      linkedTo: linkedExposureInfo,
    });

    log(`Created CAPA: ${reference} - ${capaData.title.substring(0, 40)}...`, "success");
  }

  return results;
}

