/**
 * Optional Modules Component
 * Displays optional/future modules with "Coming Soon" status
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator,
  Armchair,
  FileBarChart,
  Cpu,
  Smartphone,
  Sparkles,
  Mail,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionalModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  status: "coming_soon" | "beta" | "available";
}

const OPTIONAL_MODULES: OptionalModule[] = [
  {
    id: "impact-calculator",
    name: "Impact Calculator",
    description:
      "Calculez l'impact environnemental de vos activités et suivez vos émissions carbone",
    icon: Calculator,
    features: [
      "Calcul d'empreinte carbone",
      "Suivi des émissions",
      "Rapports environnementaux",
      "Objectifs de réduction",
    ],
    status: "coming_soon",
  },
  {
    id: "ergolab",
    name: "Ergolab",
    description:
      "Outils d'évaluation ergonomique des postes de travail pour prévenir les TMS",
    icon: Armchair,
    features: [
      "Analyse posturale",
      "Évaluation des postes",
      "Recommandations personnalisées",
      "Suivi des améliorations",
    ],
    status: "coming_soon",
  },
  {
    id: "esgreport",
    name: "ESGreport",
    description:
      "Génération automatisée de rapports ESG conformes aux réglementations",
    icon: FileBarChart,
    features: [
      "Rapports CSRD",
      "Indicateurs ESG",
      "Tableaux de bord durabilité",
      "Export réglementaire",
    ],
    status: "coming_soon",
  },
  {
    id: "iot-analysis",
    name: "IOT-analysis",
    description:
      "Analyse des données capteurs IoT en temps réel pour la surveillance SST",
    icon: Cpu,
    features: [
      "Connexion capteurs",
      "Alertes en temps réel",
      "Analyse prédictive",
      "Tableaux de bord IoT",
    ],
    status: "coming_soon",
  },
  {
    id: "mobile-app",
    name: "Application Mobile",
    description:
      "Application native iOS et Android pour la déclaration d'incidents sur le terrain",
    icon: Smartphone,
    features: [
      "Déclaration mobile",
      "Scan QR codes",
      "Notifications push",
      "Mode hors-ligne",
    ],
    status: "coming_soon",
  },
];

export function OptionalModules() {
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<OptionalModule | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleContactClick = (module: OptionalModule) => {
    setSelectedModule(module);
    setContactOpen(true);
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      company: "",
      message: `Je suis intéressé(e) par le module "${module.name}".`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API
    console.log("Contact form submitted:", { module: selectedModule?.id, ...formData });
    setSubmitted(true);
  };

  const getStatusBadge = (status: OptionalModule["status"]) => {
    switch (status) {
      case "coming_soon":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Bientôt disponible
          </Badge>
        );
      case "beta":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
            Beta
          </Badge>
        );
      case "available":
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Disponible
          </Badge>
        );
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Modules Optionnels
          </CardTitle>
          <CardDescription>
            Modules supplémentaires pour étendre les capacités de votre plateforme SAHTEE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {OPTIONAL_MODULES.map((module) => (
              <div
                key={module.id}
                className={cn(
                  "relative rounded-lg border border-slate-200 p-4",
                  "bg-gradient-to-br from-slate-50 to-white",
                  "hover:border-slate-300 hover:shadow-sm transition-all"
                )}
              >
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(module.status)}
                </div>

                {/* Icon */}
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                  <module.icon className="h-6 w-6 text-emerald-600" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-slate-900 mb-1">{module.name}</h3>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {module.description}
                </p>

                {/* Features */}
                <ul className="text-xs text-slate-500 space-y-1 mb-4">
                  {module.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-emerald-500" />
                      {feature}
                    </li>
                  ))}
                  {module.features.length > 3 && (
                    <li className="text-slate-400">
                      +{module.features.length - 3} autres fonctionnalités
                    </li>
                  )}
                </ul>

                {/* Contact button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleContactClick(module)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Nous contacter
                </Button>
              </div>
            ))}
          </div>

          {/* Info note */}
          <p className="text-xs text-slate-500 mt-4 text-center">
            Ces modules sont en cours de développement. Contactez-nous pour être informé de leur disponibilité
            ou pour discuter de vos besoins spécifiques.
          </p>
        </CardContent>
      </Card>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedModule && <selectedModule.icon className="h-5 w-5 text-emerald-500" />}
              {submitted ? "Demande envoyée !" : `Intéressé par ${selectedModule?.name} ?`}
            </DialogTitle>
            <DialogDescription>
              {submitted
                ? "Nous avons bien reçu votre demande et vous recontacterons rapidement."
                : "Laissez-nous vos coordonnées et nous vous contacterons dès que le module sera disponible."}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center py-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-center text-slate-600">
                Merci pour votre intérêt !<br />
                Notre équipe vous contactera prochainement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean.dupont@entreprise.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nom de votre entreprise"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Décrivez vos besoins..."
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setContactOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                  Envoyer
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OptionalModules;
