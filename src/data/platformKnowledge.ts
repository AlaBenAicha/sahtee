/**
 * Platform Knowledge Base
 * Contains information about SAHTEE modules, features, and common workflows
 * Used by SafetyBot for navigation assistance
 */

import type { PlatformKnowledgeItem, FAQItem, QuickSuggestion } from "@/types/safetybot";

/**
 * Platform modules and their features
 */
export const PLATFORM_MODULES: PlatformKnowledgeItem[] = [
  {
    id: "dashboard",
    path: "/app/dashboard",
    name: "360° Board",
    nameFr: "Tableau de bord",
    description: "Vue d'ensemble des KPIs SST et cartographie des risques de l'organisation",
    features: [
      "Bandeau KPI avec indicateurs clés",
      "Cartographie des risques interactive",
      "Graphiques de tendances (Lead/Lag)",
      "Flux d'alertes en temps réel",
      "Actions rapides",
    ],
    actions: [
      { id: "view_kpis", label: "Consulter les KPIs", description: "Voir les indicateurs de performance" },
      { id: "view_risks", label: "Analyser les risques", description: "Consulter la cartographie des risques" },
      { id: "view_alerts", label: "Voir les alertes", description: "Consulter les alertes actives" },
    ],
    keywords: ["dashboard", "tableau de bord", "kpi", "indicateurs", "risques", "cartographie"],
  },
  {
    id: "incidents",
    path: "/app/incidents",
    name: "Incidents",
    nameFr: "Incidents",
    description: "Déclaration et suivi des incidents, quasi-accidents et situations dangereuses",
    features: [
      "Formulaire de déclaration d'incident",
      "Liste des incidents avec filtres",
      "Détail et suivi des incidents",
      "Génération de QR codes pour déclaration rapide",
      "Création automatique de CAPA",
    ],
    actions: [
      { id: "create_incident", label: "Déclarer un incident", description: "Créer une nouvelle déclaration" },
      { id: "view_incidents", label: "Voir les incidents", description: "Consulter la liste des incidents" },
      { id: "generate_qr", label: "Générer un QR code", description: "Créer un QR code pour déclaration mobile" },
    ],
    keywords: ["incident", "accident", "quasi-accident", "déclaration", "signalement", "danger"],
  },
  {
    id: "capa",
    path: "/app/capa",
    name: "CAPA Room",
    nameFr: "Plans d'actions",
    description: "Gestion des actions correctives et préventives avec vue Kanban",
    features: [
      "Vue Kanban des CAPA",
      "Vue liste avec filtres avancés",
      "Statuts et tuiles récapitulatives",
      "CAPA-AI pour suggestions et priorisation",
      "Suivi de progression et échéances",
    ],
    actions: [
      { id: "create_capa", label: "Créer une CAPA", description: "Nouvelle action corrective/préventive" },
      { id: "view_kanban", label: "Vue Kanban", description: "Gérer les CAPA en mode Kanban" },
      { id: "view_urgent", label: "CAPA urgentes", description: "Voir les actions prioritaires" },
      { id: "use_ai", label: "Utiliser CAPA-AI", description: "Suggestions IA pour priorisation" },
    ],
    keywords: ["capa", "action", "correctif", "préventif", "plan", "kanban", "priorité"],
  },
  {
    id: "training",
    path: "/app/training",
    name: "Formations",
    nameFr: "Formations",
    description: "Catalogue de formations SST et suivi des certifications",
    features: [
      "Catalogue des formations disponibles",
      "Suivi de progression par employé",
      "Gestion des certifications",
      "Rappels d'échéance",
      "Formations recommandées par l'IA",
    ],
    actions: [
      { id: "view_catalog", label: "Voir le catalogue", description: "Explorer les formations disponibles" },
      { id: "track_progress", label: "Suivi des progrès", description: "Voir la progression des formations" },
      { id: "assign_training", label: "Assigner une formation", description: "Inscrire des employés" },
    ],
    keywords: ["formation", "training", "certification", "apprentissage", "cours", "module"],
  },
  {
    id: "compliance",
    path: "/app/compliance",
    name: "Conformity Room",
    nameFr: "Conformité",
    description: "Gestion de la conformité réglementaire, normes et audits",
    features: [
      "Bibliothèque réglementaire",
      "Suivi du statut de conformité",
      "Planification des audits",
      "Capture des constats d'audit",
      "Conformity-AI pour analyse des écarts",
    ],
    actions: [
      { id: "view_norms", label: "Bibliothèque des normes", description: "Consulter les réglementations" },
      { id: "check_status", label: "Statut de conformité", description: "Voir le niveau de conformité" },
      { id: "plan_audit", label: "Planifier un audit", description: "Programmer un nouvel audit" },
      { id: "use_ai", label: "Utiliser Conformity-AI", description: "Analyse IA des écarts" },
    ],
    keywords: ["conformité", "norme", "iso", "audit", "réglementation", "compliance", "45001"],
  },
  {
    id: "health",
    path: "/app/health",
    name: "Healthmeter",
    nameFr: "Santé au travail",
    description: "Surveillance de la santé collective et gestion des expositions professionnelles",
    features: [
      "Tableau de bord santé",
      "Suivi des expositions professionnelles",
      "Gestion des dossiers médicaux (médecin)",
      "Planification des visites médicales",
      "Health-AI pour détection des tendances",
    ],
    actions: [
      { id: "view_status", label: "Statut santé", description: "Vue d'ensemble de la santé" },
      { id: "view_exposures", label: "Expositions", description: "Suivi des expositions professionnelles" },
      { id: "plan_visits", label: "Visites médicales", description: "Planifier les visites" },
      { id: "use_ai", label: "Utiliser Health-AI", description: "Analyse IA des tendances santé" },
    ],
    keywords: ["santé", "health", "médical", "exposition", "visite", "tms", "rps"],
  },
  {
    id: "analytics",
    path: "/app/analytics",
    name: "Analytiques",
    nameFr: "Analytiques",
    description: "Analyses avancées et rapports de performance SST",
    features: [
      "Tableaux de bord analytiques",
      "Rapports personnalisables",
      "Tendances sur plusieurs périodes",
      "Comparaisons par site/département",
    ],
    actions: [
      { id: "view_reports", label: "Voir les rapports", description: "Consulter les analyses" },
      { id: "export_data", label: "Exporter les données", description: "Télécharger en PDF/Excel" },
    ],
    keywords: ["analytics", "rapport", "statistiques", "analyse", "tendance", "graphique"],
  },
  {
    id: "admin",
    path: "/app/admin",
    name: "Administration",
    nameFr: "Administration",
    description: "Gestion des utilisateurs, rôles et paramètres de l'organisation",
    features: [
      "Gestion des utilisateurs",
      "Configuration des rôles et permissions",
      "Invitations d'utilisateurs",
      "Paramètres de l'organisation",
    ],
    actions: [
      { id: "manage_users", label: "Gérer les utilisateurs", description: "Ajouter/modifier les utilisateurs" },
      { id: "manage_roles", label: "Gérer les rôles", description: "Configurer les permissions" },
      { id: "invite_user", label: "Inviter un utilisateur", description: "Envoyer une invitation" },
    ],
    keywords: ["admin", "utilisateur", "rôle", "permission", "invitation", "paramètres"],
  },
];

