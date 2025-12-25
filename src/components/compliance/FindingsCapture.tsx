/**
 * Findings Capture Component
 * 
 * Component for adding and managing audit findings.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus,
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  ThumbsUp,
  ChevronDown,
  ChevronRight,
  Link2,
  CalendarIcon,
  Loader2,
  X,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
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
import { useAddFinding } from "@/hooks/useCompliance";
import type { Finding, FindingCategory, FindingSeverity, FindingStatus } from "@/types/conformity";
import { cn } from "@/lib/utils";

interface FindingsCaptureProps {
  auditId: string;
  findings: Finding[];
  canEdit: boolean;
  onFindingAdded?: () => void;
  onCreateCapa?: (finding: Finding, auditId: string) => void;
}

const findingFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  category: z.enum([
    "major_nonconformity",
    "minor_nonconformity",
    "observation",
    "opportunity_for_improvement",
    "positive_finding"
  ], { required_error: "Veuillez sélectionner une catégorie" }),
  severity: z.enum(["critical", "major", "minor", "observation"], {
    required_error: "Veuillez sélectionner une gravité",
  }),
  requirement: z.string().optional(),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  objectiveEvidence: z.string().min(10, "La preuve objective doit contenir au moins 10 caractères"),
  location: z.string().optional(),
  responseDueDate: z.date().optional(),
});

type FindingFormValues = z.infer<typeof findingFormSchema>;

const CATEGORY_CONFIG: Record<FindingCategory, { label: string; color: string; icon: React.ReactNode }> = {
  major_nonconformity: {
    label: "Non-conformité majeure",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  minor_nonconformity: {
    label: "Non-conformité mineure",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  observation: {
    label: "Observation",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <Info className="h-4 w-4" />,
  },
  opportunity_for_improvement: {
    label: "Piste d'amélioration",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <Lightbulb className="h-4 w-4" />,
  },
  positive_finding: {
    label: "Point fort",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    icon: <ThumbsUp className="h-4 w-4" />,
  },
};

const SEVERITY_OPTIONS: Array<{ value: FindingSeverity; label: string }> = [
  { value: "critical", label: "Critique" },
  { value: "major", label: "Majeure" },
  { value: "minor", label: "Mineure" },
  { value: "observation", label: "Observation" },
];

const STATUS_LABELS: Record<FindingStatus, string> = {
  open: "Ouvert",
  response_pending: "Réponse attendue",
  response_submitted: "Réponse soumise",
  verification_pending: "Vérification en cours",
  closed: "Clôturé",
  closed_effective: "Clôturé - Efficace",
  closed_ineffective: "Clôturé - Inefficace",
};

export function FindingsCapture({
  auditId,
  findings,
  canEdit,
  onFindingAdded,
  onCreateCapa,
}: FindingsCaptureProps) {
  const [showForm, setShowForm] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  
  const addFinding = useAddFinding();

  const form = useForm<FindingFormValues>({
    resolver: zodResolver(findingFormSchema),
    defaultValues: {
      title: "",
      category: undefined,
      severity: undefined,
      requirement: "",
      description: "",
      objectiveEvidence: "",
      location: "",
      responseDueDate: undefined,
    },
  });

  const toggleFinding = (id: string) => {
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const onSubmit = async (values: FindingFormValues) => {
    try {
      await addFinding.mutateAsync({
        auditId,
        findingData: {
          organizationId: "", // Will be set by the service
          title: values.title,
          category: values.category,
          severity: values.severity,
          requirement: values.requirement,
          description: values.description,
          objectiveEvidence: values.objectiveEvidence,
          location: values.location,
          status: "open" as FindingStatus,
          responseDueDate: values.responseDueDate 
            ? Timestamp.fromDate(values.responseDueDate) 
            : undefined,
          verificationRequired: values.category.includes("nonconformity"),
          evidence: [],
        },
      });

      form.reset();
      setShowForm(false);
      onFindingAdded?.();
    } catch (error) {
      console.error("Failed to add finding:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Finding Button */}
      {canEdit && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "ghost" : "default"}
            size="sm"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un écart
              </>
            )}
          </Button>
        </div>
      )}

      {/* Add Finding Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre du constat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category and Severity */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CATEGORY_CONFIG).map(([value, config]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  {config.icon}
                                  {config.label}
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
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gravité</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SEVERITY_OPTIONS.map((option) => (
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

                {/* Requirement and Location */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requirement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exigence / Clause</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 6.1.2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <FormControl>
                          <Input placeholder="Service / Zone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description du constat</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez le constat en détail..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Objective Evidence */}
                <FormField
                  control={form.control}
                  name="objectiveEvidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preuve objective</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez les preuves observées..."
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Response Due Date */}
                <FormField
                  control={form.control}
                  name="responseDueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date limite de réponse</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full sm:w-[280px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
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
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      form.reset();
                      setShowForm(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={addFinding.isPending}>
                    {addFinding.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer le constat"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Findings List */}
      {findings.length === 0 && !showForm ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Aucun écart enregistré</p>
          {canEdit && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le premier écart
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {findings.map((finding) => {
            const isExpanded = expandedFindings.has(finding.id);
            const categoryConfig = CATEGORY_CONFIG[finding.category];

            return (
              <Collapsible
                key={finding.id}
                open={isExpanded}
                onOpenChange={() => toggleFinding(finding.id)}
              >
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Badge className={cn("gap-1", categoryConfig.color)}>
                          {categoryConfig.icon}
                          {categoryConfig.label}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{finding.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {finding.reference}
                            {finding.requirement && ` • Clause ${finding.requirement}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {finding.linkedCapaId && (
                          <Badge variant="outline" className="text-xs">
                            <Link2 className="h-3 w-3 mr-1" />
                            CAPA liée
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {STATUS_LABELS[finding.status]}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-3 pb-3 pt-2 border-t space-y-3">
                      <div>
                        <p className="text-xs font-medium mb-1">Description</p>
                        <p className="text-sm text-muted-foreground">{finding.description}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1">Preuve objective</p>
                        <p className="text-sm text-muted-foreground">{finding.objectiveEvidence}</p>
                      </div>
                      {finding.location && (
                        <div>
                          <p className="text-xs font-medium mb-1">Localisation</p>
                          <p className="text-sm text-muted-foreground">{finding.location}</p>
                        </div>
                      )}
                      
                      {/* Actions */}
                      {canEdit && !finding.linkedCapaId && finding.category.includes("nonconformity") && (
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCreateCapa?.(finding, auditId)}
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            Créer une CAPA
                          </Button>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}

