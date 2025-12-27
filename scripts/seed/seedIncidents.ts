/**
 * Seed Incidents with varied types and severities
 */

import { db, COLLECTIONS, LOCATIONS } from "./config";
import {
  now,
  createAuditInfo,
  log,
  generateReference,
  toTimestamp,
  daysAgo,
  randomItem,
} from "./utils";

interface IncidentSeedData {
  title: string;
  description: string;
  type: "accident" | "near_miss" | "unsafe_condition" | "unsafe_act";
  severity: "minor" | "moderate" | "severe" | "critical";
  category: string;
  location: string;
  immediateActions: string;
  daysAgoOccurred: number;
  status: string;
  rootCause?: string;
  hasLinkedCapa: boolean;
}

const INCIDENT_DATA: IncidentSeedData[] = [
  // Accidents (2)
  {
    title: "Chute d'un opérateur lors de la maintenance",
    description:
      "Un opérateur a glissé sur une flaque d'huile lors d'une intervention de maintenance sur la ligne de production A. Il a subi une entorse à la cheville droite nécessitant 5 jours d'arrêt.",
    type: "accident",
    severity: "moderate",
    category: "Chute de plain-pied",
    location: "Zone de Production A",
    immediateActions:
      "Premiers soins administrés sur place. Nettoyage immédiat de la zone. Signalement au responsable SST.",
    daysAgoOccurred: 45,
    status: "closed",
    rootCause: "Fuite d'huile hydraulique non détectée. Absence de bac de rétention.",
    hasLinkedCapa: true,
  },
  {
    title: "Blessure légère lors de manipulation de pièces",
    description:
      "Un employé s'est coupé le doigt en manipulant des pièces métalliques aux bords tranchants. Blessure superficielle traitée par premiers soins.",
    type: "accident",
    severity: "minor",
    category: "Coupure",
    location: "Atelier Mécanique",
    immediateActions: "Application de pansement et désinfection. Rappel du port des gants.",
    daysAgoOccurred: 12,
    status: "resolved",
    rootCause: "Non-port des gants de protection malgré les consignes.",
    hasLinkedCapa: true,
  },

  // Near-misses (3)
  {
    title: "Presqu'accident - Chariot élévateur",
    description:
      "Un chariot élévateur a failli heurter un piéton dans la zone de chargement. Le cariste a freiné à temps. Aucune blessure.",
    type: "near_miss",
    severity: "severe",
    category: "Circulation engins",
    location: "Zone de Chargement",
    immediateActions:
      "Arrêt temporaire des opérations. Briefing sécurité immédiat avec tous les caristes.",
    daysAgoOccurred: 30,
    status: "action_plan_created",
    hasLinkedCapa: true,
  },
  {
    title: "Objet tombé depuis une étagère en hauteur",
    description:
      "Un carton de pièces est tombé depuis le 3ème niveau de rayonnage. Par chance, personne ne se trouvait en dessous à ce moment.",
    type: "near_miss",
    severity: "moderate",
    category: "Chute d'objets",
    location: "Entrepôt Matières Premières",
    immediateActions: "Sécurisation de la zone. Vérification de toutes les étagères du niveau.",
    daysAgoOccurred: 20,
    status: "investigating",
    hasLinkedCapa: false,
  },
  {
    title: "Début d'incendie maîtrisé rapidement",
    description:
      "Un début d'incendie s'est déclaré dans la poubelle de l'atelier électrique suite à un mégot mal éteint. Éteint rapidement avec un extincteur.",
    type: "near_miss",
    severity: "moderate",
    category: "Incendie",
    location: "Atelier Électrique",
    immediateActions:
      "Utilisation de l'extincteur. Évacuation préventive de la zone. Appel pompiers non nécessaire.",
    daysAgoOccurred: 60,
    status: "closed",
    rootCause: "Non-respect de l'interdiction de fumer dans les ateliers.",
    hasLinkedCapa: true,
  },

  // Unsafe conditions (2)
  {
    title: "Éclairage insuffisant zone de passage",
    description:
      "L'éclairage dans le couloir entre l'entrepôt et la zone de production est insuffisant. Plusieurs ampoules grillées non remplacées.",
    type: "unsafe_condition",
    severity: "minor",
    category: "Éclairage",
    location: "Entrepôt Produits Finis",
    immediateActions: "Signalement à la maintenance. Balisage temporaire de la zone.",
    daysAgoOccurred: 5,
    status: "acknowledged",
    hasLinkedCapa: false,
  },
  {
    title: "Câbles électriques au sol non protégés",
    description:
      "Des câbles électriques d'alimentation de machines temporaires traversent une zone de passage sans protection ni signalisation.",
    type: "unsafe_condition",
    severity: "moderate",
    category: "Électrique",
    location: "Zone de Production B",
    immediateActions: "Installation de goulottes provisoires. Signalisation par ruban jaune.",
    daysAgoOccurred: 8,
    status: "action_plan_created",
    hasLinkedCapa: false,
  },

  // Unsafe act (1)
  {
    title: "Opérateur sans EPI en zone chimique",
    description:
      "Un employé a été observé manipulant des produits chimiques sans porter ses gants et lunettes de protection obligatoires.",
    type: "unsafe_act",
    severity: "moderate",
    category: "Non-port EPI",
    location: "Laboratoire Qualité",
    immediateActions:
      "Arrêt immédiat de l'activité. Rappel des consignes. Fourniture d'EPI et supervision du port correct.",
    daysAgoOccurred: 3,
    status: "investigating",
    hasLinkedCapa: false,
  },
];