/**
 * Common workflows with step-by-step instructions
 */
export const COMMON_WORKFLOWS = {
  declare_incident: {
    title: "Déclarer un incident",
    steps: [
      "Allez dans le module **Incidents** depuis le menu latéral",
      "Cliquez sur le bouton **Nouvel incident**",
      "Remplissez le formulaire avec les détails de l'incident",
      "Sélectionnez le type (accident, quasi-accident, situation dangereuse)",
      "Indiquez la gravité et les personnes impliquées",
      "Ajoutez des photos ou documents si disponibles",
      "Cliquez sur **Soumettre** pour enregistrer",
    ],
    relatedModule: "incidents",
    tip: "Vous pouvez aussi scanner un QR code depuis un mobile pour déclarer rapidement un incident.",
  },
  create_capa: {
    title: "Créer une action CAPA",
    steps: [
      "Allez dans **CAPA Room** depuis le menu latéral",
      "Cliquez sur **Nouvelle CAPA**",
      "Définissez le titre et la description de l'action",
      "Sélectionnez le type (corrective ou préventive)",
      "Assignez un responsable et une échéance",
      "Définissez la priorité (critique, haute, moyenne, basse)",
      "Ajoutez une checklist de sous-tâches si nécessaire",
      "Enregistrez la CAPA",
    ],
    relatedModule: "capa",
    tip: "Utilisez CAPA-AI pour obtenir des suggestions d'actions basées sur les incidents récents.",
  },
  plan_audit: {
    title: "Planifier un audit",
    steps: [
      "Allez dans **Conformité** depuis le menu latéral",
      "Sélectionnez l'onglet **Audits**",
      "Cliquez sur **Planifier un audit**",
      "Remplissez le titre et sélectionnez les normes concernées",
      "Choisissez le type d'audit (interne, externe, certification)",
      "Définissez la date et le périmètre (sites, départements)",
      "Assignez l'auditeur responsable",
      "Enregistrez l'audit",
    ],
    relatedModule: "compliance",
    tip: "Conformity-AI peut vous suggérer les domaines prioritaires à auditer.",
  },
  generate_qr_code: {
    title: "Générer un QR code pour incidents",
    steps: [
      "Allez dans le module **Incidents**",
      "Cliquez sur l'onglet **QR Codes**",
      "Cliquez sur **Nouveau QR Code**",
      "Définissez le nom et l'emplacement du QR code",
      "Générez et téléchargez le QR code",
      "Imprimez et affichez-le dans la zone concernée",
    ],
    relatedModule: "incidents",
    tip: "Les employés peuvent scanner ce code pour déclarer rapidement un incident depuis leur téléphone.",
  },
};

