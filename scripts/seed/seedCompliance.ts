/**
 * Seed Compliance Norms and Audits
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
} from "./utils";

// Norm Seed Data (copied from src/utils/normSeedData.ts to avoid import path issues)
interface NormRequirement {
  id: string;
  clause: string;
  title: string;
  description: string;
  status: "pending_review" | "compliant" | "partially_compliant" | "non_compliant" | "not_applicable";
  evidenceRequired: boolean;
  evidence: never[];
  notes: string;
  linkedCapaIds: string[];
}

function createRequirement(
  clause: string,
  title: string,
  description: string
): NormRequirement {
  return {
    id: generateId(),
    clause,
    title,
    description,
    status: "pending_review",
    evidenceRequired: true,
    evidence: [],
    notes: "",
    linkedCapaIds: [],
  };
}

// ISO 45001 Requirements (key clauses)
const ISO_45001_REQUIREMENTS: NormRequirement[] = [
  createRequirement("4.1", "Compréhension de l'organisme et de son contexte", "L'organisme doit déterminer les enjeux externes et internes pertinents pour la SST."),
  createRequirement("5.1", "Leadership et engagement", "La direction doit démontrer son leadership vis-à-vis du système de management de la SST."),
  createRequirement("5.2", "Politique de SST", "La direction doit établir et tenir à jour une politique de SST."),
  createRequirement("6.1.2", "Identification des dangers", "L'organisme doit établir des processus d'identification des dangers de façon continue et proactive."),
  createRequirement("6.1.3", "Exigences légales", "L'organisme doit déterminer et avoir accès aux exigences légales applicables."),
  createRequirement("7.2", "Compétences", "L'organisme doit déterminer les compétences nécessaires des travailleurs."),
  createRequirement("8.1", "Maîtrise opérationnelle", "L'organisme doit planifier et maîtriser les processus nécessaires au SMS."),
  createRequirement("8.2", "Préparation aux urgences", "L'organisme doit établir des processus de préparation aux situations d'urgence."),
  createRequirement("9.2", "Audit interne", "L'organisme doit réaliser des audits internes à des intervalles planifiés."),
  createRequirement("10.2", "Non-conformité et action corrective", "L'organisme doit établir des processus de gestion des non-conformités."),
];

// ISO 14001 Requirements
const ISO_14001_REQUIREMENTS: NormRequirement[] = [
  createRequirement("4.1", "Contexte de l'organisme", "Déterminer les enjeux externes et internes pertinents pour le SME."),
  createRequirement("5.2", "Politique environnementale", "Établir une politique environnementale appropriée."),
  createRequirement("6.1.2", "Aspects environnementaux", "Déterminer les aspects environnementaux significatifs."),
  createRequirement("6.1.3", "Obligations de conformité", "Déterminer les obligations de conformité environnementale."),
  createRequirement("8.1", "Maîtrise opérationnelle", "Établir les processus de maîtrise opérationnelle environnementale."),
  createRequirement("9.1.2", "Évaluation de conformité", "Évaluer le respect des obligations de conformité."),
];

// Tunisian Labor Code Requirements
const TUNISIAN_LABOR_REQUIREMENTS: NormRequirement[] = [
  createRequirement("Art. 152", "Obligation générale de sécurité", "L'employeur doit assurer la sécurité et protéger la santé des travailleurs."),
  createRequirement("Art. 154", "Formation à la sécurité", "L'employeur doit organiser une formation à la sécurité."),
  createRequirement("Art. 155", "EPI", "L'employeur doit fournir gratuitement les EPI appropriés."),
  createRequirement("Art. 156", "Médecine du travail", "L'employeur doit organiser un service de médecine du travail."),
  createRequirement("Art. 157", "Comité SST", "Un comité SST doit être constitué (+50 salariés)."),
  createRequirement("Art. 158", "Déclaration AT", "Tout accident du travail doit être déclaré sous 48h."),
];

// CNAM Requirements
const CNAM_REQUIREMENTS: NormRequirement[] = [
  createRequirement("CNAM-01", "Affiliation", "Déclaration des salariés et paiement des cotisations."),
  createRequirement("CNAM-02", "Déclaration AT", "Déclaration des accidents du travail sous 48h."),
  createRequirement("CNAM-03", "Maladies professionnelles", "Déclaration des maladies professionnelles."),
  createRequirement("CNAM-04", "Suivi médical", "Organisation des visites médicales."),
];

// Norm configurations
const NORM_SEEDS = [
  {
    code: "ISO 45001:2018",
    name: "Systèmes de management de la santé et de la sécurité au travail",
    description: "Norme internationale spécifiant les exigences pour un système de management de la SST.",
    framework: "iso_45001",
    category: "Management SST",
    requirements: ISO_45001_REQUIREMENTS,
    status: "in_progress" as const,
    complianceScore: 45,
  },
  {
    code: "ISO 14001:2015",
    name: "Systèmes de management environnemental",
    description: "Norme internationale pour un système de management environnemental.",
    framework: "iso_14001",
    category: "Management Environnemental",
    requirements: ISO_14001_REQUIREMENTS,
    status: "not_started" as const,
    complianceScore: 0,
  },
  {
    code: "Code du Travail Tunisien",
    name: "Dispositions relatives à la santé et sécurité au travail",
    description: "Exigences légales tunisiennes en matière de SST.",
    framework: "tunisian_labor",
    category: "Réglementation Nationale",
    requirements: TUNISIAN_LABOR_REQUIREMENTS,
    status: "in_progress" as const,
    complianceScore: 70,
  },
  {
    code: "CNAM",
    name: "Exigences CNAM - Accidents du travail et maladies professionnelles",
    description: "Obligations relatives à la déclaration et au suivi des AT/MP.",
    framework: "cnam",
    category: "Assurance Maladie",
    requirements: CNAM_REQUIREMENTS,
    status: "in_progress" as const,
    complianceScore: 85,
  },
];

// Audit configurations
const AUDIT_DATA = [
  {
    type: "internal" as const,
    title: "Audit interne ISO 45001 - T4 2024",
    description: "Audit interne de conformité au référentiel ISO 45001:2018 pour le 4ème trimestre.",
    scope: "Système de management SST complet - tous les processus",
    normCode: "ISO 45001:2018",
    status: "completed" as const,
    daysAgoScheduled: 60,
    daysAgoCompleted: 45,
    findings: [
      {
        category: "non_conformity",
        severity: "major",
        title: "Absence de processus documenté pour l'évaluation des risques",
        description: "L'évaluation des risques est réalisée mais sans processus formel documenté conforme au §6.1.2.",
        clause: "6.1.2",
        requiresAction: true,
      },
      {
        category: "non_conformity",
        severity: "minor",
        title: "Registre des formations incomplet",
        description: "Le registre des formations ne contient pas les dates de validité pour certaines formations.",
        clause: "7.2",
        requiresAction: true,
      },
      {
        category: "observation",
        severity: "minor",
        title: "Amélioration possible du suivi des actions correctives",
        description: "Le suivi des actions correctives pourrait être optimisé avec des indicateurs de délai.",
        clause: "10.2",
        requiresAction: false,
      },
    ] as Array<{
      category: "non_conformity" | "observation" | "improvement_opportunity";
      severity: "major" | "minor";
      title: string;
      description: string;
      clause: string;
      requiresAction: boolean;
    }>,
  },
  {
    type: "external" as const,
    title: "Audit de surveillance CNAM",
    description: "Audit de surveillance annuel par la CNAM sur le respect des obligations AT/MP.",
    scope: "Déclarations AT/MP, suivi médical, registres",
    normCode: "CNAM",
    status: "in_progress" as const,
    daysAgoScheduled: 10,
    daysAgoCompleted: null,
    findings: [],
  },
  {
    type: "internal" as const,
    title: "Audit interne Code du Travail - Q1 2025",
    description: "Audit interne de conformité aux exigences du Code du Travail tunisien.",
    scope: "Exigences légales SST - Articles 152 à 161",
    normCode: "Code du Travail Tunisien",
    status: "planned" as const,
    daysAgoScheduled: -30, // 30 days in the future
    daysAgoCompleted: null,
    findings: [],
  },
];

interface NormResult {
  id: string;
  code: string;
  requirementCount: number;
}

interface AuditResult {
  id: string;
  title: string;
  type: string;
  status: string;
  findingCount: number;
  hasLinkedCapa: boolean;
}

export interface ComplianceResult {
  norms: NormResult[];
  audits: AuditResult[];
}

/**
 * Seed compliance norms
 */
