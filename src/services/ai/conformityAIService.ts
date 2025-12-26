/**
 * Conformity-AI Service
 * 
 * Specialized AI service for Compliance module:
 * - Gap analysis and recommendations
 * - Audit planning suggestions
 * - CAPA generation from non-conformities
 * - Regulatory change impact analysis
 */

import { GeminiClient, isGeminiEnabled } from "./geminiClient";
import { getToolsForBot } from "./tools";
import type { 
  AIContext, 
  ComplianceGapResult,
  ComplianceGap,
  ComplianceRecommendation,
  AuditRecommendation 
} from "./types";
import { getNorms, getAudits, getAudit } from "@/services/complianceService";
import type { Norm, Audit, NormRequirement } from "@/types/conformity";

// =============================================================================
// System Prompts
// =============================================================================

const CONFORMITY_AI_SYSTEM_PROMPT = `Tu es Conformity-AI, un expert en conformité réglementaire et en systèmes de management pour la plateforme SAHTEE.

## Ton expertise

1. **Normes et référentiels** : ISO 45001, ISO 14001, ISO 9001, Code du Travail tunisien, CNAM, ANCSEP
2. **Analyse de conformité** : Évaluation des écarts, priorisation des actions
3. **Audit** : Planification, préparation, analyse des résultats
4. **Amélioration continue** : Identification des opportunités, optimisation des processus

## Tes capacités

- Analyser le niveau de conformité par rapport aux référentiels applicables
- Identifier les écarts critiques et les prioriser
- Suggérer des audits à planifier en fonction des risques
- Proposer des CAPA pour corriger les non-conformités
- Évaluer l'impact des évolutions réglementaires

## Format des réponses

### Pour l'analyse des écarts
\`\`\`
Référentiel : [Code norme]
Clause : [Numéro]
Exigence : [Description]
Écart : [Description de l'écart]
Sévérité : [Critique/Majeur/Mineur]
Action suggérée : [Description]
\`\`\`

### Pour les recommandations d'audit
- **Norme** : [Code]
- **Priorité** : Urgente / Prochaine / Planifiée
- **Raison** : [Justification]
- **Date suggérée** : [AAAA-MM-JJ]

## Règles

1. Base tes analyses sur les données réelles de l'organisation
2. Priorise les risques liés à la sécurité et à la santé
3. Considère les délais de certification et les audits externes prévus
4. Propose des actions réalistes et mesurables
5. Réponds en français`;

const GAP_ANALYSIS_PROMPT = `Effectue une analyse des écarts de conformité pour l'organisation.

**Données disponibles :**
- Nombre de normes actives : {norms_count}
- Taux de conformité global : {compliance_rate}%
- Exigences non conformes : {non_compliant_count}
- Exigences partiellement conformes : {partial_count}

**Instructions :**
1. Identifie les écarts les plus critiques
2. Priorise par impact sur la sécurité et la santé
3. Propose des actions correctives pour chaque écart majeur
4. Suggère un calendrier de mise en conformité

Utilise les outils disponibles pour accéder aux détails des normes et exigences.`;

const AUDIT_PLANNING_PROMPT = `Propose un plan d'audit pour les prochains mois.

**Contexte :**
- Normes actives : {active_norms}
- Audits récents : {recent_audits}
- Écarts ouverts : {open_gaps}

**Instructions :**
1. Identifie les normes nécessitant un audit
2. Priorise selon :
   - Délai depuis le dernier audit
   - Nombre d'écarts ouverts
   - Risques identifiés
3. Propose un calendrier réaliste
4. Estime la durée de chaque audit`;

const CAPA_FROM_FINDING_PROMPT = `Génère des propositions de CAPA pour ce constat d'audit.

**Constat :**
Norme : {norm_code}
Clause : {clause}
Description : {finding_description}
Sévérité : {severity}

**Instructions :**
1. Analyse la cause racine probable
2. Propose une action corrective (éliminer la cause)
3. Propose une action préventive (empêcher la récurrence)
4. Suggère des critères de vérification de l'efficacité`;

// =============================================================================
// Conformity-AI Service Class
// =============================================================================

