/**
 * Conformity AI Panel Component
 * 
 * AI-powered compliance analysis including:
 * - Gap analysis
 * - Audit recommendations
 * - CAPA suggestions
 */

import { useState, useMemo } from "react";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  ChevronRight,
  Clock,
  FileText,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplianceMetrics, useNorms, useAudits } from "@/hooks/useCompliance";
import { cn } from "@/lib/utils";

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

export function ConformityAIPanel() {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useComplianceMetrics();
  const { data: norms, isLoading: normsLoading } = useNorms({ isActive: true });
  const { data: audits, isLoading: auditsLoading } = useAudits();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isLoading = metricsLoading || normsLoading || auditsLoading;

  // Generate AI recommendations based on data analysis
  const recommendations = useMemo((): AIRecommendation[] => {
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
      } else {
        const lastAuditTime = norm.lastAuditDate.toMillis();
        const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
        if (lastAuditTime < oneYearAgo) {
          recs.push({
            id: `old-audit-${norm.id}`,
            type: "audit",
            priority: "low",
            title: `Audit ${norm.code} à renouveler`,
            description: `Le dernier audit de ${norm.name} date de plus d'un an.`,
            action: "Prévoir un audit de suivi.",
          });
        }
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

    // 6. Requirements without evidence
    let reqsWithoutEvidence = 0;
    norms?.forEach(norm => {
      norm.requirements.forEach(req => {
        if (req.evidenceRequired && req.evidence.length === 0 && req.status !== "not_applicable") {
          reqsWithoutEvidence++;
        }
      });
    });

    if (reqsWithoutEvidence > 0) {
      recs.push({
        id: "missing-evidence",
        type: "gap",
        priority: reqsWithoutEvidence > 10 ? "high" : "medium",
        title: `${reqsWithoutEvidence} exigence(s) sans preuve`,
        description: "Des exigences nécessitent une preuve documentaire mais n'en ont pas.",
        action: "Collecter et attacher les preuves manquantes.",
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recs;
  }, [metrics, norms, audits]);

  const handleRefresh = async () => {
    setIsAnalyzing(true);
    await refetchMetrics();
    // Simulate AI analysis time
    setTimeout(() => setIsAnalyzing(false), 1000);
  };

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
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle>Conformity-AI</CardTitle>
                <CardDescription>
                  Assistant IA pour l'analyse de conformité
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
              {isAnalyzing ? "Analyse..." : "Actualiser"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{metrics?.overallComplianceRate || 0}%</p>
                <p className="text-xs text-muted-foreground">Taux de conformité</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{metrics?.nonCompliantCount || 0}</p>
                <p className="text-xs text-muted-foreground">Non-conformités</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{recommendations.length}</p>
                <p className="text-xs text-muted-foreground">Recommandations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommandations IA
          </CardTitle>
          <CardDescription>
            Suggestions basées sur l'analyse de vos données de conformité
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
              <p className="font-medium">Excellent !</p>
              <p className="text-sm">
                Aucune recommandation critique pour le moment. Votre conformité est bien gérée.
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled>
              <FileText className="h-5 w-5" />
              <span>Générer un rapport</span>
              <span className="text-xs text-muted-foreground">Prochainement</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled>
              <Calendar className="h-5 w-5" />
              <span>Planifier des audits</span>
              <span className="text-xs text-muted-foreground">Prochainement</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled>
              <Target className="h-5 w-5" />
              <span>Créer des CAPA</span>
              <span className="text-xs text-muted-foreground">Prochainement</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

