/**
 * CAPA Scheduling Service
 *
 * Intelligent scheduling engine for CAPAs with dependency management,
 * resource awareness, and priority optimization.
 */

import { GeminiClient, isGeminiEnabled } from "./geminiClient";
import { getToolsForBot } from "./tools";
import type {
  AIContext,
  CAPADependencyGraph,
  CAPANode,
  CAPAEdge,
  CAPAEdgeType,
} from "./types";
import type { ActionPlan } from "@/types/capa";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

// =============================================================================
// Types
// =============================================================================

export interface SchedulingResult {
  graph: CAPADependencyGraph;
  schedule: ScheduledCAPA[];
  conflicts: SchedulingConflict[];
  recommendations: SchedulingRecommendation[];
  ganttData: GanttChartData;
}

export interface ScheduledCAPA {
  capaId: string;
  title: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  estimatedDuration: number; // days
  priority: number;
  dependencies: string[];
  assigneeId?: string;
  isOnCriticalPath: boolean;
  slack: number; // days of slack time
}

export interface SchedulingConflict {
  type: "resource" | "deadline" | "dependency" | "overlap";
  severity: "high" | "medium" | "low";
  description: string;
  affectedCapaIds: string[];
  suggestedResolution: string;
}

export interface SchedulingRecommendation {
  type: "reorder" | "parallelize" | "delegate" | "extend" | "merge";
  description: string;
  expectedBenefit: string;
  affectedCapaIds: string[];
  priority: "high" | "medium" | "low";
}

export interface GanttChartData {
  items: GanttItem[];
  milestones: GanttMilestone[];
  criticalPath: string[];
  totalDuration: number;
}

export interface GanttItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies: string[];
  color: string;
  isOnCriticalPath: boolean;
}

export interface GanttMilestone {
  id: string;
  title: string;
  date: Date;
  linkedCapaIds: string[];
}

// =============================================================================
// Scheduling Weights
// =============================================================================

const SCHEDULING_WEIGHTS = {
  dueDate: 0.30,
  incidentSeverity: 0.25,
  resourceAvailability: 0.20,
  dependencyConstraints: 0.15,
  regulatoryDeadlines: 0.10,
};

const PRIORITY_SCORES: Record<string, number> = {
  critique: 100,
  haute: 75,
  moyenne: 50,
  basse: 25,
};

const SEVERITY_SCORES: Record<string, number> = {
  critical: 100,
  severe: 75,
  moderate: 50,
  minor: 25,
};

// =============================================================================
// Scheduling Service Class
// =============================================================================

export class SchedulingService {
  private client: GeminiClient;
  private context: AIContext | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Initialize the scheduling service
   */
  initialize(context: AIContext): void {
    this.context = context;

    const tools = getToolsForBot("capa_ai");

    this.client.initialize({
      botType: "capa_ai",
      context,
      tools,
      systemPrompt: "Tu es un expert en planification et ordonnancement des actions correctives et préventives.",
      modelType: "flash",
    });

    this.client.startChat([]);
    this.isInitialized = true;
  }

  /**
   * Build CAPA dependency graph
   */
  async buildDependencyGraph(): Promise<CAPADependencyGraph> {
    if (!this.context) {
      throw new Error("Scheduling service not initialized");
    }

    // Fetch all active CAPAs
    const capas = await this.fetchActiveCAPAs();

    if (capas.length === 0) {
      return {
        nodes: [],
        edges: [],
        criticalPath: [],
        estimatedTotalDuration: 0,
        bottlenecks: [],
        parallelizableGroups: [],
      };
    }

    // Create nodes from CAPAs
    const nodes = this.createNodes(capas);

    // Detect dependencies
    const edges = await this.detectDependencies(capas, nodes);

    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(nodes, edges);

    // Find bottlenecks
    const bottlenecks = this.findBottlenecks(nodes, edges);

    // Identify parallelizable groups
    const parallelizableGroups = this.findParallelizableGroups(nodes, edges);

    // Calculate total duration
    const estimatedTotalDuration = this.calculateTotalDuration(
      nodes,
      edges,
      criticalPath
    );

    return {
      nodes,
      edges,
      criticalPath,
      estimatedTotalDuration,
      bottlenecks,
      parallelizableGroups,
    };
  }

