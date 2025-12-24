/**
 * 403 Access Denied Page
 * Displayed when a user attempts to access a feature they don't have permission for
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, ShieldX, Mail } from "lucide-react";

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/30">
            <ShieldX className="h-12 w-12" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">Accès refusé</h1>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/app/dashboard">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Home className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Page précédente
          </Button>
        </div>

        <div className="mt-12 text-slate-500 text-sm">
          <p>Besoin d'aide ?</p>
          <a 
            href="mailto:support@sahtee.com" 
            className="text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            Contactez le support
          </a>
        </div>
      </div>
    </div>
  );
}

