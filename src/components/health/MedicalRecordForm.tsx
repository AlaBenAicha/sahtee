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
import { CalendarIcon, Plus, X, Save, Loader2, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateHealthRecord, useUpdateHealthRecord, useIsPhysician, useEmployeeHasHealthRecord, useSyncHealthRecordExposures } from "@/hooks/useHealth";
import { EmployeeSelector } from "@/components/common/EmployeeSelector";
import { ExposureSelector } from "@/components/health/ExposureSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { HealthRecord, FitnessStatus, MedicalRestriction, Vaccination } from "@/types/health";
import type { User } from "@/types/user";

const formSchema = z.object({
  employeeId: z.string().min(1, "ID employé requis"),
  employeeName: z.string().min(1, "Nom requis"),
  departmentId: z.string().min(1, "Département requis"),
  fitnessStatus: z.enum(["fit", "fit_with_restrictions", "temporarily_unfit", "permanently_unfit", "pending_examination"]),
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

// Step configuration for the multi-step wizard
// Note: Visites/Examens are now managed separately via the medicalVisits collection
const FORM_STEPS = [
  { id: "info", label: "Informations", description: "Données employé" },
  { id: "restrictions", label: "Restrictions", description: "Restrictions médicales" },
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

  // DEBUG: Log step changes
  const handleStepChange = (newStep: number, source: string) => {
    console.log(`[MedicalRecordForm] 📍 Step change requested`, {
      source,
      fromStep: currentStep,
      toStep: newStep,
      stepName: FORM_STEPS[newStep]?.label,
      timestamp: new Date().toISOString(),
    });
    setCurrentStep(newStep);
  };

  // DEBUG: Log dialog open/close
  const handleOpenChange = (newOpen: boolean) => {
    console.log(`[MedicalRecordForm] 🚪 Dialog state change`, {
      wasOpen: open,
      isNowOpen: newOpen,
      currentStep,
      timestamp: new Date().toISOString(),
    });
    onOpenChange(newOpen);
  };

  // Selected employee state (for linking to User document)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  // Restrictions state
  const [restrictions, setRestrictions] = useState<Partial<MedicalRestriction>[]>(
    record?.restrictions || []
  );
  const [newRestriction, setNewRestriction] = useState("");

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

  // Exposures state - now using OrganizationExposure references
  const [exposureIds, setExposureIds] = useState<string[]>(
    record?.exposureIds || []
  );

  const createRecord = useCreateHealthRecord();
  const updateRecord = useUpdateHealthRecord();
  const syncExposures = useSyncHealthRecordExposures();

  // Check if selected employee already has a health record
  const { data: employeeHasRecord, isLoading: checkingEmployee } = useEmployeeHasHealthRecord(
    selectedEmployee?.id
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: record?.employeeId || "",
      employeeName: record?.employeeName || "",
      departmentId: record?.departmentId || "",
      fitnessStatus: record?.fitnessStatus || "pending_examination",
    },
  });

  // Reset form state when dialog opens (for new records only)
  useEffect(() => {
    console.log(`[MedicalRecordForm] 🔄 useEffect for reset triggered`, {
      open,
      hasRecord: !!record,
      willReset: open && !record,
      timestamp: new Date().toISOString(),
    });
    if (open && !record) {
      console.log(`[MedicalRecordForm] 🔄 Resetting form state for new record`);
      // Reset to first step when opening a new record
      setCurrentStep(0);
      setSelectedEmployee(null);
      setRestrictions([]);
      setNewRestriction("");
      setVaccinations([]);
      setNewVaccine({
        name: "",
        date: undefined,
        batchNumber: "",
        administeredBy: "",
        nextDoseDate: undefined,
        required: false,
      });
      setExposureIds([]);

      form.reset({
        employeeId: "",
        employeeName: "",
        departmentId: "",
        fitnessStatus: "pending_examination",
      });
    }
  }, [open, record, form]);

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
    console.log(`[MedicalRecordForm] 🚀 FORM SUBMITTED!`, {
      currentStep,
      stepName: FORM_STEPS[currentStep]?.label,
      isEditing,
      formData: data,
      restrictions: restrictions.length,
      vaccinations: vaccinations.length,
      exposureIds: exposureIds.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const recordData = {
        ...data,
        // Job title comes from employee profile, not from form
        jobTitle: selectedEmployee?.jobTitle || record?.jobTitle || "",
        restrictions: restrictions.map((r, i) => ({
          id: r.id || `restriction-${i}`,
          type: r.type || "general",
          description: r.description || "",
          startDate: r.startDate || Timestamp.now(),
          permanent: r.permanent || false,
          issuedBy: r.issuedBy || "",
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
        // Use exposureIds instead of embedded exposures
        exposureIds,
        accidents: record?.accidents || [],
        hasConfidentialNotes: record?.hasConfidentialNotes || false,
        // nextExaminationDue is now derived from scheduled visits - set a far-future placeholder
        nextExaminationDue: record?.nextExaminationDue || Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      };

      let savedRecordId: string;

      if (isEditing && record) {
        await updateRecord.mutateAsync({
          recordId: record.id,
          data: recordData,
        });
        savedRecordId = record.id;

        // Sync employee-exposure links for edited records
        await syncExposures.mutateAsync({
          healthRecordId: record.id,
          employeeId: data.employeeId,
          previousExposureIds: record.exposureIds || [],
          newExposureIds: exposureIds,
        });
      } else {
        const newRecord = await createRecord.mutateAsync(recordData);
        savedRecordId = newRecord.id;

        // Sync employee-exposure links for new records
        await syncExposures.mutateAsync({
          healthRecordId: savedRecordId,
          employeeId: data.employeeId,
          previousExposureIds: [],
          newExposureIds: exposureIds,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      // Handle the "employee already has record" error gracefully
      if (error instanceof Error && error.message === "EMPLOYEE_ALREADY_HAS_RECORD") {
        console.error("Cet employé a déjà une fiche médicale");
      } else {
        console.error("Error saving medical record:", error);
      }
    }
  };

  const addRestriction = () => {
    console.log(`[MedicalRecordForm] ➕ addRestriction called`, {
      newRestriction,
      currentRestrictions: restrictions.length,
      timestamp: new Date().toISOString(),
    });
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

  const addVaccination = () => {
    console.log(`[MedicalRecordForm] ➕ addVaccination called`, {
      newVaccine,
      currentVaccinations: vaccinations.length,
      timestamp: new Date().toISOString(),
    });
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

  // Handle exposure selection changes from ExposureSelector
  const handleExposureChange = (newExposureIds: string[]) => {
    setExposureIds(newExposureIds);

  };

  if (!isPhysician) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        <form onSubmit={(e) => {
          console.log(`[MedicalRecordForm] 📋 Form onSubmit event triggered`, {
            currentStep,
            stepName: FORM_STEPS[currentStep]?.label,
            eventType: e.type,
            submitter: (e.nativeEvent as SubmitEvent)?.submitter,
            submitterType: ((e.nativeEvent as SubmitEvent)?.submitter as HTMLButtonElement)?.type,
            submitterText: ((e.nativeEvent as SubmitEvent)?.submitter as HTMLButtonElement)?.textContent,
            timestamp: new Date().toISOString(),
          });

          // GUARD: Prevent submission if not on the last step
          if (currentStep < totalSteps - 1) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`[MedicalRecordForm] 🛑 BLOCKED form submission - not on last step!`, {
              currentStep,
              totalSteps,
              expectedStep: totalSteps - 1,
              timestamp: new Date().toISOString(),
            });
            return;
          }

          form.handleSubmit(onSubmit, (errors) => {
            console.log(`[MedicalRecordForm] ❌ Form validation errors`, {
              errors,
              currentStep,
              timestamp: new Date().toISOString(),
            });
          })(e);
        }}>
          {/* Step Indicator */}
          <div className="mt-4 mb-6">
            <div className="flex items-center justify-between">
              {FORM_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step circle and label */}
                  <button
                    type="button"
                    onClick={() => handleStepChange(index, `step-indicator-${index}`)}
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
                  {/* Show warning if employee already has a health record */}
                  {!isEditing && selectedEmployee && employeeHasRecord && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Cet employé a déjà une fiche médicale. Veuillez sélectionner un autre employé ou modifier la fiche existante.
                      </AlertDescription>
                    </Alert>
                  )}
                  {!isEditing && selectedEmployee && checkingEmployee && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                      Vérification en cours...
                    </p>
                  )}
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      L'employé ne peut pas être modifié après la création de la fiche.
                    </p>
                  )}
                </div>

                {/* Department and Job Title (read-only from employee profile) */}
                {selectedEmployee && (
                  <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30 border">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Département</Label>
                      <p className="text-sm font-medium">
                        {selectedEmployee.departmentId || "Non renseigné"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Poste</Label>
                      <p className="text-sm font-medium">
                        {selectedEmployee.jobTitle || "Non renseigné"}
                      </p>
                    </div>
                    {/* Hidden input to satisfy form validation */}
                    <input type="hidden" {...form.register("departmentId")} />
                  </div>
                )}

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

                {/* Note: Visits are now scheduled separately via the Visites tab */}
                <p className="text-xs text-muted-foreground italic">
                  Les visites médicales sont planifiées séparément depuis l'onglet "Visites" ou depuis le détail de la fiche.
                </p>
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

            {/* Step 3: Vaccinations */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nom du vaccin</Label>
                      <Input
                        placeholder="Hépatite B, Tétanos..."
                        value={newVaccine.name}
                        onChange={(e) => setNewVaccine({ ...newVaccine, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Administré par</Label>
                      <Input
                        placeholder="Dr. Martin"
                        value={newVaccine.administeredBy}
                        onChange={(e) => setNewVaccine({ ...newVaccine, administeredBy: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
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

            {/* Step 4: Exposures */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label>Expositions professionnelles</Label>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez les expositions auxquelles cet employé est soumis, ou créez-en une nouvelle.
                  </p>
                  <ExposureSelector
                    value={exposureIds}
                    onChange={handleExposureChange}
                    placeholder="Rechercher ou ajouter des expositions..."
                    employeeId={selectedEmployee?.id}
                  />
                </div>

                {exposureIds.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="secondary">
                      {exposureIds.length} exposition{exposureIds.length > 1 ? "s" : ""} sélectionnée{exposureIds.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}

                <p className="text-xs text-muted-foreground italic pt-2">
                  Les expositions sont gérées de manière centralisée. L'employé sera automatiquement ajouté
                  à la liste des personnes exposées pour chaque exposition sélectionnée.
                </p>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <DialogFooter className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log(`[MedicalRecordForm] ❌ Annuler button clicked`, {
                    currentStep,
                    timestamp: new Date().toISOString(),
                  });
                  handleOpenChange(false);
                }}
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
                  onClick={() => {
                    console.log(`[MedicalRecordForm] ⬅️ Précédent button clicked`, {
                      currentStep,
                      nextStep: currentStep - 1,
                      timestamp: new Date().toISOString(),
                    });
                    handleStepChange(currentStep - 1, 'precedent-button');
                  }}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Précédent
                </Button>
              )}

              {/* Next Button - Always render but hide when on last step */}
              <Button
                type="button"
                disabled={!isEditing && currentStep === 0 && (employeeHasRecord || checkingEmployee || !selectedEmployee)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`[MedicalRecordForm] ➡️ Suivant button clicked`, {
                    currentStep,
                    stepName: FORM_STEPS[currentStep]?.label,
                    nextStep: currentStep + 1,
                    nextStepName: FORM_STEPS[currentStep + 1]?.label,
                    timestamp: new Date().toISOString(),
                  });
                  handleStepChange(currentStep + 1, 'suivant-button');
                }}
                className={cn(currentStep >= totalSteps - 1 && "hidden")}
              >
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>

              {/* Submit Button - Always render but hide when not on last step */}
              <Button
                type="submit"
                disabled={isSubmitting || (!isEditing && employeeHasRecord)}
                onClick={(e) => {
                  // Prevent accidental submission if not on the last step
                  if (currentStep < totalSteps - 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`[MedicalRecordForm] ⚠️ Submit blocked - not on last step`, {
                      currentStep,
                      totalSteps,
                      timestamp: new Date().toISOString(),
                    });
                    return;
                  }
                  console.log(`[MedicalRecordForm] 💾 Submit button clicked (Créer/Mettre à jour)`, {
                    currentStep,
                    isSubmitting,
                    timestamp: new Date().toISOString(),
                  });
                }}
                className={cn(currentStep < totalSteps - 1 && "hidden")}
              >
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
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MedicalRecordForm;

