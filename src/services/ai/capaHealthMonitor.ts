/**
 * CAPA Health Monitor Service
 *
 * Autonomous monitoring service for CAPA health and status.
 * Provides proactive tracking, health scoring, automatic alerts,
 * intelligent escalation, and effectiveness tracking.
 */

import { GeminiClient, isGeminiEnabled } from "./geminiClient";
import type { AIContext, SuggestedCapa } from "./types";
import type { ActionPlan, Incident } from "@/types/capa";
import { getCAPAs, updateCAPA } from "@/services/capaService";
import { getIncidents } from "@/services/incidentService";
import { Timestamp } from "firebase/firestore";

// =============================================================================
// Types
// =============================================================================

export interface CAPAHealthMetrics {
  capaId: string;
  healthScore: number; // 0-100
  status: "healthy" | "at_risk" | "critical" | "overdue";
  riskFactors: RiskFactor[];
  progressScore: number;
  effectivenessScore: number;
  complianceScore: number;
  lastChecked: Date;
  recommendations: HealthRecommendation[];
}

export interface RiskFactor {
  factor: string;
  severity: "high" | "medium" | "low";
  description: string;
  impact: number; // Score impact
}

export interface HealthRecommendation {
  type: "action" | "warning" | "suggestion";
  message: string;
  priority: "critical" | "high" | "medium" | "low";
  dueDate?: Date;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  triggers: EscalationTrigger[];
  actions: EscalationAction[];
  recipients: EscalationRecipient[];
  isActive: boolean;
  createdAt: Date;
}

export interface EscalationTrigger {
  type: "overdue" | "health_score" | "blocked" | "pattern" | "compliance";
  threshold?: number;
  daysOverdue?: number;
  patternMatch?: string;
}

export interface EscalationAction {
  type: "notify" | "reassign" | "escalate_manager" | "create_followup" | "flag_priority";
  params?: Record<string, unknown>;
}

export interface EscalationRecipient {
  type: "user" | "role" | "manager" | "group";
  identifier: string;
  notificationChannels: ("email" | "in_app" | "sms")[];
}

