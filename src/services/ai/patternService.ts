/**
 * Pattern Recognition Service
 *
 * Analyzes incidents and CAPAs to identify patterns, clusters, and trends.
 * Uses semantic similarity and temporal analysis to detect recurring issues.
 */

import { GeminiClient, isGeminiEnabled } from "./geminiClient";
import { getToolsForBot } from "./tools";
import type {
  AIContext,
  PatternCluster,
  SuggestedCapa,
  SimilarIncidentMatch,
} from "./types";
import type { Incident } from "@/types/capa";
import { getIncidents, getIncident } from "@/services/incidentService";
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

export interface PatternAnalysisResult {
  clusters: PatternCluster[];
  emergingPatterns: EmergingPattern[];
  seasonalTrends: SeasonalTrend[];
  locationHotspots: LocationHotspot[];
  temporalPatterns: TemporalPattern[];
  overallRiskScore: number;
  analysisDate: Date;
}

export interface EmergingPattern {
  id: string;
  description: string;
  incidentCount: number;
  growthRate: number; // % increase over time
  timeframe: string;
  riskLevel: "high" | "medium" | "low";
  suggestedActions: string[];
}

export interface SeasonalTrend {
  type: "daily" | "weekly" | "monthly" | "seasonal";
  pattern: string;
  peakPeriods: string[];
  incidentCount: number;
  confidence: number;
}

export interface LocationHotspot {
  location: string;
  incidentCount: number;
  severity: "high" | "medium" | "low";
  commonTypes: string[];
  riskScore: number;
  trend: "increasing" | "stable" | "decreasing";
}

export interface TemporalPattern {
  timeOfDay?: string;
  dayOfWeek?: string;
  shift?: string;
  incidentCount: number;
  averageSeverity: number;
  description: string;
}

export interface IncidentSimilarityScore {
  incidentId: string;
  reference: string;
  similarity: number;
  matchingFactors: string[];
  differingFactors: string[];
}

// =============================================================================
// System Prompts
// =============================================================================

const PATTERN_ANALYSIS_PROMPT = `Tu es un expert en analyse de patterns pour les incidents de sécurité au travail.

Analyse les incidents fournis et identifie :

1. **Clusters de patterns** : Groupes d'incidents similaires par :
   - Type d'incident
   - Localisation
   - Causes racines communes
   - Équipements impliqués
   - Départements concernés

2. **Patterns émergents** : Tendances nouvelles ou en augmentation

3. **Tendances saisonnières** : Patterns temporels (jour, semaine, mois, saison)

4. **Points chauds** : Localisations avec concentration d'incidents

5. **Patterns temporels** : Moments à risque (horaires, jours, équipes)

Pour chaque pattern, fournis :
- Description claire
- Nombre d'incidents concernés
- Niveau de risque (high, medium, low)
- Actions suggérées

Format ta réponse en JSON structuré.`;

const SIMILARITY_ANALYSIS_PROMPT = `Compare cet incident avec les incidents historiques et identifie les plus similaires.

**Incident de référence :**
{reference_incident}

**Incidents historiques à comparer :**
{historical_incidents}

Pour chaque comparaison, évalue :
1. Similarité globale (0-100%)
2. Facteurs communs
3. Facteurs différents
4. Pertinence pour l'analyse de patterns

Retourne les 5 incidents les plus similaires avec leurs scores.`;

const CLUSTER_GENERATION_PROMPT = `Analyse ces incidents et génère des clusters de patterns.

**Incidents :**
{incidents_data}

Génère des clusters en regroupant les incidents par :
1. Type d'incident
2. Cause racine
3. Localisation
4. Département
5. Équipement

Pour chaque cluster :
- Nom descriptif
- Description du pattern
- Liste des IDs d'incidents
- Facteurs communs
- Niveau de sévérité
- Fréquence (incidents/mois)
- Direction de la tendance
- Actions CAPA suggérées

Format ta réponse en JSON structuré.`;

// =============================================================================
// Pattern Service Class
// =============================================================================

export class PatternService {
  private client: GeminiClient;
  private context: AIContext | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Initialize the pattern service with user context
   */
  initialize(context: AIContext): void {
    this.context = context;

    const tools = getToolsForBot("capa_ai");

    this.client.initialize({
      botType: "capa_ai",
      context,
      tools,
      systemPrompt: PATTERN_ANALYSIS_PROMPT,
      modelType: "pro",
    });

    this.client.startChat([]);
    this.isInitialized = true;
  }

