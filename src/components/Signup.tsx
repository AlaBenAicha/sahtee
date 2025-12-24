import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import sahteeLogoMain from "figma:asset/da3a2e0089c3ad8d081375417ace1d5ec5c73acd.png";

interface SignupProps {
  onNavigate?: (view: string) => void;
}

export function Signup({ onNavigate }: SignupProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
    sector: "",
    employeeCount: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    // Simuler l'inscription et rediriger vers le dashboard
    onNavigate?.('dashboard');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] px-4 py-8">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img
              src={sahteeLogoMain}
              alt="SAHTEE"
              className="h-16"
            />
          </div>
          <CardTitle className="text-[var(--sahtee-blue-primary)]">Créer votre compte SAHTEE</CardTitle>
          <CardDescription>
            Commencez votre transformation digitale en santé et sécurité au travail
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="ACME Industries"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  required
                  className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                  className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail professionnelle *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@entreprise.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Secteur d'activité *</Label>
                <Select value={formData.sector} onValueChange={(value: string) => handleChange('sector', value)} required>
                  <SelectTrigger className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]">
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturing">Industrie manufacturière</SelectItem>
                    <SelectItem value="food">Agroalimentaire</SelectItem>
                    <SelectItem value="healthcare">Santé</SelectItem>
                    <SelectItem value="construction">Construction / BTP</SelectItem>
                    <SelectItem value="logistics">Logistique</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Nombre d'employés *</Label>
                <Select value={formData.employeeCount} onValueChange={(value: string) => handleChange('employeeCount', value)} required>
                  <SelectTrigger className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]">
                    <SelectValue placeholder="Sélectionnez une tranche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employés</SelectItem>
                    <SelectItem value="11-50">11-50 employés</SelectItem>
                    <SelectItem value="51-200">51-200 employés</SelectItem>
                    <SelectItem value="201-500">201-500 employés</SelectItem>
                    <SelectItem value="500+">500+ employés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  minLength={8}
                  className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  minLength={8}
                  className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                />
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 rounded border-gray-300 text-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                J'accepte les <span className="text-[var(--sahtee-blue-primary)] hover:underline">conditions générales d'utilisation</span> et la <span className="text-[var(--sahtee-blue-primary)] hover:underline">politique de confidentialité</span>
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white"
            >
              Créer mon compte
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Vous avez déjà un compte ? </span>
              <button
                type="button"
                onClick={() => onNavigate?.('login')}
                className="text-[var(--sahtee-blue-primary)] hover:text-[var(--sahtee-blue-secondary)] transition-colors"
              >
                Se connecter
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate?.('homepage')}
              className="text-sm text-gray-600 hover:text-[var(--sahtee-blue-primary)] transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