/**
 * Frequently asked questions
 */
export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    question: "Comment déclarer un incident ?",
    answer: "Pour déclarer un incident, allez dans le module Incidents, cliquez sur 'Nouvel incident' et remplissez le formulaire avec les détails de l'événement. Vous pouvez aussi utiliser un QR code depuis votre téléphone pour une déclaration rapide.",
    category: "incidents",
    relatedModule: "incidents",
    keywords: ["déclarer", "incident", "accident", "signaler"],
  },
  {
    id: "faq-2",
    question: "Qu'est-ce qu'une CAPA ?",
    answer: "CAPA signifie 'Corrective And Preventive Action' (Action Corrective et Préventive). C'est une action mise en place pour corriger un problème identifié (corrective) ou pour prévenir un problème potentiel (préventive). Dans SAHTEE, les CAPA sont gérées dans le module CAPA Room.",
    category: "capa",
    relatedModule: "capa",
    keywords: ["capa", "action", "corrective", "préventive", "définition"],
  },
  {
    id: "faq-3",
    question: "Comment voir mon taux de conformité ?",
    answer: "Votre taux de conformité est visible dans le module Conformité (Conformity Room). Vous trouverez un aperçu dans les tuiles de statut en haut de la page, avec le détail par norme et domaine.",
    category: "compliance",
    relatedModule: "compliance",
    keywords: ["conformité", "taux", "score", "statut"],
  },
  {
    id: "faq-4",
    question: "Qui peut accéder aux dossiers médicaux ?",
    answer: "Les dossiers médicaux sont strictement confidentiels et accessibles uniquement par le médecin du travail. Les autres utilisateurs (QHSE, RH) ne voient que les données agrégées et anonymisées dans le tableau de bord Healthmeter.",
    category: "health",
    relatedModule: "health",
    keywords: ["médical", "dossier", "accès", "confidentialité", "médecin"],
  },
  {
    id: "faq-5",
    question: "Comment exporter un rapport ?",
    answer: "Vous pouvez exporter des rapports depuis chaque module en utilisant le bouton 'Exporter'. Choisissez le format PDF pour un rapport formaté ou Excel pour les données brutes. Les rapports sont personnalisables selon la période et les filtres actifs.",
    category: "reports",
    keywords: ["exporter", "rapport", "pdf", "excel", "télécharger"],
  },
  {
    id: "faq-6",
    question: "Qu'est-ce que la norme ISO 45001 ?",
    answer: "L'ISO 45001 est la norme internationale pour les systèmes de management de la santé et de la sécurité au travail (SST). Elle spécifie les exigences pour améliorer la sécurité des travailleurs, réduire les risques et créer des conditions de travail meilleures. SAHTEE vous aide à atteindre et maintenir la conformité à cette norme.",
    category: "regulations",
    relatedModule: "compliance",
    keywords: ["iso", "45001", "norme", "certification", "management"],
  },
];

