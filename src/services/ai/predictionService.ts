/**
 * Prediction Service
 *
 * Uses pattern recognition and historical data to predict potential risks
 * and generate proactive recommendations.
 */

import { GeminiClient, isGeminiEnabled } from "./geminiClient";
import { getToolsForBot } from "./tools";
import {
  getPatternService,
  type PatternAnalysisResult,
} from "./patternService";
import type {
  AIContext,
  PredictiveInsight,
  PredictiveFactor,
  SuggestedCapa,
  PatternCluster,
} from "./types";
import type { Incident } from "@/types/capa";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

// =============================================================================
// Types
// =============================================================================

export interface PredictionResult {
  insights: PredictiveInsight[];
  overallRiskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  confidenceLevel: number;
  analysisDate: Date;
  nextRecommendedAnalysis: Date;
  alerts: PredictionAlert[];
}

export interface PredictionAlert {
  id: string;
  type: "imminent" | "trending" | "threshold" | "pattern";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  affectedAreas: string[];
  suggestedAction: string;
  expiresAt: Date;
}

export interface RiskForecast {
  timeHorizon: "24h" | "7d" | "30d" | "90d";
  riskScore: number;
  trend: "increasing" | "stable" | "decreasing";
  confidence: number;
  contributingFactors: string[];
}

export interface DepartmentRisk {
  departmentId: string;
  departmentName: string;
  riskScore: number;
  incidentCount: number;
  trend: "increasing" | "stable" | "decreasing";
  topRisks: string[];
  suggestedActions: SuggestedCapa[];
}

// =============================================================================
// System Prompts
// =============================================================================

const PREDICTION_SYSTEM_PROMPT = `Tu es un expert en analyse prédictive des risques de sécurité au travail.

À partir des patterns historiques et des données actuelles, tu dois :

1. **Identifier les risques imminents** : Situations susceptibles de causer des incidents dans les prochaines 24-72h

2. **Détecter les tendances émergentes** : Patterns en développement qui pourraient devenir problématiques

3. **Calculer des scores de risque** : Évaluer la probabilité et la gravité potentielle

4. **Proposer des actions préventives** : Mesures concrètes pour réduire les risques

Facteurs à considérer :
- Patterns historiques d'incidents
- Tendances saisonnières et temporelles
- État des équipements et maintenances
- Formations récentes ou manquantes
- Changements organisationnels
- Conditions environnementales

Utilise une approche basée sur les données et fournit des niveaux de confiance pour chaque prédiction.`;

const RISK_PREDICTION_PROMPT = `Analyse ces données et génère des prédictions de risque.

**Patterns identifiés :**
{patterns_data}

**Incidents récents (30 jours) :**
{recent_incidents}

**Facteurs contextuels :**
- Organisation : {org_name}
- Date d'analyse : {analysis_date}

Génère des prédictions pour les horizons : 24h, 7j, 30j, 90j.

Pour chaque prédiction, fournis :
1. Type de risque
2. Score de risque (0-100)
3. Niveau de confiance (%)
4. Facteurs contributifs
5. Actions préventives recommandées
6. Départements/zones affectés

Format ta réponse en JSON structuré.`;

// =============================================================================
// Prediction Service Class
// =============================================================================

export class PredictionService {
  private client: GeminiClient;
  private context: AIContext | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Initialize the prediction service
   */
  initialize(context: AIContext): void {
    this.context = context;

    const tools = getToolsForBot("capa_ai");

    this.client.initialize({
      botType: "capa_ai",
      context,
      tools,
      systemPrompt: PREDICTION_SYSTEM_PROMPT,
      modelType: "pro",
    });

    this.client.startChat([]);
    this.isInitialized = true;
  }

