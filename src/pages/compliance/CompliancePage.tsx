/**
 * Compliance Page - Placeholder
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus } from "lucide-react";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CompliancePage() {
  const { canCreate } = useFeaturePermissions("compliance");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Conformité</h1>
          <p className="text-slate-600 mt-1">Gérez les audits et vérifications de conformité</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canCreate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvel audit
                </Button>
              </span>
            </TooltipTrigger>
            {!canCreate && (
              <TooltipContent>
                <p>Vous n'avez pas la permission de créer des audits</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Audits de conformité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <CheckCircle2 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Module en développement</h3>
            <p className="text-slate-500 mt-2 max-w-md">
              Le module de conformité sera disponible dans une prochaine version.
              Vous pourrez planifier des audits et suivre les non-conformités.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

