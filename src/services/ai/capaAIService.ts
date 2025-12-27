/**
 * CAPA-AI Service
 * 
 * Specialized AI service for CAPA (Corrective and Preventive Action) module:
 * - Root cause analysis (5 Whys, Ishikawa)
 * - Similar incident detection
 * - Action recommendations
 * - Auto-generation of CAPA from incidents
 */

import { GeminiClient, isGeminiEnabled } from "./geminiClient";
import { getToolsForBot } from "./tools";
import type {
    AIContext,
    IncidentAnalysisResult,
    SuggestedCapa,
    RCAMethodologyType,
    RootCauseMethodology,
    IshikawaAnalysis,
    IshikawaCategory,
    IshikawaCategoryName,
    ContributingFactor,
    FaultTreeAnalysis,
    FaultTreeNode,
    BarrierAnalysisResult,
    BarrierAnalysis,
    BarrierType,
    BarrierStatus,
    BowTieModel,
    BowTieThreat,
    BowTieConsequence,
    TripodAnalysis,
    TripodPrecondition,
    EnhancedIncidentAnalysis,
    FiveWhysAnalysis,
    WhyStep,
} from "./types";
import type { Incident } from "@/types/capa";
import { getIncident } from "@/services/incidentService";
import { getCAPA } from "@/services/capaService";

// =============================================================================
// System Prompts
// =============================================================================

const CAPA_AI_SYSTEM_PROMPT = `Tu es CAPA-AI, un expert en analyse des causes racines et en gestion des actions correctives et préventives pour la plateforme SAHTEE.

## Ton expertise

1. **Analyse des causes racines** : Tu maîtrises les méthodes 5 Pourquoi, Ishikawa (arête de poisson), FMEA
2. **Classification des causes** : Humain, Machine, Méthode, Milieu, Matière, Management (6M)
3. **Priorisation** : Matrice de criticité, analyse coût-bénéfice
4. **Rédaction d'actions** : Actions SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporellement définies)

## Tes capacités

- Analyser un incident et proposer une décomposition des causes racines
- Identifier les facteurs contributifs et les classer par catégorie
- Suggérer des actions correctives et préventives adaptées
- Trouver des incidents similaires dans l'historique
- Évaluer l'efficacité potentielle des actions proposées

## Format des réponses

### Pour l'analyse 5 Pourquoi
\`\`\`
Problème initial : [Description]
1. Pourquoi ? → [Cause 1]
2. Pourquoi ? → [Cause 2]
3. Pourquoi ? → [Cause 3]
4. Pourquoi ? → [Cause 4]
5. Pourquoi ? → [Cause racine]
\`\`\`

### Pour les actions suggérées
Chaque action doit inclure :
- **Type** : Corrective (éliminer la cause) ou Préventive (empêcher la récurrence)
- **Priorité** : Critique / Haute / Moyenne / Basse
- **Description** : Action SMART
- **Délai suggéré** : En jours

## Règles

1. Base tes analyses sur les données fournies, pas sur des suppositions
2. Utilise les outils disponibles pour accéder aux données réelles
3. Propose toujours au moins une action corrective ET une action préventive
4. Mentionne les risques résiduels si pertinent
5. Réponds en français`;

const ROOT_CAUSE_PROMPT = `Analyse cet incident et effectue une analyse des causes racines complète.

**Incident à analyser :**
{incident_description}

**Instructions :**
1. Applique la méthode des 5 Pourquoi
2. Identifie les facteurs contributifs (classés par 6M)
3. Détermine la cause racine principale
4. Propose des actions correctives et préventives

Utilise les outils disponibles pour rechercher des incidents similaires dans l'historique.`;

const SIMILAR_INCIDENTS_PROMPT = `Recherche des incidents similaires à celui-ci dans l'historique de l'organisation.

**Incident de référence :**
Type : {type}
Description : {description}
Lieu : {location}

Utilise l'outil find_similar_incidents pour identifier les incidents comparables.
Pour chaque incident trouvé, indique :
- La similarité (facteurs communs)
- Les actions qui ont été prises
- Les leçons apprises`;

const GENERATE_CAPA_PROMPT = `Génère une ou plusieurs CAPA (actions correctives et préventives) pour cet incident.

**Incident :**
{incident_details}

**Cause racine identifiée :**
{root_cause}

Pour chaque CAPA, fournis :
1. Titre clair et concis
2. Description détaillée de l'action
3. Type : correctif ou préventif
4. Priorité suggérée
5. Délai recommandé
6. Critères de vérification de l'efficacité`;

// =============================================================================
// Multi-Methodology Analysis Prompts
// =============================================================================

const ISHIKAWA_ANALYSIS_PROMPT = `Effectue une analyse Ishikawa (diagramme en arête de poisson) complète pour cet incident.

**Incident à analyser :**
{incident_description}

**Instructions :**
Analyse les causes selon les 6 catégories du modèle 6M :

1. **Main d'œuvre (Humain)** : Formation, compétences, fatigue, communication, supervision
2. **Machine (Équipement)** : État, maintenance, calibrage, âge, conception
3. **Méthode (Processus)** : Procédures, instructions, standards, contrôles
4. **Matière (Matériaux)** : Qualité, conformité, stockage, traçabilité
5. **Mesure** : Instruments, méthodes de contrôle, fréquence, précision
6. **Milieu (Environnement)** : Conditions de travail, température, bruit, éclairage, ergonomie

Pour chaque catégorie, identifie :
- Les facteurs principaux
- Les sous-facteurs
- Le poids/importance relative (%)

Fournis également :
- La cause primaire identifiée
- La cause racine profonde
- Le niveau de confiance de l'analyse (%)

Format ta réponse en JSON structuré.`;

const FAULT_TREE_ANALYSIS_PROMPT = `Effectue une analyse par arbre de défaillances (Fault Tree Analysis - FTA) pour cet événement.

**Événement principal (Top Event) :**
{incident_description}

**Instructions :**
Construis un arbre de défaillances en identifiant :

1. **Événement principal** : L'incident qui s'est produit
2. **Événements intermédiaires** : Les défaillances qui ont contribué
3. **Événements de base** : Les causes fondamentales (non décomposables)
4. **Portes logiques** : AND (toutes les causes nécessaires) ou OR (une cause suffit)

Pour chaque nœud, fournis :
- ID unique
- Type (top_event, intermediate, basic, undeveloped)
- Description
- Probabilité estimée (si applicable)
- Type de porte (AND, OR, INHIBIT, XOR)
- Nœuds enfants

Identifie également :
- Les ensembles de coupes minimales (minimal cut sets)
- Le chemin critique
- La probabilité globale de l'événement

Format ta réponse en JSON structuré.`;

const BARRIER_ANALYSIS_PROMPT = `Effectue une analyse des barrières de sécurité pour cet incident.

**Incident à analyser :**
{incident_description}

**Instructions :**
Identifie toutes les barrières de sécurité qui auraient dû empêcher cet incident :

Types de barrières à considérer :
1. **Physiques** : Garde-corps, protections, capots, verrouillages
2. **Procédurales** : Procédures, check-lists, autorisations de travail
3. **Administratives** : Règlements, audits, formations, habilitations
4. **Formation** : Compétences, sensibilisation, exercices
5. **EPI** : Équipements de protection individuelle
6. **Détection** : Alarmes, capteurs, systèmes de surveillance
7. **Intervention** : Plans d'urgence, moyens de secours

Pour chaque barrière identifiée, évalue :
- Nom et description
- Type de barrière
- Statut : effective, partiellement_effective, défaillante, absente, contournée
- Mode de défaillance (si applicable)
- Fonction attendue vs performance réelle
- Efficacité (0-100%)
- Recommandations d'amélioration

Fournis également :
- Score global de défense
- Barrières critiques manquantes
- Actions prioritaires

Format ta réponse en JSON structuré.`;