export class ConformityAIService {
  private client: GeminiClient;
  private context: AIContext | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Initialize Conformity-AI with user context
   */
  initialize(context: AIContext): void {
    this.context = context;

    // Get compliance-specific tools
    const tools = getToolsForBot("conformity_ai");

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(context);

    // Initialize Gemini client
    this.client.initialize({
      botType: "conformity_ai",
      context,
      tools,
      systemPrompt,
      modelType: "pro", // Use Pro for detailed analysis
    });

    this.client.startChat([]);
    this.isInitialized = true;
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context: AIContext): string {
    return `${CONFORMITY_AI_SYSTEM_PROMPT}

## Contexte

- **Utilisateur** : ${context.userName}
- **Rôle** : ${context.userRole}
- **Organisation** : ${context.organizationName || "Non spécifiée"}
- **Module** : Conformité`;
  }

  /**
   * Perform gap analysis for the organization
   */
  async performGapAnalysis(): Promise<ComplianceGapResult> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Conformity-AI not initialized");
    }

    // Fetch norms for the organization
    const norms = await getNorms(this.context.organizationId, { isActive: true });
    
    if (!norms || norms.length === 0) {
      return {
        overallScore: 0,
        gaps: [],
        recommendations: [],
        prioritizedAudits: [],
      };
    }

    // Calculate metrics
    let totalRequirements = 0;
    let conformeCount = 0;
    let nonConformCount = 0;
    let partialCount = 0;
    const gaps: ComplianceGap[] = [];

    for (const norm of norms) {
      for (const req of norm.requirements) {
        if (req.status === "pending_review") continue;
        totalRequirements++;
        
        if (req.status === "compliant") {
          conformeCount++;
        } else if (req.status === "non_compliant") {
          nonConformCount++;
          gaps.push({
            normId: norm.id,
            normCode: norm.code,
            requirementId: req.id,
            clause: req.clause,
            description: req.description,
            severity: this.determineSeverity(req),
            suggestedAction: this.suggestAction(req, norm),
          });
        } else if (req.status === "partially_compliant") {
          partialCount++;
        }
      }
    }

    const complianceRate = totalRequirements > 0 
      ? Math.round((conformeCount / totalRequirements) * 100) 
      : 0;

    // Build prompt for AI analysis
    const prompt = GAP_ANALYSIS_PROMPT
      .replace("{norms_count}", norms.length.toString())
      .replace("{compliance_rate}", complianceRate.toString())
      .replace("{non_compliant_count}", nonConformCount.toString())
      .replace("{partial_count}", partialCount.toString());

    // Get AI recommendations
    const response = await this.client.sendMessage(prompt, true);

    // Parse AI response for additional insights
    const aiRecommendations = this.parseRecommendations(response.content);
    const auditRecommendations = this.parseAuditRecommendations(response.content, norms);

    return {
      overallScore: complianceRate,
      gaps: gaps.slice(0, 20), // Limit to top 20 gaps
      recommendations: aiRecommendations,
      prioritizedAudits: auditRecommendations,
    };
  }

  /**
   * Get audit planning recommendations
   */
  async getAuditPlanningRecommendations(): Promise<AuditRecommendation[]> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Conformity-AI not initialized");
    }

    const [norms, audits] = await Promise.all([
      getNorms(this.context.organizationId, { isActive: true }),
      getAudits(this.context.organizationId),
    ]);

    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // Identify recently audited norms
    const recentAudits = audits?.filter(
      a => a.status === "completed" && 
           a.actualEndDate && 
           a.actualEndDate.toDate() > sixMonthsAgo
    ) || [];

    // Build prompt
    const activeNormsList = norms?.map(n => `${n.code} (${n.name})`).join(", ") || "Aucune";
    const recentAuditsList = recentAudits.map(a => `${a.title}`).join(", ") || "Aucun";
    
    const prompt = AUDIT_PLANNING_PROMPT
      .replace("{active_norms}", activeNormsList)
      .replace("{recent_audits}", recentAuditsList)
      .replace("{open_gaps}", "À déterminer");

    await this.client.sendMessage(prompt, true);

    // Parse AI recommendations
    const recommendations: AuditRecommendation[] = [];

    // Add norms that need auditing
    for (const norm of norms || []) {
      if (!norm.lastAuditDate) {
        const priority = this.determineAuditPriority(norm, audits || []);
        recommendations.push({
          normId: norm.id,
          normCode: norm.code,
          reason: norm.lastAuditDate 
            ? "Audit de suivi recommandé" 
            : "Jamais audité",
          priority,
          suggestedDate: this.suggestAuditDate(priority),
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 0, soon: 1, planned: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate CAPA suggestions from audit finding
   */
  async generateCAPAFromFinding(
    auditId: string,
    findingId: string
  ): Promise<ComplianceRecommendation[]> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Conformity-AI not initialized");
    }

    const audit = await getAudit(auditId);
    if (!audit) {
      throw new Error("Audit not found");
    }

    const finding = audit.findings.find(f => f.id === findingId);
    if (!finding) {
      throw new Error("Finding not found");
    }

    const prompt = CAPA_FROM_FINDING_PROMPT
      .replace("{norm_code}", audit.framework || "N/A")
      .replace("{clause}", finding.requirement || "N/A")
      .replace("{finding_description}", finding.description)
      .replace("{severity}", finding.severity);

    const response = await this.client.sendMessage(prompt, true);

    return this.parseCAPARecommendations(response.content);
  }

  /**
   * Stream gap analysis for real-time UI updates
   */
  async streamGapAnalysis(
    onChunk: (chunk: string) => void
  ): Promise<ComplianceGapResult> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Conformity-AI not initialized");
    }

    const norms = await getNorms(this.context.organizationId, { isActive: true });
    
    // Calculate metrics
    let totalRequirements = 0;
    let conformeCount = 0;
    let nonConformCount = 0;
    const gaps: ComplianceGap[] = [];

    for (const norm of norms || []) {
      for (const req of norm.requirements) {
        if (req.status === "pending_review") continue;
        totalRequirements++;
        
        if (req.status === "compliant") {
          conformeCount++;
        } else if (req.status === "non_compliant") {
          nonConformCount++;
          gaps.push({
            normId: norm.id,
            normCode: norm.code,
            requirementId: req.id,
            clause: req.clause,
            description: req.description,
            severity: this.determineSeverityFromReq(req),
            suggestedAction: "",
          });
        }
      }
    }

    const complianceRate = totalRequirements > 0 
      ? Math.round((conformeCount / totalRequirements) * 100) 
      : 0;

    const prompt = GAP_ANALYSIS_PROMPT
      .replace("{norms_count}", (norms?.length || 0).toString())
      .replace("{compliance_rate}", complianceRate.toString())
      .replace("{non_compliant_count}", nonConformCount.toString())
      .replace("{partial_count}", "0");

    const response = await this.client.streamMessage(prompt, onChunk, true);

    const recommendations = this.parseRecommendations(response.content);
    const auditRecommendations = this.parseAuditRecommendations(response.content, norms || []);

    return {
      overallScore: complianceRate,
      gaps,
      recommendations,
      prioritizedAudits: auditRecommendations,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private determineSeverity(req: NormRequirement): "critical" | "major" | "minor" {
    // NormRequirement doesn't have priority, use a default logic
    if (req.status === "non_compliant") return "major";
    return "minor";
  }

  private determineSeverityFromReq(req: NormRequirement): "critical" | "major" | "minor" {
    return this.determineSeverity(req);
  }

  private suggestAction(req: NormRequirement, norm: Norm): string {
    // Generate a basic action suggestion
    return `Mettre en conformité l'exigence ${req.clause} du référentiel ${norm.code}`;
  }

  private determineAuditPriority(
    norm: Norm,
    _audits: Audit[]
  ): "urgent" | "soon" | "planned" {
    // No audit ever
    if (!norm.lastAuditDate) {
      return "urgent";
    }

    const lastAuditTime = norm.lastAuditDate.toMillis();
    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
    const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;

    if (lastAuditTime < oneYearAgo) {
      return "urgent";
    }
    if (lastAuditTime < sixMonthsAgo) {
      return "soon";
    }
    return "planned";
  }

  private suggestAuditDate(priority: "urgent" | "soon" | "planned"): Date {
    const now = new Date();
    switch (priority) {
      case "urgent":
        now.setDate(now.getDate() + 30);
        break;
      case "soon":
        now.setDate(now.getDate() + 60);
        break;
      case "planned":
        now.setDate(now.getDate() + 90);
        break;
    }
    return now;
  }

  private parseRecommendations(content: string): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    // Look for recommendation patterns
    const recMatches = content.matchAll(
      /(?:Recommandation|Action|Suggestion)[:\s]+(.+?)(?=\n\n|\n(?:Recommandation|Action|Suggestion)|$)/gi
    );

    for (const match of recMatches) {
      const text = match[1].trim();
      if (text.length > 20) {
        const type = this.determineRecommendationType(text);
        const priority = this.extractPriority(text);

        recommendations.push({
          type,
          title: text.substring(0, 80),
          description: text,
          priority,
          relatedNormIds: [],
        });
      }
    }

    return recommendations.slice(0, 10);
  }

  private determineRecommendationType(
    text: string
  ): "capa" | "audit" | "documentation" | "training" {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("audit")) return "audit";
    if (lowerText.includes("formation") || lowerText.includes("sensibilisation")) return "training";
    if (lowerText.includes("document") || lowerText.includes("procédure")) return "documentation";
    return "capa";
  }

  private extractPriority(text: string): "high" | "medium" | "low" {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("urgent") || lowerText.includes("critique") || lowerText.includes("immédiat")) {
      return "high";
    }
    if (lowerText.includes("basse") || lowerText.includes("faible")) {
      return "low";
    }
    return "medium";
  }

  private parseAuditRecommendations(
    content: string,
    norms: Norm[]
  ): AuditRecommendation[] {
    const recommendations: AuditRecommendation[] = [];

    // Look for audit-specific mentions
    for (const norm of norms) {
      if (content.includes(norm.code) || content.includes(norm.name)) {
        const priorityMatch = content.match(
          new RegExp(`${norm.code}[^.]*?(urgent|prioritaire|bientôt|planifié)`, "i")
        );
        
        let priority: "urgent" | "soon" | "planned" = "planned";
        if (priorityMatch) {
          const word = priorityMatch[1].toLowerCase();
          if (word === "urgent" || word === "prioritaire") priority = "urgent";
          else if (word === "bientôt") priority = "soon";
        }

        recommendations.push({
          normId: norm.id,
          normCode: norm.code,
          reason: "Recommandé par l'analyse IA",
          priority,
          suggestedDate: this.suggestAuditDate(priority),
        });
      }
    }

    return recommendations;
  }

  private parseCAPARecommendations(content: string): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    // Extract corrective action
    const correctiveMatch = content.match(
      /action corrective[:\s]+(.+?)(?=\n\n|action préventive|$)/i
    );
    if (correctiveMatch) {
      recommendations.push({
        type: "capa",
        title: "Action corrective",
        description: correctiveMatch[1].trim(),
        priority: "high",
        relatedNormIds: [],
      });
    }

    // Extract preventive action
    const preventiveMatch = content.match(
      /action préventive[:\s]+(.+?)(?=\n\n|critères|$)/i
    );
    if (preventiveMatch) {
      recommendations.push({
        type: "capa",
        title: "Action préventive",
        description: preventiveMatch[1].trim(),
        priority: "medium",
        relatedNormIds: [],
      });
    }

    return recommendations;
  }
}

// =============================================================================
// Singleton
// =============================================================================

let conformityAIInstance: ConformityAIService | null = null;

export function getConformityAIService(): ConformityAIService {
  if (!conformityAIInstance) {
    conformityAIInstance = new ConformityAIService();
  }
  return conformityAIInstance;
}

export function resetConformityAIService(): void {
  conformityAIInstance = null;
}

/**
 * Check if Conformity-AI is enabled
 */
export function isConformityAIEnabled(): boolean {
  return isGeminiEnabled();
}

