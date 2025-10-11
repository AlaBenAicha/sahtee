import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import sahteeLogoMain from "figma:asset/da3a2e0089c3ad8d081375417ace1d5ec5c73acd.png";

interface LoginProps {
  onNavigate?: (view: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler la connexion et rediriger vers le dashboard
    onNavigate?.('dashboard');
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
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                className="border-gray-300 focus:border-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300 text-[var(--sahtee-blue-primary)] focus:ring-[var(--sahtee-blue-primary)]"
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>
              
              <button
                type="button"
                className="text-sm text-[var(--sahtee-blue-primary)] hover:text-[var(--sahtee-blue-secondary)] transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit"
              className="w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white"
            >
              Se connecter
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-gray-600">Vous n'avez pas de compte ? </span>
              <button
                type="button"
                onClick={() => onNavigate?.('signup')}
                className="text-[var(--sahtee-blue-primary)] hover:text-[var(--sahtee-blue-secondary)] transition-colors"
              >
                Créer un compte
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
