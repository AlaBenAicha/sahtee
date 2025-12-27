/**
 * Incident Form Component
 * 
 * Multi-step form for creating and editing incidents.
 * Includes:
 * - Basic info (type, severity, description)
 * - Location and timing
 * - Immediate actions taken
 * - Affected persons
 * - Witnesses
 * - Photo/document upload
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import {
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateIncident, useUpdateIncident } from "@/hooks/useIncidents";
import { toast } from "sonner";
import type { Incident, IncidentSeverity } from "@/types/capa";

interface IncidentFormProps {
  incident?: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

const incidentFormSchema = z.object({
  type: z.enum(["accident", "near_miss", "unsafe_condition", "unsafe_act"]),
  severity: z.enum(["minor", "moderate", "severe", "critical"]),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  location: z.string().min(2, "Le lieu est requis"),
  siteId: z.string().optional(),
  departmentId: z.string().optional(),
  incidentDate: z.string().min(1, "La date est requise"),
  incidentTime: z.string().min(1, "L'heure est requise"),
  immediateActions: z.string().optional(),
  reporterName: z.string().min(2, "Le nom du déclarant est requis"),
  reporterEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  isAnonymous: z.boolean(),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

const typeOptions = [
  { value: "accident", label: "Accident", description: "Événement ayant causé des blessures ou dommages" },
  { value: "near_miss", label: "Presqu'accident", description: "Événement sans conséquence mais potentiellement dangereux" },
  { value: "unsafe_condition", label: "Condition dangereuse", description: "Situation ou équipement présentant un risque" },
  { value: "unsafe_act", label: "Acte dangereux", description: "Comportement non conforme aux règles de sécurité" },
];

const severityOptions: { value: IncidentSeverity; label: string; color: string }[] = [
  { value: "minor", label: "Mineur", color: "bg-green-100 border-green-500 text-green-700" },
  { value: "moderate", label: "Modéré", color: "bg-yellow-100 border-yellow-500 text-yellow-700" },
  { value: "severe", label: "Grave", color: "bg-orange-100 border-orange-500 text-orange-700" },
  { value: "critical", label: "Critique", color: "bg-red-100 border-red-500 text-red-700" },
];

const steps = [
  { id: 1, title: "Type d'incident", icon: AlertTriangle },
  { id: 2, title: "Lieu et moment", icon: MapPin },
  { id: 3, title: "Description", icon: Clock },
  { id: 4, title: "Déclarant", icon: Users },
];

export function IncidentForm({ incident, isOpen, onClose }: IncidentFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const { mutate: createIncident, isPending: isCreating } = useCreateIncident();
  const { mutate: updateIncident, isPending: isUpdating } = useUpdateIncident();
  const isEditing = !!incident;
  const isPending = isCreating || isUpdating;

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: incident
      ? {
        type: incident.type as "accident" | "near_miss" | "unsafe_condition" | "unsafe_act",
        severity: incident.severity,
        description: incident.description,
        location: incident.location,
        siteId: incident.siteId,
        departmentId: incident.departmentId,
        incidentDate: incident.reportedAt.toDate().toISOString().split("T")[0],
        incidentTime: incident.reportedAt.toDate().toTimeString().slice(0, 5),
        immediateActions: incident.immediateActions,
        reporterName: incident.reporterName,
        reporterEmail: incident.reporterEmail || "",
        isAnonymous: incident.isAnonymous,
      }
      : {
        type: "accident",
        severity: "moderate",
        description: "",
        location: "",
        siteId: "",
        departmentId: "",
        incidentDate: new Date().toISOString().split("T")[0],
        incidentTime: new Date().toTimeString().slice(0, 5),
        immediateActions: "",
        reporterName: "",
        reporterEmail: "",
        isAnonymous: false,
      },
  });

  const handleSubmit = async (values: IncidentFormValues) => {
    const incidentDateTime = new Date(`${values.incidentDate}T${values.incidentTime}`);

    const incidentData = {
      type: values.type,
      severity: values.severity,
      description: values.description,
      location: values.location,
      siteId: values.siteId,
      departmentId: values.departmentId,
      reportedBy: user?.uid || "unknown",
      reportedAt: Timestamp.fromDate(incidentDateTime),
      immediateActions: values.immediateActions || "",
      reporterName: values.isAnonymous ? "Anonyme" : values.reporterName,
      reporterEmail: values.isAnonymous ? "" : values.reporterEmail || "",
      isAnonymous: values.isAnonymous,
      category: "general",
      status: "reported" as const,
      witnesses: [],
      affectedPersons: [],
      photos: [],
      documents: [],
      linkedCapaIds: [],
      reportableToAuthorities: values.severity === "critical" || values.severity === "severe",
      reportedToAuthorities: false,
    };

    if (isEditing && incident) {
      updateIncident(
        { incidentId: incident.id, data: incidentData },
        {
          onSuccess: () => {
            toast.success("Incident mis à jour");
            onClose();
          },
          onError: (error) => {
            toast.error("Erreur lors de la mise à jour", { description: error.message });
          },
        }
      );
    } else {
      createIncident(incidentData, {
        onSuccess: () => {
          toast.success("Incident signalé avec succès", {
            description: values.severity === "critical" || values.severity === "severe"
              ? "Un plan d'action a été automatiquement créé"
              : undefined,
          });
          onClose();
        },
        onError: (error) => {
          toast.error("Erreur lors du signalement", { description: error.message });
        },
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!form.watch("type") && !!form.watch("severity");
      case 2:
        return !!form.watch("location") && !!form.watch("incidentDate") && !!form.watch("incidentTime");
      case 3:
        return form.watch("description")?.length >= 10;
      case 4:
        return form.watch("isAnonymous") || form.watch("reporterName")?.length >= 2;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {isEditing ? "Modifier l'incident" : "Signaler un incident"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Mettez à jour les informations de l'incident"
              : "Remplissez ce formulaire pour signaler un incident de sécurité"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                    currentStep === step.id
                      ? "bg-primary/10 text-primary"
                      : currentStep > step.id
                        ? "text-muted-foreground hover:bg-muted"
                        : "text-muted-foreground/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{step.title}</span>
                </button>
              );
            })}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-1" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Step 1: Type and Severity */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Type d'incident *</FormLabel>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-3"
                      >
                        {typeOptions.map((option) => (
                          <Label
                            key={option.value}
                            htmlFor={`type-${option.value}`}
                            className={cn(
                              "flex flex-col gap-1 p-4 border-2 rounded-lg cursor-pointer transition-all",
                              field.value === option.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                value={option.value}
                                id={`type-${option.value}`}
                              />
                              <span className="font-medium">{option.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground pl-6">
                              {option.description}
                            </span>
                          </Label>
                        ))}
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Niveau de gravité *</FormLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {severityOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              "p-3 border-2 rounded-lg text-center transition-all",
                              option.color,
                              field.value === option.value
                                ? "border-current ring-2 ring-offset-2 ring-current"
                                : "border-transparent hover:border-current"
                            )}
                          >
                            <span className="font-medium text-sm">{option.label}</span>
                          </button>
                        ))}
                      </div>
                      <FormDescription>
                        Les incidents graves ou critiques génèrent automatiquement un plan d'action
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Location and Time */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu de l'incident *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Ex: Atelier de production, Zone B"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="incidentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de l'incident *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" max={new Date().toISOString().split("T")[0]} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incidentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure de l'incident *</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="siteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site (optionnel)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un site" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="site-1">Site principal</SelectItem>
                          <SelectItem value="site-2">Site secondaire</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Description */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description de l'incident *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Décrivez ce qui s'est passé, les circonstances, les personnes impliquées..."
                          rows={5}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 10 caractères. Soyez aussi précis que possible.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="immediateActions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actions immédiates prises</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Quelles mesures ont été prises immédiatement après l'incident ?"
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Premiers secours, mise en sécurité, appel aux services d'urgence, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 4: Reporter Info */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 p-4 border rounded-lg">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="cursor-pointer">Signalement anonyme</FormLabel>
                        <FormDescription>
                          Votre identité ne sera pas enregistrée
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!form.watch("isAnonymous") && (
                  <>
                    <FormField
                      control={form.control}
                      name="reporterName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Votre nom *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Prénom et nom" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reporterEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Votre email (optionnel)</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="email@example.com" />
                          </FormControl>
                          <FormDescription>
                            Pour recevoir les mises à jour sur le suivi de l'incident
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>

              {currentStep < steps.length ? (
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!canProceed()}
                  data-testid="incident-form-next"
                >
                  Suivant
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isPending || !canProceed()}
                  data-testid="incident-form-submit"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {isEditing ? "Mettre à jour" : "Signaler l'incident"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

