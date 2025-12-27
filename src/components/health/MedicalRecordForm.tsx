/**
 * Medical Record Form Component
 * 
 * Form for creating and editing employee medical records.
 * Physician-only access.
 */

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plus, X, Save, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateHealthRecord, useUpdateHealthRecord, useIsPhysician } from "@/hooks/useHealth";
import { EmployeeSelector } from "@/components/health/EmployeeSelector";
import type { HealthRecord, FitnessStatus, MedicalRestriction, MedicalExamination, Vaccination, ExposureRecord, ExaminationType, HazardCategory } from "@/types/health";
import type { User } from "@/types/user";

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

const EXAMINATION_TYPES: { value: ExaminationType; label: string }[] = [
  { value: "pre_employment", label: "Visite d'embauche" },
  { value: "periodic", label: "Visite périodique" },
  { value: "return_to_work", label: "Visite de reprise" },
  { value: "special_surveillance", label: "Surveillance spéciale" },
  { value: "exit", label: "Visite de fin de contrat" },
];

const HAZARD_CATEGORIES: { value: HazardCategory; label: string }[] = [
  { value: "physical", label: "Physique (bruit, vibrations, radiation)" },
  { value: "chemical", label: "Chimique (toxique, corrosif, inflammable)" },
  { value: "biological", label: "Biologique (bactéries, virus, champignons)" },
  { value: "ergonomic", label: "Ergonomique (posture, mouvements répétitifs)" },
  { value: "psychosocial", label: "Psychosocial (stress, charge de travail)" },
  { value: "mechanical", label: "Mécanique (pièces mobiles, objets tranchants)" },
  { value: "electrical", label: "Électrique (chocs, arc électrique)" },
  { value: "thermal", label: "Thermique (chaleur, froid, feu)" },
  { value: "environmental", label: "Environnemental (éclairage, espaces confinés)" },
];

const EXPOSURE_LEVELS: { value: "low" | "medium" | "high"; label: string }[] = [
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyen" },
  { value: "high", label: "Élevé" },
];

// Step configuration for the multi-step wizard
const FORM_STEPS = [
  { id: "info", label: "Informations", description: "Données employé" },
  { id: "restrictions", label: "Restrictions", description: "Restrictions médicales" },
  { id: "exams", label: "Examens", description: "Historique examens" },
  { id: "vaccines", label: "Vaccins", description: "Vaccinations" },
  { id: "exposures", label: "Expositions", description: "Risques professionnels" },
] as const;

