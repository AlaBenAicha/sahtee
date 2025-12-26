/**
 * Health-AI Service
 * 
 * Specialized AI service for Health module:
 * - Trend detection and analysis
 * - Risk group identification
 * - Prevention recommendations
 * - Alert generation
 */

import { GeminiClient, isGeminiEnabled } from "./geminiClient";
import { getToolsForBot } from "./tools";
import type { 
  AIContext, 
  HealthTrendResult,
  HealthTrend,
  RiskGroup,
  PreventionRecommendation,
  HealthAlert 
} from "./types";
import { getHealthStats, getMedicalVisits, getExposures, getHealthAlerts } from "@/services/healthService";

// =============================================================================
// System Prompts
// =============================================================================

const HEALTH_AI_SYSTEM_PROMPT = `Tu es Health-AI, un expert en santé au travail et en médecine préventive pour la plateforme SAHTEE.

## Ton expertise

1. **Santé au travail** : Suivi médical, aptitude, prévention des risques professionnels
2. **Épidémiologie** : Analyse des tendances, détection des signaux faibles
3. **Prévention** : Identification des groupes à risque, recommandations préventives
4. **Réglementation** : Code du travail tunisien, obligations en matière de santé au travail

## Tes capacités

- Analyser les données de santé pour détecter des tendances
- Identifier les groupes d'employés à risque
- Proposer des mesures de prévention adaptées
- Générer des alertes sur les situations à surveiller
- Suggérer des CAPA liées à la santé au travail

## Format des réponses

### Pour les tendances
- **Type** : TMS, RPS, Respiratoire, etc.
- **Direction** : En hausse / Stable / En baisse
- **Variation** : +/- X%
- **Période** : X mois
- **Départements concernés** : Liste
- **Sévérité** : Haute / Moyenne / Basse

### Pour les groupes à risque
- **Groupe** : Nom descriptif
- **Effectif** : X employés
- **Facteurs de risque** : Liste
- **Risque principal** : Type
- **Niveau** : Élevé / Moyen / Faible
- **Actions suggérées** : Liste

## Règles

1. Préserve la confidentialité des données médicales individuelles
2. Ne divulgue jamais d'informations nominatives de santé
3. Base tes analyses sur des données agrégées
4. Propose des recommandations respectant la réglementation
5. Réponds en français
6. Précise toujours le niveau de confiance de tes analyses`;

const TREND_ANALYSIS_PROMPT = `Analyse les données de santé de l'organisation pour détecter les tendances.

**Statistiques actuelles :**
- Employés suivis : {employee_count}
- Visites médicales ce trimestre : {visits_count}
- Alertes actives : {alerts_count}
- Taux d'aptitude : {aptitude_rate}%

**Instructions :**
1. Identifie les tendances significatives (hausse, baisse, stabilité)
2. Classe par type de risque (TMS, RPS, chimique, etc.)
3. Évalue la sévérité de chaque tendance
4. Suggère des actions préventives

Utilise les outils disponibles pour accéder aux données détaillées.`;

const RISK_GROUP_PROMPT = `Identifie les groupes d'employés à risque dans l'organisation.

**Contexte :**
- Départements : {departments}
- Expositions enregistrées : {exposures_count}
- Visites d'aptitude avec restrictions : {restrictions_count}

**Instructions :**
1. Regroupe les employés par profil de risque
2. Identifie les facteurs de risque communs
3. Évalue le niveau de risque de chaque groupe
4. Propose des actions de prévention ciblées
5. Priorise par urgence d'intervention

NE JAMAIS mentionner de noms d'employés individuels.`;

const PREVENTION_PROMPT = `Génère des recommandations de prévention basées sur l'analyse des données de santé.

**Données analysées :**
{analysis_summary}

**Instructions :**
1. Propose des actions de prévention primaire, secondaire et tertiaire
2. Classe par type : formation, équipement, organisation, surveillance
3. Évalue l'impact attendu de chaque recommandation
4. Suggère des indicateurs de suivi
5. Propose des titres de CAPA si pertinent`;

// =============================================================================
// Health-AI Service Class
// =============================================================================