  /**
   * Generate optimized schedule
   */
  async generateSchedule(): Promise<SchedulingResult> {
    if (!this.context) {
      throw new Error("Scheduling service not initialized");
    }

    const graph = await this.buildDependencyGraph();

    if (graph.nodes.length === 0) {
      return {
        graph,
        schedule: [],
        conflicts: [],
        recommendations: [],
        ganttData: {
          items: [],
          milestones: [],
          criticalPath: [],
          totalDuration: 0,
        },
      };
    }

    // Generate schedule based on dependencies and priorities
    const schedule = this.scheduleCapas(graph);

    // Detect conflicts
    const conflicts = this.detectConflicts(schedule, graph);

    // Generate recommendations
    const recommendations = this.generateRecommendations(schedule, graph, conflicts);

    // Build Gantt chart data
    const ganttData = this.buildGanttData(schedule, graph);

    return {
      graph,
      schedule,
      conflicts,
      recommendations,
      ganttData,
    };
  }

  /**
   * Optimize existing schedule
   */
  async optimizeSchedule(
    currentSchedule: ScheduledCAPA[]
  ): Promise<SchedulingResult> {
    const graph = await this.buildDependencyGraph();

    // Re-schedule with optimization
    const optimizedSchedule = this.optimizeCapaOrder(currentSchedule, graph);

    const conflicts = this.detectConflicts(optimizedSchedule, graph);
    const recommendations = this.generateRecommendations(optimizedSchedule, graph, conflicts);
    const ganttData = this.buildGanttData(optimizedSchedule, graph);

    return {
      graph,
      schedule: optimizedSchedule,
      conflicts,
      recommendations,
      ganttData,
    };
  }