export function MedicalRecordForm({
  open,
  onOpenChange,
  record,
  onSuccess,
}: MedicalRecordFormProps) {
  const isPhysician = useIsPhysician();
  const isEditing = !!record;
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = FORM_STEPS.length;
  
  // Selected employee state (for linking to User document)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  
  // Restrictions state
  const [restrictions, setRestrictions] = useState<Partial<MedicalRestriction>[]>(
    record?.restrictions || []
  );
  const [newRestriction, setNewRestriction] = useState("");
  
  // Examinations state
  const [examinations, setExaminations] = useState<Partial<MedicalExamination>[]>(
    record?.examinations || []
  );
  const [newExam, setNewExam] = useState<{
    type: ExaminationType;
    date: Date | undefined;
    conductedBy: string;
    location: string;
    result: FitnessStatus;
    notes: string;
  }>({
    type: "periodic",
    date: undefined,
    conductedBy: "",
    location: "",
    result: "fit",
    notes: "",
  });

  // Vaccinations state
  const [vaccinations, setVaccinations] = useState<Partial<Vaccination>[]>(
    record?.vaccinations || []
  );
  const [newVaccine, setNewVaccine] = useState<{
    name: string;
    date: Date | undefined;
    batchNumber: string;
    administeredBy: string;
    nextDoseDate: Date | undefined;
    required: boolean;
  }>({
    name: "",
    date: undefined,
    batchNumber: "",
    administeredBy: "",
    nextDoseDate: undefined,
    required: false,
  });

  // Exposures state
  const [exposures, setExposures] = useState<Partial<ExposureRecord>[]>(
    record?.exposures || []
  );
  const [newExposure, setNewExposure] = useState<{
    hazardType: HazardCategory;
    substance: string;
    exposureLevel: "low" | "medium" | "high";
    duration: string;
    frequency: string;
  }>({
    hazardType: "physical",
    substance: "",
    exposureLevel: "low",
    duration: "",
    frequency: "",
  });
  
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

  // Sync selected employee with form values
  useEffect(() => {
    if (selectedEmployee) {
      form.setValue("employeeId", selectedEmployee.id);
      form.setValue("employeeName", selectedEmployee.displayName);
      if (selectedEmployee.departmentId) {
        form.setValue("departmentId", selectedEmployee.departmentId);
      }
    }
  }, [selectedEmployee, form]);

  // Handle employee selection
  const handleEmployeeSelect = (user: User | null) => {
    setSelectedEmployee(user);
  };

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
        examinations: examinations.map((e, i) => ({
          id: e.id || `exam-${i}`,
          type: e.type || "periodic",
          date: e.date || Timestamp.now(),
          conductedBy: e.conductedBy || "",
          location: e.location || "",
          result: e.result || "pending_examination",
          notes: e.notes || "",
          documents: e.documents || [],
        })),
        vaccinations: vaccinations.map((v, i) => {
          const vaccine: {
            id: string;
            name: string;
            date: Timestamp;
            batchNumber: string;
            administeredBy: string;
            required: boolean;
            nextDoseDate?: Timestamp;
          } = {
            id: v.id || `vaccine-${i}`,
            name: v.name || "",
            date: v.date instanceof Timestamp ? v.date : Timestamp.now(),
            batchNumber: v.batchNumber || "",
            administeredBy: v.administeredBy || "",
            required: v.required || false,
          };
          // Only add nextDoseDate if it exists (Firebase rejects undefined)
          if (v.nextDoseDate) {
            vaccine.nextDoseDate = v.nextDoseDate instanceof Timestamp 
              ? v.nextDoseDate 
              : Timestamp.fromDate(v.nextDoseDate as Date);
          }
          return vaccine;
        }),
        exposures: exposures.map((exp, i) => ({
          id: exp.id || `exposure-${i}`,
          hazardType: exp.hazardType || "physical",
          substance: exp.substance || "",
          exposureLevel: exp.exposureLevel || "low",
          duration: exp.duration || "",
          frequency: exp.frequency || "",
          controlMeasures: exp.controlMeasures || [],
          startDate: exp.startDate || Timestamp.now(),
        })),
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

  const addExamination = () => {
    if (newExam.date && newExam.conductedBy.trim()) {
      setExaminations([
        ...examinations,
        {
          id: `exam-${Date.now()}`,
          type: newExam.type,
          date: Timestamp.fromDate(newExam.date),
          conductedBy: newExam.conductedBy.trim(),
          location: newExam.location.trim(),
          result: newExam.result,
          notes: newExam.notes.trim(),
          documents: [],
        },
      ]);
      setNewExam({
        type: "periodic",
        date: undefined,
        conductedBy: "",
        location: "",
        result: "fit",
        notes: "",
      });
    }
  };

  const removeExamination = (index: number) => {
    setExaminations(examinations.filter((_, i) => i !== index));
  };

  const addVaccination = () => {
    if (newVaccine.name.trim() && newVaccine.date) {
      setVaccinations([
        ...vaccinations,
        {
          id: `vaccine-${Date.now()}`,
          name: newVaccine.name.trim(),
          date: Timestamp.fromDate(newVaccine.date),
          batchNumber: newVaccine.batchNumber.trim(),
          administeredBy: newVaccine.administeredBy.trim(),
          nextDoseDate: newVaccine.nextDoseDate ? Timestamp.fromDate(newVaccine.nextDoseDate) : undefined,
          required: newVaccine.required,
        },
      ]);
      setNewVaccine({
        name: "",
        date: undefined,
        batchNumber: "",
        administeredBy: "",
        nextDoseDate: undefined,
        required: false,
      });
    }
  };

  const removeVaccination = (index: number) => {
    setVaccinations(vaccinations.filter((_, i) => i !== index));
  };

  const addExposure = () => {
    if (newExposure.substance.trim() && newExposure.duration.trim()) {
      setExposures([
        ...exposures,
        {
          id: `exposure-${Date.now()}`,
          hazardType: newExposure.hazardType,
          substance: newExposure.substance.trim(),
          exposureLevel: newExposure.exposureLevel,
          duration: newExposure.duration.trim(),
          frequency: newExposure.frequency.trim(),
          controlMeasures: [],
          startDate: Timestamp.now(),
        },
      ]);
      setNewExposure({
        hazardType: "physical",
        substance: "",
        exposureLevel: "low",
        duration: "",
        frequency: "",
      });
    }
  };

  const removeExposure = (index: number) => {
    setExposures(exposures.filter((_, i) => i !== index));
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
          {/* Step Indicator */}
          <div className="mt-4 mb-6">
            <div className="flex items-center justify-between">
              {FORM_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step circle and label */}
                  <button
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "flex flex-col items-center gap-1 group transition-all duration-200",
                      index <= currentStep ? "cursor-pointer" : "cursor-pointer"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2",
                        index < currentStep
                          ? "bg-primary text-primary-foreground border-primary"
                          : index === currentStep
                          ? "bg-primary/10 text-primary border-primary"
                          : "bg-muted/50 text-muted-foreground border-muted-foreground/30 group-hover:border-primary/50 group-hover:text-primary"
                      )}
                    >
                      {index < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium text-center max-w-[80px] leading-tight transition-colors duration-200",
                        index === currentStep
                          ? "text-primary"
                          : index < currentStep
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                  
                  {/* Connector line */}
                  {index < FORM_STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 mt-[-20px]">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          index < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {/* Step 1: Info */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              {/* Employee Selection */}
              <div className="space-y-2">
                <Label>Employé</Label>
                <EmployeeSelector
                  value={selectedEmployee}
                  onSelect={handleEmployeeSelect}
                  placeholder="Rechercher et sélectionner un employé..."
                  disabled={isEditing}
                  error={
                    form.formState.errors.employeeId?.message ||
                    form.formState.errors.employeeName?.message
                  }
                />
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    L'employé ne peut pas être modifié après la création de la fiche.
                  </p>
                )}
              </div>

              {/* Department and Job Title (auto-filled from employee, but editable) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Département</Label>
                  <Input
                    id="departmentId"
                    {...form.register("departmentId")}
                    placeholder="Auto-rempli depuis le profil employé"
                    className={selectedEmployee?.departmentId ? "bg-muted/50" : ""}
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
            </div>
            )}

            {/* Step 2: Restrictions */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
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
              </div>
            )}

            {/* Step 3: Examinations */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div className="space-y-3 rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Type d'examen</Label>
                    <Select
                      value={newExam.type}
                      onValueChange={(value) => setNewExam({ ...newExam, type: value as ExaminationType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXAMINATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-sm",
                            !newExam.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {newExam.date ? format(newExam.date, "dd/MM/yyyy", { locale: fr }) : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newExam.date}
                          onSelect={(date) => setNewExam({ ...newExam, date })}
                          locale={fr}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Médecin</Label>
                    <Input
                      placeholder="Dr. Martin"
                      value={newExam.conductedBy}
                      onChange={(e) => setNewExam({ ...newExam, conductedBy: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Lieu</Label>
                    <Input
                      placeholder="Centre médical"
                      value={newExam.location}
                      onChange={(e) => setNewExam({ ...newExam, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Résultat</Label>
                    <Select
                      value={newExam.result}
                      onValueChange={(value) => setNewExam({ ...newExam, result: value as FitnessStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  <div className="flex items-end">
                    <Button type="button" onClick={addExamination} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Ajouter
                    </Button>
                  </div>
                </div>
              </div>

              {examinations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Aucun examen médical enregistré
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {examinations.map((exam, index) => (
                    <div
                      key={exam.id || index}
                      className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">
                            {EXAMINATION_TYPES.find((t) => t.value === exam.type)?.label || exam.type}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {exam.date instanceof Timestamp
                              ? format(exam.date.toDate(), "dd/MM/yyyy")
                              : ""}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {exam.conductedBy} - {exam.location}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExamination(index)}
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}

            {/* Step 4: Vaccinations */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div className="space-y-3 rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nom du vaccin</Label>
                    <Input
                      placeholder="Hépatite B, Tétanos..."
                      value={newVaccine.name}
                      onChange={(e) => setNewVaccine({ ...newVaccine, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date d'administration</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-sm",
                            !newVaccine.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {newVaccine.date ? format(newVaccine.date, "dd/MM/yyyy", { locale: fr }) : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newVaccine.date}
                          onSelect={(date) => setNewVaccine({ ...newVaccine, date })}
                          locale={fr}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">N° de lot</Label>
                    <Input
                      placeholder="LOT-12345"
                      value={newVaccine.batchNumber}
                      onChange={(e) => setNewVaccine({ ...newVaccine, batchNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Administré par</Label>
                    <Input
                      placeholder="Dr. Martin"
                      value={newVaccine.administeredBy}
                      onChange={(e) => setNewVaccine({ ...newVaccine, administeredBy: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 pt-5">
                    <Checkbox
                      id="required"
                      checked={newVaccine.required}
                      onCheckedChange={(checked) => setNewVaccine({ ...newVaccine, required: !!checked })}
                    />
                    <Label htmlFor="required" className="text-xs">Obligatoire</Label>
                  </div>
                  <Button type="button" onClick={addVaccination} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Ajouter
                  </Button>
                </div>
              </div>

              {vaccinations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Aucun vaccin enregistré
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {vaccinations.map((vaccine, index) => (
                    <div
                      key={vaccine.id || index}
                      className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">{vaccine.name}</span>
                          {vaccine.required && (
                            <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {vaccine.date instanceof Timestamp
                              ? format(vaccine.date.toDate(), "dd/MM/yyyy")
                              : ""}
                          </Badge>
                        </div>
                        {vaccine.batchNumber && (
                          <p className="text-xs text-slate-500 mt-1">Lot: {vaccine.batchNumber}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVaccination(index)}
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}

            {/* Step 5: Exposures */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div className="space-y-3 rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Type de risque</Label>
                    <Select
                      value={newExposure.hazardType}
                      onValueChange={(value) => setNewExposure({ ...newExposure, hazardType: value as HazardCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HAZARD_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Substance / Agent</Label>
                    <Input
                      placeholder="Bruit, Silice, Benzène..."
                      value={newExposure.substance}
                      onChange={(e) => setNewExposure({ ...newExposure, substance: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Niveau</Label>
                    <Select
                      value={newExposure.exposureLevel}
                      onValueChange={(value) => setNewExposure({ ...newExposure, exposureLevel: value as "low" | "medium" | "high" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPOSURE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Durée</Label>
                    <Input
                      placeholder="8h/jour"
                      value={newExposure.duration}
                      onChange={(e) => setNewExposure({ ...newExposure, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fréquence</Label>
                    <Input
                      placeholder="Quotidien"
                      value={newExposure.frequency}
                      onChange={(e) => setNewExposure({ ...newExposure, frequency: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="button" onClick={addExposure} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter
                </Button>
              </div>

              {exposures.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Aucune exposition enregistrée
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {exposures.map((exposure, index) => (
                    <div
                      key={exposure.id || index}
                      className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">{exposure.substance}</span>
                          <Badge
                            variant={
                              exposure.exposureLevel === "high"
                                ? "destructive"
                                : exposure.exposureLevel === "medium"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {EXPOSURE_LEVELS.find((l) => l.value === exposure.exposureLevel)?.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {HAZARD_CATEGORIES.find((c) => c.value === exposure.hazardType)?.label?.split(" ")[0]} 
                          {exposure.duration && ` • ${exposure.duration}`}
                          {exposure.frequency && ` • ${exposure.frequency}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExposure(index)}
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <DialogFooter className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Précédent
                </Button>
              )}
              
              {/* Next Button or Submit */}
              {currentStep < totalSteps - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Suivant
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
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
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MedicalRecordForm;

