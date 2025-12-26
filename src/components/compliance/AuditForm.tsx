/**
 * Audit Form Component
 * 
 * Form for creating and editing audits with validation.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateAudit, useUpdateAudit } from "@/hooks/useCompliance";
import type { Audit, AuditType, RegulatoryFramework, AuditStatus } from "@/types/conformity";
import { cn } from "@/lib/utils";

const auditFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  type: z.enum(["internal", "external", "certification", "surveillance", "regulatory"], {
    required_error: "Veuillez sélectionner un type d'audit",
  }),
  framework: z.enum([
    "iso_45001", "iso_14001", "iso_9001", "ohsas_18001",
    "tunisian_labor", "cnam", "ancsep", "custom"
  ], {
    required_error: "Veuillez sélectionner un référentiel",
  }),
  scope: z.string().min(10, "Le périmètre doit contenir au moins 10 caractères"),
  plannedStartDate: z.date({ required_error: "La date de début est requise" }),
  plannedEndDate: z.date({ required_error: "La date de fin est requise" }),
  leadAuditorName: z.string().optional(),
}).refine(
  (data) => data.plannedEndDate >= data.plannedStartDate,
  {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["plannedEndDate"],
  }
);

type AuditFormValues = z.infer<typeof auditFormSchema>;

interface AuditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audit?: Audit | null;
  onSuccess?: () => void;
}

const TYPE_OPTIONS: Array<{ value: AuditType; label: string }> = [
  { value: "internal", label: "Audit interne" },
  { value: "external", label: "Audit externe" },
  { value: "certification", label: "Audit de certification" },
  { value: "surveillance", label: "Audit de surveillance" },
  { value: "regulatory", label: "Audit réglementaire" },
];

const FRAMEWORK_OPTIONS: Array<{ value: RegulatoryFramework; label: string }> = [
  { value: "iso_45001", label: "ISO 45001 - SST" },
  { value: "iso_14001", label: "ISO 14001 - Environnement" },
  { value: "iso_9001", label: "ISO 9001 - Qualité" },
  { value: "tunisian_labor", label: "Code du Travail Tunisien" },
  { value: "cnam", label: "CNAM" },
  { value: "ancsep", label: "ANCSEP" },
  { value: "custom", label: "Personnalisé" },
];

export function AuditForm({ open, onOpenChange, audit, onSuccess }: AuditFormProps) {
  const isEditing = !!audit;
  
  const createAudit = useCreateAudit();
  const updateAudit = useUpdateAudit();
  
  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      title: "",
      type: undefined,
      framework: undefined,
      scope: "",
      plannedStartDate: undefined,
      plannedEndDate: undefined,
      leadAuditorName: "",
    },
  });

  // Reset form when dialog opens/closes or audit changes
  useEffect(() => {
    if (open) {
      if (audit) {
        form.reset({
          title: audit.title,
          type: audit.type,
          framework: audit.framework,
          scope: audit.scope,
          plannedStartDate: audit.plannedStartDate.toDate(),
          plannedEndDate: audit.plannedEndDate.toDate(),
          leadAuditorName: audit.leadAuditorName || "",
        });
      } else {
        form.reset({
          title: "",
          type: undefined,
          framework: undefined,
          scope: "",
          plannedStartDate: undefined,
          plannedEndDate: undefined,
          leadAuditorName: "",
        });
      }
    }
  }, [open, audit, form]);

  const onSubmit = async (values: AuditFormValues) => {
    try {
      const auditData = {
        title: values.title,
        type: values.type,
        framework: values.framework,
        scope: values.scope,
        plannedStartDate: Timestamp.fromDate(values.plannedStartDate),
        plannedEndDate: Timestamp.fromDate(values.plannedEndDate),
        leadAuditorName: values.leadAuditorName || undefined,
        auditors: [],
        auditeeIds: [],
        documents: [],
        status: "planned" as AuditStatus,
      };

      if (isEditing && audit) {
        await updateAudit.mutateAsync({
          auditId: audit.id,
          data: auditData,
        });
      } else {
        await createAudit.mutateAsync(auditData);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save audit:", error);
    }
  };

  const isSubmitting = createAudit.isPending || updateAudit.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'audit" : "Planifier un nouvel audit"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'audit</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Audit ISO 45001 - Site principal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type and Framework */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'audit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="framework"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référentiel</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FRAMEWORK_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Scope */}
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Périmètre</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le périmètre de l'audit (sites, processus, services concernés...)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plannedStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
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
                            {field.value ? (
                              format(field.value, "dd MMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={fr}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de fin</FormLabel>
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
                            {field.value ? (
                              format(field.value, "dd MMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={fr}
                          disabled={(date) => {
                            const startDate = form.getValues("plannedStartDate");
                            return date < (startDate || new Date());
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Lead Auditor */}
            <FormField
              control={form.control}
              name="leadAuditorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auditeur principal</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom de l'auditeur principal"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optionnel - Peut être défini ultérieurement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : isEditing ? (
                  "Enregistrer"
                ) : (
                  "Créer l'audit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