const BOWTIE_ANALYSIS_PROMPT = `Effectue une analyse Bow-Tie (Nœud Papillon) pour cet incident.

**Incident à analyser :**
{incident_description}

**Instructions :**
Construis un modèle Bow-Tie complet :

**PARTIE GAUCHE - MENACES (avant l'événement) :**
- Identifie toutes les menaces potentielles
- Pour chaque menace : description, catégorie, probabilité (1-5)
- Identifie les barrières préventives pour chaque menace

**CENTRE - DANGER/ÉVÉNEMENT REDOUTÉ :**
- Décris l'événement central (le "nœud")
- Explique pourquoi c'est le point critique

**PARTIE DROITE - CONSÉQUENCES (après l'événement) :**
- Identifie toutes les conséquences possibles
- Pour chaque conséquence : description, catégorie, sévérité (1-5)
- Identifie les barrières de mitigation pour chaque conséquence

**BARRIÈRES :**
- Barrières préventives (empêchent le déclenchement)
- Barrières de mitigation (limitent les conséquences)
- Évalue l'efficacité de chaque barrière

Calcule le score de risque résiduel.

Format ta réponse en JSON structuré.`;

const TRIPOD_ANALYSIS_PROMPT = `Effectue une analyse TRIPOD Beta pour cet incident.

**Incident à analyser :**
{incident_description}

**Instructions :**
L'analyse TRIPOD Beta identifie les défaillances latentes organisationnelles.

**1. DÉFAILLANCES ACTIVES :**
- Actes ou erreurs humaines directement liés à l'incident
- Actions ou inactions au moment de l'événement

**2. PRÉCONDITIONS :**
Conditions préexistantes dans ces catégories :
- Hardware/Équipement
- Conception
- Procédures
- Conditions propices aux erreurs
- Entretien/Rangement
- Objectifs incompatibles
- Communication
- Organisation
- Formation
- Défenses

**3. DÉFAILLANCES LATENTES :**
- Faiblesses organisationnelles sous-jacentes
- Facteurs dormants qui ont permis l'incident

**4. FACTEURS ORGANISATIONNELS :**
- Décisions managériales
- Culture de sécurité
- Allocation des ressources
- Priorisation

**5. OPPORTUNITÉS DE RÉCUPÉRATION :**
- Moments où l'incident aurait pu être évité
- Signaux d'alerte ignorés

Identifie les problèmes systémiques et les actions correctives profondes.

Format ta réponse en JSON structuré.`;

const COMPLIANCE_AWARE_CAPA_PROMPT = `Génère des CAPA conformes aux normes ISO applicables.

**Incident :**
{incident_details}

**Cause racine identifiée :**
{root_cause}

**Normes applicables :**
{applicable_norms}

**Instructions :**
Pour chaque CAPA générée, assure-toi qu'elle :
1. Répond aux exigences des normes ISO applicables
2. Inclut les clauses ISO pertinentes
3. Définit des critères de vérification conformes
4. Propose des indicateurs de suivi

Pour ISO 45001 (Santé et Sécurité au Travail), considère :
- Clause 6.1.2 : Évaluation des risques SST
- Clause 8.1 : Maîtrise opérationnelle
- Clause 10.2 : Non-conformités et actions correctives

Pour ISO 14001 (Management Environnemental), considère :
- Clause 6.1.2 : Aspects environnementaux
- Clause 8.1 : Maîtrise opérationnelle
- Clause 10.2 : Non-conformités et actions correctives

Format ta réponse en JSON structuré avec les champs :
- title, description, category, priority
- isoClause, complianceRequirement
- verificationCriteria, kpis
- estimatedEffort, suggestedDueDays`;

const ISO_REQUIREMENTS_MAP: Record<string, ISORequirement[]> = {
    "ISO 45001": [
        { clause: "4.1", title: "Contexte de l'organisme", requirement: "Compréhension de l'organisme et son contexte" },
        { clause: "5.4", title: "Consultation des travailleurs", requirement: "Participation des travailleurs" },
        { clause: "6.1.2", title: "Identification des dangers", requirement: "Évaluation des risques SST et opportunités" },
        { clause: "6.1.3", title: "Exigences légales", requirement: "Détermination des exigences légales applicables" },
        { clause: "7.2", title: "Compétences", requirement: "Compétences nécessaires et formation" },
        { clause: "8.1", title: "Maîtrise opérationnelle", requirement: "Planification et maîtrise des processus" },
        { clause: "8.1.2", title: "Élimination des dangers", requirement: "Hiérarchie des mesures de prévention" },
        { clause: "8.2", title: "Préparation aux urgences", requirement: "Plans d'urgence et d'intervention" },
        { clause: "9.1.2", title: "Évaluation de conformité", requirement: "Évaluation de la conformité légale" },
        { clause: "10.2", title: "Non-conformité et action corrective", requirement: "Traitement des non-conformités" },
    ],
    "ISO 14001": [
        { clause: "4.1", title: "Contexte de l'organisme", requirement: "Enjeux environnementaux" },
        { clause: "6.1.2", title: "Aspects environnementaux", requirement: "Identification des aspects environnementaux significatifs" },
        { clause: "6.1.3", title: "Obligations de conformité", requirement: "Exigences légales environnementales" },
        { clause: "7.2", title: "Compétences", requirement: "Compétences environnementales" },
        { clause: "8.1", title: "Maîtrise opérationnelle", requirement: "Maîtrise des processus environnementaux" },
        { clause: "8.2", title: "Préparation aux urgences", requirement: "Situations d'urgence environnementale" },
        { clause: "9.1.2", title: "Évaluation de conformité", requirement: "Conformité aux obligations" },
        { clause: "10.2", title: "Non-conformité", requirement: "Actions correctives environnementales" },
    ],
};

interface ISORequirement {
    clause: string;
    title: string;
    requirement: string;
}

interface ComplianceAwareCapa extends SuggestedCapa {
    isoClause?: string;
    isoNorm?: string;
    complianceRequirement?: string;
    verificationCriteria?: string[];
    kpis?: string[];
}

const METHODOLOGY_RECOMMENDATION_PROMPT = `Analyse cet incident et recommande la méthodologie d'analyse des causes racines la plus appropriée.

**Incident :**
Type : {type}
Gravité : {severity}
Description : {description}
Lieu : {location}
Victimes : {victims}

**Méthodologies disponibles :**
1. **5 Pourquoi** : Simple, rapide, pour problèmes linéaires avec une cause principale
2. **Ishikawa (6M)** : Complexe, multi-facteurs, problèmes organisationnels
3. **Arbre de défaillances (FTA)** : Événements critiques, analyse probabiliste
4. **Analyse des barrières** : Défaillances des systèmes de protection
5. **Bow-Tie** : Vision complète menaces-conséquences avec barrières
6. **TRIPOD Beta** : Défaillances organisationnelles latentes
7. **Hybride** : Combinaison de plusieurs méthodes

**Critères de sélection :**
- Complexité de l'incident
- Nombre de facteurs contributifs
- Présence de défaillances systémiques
- Implications réglementaires
- Urgence de l'analyse
- Ressources disponibles

Recommande la méthodologie optimale avec justification.`;

// =============================================================================
// CAPA-AI Service Class
// =============================================================================

export class CAPAAIService {
    private client: GeminiClient;
    private context: AIContext | null = null;
    private isInitialized: boolean = false;

    constructor() {
        this.client = new GeminiClient();
    }

    /**
     * Initialize CAPA-AI with user context
     */
    initialize(context: AIContext): void {
        this.context = context;

        // Get CAPA-specific tools
        const tools = getToolsForBot("capa_ai");

        // Build system prompt
        const systemPrompt = this.buildSystemPrompt(context);

        // Initialize Gemini client
        this.client.initialize({
            botType: "capa_ai",
            context,
            tools,
            systemPrompt,
            modelType: "pro", // Use Pro for better analysis
        });

        this.client.startChat([]);
        this.isInitialized = true;
    }

