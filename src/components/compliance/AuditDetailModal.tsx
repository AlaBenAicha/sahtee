/**
 * Audit Detail Modal Component
 * 
 * Displays detailed audit information with tabs for:
 * - Overview
 * - Findings
 * - Summary
 * - Documents
 */

import { useState } from "react";
import {
  X,
  Calendar,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Plus,
  MapPin,
  Link2,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FindingsCapture } from "./FindingsCapture";
import { useStartAudit, useCompleteAudit, useCancelAudit } from "@/hooks/useCompliance";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import { calculateAuditSummary } from "@/services/complianceService";
import type { Audit, AuditStatus, Finding, AuditSummary } from "@/types/conformity";
import { cn } from "@/lib/utils";

interface AuditDetailModalProps {
  audit: Audit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFindingAdded?: () => void;
  onCreateCapa?: (finding: Finding, auditId: string) => void;
}

const STATUS_CONFIG: Record<AuditStatus, { label: string; color: string; icon: React.ReactNode }> = {
  planned: {
    label: "Planifié",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <Calendar className="h-4 w-4" />,
  },
  in_progress: {
    label: "En cours",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <PlayCircle className="h-4 w-4" />,
  },
  pending_report: {
    label: "Rapport en attente",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    icon: <FileText className="h-4 w-4" />,
  },
  completed: {
    label: "Terminé",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  cancelled: {
    label: "Annulé",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    icon: <XCircle className="h-4 w-4" />,
  },
};

const FRAMEWORK_LABELS: Record<string, string> = {
  iso_45001: "ISO 45001",
  iso_14001: "ISO 14001",
  iso_9001: "ISO 9001",
  tunisian_labor: "Code du Travail",
  cnam: "CNAM",
  ancsep: "ANCSEP",
  custom: "Personnalisé",
};

function formatDate(timestamp: { toDate: () => Date } | Date): string {
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function AuditDetailModal({
  audit,
  open,
  onOpenChange,
  onFindingAdded,
  onCreateCapa,
}: AuditDetailModalProps) {
  const { canUpdate } = useFeaturePermissions("compliance");
  const [showFindingsForm, setShowFindingsForm] = useState(false);
  
  const startAudit = useStartAudit();
  const completeAudit = useCompleteAudit();
  const cancelAudit = useCancelAudit();

  if (!audit) return null;

  const statusConfig = STATUS_CONFIG[audit.status];
  const calculatedSummary = calculateAuditSummary(audit.findings);

  const handleStartAudit = async () => {
    try {
      await startAudit.mutateAsync(audit.id);
    } catch (error) {
      console.error("Failed to start audit:", error);
    }
  };

  const handleCompleteAudit = async () => {
    try {
      const summary: AuditSummary = {
        ...calculatedSummary,
        overallConclusion: calculatedSummary.majorNonconformities > 0 ? "fail" 
          : calculatedSummary.minorNonconformities > 2 ? "conditional_pass" 
          : "pass",
        recommendations: [],
        strengths: [],
        areasForImprovement: [],
      };
      await completeAudit.mutateAsync({ auditId: audit.id, summary });
    } catch (error) {
      console.error("Failed to complete audit:", error);
    }
  };

  const handleCancelAudit = async () => {
    try {
      await cancelAudit.mutateAsync(audit.id);
    } catch (error) {
      console.error("Failed to cancel audit:", error);
    }
  };

  const isActionPending = startAudit.isPending || completeAudit.isPending || cancelAudit.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{audit.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {FRAMEWORK_LABELS[audit.framework]}
                </Badge>
                <Badge className={cn("gap-1", statusConfig.color)}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start h-12 bg-transparent p-0">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger 
                value="findings"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Écarts ({audit.findings.length})
              </TabsTrigger>
              <TabsTrigger 
                value="summary"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Synthèse
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Documents ({audit.documents.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[calc(90vh-200px)]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6 mt-0">
              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Date de début</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(audit.plannedStartDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Date de fin</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(audit.plannedEndDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Auditeur principal</p>
                  <p className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {audit.leadAuditorName || "Non défini"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Écarts détectés</p>
                  <p className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    {audit.findings.length}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Scope */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Périmètre
                </h3>
                <p className="text-sm text-muted-foreground">{audit.scope}</p>
              </div>

              {/* Auditors */}
              {audit.auditors.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Équipe d'audit
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {audit.auditors.map((auditor, index) => (
                        <Badge key={index} variant="secondary">
                          {auditor.name}
                          {auditor.role === "lead" && " (Lead)"}
                          {auditor.external && " - Externe"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              {canUpdate && (
                <>
                  <Separator />
                  <div className="flex gap-2">
                    {audit.status === "planned" && (
                      <>
                        <Button
                          onClick={handleStartAudit}
                          disabled={isActionPending}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Démarrer l'audit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleCancelAudit}
                          disabled={isActionPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                      </>
                    )}
                    {(audit.status === "in_progress" || audit.status === "pending_report") && (
                      <Button
                        onClick={handleCompleteAudit}
                        disabled={isActionPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Clôturer l'audit
                      </Button>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Findings Tab */}
            <TabsContent value="findings" className="p-6 mt-0">
              <FindingsCapture
                auditId={audit.id}
                findings={audit.findings}
                canEdit={canUpdate && audit.status !== "completed" && audit.status !== "cancelled"}
                onFindingAdded={onFindingAdded}
                onCreateCapa={onCreateCapa}
              />
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="p-6 space-y-6 mt-0">
              {/* Finding Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {calculatedSummary.majorNonconformities}
                    </p>
                    <p className="text-xs text-muted-foreground">NC Majeures</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {calculatedSummary.minorNonconformities}
                    </p>
                    <p className="text-xs text-muted-foreground">NC Mineures</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {calculatedSummary.observations}
                    </p>
                    <p className="text-xs text-muted-foreground">Observations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {calculatedSummary.opportunities}
                    </p>
                    <p className="text-xs text-muted-foreground">Pistes d'amélioration</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {calculatedSummary.positiveFindings}
                    </p>
                    <p className="text-xs text-muted-foreground">Points forts</p>
                  </CardContent>
                </Card>
              </div>

              {/* Conclusion */}
              {audit.summary && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Conclusion</h3>
                    <Badge
                      className={cn(
                        "text-sm",
                        audit.summary.overallConclusion === "pass"
                          ? "bg-emerald-100 text-emerald-800"
                          : audit.summary.overallConclusion === "conditional_pass"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {audit.summary.overallConclusion === "pass"
                        ? "Audit réussi"
                        : audit.summary.overallConclusion === "conditional_pass"
                        ? "Réussite conditionnelle"
                        : "Non conforme"}
                    </Badge>
                  </div>

                  {audit.summary.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Points forts</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {audit.summary.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {audit.summary.areasForImprovement.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Axes d'amélioration</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {audit.summary.areasForImprovement.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!audit.summary && audit.status !== "completed" && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>La synthèse sera disponible après la clôture de l'audit.</p>
                </div>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="p-6 mt-0">
              {audit.documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>Aucun document attaché</p>
                  {canUpdate && (
                    <Button variant="outline" className="mt-4" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un document
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {audit.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.size / 1024).toFixed(1)} Ko
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