export interface EscalationEvent {
  id: string;
  capaId: string;
  policyId: string;
  triggeredAt: Date;
  triggerReason: string;
  actions: EscalationAction[];
  status: "pending" | "acknowledged" | "resolved";
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface EffectivenessMetrics {
  capaId: string;
  measurementDate: Date;
  recurredIncidents: number;
  totalRelatedIncidents: number;
  recurrenceRate: number;
  daysToImplementation: number;
  objectivesAchieved: number;
  totalObjectives: number;
  verificationStatus: "pending" | "verified" | "failed";
  lessonsLearned: string[];
  feedbackScore?: number;
}

export interface PortfolioHealth {
  organizationId: string;
  totalCapas: number;
  openCapas: number;
  overdueCapas: number;
  atRiskCapas: number;
  criticalCapas: number;
  averageHealthScore: number;
  healthTrend: "improving" | "stable" | "declining";
  topRiskFactors: Array<{ factor: string; count: number }>;
  recentEscalations: EscalationEvent[];
  effectivenessRate: number;
  lastUpdated: Date;
}

export interface MonitoringConfig {
  checkIntervalMs: number;
  healthScoreThresholds: {
    atRisk: number;
    critical: number;
    overdue: number;
  };
  autoEscalate: boolean;
  notifyOnHealthChange: boolean;
  enablePredictiveAlerts: boolean;
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: MonitoringConfig = {
  checkIntervalMs: 60 * 60 * 1000, // 1 hour
  healthScoreThresholds: {
    atRisk: 70,
    critical: 40,
    overdue: 0,
  },
  autoEscalate: true,
  notifyOnHealthChange: true,
  enablePredictiveAlerts: true,
};

const DEFAULT_ESCALATION_POLICIES: EscalationPolicy[] = [
  {
    id: "overdue-critical",
    name: "CAPAs Critiques en Retard",
    triggers: [{ type: "overdue", daysOverdue: 3 }],
    actions: [
      { type: "notify" },
      { type: "escalate_manager" },
      { type: "flag_priority", params: { priority: "critique" } },
    ],
    recipients: [
      { type: "manager", identifier: "direct", notificationChannels: ["email", "in_app"] },
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "health-declining",
    name: "Santé CAPA en Déclin",
    triggers: [{ type: "health_score", threshold: 50 }],
    actions: [{ type: "notify" }, { type: "create_followup" }],
    recipients: [
      { type: "user", identifier: "assignee", notificationChannels: ["in_app"] },
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "blocked-capa",
    name: "CAPA Bloquée",
    triggers: [{ type: "blocked" }],
    actions: [{ type: "notify" }, { type: "escalate_manager" }],
    recipients: [
      { type: "user", identifier: "assignee", notificationChannels: ["email", "in_app"] },
      { type: "manager", identifier: "direct", notificationChannels: ["email"] },
    ],
    isActive: true,
    createdAt: new Date(),
  },
];

// =============================================================================
// Health Monitor Service
// =============================================================================

export class CAPAHealthMonitor {
  private client: GeminiClient;
  private context: AIContext | null = null;
  private isInitialized: boolean = false;
  private config: MonitoringConfig = DEFAULT_CONFIG;
  private policies: EscalationPolicy[] = DEFAULT_ESCALATION_POLICIES;
  private escalationEvents: EscalationEvent[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Initialize the health monitor
   */
  initialize(context: AIContext, config?: Partial<MonitoringConfig>): void {
    this.context = context;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isInitialized = true;
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(): void {
    if (!this.isInitialized || !this.context) {
      throw new Error("Health monitor not initialized");
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Run initial check
    this.runHealthCheck();

    // Schedule periodic checks
    this.monitoringInterval = setInterval(() => {
      this.runHealthCheck();
    }, this.config.checkIntervalMs);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Run a health check on all CAPAs
   */
  async runHealthCheck(): Promise<PortfolioHealth> {
    if (!this.context) {
      throw new Error("Health monitor not initialized");
    }

    const capas = await getCAPAs(this.context.organizationId);
    const openCapas = capas.filter((c) => c.status !== "completed" && c.status !== "cancelled");
    
    const healthMetrics: CAPAHealthMetrics[] = [];
    const riskFactorCounts: Map<string, number> = new Map();
    const newEscalations: EscalationEvent[] = [];

    for (const capa of openCapas) {
      const metrics = await this.calculateHealthMetrics(capa);
      healthMetrics.push(metrics);

      // Count risk factors
      for (const factor of metrics.riskFactors) {
        const count = riskFactorCounts.get(factor.factor) || 0;
        riskFactorCounts.set(factor.factor, count + 1);
      }

      // Check escalation triggers
      if (this.config.autoEscalate) {
        const escalations = await this.checkEscalationTriggers(capa, metrics);
        newEscalations.push(...escalations);
      }
    }

    // Calculate portfolio health
    const overdueCapas = healthMetrics.filter((m) => m.status === "overdue").length;
    const atRiskCapas = healthMetrics.filter((m) => m.status === "at_risk").length;
    const criticalCapas = healthMetrics.filter((m) => m.status === "critical").length;
    const averageHealthScore =
      healthMetrics.length > 0
        ? healthMetrics.reduce((sum, m) => sum + m.healthScore, 0) / healthMetrics.length
        : 100;

    // Sort risk factors by count
    const topRiskFactors = [...riskFactorCounts.entries()]
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate effectiveness rate
    const completedCapas = capas.filter((c) => c.status === "completed");
    const effectivenessRate = await this.calculatePortfolioEffectiveness(completedCapas);

    // Determine health trend (compared to last check)
    const healthTrend = this.calculateHealthTrend(averageHealthScore);

    // Store new escalations
    this.escalationEvents.push(...newEscalations);

    return {
      organizationId: this.context.organizationId,
      totalCapas: capas.length,
      openCapas: openCapas.length,
      overdueCapas,
      atRiskCapas,
      criticalCapas,
      averageHealthScore: Math.round(averageHealthScore),
      healthTrend,
      topRiskFactors,
      recentEscalations: newEscalations,
      effectivenessRate,
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate health metrics for a single CAPA
   */
  async calculateHealthMetrics(capa: ActionPlan): Promise<CAPAHealthMetrics> {
    const riskFactors: RiskFactor[] = [];
    let healthScore = 100;

    const now = new Date();
    const dueDate = capa.dueDate?.toDate?.() || new Date();
    const createdDate = capa.createdAt?.toDate?.() || new Date();
    const daysToDeadline = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const totalDuration = Math.ceil((dueDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check overdue status
    if (daysToDeadline < 0) {
      const daysOverdue = Math.abs(daysToDeadline);
      riskFactors.push({
        factor: "overdue",
        severity: daysOverdue > 7 ? "high" : daysOverdue > 3 ? "medium" : "low",
        description: `${daysOverdue} jours de retard`,
        impact: Math.min(daysOverdue * 5, 40),
      });
      healthScore -= Math.min(daysOverdue * 5, 40);
    }

    // Check approaching deadline
    if (daysToDeadline >= 0 && daysToDeadline <= 3 && capa.status !== "completed") {
      riskFactors.push({
        factor: "deadline_approaching",
        severity: daysToDeadline === 0 ? "high" : "medium",
        description: `Échéance dans ${daysToDeadline} jour(s)`,
        impact: 15,
      });
      healthScore -= 15;
    }

    // Check progress vs time elapsed
    const expectedProgress = totalDuration > 0 ? (elapsedDays / totalDuration) * 100 : 0;
    const actualProgress = capa.progress || 0;
    if (actualProgress < expectedProgress - 20 && capa.status !== "completed") {
      riskFactors.push({
        factor: "behind_schedule",
        severity: expectedProgress - actualProgress > 40 ? "high" : "medium",
        description: `Progression ${Math.round(actualProgress)}% vs attendu ${Math.round(expectedProgress)}%`,
        impact: Math.min((expectedProgress - actualProgress) / 2, 25),
      });
      healthScore -= Math.min((expectedProgress - actualProgress) / 2, 25);
    }

    // Check status-related risks
    if (capa.status === "blocked") {
      riskFactors.push({
        factor: "blocked",
        severity: "high",
        description: "CAPA bloquée - intervention requise",
        impact: 30,
      });
      healthScore -= 30;
    }

    // Check for missing assignee
    if (!capa.assignedTo) {
      riskFactors.push({
        factor: "unassigned",
        severity: "medium",
        description: "Aucun responsable assigné",
        impact: 15,
      });
      healthScore -= 15;
    }

    // Check priority alignment
    if (capa.priority === "critique" && capa.status === "pending") {
      const daysSinceCreation = elapsedDays;
      if (daysSinceCreation > 2) {
        riskFactors.push({
          factor: "critical_not_started",
          severity: "high",
          description: `CAPA critique non démarrée depuis ${daysSinceCreation} jours`,
          impact: 20,
        });
        healthScore -= 20;
      }
    }

    // Check for missing verification
    if (capa.status === "completed" && !capa.verifiedAt) {
      riskFactors.push({
        factor: "unverified",
        severity: "medium",
        description: "CAPA terminée mais non vérifiée",
        impact: 10,
      });
      healthScore -= 10;
    }

    // Normalize score
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Calculate sub-scores
    const progressScore = this.calculateProgressScore(capa, expectedProgress);
    const effectivenessScore = await this.calculateEffectivenessScore(capa);
    const complianceScore = this.calculateComplianceScore(capa);

    // Determine status
    let status: CAPAHealthMetrics["status"] = "healthy";
    if (daysToDeadline < 0) {
      status = "overdue";
    } else if (healthScore < this.config.healthScoreThresholds.critical) {
      status = "critical";
    } else if (healthScore < this.config.healthScoreThresholds.atRisk) {
      status = "at_risk";
    }

    // Generate recommendations
    const recommendations = this.generateHealthRecommendations(capa, riskFactors);

    return {
      capaId: capa.id,
      healthScore,
      status,
      riskFactors,
      progressScore,
      effectivenessScore,
      complianceScore,
      lastChecked: new Date(),
      recommendations,
    };
  }

  /**
   * Check and trigger escalations
   */
  async checkEscalationTriggers(
    capa: ActionPlan,
    metrics: CAPAHealthMetrics
  ): Promise<EscalationEvent[]> {
    const events: EscalationEvent[] = [];

    for (const policy of this.policies.filter((p) => p.isActive)) {
      for (const trigger of policy.triggers) {
        let shouldTrigger = false;
        let reason = "";

        switch (trigger.type) {
          case "overdue":
            const daysOverdue = metrics.riskFactors.find((f) => f.factor === "overdue");
            if (daysOverdue && trigger.daysOverdue) {
              const days = parseInt(daysOverdue.description.match(/\d+/)?.[0] || "0");
              shouldTrigger = days >= trigger.daysOverdue;
              reason = `CAPA en retard de ${days} jours`;
            }
            break;

          case "health_score":
            if (trigger.threshold && metrics.healthScore < trigger.threshold) {
              shouldTrigger = true;
              reason = `Score de santé (${metrics.healthScore}) sous le seuil (${trigger.threshold})`;
            }
            break;

          case "blocked":
            if (capa.status === "blocked") {
              shouldTrigger = true;
              reason = "CAPA bloquée";
            }
            break;

          case "compliance":
            if (metrics.complianceScore < (trigger.threshold || 50)) {
              shouldTrigger = true;
              reason = `Score de conformité insuffisant: ${metrics.complianceScore}%`;
            }
            break;
        }

        if (shouldTrigger) {
          // Check if already escalated recently
          const recentEscalation = this.escalationEvents.find(
            (e) =>
              e.capaId === capa.id &&
              e.policyId === policy.id &&
              e.status !== "resolved" &&
              new Date().getTime() - e.triggeredAt.getTime() < 24 * 60 * 60 * 1000
          );

          if (!recentEscalation) {
            const event: EscalationEvent = {
              id: `esc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              capaId: capa.id,
              policyId: policy.id,
              triggeredAt: new Date(),
              triggerReason: reason,
              actions: policy.actions,
              status: "pending",
            };
            events.push(event);
            await this.executeEscalationActions(capa, policy, event);
          }
        }
      }
    }

    return events;
  }

  /**
   * Execute escalation actions
   */
  private async executeEscalationActions(
    capa: ActionPlan,
    policy: EscalationPolicy,
    event: EscalationEvent
  ): Promise<void> {
    if (!this.context) return;

    for (const action of policy.actions) {
      switch (action.type) {
        case "notify":
          // In a real implementation, this would send notifications
          console.log(`[Escalation] Notification for CAPA ${capa.id}: ${event.triggerReason}`);
          break;

        case "flag_priority":
          const newPriority = (action.params?.priority as string) || "haute";
          await updateCAPA(this.context.organizationId, capa.id, {
            priority: newPriority as ActionPlan["priority"],
          });
          break;

        case "escalate_manager":
          // In a real implementation, this would escalate to the manager
          console.log(`[Escalation] Escalated to manager for CAPA ${capa.id}`);
          break;

        case "create_followup":
          // In a real implementation, this would create a follow-up task
          console.log(`[Escalation] Follow-up created for CAPA ${capa.id}`);
          break;

        case "reassign":
          if (action.params?.newAssignee) {
            await updateCAPA(this.context.organizationId, capa.id, {
              assignedTo: action.params.newAssignee as string,
            });
          }
          break;
      }
    }
  }

  /**
   * Calculate effectiveness metrics for a completed CAPA
   */
  async calculateEffectivenessMetrics(capaId: string): Promise<EffectivenessMetrics> {
    if (!this.context) {
      throw new Error("Health monitor not initialized");
    }

    const capas = await getCAPAs(this.context.organizationId);
    const capa = capas.find((c) => c.id === capaId);
    if (!capa) {
      throw new Error("CAPA not found");
    }

    const incidents = await getIncidents(this.context.organizationId);

    // Find related incidents (same type, location, or linked)
    const relatedIncidents = incidents.filter((i) => {
      if (capa.relatedIncidentId === i.id) return true;
      if (i.type === capa.category) return true;
      return false;
    });

    // Find incidents that occurred after CAPA completion (recurrence)
    const completionDate = capa.verifiedAt?.toDate() || capa.completedAt?.toDate() || new Date();
    const recurredIncidents = relatedIncidents.filter(
      (i) => i.createdAt && i.createdAt.toDate() > completionDate
    );

    // Calculate days to implementation
    const createdDate = capa.createdAt?.toDate() || new Date();
    const daysToImplementation = Math.ceil(
      (completionDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate recurrence rate
    const recurrenceRate =
      relatedIncidents.length > 0
        ? (recurredIncidents.length / relatedIncidents.length) * 100
        : 0;

    // Count objectives achieved (simplified - based on verification)
    const totalObjectives = capa.actions?.length || 1;
    const objectivesAchieved = capa.actions?.filter((a) => a.status === "terminée").length || 0;

    // Determine verification status
    let verificationStatus: EffectivenessMetrics["verificationStatus"] = "pending";
    if (capa.verifiedAt) {
      verificationStatus = recurrenceRate === 0 ? "verified" : "failed";
    }

    // Extract lessons learned
    const lessonsLearned: string[] = [];
    if (capa.aiSuggestions) {
      lessonsLearned.push(...capa.aiSuggestions);
    }
    if (capa.notes) {
      lessonsLearned.push(`Note: ${capa.notes}`);
    }

    return {
      capaId,
      measurementDate: new Date(),
      recurredIncidents: recurredIncidents.length,
      totalRelatedIncidents: relatedIncidents.length,
      recurrenceRate,
      daysToImplementation,
      objectivesAchieved,
      totalObjectives,
      verificationStatus,
      lessonsLearned,
      feedbackScore: undefined, // Would come from user feedback
    };
  }

  /**
   * Add or update an escalation policy
   */
  setEscalationPolicy(policy: EscalationPolicy): void {
    const existingIndex = this.policies.findIndex((p) => p.id === policy.id);
    if (existingIndex >= 0) {
      this.policies[existingIndex] = policy;
    } else {
      this.policies.push(policy);
    }
  }

  /**
   * Get all escalation policies
   */
  getEscalationPolicies(): EscalationPolicy[] {
    return [...this.policies];
  }

  /**
   * Get recent escalation events
   */
  getEscalationEvents(
    filter?: { capaId?: string; status?: EscalationEvent["status"] }
  ): EscalationEvent[] {
    let events = [...this.escalationEvents];

    if (filter?.capaId) {
      events = events.filter((e) => e.capaId === filter.capaId);
    }
    if (filter?.status) {
      events = events.filter((e) => e.status === filter.status);
    }

    return events.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  /**
   * Acknowledge an escalation
   */
  acknowledgeEscalation(eventId: string, userId: string): void {
    const event = this.escalationEvents.find((e) => e.id === eventId);
    if (event) {
      event.status = "acknowledged";
    }
  }

  /**
   * Resolve an escalation
   */
  resolveEscalation(eventId: string, userId: string): void {
    const event = this.escalationEvents.find((e) => e.id === eventId);
    if (event) {
      event.status = "resolved";
      event.resolvedAt = new Date();
      event.resolvedBy = userId;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private calculateProgressScore(capa: ActionPlan, expectedProgress: number): number {
    const actualProgress = capa.progress || 0;
    if (capa.status === "completed") return 100;

    const progressRatio = expectedProgress > 0 ? (actualProgress / expectedProgress) * 100 : 100;
    return Math.min(100, Math.max(0, Math.round(progressRatio)));
  }

  private async calculateEffectivenessScore(capa: ActionPlan): Promise<number> {
    if (capa.status !== "completed") return 0;

    // Basic effectiveness based on verification status
    let score = 50;

    if (capa.verifiedAt) {
      score += 30;
    }

    if (capa.aiConfidence && capa.aiConfidence > 80) {
      score += 10;
    }

    // Deduct for late completion
    const dueDate = capa.dueDate?.toDate();
    const completedDate = capa.completedAt?.toDate();
    if (dueDate && completedDate && completedDate > dueDate) {
      const daysLate = Math.ceil(
        (completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      score -= Math.min(daysLate * 2, 20);
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateComplianceScore(capa: ActionPlan): number {
    let score = 100;

    // Check for required fields
    if (!capa.description || capa.description.length < 20) score -= 15;
    if (!capa.assignedTo) score -= 20;
    if (!capa.dueDate) score -= 15;
    if (!capa.rootCause && capa.category === "correctif") score -= 20;
    if (!capa.actions || capa.actions.length === 0) score -= 15;

    return Math.max(0, score);
  }

  private generateHealthRecommendations(
    capa: ActionPlan,
    riskFactors: RiskFactor[]
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    for (const factor of riskFactors) {
      switch (factor.factor) {
        case "overdue":
          recommendations.push({
            type: "action",
            message: "Mettre à jour le statut et la progression de cette CAPA immédiatement",
            priority: factor.severity === "high" ? "critical" : "high",
          });
          break;

        case "deadline_approaching":
          recommendations.push({
            type: "warning",
            message: "L'échéance approche - vérifier l'avancement et ajuster si nécessaire",
            priority: "high",
            dueDate: capa.dueDate?.toDate(),
          });
          break;

        case "behind_schedule":
          recommendations.push({
            type: "action",
            message: "Accélérer les actions ou demander une extension de délai justifiée",
            priority: "medium",
          });
          break;

        case "blocked":
          recommendations.push({
            type: "action",
            message: "Identifier et résoudre les blocages avec les parties prenantes",
            priority: "critical",
          });
          break;

        case "unassigned":
          recommendations.push({
            type: "action",
            message: "Assigner un responsable pour cette CAPA",
            priority: "high",
          });
          break;

        case "critical_not_started":
          recommendations.push({
            type: "action",
            message: "Démarrer immédiatement cette CAPA critique",
            priority: "critical",
          });
          break;

        case "unverified":
          recommendations.push({
            type: "action",
            message: "Procéder à la vérification de l'efficacité",
            priority: "medium",
          });
          break;
      }
    }

    return recommendations;
  }

  private async calculatePortfolioEffectiveness(completedCapas: ActionPlan[]): Promise<number> {
    if (completedCapas.length === 0) return 100;

    let totalScore = 0;
    for (const capa of completedCapas) {
      totalScore += await this.calculateEffectivenessScore(capa);
    }

    return Math.round(totalScore / completedCapas.length);
  }

  private previousHealthScore: number = 100;
  private calculateHealthTrend(
    currentScore: number
  ): "improving" | "stable" | "declining" {
    const diff = currentScore - this.previousHealthScore;
    this.previousHealthScore = currentScore;

    if (diff > 5) return "improving";
    if (diff < -5) return "declining";
    return "stable";
  }
}

// =============================================================================
// Singleton
// =============================================================================

let healthMonitorInstance: CAPAHealthMonitor | null = null;

export function getCAPAHealthMonitor(): CAPAHealthMonitor {
  if (!healthMonitorInstance) {
    healthMonitorInstance = new CAPAHealthMonitor();
  }
  return healthMonitorInstance;
}

export function resetCAPAHealthMonitor(): void {
  if (healthMonitorInstance) {
    healthMonitorInstance.stopMonitoring();
  }
  healthMonitorInstance = null;
}

export function isHealthMonitorEnabled(): boolean {
  return isGeminiEnabled();
}

