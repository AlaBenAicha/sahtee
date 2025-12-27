/**
 * Investigation Service
 *
 * Conversational investigation assistant and report generation for incidents.
 * Provides natural language interaction for investigation workflow and
 * generates comprehensive investigation reports in multiple formats.
 */

import { GeminiClient, isGeminiEnabled } from "./geminiClient";
import { getToolsForBot } from "./tools";
import { getCAPAAIService } from "./capaAIService";
import type {
  AIContext,
  AIMessage,
  InvestigationReport,
  ReportAppendix,
  SuggestedCapa,
  EnhancedIncidentAnalysis,
} from "./types";
import type { Incident } from "@/types/capa";
import { getIncident } from "@/services/incidentService";

// =============================================================================
// Types
// =============================================================================

export interface InvestigationSession {
  id: string;
  incidentId: string;
  status: "in_progress" | "completed" | "paused";
  currentPhase: InvestigationPhase;
  messages: AIMessage[];
  collectedData: InvestigationData;
  analysis?: EnhancedIncidentAnalysis;
  report?: InvestigationReport;
  startedAt: Date;
  updatedAt: Date;
}

export type InvestigationPhase =
  | "initial_review"
  | "evidence_collection"
  | "witness_statements"
  | "root_cause_analysis"
  | "capa_generation"
  | "report_drafting"
  | "review_approval";

export interface InvestigationData {
  evidenceItems: EvidenceItem[];
  witnessStatements: WitnessStatement[];
  timelineEvents: TimelineEvent[];
  environmentalFactors: string[];
  equipmentInvolved: string[];
  proceduralReferences: string[];
  photos: string[];
  documents: string[];
}

export interface EvidenceItem {
  id: string;
  type: "physical" | "documentary" | "testimonial" | "photographic";
  description: string;
  location?: string;
  collectedAt: Date;
  collectedBy: string;
  notes?: string;
}

export interface WitnessStatement {
  id: string;
  witnessName: string;
  witnessRole: string;
  statement: string;
  recordedAt: Date;
  recordedBy: string;
  isVerified: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  description: string;
  source: string;
  isKeyEvent: boolean;
}

export interface ConversationContext {
  incidentId: string;
  incident: Incident;
  session: InvestigationSession;
  userRole: string;
}

// =============================================================================
// System Prompts
// =============================================================================

const INVESTIGATION_ASSISTANT_PROMPT = `Tu es un assistant d'investigation pour les incidents de sécurité au travail sur la plateforme SAHTEE.

## Ton rôle
Tu guides l'utilisateur à travers le processus d'investigation d'un incident de manière conversationnelle et méthodique.

## Phases d'investigation
1. **Revue initiale** : Comprendre l'incident, ses circonstances et sa gravité
2. **Collecte de preuves** : Identifier et documenter les preuves physiques et documentaires
3. **Déclarations de témoins** : Recueillir les témoignages des personnes impliquées
4. **Analyse des causes racines** : Appliquer les méthodologies appropriées (5 Pourquoi, Ishikawa, etc.)
5. **Génération de CAPA** : Proposer des actions correctives et préventives
6. **Rédaction du rapport** : Synthétiser l'investigation dans un rapport formel
7. **Revue et approbation** : Valider les conclusions et les actions

## Style de communication
- Pose des questions claires et ciblées
- Guide l'utilisateur étape par étape
- Propose des suggestions basées sur les données collectées
- Fournis des résumés réguliers de l'avancement
- Adapte ton langage au niveau technique de l'utilisateur

## Informations disponibles
Tu as accès aux données de l'incident et peux utiliser des outils pour :
- Rechercher des incidents similaires
- Effectuer des analyses de causes racines
- Générer des CAPA
- Créer des rapports

Réponds en français de manière professionnelle et empathique.`;

