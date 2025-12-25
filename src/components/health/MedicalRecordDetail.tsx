/**
 * Medical Record Detail Component
 * 
 * Displays detailed view of an employee's medical record.
 * Physician-only access.
 */

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Syringe,
  Activity,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeleteHealthRecord, useIsPhysician } from "@/hooks/useHealth";
import type { HealthRecord, FitnessStatus } from "@/types/health";

const FITNESS_STATUS_CONFIG: Record<FitnessStatus, { label: string; color: string; icon: React.ElementType }> = {
  fit: { label: "Apte", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  fit_with_restrictions: { label: "Apte avec restrictions", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  temporarily_unfit: { label: "Inapte temporaire", color: "bg-red-100 text-red-700", icon: Clock },
  permanently_unfit: { label: "Inapte définitif", color: "bg-red-100 text-red-700", icon: XCircle },
  pending_examination: { label: "En attente", color: "bg-slate-100 text-slate-700", icon: Clock },
};

interface MedicalRecordDetailProps {
  record: HealthRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (record: HealthRecord) => void;
  onScheduleVisit?: (record: HealthRecord) => void;
}

export function MedicalRecordDetail({
  record,
  open,
  onOpenChange,
  onEdit,
  onScheduleVisit,
}: MedicalRecordDetailProps) {
  const isPhysician = useIsPhysician();
  const deleteRecord = useDeleteHealthRecord();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!record) return null;

  const statusConfig = FITNESS_STATUS_CONFIG[record.fitnessStatus];
  const StatusIcon = statusConfig.icon;
  const nextVisit = record.nextExaminationDue?.toDate();
  const isOverdue = nextVisit && nextVisit < new Date();

  const handleDelete = async () => {
    try {
      await deleteRecord.mutateAsync(record.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <SheetTitle>{record.employeeName}</SheetTitle>
              <SheetDescription>
                {record.jobTitle} • {record.departmentId}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={cn("flex items-center gap-1", statusConfig.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              {isPhysician && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit?.(record)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              )}
            </div>

            {/* Next Visit */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className={cn("h-5 w-5", isOverdue ? "text-red-500" : "text-slate-400")} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Prochaine visite médicale</p>
                    <p className={cn("text-sm", isOverdue ? "text-red-600 font-medium" : "text-slate-500")}>
                      {nextVisit ? nextVisit.toLocaleDateString("fr-FR") : "Non planifiée"}
                    </p>
                  </div>
                </div>
                {isOverdue && <Badge variant="destructive">En retard</Badge>}
              </div>
              {isPhysician && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => onScheduleVisit?.(record)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Planifier une visite
                </Button>
              )}
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue="restrictions">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
                <TabsTrigger value="exams">Examens</TabsTrigger>
                <TabsTrigger value="vaccines">Vaccins</TabsTrigger>
                <TabsTrigger value="exposures">Expositions</TabsTrigger>
              </TabsList>

              {/* Restrictions Tab */}
              <TabsContent value="restrictions" className="mt-4">
                {record.restrictions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Aucune restriction médicale
                  </p>
                ) : (
                  <div className="space-y-2">
                    {record.restrictions.map((restriction) => (
                      <div
                        key={restriction.id}
                        className="rounded-lg border bg-amber-50 p-3"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {restriction.description}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Depuis le {restriction.startDate.toDate().toLocaleDateString("fr-FR")}
                              {restriction.permanent && " • Permanent"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Examinations Tab */}
              <TabsContent value="exams" className="mt-4">
                {record.examinations.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Aucun examen enregistré
                  </p>
                ) : (
                  <div className="space-y-3">
                    {record.examinations.map((exam) => (
                      <div key={exam.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-medium text-slate-700">
                              {getExamTypeLabel(exam.type)}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {exam.result === "fit" ? "Apte" : "Non apte"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {exam.date.toDate().toLocaleDateString("fr-FR")} • {exam.conductedBy}
                        </p>
                        {exam.notes && (
                          <p className="text-sm text-slate-600 mt-2">{exam.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Vaccinations Tab */}
              <TabsContent value="vaccines" className="mt-4">
                {record.vaccinations.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Aucune vaccination enregistrée
                  </p>
                ) : (
                  <div className="space-y-2">
                    {record.vaccinations.map((vaccine) => (
                      <div key={vaccine.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <Syringe className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-slate-700">{vaccine.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">
                            {vaccine.date.toDate().toLocaleDateString("fr-FR")}
                          </p>
                          {vaccine.nextDoseDate && (
                            <p className="text-xs text-amber-600">
                              Rappel: {vaccine.nextDoseDate.toDate().toLocaleDateString("fr-FR")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Exposures Tab */}
              <TabsContent value="exposures" className="mt-4">
                {record.exposures.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Aucune exposition enregistrée
                  </p>
                ) : (
                  <div className="space-y-2">
                    {record.exposures.map((exposure) => (
                      <div key={exposure.id} className="rounded-lg border p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={cn(
                            "h-4 w-4 mt-0.5",
                            exposure.exposureLevel === "high" ? "text-red-500" :
                            exposure.exposureLevel === "medium" ? "text-amber-500" : "text-green-500"
                          )} />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {exposure.substance || getHazardTypeLabel(exposure.hazardType)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Niveau: {getExposureLevelLabel(exposure.exposureLevel)} • 
                              {exposure.frequency}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Accidents Summary */}
            {record.accidents.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-700">
                    Historique des accidents ({record.accidents.length})
                  </span>
                </div>
                <p className="text-sm text-red-600">
                  Total jours perdus: {record.accidents.reduce((sum, a) => sum + a.daysLost, 0)} jours
                </p>
              </div>
            )}

            {/* Delete Button */}
            {isPhysician && (
              <div className="pt-4">
                {showDeleteConfirm ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700 mb-3">
                      Êtes-vous sûr de vouloir supprimer cette fiche médicale ?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleteRecord.isPending}
                      >
                        Confirmer la suppression
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer la fiche
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Helper functions
function getExamTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    pre_employment: "Visite d'embauche",
    periodic: "Visite périodique",
    return_to_work: "Visite de reprise",
    special_surveillance: "Surveillance spéciale",
    exit: "Visite de fin de contrat",
  };
  return labels[type] || type;
}

function getHazardTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    physical: "Physique",
    chemical: "Chimique",
    biological: "Biologique",
    ergonomic: "Ergonomique",
    psychosocial: "Psychosocial",
    mechanical: "Mécanique",
    electrical: "Électrique",
    thermal: "Thermique",
    environmental: "Environnemental",
  };
  return labels[type] || type;
}

function getExposureLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
  };
  return labels[level] || level;
}

export default MedicalRecordDetail;

