/**
 * CAPA Form Component
 * 
 * Form for creating and editing CAPA action plans.
 * Uses React Hook Form with Zod validation.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import {
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCreateCAPA, useUpdateCAPA } from "@/hooks/useCAPAs";
import { EmployeeSelector } from "@/components/common";
import type { ActionPlan, ActionPriority, ActionCategory, ActionStatus } from "@/types/capa";
import type { User } from "@/types/user";

const formSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  category: z.enum(["correctif", "preventif"]),
  priority: z.enum(["critique", "haute", "moyenne", "basse"]),
  assigneeId: z.string().min(1, "Un responsable est requis"),
  assigneeName: z.string().min(1, "Un responsable est requis"),
  dueDate: z.date(),
  riskDescription: z.string().optional().or(z.literal("")),
  sourceType: z.enum(["incident", "audit", "risk_assessment", "observation", "ai_suggestion", "manual"]),
  sourceIncidentId: z.string().optional().or(z.literal("")),
  aiGenerated: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

// Prefill data for creating CAPA from other modules
interface CAPAPrefill {
  title?: string;
  description?: string;
  source?: string;
  sourceId?: string;
  priority?: "critique" | "haute" | "moyenne" | "basse";
  category?: "correctif" | "preventif";
}

interface CAPAFormProps {
  capa?: ActionPlan | null;
  prefill?: CAPAPrefill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const priorityOptions: { value: ActionPriority; label: string; color: string }[] = [
  { value: "critique", label: "Critique", color: "bg-red-500" },
  { value: "haute", label: "Haute", color: "bg-orange-500" },
  { value: "moyenne", label: "Moyenne", color: "bg-yellow-500" },
  { value: "basse", label: "Basse", color: "bg-green-500" },
];

const categoryOptions: { value: ActionCategory; label: string; description: string }[] = [
  { value: "correctif", label: "Correctif", description: "Corriger un problème existant" },
  { value: "preventif", label: "Préventif", description: "Prévenir un risque potentiel" },
];

const sourceOptions = [
  { value: "manual", label: "Création manuelle" },
  { value: "incident", label: "Suite à un incident" },
  { value: "audit", label: "Suite à un audit" },
  { value: "risk_assessment", label: "Analyse des risques" },
  { value: "observation", label: "Observation terrain" },
  { value: "ai_suggestion", label: "Suggestion IA" },
];

// Source options for CAPA actions

export function CAPAForm({ capa, prefill, open, onOpenChange, onSuccess }: CAPAFormProps) {
  const isEditing = !!capa;
  const { mutate: createCAPA, isPending: isCreating } = useCreateCAPA();
  const { mutate: updateCAPA, isPending: isUpdating } = useUpdateCAPA();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "correctif",
      priority: "moyenne",
      assigneeId: "",
      assigneeName: "",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      riskDescription: "",
      sourceType: "manual",
      sourceIncidentId: "",
      aiGenerated: false,
    },
  });

  // Reset form when capa or prefill changes
  useEffect(() => {
    if (capa) {
      // Editing existing CAPA
      form.reset({
        title: capa.title,
        description: capa.description,
        category: capa.category,
        priority: capa.priority,
        assigneeId: capa.assigneeId,
        assigneeName: capa.assigneeName,
        dueDate: capa.dueDate.toDate(),
        riskDescription: capa.riskDescription || "",
        sourceType: capa.sourceType,
        sourceIncidentId: capa.sourceIncidentId || "",
        aiGenerated: capa.aiGenerated,
      });
    } else if (prefill) {
      // Creating from prefill (e.g., from health alert)
      form.reset({
        title: prefill.title || "",
        description: prefill.description || "",
        category: prefill.category || "correctif",
        priority: prefill.priority || "moyenne",
        assigneeId: "",
        assigneeName: "",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        riskDescription: "",
        sourceType: prefill.source === "health_alert" ? "observation" : "manual",
        sourceIncidentId: prefill.sourceId || "",
        aiGenerated: false,
      });
    } else {
      // Fresh form
      form.reset({
        title: "",
        description: "",
        category: "correctif",
        priority: "moyenne",
        assigneeId: "",
        assigneeName: "",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        riskDescription: "",
        sourceType: "manual",
        sourceIncidentId: "",
        aiGenerated: false,
      });
    }
  }, [capa, prefill, form]);

  const handleAssigneeChange = (user: User | null) => {
    if (user) {
      form.setValue("assigneeId", user.id, { shouldValidate: true });
      form.setValue("assigneeName", user.displayName, { shouldValidate: true });
    } else {
      form.setValue("assigneeId", "", { shouldValidate: true });
      form.setValue("assigneeName", "", { shouldValidate: true });
    }
  };

  // Watch for assignee changes to keep EmployeeSelector in sync
  const watcherAssigneeId = form.watch("assigneeId");
  const watcherAssigneeName = form.watch("assigneeName");

  const selectedUser = watcherAssigneeId ? {
    id: watcherAssigneeId,
    displayName: watcherAssigneeName,
  } as User : null;

  const onSubmit = (data: FormData) => {
    if (isEditing && capa) {
      updateCAPA(
        {
          capaId: capa.id,
          data: {
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            assigneeId: data.assigneeId,
            assigneeName: data.assigneeName,
            dueDate: Timestamp.fromDate(data.dueDate),
            riskDescription: data.riskDescription,
            sourceType: data.sourceType,
            sourceIncidentId: data.sourceIncidentId,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    } else {
      createCAPA(
        {
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          status: "draft" as ActionStatus,
          assigneeId: data.assigneeId,
          assigneeName: data.assigneeName,
          dueDate: Timestamp.fromDate(data.dueDate),
          riskDescription: data.riskDescription,
          sourceType: data.sourceType,
          sourceIncidentId: data.sourceIncidentId,
          progress: 0,
          checklistItems: [],
          linkedTrainingIds: [],
          linkedEquipmentIds: [],
          linkedDocumentIds: [],
          aiGenerated: data.aiGenerated,
          aiConfidence: data.aiGenerated ? 50 : 0,
          comments: [],
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
            onSuccess?.();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'action" : "Nouvelle action CAPA"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l'action corrective ou préventive."
              : "Créez une nouvelle action corrective ou préventive."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de l'action..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez l'action à réaliser..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category & Priority row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div>{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn("h-2 w-2 rounded-full", option.color)}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assignee & Due date row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeId"
                render={() => (
                  <FormItem>
                    <FormLabel>Responsable *</FormLabel>
                    <FormControl>
                      <EmployeeSelector
                        value={selectedUser}
                        onSelect={handleAssigneeChange}
                        placeholder="Sélectionner un responsable..."
                        error={form.formState.errors.assigneeId?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'échéance *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {field.value ? (
                              field.value.toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Source */}
            <FormField
              control={form.control}
              name="sourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sourceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    D'où provient cette action ?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Risk description (optional) */}
            <FormField
              control={form.control}
              name="riskDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description du risque (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le risque associé..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AI generated toggle */}
            <FormField
              control={form.control}
              name="aiGenerated"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      Généré par IA
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Marquer cette action comme générée par CAPA-AI
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating
                  ? "Enregistrement..."
                  : isEditing
                    ? "Mettre à jour"
                    : "Créer l'action"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

