/**
 * Risk Intelligence Hub
 *
 * Central intelligence hub connecting all SAHTEE modules:
 * - CAPA Room (incidents, CAPAs)
 * - Healthmeter (exposures, medical visits, TMS)
 * - Conformity Room (audits, findings, requirements)
 * - Training (competency gaps)
 * - Equipment (maintenance, safety)
 *
 * Generates cross-module insights and holistic recommendations.
 */

import { GeminiClient, isGeminiEnabled } from "./geminiClient";
import { getToolsForBot } from "./tools";
import { getPatternService } from "./patternService";
import { getPredictionService } from "./predictionService";
import type {
  AIContext,
  HolisticRecommendation,
  SuggestedCapa,
  TrainingRecommendation,
  AuditRecommendation,
  HealthMonitoringPlan,
  EquipmentActionRecommendation,
} from "./types";
import type { Incident, ActionPlan } from "@/types/capa";
import type { Audit, Requirement } from "@/types/conformity";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

// =============================================================================
// Types
// =============================================================================

export interface RiskIntelligenceReport {
  overallRiskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  moduleRisks: ModuleRiskSummary[];
  crossModuleInsights: CrossModuleInsight[];
  holisticRecommendations: HolisticRecommendation[];
  complianceGaps: ComplianceGap[];
  urgentActions: UrgentAction[];
  trendsummary: TrendSummary;
  generatedAt: Date;
}

export interface ModuleRiskSummary {
  module: "capa" | "health" | "conformity" | "training" | "equipment";
  riskScore: number;
  openIssues: number;
  trend: "improving" | "stable" | "deteriorating";
  topConcerns: string[];
  lastUpdated: Date;
}

export interface CrossModuleInsight {
  id: string;
  type: "correlation" | "cascade" | "gap" | "synergy";
  title: string;
  description: string;
  involvedModules: string[];
  confidence: number;
  actionable: boolean;
  suggestedActions: string[];
}

export interface ComplianceGap {
  normId: string;
  normCode: string;
  clause: string;
  description: string;
  severity: "critical" | "major" | "minor";
  linkedModules: string[];
  suggestedCapa?: SuggestedCapa;
}

export interface UrgentAction {
  id: string;
  type: "capa" | "audit" | "training" | "equipment" | "health";
  title: string;
  description: string;
  deadline: Date;
  priority: "critique" | "haute" | "moyenne";
  assignedTo?: string;
  linkedItemId?: string;
}

export interface TrendSummary {
  incidentTrend: "increasing" | "stable" | "decreasing";
  complianceTrend: "increasing" | "stable" | "decreasing";
  healthTrend: "increasing" | "stable" | "decreasing";
  overallDirection: "improving" | "stable" | "deteriorating";
  confidence: number;
}

// Module data types for aggregation
interface ModuleData {
  incidents: Incident[];
  capas: ActionPlan[];
  audits: Audit[];
  requirements: Requirement[];
  exposures: ExposureSummary[];
  trainings: TrainingSummary[];
  equipment: EquipmentSummary[];
}

interface ExposureSummary {
  id: string;
  type: string;
  level: "faible" | "modéré" | "élevé" | "très élevé";
  affectedCount: number;
  department: string;
}

interface TrainingSummary {
  id: string;
  title: string;
  status: "planifié" | "en_cours" | "terminé" | "en_retard";
  targetCount: number;
  completedCount: number;
}

interface EquipmentSummary {
  id: string;
  name: string;
  status: "operational" | "maintenance" | "repair" | "hors_service";
  lastInspection?: Date;
  nextMaintenance?: Date;
}

// =============================================================================
// System Prompts
// =============================================================================

const INTELLIGENCE_HUB_PROMPT = `Tu es le hub d'intelligence risque central de SAHTEE, une plateforme de gestion QHSE.

Tu as accès aux données de tous les modules :
- **CAPA Room** : Incidents, actions correctives et préventives
- **Healthmeter** : Expositions professionnelles, visites médicales, TMS
- **Conformity Room** : Audits, exigences réglementaires, conformité
- **Training** : Formations, compétences, certifications
- **Equipment** : Équipements, maintenances, inspections

Ton rôle est de :
1. **Identifier les corrélations** entre les différents modules
2. **Détecter les effets cascade** (un problème dans un module impactant les autres)
3. **Trouver les lacunes** non couvertes par les modules individuels
4. **Proposer des synergies** d'actions entre modules
5. **Générer des recommandations holistiques** qui optimisent l'ensemble du système QHSE

Utilise une approche systémique et fournit des insights actionnables avec niveaux de confiance.`;