  /**
   * Get scheduling impact of adding a new CAPA
   */
  async getImpactAnalysis(
    newCapa: Partial<ActionPlan>
  ): Promise<{
    suggestedStartDate: Date;
    affectedCapas: string[];
    potentialConflicts: SchedulingConflict[];
    recommendations: string[];
  }> {
    const graph = await this.buildDependencyGraph();

    // Calculate priority score for new CAPA
    const priorityScore = PRIORITY_SCORES[newCapa.priority || "moyenne"] || 50;

    // Find suitable slot
    const suggestedStartDate = this.findOptimalStartDate(
      graph,
      priorityScore,
      newCapa.dueDate as Date | undefined
    );

    // Find CAPAs that would be affected
    const affectedCapas = graph.nodes
      .filter((n) => {
        const nodeStart = n.dueDate.getTime() - n.estimatedDuration * 24 * 60 * 60 * 1000;
        return nodeStart >= suggestedStartDate.getTime();
      })
      .map((n) => n.id);

    // Detect potential conflicts
    const potentialConflicts = this.detectPotentialConflicts(
      newCapa,
      graph,
      suggestedStartDate
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (priorityScore >= 75) {
      recommendations.push("CAPA haute priorité - considérer une affectation immédiate");
    }
    if (affectedCapas.length > 2) {
      recommendations.push(`${affectedCapas.length} CAPAs pourraient être impactées - réviser le calendrier`);
    }
    if (potentialConflicts.length > 0) {
      recommendations.push("Des conflits potentiels ont été détectés - voir les détails");
    }

    return {
      suggestedStartDate,
      affectedCapas,
      potentialConflicts,
      recommendations,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async fetchActiveCAPAs(): Promise<ActionPlan[]> {
    if (!this.context) return [];

    try {
      const capasRef = collection(
        db,
        `organizations/${this.context.organizationId}/capas`
      );
      const q = query(
        capasRef,
        where("status", "in", ["draft", "in_progress", "pending_validation"]),
        orderBy("dueDate", "asc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ActionPlan[];
    } catch (error) {
      console.error("Error fetching CAPAs:", error);
      return [];
    }
  }

  private createNodes(capas: ActionPlan[]): CAPANode[] {
    return capas.map((capa) => {
      const dueDate =
        capa.dueDate instanceof Timestamp
          ? capa.dueDate.toDate()
          : new Date(capa.dueDate);

      // Estimate duration based on complexity and type
      const estimatedDuration = this.estimateDuration(capa);

      // Calculate criticality score
      const criticalityScore = this.calculateCriticalityScore(capa, dueDate);

      return {
        id: capa.id,
        title: capa.title,
        status: capa.status,
        priority: capa.priority,
        dueDate,
        progress: capa.progress,
        assigneeId: capa.assigneeId,
        estimatedDuration,
        criticalityScore,
      };
    });
  }

  private estimateDuration(capa: ActionPlan): number {
    // Base duration by category
    const baseDuration = capa.category === "correctif" ? 14 : 21;

    // Adjust by priority
    const priorityMultiplier =
      capa.priority === "critique"
        ? 0.5
        : capa.priority === "haute"
        ? 0.75
        : capa.priority === "basse"
        ? 1.5
        : 1;

    // Consider progress
    const remainingWork = (100 - (capa.progress || 0)) / 100;

    return Math.ceil(baseDuration * priorityMultiplier * remainingWork);
  }

  private calculateCriticalityScore(capa: ActionPlan, dueDate: Date): number {
    let score = 0;

    // Priority weight (30%)
    score += (PRIORITY_SCORES[capa.priority] || 50) * 0.3;

    // Due date urgency (30%)
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    if (daysUntilDue <= 0) score += 30; // Overdue
    else if (daysUntilDue <= 7) score += 25;
    else if (daysUntilDue <= 14) score += 15;
    else if (daysUntilDue <= 30) score += 10;

    // Progress (20%) - stalled CAPAs are more critical
    if (capa.progress < 25) score += 20;
    else if (capa.progress < 50) score += 15;
    else if (capa.progress < 75) score += 10;

    // Category (20%) - corrective actions often more urgent
    if (capa.category === "correctif") score += 20;
    else score += 10;

    return Math.min(100, score);
  }

  private async detectDependencies(
    capas: ActionPlan[],
    nodes: CAPANode[]
  ): Promise<CAPAEdge[]> {
    const edges: CAPAEdge[] = [];

    // Group CAPAs by linked incident
    const incidentGroups = new Map<string, ActionPlan[]>();
    for (const capa of capas) {
      if (capa.linkedIncidentId) {
        if (!incidentGroups.has(capa.linkedIncidentId)) {
          incidentGroups.set(capa.linkedIncidentId, []);
        }
        incidentGroups.get(capa.linkedIncidentId)!.push(capa);
      }
    }

    // CAPAs from same incident may have dependencies
    for (const [_incidentId, groupCapas] of incidentGroups) {
      if (groupCapas.length > 1) {
        // Sort by category - corrective before preventive
        const sorted = groupCapas.sort((a, b) => {
          if (a.category === "correctif" && b.category === "preventif") return -1;
          if (a.category === "preventif" && b.category === "correctif") return 1;
          return 0;
        });

        // Create edges between related CAPAs
        for (let i = 0; i < sorted.length - 1; i++) {
          edges.push({
            from: sorted[i].id,
            to: sorted[i + 1].id,
            type: "informs",
            strength: 0.7,
            description: "Liés au même incident",
          });
        }
      }
    }

    // Detect blocking relationships based on title/description similarity
    for (let i = 0; i < capas.length; i++) {
      for (let j = i + 1; j < capas.length; j++) {
        const similarity = this.calculateTextSimilarity(
          capas[i].title + " " + capas[i].description,
          capas[j].title + " " + capas[j].description
        );

        if (similarity > 0.5) {
          edges.push({
            from: capas[i].id,
            to: capas[j].id,
            type: "enhances",
            strength: similarity,
            description: "Actions similaires",
          });
        }
      }
    }

    // Detect resource conflicts (same assignee)
    const assigneeGroups = new Map<string, CAPANode[]>();
    for (const node of nodes) {
      if (node.assigneeId) {
        if (!assigneeGroups.has(node.assigneeId)) {
          assigneeGroups.set(node.assigneeId, []);
        }
        assigneeGroups.get(node.assigneeId)!.push(node);
      }
    }

    for (const [_assigneeId, assigneeNodes] of assigneeGroups) {
      if (assigneeNodes.length > 1) {
        // Sort by criticality
        const sorted = assigneeNodes.sort(
          (a, b) => b.criticalityScore - a.criticalityScore
        );

        for (let i = 0; i < sorted.length - 1; i++) {
          edges.push({
            from: sorted[i].id,
            to: sorted[i + 1].id,
            type: "conflicts",
            strength: 0.5,
            description: "Même responsable",
          });
        }
      }
    }

    return edges;
  }

  private calculateCriticalPath(nodes: CAPANode[], edges: CAPAEdge[]): string[] {
    if (nodes.length === 0) return [];

    // Build adjacency list
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of nodes) {
      adj.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const edge of edges) {
      if (edge.type === "blocks" || edge.type === "requires") {
        adj.get(edge.from)?.push(edge.to);
        inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
      }
    }

    // Topological sort using Kahn's algorithm
    const queue: string[] = [];
    const result: string[] = [];

    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      // Sort by criticality to prioritize critical nodes
      queue.sort((a, b) => {
        const nodeA = nodes.find((n) => n.id === a);
        const nodeB = nodes.find((n) => n.id === b);
        return (nodeB?.criticalityScore || 0) - (nodeA?.criticalityScore || 0);
      });

      const current = queue.shift()!;
      result.push(current);

      for (const neighbor of adj.get(current) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Return top 5 as critical path
    return result.slice(0, 5);
  }

  private findBottlenecks(nodes: CAPANode[], edges: CAPAEdge[]): string[] {
    // Count outgoing blocking edges
    const outgoingCounts = new Map<string, number>();

    for (const edge of edges) {
      if (edge.type === "blocks" || edge.type === "requires") {
        outgoingCounts.set(
          edge.from,
          (outgoingCounts.get(edge.from) || 0) + 1
        );
      }
    }

    // Nodes with many outgoing dependencies are bottlenecks
    return [...outgoingCounts.entries()]
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([nodeId]) => nodeId);
  }

  private findParallelizableGroups(
    nodes: CAPANode[],
    edges: CAPAEdge[]
  ): string[][] {
    // Find nodes with no dependencies between them
    const dependentPairs = new Set<string>();
    for (const edge of edges) {
      if (edge.type === "blocks" || edge.type === "requires") {
        dependentPairs.add(`${edge.from}-${edge.to}`);
        dependentPairs.add(`${edge.to}-${edge.from}`);
      }
    }

    const groups: string[][] = [];

    // Simple grouping: nodes with same priority and no dependencies
    const priorityGroups = new Map<string, CAPANode[]>();
    for (const node of nodes) {
      if (!priorityGroups.has(node.priority)) {
        priorityGroups.set(node.priority, []);
      }
      priorityGroups.get(node.priority)!.push(node);
    }

    for (const [_priority, groupNodes] of priorityGroups) {
      const parallelGroup: string[] = [];

      for (const node of groupNodes) {
        const canParallelize = parallelGroup.every(
          (otherId) =>
            !dependentPairs.has(`${node.id}-${otherId}`)
        );

        if (canParallelize) {
          parallelGroup.push(node.id);
        }
      }

      if (parallelGroup.length > 1) {
        groups.push(parallelGroup);
      }
    }

    return groups;
  }

  private calculateTotalDuration(
    nodes: CAPANode[],
    edges: CAPAEdge[],
    criticalPath: string[]
  ): number {
    if (criticalPath.length === 0) {
      return nodes.reduce((sum, n) => sum + n.estimatedDuration, 0);
    }

    // Sum duration of critical path
    return criticalPath.reduce((sum, nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      return sum + (node?.estimatedDuration || 0);
    }, 0);
  }

  private scheduleCapas(graph: CAPADependencyGraph): ScheduledCAPA[] {
    const schedule: ScheduledCAPA[] = [];
    const scheduledIds = new Set<string>();
    const now = new Date();

    // Sort nodes by criticality
    const sortedNodes = [...graph.nodes].sort(
      (a, b) => b.criticalityScore - a.criticalityScore
    );

    for (const node of sortedNodes) {
      // Find dependencies that must complete first
      const dependencies = graph.edges
        .filter(
          (e) =>
            e.to === node.id &&
            (e.type === "blocks" || e.type === "requires")
        )
        .map((e) => e.from);

      // Calculate start date based on dependencies
      let startDate = now;
      for (const depId of dependencies) {
        const depSchedule = schedule.find((s) => s.capaId === depId);
        if (depSchedule && depSchedule.scheduledEnd > startDate) {
          startDate = new Date(depSchedule.scheduledEnd.getTime() + 24 * 60 * 60 * 1000);
        }
      }

      // Calculate end date
      const endDate = new Date(
        startDate.getTime() + node.estimatedDuration * 24 * 60 * 60 * 1000
      );

      // Calculate slack (time between end and due date)
      const slack = Math.max(
        0,
        Math.ceil(
          (node.dueDate.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000)
        )
      );

      schedule.push({
        capaId: node.id,
        title: node.title,
        scheduledStart: startDate,
        scheduledEnd: endDate,
        estimatedDuration: node.estimatedDuration,
        priority: node.criticalityScore,
        dependencies,
        assigneeId: node.assigneeId,
        isOnCriticalPath: graph.criticalPath.includes(node.id),
        slack,
      });

      scheduledIds.add(node.id);
    }

    return schedule;
  }

  private detectConflicts(
    schedule: ScheduledCAPA[],
    graph: CAPADependencyGraph
  ): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];

    // Check for deadline violations
    for (const item of schedule) {
      const node = graph.nodes.find((n) => n.id === item.capaId);
      if (node && item.scheduledEnd > node.dueDate) {
        conflicts.push({
          type: "deadline",
          severity: item.isOnCriticalPath ? "high" : "medium",
          description: `CAPA "${item.title}" dépassera l'échéance de ${Math.ceil(
            (item.scheduledEnd.getTime() - node.dueDate.getTime()) /
              (24 * 60 * 60 * 1000)
          )} jour(s)`,
          affectedCapaIds: [item.capaId],
          suggestedResolution: "Augmenter les ressources ou réviser l'échéance",
        });
      }
    }

    // Check for resource conflicts (same assignee, overlapping dates)
    const assigneeSchedules = new Map<string, ScheduledCAPA[]>();
    for (const item of schedule) {
      if (item.assigneeId) {
        if (!assigneeSchedules.has(item.assigneeId)) {
          assigneeSchedules.set(item.assigneeId, []);
        }
        assigneeSchedules.get(item.assigneeId)!.push(item);
      }
    }

    for (const [_assigneeId, items] of assigneeSchedules) {
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          // Check overlap
          if (
            items[i].scheduledStart < items[j].scheduledEnd &&
            items[i].scheduledEnd > items[j].scheduledStart
          ) {
            conflicts.push({
              type: "resource",
              severity: "medium",
              description: `Conflit de ressource: "${items[i].title}" et "${items[j].title}" se chevauchent`,
              affectedCapaIds: [items[i].capaId, items[j].capaId],
              suggestedResolution: "Réaffecter une des CAPAs ou décaler les dates",
            });
          }
        }
      }
    }

    return conflicts;
  }

