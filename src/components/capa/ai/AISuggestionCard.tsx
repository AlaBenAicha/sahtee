/**
 * AI Suggestion Card Component
 *
 * Displays an individual AI-generated CAPA recommendation
 * with confidence score, reasoning, and accept/reject actions.
 */

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Check,
  X,
  Edit2,
  Calendar,
  Link2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CAPARecommendation } from "@/hooks/useCAPAAI";

interface AISuggestionCardProps {
  suggestion: CAPARecommendation;
  onAccept: (suggestion: CAPARecommendation) => void;
  onReject: (suggestion: CAPARecommendation) => void;
  onModify: (suggestion: CAPARecommendation) => void;
  isProcessing?: boolean;
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  critique: { label: "Critique", color: "bg-red-500 text-white" },
  haute: { label: "Haute", color: "bg-orange-500 text-white" },
  moyenne: { label: "Moyenne", color: "bg-yellow-500 text-white" },
  basse: { label: "Basse", color: "bg-green-500 text-white" },
};

const categoryConfig: Record<string, { label: string; color: string }> = {
  correctif: { label: "Correctif", color: "bg-blue-100 text-blue-800" },
  preventif: { label: "Préventif", color: "bg-purple-100 text-purple-800" },
};

export function AISuggestionCard({
  suggestion,
  onAccept,
  onReject,
  onModify,
  isProcessing,
}: AISuggestionCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const priority = priorityConfig[suggestion.priority] || priorityConfig.moyenne;
  const category = categoryConfig[suggestion.category] || categoryConfig.correctif;

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 line-clamp-1">
                {suggestion.title}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={priority.color}>{priority.label}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Confidence Score */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${suggestion.confidence}%` }}
            />
          </div>
          <span className="text-sm font-medium text-purple-700">
            {suggestion.confidence}%
          </span>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2">
          {suggestion.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={category.color}>
            {category.label}
          </Badge>
          {suggestion.suggestedDueDate && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(suggestion.suggestedDueDate)}
            </Badge>
          )}
        </div>

        {/* Expandable Details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-center gap-1">
              {isOpen ? (
                <>
                  Masquer les détails
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Voir les détails
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3 border-t">
            {/* Reasoning */}
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs font-medium text-purple-700 mb-1">
                Raisonnement IA
              </p>
              <p className="text-sm text-purple-900">{suggestion.reasoning}</p>
            </div>

            {/* Linked Items */}
            {(suggestion.linkedIncidentIds?.length ||
              suggestion.linkedTrainings?.length ||
              suggestion.linkedEquipment?.length) && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Éléments liés
                </p>
                <div className="flex flex-wrap gap-1">
                  {suggestion.linkedIncidentIds?.map((id) => (
                    <Badge key={id} variant="outline" className="text-xs">
                      Incident: {id}
                    </Badge>
                  ))}
                  {suggestion.linkedTrainings?.map((id) => (
                    <Badge key={id} variant="outline" className="text-xs">
                      Formation: {id}
                    </Badge>
                  ))}
                  {suggestion.linkedEquipment?.map((id) => (
                    <Badge key={id} variant="outline" className="text-xs">
                      Équipement: {id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            onClick={() => onAccept(suggestion)}
            disabled={isProcessing}
          >
            <Check className="h-4 w-4 mr-1" />
            Accepter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onModify(suggestion)}
            disabled={isProcessing}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onReject(suggestion)}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