const HOLISTIC_ANALYSIS_PROMPT = `Analyse ces données multi-modules et génère un rapport d'intelligence risque.

**Données des modules :**
{module_data}

**Instructions :**
1. Calcule un score de risque global (0-100)
2. Identifie les corrélations entre modules
3. Détecte les gaps de conformité
4. Propose des recommandations holistiques
5. Liste les actions urgentes

Format ta réponse en JSON structuré.`;

// =============================================================================
// Risk Intelligence Hub Class
// =============================================================================

export class RiskIntelligenceHub {
  private client: GeminiClient;
  private context: AIContext | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Initialize the intelligence hub
   */
  initialize(context: AIContext): void {
    this.context = context;

    const tools = getToolsForBot("capa_ai");

    this.client.initialize({
      botType: "capa_ai",
      context,
      tools,
      systemPrompt: INTELLIGENCE_HUB_PROMPT,
      modelType: "pro",
    });

    this.client.startChat([]);
    this.isInitialized = true;
  }

  /**
   * Generate comprehensive risk intelligence report
   */
  async generateIntelligenceReport(): Promise<RiskIntelligenceReport> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Risk Intelligence Hub not initialized");
    }

    // Aggregate data from all modules
    const moduleData = await this.aggregateModuleData();

    // Generate module-specific risk summaries
    const moduleRisks = this.calculateModuleRisks(moduleData);

    // Detect cross-module insights
    const crossModuleInsights = await this.detectCrossModuleInsights(moduleData);

    // Generate holistic recommendations
    const holisticRecommendations = await this.generateHolisticRecommendations(
      moduleData,
      crossModuleInsights
    );

    // Identify compliance gaps
    const complianceGaps = this.identifyComplianceGaps(moduleData);

    // Determine urgent actions
    const urgentActions = this.identifyUrgentActions(moduleData);

    // Calculate trends
    const trendsummary = this.calculateTrendSummary(moduleData);

    // Calculate overall risk
    const { overallRiskScore, riskLevel } = this.calculateOverallRisk(moduleRisks);

    return {
      overallRiskScore,
      riskLevel,
      moduleRisks,
      crossModuleInsights,
      holisticRecommendations,
      complianceGaps,
      urgentActions,
      trendsummary,
      generatedAt: new Date(),
    };
  }

  /**
   * Get holistic recommendations for a specific context
   */
  async getHolisticRecommendations(
    context: "incident" | "audit" | "exposure" | "training"
  ): Promise<HolisticRecommendation[]> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Risk Intelligence Hub not initialized");
    }

    const moduleData = await this.aggregateModuleData();
    const insights = await this.detectCrossModuleInsights(moduleData);

    return this.generateHolisticRecommendations(moduleData, insights);
  }

  /**
   * Analyze impact of a potential action across modules
   */
  async analyzeActionImpact(
    actionType: string,
    actionDescription: string
  ): Promise<{
    primaryImpact: string;
    secondaryImpacts: Array<{ module: string; impact: string; direction: "positive" | "negative" | "neutral" }>;
    riskReduction: number;
    recommendations: string[];
  }> {
    const prompt = `Analyse l'impact de cette action sur tous les modules SAHTEE :

**Type d'action** : ${actionType}
**Description** : ${actionDescription}

Évalue :
1. Impact primaire
2. Impacts secondaires par module
3. Réduction de risque estimée (%)
4. Recommandations complémentaires`;

    const response = await this.client.sendMessage(prompt, true);

    return this.parseImpactAnalysis(response.content);
  }

  /**
   * Get module interconnection map
   */
  getModuleInterconnectionMap(): {
    modules: Array<{ id: string; name: string; risk: number }>;
    connections: Array<{ from: string; to: string; strength: number; type: string }>;
  } {
    return {
      modules: [
        { id: "capa", name: "CAPA Room", risk: 0 },
        { id: "health", name: "Healthmeter", risk: 0 },
        { id: "conformity", name: "Conformity Room", risk: 0 },
        { id: "training", name: "Training", risk: 0 },
        { id: "equipment", name: "Equipment", risk: 0 },
      ],
      connections: [
        { from: "capa", to: "health", strength: 0.8, type: "incidents_cause_health_issues" },
        { from: "capa", to: "training", strength: 0.7, type: "incidents_require_training" },
        { from: "capa", to: "equipment", strength: 0.6, type: "incidents_involve_equipment" },
        { from: "health", to: "capa", strength: 0.7, type: "health_issues_trigger_capas" },
        { from: "health", to: "training", strength: 0.5, type: "exposure_requires_training" },
        { from: "conformity", to: "capa", strength: 0.9, type: "findings_become_capas" },
        { from: "conformity", to: "training", strength: 0.6, type: "compliance_requires_training" },
        { from: "training", to: "capa", strength: 0.5, type: "training_prevents_incidents" },
        { from: "equipment", to: "capa", strength: 0.7, type: "equipment_issues_cause_incidents" },
        { from: "equipment", to: "health", strength: 0.6, type: "equipment_affects_exposure" },
      ],
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async aggregateModuleData(): Promise<ModuleData> {
    if (!this.context) {
      return {
        incidents: [],
        capas: [],
        audits: [],
        requirements: [],
        exposures: [],
        trainings: [],
        equipment: [],
      };
    }

    const orgId = this.context.organizationId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch data from all modules in parallel using correct root-level collections
    const [incidents, capas, audits, requirements] = await Promise.all([
      this.fetchCollectionWithOrg<Incident>("incidents", orgId, 100),
      this.fetchCollectionWithOrg<ActionPlan>("actionPlans", orgId, 100),
      this.fetchCollectionWithOrg<Audit>("audits", orgId, 50),
      this.fetchCollectionWithOrg<Requirement>("norms", orgId, 100),
    ]);

    // Mock data for modules without direct access
    const exposures = this.mockExposureData();
    const trainings = this.mockTrainingData();
    const equipment = this.mockEquipmentData();

    return {
      incidents,
      capas,
      audits,
      requirements,
      exposures,
      trainings,
      equipment,
    };
  }

  private async fetchCollectionWithOrg<T>(
    collectionName: string,
    orgId: string,
    maxItems: number
  ): Promise<T[]> {
    try {
      const ref = collection(db, collectionName);
      const q = query(
        ref,
        where("organizationId", "==", orgId),
        orderBy("createdAt", "desc"),
        limit(maxItems)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return [];
    }
  }

  private mockExposureData(): ExposureSummary[] {
    return [
      { id: "exp-1", type: "Bruit", level: "modéré", affectedCount: 15, department: "Production" },
      { id: "exp-2", type: "Chimique", level: "faible", affectedCount: 8, department: "Laboratoire" },
    ];
  }

  private mockTrainingData(): TrainingSummary[] {
    return [
      { id: "train-1", title: "Sécurité incendie", status: "terminé", targetCount: 50, completedCount: 48 },
      { id: "train-2", title: "Gestes et postures", status: "en_cours", targetCount: 30, completedCount: 15 },
    ];
  }

  private mockEquipmentData(): EquipmentSummary[] {
    return [
      { id: "equip-1", name: "Chariot élévateur A", status: "operational", nextMaintenance: new Date("2025-01-15") },
      { id: "equip-2", name: "Pont roulant B", status: "maintenance", lastInspection: new Date("2024-12-01") },
    ];
  }

  private calculateModuleRisks(data: ModuleData): ModuleRiskSummary[] {
    const now = new Date();

    // CAPA Risk
    const openCapas = data.capas.filter((c) => c.status !== "closed" && c.status !== "validated");
    const overdueCapas = openCapas.filter((c) => {
      const dueDate = c.dueDate instanceof Timestamp ? c.dueDate.toDate() : new Date(c.dueDate);
      return dueDate < now;
    });
    const capaRisk = Math.min(100, 30 + overdueCapas.length * 10 + openCapas.length * 2);

    // Health Risk
    const highExposures = data.exposures.filter((e) => e.level === "élevé" || e.level === "très élevé");
    const healthRisk = Math.min(100, 20 + highExposures.length * 15);

    // Conformity Risk
    const recentAudits = data.audits.slice(0, 5);
    const avgCompliance = recentAudits.length > 0
      ? recentAudits.reduce((sum, a) => sum + (a.score || 0), 0) / recentAudits.length
      : 70;
    const conformityRisk = Math.max(0, 100 - avgCompliance);

    // Training Risk
    const lateTrainings = data.trainings.filter((t) => t.status === "en_retard");
    const trainingRisk = Math.min(100, 15 + lateTrainings.length * 20);

    // Equipment Risk
    const problemEquipment = data.equipment.filter(
      (e) => e.status === "maintenance" || e.status === "repair" || e.status === "hors_service"
    );
    const equipmentRisk = Math.min(100, 10 + problemEquipment.length * 15);

    return [
      {
        module: "capa",
        riskScore: capaRisk,
        openIssues: openCapas.length,
        trend: overdueCapas.length > 2 ? "deteriorating" : openCapas.length > 5 ? "stable" : "improving",
        topConcerns: overdueCapas.slice(0, 3).map((c) => c.title),
        lastUpdated: now,
      },
      {
        module: "health",
        riskScore: healthRisk,
        openIssues: highExposures.length,
        trend: highExposures.length > 2 ? "deteriorating" : "stable",
        topConcerns: highExposures.map((e) => `${e.type} - ${e.department}`),
        lastUpdated: now,
      },
      {
        module: "conformity",
        riskScore: conformityRisk,
        openIssues: data.requirements.filter((r) => r.status !== "conforme").length,
        trend: avgCompliance >= 80 ? "improving" : avgCompliance >= 60 ? "stable" : "deteriorating",
        topConcerns: data.requirements
          .filter((r) => r.status === "non_conforme")
          .slice(0, 3)
          .map((r) => r.description || "Exigence non conforme"),
        lastUpdated: now,
      },
      {
        module: "training",
        riskScore: trainingRisk,
        openIssues: lateTrainings.length,
        trend: lateTrainings.length === 0 ? "improving" : "deteriorating",
        topConcerns: lateTrainings.map((t) => t.title),
        lastUpdated: now,
      },
      {
        module: "equipment",
        riskScore: equipmentRisk,
        openIssues: problemEquipment.length,
        trend: problemEquipment.length === 0 ? "improving" : "stable",
        topConcerns: problemEquipment.map((e) => `${e.name} - ${e.status}`),
        lastUpdated: now,
      },
    ];
  }

  private async detectCrossModuleInsights(
    data: ModuleData
  ): Promise<CrossModuleInsight[]> {
    const insights: CrossModuleInsight[] = [];

    // Correlation: Incidents and Equipment
    const equipmentIncidents = data.incidents.filter((i) =>
      i.description?.toLowerCase().includes("équipement") ||
      i.description?.toLowerCase().includes("machine") ||
      i.type === "equipment"
    );
    if (equipmentIncidents.length >= 2) {
      insights.push({
        id: "insight-equip-incidents",
        type: "correlation",
        title: "Corrélation incidents-équipements",
        description: `${equipmentIncidents.length} incidents récents impliquent des équipements`,
        involvedModules: ["capa", "equipment"],
        confidence: 0.8,
        actionable: true,
        suggestedActions: [
          "Renforcer le programme de maintenance préventive",
          "Auditer les équipements critiques",
        ],
      });
    }

    // Cascade: High exposure leading to health issues
    const highExposures = data.exposures.filter(
      (e) => e.level === "élevé" || e.level === "très élevé"
    );
    if (highExposures.length > 0) {
      insights.push({
        id: "insight-exposure-cascade",
        type: "cascade",
        title: "Risque cascade exposition-santé",
        description: `${highExposures.length} exposition(s) élevée(s) pourraient entraîner des problèmes de santé`,
        involvedModules: ["health", "capa", "equipment"],
        confidence: 0.75,
        actionable: true,
        suggestedActions: [
          "Réduire les expositions prioritaires",
          "Renforcer les EPI",
          "Planifier des visites médicales ciblées",
        ],
      });
    }

    // Gap: Training deficiencies related to incidents
    const incidentTypes = new Set(data.incidents.map((i) => i.type));
    const trainingTopics = new Set(data.trainings.map((t) => t.title.toLowerCase()));

    for (const incType of incidentTypes) {
      const hasRelatedTraining = [...trainingTopics].some(
        (topic) => topic.includes(incType.toLowerCase())
      );
      if (!hasRelatedTraining && data.incidents.filter((i) => i.type === incType).length >= 2) {
        insights.push({
          id: `insight-gap-training-${incType}`,
          type: "gap",
          title: `Lacune formation: ${incType}`,
          description: `Incidents de type "${incType}" récurrents sans formation correspondante`,
          involvedModules: ["training", "capa"],
          confidence: 0.7,
          actionable: true,
          suggestedActions: [
            `Développer une formation sur "${incType}"`,
            "Identifier les employés à former en priorité",
          ],
        });
      }
    }

    // Synergy: Combining audit actions with CAPA
    const pendingAudits = data.audits.filter((a) => a.status === "planifié" || a.status === "en_cours");
    const relatedCapas = data.capas.filter(
      (c) => c.category === "correctif" && c.status !== "closed"
    );
    if (pendingAudits.length > 0 && relatedCapas.length > 0) {
      insights.push({
        id: "insight-synergy-audit-capa",
        type: "synergy",
        title: "Synergie audit-CAPA possible",
        description: `${pendingAudits.length} audit(s) en cours peuvent valider ${relatedCapas.length} CAPA(s)`,
        involvedModules: ["conformity", "capa"],
        confidence: 0.65,
        actionable: true,
        suggestedActions: [
          "Intégrer la vérification des CAPAs dans les audits planifiés",
          "Coordonner les équipes audit et CAPA",
        ],
      });
    }

    return insights;
  }

  private async generateHolisticRecommendations(
    data: ModuleData,
    insights: CrossModuleInsight[]
  ): Promise<HolisticRecommendation[]> {
    const recommendations: HolisticRecommendation[] = [];

    for (const insight of insights.filter((i) => i.actionable)) {
      const recommendation = this.createRecommendationFromInsight(insight, data);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Add recommendations based on overall risk profile
    const moduleRisks = this.calculateModuleRisks(data);
    const highRiskModules = moduleRisks.filter((m) => m.riskScore >= 60);

    for (const module of highRiskModules) {
      recommendations.push(this.createModuleRecommendation(module));
    }

    return recommendations.slice(0, 10); // Limit to top 10
  }

  private createRecommendationFromInsight(
    insight: CrossModuleInsight,
    _data: ModuleData
  ): HolisticRecommendation | null {
    const primaryModule = insight.involvedModules[0] as HolisticRecommendation["primaryModule"];

    return {
      id: `rec-${insight.id}`,
      primaryModule,
      secondaryModules: insight.involvedModules.slice(1),
      recommendation: {
        capa: insight.type === "correlation" || insight.type === "cascade"
          ? {
              title: `CAPA: ${insight.title}`,
              description: insight.description,
              category: "preventif",
              priority: insight.confidence >= 0.8 ? "haute" : "moyenne",
              reasoning: insight.suggestedActions.join("; "),
              confidence: insight.confidence,
            }
          : undefined,
        training: insight.type === "gap"
          ? {
              title: `Formation: ${insight.title}`,
              description: insight.description,
              targetAudience: ["Employés concernés"],
              estimatedDuration: 4,
              priority: "moyenne",
            }
          : undefined,
      },
      impactAnalysis: {
        riskReduction: Math.round(insight.confidence * 20),
        complianceImprovement: insight.involvedModules.includes("conformity") ? 15 : 5,
        costEstimate: { min: 1000, max: 5000, currency: "TND" },
        timeToImpact: 30,
      },
      synergies: insight.suggestedActions,
      confidence: insight.confidence,
      priority: insight.confidence >= 0.8 ? "haute" : insight.confidence >= 0.6 ? "moyenne" : "basse",
    };
  }

  private createModuleRecommendation(module: ModuleRiskSummary): HolisticRecommendation {
    const moduleNames: Record<string, string> = {
      capa: "CAPA Room",
      health: "Healthmeter",
      conformity: "Conformity Room",
      training: "Training",
      equipment: "Equipment",
    };

    return {
      id: `rec-module-${module.module}`,
      primaryModule: module.module,
      secondaryModules: [],
      recommendation: {
        capa: {
          title: `Réduire le risque ${moduleNames[module.module]}`,
          description: `Score de risque élevé (${module.riskScore}%) - ${module.openIssues} problèmes ouverts`,
          category: "preventif",
          priority: module.riskScore >= 80 ? "critique" : "haute",
          reasoning: module.topConcerns.join("; "),
          confidence: 0.9,
        },
      },
      impactAnalysis: {
        riskReduction: Math.round(module.riskScore * 0.3),
        complianceImprovement: 10,
        costEstimate: { min: 2000, max: 10000, currency: "TND" },
        timeToImpact: 45,
      },
      synergies: [
        `Traiter les ${module.openIssues} problèmes ouverts`,
        "Renforcer les contrôles préventifs",
      ],
      confidence: 0.85,
      priority: module.riskScore >= 70 ? "haute" : "moyenne",
    };
  }

  private identifyComplianceGaps(data: ModuleData): ComplianceGap[] {
    const gaps: ComplianceGap[] = [];

    // Find non-compliant requirements
    const nonCompliant = data.requirements.filter(
      (r) => r.status === "non_conforme" || r.status === "partiel"
    );

    for (const req of nonCompliant.slice(0, 10)) {
      gaps.push({
        normId: req.normId || "unknown",
        normCode: req.normCode || "N/A",
        clause: req.clause || "Non spécifié",
        description: req.description || "Exigence non conforme",
        severity: req.status === "non_conforme" ? "major" : "minor",
        linkedModules: this.determineLinkedModules(req),
        suggestedCapa: {
          title: `Mise en conformité: ${req.clause || "Exigence"}`,
          description: `Action corrective pour ${req.description}`,
          category: "correctif",
          priority: req.status === "non_conforme" ? "haute" : "moyenne",
          reasoning: "Non-conformité identifiée",
          confidence: 0.85,
        },
      });
    }

    return gaps;
  }

  private determineLinkedModules(req: Requirement): string[] {
    const modules: string[] = ["conformity"];
    const desc = (req.description || "").toLowerCase();

    if (desc.includes("formation") || desc.includes("compétence")) {
      modules.push("training");
    }
    if (desc.includes("équipement") || desc.includes("maintenance")) {
      modules.push("equipment");
    }
    if (desc.includes("santé") || desc.includes("exposition")) {
      modules.push("health");
    }

    return modules;
  }

  private identifyUrgentActions(data: ModuleData): UrgentAction[] {
    const actions: UrgentAction[] = [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Overdue CAPAs
    for (const capa of data.capas) {
      const dueDate = capa.dueDate instanceof Timestamp 
        ? capa.dueDate.toDate() 
        : new Date(capa.dueDate);

      if (dueDate < now && capa.status !== "closed" && capa.status !== "validated") {
        actions.push({
          id: `urgent-capa-${capa.id}`,
          type: "capa",
          title: `CAPA en retard: ${capa.title}`,
          description: `Échéance dépassée de ${Math.ceil(
            (now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)
          )} jour(s)`,
          deadline: dueDate,
          priority: capa.priority === "critique" ? "critique" : "haute",
          assignedTo: capa.assigneeId,
          linkedItemId: capa.id,
        });
      } else if (
        dueDate < sevenDaysFromNow &&
        dueDate >= now &&
        capa.status !== "closed" &&
        capa.status !== "validated"
      ) {
        actions.push({
          id: `urgent-capa-soon-${capa.id}`,
          type: "capa",
          title: `CAPA échéance proche: ${capa.title}`,
          description: `Échéance dans ${Math.ceil(
            (dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          )} jour(s)`,
          deadline: dueDate,
          priority: "haute",
          assignedTo: capa.assigneeId,
          linkedItemId: capa.id,
        });
      }
    }

    // Upcoming audits
    for (const audit of data.audits.filter((a) => a.status === "planifié")) {
      const auditDate = audit.plannedDate instanceof Timestamp
        ? audit.plannedDate.toDate()
        : audit.plannedDate ? new Date(audit.plannedDate) : null;

      if (auditDate && auditDate < sevenDaysFromNow && auditDate >= now) {
        actions.push({
          id: `urgent-audit-${audit.id}`,
          type: "audit",
          title: `Audit à venir: ${audit.title || "Audit planifié"}`,
          description: `Prévu dans ${Math.ceil(
            (auditDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          )} jour(s)`,
          deadline: auditDate,
          priority: "moyenne",
          linkedItemId: audit.id,
        });
      }
    }

    // Equipment maintenance due
    for (const equip of data.equipment) {
      if (equip.nextMaintenance && equip.nextMaintenance < sevenDaysFromNow) {
        actions.push({
          id: `urgent-equip-${equip.id}`,
          type: "equipment",
          title: `Maintenance due: ${equip.name}`,
          description: `Maintenance prévue le ${equip.nextMaintenance.toLocaleDateString("fr-FR")}`,
          deadline: equip.nextMaintenance,
          priority: "moyenne",
          linkedItemId: equip.id,
        });
      }
    }

    // Sort by deadline
    return actions.sort((a, b) => a.deadline.getTime() - b.deadline.getTime()).slice(0, 15);
  }

  private calculateTrendSummary(data: ModuleData): TrendSummary {
    // Calculate incident trend based on dates
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentIncidents = data.incidents.filter((i) => {
      const d = i.date instanceof Timestamp ? i.date.toDate() : new Date(i.date as string);
      return d >= thirtyDaysAgo;
    }).length;

    const previousIncidents = data.incidents.filter((i) => {
      const d = i.date instanceof Timestamp ? i.date.toDate() : new Date(i.date as string);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    }).length;

    const incidentTrend =
      recentIncidents > previousIncidents * 1.2
        ? "increasing"
        : recentIncidents < previousIncidents * 0.8
        ? "decreasing"
        : "stable";

    // Compliance trend
    const avgCompliance = data.audits.length > 0
      ? data.audits.reduce((sum, a) => sum + (a.score || 0), 0) / data.audits.length
      : 70;
    const complianceTrend = avgCompliance >= 80 ? "increasing" : avgCompliance >= 60 ? "stable" : "decreasing";

    // Health trend
    const highExposures = data.exposures.filter(
      (e) => e.level === "élevé" || e.level === "très élevé"
    ).length;
    const healthTrend = highExposures === 0 ? "increasing" : highExposures <= 2 ? "stable" : "decreasing";

    // Overall direction
    const positiveTrends = [incidentTrend, complianceTrend, healthTrend].filter(
      (t) => t === "decreasing" || t === "increasing"
    ).length;
    const overallDirection =
      positiveTrends >= 2 ? "improving" : positiveTrends === 0 ? "deteriorating" : "stable";

    return {
      incidentTrend,
      complianceTrend,
      healthTrend,
      overallDirection,
      confidence: 0.7,
    };
  }

  private calculateOverallRisk(
    moduleRisks: ModuleRiskSummary[]
  ): { overallRiskScore: number; riskLevel: "low" | "medium" | "high" | "critical" } {
    if (moduleRisks.length === 0) {
      return { overallRiskScore: 0, riskLevel: "low" };
    }

    // Weighted average with CAPA having highest weight
    const weights: Record<string, number> = {
      capa: 0.3,
      health: 0.25,
      conformity: 0.25,
      training: 0.1,
      equipment: 0.1,
    };

    const overallRiskScore = moduleRisks.reduce(
      (sum, m) => sum + m.riskScore * (weights[m.module] || 0.1),
      0
    );

    let riskLevel: "low" | "medium" | "high" | "critical";
    if (overallRiskScore >= 80) riskLevel = "critical";
    else if (overallRiskScore >= 60) riskLevel = "high";
    else if (overallRiskScore >= 40) riskLevel = "medium";
    else riskLevel = "low";

    return { overallRiskScore: Math.round(overallRiskScore), riskLevel };
  }

  private parseImpactAnalysis(content: string): {
    primaryImpact: string;
    secondaryImpacts: Array<{ module: string; impact: string; direction: "positive" | "negative" | "neutral" }>;
    riskReduction: number;
    recommendations: string[];
  } {
    // Try JSON parsing
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall through
      }
    }

    // Default response
    return {
      primaryImpact: "Impact à évaluer",
      secondaryImpacts: [],
      riskReduction: 10,
      recommendations: ["Analyse détaillée recommandée"],
    };
  }
}

// =============================================================================
// Singleton
// =============================================================================

let riskHubInstance: RiskIntelligenceHub | null = null;

export function getRiskIntelligenceHub(): RiskIntelligenceHub {
  if (!riskHubInstance) {
    riskHubInstance = new RiskIntelligenceHub();
  }
  return riskHubInstance;
}

export function resetRiskIntelligenceHub(): void {
  riskHubInstance = null;
}

export function isRiskIntelligenceHubEnabled(): boolean {
  return isGeminiEnabled();
}