  private generateRecommendations(
    schedule: ScheduledCAPA[],
    graph: CAPADependencyGraph,
    conflicts: SchedulingConflict[]
  ): SchedulingRecommendation[] {
    const recommendations: SchedulingRecommendation[] = [];

    // Recommend parallelization
    for (const group of graph.parallelizableGroups) {
      if (group.length >= 2) {
        recommendations.push({
          type: "parallelize",
          description: `${group.length} CAPAs peuvent être traitées en parallèle`,
          expectedBenefit: `Réduction potentielle de ${Math.round(
            schedule
              .filter((s) => group.includes(s.capaId))
              .reduce((sum, s) => sum + s.estimatedDuration, 0) * 0.3
          )} jours`,
          affectedCapaIds: group,
          priority: "medium",
        });
      }
    }

    // Recommend delegation for bottlenecks
    for (const bottleneck of graph.bottlenecks) {
      const node = graph.nodes.find((n) => n.id === bottleneck);
      if (node) {
        recommendations.push({
          type: "delegate",
          description: `CAPA "${node.title}" bloque plusieurs autres actions`,
          expectedBenefit: "Débloquer les CAPAs dépendantes plus rapidement",
          affectedCapaIds: [bottleneck],
          priority: "high",
        });
      }
    }

    // Recommend extensions for deadline conflicts
    const deadlineConflicts = conflicts.filter((c) => c.type === "deadline");
    if (deadlineConflicts.length > 0) {
      recommendations.push({
        type: "extend",
        description: `${deadlineConflicts.length} CAPA(s) risquent de dépasser leur échéance`,
        expectedBenefit: "Éviter les retards et les pénalités",
        affectedCapaIds: deadlineConflicts.flatMap((c) => c.affectedCapaIds),
        priority: "high",
      });
    }

    return recommendations;
  }

