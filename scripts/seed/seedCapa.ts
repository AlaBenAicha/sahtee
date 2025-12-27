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

// Priority mapping: our config uses French labels as required by ActionPlan type
type ActionPriority = "critique" | "haute" | "moyenne" | "basse";
type ActionCategory = "correctif" | "preventif";
type ActionStatus = "draft" | "pending_approval" | "approved" | "in_progress" | "blocked" | "completed" | "verified" | "closed";
type SourceType = "incident" | "audit" | "risk_assessment" | "observation" | "ai_suggestion" | "manual";

// CAPA configurations
interface CapaConfig {
  title: string;
  description: string;
  category: ActionCategory;
  priority: ActionPriority;
  status: ActionStatus;
  sourceType: SourceType;
  sourceDescription: string;
  actionSteps: string[];
  responsibleRole: string;
  daysAgoCreated: number;
  dueDaysFromCreation: number;
  linkedToIncidentIndex?: number;
  linkedToAuditIndex?: number;
  linkedToExposure?: string;
}

const CAPA_DATA: CapaConfig[] = [
  // Linked to incidents (4)
  {
    title: "Installation de bacs de rétention zone hydraulique",
    description: "Installer des bacs de rétention sous tous les équipements hydrauliques de la zone de production A pour prévenir les fuites d'huile.",
    category: "correctif",
    priority: "haute",
    status: "completed",
    sourceType: "incident",
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
    category: "correctif",
    priority: "moyenne",
    status: "in_progress",
    sourceType: "incident",
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
    category: "preventif",
    priority: "haute",
    status: "in_progress",
    sourceType: "incident",
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
    category: "preventif",
    priority: "moyenne",
    status: "completed",
    sourceType: "incident",
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
    category: "correctif",
    priority: "haute",
    status: "in_progress",
    sourceType: "audit",
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
    category: "correctif",
    priority: "moyenne",
    status: "completed",
    sourceType: "audit",
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
    category: "preventif",
    priority: "basse",
    status: "approved",
    sourceType: "audit",
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
    category: "preventif",
    priority: "haute",
    status: "in_progress",
    sourceType: "risk_assessment",
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
    category: "correctif",
    priority: "critique",
    status: "in_progress",
    sourceType: "risk_assessment",
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
    category: "preventif",
    priority: "moyenne",
    status: "approved",
    sourceType: "manual",
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
    category: "preventif",
    priority: "moyenne",
    status: "in_progress",
    sourceType: "observation",
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
    category: "preventif",
    priority: "basse",
    status: "approved",
    sourceType: "observation",
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

    // Get assignee user (responsible for the action)
    const assignee = usersByRole[capaData.responsibleRole] || qhseUser;

    // Determine linked entity
    let sourceIncidentId = "";
    let sourceAuditId = "";
    let linkedExposureInfo = "";

    if (capaData.linkedToIncidentIndex !== undefined && incidents[capaData.linkedToIncidentIndex]) {
      const incident = incidents[capaData.linkedToIncidentIndex];
      sourceIncidentId = incident.id;
      linkedExposureInfo = `Incident: ${incident.reference}`;
    }

    if (capaData.linkedToAuditIndex !== undefined && compliance.audits[capaData.linkedToAuditIndex]) {
      const audit = compliance.audits[capaData.linkedToAuditIndex];
      sourceAuditId = audit.id;
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
      case "draft":
      case "pending_approval":
      case "approved":
        progress = 0;
        break;
      case "in_progress":
        progress = 30 + Math.floor(Math.random() * 40); // 30-70%
        break;
      case "completed":
      case "verified":
      case "closed":
        progress = 100;
        completedAt = toTimestamp(daysAgo(Math.max(0, capaData.daysAgoCreated - capaData.dueDaysFromCreation + 5)));
        break;
      case "blocked":
        progress = 20 + Math.floor(Math.random() * 30); // 20-50%
        break;
    }

    // Create checklistItems matching the ChecklistItem interface
    const checklistItems = capaData.actionSteps.map((step, idx) => {
      const isCompleted = capaData.status === "completed" || capaData.status === "verified" || capaData.status === "closed" || 
        (capaData.status === "in_progress" && idx < Math.floor(capaData.actionSteps.length * (progress / 100)));
      
      return {
        id: `step-${capaRef.id}-${idx}`,
        description: step,
        completed: isCompleted,
        completedAt: isCompleted ? toTimestamp(daysAgo(capaData.daysAgoCreated - idx * 3)) : null,
        completedBy: isCompleted ? assignee.userId : undefined,
        order: idx,
      };
    });

    // Build the ActionPlan document matching the interface exactly
    const capa = {
      organizationId,
      
      // Basic info
      reference,
      title: capaData.title,
      description: capaData.description,
      
      // Classification
      category: capaData.category,
      priority: capaData.priority,
      status: capaData.status,
      
      // Assignment (using correct field names from ActionPlan interface)
      assigneeId: assignee.userId,
      assigneeName: assignee.displayName,
      departmentId: "",
      reviewerId: qhseUser?.userId || "",
      
      // Timeline
      dueDate,
      completedAt,
      verifiedAt: (capaData.status === "completed" || capaData.status === "verified") ? completedAt : null,
      
      // Progress
      progress,
      checklistItems,
      
      // Source
      sourceType: capaData.sourceType,
      sourceIncidentId: sourceIncidentId || undefined,
      sourceAuditId: sourceAuditId || undefined,
      sourceFindingId: undefined,
      
      // Linked items (required arrays)
      linkedTrainingIds: [] as string[],
      linkedEquipmentIds: [] as string[],
      linkedDocumentIds: [] as string[],
      
      // AI integration
      aiGenerated: false,
      aiConfidence: 0,
      aiSuggestions: undefined,
      
      // Completion
      completionProof: undefined,
      effectivenessReview: capaData.status === "verified" ? {
        reviewDate: completedAt,
        reviewedBy: qhseUser?.userId || "",
        effective: true,
        notes: "Action efficace - Pas de récurrence observée",
        followUpRequired: false,
      } : undefined,
      
      // Comments (required array)
      comments: [] as Array<{
        id: string;
        userId: string;
        userName: string;
        content: string;
        createdAt: ReturnType<typeof toTimestamp>;
      }>,
      
      // Audit info
      audit: {
        createdBy: qhseUser?.userId || "",
        createdAt,
        updatedBy: qhseUser?.userId || "",
        updatedAt: timestamp,
      },
    };

    await capaRef.set(capa);

    // Update linked incident if applicable
    if (sourceIncidentId) {
      await db.collection(COLLECTIONS.incidents).doc(sourceIncidentId).update({
        linkedCapaIds: [capaRef.id],
        status: capaData.status === "completed" || capaData.status === "verified" ? "closed" : "action_plan_created",
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
