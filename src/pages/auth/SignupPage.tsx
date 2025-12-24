/**
 * Signup Page - SAHTEE branded
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import sahteeLogoMain from "figma:asset/da3a2e0089c3ad8d081375417ace1d5ec5c73acd.png";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        companyName: "",
        fullName: "",
        email: "",
        phone: "",
        sector: "",
        employeeCount: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (formData.password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }

        if (!formData.acceptTerms) {
            setError("Vous devez accepter les conditions d'utilisation");
            return;
        }

        setIsLoading(true);

        try {
            // Split full name into first and last name
            const nameParts = formData.fullName.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            await signUp(formData.email, formData.password, {
                firstName,
                lastName,
                phone: formData.phone,
                organizationId: "", // Will be created during onboarding
                // Store signup organization data to skip onboarding step 1
                pendingOrganization: {
                    name: formData.companyName,
                    industry: formData.sector,
                    size: formData.employeeCount,
                },
            });

            setSuccess(true);

            // Redirect to onboarding after 2 seconds
            setTimeout(() => {
                navigate("/onboarding");
            }, 2000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
            if (errorMessage.includes("email-already-in-use")) {
                setError("Un compte existe déjà avec cet email");
            } else if (errorMessage.includes("weak-password")) {
                setError("Le mot de passe est trop faible");
            } else if (errorMessage.includes("invalid-email")) {
                setError("Adresse email invalide");
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] px-4">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="rounded-full bg-green-100 p-4">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--sahtee-blue-primary)]">Compte créé !</h2>
                            <p className="text-gray-600">
                                Un email de vérification a été envoyé à votre adresse.
                                Vous allez être redirigé vers la configuration de votre espace.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
                                    className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sector">Secteur d'activité *</Label>
                                <Select
                                    value={formData.sector}
                                    onValueChange={(value: string) => handleChange('sector', value)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]">
                                        <SelectValue placeholder="Sélectionnez un secteur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manufacturing">Industrie manufacturière</SelectItem>
                                        <SelectItem value="food">Agroalimentaire</SelectItem>
                                        <SelectItem value="healthcare">Santé</SelectItem>
                                        <SelectItem value="construction">Construction / BTP</SelectItem>
                                        <SelectItem value="logistics">Logistique</SelectItem>
                                        <SelectItem value="oil_gas">Pétrole & Gaz</SelectItem>
                                        <SelectItem value="mining">Mines & Carrières</SelectItem>
                                        <SelectItem value="chemicals">Chimie & Pétrochimie</SelectItem>
                                        <SelectItem value="services">Services</SelectItem>
                                        <SelectItem value="other">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employeeCount">Nombre d'employés *</Label>
                                <Select
                                    value={formData.employeeCount}
                                    onValueChange={(value: string) => handleChange('employeeCount', value)}
                                    disabled={isLoading}
                                >
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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
                                    className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                                />
                            </div>
                        </div>

                        <div className="flex items-start space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={formData.acceptTerms}
                                onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                                required
                                disabled={isLoading}
                                className="mt-1 rounded border-gray-300 text-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                            />
                            <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                                J'accepte les{" "}
                                <Link to="/terms" className="text-[var(--sahtee-blue-primary)] hover:underline">
                                    conditions générales d'utilisation
                                </Link>{" "}
                                et la{" "}
                                <Link to="/privacy" className="text-[var(--sahtee-blue-primary)] hover:underline">
                                    politique de confidentialité
                                </Link>
                            </Label>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création en cours...
                                </>
                            ) : (
                                "Créer mon compte"
                            )}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Vous avez déjà un compte ? </span>
                            <Link
                                to="/login"
                                className="text-[var(--sahtee-blue-primary)] hover:text-[var(--sahtee-blue-secondary)] transition-colors"
                            >
                                Se connecter
                            </Link>
                        </div>

                        <Link
                            to="/"
                            className="text-sm text-gray-600 hover:text-[var(--sahtee-blue-primary)] transition-colors"
                        >
                            ← Retour à l'accueil
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
