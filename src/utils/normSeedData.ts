/**
 * Norm Seed Data
 * 
 * Pre-configured regulatory frameworks and requirements for seeding
 * new organizations with common HSE standards.
 */

import type { NormWithRequirements, NormRequirement, RegulatoryFramework, NormStatus } from "@/types/conformity";

/**
 * Generate a unique ID for requirements
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a requirement with default values
 */
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

// =============================================================================
// ISO 45001:2018 - Occupational Health and Safety Management Systems
// =============================================================================

export const ISO_45001_REQUIREMENTS: NormRequirement[] = [
  // Clause 4: Context of the organization
  createRequirement(
    "4.1",
    "Compréhension de l'organisme et de son contexte",
    "L'organisme doit déterminer les enjeux externes et internes qui sont pertinents par rapport à sa finalité et qui influent sur sa capacité à atteindre les résultats attendus de son système de management de la SST."
  ),
  createRequirement(
    "4.2",
    "Compréhension des besoins et attentes des travailleurs et autres parties intéressées",
    "L'organisme doit déterminer les autres parties intéressées, outre les travailleurs, qui sont pertinentes pour le système de management de la SST."
  ),
  createRequirement(
    "4.3",
    "Détermination du domaine d'application du système de management de la SST",
    "L'organisme doit déterminer les limites et l'applicabilité du système de management de la SST afin d'établir son domaine d'application."
  ),
  createRequirement(
    "4.4",
    "Système de management de la SST",
    "L'organisme doit établir, mettre en œuvre, tenir à jour et améliorer en continu un système de management de la SST."
  ),

  // Clause 5: Leadership and worker participation
  createRequirement(
    "5.1",
    "Leadership et engagement",
    "La direction doit démontrer son leadership et son engagement vis-à-vis du système de management de la SST."
  ),
  createRequirement(
    "5.2",
    "Politique de SST",
    "La direction doit établir, mettre en œuvre et tenir à jour une politique de SST."
  ),
  createRequirement(
    "5.3",
    "Rôles, responsabilités et autorités au sein de l'organisme",
    "La direction doit s'assurer que les responsabilités et autorités des rôles pertinents au sein du système de management de la SST sont attribuées et communiquées."
  ),
  createRequirement(
    "5.4",
    "Consultation et participation des travailleurs",
    "L'organisme doit établir, mettre en œuvre et tenir à jour des processus de consultation et de participation des travailleurs."
  ),

  // Clause 6: Planning
  createRequirement(
    "6.1.1",
    "Généralités - Actions face aux risques et opportunités",
    "L'organisme doit prendre en compte les enjeux, les exigences et déterminer les risques et opportunités à traiter."
  ),
  createRequirement(
    "6.1.2",
    "Identification des dangers et évaluation des risques et opportunités",
    "L'organisme doit établir, mettre en œuvre et tenir à jour des processus d'identification des dangers de façon continue et proactive."
  ),
  createRequirement(
    "6.1.3",
    "Détermination des exigences légales et autres exigences",
    "L'organisme doit établir, mettre en œuvre et tenir à jour des processus pour déterminer et avoir accès aux exigences légales et autres exigences applicables."
  ),
  createRequirement(
    "6.1.4",
    "Planification des actions",
    "L'organisme doit planifier des actions pour traiter ces risques et opportunités, les exigences légales et autres exigences."
  ),
  createRequirement(
    "6.2",
    "Objectifs de SST et planification pour les atteindre",
    "L'organisme doit établir des objectifs de SST aux fonctions et niveaux pertinents pour tenir à jour et améliorer en continu le système de management de la SST."
  ),

  // Clause 7: Support
  createRequirement(
    "7.1",
    "Ressources",
    "L'organisme doit déterminer et fournir les ressources nécessaires à l'établissement, la mise en œuvre, la tenue à jour et l'amélioration continue du système de management de la SST."
  ),
  createRequirement(
    "7.2",
    "Compétences",
    "L'organisme doit déterminer les compétences nécessaires des travailleurs qui ont, ou peuvent avoir, une incidence sur les performances en matière de SST."
  ),
  createRequirement(
    "7.3",
    "Sensibilisation",
    "Les travailleurs doivent être sensibilisés à la politique de SST et aux objectifs de SST pertinents."
  ),
  createRequirement(
    "7.4",
    "Communication",
    "L'organisme doit établir, mettre en œuvre et tenir à jour les processus nécessaires aux communications internes et externes pertinentes pour le système de management de la SST."
  ),
  createRequirement(
    "7.5",
    "Informations documentées",
    "Le système de management de la SST de l'organisme doit inclure les informations documentées exigées par le présent document."
  ),

  // Clause 8: Operation
  createRequirement(
    "8.1",
    "Planification et maîtrise opérationnelles",
    "L'organisme doit planifier, mettre en œuvre, maîtriser et tenir à jour les processus nécessaires pour satisfaire aux exigences du système de management de la SST."
  ),
  createRequirement(
    "8.1.2",
    "Élimination des dangers et réduction des risques pour la SST",
    "L'organisme doit établir, mettre en œuvre et tenir à jour des processus pour l'élimination des dangers et la réduction des risques pour la SST."
  ),
  createRequirement(
    "8.1.3",
    "Pilotage du changement",
    "L'organisme doit établir des processus pour la mise en œuvre et la maîtrise de changements temporaires et permanents planifiés."
  ),
  createRequirement(
    "8.1.4",
    "Achats",
    "L'organisme doit établir, mettre en œuvre et tenir à jour des processus pour maîtriser l'achat de produits et services."
  ),
  createRequirement(
    "8.2",
    "Préparation et réponse aux situations d'urgence",
    "L'organisme doit établir, mettre en œuvre et tenir à jour les processus nécessaires pour se préparer aux situations d'urgence potentielles et y répondre."
  ),

  // Clause 9: Performance evaluation
  createRequirement(
    "9.1.1",
    "Surveillance, mesure, analyse et évaluation des performances - Généralités",
    "L'organisme doit établir, mettre en œuvre et tenir à jour des processus de surveillance, de mesure, d'analyse et d'évaluation des performances."
  ),
  createRequirement(
    "9.1.2",
    "Évaluation de la conformité",
    "L'organisme doit établir, mettre en œuvre et tenir à jour des processus pour évaluer la conformité aux exigences légales et autres exigences."
  ),
  createRequirement(
    "9.2",
    "Audit interne",
    "L'organisme doit réaliser des audits internes à des intervalles planifiés pour fournir des informations permettant de déterminer si le système de management de la SST est conforme."
  ),
  createRequirement(
    "9.3",
    "Revue de direction",
    "La direction doit, à des intervalles planifiés, procéder à la revue du système de management de la SST de l'organisme."
  ),

  // Clause 10: Improvement
  createRequirement(
    "10.1",
    "Généralités - Amélioration",
    "L'organisme doit déterminer les opportunités d'amélioration et mettre en œuvre les actions nécessaires pour atteindre les résultats attendus de son système de management de la SST."
  ),
  createRequirement(
    "10.2",
    "Événement indésirable, non-conformité et action corrective",
    "L'organisme doit établir, mettre en œuvre et tenir à jour des processus, incluant le compte-rendu, les investigations et les actions à prendre."
  ),
  createRequirement(
    "10.3",
    "Amélioration continue",
    "L'organisme doit améliorer en continu la pertinence, l'adéquation et l'efficacité du système de management de la SST."
  ),
];