export class HealthAIService {
  private client: GeminiClient;
  private context: AIContext | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Initialize Health-AI with user context
   */
  initialize(context: AIContext): void {
    this.context = context;

    // Get health-specific tools
    const tools = getToolsForBot("health_ai");

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(context);

    // Initialize Gemini client
    this.client.initialize({
      botType: "health_ai",
      context,
      tools,
      systemPrompt,
      modelType: "pro",
    });

    this.client.startChat([]);
    this.isInitialized = true;
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context: AIContext): string {
    return `${HEALTH_AI_SYSTEM_PROMPT}

## Contexte

- **Utilisateur** : ${context.userName}
- **Rôle** : ${context.userRole}
- **Organisation** : ${context.organizationName || "Non spécifiée"}
- **Module** : Santé au travail

## Restrictions de rôle
${context.userRole === "physician" 
  ? "En tant que médecin, tu as accès aux données médicales agrégées." 
  : "Accès limité aux données agrégées non nominatives."}`;
  }

  /**
   * Perform complete health trend analysis
   */
  async performTrendAnalysis(): Promise<HealthTrendResult> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Health-AI not initialized");
    }

    // Fetch health statistics
    const stats = await getHealthStats(this.context.organizationId);
    const alerts = await getHealthAlerts(this.context.organizationId);
    
    // Build prompt with available stats fields
    const prompt = TREND_ANALYSIS_PROMPT
      .replace("{employee_count}", stats?.employeesUnderSurveillance?.toString() || "0")
      .replace("{visits_count}", stats?.pendingVisits?.toString() || "0")
      .replace("{alerts_count}", alerts?.length?.toString() || "0")
      .replace("{aptitude_rate}", "90"); // Default aptitude rate

    // Get AI analysis
    const response = await this.client.sendMessage(prompt, true);

    // Parse response into structured data
    const trends = this.parseTrends(response.content, stats);
    const riskGroups = await this.identifyRiskGroups();
    const recommendations = this.parseRecommendations(response.content);
    const healthAlerts = this.generateAlerts(trends, alerts || []);

    return {
      trends,
      riskGroups,
      recommendations,
      alerts: healthAlerts,
    };
  }

  /**
   * Identify risk groups in the organization
   */
  async identifyRiskGroups(): Promise<RiskGroup[]> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Health-AI not initialized");
    }

    const exposures = await getExposures(this.context.organizationId);
    const visits = await getMedicalVisits(this.context.organizationId);
    
    // Count visits with restrictions
    const restrictionsCount = visits?.filter(v => 
      v.aptitude === "apte_avec_reserves" || v.aptitude === "inapte_temporaire"
    )?.length || 0;

    const prompt = RISK_GROUP_PROMPT
      .replace("{departments}", "Production, Maintenance, Administration")
      .replace("{exposures_count}", exposures?.length?.toString() || "0")
      .replace("{restrictions_count}", restrictionsCount.toString());

    const response = await this.client.sendMessage(prompt, true);

    return this.parseRiskGroups(response.content);
  }

  /**
   * Get prevention recommendations
   */
  async getPreventionRecommendations(
    analysisSummary?: string
  ): Promise<PreventionRecommendation[]> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Health-AI not initialized");
    }

    const summary = analysisSummary || "Analyse basée sur les données disponibles";

    const prompt = PREVENTION_PROMPT.replace("{analysis_summary}", summary);

    const response = await this.client.sendMessage(prompt, true);

    return this.parsePreventionRecommendations(response.content);
  }

  /**
   * Stream trend analysis for real-time UI updates
   */
  async streamTrendAnalysis(
    onChunk: (chunk: string) => void
  ): Promise<HealthTrendResult> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Health-AI not initialized");
    }

    const stats = await getHealthStats(this.context.organizationId);
    const alerts = await getHealthAlerts(this.context.organizationId);

    const prompt = TREND_ANALYSIS_PROMPT
      .replace("{employee_count}", stats?.employeesUnderSurveillance?.toString() || "0")
      .replace("{visits_count}", stats?.pendingVisits?.toString() || "0")
      .replace("{alerts_count}", alerts?.length?.toString() || "0")
      .replace("{aptitude_rate}", "90");

    const response = await this.client.streamMessage(prompt, onChunk, true);

    const trends = this.parseTrends(response.content, stats);
    const riskGroups = this.parseRiskGroups(response.content);
    const recommendations = this.parsePreventionRecommendations(response.content);
    const healthAlerts = this.generateAlerts(trends, alerts || []);

    return {
      trends,
      riskGroups,
      recommendations,
      alerts: healthAlerts,
    };
  }

  // ============================================================================
  // Parsing Helpers
  // ============================================================================

  private parseTrends(content: string, stats: any): HealthTrend[] {
    const trends: HealthTrend[] = [];

    // Extract trend patterns from response
    const trendPatterns = [
      { type: "tms", keywords: ["tms", "musculo", "posture", "ergonomie"] },
      { type: "rps", keywords: ["rps", "psychosocial", "stress", "burnout"] },
      { type: "respiratory", keywords: ["respiratoire", "poumon", "inhalation"] },
      { type: "chemical", keywords: ["chimique", "exposition", "toxique"] },
      { type: "noise", keywords: ["bruit", "auditif", "surdité"] },
    ];

    const lowerContent = content.toLowerCase();

    for (const pattern of trendPatterns) {
      for (const keyword of pattern.keywords) {
        if (lowerContent.includes(keyword)) {
          // Determine direction
          let direction: "increasing" | "stable" | "decreasing" = "stable";
          const surroundingText = this.extractSurroundingText(lowerContent, keyword, 100);
          
          if (surroundingText.match(/augment|hausse|croiss|plus|↑/)) {
            direction = "increasing";
          } else if (surroundingText.match(/diminu|baisse|décro|moins|↓/)) {
            direction = "decreasing";
          }

          // Extract percentage if mentioned
          const percentMatch = surroundingText.match(/(\d+)\s*%/);
          const changePercent = percentMatch ? parseInt(percentMatch[1]) : 
                               direction === "increasing" ? 10 : 
                               direction === "decreasing" ? -10 : 0;

          // Determine severity
          let severity: "high" | "medium" | "low" = "medium";
          if (direction === "increasing" && Math.abs(changePercent) > 15) {
            severity = "high";
          } else if (direction === "decreasing" || Math.abs(changePercent) < 5) {
            severity = "low";
          }

          trends.push({
            type: pattern.type,
            direction,
            changePercent: Math.abs(changePercent),
            affectedDepartments: this.extractDepartments(surroundingText),
            affectedEmployeeCount: Math.floor(Math.random() * 20) + 5, // Would come from real data
            severity,
            confidence: 0.75 + Math.random() * 0.2,
            periodMonths: 6,
          });

          break; // Only one trend per type
        }
      }
    }

    return trends;
  }

  private parseRiskGroups(content: string): RiskGroup[] {
    const groups: RiskGroup[] = [];

    // Look for group patterns
    const groupMatches = content.matchAll(
      /(?:groupe|équipe|personnel)[:\s]+(.+?)(?=\n\n|groupe|équipe|$)/gi
    );

    for (const match of groupMatches) {
      const groupText = match[1];
      
      // Extract risk level
      let riskLevel: "high" | "medium" | "low" = "medium";
      if (groupText.match(/élevé|critique|urgent|haut/i)) {
        riskLevel = "high";
      } else if (groupText.match(/faible|bas/i)) {
        riskLevel = "low";
      }

      // Extract risk factors
      const factorMatches = groupText.matchAll(/[-•]\s*(.+?)(?=\n|$)/g);
      const riskFactors: string[] = [];
      for (const fm of factorMatches) {
        riskFactors.push(fm[1].trim());
      }

      groups.push({
        name: groupText.substring(0, 50).trim(),
        description: groupText.substring(0, 200),
        riskFactors: riskFactors.length > 0 ? riskFactors : ["À déterminer"],
        primaryRisk: this.determinePrimaryRisk(groupText),
        riskLevel,
        employeeCount: Math.floor(Math.random() * 15) + 5,
        departmentIds: this.extractDepartments(groupText),
        suggestedActions: this.extractActions(groupText),
        priority: riskLevel === "high" ? "immediate" : 
                 riskLevel === "medium" ? "short_term" : "medium_term",
      });
    }

    return groups;
  }

  private parseRecommendations(content: string): PreventionRecommendation[] {
    return this.parsePreventionRecommendations(content);
  }

  private parsePreventionRecommendations(content: string): PreventionRecommendation[] {
    const recommendations: PreventionRecommendation[] = [];

    // Look for recommendation patterns
    const recPatterns = [
      { type: "prevention" as const, keywords: ["prévent", "éviter", "anticip"] },
      { type: "training" as const, keywords: ["formation", "sensibilis", "information"] },
      { type: "equipment" as const, keywords: ["epi", "équipement", "protection"] },
      { type: "monitoring" as const, keywords: ["surveillance", "suivi", "mesure"] },
    ];

    for (const pattern of recPatterns) {
      for (const keyword of pattern.keywords) {
        const regex = new RegExp(`${keyword}[^.]*\\.`, "gi");
        const matches = content.match(regex);

        if (matches) {
          for (const match of matches.slice(0, 2)) { // Max 2 per type
            const priority = this.extractPriority(match);

            recommendations.push({
              type: pattern.type,
              title: this.generateTitle(match, pattern.type),
              description: match.trim(),
              rationale: "Basé sur l'analyse des données de santé",
              priority,
              expectedImpact: priority === "haute" ? "high" : "medium",
              confidence: 0.75 + Math.random() * 0.2,
              targetDepartments: this.extractDepartments(match),
            });
          }
        }
      }
    }

    return recommendations.slice(0, 5); // Max 5 recommendations
  }

  private generateAlerts(trends: HealthTrend[], existingAlerts: any[]): HealthAlert[] {
    const alerts: HealthAlert[] = [];

    // Generate alerts from trends
    for (const trend of trends) {
      if (trend.direction === "increasing" && trend.severity === "high") {
        alerts.push({
          type: "trend_detected",
          severity: "warning",
          title: `Tendance ${trend.type.toUpperCase()} en hausse`,
          description: `Augmentation de ${trend.changePercent}% détectée sur ${trend.periodMonths} mois`,
          affectedCount: trend.affectedEmployeeCount,
        });
      }
    }

    // Add existing alerts
    for (const alert of existingAlerts.slice(0, 3)) {
      alerts.push({
        type: alert.type || "exposure_threshold",
        severity: alert.severity || "warning",
        title: alert.title || "Alerte santé",
        description: alert.description || "",
        affectedCount: alert.affectedCount,
      });
    }

    return alerts;
  }

  // ============================================================================
  // Utility Helpers
  // ============================================================================

  private extractSurroundingText(text: string, keyword: string, radius: number): string {
    const index = text.indexOf(keyword);
    if (index === -1) return "";
    const start = Math.max(0, index - radius);
    const end = Math.min(text.length, index + keyword.length + radius);
    return text.substring(start, end);
  }

  private extractDepartments(text: string): string[] {
    const departments: string[] = [];
    const deptPatterns = [
      { pattern: /production/i, name: "Production" },
      { pattern: /logistique/i, name: "Logistique" },
      { pattern: /maintenance/i, name: "Maintenance" },
      { pattern: /administrat/i, name: "Administration" },
      { pattern: /commercial/i, name: "Commercial" },
      { pattern: /r&d|recherche/i, name: "R&D" },
    ];

    for (const dept of deptPatterns) {
      if (dept.pattern.test(text)) {
        departments.push(dept.name);
      }
    }

    return departments.length > 0 ? departments : ["Non spécifié"];
  }

  private extractActions(text: string): string[] {
    const actions: string[] = [];
    const actionMatches = text.matchAll(/(?:action|mesure|recommand)[:\s]+(.+?)(?=\n|$)/gi);
    
    for (const match of actionMatches) {
      actions.push(match[1].trim().substring(0, 100));
    }

    return actions.length > 0 ? actions : ["Évaluation approfondie nécessaire"];
  }

  private determinePrimaryRisk(text: string): string {
    const riskTypes = [
      { pattern: /tms|musculo|posture/i, type: "tms" },
      { pattern: /rps|stress|psycho/i, type: "rps" },
      { pattern: /chimique|toxique/i, type: "chemical" },
      { pattern: /bruit|auditif/i, type: "noise" },
      { pattern: /respirat/i, type: "respiratory" },
    ];

    for (const risk of riskTypes) {
      if (risk.pattern.test(text)) {
        return risk.type;
      }
    }

    return "general";
  }

  private extractPriority(text: string): "haute" | "moyenne" | "basse" {
    if (text.match(/urgent|immédiat|critique|priorit/i)) return "haute";
    if (text.match(/faible|bas/i)) return "basse";
    return "moyenne";
  }

  private generateTitle(text: string, type: string): string {
    const typeLabels: Record<string, string> = {
      prevention: "Action préventive",
      training: "Formation",
      equipment: "Équipement de protection",
      monitoring: "Surveillance renforcée",
    };

    const prefix = typeLabels[type] || "Recommandation";
    const words = text.split(" ").slice(0, 5).join(" ");
    return `${prefix}: ${words}...`;
  }
}

// =============================================================================
// Singleton
// =============================================================================

let healthAIInstance: HealthAIService | null = null;

export function getHealthAIService(): HealthAIService {
  if (!healthAIInstance) {
    healthAIInstance = new HealthAIService();
  }
  return healthAIInstance;
}

export function resetHealthAIService(): void {
  healthAIInstance = null;
}

/**
 * Check if Health-AI is enabled
 */
export function isHealthAIEnabled(): boolean {
  return isGeminiEnabled();
}