async function seedNorms(
  organizationId: string,
  creatorId: string
): Promise<NormResult[]> {
  log("Creating compliance norms...");
  const results: NormResult[] = [];
  const timestamp = now();

  for (const normData of NORM_SEEDS) {
    const normRef = db.collection(COLLECTIONS.norms).doc();

    // Update requirement statuses based on compliance score
    const requirements = normData.requirements.map((req, idx) => {
      let status = req.status;
      const rand = Math.random() * 100;
      if (rand < normData.complianceScore) {
        status = "compliant";
      } else if (rand < normData.complianceScore + 20) {
        status = "partially_compliant";
      }
      return { ...req, status };
    });

    const norm = {
      organizationId,
      code: normData.code,
      name: normData.name,
      description: normData.description,
      framework: normData.framework,
      category: normData.category,
      status: normData.status,
      complianceScore: normData.complianceScore,
      requirements,
      requirementIds: requirements.map((r) => r.id),
      isActive: true,
      isCustom: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(creatorId),
    };

    await normRef.set(norm);

    results.push({
      id: normRef.id,
      code: normData.code,
      requirementCount: requirements.length,
    });

    log(`Created norm: ${normData.code} (${requirements.length} requirements)`, "success");
  }

  return results;
}

/**
 * Seed audits with findings
 */