export const ISO_45001_SEED: Omit<NormWithRequirements, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId"> = {
  code: "ISO 45001:2018",
  name: "Systèmes de management de la santé et de la sécurité au travail",
  description: "Norme internationale spécifiant les exigences pour un système de management de la santé et de la sécurité au travail (SST), avec des lignes directrices pour son utilisation.",
  framework: "iso_45001",
  category: "Management SST",
  status: "not_started",
  complianceScore: 0,
  requirementIds: [],
  requirements: ISO_45001_REQUIREMENTS,
  isActive: true,
  isCustom: false,
};

// =============================================================================
// ISO 14001:2015 - Environmental Management Systems
// =============================================================================

export const ISO_14001_REQUIREMENTS: NormRequirement[] = [
  createRequirement(
    "4.1",
    "Compréhension de l'organisme et de son contexte",
    "L'organisme doit déterminer les enjeux externes et internes pertinents par rapport à sa finalité et qui influent sur sa capacité à atteindre les résultats attendus de son SME."
  ),
  createRequirement(
    "4.2",
    "Compréhension des besoins et attentes des parties intéressées",
    "L'organisme doit déterminer les parties intéressées pertinentes pour le SME et les exigences pertinentes de ces parties intéressées."
  ),
  createRequirement(
    "4.3",
    "Détermination du domaine d'application du SME",
    "L'organisme doit déterminer les limites et l'applicabilité du système de management environnemental."
  ),
  createRequirement(
    "5.1",
    "Leadership et engagement",
    "La direction doit démontrer son leadership et son engagement vis-à-vis du système de management environnemental."
  ),
  createRequirement(
    "5.2",
    "Politique environnementale",
    "La direction doit établir, mettre en œuvre et tenir à jour une politique environnementale appropriée à la finalité et au contexte de l'organisme."
  ),
  createRequirement(
    "6.1.2",
    "Aspects environnementaux",
    "L'organisme doit déterminer les aspects environnementaux de ses activités, produits et services qu'il a les moyens de maîtriser."
  ),
  createRequirement(
    "6.1.3",
    "Obligations de conformité",
    "L'organisme doit déterminer les obligations de conformité liées à ses aspects environnementaux et avoir accès à ces obligations."
  ),
  createRequirement(
    "6.2",
    "Objectifs environnementaux et planification",
    "L'organisme doit établir des objectifs environnementaux aux fonctions et niveaux concernés."
  ),
  createRequirement(
    "7.2",
    "Compétences",
    "L'organisme doit déterminer les compétences nécessaires de la ou des personnes effectuant un travail qui a une incidence sur les performances environnementales."
  ),
  createRequirement(
    "8.1",
    "Planification et maîtrise opérationnelles",
    "L'organisme doit établir, mettre en œuvre, maîtriser et tenir à jour les processus nécessaires pour satisfaire aux exigences du SME."
  ),
  createRequirement(
    "8.2",
    "Préparation et réponse aux situations d'urgence",
    "L'organisme doit établir, mettre en œuvre et tenir à jour les processus nécessaires pour se préparer aux situations d'urgence potentielles."
  ),
  createRequirement(
    "9.1.2",
    "Évaluation de la conformité",
    "L'organisme doit établir, mettre en œuvre et tenir à jour les processus nécessaires pour évaluer le respect de ses obligations de conformité."
  ),
  createRequirement(
    "9.2",
    "Audit interne",
    "L'organisme doit réaliser des audits internes à des intervalles planifiés."
  ),
  createRequirement(
    "10.2",
    "Non-conformité et action corrective",
    "Lorsqu'une non-conformité se produit, l'organisme doit réagir à la non-conformité et prendre des mesures pour la maîtriser et la corriger."
  ),
];

