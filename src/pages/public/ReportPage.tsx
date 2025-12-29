/**
 * Public Report Page
 * 
 * Public page for incident reporting via QR code scan.
 * No authentication required - anyone can report an incident.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import {
  AlertTriangle,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  QrCode,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useValidateQRCode, useRecordQRCodeScan } from "@/hooks/useQRCodes";
import { createIncident } from "@/services/incidentService";
import { linkScanToIncident } from "@/services/qrCodeService";
import type { IncidentSeverity } from "@/types/capa";

const reportFormSchema = z.object({
  type: z.enum(["accident", "near_miss", "unsafe_condition", "unsafe_act"]),
  severity: z.enum(["minor", "moderate", "severe", "critical"]),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  immediateActions: z.string().optional(),
  reporterName: z.string().min(2, "Votre nom est requis").optional().or(z.literal("")),
  reporterEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  isAnonymous: z.boolean(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

const typeOptions = [
  { value: "accident", label: "Accident", icon: "🚨" },
  { value: "near_miss", label: "Presqu'accident", icon: "⚠️" },
  { value: "unsafe_condition", label: "Condition dangereuse", icon: "🔧" },
  { value: "unsafe_act", label: "Acte dangereux", icon: "🚫" },
];

const severityOptions: { value: IncidentSeverity; label: string; color: string }[] = [
  { value: "minor", label: "Mineur", color: "bg-green-100 border-green-500 text-green-700" },
  { value: "moderate", label: "Modéré", color: "bg-yellow-100 border-yellow-500 text-yellow-700" },
  { value: "severe", label: "Grave", color: "bg-orange-100 border-orange-500 text-orange-700" },
  { value: "critical", label: "Critique", color: "bg-red-100 border-red-500 text-red-700" },
];

export default function ReportPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<"loading" | "form" | "success" | "error">("loading");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { data: validation, isLoading: isValidating } = useValidateQRCode(shortCode);
  const { mutate: recordScan } = useRecordQRCodeScan();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      type: "unsafe_condition",
      severity: "moderate",
      description: "",
      immediateActions: "",
      reporterName: "",
      reporterEmail: "",
      isAnonymous: false,
    },
  });

  // Validate QR code on mount
  useEffect(() => {
    if (isValidating) return;

    if (!validation?.valid || !validation.qrCode) {
      setErrorMessage(validation?.error || "QR code invalide");
      setStep("error");
      return;
    }

    // Record the scan
    recordScan(
      {
        qrCodeId: validation.qrCode.id,
        organizationId: validation.qrCode.organizationId,
        userAgent: navigator.userAgent,
      },
      {
        onSuccess: (scan) => {
          setScanId(scan.id);
          setStep("form");
        },
        onError: () => {
          // Continue even if scan recording fails
          setStep("form");
        },
      }
    );
  }, [validation, isValidating, recordScan]);

  const handleSubmit = async (values: ReportFormValues) => {
    if (!validation?.qrCode) return;

    setIsSubmitting(true);

    try {
      const incidentData = {
        organizationId: validation.qrCode.organizationId,
        type: values.type,
        severity: values.severity,
        description: values.description,
        location: validation.qrCode.locationName,
        siteId: validation.qrCode.siteId,
        departmentId: validation.qrCode.departmentId,
        reportedBy: "public",
        reportedAt: Timestamp.now(),
        immediateActions: values.immediateActions || "",
        reporterName: values.isAnonymous ? "Anonyme" : values.reporterName || "Non spécifié",
        reporterEmail: values.isAnonymous ? "" : values.reporterEmail || "",
        isAnonymous: values.isAnonymous,
        category: "general",
        status: "reported" as const,
        witnesses: [],
        affectedPersons: [],
        photos: [],
        documents: [],
        linkedCapaIds: [],
        qrCodeId: validation.qrCode.id,
        reportableToAuthorities: values.severity === "critical" || values.severity === "severe",
        reportedToAuthorities: false,
      };

      const incident = await createIncident(incidentData, "public");

      // Link scan to incident if we have a scan ID
      if (scanId) {
        try {
          await linkScanToIncident(scanId, incident.id);
        } catch (e) {
          console.error("Failed to link scan to incident:", e);
        }
      }

      setStep("success");
    } catch (error) {
      console.error("Error creating incident:", error);
      setErrorMessage("Une erreur est survenue lors de la soumission");
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 3;
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!form.watch("type") && !!form.watch("severity");
      case 2:
        return form.watch("description")?.length >= 10;
      case 3:
        return form.watch("isAnonymous") || (form.watch("reporterName")?.length ?? 0) >= 2;
      default:
        return false;
    }
  };

  // Loading state
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <QrCode className="h-16 w-16 text-primary animate-pulse mb-4" />
            <h2 className="text-xl font-semibold">Validation du QR code...</h2>
            <p className="text-muted-foreground mt-2">Veuillez patienter</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600">QR Code invalide</h2>
            <p className="text-muted-foreground mt-2">{errorMessage}</p>
            <Button variant="outline" className="mt-6" onClick={() => navigate("/")}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-secondary flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-primary">
              Signalement enregistré !
            </h2>
            <p className="text-muted-foreground mt-2">
              Merci pour votre signalement. L'équipe de sécurité a été notifiée.
            </p>
            {(form.watch("severity") === "severe" || form.watch("severity") === "critical") && (
              <Badge variant="outline" className="mt-4 text-orange-600 bg-orange-50">
                <Shield className="h-4 w-4 mr-1" />
                Un plan d'action a été automatiquement créé
              </Badge>
            )}
            <Button className="mt-6" onClick={() => window.close()}>
              Fermer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-lg p-2">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Signaler un incident</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {validation?.qrCode?.locationName}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Location Info */}
        {validation?.qrCode && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-lg text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{validation.qrCode.locationDescription}</span>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Étape {currentStep} sur {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
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
                          <FormLabel>Que souhaitez-vous signaler ?</FormLabel>
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
                                  "flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all",
                                  field.value === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`type-${option.value}`}
                                />
                                <span>{option.icon}</span>
                                <span className="text-sm">{option.label}</span>
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
                          <FormLabel>Niveau de gravité</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {severityOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  "p-3 border-2 rounded-lg text-center transition-all",
                                  option.color,
                                  field.value === option.value
                                    ? "ring-2 ring-offset-2 ring-current"
                                    : "border-transparent opacity-70 hover:opacity-100"
                                )}
                              >
                                <span className="font-medium text-sm">{option.label}</span>
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Description */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Décrivez ce que vous avez observé *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Que s'est-il passé ? Qui était impliqué ? Quand ?"
                              rows={5}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 10 caractères
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
                          <FormLabel>Actions immédiates prises (optionnel)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Avez-vous pris des mesures ?"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Reporter Info */}
                {currentStep === 3 && (
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
                            <FormLabel className="cursor-pointer">
                              Signalement anonyme
                            </FormLabel>
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
                              <FormLabel>Votre nom</FormLabel>
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
                                Pour recevoir les mises à jour
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Précédent
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!canProceed()}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting || !canProceed()}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer le signalement
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Powered by SAHTEE</p>
        </div>
      </div>
    </div>
  );
}

