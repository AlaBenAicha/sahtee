/**
 * Medical Record Form Component
 * 
 * Form for creating and editing employee medical records.
 * Physician-only access.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, X, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateHealthRecord, useUpdateHealthRecord, useIsPhysician } from "@/hooks/useHealth";
import type { HealthRecord, FitnessStatus, MedicalRestriction } from "@/types/health";

const formSchema = z.object({
  employeeId: z.string().min(1, "ID employé requis"),
  employeeName: z.string().min(1, "Nom requis"),
  departmentId: z.string().min(1, "Département requis"),
  jobTitle: z.string().min(1, "Poste requis"),
  fitnessStatus: z.enum(["fit", "fit_with_restrictions", "temporarily_unfit", "permanently_unfit", "pending_examination"]),
  nextExaminationDue: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MedicalRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: HealthRecord;
  onSuccess?: () => void;
}

const FITNESS_OPTIONS: { value: FitnessStatus; label: string }[] = [
  { value: "fit", label: "Apte" },
  { value: "fit_with_restrictions", label: "Apte avec restrictions" },
  { value: "temporarily_unfit", label: "Inapte temporaire" },
  { value: "permanently_unfit", label: "Inapte définitif" },
  { value: "pending_examination", label: "En attente d'examen" },
];

export function MedicalRecordForm({
  open,
  onOpenChange,
  record,
  onSuccess,
}: MedicalRecordFormProps) {
  const isPhysician = useIsPhysician();
  const isEditing = !!record;
  
  const [restrictions, setRestrictions] = useState<Partial<MedicalRestriction>[]>(
    record?.restrictions || []
  );
  const [newRestriction, setNewRestriction] = useState("");
  
  const createRecord = useCreateHealthRecord();
  const updateRecord = useUpdateHealthRecord();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: record?.employeeId || "",
      employeeName: record?.employeeName || "",
      departmentId: record?.departmentId || "",
      jobTitle: record?.jobTitle || "",
      fitnessStatus: record?.fitnessStatus || "pending_examination",
      nextExaminationDue: record?.nextExaminationDue?.toDate() || undefined,
    },
  });

  const isSubmitting = createRecord.isPending || updateRecord.isPending;

  const onSubmit = async (data: FormData) => {
    try {
      const recordData = {
        ...data,
        restrictions: restrictions.map((r, i) => ({
          id: r.id || `restriction-${i}`,
          type: r.type || "general",
          description: r.description || "",
          startDate: r.startDate || Timestamp.now(),
          permanent: r.permanent || false,
          issuedBy: r.issuedBy || "",
        })),
        examinations: record?.examinations || [],
        vaccinations: record?.vaccinations || [],
        exposures: record?.exposures || [],
        accidents: record?.accidents || [],
        hasConfidentialNotes: record?.hasConfidentialNotes || false,
        nextExaminationDue: data.nextExaminationDue 
          ? Timestamp.fromDate(data.nextExaminationDue)
          : Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year from now
      };

      if (isEditing && record) {
        await updateRecord.mutateAsync({
          recordId: record.id,
          data: recordData,
        });
      } else {
        await createRecord.mutateAsync(recordData);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving medical record:", error);
    }
  };

  const addRestriction = () => {
    if (newRestriction.trim()) {
      setRestrictions([
        ...restrictions,
        {
          id: `restriction-${Date.now()}`,
          type: "work",
          description: newRestriction.trim(),
          startDate: Timestamp.now(),
          permanent: false,
          issuedBy: "",
        },
      ]);
      setNewRestriction("");
    }
  };

  const removeRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== index));
  };

  if (!isPhysician) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la fiche médicale" : "Nouvelle fiche médicale"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la fiche médicale de l'employé."
              : "Créez une nouvelle fiche médicale pour un employé."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">ID Employé</Label>
                  <Input
                    id="employeeId"
                    {...form.register("employeeId")}
                    placeholder="EMP-001"
                    disabled={isEditing}
                  />
                  {form.formState.errors.employeeId && (
                    <p className="text-sm text-red-500">{form.formState.errors.employeeId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeName">Nom complet</Label>
                  <Input
                    id="employeeName"
                    {...form.register("employeeName")}
                    placeholder="Jean Dupont"
                  />
                  {form.formState.errors.employeeName && (
                    <p className="text-sm text-red-500">{form.formState.errors.employeeName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Département</Label>
                  <Input
                    id="departmentId"
                    {...form.register("departmentId")}
                    placeholder="Production"
                  />
                  {form.formState.errors.departmentId && (
                    <p className="text-sm text-red-500">{form.formState.errors.departmentId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Poste</Label>
                  <Input
                    id="jobTitle"
                    {...form.register("jobTitle")}
                    placeholder="Opérateur machine"
                  />
                  {form.formState.errors.jobTitle && (
                    <p className="text-sm text-red-500">{form.formState.errors.jobTitle.message}</p>
                  )}
                </div>
              </div>

              {/* Fitness Status */}
              <div className="space-y-2">
                <Label htmlFor="fitnessStatus">Statut d'aptitude</Label>
                <Select
                  value={form.watch("fitnessStatus")}
                  onValueChange={(value) => form.setValue("fitnessStatus", value as FitnessStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {FITNESS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Next Examination Date */}
              <div className="space-y-2">
                <Label>Prochaine visite médicale</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("nextExaminationDue") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("nextExaminationDue") ? (
                        format(form.watch("nextExaminationDue")!, "PPP", { locale: fr })
                      ) : (
                        "Sélectionner une date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("nextExaminationDue")}
                      onSelect={(date) => form.setValue("nextExaminationDue", date)}
                      locale={fr}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="restrictions" className="space-y-4 mt-4">
              {/* Add Restriction */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nouvelle restriction (ex: Port de charges limité à 10kg)"
                  value={newRestriction}
                  onChange={(e) => setNewRestriction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRestriction();
                    }
                  }}
                />
                <Button type="button" onClick={addRestriction}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Restrictions List */}
              {restrictions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Aucune restriction médicale
                </p>
              ) : (
                <div className="space-y-2">
                  {restrictions.map((restriction, index) => (
                    <div
                      key={restriction.id || index}
                      className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
                    >
                      <span className="text-sm text-slate-700">{restriction.description}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRestriction(index)}
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {restrictions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {restrictions.length} restriction{restrictions.length > 1 ? "s" : ""}
                  </Badge>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Mettre à jour" : "Créer"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MedicalRecordForm;

