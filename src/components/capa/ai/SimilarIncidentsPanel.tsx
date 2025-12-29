/**
 * Similar Incidents Panel Component
 *
 * Displays AI-identified patterns and similar incidents
 * to help with root cause analysis and prevention.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Link2,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Search,
} from "lucide-react";
import type { SimilarPatternResult } from "@/hooks/useCAPAAI";
import type { AIIncidentAnalysis, SimilarIncident } from "@/types/capa";

interface SimilarIncidentsPanelProps {
  analysis?: AIIncidentAnalysis | null;
  similarIncidents?: SimilarPatternResult[];
  isLoading?: boolean;
  onViewIncident?: (incidentId: string) => void;
  onFindSimilar?: () => void;
}

// Type guard to check if incident is SimilarPatternResult
function isSimilarPatternResult(incident: SimilarIncident | SimilarPatternResult): incident is SimilarPatternResult {
  return 'incidentId' in incident;
}

// Helper to get incident ID regardless of type
function getIncidentId(incident: SimilarIncident | SimilarPatternResult): string {
  if (isSimilarPatternResult(incident)) {
    return incident.incidentId;
  }
  return incident.id;
}

// Helper to get common factors (only available on SimilarPatternResult)
function getCommonFactors(incident: SimilarIncident | SimilarPatternResult): string[] | undefined {
  if (isSimilarPatternResult(incident)) {
    return incident.commonFactors;
  }
  return undefined;
}

export function SimilarIncidentsPanel({
  analysis,
  similarIncidents,
  isLoading,
  onViewIncident,
  onFindSimilar,
}: SimilarIncidentsPanelProps) {
  const incidents: (SimilarIncident | SimilarPatternResult)[] = similarIncidents || analysis?.similarIncidents || [];
  const hasPattern = analysis?.patternIdentified;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4" />
            <p className="text-slate-600">Recherche de patterns...</p>
            <p className="text-sm text-slate-400">
              L'IA analyse les incidents similaires
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (incidents.length === 0 && !hasPattern) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-600">Aucun pattern identifié</p>
            <p className="text-sm text-slate-400">
              L'IA n'a pas trouvé d'incidents similaires
            </p>
            {onFindSimilar && (
              <Button variant="outline" className="mt-4" onClick={onFindSimilar}>
                <Sparkles className="h-4 w-4 mr-2" />
                Rechercher des patterns
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return "-";
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return "bg-red-500 text-white";
    if (similarity >= 60) return "bg-orange-500 text-white";
    return "bg-yellow-500 text-white";
  };

  return (
    <div className="space-y-4">
      {/* Pattern Alert */}
      {hasPattern && analysis?.patternDescription && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg text-amber-900">
                Pattern identifié
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800">{analysis.patternDescription}</p>
            <div className="mt-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                {incidents.length} incident(s) similaire(s) détecté(s)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Similar Incidents List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Incidents similaires</CardTitle>
            </div>
            <Badge variant="outline">{incidents.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {incidents.map((incident, index) => {
            const incidentId = getIncidentId(incident);
            const commonFactors = getCommonFactors(incident);
            
            return (
              <div
                key={incidentId || index}
                className="p-3 rounded-lg bg-slate-50 border hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">
                        {incident.reference}
                      </span>
                      <Badge className={getSimilarityColor(incident.similarity)}>
                        {incident.similarity}% similaire
                      </Badge>
                    </div>
                    {"summary" in incident && incident.summary && (
                      <p className="text-sm text-slate-600 mb-2">
                        {incident.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(incident.date)}
                    </div>
                  </div>
                  {onViewIncident && incidentId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewIncident(incidentId)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Common Factors */}
                {commonFactors && commonFactors.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Facteurs communs
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {commonFactors.map((factor: string, i: number) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs bg-white"
                        >
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Training & Equipment Recommendations from Analysis */}
      {analysis?.trainingRecommendations &&
        analysis.trainingRecommendations.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Formations recommandées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.trainingRecommendations.map((training, index) => (
                  <Badge key={index} variant="outline" className="bg-secondary">
                    {training}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {analysis?.equipmentRecommendations &&
        analysis.equipmentRecommendations.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Équipements recommandés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.equipmentRecommendations.map((equipment, index) => (
                  <Badge key={index} variant="outline" className="bg-amber-50">
                    {equipment}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Find More Button */}
      {onFindSimilar && (
        <Button variant="outline" className="w-full" onClick={onFindSimilar}>
          <Search className="h-4 w-4 mr-2" />
          Rechercher d'autres patterns
        </Button>
      )}
    </div>
  );
}

