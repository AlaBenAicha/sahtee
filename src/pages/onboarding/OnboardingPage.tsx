/**
 * Onboarding Page - Multi-step wizard for new users/organizations
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { completeOnboarding } from "@/services/organizationService";
import { updateUser } from "@/services/userService";
import { toast } from "sonner";
import {
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

interface OnboardingData {
  // Step 1: User Profile (job title and department - name already collected during signup)
  jobTitle: string;
  department: string;
  // Step 2: Preferences
  safetyModules: string[];
  language: string;
  notifications: boolean;
}

const safetyModules = [
  { id: "incidents", label: "Gestion des incidents", description: "Déclaration et suivi des incidents" },
  { id: "capa", label: "CAPA", description: "Actions correctives et préventives" },
  { id: "training", label: "Formations", description: "Planification des formations SST" },
  { id: "compliance", label: "Conformité", description: "Audits et vérifications" },
  { id: "health", label: "Santé au travail", description: "Suivi médical" },
  { id: "analytics", label: "Analytiques", description: "Tableaux de bord et rapports" },
];

const steps = [
  { id: 1, title: "Compléter le profil", icon: Users },
  { id: 2, title: "Préférences", icon: Shield },
  { id: 3, title: "Terminé", icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    jobTitle: "",
    department: "",
    safetyModules: ["incidents", "capa", "training"],
    language: "fr",
    notifications: true,
  });

  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Pre-fill user data from signup
  React.useEffect(() => {
    if (userProfile) {
      setData(prev => ({
        ...prev,
        jobTitle: userProfile.jobTitle || "",
        department: userProfile.department || "",
      }));
    }
  }, [userProfile]);

  const updateData = (field: keyof OnboardingData, value: string | string[] | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleModule = (moduleId: string) => {
    setData(prev => ({
      ...prev,
      safetyModules: prev.safetyModules.includes(moduleId)
        ? prev.safetyModules.filter(id => id !== moduleId)
        : [...prev.safetyModules, moduleId],
    }));
  };

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user || !userProfile?.organizationId) {
      toast.error("Erreur d'authentification");
      return;
    }

    setIsLoading(true);
    try {
      // Update user profile with onboarding data
      await updateUser(
        user.uid,
        {
          jobTitle: data.jobTitle,
          department: data.department,
          onboardingCompleted: true,
          preferences: {
            ...userProfile.preferences,
            notifications: {
              ...userProfile.preferences?.notifications,
              email: data.notifications,
            },
          },
        },
        user.uid
      );

      // Mark organization onboarding as complete
      await completeOnboarding(userProfile.organizationId, user.uid);

      toast.success("Configuration terminée !");
      navigate("/app/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Bienvenue, {userProfile?.firstName || ""}! 👋
              </h2>
              <p className="text-slate-500 mt-2">
                Complétez votre profil pour personnaliser votre expérience
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Fonction *</Label>
                <Input
                  id="jobTitle"
                  placeholder="Ex: Responsable HSE, Directeur Qualité"
                  value={data.jobTitle}
                  onChange={(e) => updateData("jobTitle", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="department">Département</Label>
                <Input
                  id="department"
                  placeholder="Ex: Hygiène, Sécurité, Environnement"
                  value={data.department}
                  onChange={(e) => updateData("department", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Vos préférences</h2>
              <p className="text-slate-500 mt-2">Personnalisez votre expérience SAHTEE</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base">Modules de sécurité</Label>
                <p className="text-sm text-slate-500 mb-4">Sélectionnez les modules que vous souhaitez utiliser</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {safetyModules.map((module) => (
                    <div
                      key={module.id}
                      onClick={() => toggleModule(module.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        data.safetyModules.includes(module.id)
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={data.safetyModules.includes(module.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{module.label}</p>
                          <p className="text-sm text-slate-500">{module.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">Notifications par email</p>
                  <p className="text-sm text-slate-500">Recevoir des alertes importantes</p>
                </div>
                <Checkbox
                  checked={data.notifications}
                  onCheckedChange={(checked) => updateData("notifications", !!checked)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Tout est prêt ! 🎉</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Votre espace SAHTEE est configuré. Vous pouvez maintenant commencer à gérer 
              la sécurité de votre organisation.
            </p>

            <div className="bg-slate-50 rounded-lg p-6 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-slate-900 mb-3">Résumé :</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><span className="text-slate-400">Utilisateur :</span> {userProfile?.firstName} {userProfile?.lastName}</li>
                <li><span className="text-slate-400">Fonction :</span> {data.jobTitle || "Non spécifiée"}</li>
                <li><span className="text-slate-400">Modules actifs :</span> {data.safetyModules.length}</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
                S
              </div>
              <span className="font-bold text-xl text-slate-900">SAHTEE</span>
            </div>
            <span className="text-sm text-slate-500">Étape {currentStep} sur {steps.length}</span>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2" />

          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.id < currentStep
                      ? "bg-emerald-500 text-white"
                      : step.id === currentStep
                      ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-500"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-8 pb-6 flex-1 overflow-y-auto">
          {renderStep()}
        </CardContent>

        {/* Navigation Buttons */}
        <CardFooter className="border-t flex justify-between flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={currentStep === 1 ? "invisible" : ""}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <Button
            onClick={currentStep < steps.length ? handleNext : handleComplete}
            className="!bg-emerald-500 hover:!bg-emerald-600 !text-white"
            disabled={
              (currentStep === 1 && !data.jobTitle) ||
              (currentStep === steps.length && isLoading)
            }
          >
            {currentStep < steps.length ? (
              <>
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finalisation...
              </>
            ) : (
              <>
                Accéder au tableau de bord
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

