/**
 * Incident Detail Modal Component
 * 
 * Displays comprehensive incident details including:
 * - Header with status and severity badges
 * - Description and immediate actions
 * - Location and timing
 * - Affected persons and witnesses
 * - Evidence (photos/documents)
 * - AI analysis results
 * - Investigation status
 * - Linked CAPA actions
 */

import { useMemo } from "react";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  User,
  Users,
  FileImage,
  FileText,
  Link as LinkIcon,
  Sparkles,
  Shield,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { IncidentStatusBadge, IncidentSeverityBadge } from "./IncidentStatusBadge";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import { useDeleteIncident, useCloseIncident } from "@/hooks/useIncidents";
import { toast } from "sonner";
import type { Incident } from "@/types/capa";

interface IncidentDetailModalProps {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  accident: { label: "Accident", color: "text-red-600 bg-red-50" },
  near_miss: { label: "Presqu'accident", color: "text-orange-600 bg-orange-50" },
  unsafe_condition: { label: "Condition dangereuse", color: "text-yellow-600 bg-yellow-50" },
  unsafe_act: { label: "Acte dangereux", color: "text-amber-600 bg-amber-50" },
};

export function IncidentDetailModal({
  incident,
  isOpen,
  onClose,
  onEdit,
}: IncidentDetailModalProps) {
  const { canUpdate, canDelete } = useFeaturePermissions("incidents");
  const { mutate: deleteIncident, isPending: isDeleting } = useDeleteIncident();
  const { mutate: closeIncident, isPending: isClosing } = useCloseIncident();

  const reportedDate = useMemo(() => {
    const date = incident.reportedAt.toDate();
    return {
      date: date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, [incident.reportedAt]);

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet incident ? Cette action est irréversible.")) {
      deleteIncident(incident.id, {
        onSuccess: () => {
          toast.success("Incident supprimé");
          onClose();
        },
        onError: (error) => {
          toast.error("Erreur lors de la suppression", { description: error.message });
        },
      });
    }
  };

  const handleClose = () => {
    if (confirm("Êtes-vous sûr de vouloir clôturer cet incident ?")) {
      closeIncident(incident.id, {
        onSuccess: () => {
          toast.success("Incident clôturé");
        },
        onError: (error) => {
          toast.error("Erreur lors de la clôture", { description: error.message });
        },
      });
    }
  };

  const typeConfig = typeLabels[incident.type] || { label: incident.type, color: "" };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent size="xl" className="p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6 space-y-6">
              {/* Header */}
              <DialogHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        {incident.reference}
                      </span>
                      {incident.aiAnalysis && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="gap-1">
                              <Sparkles className="h-3 w-3 text-violet-500" />
                              Analysé par IA
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Confiance: {incident.aiAnalysis.confidence}%
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <DialogTitle className="text-xl">
                      <Badge className={cn("mr-2", typeConfig.color)}>
                        {typeConfig.label}
                      </Badge>
                    </DialogTitle>
                  </div>

                  <div className="flex items-center gap-2">
                    <IncidentSeverityBadge severity={incident.severity} />
                    <IncidentStatusBadge status={incident.status} />
                  </div>
                </div>
              </DialogHeader>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{reportedDate.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{reportedDate.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{incident.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{incident.isAnonymous ? "Anonyme" : incident.reporterName}</span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Description
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {incident.description}
                </p>
              </div>

              {/* Immediate Actions */}
              {incident.immediateActions && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Actions immédiates prises
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {incident.immediateActions}
                  </p>
                </div>
              )}

              {/* Affected Persons */}
              {incident.affectedPersons.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-red-500" />
                      Personnes affectées ({incident.affectedPersons.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {incident.affectedPersons.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                      >
                        <div>
                          <span className="font-medium">{person.name}</span>
                          {person.role && (
                            <span className="text-muted-foreground ml-2">({person.role})</span>
                          )}
                        </div>
                        <Badge variant="outline">{person.injuryType || "Non spécifié"}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Witnesses */}
              {incident.witnesses.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      Témoins ({incident.witnesses.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {incident.witnesses.map((witness) => (
                      <div
                        key={witness.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                      >
                        <span className="font-medium">{witness.name}</span>
                        {witness.contacted ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Contacté
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <XCircle className="h-3 w-3 mr-1" />
                            Non contacté
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Evidence */}
              {(incident.photos.length > 0 || incident.documents.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {incident.photos.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileImage className="h-4 w-4" />
                          Photos ({incident.photos.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          {incident.photos.slice(0, 6).map((photo) => (
                            <div
                              key={photo.id}
                              className="aspect-square bg-muted rounded-lg flex items-center justify-center"
                            >
                              <FileImage className="h-6 w-6 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {incident.documents.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Documents ({incident.documents.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {incident.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate flex-1">{doc.name}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* AI Analysis */}
              {incident.aiAnalysis && (
                <Card className="border-violet-200 bg-violet-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-violet-700">
                      <Sparkles className="h-4 w-4" />
                      Analyse IA
                      <Badge variant="outline" className="ml-auto">
                        Confiance: {incident.aiAnalysis.confidence}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {incident.aiAnalysis.suggestedRootCauses && (
                      <div>
                        <h4 className="font-medium mb-1">Causes racines suggérées</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                          {incident.aiAnalysis.suggestedRootCauses.map((cause, i) => (
                            <li key={i}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {incident.aiAnalysis.recommendedActions && incident.aiAnalysis.recommendedActions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-1">Actions recommandées</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                          {incident.aiAnalysis.recommendedActions.map((action) => (
                            <li key={action.id}>
                              {action.title}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {action.priority}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Linked CAPAs */}
              {incident.linkedCapaIds.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Plans d'action liés ({incident.linkedCapaIds.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {incident.linkedCapaIds.map((capaId) => (
                      <div
                        key={capaId}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                      >
                        <span className="text-sm font-mono">{capaId}</span>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  {canDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  )}
                  {incident.status !== "closed" && canUpdate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClose}
                      disabled={isClosing}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Clôturer
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Fermer
                  </Button>
                  {canUpdate && onEdit && (
                    <Button onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