const REPORT_GENERATION_PROMPT = `Génère un rapport d'investigation complet pour cet incident.

**Incident :**
{incident_details}

**Données d'investigation :**
{investigation_data}

**Analyse des causes racines :**
{root_cause_analysis}

**Actions recommandées :**
{recommended_actions}

**Format du rapport : {format}**
**Langue : {language}**

Instructions spécifiques par format :
- **Détaillé** : Rapport complet avec tous les détails techniques et méthodologiques
- **Exécutif** : Synthèse pour la direction, focus sur les impacts et les actions
- **Réglementaire** : Format conforme aux exigences légales de déclaration

Génère le contenu de chaque section du rapport :
1. Résumé exécutif
2. Description de l'incident
3. Processus d'investigation
4. Analyse des causes racines
5. Actions correctives
6. Mesures préventives
7. Leçons apprises
8. Annexes (références aux preuves et documents)`;

const PHASE_PROMPTS: Record<InvestigationPhase, string> = {
  initial_review: `Nous commençons l'investigation de l'incident. 
Posez des questions pour clarifier :
- Les circonstances exactes de l'incident
- Les personnes impliquées
- Les blessures ou dommages
- Les actions immédiates prises`,

  evidence_collection: `Passons à la collecte des preuves.
Guidez l'utilisateur pour identifier :
- Les preuves physiques sur les lieux
- Les documents pertinents (procédures, formations, etc.)
- Les enregistrements (vidéo, logs, etc.)
- L'état des équipements impliqués`,

  witness_statements: `Recueillons les témoignages.
Aidez à structurer les déclarations :
- Identification du témoin
- Chronologie des événements observés
- Observations spécifiques
- Questions de clarification`,

  root_cause_analysis: `Analysons les causes racines.
Proposez la méthodologie adaptée et guidez l'analyse :
- Identification des causes immédiates
- Recherche des causes profondes
- Facteurs contributifs
- Patterns récurrents`,

  capa_generation: `Générons les actions correctives et préventives.
Proposez des CAPA basées sur :
- Les causes racines identifiées
- Les incidents similaires
- Les exigences réglementaires
- Les meilleures pratiques`,

  report_drafting: `Rédigeons le rapport d'investigation.
Structurez le rapport avec :
- Synthèse des faits
- Analyse et conclusions
- Recommandations
- Plan d'action`,

  review_approval: `Finalisons l'investigation.
Vérifiez :
- Complétude du rapport
- Validation des actions
- Approbations nécessaires
- Communication aux parties prenantes`,
};

// =============================================================================
// Investigation Service Class
// =============================================================================

export class InvestigationService {
  private client: GeminiClient;
  private context: AIContext | null = null;
  private isInitialized: boolean = false;
  private sessions: Map<string, InvestigationSession> = new Map();

  constructor() {
    this.client = new GeminiClient();
  }

  /**
   * Initialize the investigation service
   */
  initialize(context: AIContext): void {
    this.context = context;

    const tools = getToolsForBot("capa_ai");

    this.client.initialize({
      botType: "capa_ai",
      context,
      tools,
      systemPrompt: INVESTIGATION_ASSISTANT_PROMPT,
      modelType: "pro",
    });

    this.client.startChat([]);
    this.isInitialized = true;
  }