interface IncidentResult {
  id: string;
  reference: string;
  title: string;
  type: string;
  severity: string;
  hasLinkedCapa: boolean;
  daysAgo: number;
}

/**
 * Seed incidents
 */
export async function seedIncidents(
  organizationId: string,
  users: { userId: string; roleName: string; displayName: string }[],
  departmentIds: Record<string, string>
): Promise<IncidentResult[]> {
  log("Creating incidents...");

  const results: IncidentResult[] = [];
  const timestamp = now();

  // Get users by role for assignment
  const qhseUser = users.find((u) => u.roleName === "QHSE");
  const chefUser = users.find((u) => u.roleName === "Chef de département");
  const employeUser = users.find((u) => u.roleName === "Employé");

  const reporters = [qhseUser, chefUser, employeUser].filter(Boolean);

  for (const data of INCIDENT_DATA) {
    const incidentRef = db.collection(COLLECTIONS.incidents).doc();
    const reference = generateReference("INC");
    const reporter = randomItem(reporters)!;
    const occurredAt = toTimestamp(daysAgo(data.daysAgoOccurred));

    const incident = {
      organizationId,
      reference,
      reportedBy: reporter.userId,
      reporterName: reporter.displayName,
      reporterEmail: "",
      reportedAt: occurredAt,
      isAnonymous: false,
      siteId: "",
      departmentId: departmentIds["Production"] || "",
      location: data.location,
      category: data.category,
      severity: data.severity,
      type: data.type,
      description: data.description,
      immediateActions: data.immediateActions,
      witnesses: [],
      affectedPersons:
        data.type === "accident"
          ? [
              {
                id: `affected-${incidentRef.id}`,
                name: employeUser?.displayName || "Employé",
                employeeId: employeUser?.userId,
                type: "employee",
                injuryType: data.severity === "minor" ? "Coupure légère" : "Entorse",
                injurySeverity: data.severity === "minor" ? "first_aid" : "medical_treatment",
                daysLost: data.severity === "moderate" ? 5 : 0,
              },
            ]
          : [],
      photos: [],
      documents: [],
      status: data.status,
      investigatorId: qhseUser?.userId,
      rootCause: data.rootCause || "",
      contributingFactors: data.rootCause
        ? ["Facteur humain", "Facteur organisationnel"]
        : [],
      linkedCapaIds: [],
      reportableToAuthorities: data.severity === "severe" || data.severity === "critical",
      reportedToAuthorities: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(reporter.userId),
    };

    await incidentRef.set(incident);

    results.push({
      id: incidentRef.id,
      reference,
      title: data.title,
      type: data.type,
      severity: data.severity,
      hasLinkedCapa: data.hasLinkedCapa,
      daysAgo: data.daysAgoOccurred,
    });

    log(`Created incident: ${reference} - ${data.title.substring(0, 40)}...`, "success");
  }

  return results;
}

