/**
 * Organization Exposure Form Component
 * 
 * Form for creating and editing organization-level exposure records.
 * Uses EmployeesMultiSelector for selecting exposed employees.
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
import { CalendarIcon, Save, Loader2, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateExposure, useUpdateExposure, useCreateMeasurement } from "@/hooks/useHealth";
import { EmployeesMultiSelector } from "@/components/health/EmployeesMultiSelector";
import { Badge } from "@/components/ui/badge";
import type { OrganizationExposure, HazardCategory } from "@/types/health";
import type { User } from "@/types/user";

const formSchema = z.object({
  agent: z.string().min(1, "Agent/substance requis"),
  hazardType: z.enum([
    "physical",
    "chemical",
    "biological",
    "ergonomic",
    "psychosocial",
    "mechanical",
    "electrical",
    "thermal",
    "environmental",
  ]),
  area: z.string().min(1, "Zone requise"),
  regulatoryLimit: z.number().min(0, "Limite réglementaire requise"),
  unit: z.string().min(1, "Unité requise"),
  regulatoryReference: z.string().optional(),
  lastMeasurement: z.number().min(0, "Valeur de mesure requise"),
  lastMeasurementDate: z.date({ message: "Date requise" }),
  monitoringFrequency: z.enum([
    "continuous",
    "weekly",
    "monthly",
    "quarterly",
    "annually",
  ]),
  nextMeasurementDue: z.date({ message: "Date requise" }),
});

type FormData = z.infer<typeof formSchema>;

interface ExposureFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exposure?: OrganizationExposure;
  onSuccess?: (exposure: Partial<OrganizationExposure>) => void;
}

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

const MONITORING_FREQUENCIES: { value: string; label: string }[] = [
  { value: "continuous", label: "Continu" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
  { value: "quarterly", label: "Trimestriel" },
  { value: "annually", label: "Annuel" },
];

const ALERT_LEVELS: { value: string; label: string; color: string }[] = [
  { value: "low", label: "Faible", color: "bg-green-100 text-green-800" },
  { value: "moderate", label: "Modéré", color: "bg-yellow-100 text-yellow-800" },
  { value: "elevated", label: "Élevé", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critique", color: "bg-red-100 text-red-800" },
];

export function ExposureForm({
  open,
  onOpenChange,
  exposure,
  onSuccess,
}: ExposureFormProps) {
  const { userProfile } = useAuth();
  const isEditing = !!exposure;
  
  // Mutation hooks for creating/updating exposures and measurements
  const createExposure = useCreateExposure();
  const updateExposure = useUpdateExposure();
  const createMeasurement = useCreateMeasurement();
  const isSubmitting = createExposure.isPending || updateExposure.isPending || createMeasurement.isPending;
  
  // Selected employees state (for multi-select)
  const [selectedEmployees, setSelectedEmployees] = useState<User[]>([]);
  
  // Control measures state
  const [controlMeasures, setControlMeasures] = useState<string[]>(
    exposure?.controlMeasures || []
  );
  const [newControlMeasure, setNewControlMeasure] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agent: exposure?.agent || "",
      hazardType: exposure?.hazardType || "chemical",
      area: exposure?.area || "",
      regulatoryLimit: exposure?.regulatoryLimit || 0,
      unit: exposure?.unit || "",
      regulatoryReference: exposure?.regulatoryReference || "",
      lastMeasurement: exposure?.lastMeasurement || 0,
      lastMeasurementDate: exposure?.lastMeasurementDate?.toDate() || new Date(),
      monitoringFrequency: exposure?.monitoringFrequency || "monthly",
      nextMeasurementDue: exposure?.nextMeasurementDue?.toDate() || new Date(),
    },
  });

  // Calculate alert level based on measurement vs limit
  const calculateAlertLevel = (measurement: number, limit: number): "low" | "moderate" | "elevated" | "critical" => {
    if (limit <= 0) return "low";
    const percentage = (measurement / limit) * 100;
    if (percentage >= 100) return "critical";
    if (percentage >= 80) return "elevated";
    if (percentage >= 50) return "moderate";
    return "low";
  };

  // Reset form when dialog opens/closes or exposure changes
  useEffect(() => {
    if (open) {
      form.reset({
        agent: exposure?.agent || "",
        hazardType: exposure?.hazardType || "chemical",
        area: exposure?.area || "",
        regulatoryLimit: exposure?.regulatoryLimit || 0,
        unit: exposure?.unit || "",
        regulatoryReference: exposure?.regulatoryReference || "",
        lastMeasurement: exposure?.lastMeasurement || 0,
        lastMeasurementDate: exposure?.lastMeasurementDate?.toDate() || new Date(),
        monitoringFrequency: exposure?.monitoringFrequency || "monthly",
        nextMeasurementDue: exposure?.nextMeasurementDue?.toDate() || new Date(),
      });
      setSelectedEmployees([]);
      setControlMeasures(exposure?.controlMeasures || []);
      setNewControlMeasure("");
    }
  }, [open, exposure, form]);

  const watchedMeasurement = form.watch("lastMeasurement");
  const watchedLimit = form.watch("regulatoryLimit");
  const alertLevel = calculateAlertLevel(watchedMeasurement, watchedLimit);
  const percentOfLimit = watchedLimit > 0 ? Math.round((watchedMeasurement / watchedLimit) * 100) : 0;

  const onSubmit = async (data: FormData) => {
    try {
      const exposureData = {
        ...data,
        lastMeasurementDate: Timestamp.fromDate(data.lastMeasurementDate),
        nextMeasurementDue: Timestamp.fromDate(data.nextMeasurementDue),
        percentOfLimit,
        alertLevel,
        exposedEmployeeCount: selectedEmployees.length,
        exposedEmployeeIds: selectedEmployees.map((emp) => emp.id),
        controlMeasures,
        exceedanceCount: exposure?.exceedanceCount || (alertLevel === "critical" ? 1 : 0),
        linkedCapaIds: exposure?.linkedCapaIds || [],
      };

      let savedExposure: OrganizationExposure;
      
      if (isEditing && exposure) {
        // Update existing exposure
        await updateExposure.mutateAsync({
          exposureId: exposure.id,
          data: exposureData,
        });
        savedExposure = { ...exposure, ...exposureData } as OrganizationExposure;
      } else {
        // Create new exposure
        savedExposure = await createExposure.mutateAsync(exposureData);
        
        // Create the initial measurement in the measurements collection
        if (data.lastMeasurement > 0) {
          const withinLimits = data.lastMeasurement <= data.regulatoryLimit;
          await createMeasurement.mutateAsync({
            exposureId: savedExposure.id,
            date: data.lastMeasurementDate,
            value: data.lastMeasurement,
            unit: data.unit,
            measuredBy: userProfile?.displayName || "Système",
            method: "Mesure initiale",
            duration: "8h TWA",
            withinLimits,
            notes: "Mesure initiale lors de la création de l'exposition",
          });
        }
      }

      onSuccess?.(savedExposure);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving exposure:", error);
    }
  };

  const addControlMeasure = () => {
    if (newControlMeasure.trim()) {
      setControlMeasures([...controlMeasures, newControlMeasure.trim()]);
      setNewControlMeasure("");
    }
  };

  const removeControlMeasure = (index: number) => {
    setControlMeasures(controlMeasures.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {isEditing ? "Modifier l'exposition" : "Nouvelle exposition"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les détails de l'exposition professionnelle."
              : "Enregistrez une nouvelle exposition professionnelle pour le suivi."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-y-auto pr-2 -mr-2">
          {/* Hazard Type and Agent */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de risque</Label>
              <Select
                value={form.watch("hazardType")}
                onValueChange={(value) => form.setValue("hazardType", value as HazardCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
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

            <div className="space-y-2">
              <Label htmlFor="agent">Agent / Substance</Label>
              <Input
                id="agent"
                {...form.register("agent")}
                placeholder="ex: Silice, Bruit > 85dB, Benzène..."
              />
              {form.formState.errors.agent && (
                <p className="text-sm text-red-500">{form.formState.errors.agent.message}</p>
              )}
            </div>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <Label htmlFor="area">Zone / Emplacement</Label>
            <Input
              id="area"
              {...form.register("area")}
              placeholder="ex: Atelier de production, Bureau B2..."
            />
            {form.formState.errors.area && (
              <p className="text-sm text-red-500">{form.formState.errors.area.message}</p>
            )}
          </div>

          {/* Regulatory Limits */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regulatoryLimit">Limite réglementaire</Label>
              <Input
                id="regulatoryLimit"
                type="number"
                step="0.01"
                {...form.register("regulatoryLimit", { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.regulatoryLimit && (
                <p className="text-sm text-red-500">{form.formState.errors.regulatoryLimit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unité</Label>
              <Input
                id="unit"
                {...form.register("unit")}
                placeholder="ex: dB, mg/m³, ppm..."
              />
              {form.formState.errors.unit && (
                <p className="text-sm text-red-500">{form.formState.errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="regulatoryReference">Référence (optionnel)</Label>
              <Input
                id="regulatoryReference"
                {...form.register("regulatoryReference")}
                placeholder="ex: VLEP 8h"
              />
            </div>
          </div>

          {/* Current Measurement */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastMeasurement">Dernière mesure</Label>
              <Input
                id="lastMeasurement"
                type="number"
                step="0.01"
                {...form.register("lastMeasurement", { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.lastMeasurement && (
                <p className="text-sm text-red-500">{form.formState.errors.lastMeasurement.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date de mesure</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("lastMeasurementDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("lastMeasurementDate") ? (
                      format(form.watch("lastMeasurementDate"), "PPP", { locale: fr })
                    ) : (
                      "Sélectionner une date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("lastMeasurementDate")}
                    onSelect={(date) => date && form.setValue("lastMeasurementDate", date)}
                    locale={fr}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Alert Level Indicator */}
          {watchedLimit > 0 && (
            <div className="flex items-center gap-4 rounded-lg border p-3 bg-slate-50">
              <div className="flex-1">
                <p className="text-sm font-medium">Niveau d'alerte</p>
                <p className="text-xs text-muted-foreground">
                  {percentOfLimit}% de la limite réglementaire
                </p>
              </div>
              <Badge className={ALERT_LEVELS.find((a) => a.value === alertLevel)?.color}>
                {ALERT_LEVELS.find((a) => a.value === alertLevel)?.label}
              </Badge>
            </div>
          )}

          {/* Monitoring Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fréquence de surveillance</Label>
              <Select
                value={form.watch("monitoringFrequency")}
                onValueChange={(value) => form.setValue("monitoringFrequency", value as FormData["monitoringFrequency"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {MONITORING_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prochaine mesure prévue</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("nextMeasurementDue") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("nextMeasurementDue") ? (
                      format(form.watch("nextMeasurementDue"), "PPP", { locale: fr })
                    ) : (
                      "Sélectionner une date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("nextMeasurementDue")}
                    onSelect={(date) => date && form.setValue("nextMeasurementDue", date)}
                    locale={fr}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Exposed Employees */}
          <div className="space-y-2">
            <Label>Employés exposés</Label>
            <EmployeesMultiSelector
              value={selectedEmployees}
              onChange={setSelectedEmployees}
              placeholder="Sélectionner les employés exposés..."
            />
          </div>

          {/* Control Measures */}
          <div className="space-y-2">
            <Label>Mesures de contrôle</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nouvelle mesure de contrôle..."
                value={newControlMeasure}
                onChange={(e) => setNewControlMeasure(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addControlMeasure();
                  }
                }}
              />
              <Button type="button" onClick={addControlMeasure}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {controlMeasures.length > 0 && (
              <div className="space-y-2 mt-2">
                {controlMeasures.map((measure, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-slate-50 p-2"
                  >
                    <span className="text-sm">{measure}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeControlMeasure(index)}
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
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
      </DialogContent>
    </Dialog>
  );
}

export default ExposureForm;