  private buildGanttData(
    schedule: ScheduledCAPA[],
    graph: CAPADependencyGraph
  ): GanttChartData {
    const priorityColors: Record<string, string> = {
      critique: "#ef4444",
      haute: "#f97316",
      moyenne: "#eab308",
      basse: "#22c55e",
    };

    const items: GanttItem[] = schedule.map((s) => {
      const node = graph.nodes.find((n) => n.id === s.capaId);
      return {
        id: s.capaId,
        title: s.title,
        start: s.scheduledStart,
        end: s.scheduledEnd,
        progress: node?.progress || 0,
        dependencies: s.dependencies,
        color: priorityColors[node?.priority || "moyenne"],
        isOnCriticalPath: s.isOnCriticalPath,
      };
    });

    // Create milestones for due dates
    const milestones: GanttMilestone[] = [];
    const seenDates = new Set<string>();

    for (const node of graph.nodes) {
      const dateKey = node.dueDate.toISOString().split("T")[0];
      if (!seenDates.has(dateKey)) {
        seenDates.add(dateKey);
        const linkedCapas = graph.nodes
          .filter((n) => n.dueDate.toISOString().split("T")[0] === dateKey)
          .map((n) => n.id);

        milestones.push({
          id: `milestone-${dateKey}`,
          title: `Échéance: ${linkedCapas.length} CAPA(s)`,
          date: node.dueDate,
          linkedCapaIds: linkedCapas,
        });
      }
    }

    return {
      items,
      milestones,
      criticalPath: graph.criticalPath,
      totalDuration: graph.estimatedTotalDuration,
    };
  }

