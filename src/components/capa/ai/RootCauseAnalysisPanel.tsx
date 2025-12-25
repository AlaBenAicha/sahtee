/**
 * Root Cause Analysis Panel Component
 *
 * Displays AI-generated root cause analysis with contributing factors,
 * immediate actions, and preventive measures.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Shield,
  RefreshCw,
  GitBranch,
} from "lucide-react";
import type { RootCauseAnalysis } from "@/hooks/useCAPAAI";

interface RootCauseAnalysisPanelProps {
  analysis: RootCauseAnalysis | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onApplyRecommendation?: (action: string) => void;
}

const methodologyLabels: Record<string, string> = {
  "5why": "5 Pourquoi",
  fishbone: "Ishikawa (Fishbone)",
  barrier: "Analyse des barrières",
  fta: "Arbre des défaillances",
  auto: "Automatique",
};

const categoryLabels: Record<string, { label: string; color: string }> = {
  organizational: { label: "Organisationnel", color: "bg-blue-100 text-blue-800" },
  process: { label: "Processus", color: "bg-purple-100 text-purple-800" },
  human: { label: "Facteur humain", color: "bg-orange-100 text-orange-800" },
  equipment: { label: "Équipement", color: "bg-amber-100 text-amber-800" },
  environmental: { label: "Environnement", color: "bg-green-100 text-green-800" },
};

export function RootCauseAnalysisPanel({
  analysis,
  isLoading,
  onRefresh,
  onApplyRecommendation,
}: RootCauseAnalysisPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4" />
            <p className="text-slate-600">Analyse en cours...</p>
            <p className="text-sm text-slate-400">
              L'IA analyse l'incident pour identifier les causes racines
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <GitBranch className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-600">Aucune analyse disponible</p>
            <p className="text-sm text-slate-400">
              Sélectionnez un incident pour générer une analyse
            </p>
            {onRefresh && (
              <Button variant="outline" className="mt-4" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Lancer l'analyse
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const category = categoryLabels[analysis.rootCauseCategory] || {
    label: analysis.rootCauseCategory,
    color: "bg-slate-100 text-slate-800",
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Analyse des causes racines</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              {methodologyLabels[analysis.methodology] || analysis.methodology}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confidence */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Confiance:</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${analysis.confidence}%` }}
              />
            </div>
            <span className="text-sm font-medium text-purple-700">
              {analysis.confidence}%
            </span>
          </div>

          {/* Root Cause */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-slate-900">Cause racine</span>
              <Badge className={category.color}>{category.label}</Badge>
            </div>
            <p className="text-slate-700">{analysis.rootCause}</p>
          </div>

          {/* Contributing Factors */}
          {analysis.contributingFactors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">
                Facteurs contributifs
              </h4>
              <ul className="space-y-1">
                {analysis.contributingFactors.map((factor, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Immediate Actions */}
      {analysis.immediateActions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">Actions immédiates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.immediateActions.map((action, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100"
                >
                  <span className="text-sm text-emerald-800">{action}</span>
                  {onApplyRecommendation && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-emerald-600 hover:text-emerald-700"
                      onClick={() => onApplyRecommendation(action)}
                    >
                      Appliquer
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Preventive Measures */}
      {analysis.preventiveMeasures.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Mesures préventives</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.preventiveMeasures.map((measure, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100"
                >
                  <span className="text-sm text-blue-800">{measure}</span>
                  {onApplyRecommendation && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-blue-600 hover:text-blue-700"
                      onClick={() => onApplyRecommendation(measure)}
                    >
                      Créer CAPA
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <Button variant="outline" className="w-full" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Relancer l'analyse
        </Button>
      )}
    </div>
  );
}

