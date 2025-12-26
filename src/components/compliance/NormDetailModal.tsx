/**
 * Norm Detail Modal Component
 * 
 * Displays detailed information about a regulatory norm including:
 * - Norm information
 * - Requirements list with compliance status
 * - Evidence attachments
 * - CAPA links
 */

import { useState } from "react";
import {
  X,
  FileText,
  Check,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Paperclip,
  Link2,
  Plus,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RequirementEditor } from "./RequirementEditor";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { NormWithRequirements, NormRequirement, NormStatus, ComplianceStatus } from "@/types/conformity";
import { cn } from "@/lib/utils";

interface NormDetailModalProps {
  norm: NormWithRequirements | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanAudit?: (norm: NormWithRequirements) => void;
  onRequirementUpdate?: (normId: string, requirementId: string, data: Partial<NormRequirement>) => void;
}

const STATUS_CONFIG: Record<NormStatus, { label: string; color: string }> = {
  compliant: {
    label: "Conforme",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  in_progress: {
    label: "En cours d'évaluation",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  non_compliant: {
    label: "Non conforme",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  not_started: {
    label: "Non évalué",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
};

const COMPLIANCE_STATUS_CONFIG: Record<ComplianceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  compliant: {
    label: "Conforme",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    icon: <Check className="h-4 w-4" />,
  },
  non_compliant: {
    label: "Non conforme",
    color: "text-red-600 bg-red-50 dark:bg-red-950/30",
    icon: <X className="h-4 w-4" />,
  },
  partially_compliant: {
    label: "Partiellement conforme",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  not_applicable: {
    label: "Non applicable",
    color: "text-gray-600 bg-gray-50 dark:bg-gray-950/30",
    icon: <Clock className="h-4 w-4" />,
  },
  pending_review: {
    label: "En attente d'évaluation",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    icon: <Clock className="h-4 w-4" />,
  },
};

export function NormDetailModal({
  norm,
  open,
  onOpenChange,
  onPlanAudit,
  onRequirementUpdate,
}: NormDetailModalProps) {
  const { canUpdate } = useFeaturePermissions("compliance");
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set());
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);

  if (!norm) return null;

  const statusConfig = STATUS_CONFIG[norm.status];

  const toggleRequirement = (id: string) => {
    setExpandedRequirements((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRequirementEdit = (requirementId: string) => {
    setEditingRequirement(requirementId);
  };

  const handleRequirementSave = (requirementId: string, data: Partial<NormRequirement>) => {
    onRequirementUpdate?.(norm.id, requirementId, data);
    setEditingRequirement(null);
  };

  // Group requirements by category (clause prefix)
  const groupedRequirements = norm.requirements.reduce((acc, req) => {
    const clausePrefix = req.clause.split(".")[0];
    if (!acc[clausePrefix]) {
      acc[clausePrefix] = [];
    }
    acc[clausePrefix].push(req);
    return acc;
  }, {} as Record<string, NormRequirement[]>);

  const clauseLabels: Record<string, string> = {
    "4": "Contexte de l'organisme",
    "5": "Leadership",
    "6": "Planification",
    "7": "Support",
    "8": "Réalisation des activités opérationnelles",
    "9": "Évaluation des performances",
    "10": "Amélioration",
    "Art": "Articles réglementaires",
    "CNAM": "Exigences CNAM",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {norm.code}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {norm.name}
              </p>
            </div>
            <Badge className={cn("ml-4", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>

          {/* Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progression de la conformité</span>
              <span className="font-medium">
                {norm.complianceScore}% 
                <span className="text-muted-foreground ml-1">
                  ({norm.requirements.filter(r => r.status === "compliant").length}/{norm.requirements.length} exigences)
                </span>
              </span>
            </div>
            <Progress value={norm.complianceScore} className="h-3" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {onPlanAudit && canUpdate && (
              <Button variant="outline" size="sm" onClick={() => onPlanAudit(norm)}>
                <Calendar className="h-4 w-4 mr-2" />
                Planifier un audit
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-250px)]">
          <div className="p-6 space-y-6">
            {/* Description */}
            {norm.description && (
              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {norm.description}
                </p>
                <Separator />
              </div>
            )}

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="font-medium">Exigences ({norm.requirements.length})</h3>

              {Object.entries(groupedRequirements).map(([clausePrefix, requirements]) => (
                <div key={clausePrefix} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Clause {clausePrefix} - {clauseLabels[clausePrefix] || "Autres"}
                  </h4>
                  
                  <div className="space-y-2">
                    {requirements.map((requirement) => {
                      const isExpanded = expandedRequirements.has(requirement.id);
                      const isEditing = editingRequirement === requirement.id;
                      const complianceConfig = COMPLIANCE_STATUS_CONFIG[requirement.status];

                      return (
                        <Collapsible
                          key={requirement.id}
                          open={isExpanded}
                          onOpenChange={() => toggleRequirement(requirement.id)}
                        >
                          <div className="border rounded-lg">
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">
                                      {requirement.clause} - {requirement.title}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {requirement.evidence.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Paperclip className="h-3 w-3 mr-1" />
                                      {requirement.evidence.length}
                                    </Badge>
                                  )}
                                  {requirement.linkedCapaIds.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Link2 className="h-3 w-3 mr-1" />
                                      {requirement.linkedCapaIds.length}
                                    </Badge>
                                  )}
                                  <Badge className={cn("text-xs gap-1", complianceConfig.color)}>
                                    {complianceConfig.icon}
                                    {complianceConfig.label}
                                  </Badge>
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="px-3 pb-3 space-y-3 border-t pt-3">
                                <p className="text-sm text-muted-foreground">
                                  {requirement.description}
                                </p>

                                {isEditing ? (
                                  <RequirementEditor
                                    requirement={requirement}
                                    onSave={(data) => handleRequirementSave(requirement.id, data)}
                                    onCancel={() => setEditingRequirement(null)}
                                  />
                                ) : (
                                  <div className="space-y-3">
                                    {/* Evidence */}
                                    {requirement.evidence.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium mb-1">Preuves documentaires</p>
                                        <div className="flex flex-wrap gap-2">
                                          {requirement.evidence.map((ev) => (
                                            <a
                                              key={ev.id}
                                              href={ev.file.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                            >
                                              <Paperclip className="h-3 w-3" />
                                              {ev.title}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Notes */}
                                    {requirement.notes && (
                                      <div>
                                        <p className="text-xs font-medium mb-1">Notes</p>
                                        <p className="text-xs text-muted-foreground">{requirement.notes}</p>
                                      </div>
                                    )}

                                    {/* Actions */}
                                    {canUpdate && (
                                      <div className="flex justify-end">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRequirementEdit(requirement.id);
                                          }}
                                        >
                                          Modifier
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