async function seedAudits(
  organizationId: string,
  norms: NormResult[],
  users: { userId: string; roleName: string; displayName: string }[]
): Promise<AuditResult[]> {
  log("Creating audits...");
  const results: AuditResult[] = [];
  const timestamp = now();

  const qhseUser = users.find((u) => u.roleName === "QHSE");
  const adminUser = users.find((u) => u.roleName === "Org Admin");

  for (const auditData of AUDIT_DATA) {
    const auditRef = db.collection(COLLECTIONS.audits).doc();
    const norm = norms.find((n) => n.code === auditData.normCode);

    const scheduledDate = auditData.daysAgoScheduled >= 0
      ? toTimestamp(daysAgo(auditData.daysAgoScheduled))
      : toTimestamp(daysFromNow(Math.abs(auditData.daysAgoScheduled)));

    const completedDate = auditData.daysAgoCompleted
      ? toTimestamp(daysAgo(auditData.daysAgoCompleted))
      : null;

    const findings = auditData.findings.map((f, idx) => ({
      id: `finding-${auditRef.id}-${idx}`,
      ...f,
      status: f.requiresAction ? "open" : "closed",
      linkedCapaIds: [],
      createdAt: completedDate || timestamp,
    }));

    const leadAuditor = auditData.type === "external" 
      ? { name: "Mohamed Ben Salem", organization: "CNAM", email: "audit@cnam.tn" }
      : { name: qhseUser?.displayName || "Auditeur Interne", organization: "TechManuf Tunisie", email: "qhse@techmanuf.tn" };

    const audit = {
      organizationId,
      type: auditData.type,
      title: auditData.title,
      description: auditData.description,
      scope: auditData.scope,
      normId: norm?.id || "",
      normCode: auditData.normCode,
      status: auditData.status,
      scheduledDate,
      completedDate,
      leadAuditor,
      auditTeam: auditData.type === "internal" ? [qhseUser?.displayName || ""] : [],
      findings,
      findingsSummary: {
        total: findings.length,
        majorNonConformities: findings.filter((f) => f.severity === "major" && f.category === "non_conformity").length,
        minorNonConformities: findings.filter((f) => f.severity === "minor" && f.category === "non_conformity").length,
        observations: findings.filter((f) => f.category === "observation").length,
        opportunities: findings.filter((f) => f.category === "improvement_opportunity").length,
      },
      linkedCapaIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      audit: createAuditInfo(qhseUser?.userId || adminUser?.userId || ""),
    };

    await auditRef.set(audit);

    results.push({
      id: auditRef.id,
      title: auditData.title,
      type: auditData.type,
      status: auditData.status,
      findingCount: findings.length,
      hasLinkedCapa: findings.some((f) => f.requiresAction),
    });

    log(`Created audit: ${auditData.title} (${findings.length} findings)`, "success");
  }

  return results;
}

/**
 * Seed all compliance data
 */
export async function seedCompliance(
  organizationId: string,
  users: { userId: string; roleName: string; displayName: string }[]
): Promise<ComplianceResult> {
  const qhseUser = users.find((u) => u.roleName === "QHSE");
  const creatorId = qhseUser?.userId || users[0].userId;

  const norms = await seedNorms(organizationId, creatorId);
  const audits = await seedAudits(organizationId, norms, users);

  return { norms, audits };
}

