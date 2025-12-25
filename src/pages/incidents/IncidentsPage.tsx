/**
 * Incidents Page - Placeholder
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus } from "lucide-react";

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Incidents</h1>
          <p className="text-slate-600 mt-1">Gérez et suivez les incidents de sécurité</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Déclarer un incident
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Liste des incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Module en développement</h3>
            <p className="text-slate-500 mt-2 max-w-md">
              Ce module sera disponible dans une prochaine version. 
              Vous pourrez déclarer, suivre et analyser les incidents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

