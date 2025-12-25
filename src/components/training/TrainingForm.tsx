/**
 * Training Form Component
 * 
 * Form for creating and editing training plans.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import {
  BookOpen,
  Loader2,
  Save,
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
import { Switch } from "@/components/ui/switch";
import { useCreateTrainingPlan, useUpdateTrainingPlan } from "@/hooks/useTrainings";
import { toast } from "sonner";
import type { TrainingPlan } from "@/types/capa";

interface TrainingFormProps {
  training?: TrainingPlan | null;
  isOpen: boolean;
  onClose: () => void;
  linkedCapaId?: string;
}

const trainingFormSchema = z.object({
  courseName: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  priority: z.enum(["obligatoire", "recommandee", "optionnelle"]),
  source: z.enum(["manual", "ai_recommendation", "incident_derived", "compliance"]),
  mandatory: z.boolean(),
  duration: z.number().min(1, "La durée doit être d'au moins 1 minute"),
  dueDate: z.string().min(1, "La date limite est requise"),
  contentUrl: z.string().url("URL invalide").optional().or(z.literal("")),
});

type TrainingFormValues = z.infer<typeof trainingFormSchema>;

export function TrainingForm({ training, isOpen, onClose, linkedCapaId }: TrainingFormProps) {
  const { mutate: createTraining, isPending: isCreating } = useCreateTrainingPlan();
  const { mutate: updateTraining, isPending: isUpdating } = useUpdateTrainingPlan();
  const isEditing = !!training;
  const isPending = isCreating || isUpdating;

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: training
      ? {
        courseName: training.courseName,
        description: training.description,
        category: training.category || "general",
        priority: training.priority,
        source: training.source,
        mandatory: training.mandatory,
        duration: training.duration,
        dueDate: training.dueDate.toDate().toISOString().split("T")[0],
        contentUrl: training.contentUrl || "",
      }
      : {
        courseName: "",
        description: "",
        category: "safety",
        priority: "recommandee",
        source: linkedCapaId ? "incident_derived" : "manual",
        mandatory: false,
        duration: 30,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        contentUrl: "",
      },
  });

  const handleSubmit = async (values: TrainingFormValues) => {
    const now = Timestamp.now();

    // Build training data with proper typing
    const baseData = {
      courseId: training?.courseId || `course-${Date.now()}`,
      courseName: values.courseName,
      description: values.description,
      category: values.category,
      priority: values.priority,
      source: values.source,
      mandatory: values.mandatory,
      duration: values.duration,
      dueDate: Timestamp.fromDate(new Date(values.dueDate)),
      availableFrom: training?.availableFrom || now,
      departmentIds: training?.departmentIds || [],
      assignedEmployees: training?.assignedEmployees || [],
    };

    // Build optional fields separately to avoid undefined values
    const optionalFields: {
      linkedActionPlanId?: string;
      contentUrl?: string;
    } = {};

    if (linkedCapaId) {
      optionalFields.linkedActionPlanId = linkedCapaId;
    } else if (training?.linkedActionPlanId) {
      optionalFields.linkedActionPlanId = training.linkedActionPlanId;
    }

    if (values.contentUrl && values.contentUrl.trim() !== "") {
      optionalFields.contentUrl = values.contentUrl.trim();
    }

    // Merge data, filtering out undefined values
    const trainingData = {
      ...baseData,
      ...Object.fromEntries(
        Object.entries(optionalFields).filter(([, v]) => v !== undefined)
      ),
    };

    if (isEditing && training) {
      updateTraining(
        { planId: training.id, data: trainingData },
        {
          onSuccess: () => {
            toast.success("Formation mise à jour");
            onClose();
          },
          onError: (error) => {
            toast.error("Erreur", { description: error.message });
          },
        }
      );
    } else {
      createTraining(trainingData, {
        onSuccess: () => {
          toast.success("Formation créée");
          onClose();
        },
        onError: (error) => {
          toast.error("Erreur", { description: error.message });
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {isEditing ? "Modifier la formation" : "Créer une formation"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Mettez à jour les informations de la formation"
              : "Créez un nouveau plan de formation pour vos collaborateurs"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la formation *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Sécurité incendie niveau 1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Décrivez le contenu et les objectifs de la formation..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="obligatoire">Obligatoire</SelectItem>
                        <SelectItem value="recommandee">Recommandée</SelectItem>
                        <SelectItem value="optionnelle">Optionnelle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manuelle</SelectItem>
                        <SelectItem value="ai_recommendation">Recommandation IA</SelectItem>
                        <SelectItem value="incident_derived">Issue d'incident</SelectItem>
                        <SelectItem value="compliance">Conformité</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="safety">Sécurité</SelectItem>
                      <SelectItem value="quality">Qualité</SelectItem>
                      <SelectItem value="environment">Environnement</SelectItem>
                      <SelectItem value="fire">Incendie</SelectItem>
                      <SelectItem value="first_aid">Premiers secours</SelectItem>
                      <SelectItem value="ergonomics">Ergonomie</SelectItem>
                      <SelectItem value="general">Général</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
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
                    <FormLabel>Date limite *</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL du contenu (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://exemple.com/formation"
                    />
                  </FormControl>
                  <FormDescription>
                    Lien vers le matériel de formation (vidéo, document, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mandatory"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>Formation obligatoire</FormLabel>
                    <FormDescription>
                      Les employés doivent compléter cette formation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