    /**
     * Build system prompt with context
     */
    private buildSystemPrompt(context: AIContext): string {
        return `${CAPA_AI_SYSTEM_PROMPT}

## Contexte

- **Utilisateur** : ${context.userName}
- **Rôle** : ${context.userRole}
- **Organisation** : ${context.organizationName || "Non spécifiée"}`;
    }

    /**
     * Analyze an incident for root causes
     */
    async analyzeIncident(incidentId: string): Promise<IncidentAnalysisResult> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        // Fetch incident details
        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        // Verify access
        if (incident.organizationId !== this.context.organizationId) {
            throw new Error("Access denied");
        }

        // Build prompt
        const prompt = ROOT_CAUSE_PROMPT.replace(
            "{incident_description}",
            `
Type : ${incident.type}
Gravité : ${incident.severity}
Description : ${incident.description}
Lieu : ${incident.location}
Actions immédiates : ${incident.immediateActions || "Non spécifiées"}
`
        );

        // Send to AI
        const response = await this.client.sendMessage(prompt, true);

        // Parse the response into structured data
        return this.parseAnalysisResponse(response.content, incident);
    }

    /**
     * Get root cause analysis using 5 Whys
     */
    async performFiveWhys(
        problem: string,
        initialCause?: string
    ): Promise<{
        problem: string;
        whys: string[];
        rootCause: string;
        contributingFactors: Array<{ category: string; factor: string }>;
    }> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const prompt = `Effectue une analyse 5 Pourquoi pour ce problème :

**Problème** : ${problem}
${initialCause ? `**Cause initiale** : ${initialCause}` : ""}

Fournis :
1. Les 5 pourquoi avec les réponses
2. La cause racine identifiée
3. Les facteurs contributifs classés par catégorie (6M)`;

        const response = await this.client.sendMessage(prompt, true);

        // Parse the structured response
        return this.parseFiveWhysResponse(response.content, problem);
    }

    /**
     * Find similar incidents
     */
    async findSimilarIncidents(incidentId: string): Promise<
        Array<{
            id: string;
            reference: string;
            description: string;
            similarity: number;
            commonFactors: string[];
            actionsTaken: string[];
        }>
    > {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const prompt = SIMILAR_INCIDENTS_PROMPT.replace("{type}", incident.type)
            .replace("{description}", incident.description)
            .replace("{location}", incident.location);

        const response = await this.client.sendMessage(prompt, true);

        // The AI will use tools to find similar incidents and format the response
        return this.parseSimilarIncidentsResponse(response.content);
    }

    /**
     * Generate CAPA suggestions from incident
     */
    async generateCAPASuggestions(
        incidentId: string,
        rootCause?: string
    ): Promise<SuggestedCapa[]> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const prompt = GENERATE_CAPA_PROMPT.replace(
            "{incident_details}",
            `
Référence : ${incident.reference}
Type : ${incident.type}
Gravité : ${incident.severity}
Description : ${incident.description}
Actions immédiates : ${incident.immediateActions || "Non spécifiées"}
`
        ).replace("{root_cause}", rootCause || "Non encore déterminée");

        const response = await this.client.sendMessage(prompt, true);

        return this.parseCAPASuggestions(response.content, incident);
    }

    /**
     * Analyze a CAPA for effectiveness
     */
    async analyzeCAPAEffectiveness(capaId: string): Promise<{
        score: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    }> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const capa = await getCAPA(capaId);
        if (!capa) {
            throw new Error("CAPA not found");
        }

        const prompt = `Analyse l'efficacité potentielle de cette CAPA :

**CAPA** : ${capa.title}
**Description** : ${capa.description}
**Type** : ${capa.category}
**Priorité** : ${capa.priority}
**Statut** : ${capa.status}
**Progression** : ${capa.progress}%

Évalue :
1. La clarté et la spécificité de l'action (SMART)
2. L'adéquation avec le type de problème
3. Les risques de non-efficacité
4. Les recommandations d'amélioration`;

        const response = await this.client.sendMessage(prompt, true);

        return this.parseEffectivenessAnalysis(response.content);
    }

    /**
     * Stream analysis response
     */
    async streamAnalysis(
        incidentId: string,
        onChunk: (chunk: string) => void
    ): Promise<IncidentAnalysisResult> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const prompt = ROOT_CAUSE_PROMPT.replace(
            "{incident_description}",
            `
Type : ${incident.type}
Gravité : ${incident.severity}
Description : ${incident.description}
Lieu : ${incident.location}
Actions immédiates : ${incident.immediateActions || "Non spécifiées"}
`
        );

        const response = await this.client.streamMessage(prompt, onChunk, true);

        return this.parseAnalysisResponse(response.content, incident);
    }

    // ============================================================================
    // Multi-Methodology Root Cause Analysis Methods
    // ============================================================================

    /**
     * Recommend the best analysis methodology for an incident
     */
    async recommendMethodology(incidentId: string): Promise<{
        recommended: RCAMethodologyType;
        rationale: string;
        alternatives: Array<{ method: RCAMethodologyType; suitability: number }>;
    }> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const prompt = METHODOLOGY_RECOMMENDATION_PROMPT
            .replace("{type}", incident.type)
            .replace("{severity}", incident.severity)
            .replace("{description}", incident.description)
            .replace("{location}", incident.location)
            .replace("{victims}", incident.victimCount?.toString() || "0");

        const response = await this.client.sendMessage(prompt, true);

        return this.parseMethodologyRecommendation(response.content, incident);
    }

    /**
     * Perform Ishikawa (Fishbone) analysis
     */
    async performIshikawaAnalysis(incidentId: string): Promise<IshikawaAnalysis> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const prompt = ISHIKAWA_ANALYSIS_PROMPT.replace(
            "{incident_description}",
            this.formatIncidentDescription(incident)
        );

        const response = await this.client.sendMessage(prompt, true);

        return this.parseIshikawaResponse(response.content, incident);
    }

    /**
     * Perform Fault Tree Analysis (FTA)
     */
    async performFaultTreeAnalysis(incidentId: string): Promise<FaultTreeAnalysis> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const prompt = FAULT_TREE_ANALYSIS_PROMPT.replace(
            "{incident_description}",
            this.formatIncidentDescription(incident)
        );

        const response = await this.client.sendMessage(prompt, true);

        return this.parseFaultTreeResponse(response.content, incident);
    }

    /**
     * Perform Barrier Analysis
     */
    async performBarrierAnalysis(incidentId: string): Promise<BarrierAnalysisResult> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const prompt = BARRIER_ANALYSIS_PROMPT.replace(
            "{incident_description}",
            this.formatIncidentDescription(incident)
        );

        const response = await this.client.sendMessage(prompt, true);

        return this.parseBarrierAnalysisResponse(response.content);
    }

    /**
     * Perform Bow-Tie Analysis
     */
    async performBowTieAnalysis(incidentId: string): Promise<BowTieModel> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const prompt = BOWTIE_ANALYSIS_PROMPT.replace(
            "{incident_description}",
            this.formatIncidentDescription(incident)
        );

        const response = await this.client.sendMessage(prompt, true);

        return this.parseBowTieResponse(response.content, incident);
    }

    /**
     * Perform TRIPOD Beta Analysis
     */
    async performTripodAnalysis(incidentId: string): Promise<TripodAnalysis> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const prompt = TRIPOD_ANALYSIS_PROMPT.replace(
            "{incident_description}",
            this.formatIncidentDescription(incident)
        );

        const response = await this.client.sendMessage(prompt, true);

        return this.parseTripodResponse(response.content);
    }

    /**
     * Perform enhanced multi-methodology analysis
     */
    async performEnhancedAnalysis(
        incidentId: string,
        methodology?: RCAMethodologyType
    ): Promise<EnhancedIncidentAnalysis> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        // Get methodology recommendation if not specified
        let selectedMethod = methodology;
        let methodologyRationale = "";
        
        if (!selectedMethod) {
            const recommendation = await this.recommendMethodology(incidentId);
            selectedMethod = recommendation.recommended;
            methodologyRationale = recommendation.rationale;
        }

        // Perform base analysis
        const baseAnalysis = await this.analyzeIncident(incidentId);

        // Build enhanced analysis based on methodology
        const enhancedAnalysis: EnhancedIncidentAnalysis = {
            ...baseAnalysis,
            methodology: {
                type: selectedMethod,
                name: this.getMethodologyName(selectedMethod),
                description: this.getMethodologyDescription(selectedMethod),
                confidence: baseAnalysis.confidence,
                analysisDate: new Date(),
            },
            aiRecommendedMethodology: selectedMethod,
            methodologyRationale,
        };

        // Perform methodology-specific analysis
        switch (selectedMethod) {
            case "ishikawa":
                enhancedAnalysis.ishikawaAnalysis = await this.performIshikawaAnalysis(incidentId);
                break;
            case "fta":
                enhancedAnalysis.faultTreeAnalysis = await this.performFaultTreeAnalysis(incidentId);
                break;
            case "barrier":
                enhancedAnalysis.barrierAnalysis = await this.performBarrierAnalysis(incidentId);
                break;
            case "bowtie":
                enhancedAnalysis.bowtieAnalysis = await this.performBowTieAnalysis(incidentId);
                break;
            case "tripod":
                enhancedAnalysis.tripodAnalysis = await this.performTripodAnalysis(incidentId);
                break;
            case "5why":
                enhancedAnalysis.fiveWhysAnalysis = await this.performStructuredFiveWhys(incidentId);
                break;
            case "hybrid":
                // Perform multiple analyses for comprehensive view
                enhancedAnalysis.fiveWhysAnalysis = await this.performStructuredFiveWhys(incidentId);
                enhancedAnalysis.ishikawaAnalysis = await this.performIshikawaAnalysis(incidentId);
                enhancedAnalysis.barrierAnalysis = await this.performBarrierAnalysis(incidentId);
                enhancedAnalysis.hybridInsights = this.generateHybridInsights(enhancedAnalysis);
                break;
        }

        return enhancedAnalysis;
    }

    // ============================================================================
    // Compliance-Aware CAPA Generation
    // ============================================================================

    /**
     * Generate compliance-aware CAPAs based on ISO requirements
     */
    async generateComplianceAwareCapa(
        incidentId: string,
        applicableNorms: string[] = ["ISO 45001", "ISO 14001"]
    ): Promise<ComplianceAwareCapa[]> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        // Build norm requirements context
        const normContext = this.buildNormContext(applicableNorms, incident);

        const prompt = COMPLIANCE_AWARE_CAPA_PROMPT
            .replace("{incident_details}", this.formatIncidentDescription(incident))
            .replace("{root_cause}", incident.aiAnalysis?.rootCause || "À déterminer")
            .replace("{applicable_norms}", normContext);

        const response = await this.client.sendMessage(prompt, true);

        return this.parseComplianceAwareCapas(response.content, incident, applicableNorms);
    }

    /**
     * Map CAPA to specific ISO clauses
     */
    mapCapaToISOClauses(
        capa: SuggestedCapa,
        norms: string[] = ["ISO 45001"]
    ): {
        mappedClauses: Array<{ norm: string; clause: string; title: string; relevance: number }>;
        complianceScore: number;
    } {
        const mappedClauses: Array<{ norm: string; clause: string; title: string; relevance: number }> = [];

        for (const norm of norms) {
            const requirements = ISO_REQUIREMENTS_MAP[norm] || [];

            for (const req of requirements) {
                const relevance = this.calculateClauseRelevance(capa, req);
                if (relevance > 0.3) {
                    mappedClauses.push({
                        norm,
                        clause: req.clause,
                        title: req.title,
                        relevance,
                    });
                }
            }
        }

        // Sort by relevance
        mappedClauses.sort((a, b) => b.relevance - a.relevance);

        // Calculate compliance score
        const complianceScore = mappedClauses.length > 0
            ? Math.round(mappedClauses.reduce((sum, c) => sum + c.relevance, 0) / mappedClauses.length * 100)
            : 0;

        return { mappedClauses: mappedClauses.slice(0, 5), complianceScore };
    }

    /**
     * Get applicable ISO requirements for an incident type
     */
    getApplicableISORequirements(
        incidentType: string,
        norms: string[] = ["ISO 45001", "ISO 14001"]
    ): ISORequirement[] {
        const applicable: ISORequirement[] = [];

        // Mapping of incident types to relevant ISO clauses
        const typeToClauseMap: Record<string, string[]> = {
            accident: ["6.1.2", "8.1.2", "10.2"],
            near_miss: ["6.1.2", "8.1", "10.2"],
            equipment: ["8.1", "8.2"],
            environmental: ["6.1.2", "8.1", "8.2"],
            health: ["6.1.2", "7.2", "8.1"],
            safety: ["5.4", "6.1.2", "8.1.2"],
        };

        const relevantClauses = typeToClauseMap[incidentType] || ["10.2"];

        for (const norm of norms) {
            const requirements = ISO_REQUIREMENTS_MAP[norm] || [];
            for (const req of requirements) {
                if (relevantClauses.includes(req.clause)) {
                    applicable.push(req);
                }
            }
        }

        return applicable;
    }

    /**
     * Validate CAPA against ISO requirements
     */
    validateCapaCompliance(
        capa: SuggestedCapa,
        norms: string[] = ["ISO 45001"]
    ): {
        isCompliant: boolean;
        score: number;
        gaps: string[];
        recommendations: string[];
    } {
        const gaps: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // Check for SMART criteria
        if (!capa.description || capa.description.length < 50) {
            gaps.push("Description insuffisamment détaillée");
            recommendations.push("Ajouter plus de détails sur les actions spécifiques à mener");
            score -= 15;
        }

        if (!capa.suggestedDueDate && !capa.suggestedDueDays) {
            gaps.push("Délai non spécifié");
            recommendations.push("Définir une échéance claire (exigence ISO 10.2)");
            score -= 10;
        }

        // Check for verification criteria
        const descLower = capa.description.toLowerCase();
        if (!descLower.includes("vérif") && !descLower.includes("contrôl") && !descLower.includes("mesur")) {
            gaps.push("Critères de vérification non définis");
            recommendations.push("Ajouter des critères pour évaluer l'efficacité de l'action (ISO 10.2.1.f)");
            score -= 15;
        }

        // Check for root cause linkage
        if (!capa.reasoning || capa.reasoning.length < 20) {
            gaps.push("Lien avec la cause racine non explicité");
            recommendations.push("Documenter comment l'action traite la cause racine identifiée");
            score -= 10;
        }

        // Check category appropriateness
        const { mappedClauses } = this.mapCapaToISOClauses(capa, norms);
        if (mappedClauses.length === 0) {
            gaps.push("Aucune clause ISO applicable identifiée");
            recommendations.push("S'assurer que l'action répond aux exigences normatives");
            score -= 10;
        }

        return {
            isCompliant: score >= 70,
            score: Math.max(0, score),
            gaps,
            recommendations,
        };
    }

    // ============================================================================
    // Compliance Helper Methods
    // ============================================================================

    private buildNormContext(norms: string[], incident: Incident): string {
        const parts: string[] = [];

        for (const norm of norms) {
            const requirements = this.getApplicableISORequirements(incident.type, [norm]);
            if (requirements.length > 0) {
                parts.push(`**${norm}:**`);
                for (const req of requirements) {
                    parts.push(`- Clause ${req.clause}: ${req.title} - ${req.requirement}`);
                }
            }
        }

        return parts.join("\n");
    }

    private calculateClauseRelevance(capa: SuggestedCapa, requirement: ISORequirement): number {
        const capaText = `${capa.title} ${capa.description}`.toLowerCase();
        const reqText = `${requirement.title} ${requirement.requirement}`.toLowerCase();

        // Simple keyword matching
        const capaWords = new Set(capaText.split(/\s+/).filter((w) => w.length > 4));
        const reqWords = reqText.split(/\s+/).filter((w) => w.length > 4);

        const matches = reqWords.filter((w) => capaWords.has(w)).length;
        return matches / Math.max(reqWords.length, 1);
    }

    private parseComplianceAwareCapas(
        content: string,
        incident: Incident,
        norms: string[]
    ): ComplianceAwareCapa[] {
        // Try JSON parsing
        const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                const capas = Array.isArray(parsed) ? parsed : parsed.capas || [parsed];
                return capas.map((c: Partial<ComplianceAwareCapa>) => this.normalizeComplianceCapa(c, incident, norms));
            } catch {
                // Fall through
            }
        }

        // Fall back to regular parsing and enhance
        const baseSuggestions = this.parseCAPASuggestions(content, incident);
        return baseSuggestions.map((s) => this.enhanceWithCompliance(s, norms));
    }

    private normalizeComplianceCapa(
        raw: Partial<ComplianceAwareCapa>,
        incident: Incident,
        norms: string[]
    ): ComplianceAwareCapa {
        const suggestedDueDate = raw.suggestedDueDays
            ? new Date(Date.now() + (raw.suggestedDueDays as number) * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        return {
            title: raw.title || `CAPA: ${incident.type}`,
            description: raw.description || "",
            category: raw.category || "correctif",
            priority: raw.priority || "moyenne",
            reasoning: raw.reasoning || "",
            confidence: raw.confidence || 0.75,
            suggestedDueDate,
            isoClause: raw.isoClause,
            isoNorm: raw.isoNorm || norms[0],
            complianceRequirement: raw.complianceRequirement,
            verificationCriteria: raw.verificationCriteria || [],
            kpis: raw.kpis || [],
        };
    }

    private enhanceWithCompliance(capa: SuggestedCapa, norms: string[]): ComplianceAwareCapa {
        const { mappedClauses } = this.mapCapaToISOClauses(capa, norms);
        const topClause = mappedClauses[0];

        return {
            ...capa,
            isoClause: topClause?.clause,
            isoNorm: topClause?.norm,
            complianceRequirement: topClause?.title,
            verificationCriteria: this.generateVerificationCriteria(capa),
            kpis: this.generateKPIs(capa),
        };
    }

    private generateVerificationCriteria(capa: SuggestedCapa): string[] {
        const criteria: string[] = [];

        if (capa.category === "correctif") {
            criteria.push("Vérification de la mise en œuvre complète de l'action");
            criteria.push("Confirmation de l'élimination de la cause racine");
        } else {
            criteria.push("Vérification de l'efficacité des mesures préventives");
            criteria.push("Absence de récurrence du problème");
        }

        criteria.push("Documentation des preuves de réalisation");
        criteria.push("Validation par le responsable désigné");

        return criteria;
    }

    private generateKPIs(capa: SuggestedCapa): string[] {
        const kpis: string[] = [];

        if (capa.category === "correctif") {
            kpis.push("Délai de clôture vs délai prévu");
            kpis.push("Nombre de récurrences après clôture");
        } else {
            kpis.push("Réduction du taux d'incidents similaires");
            kpis.push("Amélioration des indicateurs de sécurité");
        }

        kpis.push("Taux de conformité à l'action");

        return kpis;
    }

    /**
     * Perform structured 5 Whys analysis with enhanced output
     */
    async performStructuredFiveWhys(incidentId: string): Promise<FiveWhysAnalysis> {
        if (!this.isInitialized || !this.context) {
            throw new Error("CAPA-AI not initialized");
        }

        const incident = await getIncident(incidentId);
        if (!incident) {
            throw new Error("Incident not found");
        }

        const result = await this.performFiveWhys(incident.description);

        // Convert to structured format
        const whySteps: WhyStep[] = result.whys.map((answer, index) => ({
            level: index + 1,
            question: `Pourquoi ${index === 0 ? "cela s'est-il produit" : "cette cause existe-t-elle"} ?`,
            answer,
            validated: true,
        }));

        const contributingFactors: ContributingFactor[] = result.contributingFactors.map(
            (factor, index) => ({
                id: `factor-${index}`,
                description: factor.factor,
                category: factor.category,
                isPrimary: index === 0,
                confidence: 0.8,
            })
        );

        return {
            problem: result.problem,
            whys: whySteps,
            rootCause: result.rootCause,
            contributingFactors,
        };
    }

    // ============================================================================
    // Helper Methods
    // ============================================================================

    private formatIncidentDescription(incident: Incident): string {
        return `
Type : ${incident.type}
Gravité : ${incident.severity}
Référence : ${incident.reference}
Description : ${incident.description}
Lieu : ${incident.location}
Date : ${incident.date instanceof Date ? incident.date.toISOString() : incident.date}
Actions immédiates : ${incident.immediateActions || "Non spécifiées"}
Victimes : ${incident.victimCount || 0}
`;
    }

    private getMethodologyName(type: RCAMethodologyType): string {
        const names: Record<RCAMethodologyType, string> = {
            "5why": "Analyse 5 Pourquoi",
            "ishikawa": "Diagramme d'Ishikawa (6M)",
            "fta": "Arbre de Défaillances (FTA)",
            "barrier": "Analyse des Barrières",
            "bowtie": "Analyse Bow-Tie",
            "tripod": "TRIPOD Beta",
            "hybrid": "Analyse Hybride Multi-méthodologie",
        };
        return names[type];
    }

    private getMethodologyDescription(type: RCAMethodologyType): string {
        const descriptions: Record<RCAMethodologyType, string> = {
            "5why": "Méthode itérative simple pour identifier la cause racine en posant 'pourquoi' 5 fois",
            "ishikawa": "Analyse structurée selon 6 catégories : Main d'œuvre, Machine, Méthode, Matière, Mesure, Milieu",
            "fta": "Arbre logique déductif partant de l'événement indésirable vers les causes de base",
            "barrier": "Évaluation des barrières de sécurité et de leurs défaillances",
            "bowtie": "Vue complète des menaces, de l'événement central et des conséquences avec barrières",
            "tripod": "Identification des défaillances latentes et facteurs organisationnels",
            "hybrid": "Combinaison de plusieurs méthodologies pour une analyse approfondie",
        };
        return descriptions[type];
    }

    private generateHybridInsights(analysis: EnhancedIncidentAnalysis): string[] {
        const insights: string[] = [];

        if (analysis.fiveWhysAnalysis && analysis.ishikawaAnalysis) {
            insights.push(
                `L'analyse 5 Pourquoi identifie "${analysis.fiveWhysAnalysis.rootCause}" comme cause racine, ` +
                `confirmée par l'analyse Ishikawa dans la catégorie "${analysis.ishikawaAnalysis.primaryCause?.category || 'non spécifiée'}"`
            );
        }

        if (analysis.barrierAnalysis) {
            const failedCount = analysis.barrierAnalysis.failedBarriers.length;
            const missingCount = analysis.barrierAnalysis.missingBarriers.length;
            if (failedCount > 0 || missingCount > 0) {
                insights.push(
                    `${failedCount} barrière(s) défaillante(s) et ${missingCount} barrière(s) manquante(s) identifiées`
                );
            }
        }

        if (analysis.contributingFactors.length > 3) {
            insights.push(
                `Incident multi-factoriel avec ${analysis.contributingFactors.length} facteurs contributifs identifiés`
            );
        }

        return insights;
    }

    // ============================================================================
    // Multi-Methodology Response Parsers
    // ============================================================================

    private parseMethodologyRecommendation(
        content: string,
        _incident: Incident
    ): {
        recommended: RCAMethodologyType;
        rationale: string;
        alternatives: Array<{ method: RCAMethodologyType; suitability: number }>;
    } {
        // Try to parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    recommended: parsed.recommended || "5why",
                    rationale: parsed.rationale || "",
                    alternatives: parsed.alternatives || [],
                };
            } catch {
                // Fall through to text parsing
            }
        }

        // Text-based parsing
        let recommended: RCAMethodologyType = "5why";
        const methodKeywords: Record<RCAMethodologyType, string[]> = {
            "5why": ["5 pourquoi", "cinq pourquoi", "5 whys"],
            "ishikawa": ["ishikawa", "fishbone", "arête de poisson", "6m"],
            "fta": ["arbre de défaillances", "fault tree", "fta"],
            "barrier": ["barrières", "barriers", "défenses"],
            "bowtie": ["bow-tie", "bowtie", "nœud papillon"],
            "tripod": ["tripod", "défaillances latentes", "organisationnel"],
            "hybrid": ["hybride", "combiné", "multiple"],
        };

        const contentLower = content.toLowerCase();
        for (const [method, keywords] of Object.entries(methodKeywords)) {
            if (keywords.some(kw => contentLower.includes(kw))) {
                recommended = method as RCAMethodologyType;
                break;
            }
        }

        // Extract rationale
        const rationaleMatch = content.match(/(?:justification|rationale|raison)[:\s]+(.+?)(?=\n\n|$)/is);
        const rationale = rationaleMatch?.[1]?.trim() || "Méthodologie recommandée basée sur les caractéristiques de l'incident";

        return {
            recommended,
            rationale,
            alternatives: [
                { method: "ishikawa", suitability: 0.7 },
                { method: "barrier", suitability: 0.6 },
            ],
        };
    }

    private parseIshikawaResponse(content: string, incident: Incident): IshikawaAnalysis {
        // Try to parse JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.categories) {
                    return {
                        problem: incident.description,
                        categories: parsed.categories,
                        primaryCause: parsed.primaryCause || this.createDefaultFactor("Cause primaire non identifiée"),
                        rootCause: parsed.rootCause || "À déterminer",
                        analysisNotes: parsed.notes,
                    };
                }
            } catch {
                // Fall through to text parsing
            }
        }

        // Text-based parsing - extract categories from content
        const categories: IshikawaCategory[] = [];
        const categoryNames: IshikawaCategoryName[] = ["man", "machine", "method", "material", "measurement", "environment"];
        const categoryLabels: Record<IshikawaCategoryName, string[]> = {
            man: ["main d'œuvre", "humain", "personnel", "homme"],
            machine: ["machine", "équipement", "matériel"],
            method: ["méthode", "processus", "procédure"],
            material: ["matière", "matériaux", "fournitures"],
            measurement: ["mesure", "contrôle", "instrument"],
            environment: ["milieu", "environnement", "conditions"],
        };

        const contentLower = content.toLowerCase();

        for (const catName of categoryNames) {
            const labels = categoryLabels[catName];
            const factors: ContributingFactor[] = [];

            // Find section for this category
            for (const label of labels) {
                const regex = new RegExp(`${label}[^:]*:[\\s]*([\\s\\S]*?)(?=\\n(?:${Object.values(categoryLabels).flat().join("|")})|\\n\\n|$)`, "i");
                const match = contentLower.match(regex);
                if (match) {
                    const factorLines = match[1].matchAll(/[-•*]\s*(.+?)(?=\n|$)/g);
                    let factorIndex = 0;
                    for (const line of factorLines) {
                        factors.push({
                            id: `${catName}-${factorIndex++}`,
                            description: line[1].trim(),
                            category: catName,
                            isPrimary: factorIndex === 0,
                            confidence: 0.7,
                        });
                    }
                    break;
                }
            }

            categories.push({
                name: catName,
                label: labels[0].charAt(0).toUpperCase() + labels[0].slice(1),
                factors,
                subFactors: [],
                weight: factors.length > 0 ? 1 / categoryNames.length : 0,
            });
        }

        // Extract root cause
        const rootCauseMatch = content.match(/cause racine[:\s]+(.+?)(?=\n|$)/i);
        const rootCause = rootCauseMatch?.[1]?.trim() || "À déterminer par analyse approfondie";

        // Find primary cause
        const allFactors = categories.flatMap(c => c.factors);
        const primaryCause = allFactors.find(f => f.isPrimary) || 
            this.createDefaultFactor("Cause primaire à identifier");

        return {
            problem: incident.description,
            categories,
            primaryCause,
            rootCause,
        };
    }

    private parseFaultTreeResponse(content: string, incident: Incident): FaultTreeAnalysis {
        // Try JSON parsing first
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.topEvent) {
                    return {
                        topEvent: parsed.topEvent,
                        minimalCutSets: parsed.minimalCutSets || [],
                        criticalPath: parsed.criticalPath || [],
                        systemProbability: parsed.systemProbability || 0,
                        analysisNotes: parsed.notes,
                    };
                }
            } catch {
                // Fall through
            }
        }

        // Create default structure from text analysis
        const topEvent: FaultTreeNode = {
            id: "top-1",
            type: "top_event",
            description: incident.description,
            gateType: "OR",
            children: [],
        };

        // Extract events from content
        const eventMatches = content.matchAll(/(?:événement|event|cause)[^:]*[:\s]+(.+?)(?=\n|$)/gi);
        let eventIndex = 0;
        for (const match of eventMatches) {
            if (eventIndex < 5) { // Limit to 5 intermediate events
                topEvent.children = topEvent.children || [];
                topEvent.children.push({
                    id: `int-${eventIndex++}`,
                    type: eventIndex < 3 ? "intermediate" : "basic",
                    description: match[1].trim(),
                    probability: 0.1,
                });
            }
        }

        return {
            topEvent,
            minimalCutSets: topEvent.children?.map(c => [c.id]) || [],
            criticalPath: topEvent.children?.slice(0, 2).map(c => c.id) || [],
            systemProbability: 0.1,
        };
    }

    private parseBarrierAnalysisResponse(content: string): BarrierAnalysisResult {
        const barriers: BarrierAnalysis[] = [];
        const failedBarriers: BarrierAnalysis[] = [];
        const missingBarriers: BarrierAnalysis[] = [];

        // Try JSON parsing
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.barriers) {
                    return {
                        barriers: parsed.barriers,
                        failedBarriers: parsed.barriers.filter((b: BarrierAnalysis) => b.status === "failed"),
                        missingBarriers: parsed.barriers.filter((b: BarrierAnalysis) => b.status === "missing"),
                        overallDefenseScore: parsed.overallDefenseScore || 50,
                        criticalGaps: parsed.criticalGaps || [],
                        recommendations: parsed.recommendations || [],
                    };
                }
            } catch {
                // Fall through
            }
        }

        // Text-based parsing
        const barrierTypes: BarrierType[] = ["physical", "procedural", "administrative", "training", "ppe", "detection", "response"];
        const statusKeywords: Record<BarrierStatus, string[]> = {
            effective: ["efficace", "fonctionnel", "opérationnel"],
            partially_effective: ["partiellement", "partiel", "limité"],
            failed: ["défaillant", "échoué", "non fonctionnel", "défaillance"],
            missing: ["absent", "manquant", "inexistant"],
            bypassed: ["contourné", "ignoré", "shunté"],
        };

        let barrierIndex = 0;
        for (const barrierType of barrierTypes) {
            const regex = new RegExp(`${barrierType}[^:]*[:\\s]+([\\s\\S]*?)(?=\\n(?:${barrierTypes.join("|")})|\\n\\n|$)`, "i");
            const match = content.match(regex);
            
            if (match) {
                const text = match[1].toLowerCase();
                let status: BarrierStatus = "effective";
                
                for (const [statusKey, keywords] of Object.entries(statusKeywords)) {
                    if (keywords.some(kw => text.includes(kw))) {
                        status = statusKey as BarrierStatus;
                        break;
                    }
                }

                const barrier: BarrierAnalysis = {
                    id: `barrier-${barrierIndex++}`,
                    name: `Barrière ${barrierType}`,
                    type: barrierType,
                    description: match[1].trim().substring(0, 200),
                    status,
                    expectedFunction: "Protection attendue",
                    actualPerformance: status === "effective" ? "Conforme" : "Non conforme",
                    effectiveness: status === "effective" ? 100 : status === "partially_effective" ? 50 : 0,
                    recommendations: [],
                };

                barriers.push(barrier);
                if (status === "failed") failedBarriers.push(barrier);
                if (status === "missing") missingBarriers.push(barrier);
            }
        }

        const effectiveCount = barriers.filter(b => b.status === "effective").length;
        const overallDefenseScore = barriers.length > 0 
            ? Math.round((effectiveCount / barriers.length) * 100) 
            : 50;

        return {
            barriers,
            failedBarriers,
            missingBarriers,
            overallDefenseScore,
            criticalGaps: missingBarriers.map(b => `Barrière ${b.type} manquante`),
            recommendations: failedBarriers.map(b => `Renforcer la barrière ${b.type}`),
        };
    }

    private parseBowTieResponse(content: string, incident: Incident): BowTieModel {
        // Try JSON parsing
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.hazard) {
                    return parsed;
                }
            } catch {
                // Fall through
            }
        }

        // Text-based parsing
        const threats: BowTieThreat[] = [];
        const consequences: BowTieConsequence[] = [];

        // Extract threats
        const threatMatches = content.matchAll(/menace[^:]*[:\s]+(.+?)(?=\n|$)/gi);
        let threatIndex = 0;
        for (const match of threatMatches) {
            threats.push({
                id: `threat-${threatIndex++}`,
                description: match[1].trim(),
                category: "operational",
                likelihood: 3,
                preventiveBarriers: [],
            });
        }

        // Extract consequences
        const consequenceMatches = content.matchAll(/conséquence[^:]*[:\s]+(.+?)(?=\n|$)/gi);
        let consequenceIndex = 0;
        for (const match of consequenceMatches) {
            consequences.push({
                id: `consequence-${consequenceIndex++}`,
                description: match[1].trim(),
                category: "safety",
                severity: 3,
                mitigatingBarriers: [],
            });
        }

        // Calculate residual risk
        const riskScore = threats.length > 0 && consequences.length > 0
            ? Math.round((threats.reduce((s, t) => s + t.likelihood, 0) / threats.length) *
                (consequences.reduce((s, c) => s + c.severity, 0) / consequences.length) * 4)
            : 50;

        return {
            hazard: incident.type,
            hazardDescription: incident.description,
            threats,
            consequences,
            preventiveBarriers: [],
            mitigatingBarriers: [],
            residualRiskScore: riskScore,
        };
    }

    private parseTripodResponse(content: string): TripodAnalysis {
        // Try JSON parsing
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.activeFailures) {
                    return parsed;
                }
            } catch {
                // Fall through
            }
        }

        // Text-based parsing
        const activeFailures: string[] = [];
        const preconditions: TripodPrecondition[] = [];
        const latentFailures: TripodPrecondition[] = [];
        const organizationalFactors: string[] = [];
        const recoveryOpportunities: string[] = [];

        // Extract active failures
        const activeMatch = content.match(/défaillances? actives?[:\s]*\n([\s\S]*?)(?=\n\n|préconditions?|$)/i);
        if (activeMatch) {
            const lines = activeMatch[1].matchAll(/[-•*]\s*(.+?)(?=\n|$)/g);
            for (const line of lines) {
                activeFailures.push(line[1].trim());
            }
        }

        // Extract preconditions
        const precondMatch = content.match(/préconditions?[:\s]*\n([\s\S]*?)(?=\n\n|défaillances? latentes?|$)/i);
        if (precondMatch) {
            const lines = precondMatch[1].matchAll(/[-•*]\s*(.+?)(?=\n|$)/g);
            let index = 0;
            for (const line of lines) {
                preconditions.push({
                    id: `precond-${index++}`,
                    category: "procedures",
                    description: line[1].trim(),
                    isLatentFailure: false,
                });
            }
        }

        // Extract latent failures
        const latentMatch = content.match(/défaillances? latentes?[:\s]*\n([\s\S]*?)(?=\n\n|facteurs? organisationnels?|$)/i);
        if (latentMatch) {
            const lines = latentMatch[1].matchAll(/[-•*]\s*(.+?)(?=\n|$)/g);
            let index = 0;
            for (const line of lines) {
                latentFailures.push({
                    id: `latent-${index++}`,
                    category: "organization",
                    description: line[1].trim(),
                    isLatentFailure: true,
                });
            }
        }

        // Extract organizational factors
        const orgMatch = content.match(/facteurs? organisationnels?[:\s]*\n([\s\S]*?)(?=\n\n|opportunités?|$)/i);
        if (orgMatch) {
            const lines = orgMatch[1].matchAll(/[-•*]\s*(.+?)(?=\n|$)/g);
            for (const line of lines) {
                organizationalFactors.push(line[1].trim());
            }
        }

        // Extract recovery opportunities
        const recoveryMatch = content.match(/opportunités?[^:]*récupération[:\s]*\n([\s\S]*?)(?=\n\n|$)/i);
        if (recoveryMatch) {
            const lines = recoveryMatch[1].matchAll(/[-•*]\s*(.+?)(?=\n|$)/g);
            for (const line of lines) {
                recoveryOpportunities.push(line[1].trim());
            }
        }

        return {
            activeFailures,
            preconditions,
            latentFailures,
            organizationalFactors,
            recoveryOpportunities,
            systemicIssues: latentFailures.map(lf => lf.description),
        };
    }

    private createDefaultFactor(description: string): ContributingFactor {
        return {
            id: `factor-default`,
            description,
            category: "unknown",
            isPrimary: true,
            confidence: 0.5,
        };
    }

    // ============================================================================
    // Response Parsing Helpers
    // ============================================================================

    private parseAnalysisResponse(
        content: string,
        incident: Incident
    ): IncidentAnalysisResult {
        // Extract root cause from response
        const rootCauseMatch = content.match(
            /cause racine[:\s]+(.+?)(?=\n|$)/i
        );
        const rootCause = rootCauseMatch?.[1]?.trim() || "À déterminer";

        // Extract contributing factors
        const factorMatches = content.matchAll(
            /\*\*?(Humain|Machine|Méthode|Milieu|Matière|Management)\*?\*?[:\s]+(.+?)(?=\n|$)/gi
        );
        const contributingFactors: string[] = [];
        for (const match of factorMatches) {
            contributingFactors.push(`${match[1]}: ${match[2].trim()}`);
        }

        // Extract immediate actions
        const immediateActionsMatch = content.match(
            /actions? immédiates?[:\s]*\n([\s\S]*?)(?=\n\n|actions? préventives?|$)/i
        );
        const immediateActions: string[] = [];
        if (immediateActionsMatch) {
            const actionMatches = immediateActionsMatch[1].matchAll(/[-•*]\s*(.+?)(?=\n|$)/g);
            for (const m of actionMatches) {
                immediateActions.push(m[1].trim());
            }
        }

        // Extract preventive measures
        const preventiveMatch = content.match(
            /(?:mesures? préventives?|actions? préventives?)[:\s]*\n([\s\S]*?)(?=\n\n|$)/i
        );
        const preventiveMeasures: string[] = [];
        if (preventiveMatch) {
            const measureMatches = preventiveMatch[1].matchAll(/[-•*]\s*(.+?)(?=\n|$)/g);
            for (const m of measureMatches) {
                preventiveMeasures.push(m[1].trim());
            }
        }

        // Determine root cause category
        const categoryMap: Record<string, string> = {
            humain: "human",
            machine: "equipment",
            méthode: "process",
            milieu: "environment",
            matière: "material",
            management: "organizational",
        };
        let rootCauseCategory = "process";
        for (const [fr, en] of Object.entries(categoryMap)) {
            if (rootCause.toLowerCase().includes(fr) || content.toLowerCase().includes(fr)) {
                rootCauseCategory = en;
                break;
            }
        }

        // Default suggested CAPAs from AI response
        const suggestedCapas = this.extractSuggestedCapasFromText(content, incident);

        return {
            incidentId: incident.id,
            rootCause,
            rootCauseCategory,
            contributingFactors,
            immediateActions,
            preventiveMeasures,
            suggestedCapas,
            similarIncidents: [], // Populated by findSimilarIncidents if called
            confidence: 0.85,
        };
    }

    private parseFiveWhysResponse(
        content: string,
        problem: string
    ): {
        problem: string;
        whys: string[];
        rootCause: string;
        contributingFactors: Array<{ category: string; factor: string }>;
    } {
        const whyMatches = content.matchAll(
            /(\d+)\.\s*Pourquoi\s*\??\s*→?\s*(.+?)(?=\n|$)/gi
        );
        const whys: string[] = [];
        for (const match of whyMatches) {
            whys.push(match[2].trim());
        }

        const rootCauseMatch = content.match(
            /cause racine[:\s]+(.+?)(?=\n|$)/i
        );
        const rootCause = rootCauseMatch?.[1]?.trim() || whys[whys.length - 1] || "";

        const factorMatches = content.matchAll(
            /\*\*?(Humain|Machine|Méthode|Milieu|Matière|Management)\*?\*?[:\s]+(.+?)(?=\n|$)/gi
        );
        const contributingFactors: Array<{ category: string; factor: string }> = [];
        for (const match of factorMatches) {
            contributingFactors.push({
                category: match[1],
                factor: match[2].trim(),
            });
        }

        return {
            problem,
            whys,
            rootCause,
            contributingFactors,
        };
    }

    private parseSimilarIncidentsResponse(
        _content: string
    ): Array<{
        id: string;
        reference: string;
        description: string;
        similarity: number;
        commonFactors: string[];
        actionsTaken: string[];
    }> {
        // The AI response should contain formatted similar incidents
        // This is a simplified parser - in production, use structured output
        const incidents: Array<{
            id: string;
            reference: string;
            description: string;
            similarity: number;
            commonFactors: string[];
            actionsTaken: string[];
        }> = [];

        // Parse from tool execution results if available
        // For now, return empty array - actual data comes from tools
        return incidents;
    }

    private parseCAPASuggestions(
        content: string,
        incident: Incident
    ): SuggestedCapa[] {
        return this.extractSuggestedCapasFromText(content, incident);
    }

    private extractSuggestedCapasFromText(
        content: string,
        incident: Incident
    ): SuggestedCapa[] {
        const capas: SuggestedCapa[] = [];

        // Look for structured CAPA suggestions
        const capaBlocks = content.split(/(?=###?\s*(?:CAPA|Action))/i);

        for (const block of capaBlocks) {
            if (block.length < 50) continue;

            const titleMatch = block.match(
                /(?:CAPA|Action)[^:]*[:\s]+(.+?)(?=\n|$)/i
            );
            const typeMatch = block.match(
                /Type[:\s]+(correct|prévent)/i
            );
            const priorityMatch = block.match(
                /Priorité[:\s]+(critique|haute|moyenne|basse)/i
            );

            if (titleMatch) {
                const priorityMap: Record<string, "critique" | "haute" | "moyenne" | "basse"> = {
                    critique: "critique",
                    haute: "haute",
                    moyenne: "moyenne",
                    basse: "basse",
                };

                const dueDays = this.extractDueDays(block, incident.severity);
                const suggestedDueDate = new Date();
                suggestedDueDate.setDate(suggestedDueDate.getDate() + dueDays);

                capas.push({
                    title: titleMatch[1].trim().substring(0, 100),
                    description: block.substring(0, 500),
                    category: typeMatch?.[1]?.toLowerCase().startsWith("correct")
                        ? "correctif"
                        : "preventif",
                    priority: priorityMap[priorityMatch?.[1]?.toLowerCase() || "moyenne"] || "moyenne",
                    reasoning: `Suggestion basée sur l'analyse de l'incident ${incident.reference}`,
                    confidence: 0.8,
                    suggestedDueDate,
                });
            }
        }

        // If no structured CAPAs found, create defaults
        if (capas.length === 0) {
            const dueDays = this.extractDueDays("", incident.severity);
            const suggestedDueDate = new Date();
            suggestedDueDate.setDate(suggestedDueDate.getDate() + dueDays);

            capas.push({
                title: `Action corrective: ${incident.type}`,
                description: `Action corrective suite à l'incident ${incident.reference}`,
                category: "correctif",
                priority:
                    incident.severity === "critical"
                        ? "critique"
                        : incident.severity === "severe"
                            ? "haute"
                            : "moyenne",
                reasoning: "Génération automatique basée sur la gravité de l'incident",
                confidence: 0.7,
                suggestedDueDate,
            });
        }

        return capas;
    }

    private extractDueDays(text: string, severity: string): number {
        const delayMatch = text.match(/(\d+)\s*jours/i);
        if (delayMatch) {
            return parseInt(delayMatch[1], 10);
        }

        // Default based on severity
        switch (severity) {
            case "critical":
                return 7;
            case "severe":
                return 14;
            case "moderate":
                return 30;
            default:
                return 30;
        }
    }

    private parseEffectivenessAnalysis(content: string): {
        score: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    } {
        // Extract score if mentioned
        const scoreMatch = content.match(/(\d+)\s*[/%]/);
        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 70;

        // Extract lists
        const strengths = this.extractListItems(content, "Force|Point fort|Avantage");
        const weaknesses = this.extractListItems(content, "Faiblesse|Point faible|Risque");
        const recommendations = this.extractListItems(content, "Recommandation|Suggestion|Amélioration");

        return {
            score: Math.min(100, Math.max(0, score)),
            strengths,
            weaknesses,
            recommendations,
        };
    }

    private extractListItems(text: string, headerPattern: string): string[] {
        const items: string[] = [];
        const regex = new RegExp(
            `(?:${headerPattern})[s:]?\\s*\\n([\\s\\S]*?)(?=\\n(?:${headerPattern}|$))`,
            "gi"
        );
        const match = regex.exec(text);

        if (match) {
            const listText = match[1];
            const itemMatches = listText.matchAll(/[-•*]\s*(.+?)(?=\n|$)/g);
            for (const item of itemMatches) {
                items.push(item[1].trim());
            }
        }

        return items;
    }
}

// =============================================================================
// Singleton
// =============================================================================

let capaAIInstance: CAPAAIService | null = null;

export function getCAPAAIService(): CAPAAIService {
    if (!capaAIInstance) {
        capaAIInstance = new CAPAAIService();
    }
    return capaAIInstance;
}

export function resetCAPAAIService(): void {
    capaAIInstance = null;
}

/**
 * Check if CAPA-AI is enabled
 */
export function isCAPAAIEnabled(): boolean {
    return isGeminiEnabled();
}

