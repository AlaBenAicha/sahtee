/**
 * Norm Form Modal Component
 * 
 * Modal for creating norms:
 * - Import predefined norms (ISO 45001, ISO 14001, Tunisian Labor, CNAM)
 * - Create custom norms with user-defined requirements
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BookOpen,
  FileText,
  Loader2,
  Plus,
  Check,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useCreateNorm, useNorms } from "@/hooks/useCompliance";
import {
  getAvailableSeedFrameworks,
  getNormSeedByFramework,
} from "@/utils/normSeedData";
import type { RegulatoryFramework, NormRequirement } from "@/types/conformity";
import { cn } from "@/lib/utils";

interface NormFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Schema for custom norm creation
const customNormSchema = z.object({
  code: z.string().min(2, "Le code doit contenir au moins 2 caractères"),
  name: z.string().min(5, "Le nom doit contenir au moins 5 caractères"),
  description: z.string().optional(),
  framework: z.enum([
    "iso_45001", "iso_14001", "iso_9001", "ohsas_18001",
    "tunisian_labor", "cnam", "ancsep", "custom"
  ], {
    required_error: "Veuillez sélectionner un référentiel",
  }),
  category: z.string().min(2, "La catégorie est requise"),
});

type CustomNormValues = z.infer<typeof customNormSchema>;

const FRAMEWORK_OPTIONS: Array<{ value: RegulatoryFramework; label: string }> = [
  { value: "iso_45001", label: "ISO 45001 - SST" },
  { value: "iso_14001", label: "ISO 14001 - Environnement" },
  { value: "iso_9001", label: "ISO 9001 - Qualité" },
  { value: "ohsas_18001", label: "OHSAS 18001" },
  { value: "tunisian_labor", label: "Code du Travail Tunisien" },
  { value: "cnam", label: "CNAM" },
  { value: "ancsep", label: "ANCSEP" },
  { value: "custom", label: "Personnalisé" },
];

const FRAMEWORK_COLORS: Record<RegulatoryFramework, string> = {
  iso_45001: "bg-emerald-100 text-emerald-800 border-emerald-300",
  iso_14001: "bg-blue-100 text-blue-800 border-blue-300",
  iso_9001: "bg-purple-100 text-purple-800 border-purple-300",
  ohsas_18001: "bg-indigo-100 text-indigo-800 border-indigo-300",
  tunisian_labor: "bg-amber-100 text-amber-800 border-amber-300",
  cnam: "bg-red-100 text-red-800 border-red-300",
  ancsep: "bg-teal-100 text-teal-800 border-teal-300",
  custom: "bg-gray-100 text-gray-800 border-gray-300",
};

export function NormFormModal({ open, onOpenChange, onSuccess }: NormFormModalProps) {
  const [activeTab, setActiveTab] = useState<"import" | "custom">("import");
  const [selectedFrameworks, setSelectedFrameworks] = useState<RegulatoryFramework[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string[]>([]);

  const createNorm = useCreateNorm();
  const { data: existingNorms } = useNorms({});
  
  const availableFrameworks = getAvailableSeedFrameworks();

  // Check which frameworks are already imported
  const importedFrameworks = existingNorms?.map(n => n.framework) || [];

  const form = useForm<CustomNormValues>({
    resolver: zodResolver(customNormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      framework: undefined,
      category: "",
    },
  });

  const toggleFrameworkSelection = (framework: RegulatoryFramework) => {
    setSelectedFrameworks(prev => 
      prev.includes(framework)
        ? prev.filter(f => f !== framework)
        : [...prev, framework]
    );
    setImportError(null);
  };

  const handleImportNorms = async () => {
    if (selectedFrameworks.length === 0) {
      setImportError("Veuillez sélectionner au moins un référentiel à importer");
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportSuccess([]);

    try {
      const imported: string[] = [];

      for (const framework of selectedFrameworks) {
        const seedData = getNormSeedByFramework(framework);
        if (!seedData) continue;

        // Create a fresh copy of requirements with new IDs
        const requirements: NormRequirement[] = seedData.requirements.map(req => ({
          ...req,
          id: crypto.randomUUID(),
          evidence: [],
          linkedCapaIds: [],
        }));

        await createNorm.mutateAsync({
          code: seedData.code,
          name: seedData.name,
          description: seedData.description,
          framework: seedData.framework,
          category: seedData.category,
          status: seedData.status,
          complianceScore: 0,
          requirementIds: requirements.map(r => r.id),
          requirements,
          isActive: true,
          isCustom: false,
        });

        imported.push(seedData.code);
      }

      setImportSuccess(imported);
      setSelectedFrameworks([]);

      // Close after short delay to show success
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error("Failed to import norms:", error);
      setImportError("Une erreur est survenue lors de l'importation. Veuillez réessayer.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateCustomNorm = async (values: CustomNormValues) => {
    try {
      // Create an empty norm with no requirements (user will add them later)
      const requirements: NormRequirement[] = [];

      await createNorm.mutateAsync({
        code: values.code,
        name: values.name,
        description: values.description,
        framework: values.framework,
        category: values.category,
        status: "not_started",
        complianceScore: 0,
        requirementIds: [],
        requirements,
        isActive: true,
        isCustom: true,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create custom norm:", error);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setSelectedFrameworks([]);
      setImportError(null);
      setImportSuccess([]);
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Ajouter une norme
          </DialogTitle>
          <DialogDescription>
            Importez des normes prédéfinies ou créez une norme personnalisée
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "import" | "custom")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Importer
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Plus className="h-4 w-4" />
              Personnalisée
            </TabsTrigger>
          </TabsList>

          {/* Import Predefined Norms Tab */}
          <TabsContent value="import" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sélectionnez les référentiels à importer dans votre bibliothèque réglementaire.
                Chaque norme inclut ses exigences prédéfinies.
              </p>

              {importError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}

              {importSuccess.length > 0 && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Importation réussie : {importSuccess.join(", ")}
                  </AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-[300px] pr-4">
                <div className="grid gap-3">
                  {availableFrameworks.map((fw) => {
                    const isSelected = selectedFrameworks.includes(fw.framework);
                    const isImported = importedFrameworks.includes(fw.framework);

                    return (
                      <Card
                        key={fw.framework}
                        className={cn(
                          "cursor-pointer transition-all",
                          isImported && "opacity-50 cursor-not-allowed",
                          isSelected && !isImported && "ring-2 ring-emerald-500 border-emerald-500",
                          !isSelected && !isImported && "hover:border-emerald-300"
                        )}
                        onClick={() => !isImported && toggleFrameworkSelection(fw.framework)}
                      >
                        <CardHeader className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                  isSelected
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-gray-300"
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div>
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                  {fw.code}
                                  {isImported && (
                                    <Badge variant="outline" className="text-xs">
                                      Déjà importé
                                    </Badge>
                                  )}
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                  {fw.name}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs", FRAMEWORK_COLORS[fw.framework])}
                              >
                                {fw.requirementCount} exigences
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>

              {selectedFrameworks.length > 0 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    {selectedFrameworks.length} référentiel(s) sélectionné(s)
                  </p>
                  <div className="flex gap-2">
                    {selectedFrameworks.map(fw => (
                      <Badge key={fw} variant="secondary" className="text-xs">
                        {availableFrameworks.find(f => f.framework === fw)?.code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleDialogChange(false)}
                disabled={isImporting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleImportNorms}
                disabled={isImporting || selectedFrameworks.length === 0}
                className="gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importation...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Importer ({selectedFrameworks.length})
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Custom Norm Creation Tab */}
          <TabsContent value="custom" className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateCustomNorm)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Créez une norme personnalisée. Vous pourrez ajouter les exigences
                  depuis la page de détail de la norme.
                </p>

                {/* Code and Name */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: NRM-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nom de la norme</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Procédure interne de sécurité" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Framework and Category */}
                <div className="grid grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Sécurité au travail" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description de la norme et de son objectif..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optionnel - Une brève description de la norme
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Après création, vous pourrez ajouter des exigences à cette norme
                    depuis sa page de détail.
                  </AlertDescription>
                </Alert>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleDialogChange(false)}
                    disabled={createNorm.isPending}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createNorm.isPending} className="gap-2">
                    {createNorm.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Créer la norme
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

