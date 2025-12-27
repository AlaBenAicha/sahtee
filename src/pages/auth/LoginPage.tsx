/**
 * Login Page - SAHTEE branded
 */

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import sahteeLogoMain from "figma:asset/da3a2e0089c3ad8d081375417ace1d5ec5c73acd.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from state or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/app/dashboard";

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      // Translate Firebase errors to French
      if (errorMessage.includes("invalid-credential")) {
        setError("Email ou mot de passe incorrect");
      } else if (errorMessage.includes("user-not-found")) {
        setError("Aucun compte associé à cet email");
      } else if (errorMessage.includes("wrong-password")) {
        setError("Mot de passe incorrect");
      } else if (errorMessage.includes("too-many-requests")) {
        setError("Trop de tentatives. Veuillez réessayer plus tard.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src={sahteeLogoMain}
              alt="SAHTEE"
              className="h-16"
            />
          </div>
          <CardTitle className="text-[var(--sahtee-blue-primary)]">Connexion à SAHTEE</CardTitle>
          <CardDescription>
            Accédez à votre plateforme de santé et sécurité au travail
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

            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>
              
              <Link
                to="/forgot-password"
                className="text-sm text-[var(--sahtee-blue-primary)] hover:text-[var(--sahtee-blue-secondary)] transition-colors"
              >
                Mot de passe oublié ?
              </Link>
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
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-gray-600">Vous n'avez pas de compte ? </span>
              <Link
                to="/signup"
                className="text-[var(--sahtee-blue-primary)] hover:text-[var(--sahtee-blue-secondary)] transition-colors"
              >
                Créer un compte
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