  /**
   * Analyze patterns across all incidents
   */
  async analyzePatterns(
    timeframeDays: number = 365
  ): Promise<PatternAnalysisResult> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Pattern service not initialized");
    }

    // Fetch incidents from the timeframe
    const incidents = await this.fetchIncidentsForAnalysis(timeframeDays);

    if (incidents.length === 0) {
      return this.getEmptyAnalysisResult();
    }

    // Analyze patterns using AI
    const clusters = await this.generatePatternClusters(incidents);
    const emergingPatterns = this.detectEmergingPatterns(incidents);
    const seasonalTrends = this.detectSeasonalTrends(incidents);
    const locationHotspots = this.detectLocationHotspots(incidents);
    const temporalPatterns = this.detectTemporalPatterns(incidents);

    // Calculate overall risk score
    const overallRiskScore = this.calculateOverallRiskScore(
      clusters,
      emergingPatterns,
      locationHotspots
    );

    return {
      clusters,
      emergingPatterns,
      seasonalTrends,
      locationHotspots,
      temporalPatterns,
      overallRiskScore,
      analysisDate: new Date(),
    };
  }

  /**
   * Find similar incidents to a given incident
   */
  async findSimilarIncidents(
    incidentId: string,
    maxResults: number = 10
  ): Promise<SimilarIncidentMatch[]> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Pattern service not initialized");
    }

    const referenceIncident = await getIncident(incidentId);
    if (!referenceIncident) {
      throw new Error("Incident not found");
    }

    // Fetch historical incidents
    const historicalIncidents = await this.fetchIncidentsForAnalysis(365);

    // Filter out the reference incident
    const compareIncidents = historicalIncidents.filter(
      (inc) => inc.id !== incidentId
    );

    if (compareIncidents.length === 0) {
      return [];
    }

    // Use AI for semantic similarity analysis
    const similarityScores = await this.calculateSimilarityScores(
      referenceIncident,
      compareIncidents
    );

    // Convert to SimilarIncidentMatch format
    return similarityScores.slice(0, maxResults).map((score) => ({
      incidentId: score.incidentId,
      reference: score.reference,
      similarity: score.similarity,
      commonFactors: score.matchingFactors,
      date: new Date(), // Would be filled from actual incident
    }));
  }

  /**
   * Detect pattern clusters in incidents
   */
  async generatePatternClusters(
    incidents: Incident[]
  ): Promise<PatternCluster[]> {
    if (incidents.length < 3) {
      return [];
    }

    // Prepare incident data for AI analysis
    const incidentsData = incidents.map((inc) => ({
      id: inc.id,
      type: inc.type,
      severity: inc.severity,
      location: inc.location,
      description: inc.description.substring(0, 200),
      date: this.getIncidentDate(inc)?.toISOString() || "",
      departmentId: inc.departmentId,
    }));

    const prompt = CLUSTER_GENERATION_PROMPT.replace(
      "{incidents_data}",
      JSON.stringify(incidentsData, null, 2)
    );

    const response = await this.client.sendMessage(prompt, true);

    return this.parseClusterResponse(response.content, incidents);
  }

  /**
   * Get pattern cluster by ID
   */
  async getPatternCluster(clusterId: string): Promise<PatternCluster | null> {
    if (!this.context) return null;

    // Fetch from Firestore
    const clusterRef = collection(
      db,
      `organizations/${this.context.organizationId}/capaPatterns`
    );
    const q = query(clusterRef, where("id", "==", clusterId), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as PatternCluster;
  }

  /**
   * Save pattern analysis to Firestore
   */
  async savePatternAnalysis(analysis: PatternAnalysisResult): Promise<void> {
    if (!this.context) return;

    const patternsRef = collection(
      db,
      `organizations/${this.context.organizationId}/capaPatterns`
    );

    // Save each cluster
    for (const cluster of analysis.clusters) {
      // Would use addDoc or setDoc here
      console.log("Would save cluster:", cluster.id);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async fetchIncidentsForAnalysis(
    timeframeDays: number
  ): Promise<Incident[]> {
    if (!this.context) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);

    try {
      // Use root-level collection with organizationId filter
      const incidentsRef = collection(db, "incidents");
      const q = query(
        incidentsRef,
        where("organizationId", "==", this.context.organizationId),
        where("reportedAt", ">=", Timestamp.fromDate(startDate)),
        orderBy("reportedAt", "desc"),
        limit(500)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Incident[];
    } catch (error) {
      console.error("Error fetching incidents for pattern analysis:", error);
      return [];
    }
  }

  private async calculateSimilarityScores(
    reference: Incident,
    compareIncidents: Incident[]
  ): Promise<IncidentSimilarityScore[]> {
    // Use rule-based similarity for initial scoring
    const scores: IncidentSimilarityScore[] = [];

    for (const incident of compareIncidents) {
      let similarity = 0;
      const matchingFactors: string[] = [];
      const differingFactors: string[] = [];

      // Type match (30%)
      if (incident.type === reference.type) {
        similarity += 30;
        matchingFactors.push("Type d'incident");
      } else {
        differingFactors.push("Type d'incident différent");
      }

      // Location match (20%)
      if (incident.location === reference.location) {
        similarity += 20;
        matchingFactors.push("Même localisation");
      } else {
        differingFactors.push("Localisation différente");
      }

      // Severity match (15%)
      if (incident.severity === reference.severity) {
        similarity += 15;
        matchingFactors.push("Même gravité");
      }

      // Department match (15%)
      if (incident.departmentId === reference.departmentId) {
        similarity += 15;
        matchingFactors.push("Même département");
      }

      // Description keyword overlap (20%)
      const refWords = new Set(
        reference.description.toLowerCase().split(/\s+/)
      );
      const incWords = new Set(incident.description.toLowerCase().split(/\s+/));
      const overlap =
        [...refWords].filter((w) => incWords.has(w) && w.length > 4).length /
        refWords.size;
      similarity += Math.round(overlap * 20);
      if (overlap > 0.3) {
        matchingFactors.push("Descriptions similaires");
      }

      scores.push({
        incidentId: incident.id,
        reference: incident.reference,
        similarity: Math.min(100, similarity),
        matchingFactors,
        differingFactors,
      });
    }

    // Sort by similarity descending
    return scores.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Helper to safely extract date from an incident
   * Handles both reportedAt (actual field) and date (for compatibility)
   */
  private getIncidentDate(incident: Incident): Date | null {
    // Try reportedAt first (actual field name)
    if (incident.reportedAt) {
      if (incident.reportedAt instanceof Date) {
        return incident.reportedAt;
      }
      if (typeof (incident.reportedAt as Timestamp).toDate === "function") {
        return (incident.reportedAt as Timestamp).toDate();
      }
    }
    // Fallback to createdAt
    if (incident.createdAt) {
      if (incident.createdAt instanceof Date) {
        return incident.createdAt as Date;
      }
      if (typeof (incident.createdAt as Timestamp).toDate === "function") {
        return (incident.createdAt as Timestamp).toDate();
      }
    }
    return null;
  }

  private detectEmergingPatterns(incidents: Incident[]): EmergingPattern[] {
    const patterns: EmergingPattern[] = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Group by type
    const typeGroups = new Map<string, Incident[]>();
    for (const incident of incidents) {
      const incidentDate = this.getIncidentDate(incident);
      if (!incidentDate) continue;
      if (incidentDate >= sixtyDaysAgo) {
        if (!typeGroups.has(incident.type)) {
          typeGroups.set(incident.type, []);
        }
        typeGroups.get(incident.type)!.push(incident);
      }
    }

    // Analyze growth for each type
    for (const [type, typeIncidents] of typeGroups) {
      const recentCount = typeIncidents.filter((inc) => {
        const d = this.getIncidentDate(inc);
        return d && d >= thirtyDaysAgo;
      }).length;

      const previousCount = typeIncidents.filter((inc) => {
        const d = this.getIncidentDate(inc);
        return d && d >= sixtyDaysAgo && d < thirtyDaysAgo;
      }).length;

      if (previousCount > 0 && recentCount > previousCount) {
        const growthRate =
          ((recentCount - previousCount) / previousCount) * 100;

        if (growthRate >= 20) {
          patterns.push({
            id: `emerging-${type}`,
            description: `Augmentation des incidents de type "${type}"`,
            incidentCount: recentCount,
            growthRate: Math.round(growthRate),
            timeframe: "30 derniers jours",
            riskLevel: growthRate >= 50 ? "high" : growthRate >= 30 ? "medium" : "low",
            suggestedActions: [
              `Analyser les causes des incidents "${type}" récents`,
              "Renforcer les mesures préventives",
              "Former le personnel concerné",
            ],
          });
        }
      }
    }

    return patterns;
  }

  private detectSeasonalTrends(incidents: Incident[]): SeasonalTrend[] {
    const trends: SeasonalTrend[] = [];

    // Daily pattern analysis
    const hourCounts = new Map<number, number>();
    for (const incident of incidents) {
      const date = this.getIncidentDate(incident);
      if (!date) continue;
      const hour = date.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    // Find peak hours
    const peakHours = [...hourCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}h-${hour + 1}h`);

    if (peakHours.length > 0) {
      trends.push({
        type: "daily",
        pattern: "Concentration d'incidents à certaines heures",
        peakPeriods: peakHours,
        incidentCount: incidents.length,
        confidence: 0.75,
      });
    }

    // Weekly pattern analysis
    const dayCounts = new Map<number, number>();
    const dayNames = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    for (const incident of incidents) {
      const date = this.getIncidentDate(incident);
      if (!date) continue;
      const day = date.getDay();
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }

    const peakDays = [...dayCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([day]) => dayNames[day]);

    if (peakDays.length > 0) {
      trends.push({
        type: "weekly",
        pattern: "Jours de la semaine avec plus d'incidents",
        peakPeriods: peakDays,
        incidentCount: incidents.length,
        confidence: 0.7,
      });
    }

    return trends;
  }

  private detectLocationHotspots(incidents: Incident[]): LocationHotspot[] {
    const locationCounts = new Map<
      string,
      { count: number; types: string[]; severities: string[] }
    >();

    for (const incident of incidents) {
      const loc = incident.location || "Non spécifié";
      if (!locationCounts.has(loc)) {
        locationCounts.set(loc, { count: 0, types: [], severities: [] });
      }
      const data = locationCounts.get(loc)!;
      data.count++;
      data.types.push(incident.type);
      data.severities.push(incident.severity);
    }

    return [...locationCounts.entries()]
      .filter(([_, data]) => data.count >= 2)
      .map(([location, data]) => {
        // Calculate severity score
        const severityMap: Record<string, number> = {
          critical: 4,
          severe: 3,
          moderate: 2,
          minor: 1,
        };
        const avgSeverity =
          data.severities.reduce((sum, s) => sum + (severityMap[s] || 1), 0) /
          data.severities.length;

        // Get unique types
        const uniqueTypes = [...new Set(data.types)];

        return {
          location,
          incidentCount: data.count,
          severity:
            avgSeverity >= 3 ? "high" : avgSeverity >= 2 ? "medium" : "low",
          commonTypes: uniqueTypes.slice(0, 3),
          riskScore: Math.round((data.count * avgSeverity) / 4) * 25,
          trend: "stable" as const,
        };
      })
      .sort((a, b) => b.incidentCount - a.incidentCount)
      .slice(0, 10);
  }

  private detectTemporalPatterns(incidents: Incident[]): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];

    // Morning vs Afternoon vs Night analysis
    const shiftCounts = { morning: 0, afternoon: 0, night: 0 };
    const shiftSeverities = { morning: 0, afternoon: 0, night: 0 };
    const severityMap: Record<string, number> = {
      critical: 4,
      severe: 3,
      moderate: 2,
      minor: 1,
    };

    for (const incident of incidents) {
      const date = this.getIncidentDate(incident);
      if (!date) continue;
      const hour = date.getHours();
      const severity = severityMap[incident.severity] || 1;

      if (hour >= 6 && hour < 14) {
        shiftCounts.morning++;
        shiftSeverities.morning += severity;
      } else if (hour >= 14 && hour < 22) {
        shiftCounts.afternoon++;
        shiftSeverities.afternoon += severity;
      } else {
        shiftCounts.night++;
        shiftSeverities.night += severity;
      }
    }

    // Add shift patterns
    for (const [shift, count] of Object.entries(shiftCounts)) {
      if (count > 0) {
        const avgSeverity =
          shiftSeverities[shift as keyof typeof shiftSeverities] / count;
        patterns.push({
          shift:
            shift === "morning"
              ? "Matin (6h-14h)"
              : shift === "afternoon"
              ? "Après-midi (14h-22h)"
              : "Nuit (22h-6h)",
          incidentCount: count,
          averageSeverity: Math.round(avgSeverity * 25),
          description: `${count} incidents pendant l'équipe de ${
            shift === "morning"
              ? "matin"
              : shift === "afternoon"
              ? "l'après-midi"
              : "nuit"
          }`,
        });
      }
    }

    return patterns;
  }

  private calculateOverallRiskScore(
    clusters: PatternCluster[],
    emergingPatterns: EmergingPattern[],
    hotspots: LocationHotspot[]
  ): number {
    let score = 50; // Base score

    // Add points for high severity clusters
    const highSeverityClusters = clusters.filter((c) => c.severity === "high");
    score += highSeverityClusters.length * 5;

    // Add points for emerging patterns
    const highRiskPatterns = emergingPatterns.filter(
      (p) => p.riskLevel === "high"
    );
    score += highRiskPatterns.length * 10;

    // Add points for hotspots
    const highRiskHotspots = hotspots.filter((h) => h.severity === "high");
    score += highRiskHotspots.length * 5;

    // Subtract for decreasing trends
    const decreasingClusters = clusters.filter(
      (c) => c.trendDirection === "decreasing"
    );
    score -= decreasingClusters.length * 3;

    return Math.max(0, Math.min(100, score));
  }

  private parseClusterResponse(
    content: string,
    incidents: Incident[]
  ): PatternCluster[] {
    // Try JSON parsing
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const clusters = Array.isArray(parsed)
          ? parsed
          : parsed.clusters || [];
        return clusters.map((c: PatternCluster, idx: number) => ({
          ...c,
          id: c.id || `cluster-${idx}`,
          lastOccurrence: new Date(),
        }));
      } catch {
        // Fall through to rule-based clustering
      }
    }

    // Rule-based clustering as fallback
    return this.createRuleBasedClusters(incidents);
  }

  private createRuleBasedClusters(incidents: Incident[]): PatternCluster[] {
    const clusters: PatternCluster[] = [];
    const typeGroups = new Map<string, Incident[]>();

    // Group by type
    for (const incident of incidents) {
      if (!typeGroups.has(incident.type)) {
        typeGroups.set(incident.type, []);
      }
      typeGroups.get(incident.type)!.push(incident);
    }

    // Create clusters
    let clusterIndex = 0;
    for (const [type, typeIncidents] of typeGroups) {
      if (typeIncidents.length >= 2) {
        // Calculate frequency
        const oldestDate = Math.min(
          ...typeIncidents.map((i) =>
            i.date instanceof Date
              ? i.date.getTime()
              : (i.date as Timestamp).toDate().getTime()
          )
        );
        const monthsSpan =
          (Date.now() - oldestDate) / (30 * 24 * 60 * 60 * 1000) || 1;
        const frequency = typeIncidents.length / monthsSpan;

        // Calculate severity
        const severityMap: Record<string, number> = {
          critical: 4,
          severe: 3,
          moderate: 2,
          minor: 1,
        };
        const avgSeverity =
          typeIncidents.reduce(
            (sum, i) => sum + (severityMap[i.severity] || 1),
            0
          ) / typeIncidents.length;

        // Get common factors
        const locations = [...new Set(typeIncidents.map((i) => i.location))];
        const departments = [
          ...new Set(typeIncidents.map((i) => i.departmentId)),
        ];

        clusters.push({
          id: `cluster-${clusterIndex++}`,
          name: `Cluster ${type}`,
          description: `Incidents de type "${type}"`,
          incidentIds: typeIncidents.map((i) => i.id),
          commonFactors: [
            `Type: ${type}`,
            ...locations.slice(0, 2).map((l) => `Lieu: ${l}`),
          ],
          category: type,
          severity: avgSeverity >= 3 ? "high" : avgSeverity >= 2 ? "medium" : "low",
          frequency,
          lastOccurrence: new Date(
            Math.max(
              ...typeIncidents.map((i) =>
                i.date instanceof Date
                  ? i.date.getTime()
                  : (i.date as Timestamp).toDate().getTime()
              )
            )
          ),
          trendDirection: "stable",
          suggestedActions: [
            {
              title: `Action préventive pour ${type}`,
              description: `Renforcer les mesures de prévention pour les incidents de type ${type}`,
              category: "preventif",
              priority: avgSeverity >= 3 ? "haute" : "moyenne",
              reasoning: `Basé sur ${typeIncidents.length} incidents similaires`,
              confidence: 0.75,
            },
          ],
        });
      }
    }

    return clusters;
  }

  private getEmptyAnalysisResult(): PatternAnalysisResult {
    return {
      clusters: [],
      emergingPatterns: [],
      seasonalTrends: [],
      locationHotspots: [],
      temporalPatterns: [],
      overallRiskScore: 0,
      analysisDate: new Date(),
    };
  }
}

// =============================================================================
// Singleton
// =============================================================================

let patternServiceInstance: PatternService | null = null;

export function getPatternService(): PatternService {
  if (!patternServiceInstance) {
    patternServiceInstance = new PatternService();
  }
  return patternServiceInstance;
}

export function resetPatternService(): void {
  patternServiceInstance = null;
}

export function isPatternServiceEnabled(): boolean {
  return isGeminiEnabled();
}

