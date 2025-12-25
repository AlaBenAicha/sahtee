/**
 * Verify Email Page - SAHTEE branded
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle2, RefreshCw, LogOut } from "lucide-react";
import sahteeLogoMain from "figma:asset/da3a2e0089c3ad8d081375417ace1d5ec5c73acd.png";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, sendVerificationEmail, signOut, isEmailVerified } = useAuth();
  const navigate = useNavigate();

  // Redirect if email is already verified
  React.useEffect(() => {
    if (isEmailVerified) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isEmailVerified, navigate]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError(null);
    setResent(false);

    try {
      await sendVerificationEmail();
      setResent(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleRefresh = () => {
    window.location.reload();
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
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-100 p-4">
              <Mail className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[var(--sahtee-blue-primary)]">Vérifiez votre email</h2>
          <p className="text-gray-600">
            Un email de vérification a été envoyé à{" "}
            <span className="font-medium">{user?.email}</span>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resent && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Email envoyé avec succès !
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 text-sm text-gray-600">
            <p>Veuillez cliquer sur le lien dans l'email pour activer votre compte.</p>
            <p>Si vous n'avez pas reçu l'email, vérifiez votre dossier spam ou cliquez sur le bouton ci-dessous.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Renvoyer l'email
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleRefresh}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              J'ai vérifié mon email
            </Button>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full text-gray-600 hover:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