  private optimizeCapaOrder(
    currentSchedule: ScheduledCAPA[],
    graph: CAPADependencyGraph
  ): ScheduledCAPA[] {
    // Re-calculate based on updated criticality scores
    return this.scheduleCapas(graph);
  }

  private findOptimalStartDate(
    graph: CAPADependencyGraph,
    priorityScore: number,
    dueDate?: Date
  ): Date {
    const now = new Date();

    if (priorityScore >= 90) {
      // Critical - start immediately
      return now;
    }

    if (dueDate) {
      // Calculate backward from due date
      const workDays = Math.ceil(priorityScore / 5); // Rough estimate
      return new Date(
        Math.max(
          now.getTime(),
          dueDate.getTime() - workDays * 24 * 60 * 60 * 1000
        )
      );
    }

    // Default: start after current queue
    const lastEnd = Math.max(
      ...graph.nodes.map((n) => n.dueDate.getTime()),
      now.getTime()
    );

    return new Date(lastEnd);
  }

  private detectPotentialConflicts(
    newCapa: Partial<ActionPlan>,
    graph: CAPADependencyGraph,
    startDate: Date
  ): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];

    // Check if assignee is already overloaded
    if (newCapa.assigneeId) {
      const assigneeCapas = graph.nodes.filter(
        (n) => n.assigneeId === newCapa.assigneeId
      );
      if (assigneeCapas.length >= 3) {
        conflicts.push({
          type: "resource",
          severity: "medium",
          description: `Le responsable a déjà ${assigneeCapas.length} CAPAs en cours`,
          affectedCapaIds: assigneeCapas.map((n) => n.id),
          suggestedResolution: "Considérer un autre responsable",
        });
      }
    }

    return conflicts;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = [...words1].filter((w) => words2.has(w) && w.length > 4);
    const union = new Set([...words1, ...words2]);

    return intersection.length / union.size;
  }
}

// =============================================================================
// Singleton
// =============================================================================

let schedulingServiceInstance: SchedulingService | null = null;

export function getSchedulingService(): SchedulingService {
  if (!schedulingServiceInstance) {
    schedulingServiceInstance = new SchedulingService();
  }
  return schedulingServiceInstance;
}

export function resetSchedulingService(): void {
  schedulingServiceInstance = null;
}

export function isSchedulingServiceEnabled(): boolean {
  return isGeminiEnabled();
}

