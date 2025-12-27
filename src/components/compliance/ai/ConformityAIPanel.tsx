/**
 * Conformity AI Panel Component
 * 
 * AI-powered compliance analysis including:
 * - Gap analysis
 * - Audit recommendations
 * - CAPA suggestions
 */

import { useState, useMemo, useCallback } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  ChevronRight,
  FileText,
  Target,
  Sparkles,
  AlertCircle,
  History,
} from "lucide-react";
import { AIAnalysisHistory } from "./AIAnalysisHistory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useComplianceMetrics, useNorms, useAudits } from "@/hooks/useCompliance";
import { 
  useConformityAI, 
  useGapAnalysis, 
  useAuditPlanning, 
  usePerformGapAnalysis 
} from "@/hooks/useConformityAI";
import { cn } from "@/lib/utils";
import type { ComplianceGap, AuditRecommendation, ComplianceRecommendation } from "@/services/ai/types";

interface AIRecommendation {
  id: string;
  type: "gap" | "audit" | "capa";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

const FRAMEWORK_LABELS: Record<string, string> = {
  iso_45001: "ISO 45001",
  iso_14001: "ISO 14001",
  iso_9001: "ISO 9001",
  tunisian_labor: "Code du Travail",
  cnam: "CNAM",
  ancsep: "ANCSEP",
  custom: "Personnalisé",
};

interface ConformityAIPanelProps {
  onPlanAudit?: () => void;
  onCreateCapa?: () => void;
}

export function ConformityAIPanel({ onPlanAudit, onCreateCapa }: ConformityAIPanelProps) {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useComplianceMetrics();
  const { data: norms, isLoading: normsLoading } = useNorms({ isActive: true });
  const { data: audits, isLoading: auditsLoading } = useAudits();
  
  // AI hooks
  const { isEnabled: isAIEnabled, isInitialized } = useConformityAI();
  const { 
    data: gapAnalysis, 
    isLoading: gapLoading, 
    streamedContent,
    isStreaming,
    refetch: refetchGaps 
  } = useGapAnalysis();
  const { data: auditRecommendations, isLoading: auditRecLoading } = useAuditPlanning();
  const performGapAnalysis = usePerformGapAnalysis();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const isLoading = metricsLoading || normsLoading || auditsLoading;

  // Generate fallback recommendations based on data analysis (when AI is disabled)
  const fallbackRecommendations = useMemo((): AIRecommendation[] => {
    if (!metrics || !norms || !audits) return [];

    const recs: AIRecommendation[] = [];

    // 1. Low compliance rate alert
    if (metrics.overallComplianceRate < 70) {
      recs.push({
        id: "low-compliance",
        type: "gap",
        priority: "high",
        title: "Taux de conformité insuffisant",
        description: `Le taux de conformité global est de ${metrics.overallComplianceRate}%, ce qui est en dessous du seuil recommandé de 70%.`,
        action: "Prioriser les exigences non conformes et planifier des actions correctives.",
      });
    }

    // 2. Framework-specific gaps
    if (metrics.frameworkCompliance) {
      Object.entries(metrics.frameworkCompliance).forEach(([framework, rate]) => {
        if (rate < 50 && rate > 0) {
          recs.push({
            id: `gap-${framework}`,
            type: "gap",
            priority: "high",
            title: `Conformité ${FRAMEWORK_LABELS[framework] || framework} critique`,
            description: `Le référentiel ${FRAMEWORK_LABELS[framework] || framework} affiche un taux de conformité de seulement ${rate}%.`,
            action: "Effectuer une revue détaillée des exigences de ce référentiel.",
          });
        }
      });
    }

    // 3. No recent audits
    const now = Date.now();
    const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);
    const recentAudits = audits?.filter(
      a => a.status === "completed" && a.actualEndDate && a.actualEndDate.toMillis() > sixMonthsAgo
    ) || [];

    if (recentAudits.length === 0 && (audits?.length || 0) > 0) {
      recs.push({
        id: "no-recent-audits",
        type: "audit",
        priority: "medium",
        title: "Aucun audit récent",
        description: "Aucun audit n'a été réalisé au cours des 6 derniers mois.",
        action: "Planifier un audit interne pour maintenir la conformité.",
      });
    }

    // 4. Norms without recent audit
    norms?.forEach(norm => {
      if (!norm.lastAuditDate) {
        recs.push({
          id: `no-audit-${norm.id}`,
          type: "audit",
          priority: "medium",
          title: `${norm.code} jamais audité`,
          description: `Le référentiel ${norm.name} n'a jamais fait l'objet d'un audit.`,
          action: "Planifier un premier audit pour cette norme.",
        });
      }
    });

    // 5. Open findings requiring attention
    if (metrics.openFindings > 0) {
      recs.push({
        id: "open-findings",
        type: "capa",
        priority: metrics.overdueFindings > 0 ? "high" : "medium",
        title: `${metrics.openFindings} écart(s) ouvert(s)`,
        description: metrics.overdueFindings > 0 
          ? `Dont ${metrics.overdueFindings} en retard de traitement.`
          : "Des actions correctives sont en attente de traitement.",
        action: "Traiter les écarts en retard en priorité.",
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recs;
  }, [metrics, norms, audits]);

  // Combine AI recommendations with fallback
  const recommendations = useMemo(() => {
    if (isAIEnabled && gapAnalysis?.recommendations) {
      return gapAnalysis.recommendations.map((r, i) => ({
        id: `ai-${i}`,
        type: r.type === "audit" ? "audit" : r.type === "training" || r.type === "documentation" ? "capa" : "gap",
        priority: r.priority,
        title: r.title,
        description: r.description,
      })) as AIRecommendation[];
    }
    return fallbackRecommendations;
  }, [isAIEnabled, gapAnalysis, fallbackRecommendations]);

  const handleRefresh = async () => {
    setIsAnalyzing(true);
    try {
      if (isAIEnabled && isInitialized) {
        await performGapAnalysis.mutateAsync();
      } else {
        await refetchMetrics();
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const reportDate = new Date().toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Title
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text("RAPPORT DE CONFORMITÉ", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      // Subtitle with date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Généré le ${reportDate}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Executive Summary Section
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("Résumé Exécutif", 14, yPosition);
      yPosition += 10;

      // KPI Cards as table
      autoTable(doc, {
        startY: yPosition,
        head: [["Indicateur", "Valeur"]],
        body: [
          ["Taux de conformité global", `${metrics?.overallComplianceRate ?? 0}%`],
          ["Exigences conformes", `${metrics?.compliantCount ?? 0}`],
          ["Exigences non conformes", `${metrics?.nonCompliantCount ?? 0}`],
          ["Écarts ouverts", `${metrics?.openFindings ?? 0}`],
        ],
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        margin: { left: 14 },
        tableWidth: "auto",
      });

      yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

      // Referentiels Section
      if (norms && norms.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text("Référentiels", 14, yPosition);
        yPosition += 10;

        autoTable(doc, {
          startY: yPosition,
          head: [["Code", "Nom", "Score"]],
          body: norms.map(norm => [norm.code, norm.name, `${norm.complianceScore}%`]),
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          margin: { left: 14 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 100 },
            2: { cellWidth: 30 },
          },
        });

        yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Recommendations Section
      if (recommendations.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text("Recommandations", 14, yPosition);
        yPosition += 10;

        const priorityLabels: Record<string, string> = {
          high: "Haute",
          medium: "Moyenne",
          low: "Basse",
        };

        autoTable(doc, {
          startY: yPosition,
          head: [["Priorité", "Titre", "Description"]],
          body: recommendations.map(rec => [
            priorityLabels[rec.priority] || rec.priority,
            rec.title,
            rec.description.substring(0, 100) + (rec.description.length > 100 ? "..." : ""),
          ]),
          theme: "striped",
          headStyles: { fillColor: [168, 85, 247], textColor: 255 },
          margin: { left: 14 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 50 },
            2: { cellWidth: 100 },
          },
        });

        yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Recent Audits Section
      if (audits && audits.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text("Audits Récents", 14, yPosition);
        yPosition += 10;

        const statusLabels: Record<string, string> = {
          planned: "Planifié",
          in_progress: "En cours",
          completed: "Terminé",
          cancelled: "Annulé",
        };

        autoTable(doc, {
          startY: yPosition,
          head: [["Référence", "Titre", "Statut"]],
          body: audits.slice(0, 5).map(audit => [
            audit.reference,
            audit.title,
            statusLabels[audit.status] || audit.status,
          ]),
          theme: "striped",
          headStyles: { fillColor: [251, 146, 60], textColor: 255 },
          margin: { left: 14 },
          columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 90 },
            2: { cellWidth: 35 },
          },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Rapport généré par SAHTEE Conformity-AI - Page ${i}/${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      doc.save(`rapport-conformite-${new Date().toISOString().split("T")[0]}.pdf`);

      toast.success("Rapport PDF généré", {
        description: "Le rapport de conformité a été téléchargé.",
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Erreur", {
        description: "Impossible de générer le rapport PDF.",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  }, [metrics, norms, recommendations, audits]);

  const priorityConfig = {
    high: { label: "Haute", color: "bg-red-100 text-red-800" },
    medium: { label: "Moyenne", color: "bg-amber-100 text-amber-800" },
    low: { label: "Basse", color: "bg-blue-100 text-blue-800" },
  };

  const typeConfig = {
    gap: { label: "Écart", icon: <AlertTriangle className="h-4 w-4" /> },
    audit: { label: "Audit", icon: <Calendar className="h-4 w-4" /> },
    capa: { label: "CAPA", icon: <Target className="h-4 w-4" /> },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base">Conformity-AI</span>
                  {isAIEnabled && (
                    <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                      <Sparkles className="h-3 w-3 mr-1" />
                      IA Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAIEnabled 
                    ? "Analyse intelligente de votre conformité" 
                    : "Assistant d'analyse de conformité"}
                </p>
              </div>
            </div>

            {/* Stats - Always Horizontal */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-lg font-bold leading-none">
                    {gapAnalysis?.overallScore ?? metrics?.overallComplianceRate ?? 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Taux de conformité</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-lg font-bold leading-none">
                    {gapAnalysis?.gaps?.length ?? metrics?.nonCompliantCount ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Écarts identifiés</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-lg font-bold leading-none">{recommendations.length}</p>
                  <p className="text-xs text-muted-foreground">Recommandations</p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isAnalyzing || isStreaming}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", (isAnalyzing || isStreaming) && "animate-spin")} />
              {isAnalyzing || isStreaming ? "Analyse..." : "Analyser"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Status Alert */}
      {!isAIEnabled && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            L'IA Gemini n'est pas configurée. Les recommandations sont basées sur des règles prédéfinies.
            Configurez VITE_GEMINI_API_KEY pour activer l'analyse IA avancée.
          </AlertDescription>
        </Alert>
      )}

      {/* Streaming Content */}
      {isStreaming && streamedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 animate-pulse text-purple-500" />
              Analyse en cours...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="prose prose-sm dark:prose-invert">
                <p className="whitespace-pre-wrap">{streamedContent}</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full">
          <TabsTrigger value="overview" className="flex-1">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="gaps" className="flex-1">Écarts</TabsTrigger>
          <TabsTrigger value="audits" className="flex-1">Audits</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 gap-1">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recommandations {isAIEnabled ? "IA" : ""}
              </CardTitle>
              <CardDescription>
                {isAIEnabled 
                  ? "Suggestions intelligentes basées sur l'analyse de vos données"
                  : "Suggestions basées sur l'analyse de vos données de conformité"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                  <p className="font-medium">Excellent !</p>
                  <p className="text-sm">
                    Aucune recommandation critique pour le moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        rec.priority === "high" 
                          ? "bg-red-100 text-red-600" 
                          : rec.priority === "medium"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-blue-100 text-blue-600"
                      )}>
                        {typeConfig[rec.type].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{rec.title}</p>
                          <Badge className={cn("text-xs", priorityConfig[rec.priority].color)}>
                            {priorityConfig[rec.priority].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        {rec.action && (
                          <p className="text-sm text-primary mt-2 flex items-center gap-1">
                            <ChevronRight className="h-3 w-3" />
                            {rec.action}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gaps Tab */}
        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Écarts de conformité</CardTitle>
              <CardDescription>
                Exigences non conformes identifiées
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!gapAnalysis?.gaps || gapAnalysis.gaps.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                  <p>Aucun écart critique identifié</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {gapAnalysis.gaps.map((gap, index) => (
                      <div
                        key={`${gap.normId}-${gap.requirementId}-${index}`}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{gap.normCode}</Badge>
                          <Badge 
                            className={cn(
                              "text-xs",
                              gap.severity === "critical" && "bg-red-100 text-red-800",
                              gap.severity === "major" && "bg-amber-100 text-amber-800",
                              gap.severity === "minor" && "bg-blue-100 text-blue-800"
                            )}
                          >
                            {gap.severity === "critical" ? "Critique" : 
                             gap.severity === "major" ? "Majeur" : "Mineur"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Clause {gap.clause}
                          </span>
                        </div>
                        <p className="text-sm">{gap.description}</p>
                        {gap.suggestedAction && (
                          <p className="text-sm text-primary mt-2 flex items-center gap-1">
                            <ChevronRight className="h-3 w-3" />
                            {gap.suggestedAction}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommandations d'audit</CardTitle>
              <CardDescription>
                Audits à planifier selon l'analyse
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!gapAnalysis?.prioritizedAudits && !auditRecommendations) || 
               ((gapAnalysis?.prioritizedAudits?.length || 0) === 0 && 
                (auditRecommendations?.length || 0) === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                  <p>Aucun audit recommandé pour le moment</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {(gapAnalysis?.prioritizedAudits || auditRecommendations || []).map((audit, index) => (
                      <div
                        key={`${audit.normId}-${index}`}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{audit.normCode}</Badge>
                          <Badge 
                            className={cn(
                              "text-xs",
                              audit.priority === "urgent" && "bg-red-100 text-red-800",
                              audit.priority === "soon" && "bg-amber-100 text-amber-800",
                              audit.priority === "planned" && "bg-blue-100 text-blue-800"
                            )}
                          >
                            {audit.priority === "urgent" ? "Urgent" : 
                             audit.priority === "soon" ? "Prochainement" : "Planifié"}
                          </Badge>
                        </div>
                        <p className="text-sm">{audit.reason}</p>
                        {audit.suggestedDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Date suggérée : {new Date(audit.suggestedDate).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <AIAnalysisHistory />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Actions rapides:</span>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2" 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport || isLoading}
            >
              <FileText className={cn("h-4 w-4", isGeneratingReport && "animate-pulse")} />
              {isGeneratingReport ? "Génération..." : "Générer un rapport"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={onPlanAudit}
              disabled={!onPlanAudit}
            >
              <Calendar className="h-4 w-4" />
              Planifier des audits
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={onCreateCapa}
              disabled={!onCreateCapa}
            >
              <Target className="h-4 w-4" />
              Créer des CAPA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
