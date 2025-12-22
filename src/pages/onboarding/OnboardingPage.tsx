/**
 * Onboarding Page - Multi-step wizard for new users/organizations
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

interface OnboardingData {
  // Step 1: Organization
  organizationName: string;
  industry: string;
  size: string;
  // Step 2: User Profile
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  phone: string;
  // Step 3: Preferences
  safetyModules: string[];
  language: string;
  notifications: boolean;
}

const industries = [
  { value: "manufacturing", label: "Industrie manufacturière" },
  { value: "construction", label: "Construction / BTP" },
  { value: "oil_gas", label: "Pétrole & Gaz" },
  { value: "mining", label: "Mines & Carrières" },
  { value: "chemicals", label: "Chimie & Pétrochimie" },
  { value: "food", label: "Agroalimentaire" },
  { value: "pharma", label: "Pharmaceutique" },
  { value: "logistics", label: "Logistique & Transport" },
  { value: "other", label: "Autre" },
];

const companySizes = [
  { value: "1-10", label: "1-10 employés" },
  { value: "11-50", label: "11-50 employés" },
  { value: "51-200", label: "51-200 employés" },
  { value: "201-500", label: "201-500 employés" },
  { value: "500+", label: "500+ employés" },
];

const safetyModules = [
  { id: "incidents", label: "Gestion des incidents", description: "Déclaration et suivi des incidents" },
  { id: "capa", label: "CAPA", description: "Actions correctives et préventives" },
  { id: "training", label: "Formations", description: "Planification des formations SST" },
  { id: "compliance", label: "Conformité", description: "Audits et vérifications" },
  { id: "health", label: "Santé au travail", description: "Suivi médical" },
  { id: "analytics", label: "Analytiques", description: "Tableaux de bord et rapports" },
];

const steps = [
  { id: 1, title: "Organisation", icon: Building2 },
  { id: 2, title: "Profil", icon: Users },
  { id: 3, title: "Préférences", icon: Shield },
  { id: 4, title: "Terminé", icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    organizationName: "",
    industry: "",
    size: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    department: "",
    phone: "",
    safetyModules: ["incidents", "capa", "training"],
    language: "fr",
    notifications: true,
  });

  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Pre-fill user data if available
  React.useEffect(() => {
    if (userProfile) {
      setData(prev => ({
        ...prev,
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        jobTitle: userProfile.jobTitle || "",
        department: userProfile.department || "",
        phone: userProfile.phone || "",
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
    setIsLoading(true);
    try {
      // TODO: Save onboarding data to Firestore
      // await saveOnboardingData(user.uid, data);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      navigate("/app/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
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
                <Building2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Votre organisation</h2>
              <p className="text-slate-500 mt-2">Commençons par configurer votre entreprise</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="organizationName">Nom de l'entreprise *</Label>
                <Input
                  id="organizationName"
                  placeholder="Ex: Algérie Industries SARL"
                  value={data.organizationName}
                  onChange={(e) => updateData("organizationName", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="industry">Secteur d'activité *</Label>
                <Select value={data.industry} onValueChange={(v) => updateData("industry", v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Sélectionnez votre secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size">Taille de l'entreprise *</Label>
                <Select value={data.size} onValueChange={(v) => updateData("size", v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Nombre d'employés" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Votre profil</h2>
              <p className="text-slate-500 mt-2">Quelques informations sur vous</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Ahmed"
                    value={data.firstName}
                    onChange={(e) => updateData("firstName", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    placeholder="Ben Ali"
                    value={data.lastName}
                    onChange={(e) => updateData("lastName", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="jobTitle">Fonction</Label>
                <Input
                  id="jobTitle"
                  placeholder="Ex: Responsable HSE"
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

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+213 xxx xxx xxx"
                  value={data.phone}
                  onChange={(e) => updateData("phone", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 3:
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

      case 4:
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
                <li><span className="text-slate-400">Organisation :</span> {data.organizationName}</li>
                <li><span className="text-slate-400">Secteur :</span> {industries.find(i => i.value === data.industry)?.label}</li>
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
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="border-b">
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

        <CardContent className="pt-8 pb-6">
          {renderStep()}
        </CardContent>

        {/* Navigation Buttons */}
        <div className="border-t px-6 py-4 flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={currentStep === 1 ? "invisible" : ""}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              className="bg-emerald-500 hover:bg-emerald-600"
              disabled={
                (currentStep === 1 && (!data.organizationName || !data.industry || !data.size)) ||
                (currentStep === 2 && (!data.firstName || !data.lastName))
              }
            >
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-emerald-500 hover:bg-emerald-600"
              disabled={isLoading}
            >
              {isLoading ? (
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
          )}
        </div>
      </Card>
    </div>
  );
}

