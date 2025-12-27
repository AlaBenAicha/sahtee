/**
 * Compliance Page - Conformity Room
 * 
 * Main page for regulatory compliance management including:
 * - Compliance status overview with KPIs
 * - Regulatory library (norms/standards)
 * - Audit management
 * - Conformity-AI analysis
 */

import { useState, useCallback } from "react";
import { Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Compliance Components
import {
  ComplianceStatusTiles,
  ComplianceCharts,
  NormLibrary,
  NormDetailModal,
  AuditBoard,
  AuditForm,
  AuditDetailModal,
  ConformityAIPanel,
} from "@/components/compliance";

// Hooks
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import { useUpdateRequirement, useCreateCAPAFromFinding } from "@/hooks/useCompliance";

// Types
import type { NormWithRequirements, NormRequirement, Audit, Finding } from "@/types/conformity";

export default function CompliancePage() {
  const { canCreate, canUpdate } = useFeaturePermissions("compliance");

  // State for modals
  const [selectedNorm, setSelectedNorm] = useState<NormWithRequirements | null>(null);
  const [normModalOpen, setNormModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditFormOpen, setAuditFormOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [normForAudit, setNormForAudit] = useState<NormWithRequirements | null>(null);

  // Mutations
  const updateRequirement = useUpdateRequirement();
  const createCapaFromFinding = useCreateCAPAFromFinding();

  // Handlers
  const handleNormClick = useCallback((norm: NormWithRequirements) => {
    setSelectedNorm(norm);
    setNormModalOpen(true);
  }, []);

  const handlePlanAuditFromNorm = useCallback((norm: NormWithRequirements) => {
    // Close norm modal and open audit form with norm framework pre-populated
    setNormModalOpen(false);
    setEditingAudit(null);
    setNormForAudit(norm);
    setAuditFormOpen(true);
  }, []);

  const handleRequirementUpdate = useCallback(
    async (normId: string, requirementId: string, data: Partial<NormRequirement>) => {
      try {
        await updateRequirement.mutateAsync({ normId, requirementId, data });
      } catch (error) {
        console.error("Failed to update requirement:", error);
      }
    },
    [updateRequirement]
  );

  const handleAuditClick = useCallback((audit: Audit) => {
    setSelectedAudit(audit);
    setAuditModalOpen(true);
  }, []);

  const handleCreateAudit = useCallback(() => {
    setEditingAudit(null);
    setAuditFormOpen(true);
  }, []);

  const handleCreateCapaFromFinding = useCallback(
    async (finding: Finding, auditId: string) => {
      try {
        await createCapaFromFinding.mutateAsync({ finding, auditId });
        // Optionally show a success toast
      } catch (error) {
        console.error("Failed to create CAPA from finding:", error);
      }
    },
    [createCapaFromFinding]
  );

  const handleAuditFormSuccess = useCallback(() => {
    setAuditFormOpen(false);
    setEditingAudit(null);
    setNormForAudit(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-600" />
            Conformité
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez la conformité réglementaire, les audits et les plans d'action
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canCreate}
                  onClick={handleCreateAudit}
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

      {/* KPI Tiles */}
      <ComplianceStatusTiles />

      {/* Main Tabs */}
      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="status">Statut Conformité</TabsTrigger>
          <TabsTrigger value="norms">Bibliothèque</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="ai">Conformity-AI</TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-6 mt-0">
          <ComplianceCharts />
        </TabsContent>

        {/* Norms Library Tab */}
        <TabsContent value="norms" className="mt-0">
          <NormLibrary
            onNormClick={handleNormClick}
            onAddNorm={() => {
              // For now, we don't have a norm creation form
              // This would open a modal to create custom norms
            }}
          />
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits" className="mt-0">
          <AuditBoard
            onAuditClick={handleAuditClick}
            onCreateAudit={handleCreateAudit}
          />
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="mt-0">
          <ConformityAIPanel />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NormDetailModal
        norm={selectedNorm}
        open={normModalOpen}
        onOpenChange={setNormModalOpen}
        onPlanAudit={handlePlanAuditFromNorm}
        onRequirementUpdate={canUpdate ? handleRequirementUpdate : undefined}
      />

      <AuditDetailModal
        audit={selectedAudit}
        open={auditModalOpen}
        onOpenChange={setAuditModalOpen}
        onCreateCapa={handleCreateCapaFromFinding}
      />

      <AuditForm
        open={auditFormOpen}
        onOpenChange={(open) => {
          setAuditFormOpen(open);
          if (!open) {
            setNormForAudit(null);
          }
        }}
        audit={editingAudit}
        normFramework={normForAudit}
        onSuccess={handleAuditFormSuccess}
      />
    </div>
  );
}