  /**
   * Generate comprehensive prediction analysis
   */
  async generatePredictions(): Promise<PredictionResult> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Prediction service not initialized");
    }

    // Get pattern analysis
    const patternService = getPatternService();
    patternService.initialize(this.context);
    const patternAnalysis = await patternService.analyzePatterns(365);

    // Fetch recent incidents
    const recentIncidents = await this.fetchRecentIncidents(30);

    // Generate predictions using AI
    const insights = await this.generatePredictiveInsights(
      patternAnalysis,
      recentIncidents
    );

    // Generate alerts
    const alerts = this.generateAlerts(insights, patternAnalysis);

    // Calculate overall risk
    const { riskLevel, riskScore } = this.calculateOverallRisk(insights);

    // Calculate confidence
    const confidenceLevel = this.calculateConfidenceLevel(
      patternAnalysis,
      recentIncidents.length
    );

    return {
      insights,
      overallRiskLevel: riskLevel,
      riskScore,
      confidenceLevel,
      analysisDate: new Date(),
      nextRecommendedAnalysis: this.calculateNextAnalysisDate(riskLevel),
      alerts,
    };
  }

  /**
   * Generate risk forecasts for different time horizons
   */
  async generateRiskForecasts(): Promise<RiskForecast[]> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Prediction service not initialized");
    }

    const predictions = await this.generatePredictions();

    const timeHorizons: Array<"24h" | "7d" | "30d" | "90d"> = [
      "24h",
      "7d",
      "30d",
      "90d",
    ];

    return timeHorizons.map((horizon) => {
      const relevantInsights = predictions.insights.filter(
        (i) => i.timeHorizon === horizon
      );

      const avgScore =
        relevantInsights.length > 0
          ? relevantInsights.reduce((sum, i) => sum + i.riskScore, 0) /
            relevantInsights.length
          : predictions.riskScore * (1 - timeHorizons.indexOf(horizon) * 0.15);

      const contributingFactors = relevantInsights
        .flatMap((i) => i.triggeringFactors.map((f) => f.factor))
        .slice(0, 5);

      return {
        timeHorizon: horizon,
        riskScore: Math.round(avgScore),
        trend: this.determineTrend(relevantInsights),
        confidence:
          predictions.confidenceLevel * (1 - timeHorizons.indexOf(horizon) * 0.1),
        contributingFactors:
          contributingFactors.length > 0
            ? contributingFactors
            : ["Données insuffisantes"],
      };
    });
  }

  /**
   * Generate department-specific risk analysis
   */
  async getDepartmentRisks(): Promise<DepartmentRisk[]> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Prediction service not initialized");
    }

    const predictions = await this.generatePredictions();
    const departmentMap = new Map<string, DepartmentRisk>();

    // Aggregate by department
    for (const insight of predictions.insights) {
      for (const dept of insight.affectedAreas.departments) {
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, {
            departmentId: dept,
            departmentName: dept,
            riskScore: 0,
            incidentCount: 0,
            trend: "stable",
            topRisks: [],
            suggestedActions: [],
          });
        }

        const deptRisk = departmentMap.get(dept)!;
        deptRisk.riskScore = Math.max(deptRisk.riskScore, insight.riskScore);
        deptRisk.incidentCount += insight.historicalBasis.length;
        deptRisk.topRisks.push(
          ...insight.triggeringFactors.map((f) => f.factor)
        );
        deptRisk.suggestedActions.push(...insight.preventiveActions);
      }
    }

    // Deduplicate and limit
    for (const deptRisk of departmentMap.values()) {
      deptRisk.topRisks = [...new Set(deptRisk.topRisks)].slice(0, 5);
      deptRisk.suggestedActions = deptRisk.suggestedActions.slice(0, 3);
    }

    return [...departmentMap.values()].sort(
      (a, b) => b.riskScore - a.riskScore
    );
  }

  /**
   * Get active predictions from storage
   */
  async getActivePredictions(): Promise<PredictiveInsight[]> {
    if (!this.context) return [];

    try {
      const predictionsRef = collection(
        db,
        `organizations/${this.context.organizationId}/predictions`
      );
      const q = query(
        predictionsRef,
        where("status", "==", "active"),
        where("expiresAt", ">", Timestamp.now()),
        orderBy("expiresAt"),
        limit(20)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        expiresAt: (doc.data().expiresAt as Timestamp).toDate(),
      })) as PredictiveInsight[];
    } catch (error) {
      console.error("Error fetching predictions:", error);
      return [];
    }
  }

  /**
   * Save prediction to Firestore
   */
  async savePrediction(insight: PredictiveInsight): Promise<string> {
    if (!this.context) throw new Error("Not initialized");

    const predictionsRef = collection(
      db,
      `organizations/${this.context.organizationId}/predictions`
    );

    const docRef = await addDoc(predictionsRef, {
      ...insight,
      createdAt: Timestamp.fromDate(insight.createdAt),
      expiresAt: Timestamp.fromDate(insight.expiresAt),
    });

    return docRef.id;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async fetchRecentIncidents(days: number): Promise<Incident[]> {
    if (!this.context) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Use root-level collection with organizationId filter
      const incidentsRef = collection(db, "incidents");
      const q = query(
        incidentsRef,
        where("organizationId", "==", this.context.organizationId),
        where("reportedAt", ">=", Timestamp.fromDate(startDate)),
        orderBy("reportedAt", "desc"),
        limit(100)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Incident[];
    } catch (error) {
      console.error("Error fetching recent incidents:", error);
      return [];
    }
  }

  private async generatePredictiveInsights(
    patternAnalysis: PatternAnalysisResult,
    recentIncidents: Incident[]
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Generate insights from emerging patterns
    for (const pattern of patternAnalysis.emergingPatterns) {
      if (pattern.riskLevel === "high" || pattern.growthRate >= 30) {
        insights.push(this.createInsightFromPattern(pattern, recentIncidents));
      }
    }

    // Generate insights from high-severity clusters
    for (const cluster of patternAnalysis.clusters.filter(
      (c) => c.severity === "high"
    )) {
      insights.push(this.createInsightFromCluster(cluster));
    }

    // Generate insights from location hotspots
    for (const hotspot of patternAnalysis.locationHotspots.filter(
      (h) => h.severity === "high"
    )) {
      insights.push(this.createInsightFromHotspot(hotspot, recentIncidents));
    }

    // Add temporal-based predictions
    const temporalInsights = this.createTemporalInsights(patternAnalysis);
    insights.push(...temporalInsights);

    // Use AI for additional insights if we have few
    if (insights.length < 3 && patternAnalysis.clusters.length > 0) {
      const aiInsights = await this.generateAIInsights(
        patternAnalysis,
        recentIncidents
      );
      insights.push(...aiInsights);
    }

    return insights;
  }

  private createInsightFromPattern(
    pattern: { id: string; description: string; incidentCount: number; growthRate: number; riskLevel: string; suggestedActions: string[] },
    recentIncidents: Incident[]
  ): PredictiveInsight {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      id: `pred-${pattern.id}`,
      predictionType: "trend_deviation",
      riskScore: pattern.riskLevel === "high" ? 80 : 60,
      confidenceInterval: { lower: 60, upper: 85 },
      timeHorizon: "7d",
      affectedAreas: {
        departments: this.extractDepartments(recentIncidents),
        processes: [],
        equipmentIds: [],
        employeeGroups: [],
      },
      triggeringFactors: [
        {
          category: "process",
          factor: pattern.description,
          currentValue: pattern.incidentCount,
          thresholdValue: pattern.incidentCount * 0.7,
          trendDirection: "increasing",
          contribution: 100,
          dataSource: "Pattern analysis",
        },
      ],
      preventiveActions: pattern.suggestedActions.map((action) => ({
        title: action,
        description: action,
        category: "preventif" as const,
        priority: "haute" as const,
        reasoning: `Basé sur l'analyse du pattern: ${pattern.description}`,
        confidence: 0.75,
      })),
      historicalBasis: recentIncidents.slice(0, 5).map((i) => i.id),
      createdAt: now,
      expiresAt,
      status: "active",
    };
  }

  private createInsightFromCluster(cluster: PatternCluster): PredictiveInsight {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      id: `pred-cluster-${cluster.id}`,
      predictionType: "pattern_recurrence",
      riskScore: cluster.severity === "high" ? 75 : 55,
      confidenceInterval: { lower: 55, upper: 80 },
      timeHorizon: "30d",
      affectedAreas: {
        departments: [],
        processes: [cluster.category],
        equipmentIds: [],
        employeeGroups: [],
      },
      triggeringFactors: cluster.commonFactors.map((factor) => ({
        category: "process" as const,
        factor,
        currentValue: cluster.frequency,
        thresholdValue: cluster.frequency * 1.2,
        trendDirection: cluster.trendDirection,
        contribution: 100 / cluster.commonFactors.length,
        dataSource: "Cluster analysis",
      })),
      preventiveActions: cluster.suggestedActions,
      historicalBasis: cluster.incidentIds,
      createdAt: now,
      expiresAt,
      status: "active",
    };
  }

  private createInsightFromHotspot(
    hotspot: { location: string; incidentCount: number; severity: string; commonTypes: string[]; riskScore: number },
    recentIncidents: Incident[]
  ): PredictiveInsight {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const affectedIncidents = recentIncidents.filter(
      (i) => i.location === hotspot.location
    );

    return {
      id: `pred-hotspot-${hotspot.location.replace(/\s+/g, "-")}`,
      predictionType: "imminent_risk",
      riskScore: hotspot.riskScore,
      confidenceInterval: { lower: 50, upper: 75 },
      timeHorizon: "7d",
      affectedAreas: {
        departments: this.extractDepartments(affectedIncidents),
        processes: hotspot.commonTypes,
        equipmentIds: [],
        employeeGroups: [],
      },
      triggeringFactors: [
        {
          category: "environmental" as const,
          factor: `Zone à risque: ${hotspot.location}`,
          currentValue: hotspot.incidentCount,
          thresholdValue: 2,
          trendDirection: "stable" as const,
          contribution: 100,
          dataSource: "Location analysis",
        },
      ],
      preventiveActions: [
        {
          title: `Renforcer la sécurité à ${hotspot.location}`,
          description: `Effectuer une inspection de sécurité et renforcer les mesures préventives à ${hotspot.location}`,
          category: "preventif",
          priority: "haute",
          reasoning: `${hotspot.incidentCount} incidents identifiés dans cette zone`,
          confidence: 0.8,
        },
      ],
      historicalBasis: affectedIncidents.map((i) => i.id),
      createdAt: now,
      expiresAt,
      status: "active",
    };
  }

  private createTemporalInsights(
    patternAnalysis: PatternAnalysisResult
  ): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const now = new Date();

    for (const temporalPattern of patternAnalysis.temporalPatterns) {
      if (temporalPattern.averageSeverity >= 50) {
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        insights.push({
          id: `pred-temporal-${temporalPattern.shift?.replace(/\s+/g, "-") || "generic"}`,
          predictionType: "imminent_risk",
          riskScore: temporalPattern.averageSeverity,
          confidenceInterval: { lower: 45, upper: 70 },
          timeHorizon: "24h",
          affectedAreas: {
            departments: [],
            processes: [],
            equipmentIds: [],
            employeeGroups: [temporalPattern.shift || "Tous"],
          },
          triggeringFactors: [
            {
              category: "temporal" as const,
              factor: temporalPattern.description,
              currentValue: temporalPattern.incidentCount,
              thresholdValue: temporalPattern.incidentCount * 0.5,
              trendDirection: "stable" as const,
              contribution: 100,
              dataSource: "Temporal analysis",
            },
          ],
          preventiveActions: [
            {
              title: "Renforcer la vigilance pendant cette période",
              description: `Augmenter la supervision et les rappels de sécurité pendant ${temporalPattern.shift || "les périodes à risque"}`,
              category: "preventif",
              priority: "moyenne",
              reasoning: temporalPattern.description,
              confidence: 0.65,
            },
          ],
          historicalBasis: [],
          createdAt: now,
          expiresAt,
          status: "active",
        });
      }
    }

    return insights;
  }

  private async generateAIInsights(
    patternAnalysis: PatternAnalysisResult,
    recentIncidents: Incident[]
  ): Promise<PredictiveInsight[]> {
    try {
      const prompt = RISK_PREDICTION_PROMPT
        .replace(
          "{patterns_data}",
          JSON.stringify(
            {
              clusters: patternAnalysis.clusters.length,
              emergingPatterns: patternAnalysis.emergingPatterns.length,
              hotspots: patternAnalysis.locationHotspots.length,
              overallRisk: patternAnalysis.overallRiskScore,
            },
            null,
            2
          )
        )
        .replace(
          "{recent_incidents}",
          JSON.stringify(
            recentIncidents.slice(0, 10).map((i) => ({
              type: i.type,
              severity: i.severity,
              location: i.location,
              date: i.reportedAt instanceof Date ? i.reportedAt.toISOString() : (i.reportedAt as Timestamp)?.toDate?.()?.toISOString() || "",
            })),
            null,
            2
          )
        )
        .replace("{org_name}", this.context?.organizationName || "Organisation")
        .replace("{analysis_date}", new Date().toISOString());

      const response = await this.client.sendMessage(prompt, true);

      return this.parseAIInsightsResponse(response.content);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      return [];
    }
  }

  private parseAIInsightsResponse(content: string): PredictiveInsight[] {
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const insights = Array.isArray(parsed)
          ? parsed
          : parsed.insights || parsed.predictions || [];
        return insights.map(this.normalizeInsight.bind(this));
      } catch {
        return [];
      }
    }
    return [];
  }

  private normalizeInsight(raw: Partial<PredictiveInsight>): PredictiveInsight {
    const now = new Date();
    const defaultExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      id: raw.id || `pred-${Date.now()}`,
      predictionType: raw.predictionType || "trend_deviation",
      riskScore: raw.riskScore || 50,
      confidenceInterval: raw.confidenceInterval || { lower: 40, upper: 60 },
      timeHorizon: raw.timeHorizon || "7d",
      affectedAreas: raw.affectedAreas || {
        departments: [],
        processes: [],
        equipmentIds: [],
        employeeGroups: [],
      },
      triggeringFactors: raw.triggeringFactors || [],
      preventiveActions: raw.preventiveActions || [],
      historicalBasis: raw.historicalBasis || [],
      createdAt: now,
      expiresAt: raw.expiresAt || defaultExpiry,
      status: "active",
    };
  }

  private generateAlerts(
    insights: PredictiveInsight[],
    patternAnalysis: PatternAnalysisResult
  ): PredictionAlert[] {
    const alerts: PredictionAlert[] = [];

    // High-risk insights become alerts
    for (const insight of insights.filter((i) => i.riskScore >= 70)) {
      alerts.push({
        id: `alert-${insight.id}`,
        type: insight.predictionType === "imminent_risk" ? "imminent" : "trending",
        severity: insight.riskScore >= 80 ? "critical" : "warning",
        title: this.generateAlertTitle(insight),
        description: insight.triggeringFactors[0]?.factor || "Risque identifié",
        affectedAreas: [
          ...insight.affectedAreas.departments,
          ...insight.affectedAreas.processes,
        ],
        suggestedAction: insight.preventiveActions[0]?.title || "Action requise",
        expiresAt: insight.expiresAt,
      });
    }

    // Emerging patterns with high growth
    for (const pattern of patternAnalysis.emergingPatterns.filter(
      (p) => p.growthRate >= 50
    )) {
      alerts.push({
        id: `alert-pattern-${pattern.id}`,
        type: "pattern",
        severity: pattern.riskLevel === "high" ? "warning" : "info",
        title: `Tendance émergente: ${pattern.description}`,
        description: `Augmentation de ${pattern.growthRate}% sur ${pattern.timeframe}`,
        affectedAreas: [],
        suggestedAction: pattern.suggestedActions[0] || "Surveiller la situation",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    return alerts;
  }

  private generateAlertTitle(insight: PredictiveInsight): string {
    switch (insight.predictionType) {
      case "imminent_risk":
        return "Risque imminent détecté";
      case "trend_deviation":
        return "Déviation de tendance";
      case "pattern_recurrence":
        return "Pattern récurrent identifié";
      case "exposure_threshold":
        return "Seuil d'exposition atteint";
      default:
        return "Alerte de risque";
    }
  }

  private calculateOverallRisk(
    insights: PredictiveInsight[]
  ): { riskLevel: "low" | "medium" | "high" | "critical"; riskScore: number } {
    if (insights.length === 0) {
      return { riskLevel: "low", riskScore: 20 };
    }

    const avgScore =
      insights.reduce((sum, i) => sum + i.riskScore, 0) / insights.length;
    const maxScore = Math.max(...insights.map((i) => i.riskScore));

    // Weight towards max score for safety
    const weightedScore = avgScore * 0.6 + maxScore * 0.4;

    let riskLevel: "low" | "medium" | "high" | "critical";
    if (weightedScore >= 80) riskLevel = "critical";
    else if (weightedScore >= 60) riskLevel = "high";
    else if (weightedScore >= 40) riskLevel = "medium";
    else riskLevel = "low";

    return { riskLevel, riskScore: Math.round(weightedScore) };
  }

  private calculateConfidenceLevel(
    patternAnalysis: PatternAnalysisResult,
    recentIncidentCount: number
  ): number {
    let confidence = 50; // Base confidence

    // More data = higher confidence
    if (recentIncidentCount >= 20) confidence += 15;
    else if (recentIncidentCount >= 10) confidence += 10;
    else if (recentIncidentCount >= 5) confidence += 5;

    // More patterns = better understanding
    if (patternAnalysis.clusters.length >= 5) confidence += 10;
    else if (patternAnalysis.clusters.length >= 3) confidence += 5;

    // Consistent trends = higher confidence
    if (patternAnalysis.seasonalTrends.length > 0) confidence += 5;

    return Math.min(95, confidence);
  }

  private calculateNextAnalysisDate(
    riskLevel: "low" | "medium" | "high" | "critical"
  ): Date {
    const now = new Date();
    switch (riskLevel) {
      case "critical":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case "high":
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case "medium":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
      default:
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
    }
  }

  private determineTrend(
    insights: PredictiveInsight[]
  ): "increasing" | "stable" | "decreasing" {
    if (insights.length === 0) return "stable";

    const trends = insights.flatMap((i) =>
      i.triggeringFactors.map((f) => f.trendDirection)
    );

    const increasing = trends.filter((t) => t === "increasing").length;
    const decreasing = trends.filter((t) => t === "decreasing").length;

    if (increasing > decreasing * 1.5) return "increasing";
    if (decreasing > increasing * 1.5) return "decreasing";
    return "stable";
  }

  private extractDepartments(incidents: Incident[]): string[] {
    const departments = new Set<string>();
    for (const incident of incidents) {
      if (incident.departmentId) {
        departments.add(incident.departmentId);
      }
    }
    return [...departments];
  }
}

// =============================================================================
// Singleton
// =============================================================================

let predictionServiceInstance: PredictionService | null = null;

export function getPredictionService(): PredictionService {
  if (!predictionServiceInstance) {
    predictionServiceInstance = new PredictionService();
  }
  return predictionServiceInstance;
}

export function resetPredictionService(): void {
  predictionServiceInstance = null;
}

export function isPredictionServiceEnabled(): boolean {
  return isGeminiEnabled();
}

