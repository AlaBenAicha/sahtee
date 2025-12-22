/**
 * 404 Not Found Page
 */

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold text-4xl shadow-lg shadow-emerald-500/30">
            404
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">Page non trouvée</h1>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Page précédente
          </Button>
        </div>

        <div className="mt-12 text-slate-500 text-sm">
          <p>Besoin d'aide ?</p>
          <Link to="/support" className="text-emerald-400 hover:underline">
            Contactez le support
          </Link>
        </div>
      </div>
    </div>
  );
}