export const ISO_14001_SEED: Omit<NormWithRequirements, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId"> = {
  code: "ISO 14001:2015",
  name: "Systèmes de management environnemental",
  description: "Norme internationale spécifiant les exigences relatives à un système de management environnemental pouvant être utilisé par un organisme pour améliorer sa performance environnementale.",
  framework: "iso_14001",
  category: "Management Environnemental",
  status: "not_started",
  complianceScore: 0,
  requirementIds: [],
  requirements: ISO_14001_REQUIREMENTS,
  isActive: true,
  isCustom: false,
};

// =============================================================================
// Tunisian Labor Code - Key SST Requirements
// =============================================================================

export const TUNISIAN_LABOR_REQUIREMENTS: NormRequirement[] = [
  createRequirement(
    "Art. 152",
    "Obligation générale de sécurité",
    "L'employeur est tenu de prendre les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs."
  ),
  createRequirement(
    "Art. 153",
    "Évaluation des risques",
    "L'employeur doit évaluer les risques pour la santé et la sécurité des travailleurs et mettre en œuvre des mesures de prévention."
  ),
  createRequirement(
    "Art. 154",
    "Formation à la sécurité",
    "L'employeur doit organiser une formation pratique et appropriée à la sécurité au bénéfice des travailleurs."
  ),
  createRequirement(
    "Art. 155",
    "Équipements de protection individuelle",
    "L'employeur doit fournir gratuitement aux travailleurs les équipements de protection individuelle appropriés."
  ),
  createRequirement(
    "Art. 156",
    "Médecine du travail",
    "L'employeur doit organiser un service de médecine du travail pour assurer la surveillance médicale des travailleurs."
  ),
  createRequirement(
    "Art. 157",
    "Comité de santé et sécurité",
    "Un comité de santé et de sécurité au travail doit être constitué dans les établissements employant plus de 50 salariés."
  ),
  createRequirement(
    "Art. 158",
    "Déclaration des accidents du travail",
    "Tout accident du travail doit être déclaré à l'inspection du travail dans les 48 heures."
  ),
  createRequirement(
    "Art. 159",
    "Registre de sécurité",
    "L'employeur doit tenir un registre de sécurité consignant les observations et mises en demeure de l'inspection du travail."
  ),
  createRequirement(
    "Art. 160",
    "Affichage des consignes",
    "Les consignes de sécurité et les numéros d'urgence doivent être affichés dans l'établissement."
  ),
  createRequirement(
    "Art. 161",
    "Plan d'évacuation",
    "Un plan d'évacuation doit être établi et des exercices d'évacuation réalisés périodiquement."
  ),
];

