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
    SuggestedCapa
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