/**
 * Quick suggestions based on context
 */
export const QUICK_SUGGESTIONS: Record<string, QuickSuggestion[]> = {
  default: [
    { id: "qs-1", text: "Comment déclarer un incident ?", category: "help" },
    { id: "qs-2", text: "Quelles sont mes CAPA en retard ?", category: "data" },
    { id: "qs-3", text: "Quel est notre taux de conformité ?", category: "data" },
    { id: "qs-4", text: "Génère un rapport mensuel", category: "report" },
  ],
  dashboard: [
    { id: "qs-d1", text: "Explique ces indicateurs", category: "help" },
    { id: "qs-d2", text: "Quels sont les risques prioritaires ?", category: "data" },
    { id: "qs-d3", text: "Y a-t-il des alertes critiques ?", category: "data" },
  ],
  incidents: [
    { id: "qs-i1", text: "Comment créer un QR code ?", category: "help" },
    { id: "qs-i2", text: "Quels incidents sont ouverts ?", category: "data" },
    { id: "qs-i3", text: "Analyse les tendances des incidents", category: "data" },
  ],
  capa: [
    { id: "qs-c1", text: "Quelles CAPA sont urgentes ?", category: "data" },
    { id: "qs-c2", text: "Comment utiliser CAPA-AI ?", category: "help" },
    { id: "qs-c3", text: "Suggère des actions prioritaires", category: "data" },
  ],
  compliance: [
    { id: "qs-co1", text: "Quel est notre niveau ISO 45001 ?", category: "data" },
    { id: "qs-co2", text: "Quand est le prochain audit ?", category: "data" },
    { id: "qs-co3", text: "Quels domaines sont en retard ?", category: "data" },
  ],
  health: [
    { id: "qs-h1", text: "Y a-t-il des expositions critiques ?", category: "data" },
    { id: "qs-h2", text: "Quelles visites sont planifiées ?", category: "data" },
    { id: "qs-h3", text: "Analyse les tendances TMS", category: "data" },
  ],
};

/**
 * Get module by ID
 */
export function getModuleById(id: string): PlatformKnowledgeItem | undefined {
  return PLATFORM_MODULES.find((m) => m.id === id);
}

/**
 * Get module by path
 */
export function getModuleByPath(path: string): PlatformKnowledgeItem | undefined {
  return PLATFORM_MODULES.find((m) => path.startsWith(m.path));
}

/**
 * Search modules by keyword
 */
export function searchModules(query: string): PlatformKnowledgeItem[] {
  const lowerQuery = query.toLowerCase();
  return PLATFORM_MODULES.filter(
    (m) =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.nameFr.toLowerCase().includes(lowerQuery) ||
      m.description.toLowerCase().includes(lowerQuery) ||
      m.keywords.some((k) => k.includes(lowerQuery))
  );
}

/**
 * Search FAQs by keyword
 */
export function searchFAQs(query: string): FAQItem[] {
  const lowerQuery = query.toLowerCase();
  return FAQ_ITEMS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery) ||
      faq.keywords.some((k) => k.includes(lowerQuery))
  );
}

/**
 * Get suggestions for a specific page/module
 */
export function getSuggestionsForPage(pageId: string): QuickSuggestion[] {
  return QUICK_SUGGESTIONS[pageId] || QUICK_SUGGESTIONS.default;
}