  /**
   * Start a new investigation session
   */
  async startInvestigation(incidentId: string): Promise<InvestigationSession> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Investigation service not initialized");
    }

    const incident = await getIncident(incidentId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    const session: InvestigationSession = {
      id: `inv-${Date.now()}`,
      incidentId,
      status: "in_progress",
      currentPhase: "initial_review",
      messages: [],
      collectedData: {
        evidenceItems: [],
        witnessStatements: [],
        timelineEvents: [],
        environmentalFactors: [],
        equipmentInvolved: [],
        proceduralReferences: [],
        photos: [],
        documents: [],
      },
      startedAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(session.id, session);

    // Generate initial greeting
    const greeting = await this.generatePhaseIntroduction(incident, session.currentPhase);
    session.messages.push({
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    });

    return session;
  }

  /**
   * Send a message in an investigation session
   */
  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<{
    response: string;
    session: InvestigationSession;
    suggestedActions?: string[];
  }> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Investigation service not initialized");
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const incident = await getIncident(session.incidentId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    // Add user message
    session.messages.push({
      id: `msg-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Build context prompt
    const contextPrompt = this.buildContextPrompt(incident, session, message);

    // Get AI response
    const aiResponse = await this.client.sendMessage(contextPrompt, true);

    // Parse response for structured data
    const { response, extractedData, suggestedActions, phaseComplete } =
      this.parseAssistantResponse(aiResponse.content, session);

    // Update session with extracted data
    this.updateSessionData(session, extractedData);

    // Check for phase transition
    if (phaseComplete) {
      session.currentPhase = this.getNextPhase(session.currentPhase);
    }

    // Add assistant message
    session.messages.push({
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: response,
      timestamp: new Date(),
      suggestedActions: suggestedActions?.map((a) => ({
        type: "navigate" as const,
        label: a,
      })),
    });

    session.updatedAt = new Date();

    return { response, session, suggestedActions };
  }

  /**
   * Move to a specific investigation phase
   */
  async goToPhase(
    sessionId: string,
    phase: InvestigationPhase
  ): Promise<{
    response: string;
    session: InvestigationSession;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const incident = await getIncident(session.incidentId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    session.currentPhase = phase;
    const introduction = await this.generatePhaseIntroduction(incident, phase);

    session.messages.push({
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: introduction,
      timestamp: new Date(),
    });

    session.updatedAt = new Date();

    return { response: introduction, session };
  }

  /**
   * Perform root cause analysis in the session
   */
  async performAnalysis(
    sessionId: string,
    methodology?: string
  ): Promise<{
    analysis: EnhancedIncidentAnalysis;
    summary: string;
    session: InvestigationSession;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const capaAI = getCAPAAIService();
    if (!this.context) {
      throw new Error("Not initialized");
    }
    capaAI.initialize(this.context);

    const analysis = await capaAI.performEnhancedAnalysis(
      session.incidentId,
      (methodology as "5why" | "ishikawa" | "fta" | "barrier" | "bowtie" | "tripod" | "hybrid") || undefined
    );

    session.analysis = analysis;
    session.currentPhase = "capa_generation";

    // Generate summary
    const summary = this.formatAnalysisSummary(analysis);

    session.messages.push({
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: summary,
      timestamp: new Date(),
    });

    session.updatedAt = new Date();

    return { analysis, summary, session };
  }

  /**
   * Generate investigation report
   */
  async generateReport(
    sessionId: string,
    format: "detailed" | "executive" | "regulatory" = "detailed",
    language: "fr" | "en" | "ar" = "fr"
  ): Promise<InvestigationReport> {
    if (!this.isInitialized || !this.context) {
      throw new Error("Investigation service not initialized");
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const incident = await getIncident(session.incidentId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    // Build report prompt
    const prompt = REPORT_GENERATION_PROMPT
      .replace("{incident_details}", this.formatIncidentForReport(incident))
      .replace("{investigation_data}", JSON.stringify(session.collectedData, null, 2))
      .replace("{root_cause_analysis}", session.analysis?.rootCause || "Non effectuée")
      .replace("{recommended_actions}", this.formatActionsForReport(session.analysis?.suggestedCapas || []))
      .replace("{format}", format)
      .replace("{language}", language);

    const response = await this.client.sendMessage(prompt, true);

    const report = this.parseReportResponse(
      response.content,
      incident,
      session,
      format,
      language
    );

    session.report = report;
    session.status = "completed";
    session.currentPhase = "review_approval";
    session.updatedAt = new Date();

    return report;
  }

  /**
   * Export report to different formats
   */
  async exportReport(
    sessionId: string,
    exportFormat: "pdf" | "docx" | "html"
  ): Promise<{ content: string; mimeType: string; filename: string }> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.report) {
      throw new Error("Report not found");
    }

    const incident = await getIncident(session.incidentId);
    const reference = incident?.reference || session.incidentId;

    // For now, return HTML content that can be converted
    const htmlContent = this.generateHTMLReport(session.report);

    return {
      content: htmlContent,
      mimeType:
        exportFormat === "html"
          ? "text/html"
          : exportFormat === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      filename: `rapport-investigation-${reference}.${exportFormat}`,
    };
  }

  /**
   * Get investigation session
   */
  getSession(sessionId: string): InvestigationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions for current user
   */
  getActiveSessions(): InvestigationSession[] {
    return [...this.sessions.values()].filter((s) => s.status === "in_progress");
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async generatePhaseIntroduction(
    incident: Incident,
    phase: InvestigationPhase
  ): Promise<string> {
    const phasePrompt = PHASE_PROMPTS[phase];
    const contextPrompt = `
L'incident en cours d'investigation :
- Référence : ${incident.reference}
- Type : ${incident.type}
- Gravité : ${incident.severity}
- Description : ${incident.description}
- Lieu : ${incident.location}

${phasePrompt}

Génère une introduction pour cette phase de l'investigation.`;

    const response = await this.client.sendMessage(contextPrompt, true);
    return response.content;
  }

  private buildContextPrompt(
    incident: Incident,
    session: InvestigationSession,
    userMessage: string
  ): string {
    const recentMessages = session.messages.slice(-6);
    const messageHistory = recentMessages
      .map((m) => `${m.role === "user" ? "Utilisateur" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    return `
**Contexte de l'investigation**
Incident : ${incident.reference} - ${incident.type}
Phase actuelle : ${session.currentPhase}
Données collectées : ${JSON.stringify({
      evidences: session.collectedData.evidenceItems.length,
      witnesses: session.collectedData.witnessStatements.length,
      timeline: session.collectedData.timelineEvents.length,
    })}

**Historique récent de la conversation**
${messageHistory}

**Message de l'utilisateur**
${userMessage}

Réponds de manière appropriée à la phase actuelle et au message de l'utilisateur.
Si des informations structurées sont fournies (preuves, témoignages, etc.), extrais-les.`;
  }

  private parseAssistantResponse(
    content: string,
    session: InvestigationSession
  ): {
    response: string;
    extractedData: Partial<InvestigationData>;
    suggestedActions?: string[];
    phaseComplete: boolean;
  } {
    const extractedData: Partial<InvestigationData> = {};
    let phaseComplete = false;
    const suggestedActions: string[] = [];

    // Check for phase completion indicators
    if (
      content.toLowerCase().includes("passons à la phase suivante") ||
      content.toLowerCase().includes("phase terminée") ||
      content.toLowerCase().includes("continuons avec")
    ) {
      phaseComplete = true;
    }

    // Extract evidence mentions
    const evidenceMatch = content.match(/preuve[s]?\s*:?\s*([^.]+)/gi);
    if (evidenceMatch) {
      extractedData.evidenceItems = evidenceMatch.map((e, i) => ({
        id: `evidence-${Date.now()}-${i}`,
        type: "physical" as const,
        description: e.replace(/preuve[s]?\s*:?\s*/i, "").trim(),
        collectedAt: new Date(),
        collectedBy: this.context?.userName || "Investigateur",
      }));
    }

    // Extract suggested actions
    const actionMatches = content.matchAll(/(?:je suggère|recommande|proposer)[:\s]+([^.]+)/gi);
    for (const match of actionMatches) {
      suggestedActions.push(match[1].trim());
    }

    return {
      response: content,
      extractedData,
      suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
      phaseComplete,
    };
  }

  private updateSessionData(
    session: InvestigationSession,
    extractedData: Partial<InvestigationData>
  ): void {
    if (extractedData.evidenceItems) {
      session.collectedData.evidenceItems.push(...extractedData.evidenceItems);
    }
    if (extractedData.witnessStatements) {
      session.collectedData.witnessStatements.push(...extractedData.witnessStatements);
    }
    if (extractedData.timelineEvents) {
      session.collectedData.timelineEvents.push(...extractedData.timelineEvents);
    }
    if (extractedData.environmentalFactors) {
      session.collectedData.environmentalFactors.push(...extractedData.environmentalFactors);
    }
    if (extractedData.equipmentInvolved) {
      session.collectedData.equipmentInvolved.push(...extractedData.equipmentInvolved);
    }
  }

  private getNextPhase(currentPhase: InvestigationPhase): InvestigationPhase {
    const phases: InvestigationPhase[] = [
      "initial_review",
      "evidence_collection",
      "witness_statements",
      "root_cause_analysis",
      "capa_generation",
      "report_drafting",
      "review_approval",
    ];
    const currentIndex = phases.indexOf(currentPhase);
    return phases[Math.min(currentIndex + 1, phases.length - 1)];
  }

  private formatAnalysisSummary(analysis: EnhancedIncidentAnalysis): string {
    let summary = `## Analyse des causes racines terminée\n\n`;
    summary += `**Méthodologie utilisée** : ${analysis.methodology?.name || "Standard"}\n\n`;
    summary += `**Cause racine identifiée** : ${analysis.rootCause}\n\n`;
    summary += `**Catégorie** : ${analysis.rootCauseCategory}\n\n`;
    summary += `**Confiance** : ${Math.round(analysis.confidence * 100)}%\n\n`;

    if (analysis.contributingFactors.length > 0) {
      summary += `**Facteurs contributifs** :\n`;
      for (const factor of analysis.contributingFactors.slice(0, 5)) {
        summary += `- ${factor}\n`;
      }
      summary += "\n";
    }

    if (analysis.suggestedCapas.length > 0) {
      summary += `**Actions recommandées** (${analysis.suggestedCapas.length}) :\n`;
      for (const capa of analysis.suggestedCapas.slice(0, 3)) {
        summary += `- **${capa.title}** (${capa.priority})\n`;
      }
    }

    return summary;
  }

  private formatIncidentForReport(incident: Incident): string {
    return `
Référence : ${incident.reference}
Type : ${incident.type}
Date : ${incident.date}
Gravité : ${incident.severity}
Lieu : ${incident.location}
Description : ${incident.description}
Actions immédiates : ${incident.immediateActions || "Non documentées"}
Victimes : ${incident.victimCount || 0}
`;
  }

  private formatActionsForReport(actions: SuggestedCapa[]): string {
    if (actions.length === 0) return "Aucune action générée";

    return actions
      .map(
        (a, i) =>
          `${i + 1}. ${a.title} (${a.category}, priorité: ${a.priority})\n   ${a.description}`
      )
      .join("\n\n");
  }

  private parseReportResponse(
    content: string,
    incident: Incident,
    session: InvestigationSession,
    format: "detailed" | "executive" | "regulatory",
    language: "fr" | "en" | "ar"
  ): InvestigationReport {
    // Try JSON parsing
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let sections = {
      summary: "",
      incidentDescription: "",
      investigationProcess: "",
      rootCauseAnalysis: "",
      correctiveActions: "",
      preventiveMeasures: "",
      lessonsLearned: "",
      appendices: [] as ReportAppendix[],
    };

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        sections = { ...sections, ...parsed.sections, ...parsed };
      } catch {
        // Fall through to text parsing
      }
    }

    // Text-based parsing as fallback
    if (!sections.summary) {
      sections.summary = this.extractSection(content, "résumé|summary");
      sections.incidentDescription = this.extractSection(content, "description|incident");
      sections.investigationProcess = this.extractSection(content, "investigation|processus");
      sections.rootCauseAnalysis = this.extractSection(content, "cause|racine|root cause");
      sections.correctiveActions = this.extractSection(content, "correctif|corrective");
      sections.preventiveMeasures = this.extractSection(content, "préventif|preventive");
      sections.lessonsLearned = this.extractSection(content, "leçons|lessons");
    }

    // Add appendices from collected data
    const appendices: ReportAppendix[] = [];
    for (const evidence of session.collectedData.evidenceItems) {
      appendices.push({
        title: `Preuve: ${evidence.description.substring(0, 50)}`,
        type: "document",
        content: evidence.description,
        reference: evidence.id,
      });
    }

    return {
      id: `report-${session.id}`,
      incidentId: session.incidentId,
      format,
      language,
      sections: { ...sections, appendices },
      generatedAt: new Date(),
      generatedBy: this.context?.userId || "system",
      exportFormats: ["pdf", "docx", "html"],
      aiConfidence: session.analysis?.confidence || 0.75,
    };
  }

  private extractSection(content: string, pattern: string): string {
    const regex = new RegExp(
      `(?:${pattern})[^:]*:[\\s]*([\\s\\S]*?)(?=\\n(?:#{1,3}|\\*\\*|$))`,
      "i"
    );
    const match = content.match(regex);
    return match?.[1]?.trim() || "";
  }

  private generateHTMLReport(report: InvestigationReport): string {
    const formatTitle = {
      detailed: "Rapport d'Investigation Détaillé",
      executive: "Synthèse Exécutive",
      regulatory: "Rapport Réglementaire",
    };

    return `
<!DOCTYPE html>
<html lang="${report.language}">
<head>
  <meta charset="UTF-8">
  <title>${formatTitle[report.format]}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; }
    .meta { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .section { margin-bottom: 25px; }
    .section-content { background: #fff; padding: 15px; border-left: 3px solid #3b82f6; }
    .appendix { background: #fef3c7; padding: 10px; margin: 10px 0; border-radius: 4px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${formatTitle[report.format]}</h1>
  
  <div class="meta">
    <strong>ID Rapport:</strong> ${report.id}<br>
    <strong>Incident:</strong> ${report.incidentId}<br>
    <strong>Généré le:</strong> ${report.generatedAt.toLocaleDateString(report.language)}<br>
    <strong>Confiance IA:</strong> ${Math.round(report.aiConfidence * 100)}%
  </div>
  
  <div class="section">
    <h2>Résumé</h2>
    <div class="section-content">${report.sections.summary || "À compléter"}</div>
  </div>
  
  <div class="section">
    <h2>Description de l'Incident</h2>
    <div class="section-content">${report.sections.incidentDescription || "À compléter"}</div>
  </div>
  
  <div class="section">
    <h2>Processus d'Investigation</h2>
    <div class="section-content">${report.sections.investigationProcess || "À compléter"}</div>
  </div>
  
  <div class="section">
    <h2>Analyse des Causes Racines</h2>
    <div class="section-content">${report.sections.rootCauseAnalysis || "À compléter"}</div>
  </div>
  
  <div class="section">
    <h2>Actions Correctives</h2>
    <div class="section-content">${report.sections.correctiveActions || "À compléter"}</div>
  </div>
  
  <div class="section">
    <h2>Mesures Préventives</h2>
    <div class="section-content">${report.sections.preventiveMeasures || "À compléter"}</div>
  </div>
  
  <div class="section">
    <h2>Leçons Apprises</h2>
    <div class="section-content">${report.sections.lessonsLearned || "À compléter"}</div>
  </div>
  
  ${
    report.sections.appendices.length > 0
      ? `
  <div class="section">
    <h2>Annexes</h2>
    ${report.sections.appendices
      .map(
        (a) => `
      <div class="appendix">
        <strong>${a.title}</strong><br>
        ${a.content}
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }
  
  <div class="footer">
    Rapport généré automatiquement par SAHTEE CAPA-AI<br>
    © ${new Date().getFullYear()} SAHTEE Platform
  </div>
</body>
</html>`;
  }
}

// =============================================================================
// Singleton
// =============================================================================

let investigationServiceInstance: InvestigationService | null = null;

export function getInvestigationService(): InvestigationService {
  if (!investigationServiceInstance) {
    investigationServiceInstance = new InvestigationService();
  }
  return investigationServiceInstance;
}

export function resetInvestigationService(): void {
  investigationServiceInstance = null;
}

export function isInvestigationServiceEnabled(): boolean {
  return isGeminiEnabled();
}

