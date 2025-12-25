/**
 * Health AI Panel Component
 * 
 * Displays AI-powered health analysis including:
 * - Trend detection
 * - Risk group identification
 * - Prevention recommendations
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  TrendingUp,
  Users,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendAnalysisCard } from "./TrendAnalysisCard";
import { RiskGroupCard } from "./RiskGroupCard";
import { PreventionRecommendations } from "./PreventionRecommendations";

interface HealthAIPanelProps {
  className?: string;
}

// Mock AI analysis data (in production, this would come from the AI service)
const mockAnalysis = {
  lastAnalyzed: new Date(),
  confidence: 0.87,
  trends: [
    {
      id: "trend-1",
      type: "tms",
      description: "Augmentation des TMS dans le département Production",
      direction: "increasing" as const,
      changePercent: 15,
      affectedDepartments: ["Production", "Logistique"],
      affectedEmployeeCount: 23,
      severity: "high" as const,
      confidence: 0.89,
      periodMonths: 6,
    },
    {
      id: "trend-2",
      type: "rps",
      description: "Stabilisation des RPS après les actions correctives",
      direction: "stable" as const,
      changePercent: 2,
      affectedDepartments: ["Commercial", "R&D"],
      affectedEmployeeCount: 18,
      severity: "medium" as const,
      confidence: 0.82,
      periodMonths: 3,
    },
    {
      id: "trend-3",
      type: "respiratory",
      description: "Diminution des affections respiratoires suite au renouvellement des EPI",
      direction: "decreasing" as const,
      changePercent: 28,
      affectedDepartments: ["Production"],
      affectedEmployeeCount: 12,
      severity: "low" as const,
      confidence: 0.91,
      periodMonths: 6,
    },
  ],
  riskGroups: [
    {
      id: "group-1",
      name: "Opérateurs production ligne A",
      description: "Exposés aux mouvements répétitifs et postures contraignantes",
      riskFactors: ["Gestes répétitifs", "Port de charges", "Postures statiques"],
      primaryRisk: "tms",
      riskLevel: "high" as const,
      employeeCount: 15,
      departmentIds: ["production"],
      suggestedActions: [
        "Rotation des postes toutes les 2 heures",
        "Formation gestes et postures",
        "Évaluation ergonomique des postes",
      ],
      priority: "immediate" as const,
    },
    {
      id: "group-2",
      name: "Équipe maintenance",
      description: "Exposés aux risques chimiques lors des interventions",
      riskFactors: ["Solvants", "Huiles", "Poussières métalliques"],
      primaryRisk: "chemical",
      riskLevel: "medium" as const,
      employeeCount: 8,
      departmentIds: ["maintenance"],
      suggestedActions: [
        "Mise à jour des fiches de données de sécurité",
        "Vérification des EPI",
        "Surveillance biologique renforcée",
      ],
      priority: "short_term" as const,
    },
  ],
  recommendations: [
    {
      id: "rec-1",
      type: "prevention" as const,
      title: "Programme de prévention TMS",
      description: "Mettre en place un programme complet de prévention des troubles musculo-squelettiques ciblant les postes à risque identifiés.",
      rationale: "L'analyse des données montre une augmentation de 15% des TMS sur 6 mois dans le département Production.",
      priority: "haute" as const,
      expectedImpact: "high" as const,
      confidence: 0.89,
      targetDepartments: ["Production", "Logistique"],
      targetEmployeeCount: 23,
      suggestedCapaTitle: "Programme prévention TMS - Production",
      status: "pending" as const,
    },
    {
      id: "rec-2",
      type: "training" as const,
      title: "Formation gestes et postures",
      description: "Organiser des sessions de formation sur les bonnes pratiques de manutention et les postures de travail.",
      rationale: "65% des employés du département Production n'ont pas suivi de formation gestes et postures depuis plus de 2 ans.",
      priority: "haute" as const,
      expectedImpact: "medium" as const,
      confidence: 0.85,
      targetDepartments: ["Production"],
      targetEmployeeCount: 35,
      status: "pending" as const,
    },
    {
      id: "rec-3",
      type: "equipment" as const,
      title: "Renouvellement EPI respiratoires",
      description: "Planifier le renouvellement des équipements de protection respiratoire pour les postes exposés aux poussières.",
      rationale: "Les EPI actuels approchent de leur date de péremption et des améliorations technologiques sont disponibles.",
      priority: "moyenne" as const,
      expectedImpact: "medium" as const,
      confidence: 0.78,
      targetDepartments: ["Production", "Maintenance"],
      targetEmployeeCount: 28,
      status: "pending" as const,
    },
    {
      id: "rec-4",
      type: "monitoring" as const,
      title: "Surveillance renforcée bruit",
      description: "Augmenter la fréquence des mesures de bruit dans les zones identifiées comme critiques.",
      rationale: "Les dernières mesures indiquent des niveaux proches des seuils réglementaires.",
      priority: "moyenne" as const,
      expectedImpact: "low" as const,
      confidence: 0.72,
      targetDepartments: ["Production"],
      status: "pending" as const,
    },
  ],
};

export function HealthAIPanel({ className }: HealthAIPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate AI analysis refresh
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 p-2">
                <Brain className="h-5 w-5 text-white" />
              </div>
              Health-AI
              <Badge variant="secondary" className="ml-2 text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                IA
              </Badge>
            </CardTitle>
            <CardDescription>
              Analyse intelligente des données de santé au travail
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Confiance: {(mockAnalysis.confidence * 100).toFixed(0)}%
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-gradient-to-br from-violet-50 to-purple-50 p-4">
            <div className="flex items-center gap-2 text-violet-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Tendances</span>
            </div>
            <p className="text-2xl font-bold text-violet-700 mt-1">
              {mockAnalysis.trends.length}
            </p>
            <p className="text-xs text-violet-500">détectées</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Groupes à risque</span>
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {mockAnalysis.riskGroups.length}
            </p>
            <p className="text-xs text-amber-500">identifiés</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-green-50 p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-medium">Recommandations</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {mockAnalysis.recommendations.length}
            </p>
            <p className="text-xs text-emerald-500">proposées</p>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Employés analysés</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-1">156</p>
            <p className="text-xs text-blue-500">sur 180</p>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Groupes à risque
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommandations
            </TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Analyse sur les {mockAnalysis.trends[0]?.periodMonths || 6} derniers mois
              </span>
              <span>
                Dernière analyse: {mockAnalysis.lastAnalyzed.toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="space-y-3">
              {mockAnalysis.trends.map((trend) => (
                <TrendAnalysisCard key={trend.id} trend={trend} />
              ))}
            </div>
          </TabsContent>

          {/* Risk Groups Tab */}
          <TabsContent value="risks" className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                {mockAnalysis.riskGroups.reduce((sum, g) => sum + g.employeeCount, 0)} employés
                dans les groupes à risque
              </span>
            </div>
            <div className="space-y-3">
              {mockAnalysis.riskGroups.map((group) => (
                <RiskGroupCard key={group.id} group={group} />
              ))}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-4">
            <PreventionRecommendations recommendations={mockAnalysis.recommendations} />
          </TabsContent>
        </Tabs>

        {/* AI Disclaimer */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-slate-400 mt-0.5" />
            <p>
              Les analyses et recommandations sont générées par l'IA Health-AI sur la base des
              données disponibles. Elles sont fournies à titre indicatif et doivent être validées
              par un professionnel de santé avant toute mise en œuvre.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HealthAIPanel;

