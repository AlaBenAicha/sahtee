/**
 * Training Detail Modal Component
 * 
 * Displays detailed information about a training plan.
 */

import { useMemo } from "react";
import {
  BookOpen,
  Clock,
  Calendar,
  Users,
  Award,
  ExternalLink,
  Edit,
  Trash2,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Play,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import { usePlanTrainingRecords, useDeleteTrainingPlan } from "@/hooks/useTrainings";
import { toast } from "sonner";
import type { TrainingPlan } from "@/types/capa";

interface TrainingDetailModalProps {
  training: TrainingPlan;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onEnrollEmployees?: () => void;
}

const priorityConfig = {
  obligatoire: { label: "Obligatoire", color: "bg-red-100 text-red-700" },
  recommandee: { label: "Recommandée", color: "bg-amber-100 text-amber-700" },
  optionnelle: { label: "Optionnelle", color: "bg-blue-100 text-blue-700" },
};

const sourceLabels: Record<string, string> = {
  capa: "CAPA",
  incident: "Incident",
  risk: "Analyse de risque",
  regulation: "Réglementation",
  internal: "Interne",
};

export function TrainingDetailModal({
  training,
  isOpen,
  onClose,
  onEdit,
  onEnrollEmployees,
}: TrainingDetailModalProps) {
  const { canUpdate, canDelete } = useFeaturePermissions("training");
  const { mutate: deleteTraining, isPending: isDeleting } = useDeleteTrainingPlan();
  const { data: records = [] } = usePlanTrainingRecords(training.id);

  const dueDate = useMemo(() => {
    return training.dueDate.toDate().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [training.dueDate]);

  const isOverdue = useMemo(() => {
    return training.dueDate.toMillis() < Date.now();
  }, [training.dueDate]);

  const completionRate = useMemo(() => {
    const { total, completed } = training.completionStatus;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [training.completionStatus]);

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.")) {
      deleteTraining(training.id, {
        onSuccess: () => {
          toast.success("Formation supprimée");
          onClose();
        },
        onError: (error) => {
          toast.error("Erreur", { description: error.message });
        },
      });
    }
  };

  const priorityInfo = priorityConfig[training.priority] || priorityConfig.optionnelle;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{training.courseName}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
                      <Badge variant="outline">{sourceLabels[training.source]}</Badge>
                      {training.mandatory && (
                        <Badge variant="secondary">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Obligatoire
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{training.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{training.completionStatus.total} inscrit(s)</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 text-sm",
                  isOverdue ? "text-red-600" : ""
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>{isOverdue ? "Échue: " : ""}{dueDate}</span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {training.description}
              </p>
            </div>

            {/* Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Progression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {training.completionStatus.completed} terminé(s) sur{" "}
                      {training.completionStatus.total}
                    </span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {training.completionStatus.completed}
                    </div>
                    <div className="text-xs text-muted-foreground">Terminés</div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {training.completionStatus.inProgress}
                    </div>
                    <div className="text-xs text-muted-foreground">En cours</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-lg font-bold text-slate-600">
                      {training.completionStatus.notStarted}
                    </div>
                    <div className="text-xs text-muted-foreground">Non débutés</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {training.completionStatus.overdue}
                    </div>
                    <div className="text-xs text-muted-foreground">En retard</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content URL */}
            {training.contentUrl && (
              <div className="space-y-2">
                <h3 className="font-semibold">Matériel de formation</h3>
                <Button variant="outline" asChild>
                  <a href={training.contentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Accéder au contenu
                  </a>
                </Button>
              </div>
            )}

            {/* Linked CAPA */}
            {training.linkedActionPlanId && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Liée au plan d'action: {training.linkedActionPlanId.slice(0, 8)}...
                  </span>
                </div>
              </div>
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
              </div>

              <div className="flex gap-2">
                {canUpdate && onEnrollEmployees && (
                  <Button variant="outline" onClick={onEnrollEmployees}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Inscrire des employés
                  </Button>
                )}
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
  );
}