export const TUNISIAN_LABOR_SEED: Omit<NormWithRequirements, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId"> = {
  code: "Code du Travail Tunisien",
  name: "Dispositions relatives à la santé et sécurité au travail",
  description: "Exigences légales tunisiennes en matière de santé et de sécurité au travail issues du Code du Travail.",
  framework: "tunisian_labor",
  category: "Réglementation Nationale",
  status: "not_started",
  complianceScore: 0,
  requirementIds: [],
  requirements: TUNISIAN_LABOR_REQUIREMENTS,
  isActive: true,
  isCustom: false,
};

// =============================================================================
// CNAM - Caisse Nationale d'Assurance Maladie Requirements
// =============================================================================

export const CNAM_REQUIREMENTS: NormRequirement[] = [
  createRequirement(
    "CNAM-01",
    "Affiliation et déclaration",
    "Déclaration des salariés auprès de la CNAM et paiement des cotisations sociales."
  ),
  createRequirement(
    "CNAM-02",
    "Déclaration des accidents du travail",
    "Déclaration de tout accident du travail dans les délais réglementaires (48h)."
  ),
  createRequirement(
    "CNAM-03",
    "Déclaration des maladies professionnelles",
    "Déclaration des maladies professionnelles reconnues selon le tableau des maladies professionnelles."
  ),
  createRequirement(
    "CNAM-04",
    "Suivi médical des salariés",
    "Organisation des visites médicales d'embauche, périodiques et de reprise."
  ),
  createRequirement(
    "CNAM-05",
    "Registre des accidents",
    "Tenue d'un registre des accidents du travail et incidents."
  ),
  createRequirement(
    "CNAM-06",
    "Statistiques AT/MP",
    "Production des statistiques annuelles d'accidents du travail et maladies professionnelles."
  ),
];

export const CNAM_SEED: Omit<NormWithRequirements, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId"> = {
  code: "CNAM",
  name: "Exigences CNAM - Accidents du travail et maladies professionnelles",
  description: "Obligations relatives à la déclaration et au suivi des accidents du travail et maladies professionnelles auprès de la CNAM.",
  framework: "cnam",
  category: "Assurance Maladie",
  status: "not_started",
  complianceScore: 0,
  requirementIds: [],
  requirements: CNAM_REQUIREMENTS,
  isActive: true,
  isCustom: false,
};

// =============================================================================
// All Seed Data
// =============================================================================

export const ALL_NORM_SEEDS = [
  ISO_45001_SEED,
  ISO_14001_SEED,
  TUNISIAN_LABOR_SEED,
  CNAM_SEED,
];

/**
 * Get seed data for a specific framework
 */
export function getNormSeedByFramework(
  framework: RegulatoryFramework
): Omit<NormWithRequirements, "id" | "createdAt" | "updatedAt" | "audit" | "organizationId"> | null {
  switch (framework) {
    case "iso_45001":
      return ISO_45001_SEED;
    case "iso_14001":
      return ISO_14001_SEED;
    case "tunisian_labor":
      return TUNISIAN_LABOR_SEED;
    case "cnam":
      return CNAM_SEED;
    default:
      return null;
  }
}

/**
 * Get all available seed frameworks
 */
export function getAvailableSeedFrameworks(): Array<{
  framework: RegulatoryFramework;
  code: string;
  name: string;
  requirementCount: number;
}> {
  return [
    {
      framework: "iso_45001",
      code: ISO_45001_SEED.code,
      name: ISO_45001_SEED.name,
      requirementCount: ISO_45001_REQUIREMENTS.length,
    },
    {
      framework: "iso_14001",
      code: ISO_14001_SEED.code,
      name: ISO_14001_SEED.name,
      requirementCount: ISO_14001_REQUIREMENTS.length,
    },
    {
      framework: "tunisian_labor",
      code: TUNISIAN_LABOR_SEED.code,
      name: TUNISIAN_LABOR_SEED.name,
      requirementCount: TUNISIAN_LABOR_REQUIREMENTS.length,
    },
    {
      framework: "cnam",
      code: CNAM_SEED.code,
      name: CNAM_SEED.name,
      requirementCount: CNAM_REQUIREMENTS.length,
    },
  ];
}

