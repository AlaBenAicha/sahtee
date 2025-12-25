/**
 * CAPA Page - Corrective and Preventive Actions
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileWarning, Plus } from "lucide-react";

export default function CAPAPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CAPA</h1>
          <p className="text-slate-600 mt-1">Actions Correctives et Préventives</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle action
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5" />
            Gestion des actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <FileWarning className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Module en développement</h3>
            <p className="text-slate-500 mt-2 max-w-md">
              Le module CAPA sera disponible dans une prochaine version.
              Vous pourrez créer et suivre les plans d'action correctifs et préventifs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

