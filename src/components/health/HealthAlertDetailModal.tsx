/**
 * Health Alert Detail Modal Component
 * 
 * Displays detailed information about a health alert with actions
 * to acknowledge, resolve, or create a CAPA from the alert.
 */

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  Biohazard,
  TrendingUp,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAcknowledgeHealthAlert,
  useResolveHealthAlert,
} from "@/hooks/useHealth";
import type { HealthAlert, HealthAlertSeverity, HealthAlertType } from "@/types/health";

const SEVERITY_CONFIG: Record<HealthAlertSeverity, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  info: { label: "Information", color: "text-blue-700", bgColor: "bg-blue-100", icon: Bell },
  warning: { label: "Attention", color: "text-amber-700", bgColor: "bg-amber-100", icon: AlertTriangle },
  critical: { label: "Critique", color: "text-red-700", bgColor: "bg-red-100", icon: AlertCircle },
};

const ALERT_TYPE_CONFIG: Record<HealthAlertType, { label: string; description: string; icon: React.ElementType }> = {
  exposure_threshold: { 
    label: "Dépassement d'exposition", 
    description: "Un niveau d'exposition a dépassé les limites réglementaires",
    icon: Biohazard 
  },
  visit_overdue: { 
    label: "Visite médicale en retard", 
    description: "Une visite médicale planifiée n'a pas été effectuée",
    icon: Calendar 
  },
  trend_detected: { 
    label: "Tendance détectée", 
    description: "L'IA a détecté une tendance préoccupante",
    icon: TrendingUp 
  },
  outbreak: { 
    label: "Foyer détecté", 
    description: "Un foyer de pathologie a été identifié",
    icon: AlertTriangle 
  },
  fitness_change: { 
    label: "Changement d'aptitude", 
    description: "Le statut d'aptitude d'un employé a changé",
    icon: Users 
  },
  restriction_expiry: { 
    label: "Restriction expirant", 
    description: "Une restriction médicale arrive à expiration",
    icon: Clock 
  },
};

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-red-100 text-red-700 border-red-200" },
  acknowledged: { label: "En cours de traitement", color: "bg-amber-100 text-amber-700 border-amber-200" },
  resolved: { label: "Résolue", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

interface HealthAlertDetailModalProps {
  alert: HealthAlert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCapa?: (alert: HealthAlert) => void;
}

export function HealthAlertDetailModal({
  alert,
  open,
  onOpenChange,
  onCreateCapa,
}: HealthAlertDetailModalProps) {
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const acknowledgeAlert = useAcknowledgeHealthAlert();
  const resolveAlert = useResolveHealthAlert();

  if (!alert) return null;

  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const typeConfig = ALERT_TYPE_CONFIG[alert.type];
  const statusConfig = STATUS_CONFIG[alert.status];
  const SeverityIcon = severityConfig.icon;
  const TypeIcon = typeConfig.icon;

  const isActive = alert.status === "active";
  const isAcknowledged = alert.status === "acknowledged";
  const isResolved = alert.status === "resolved";

  const handleAcknowledge = async () => {
    await acknowledgeAlert.mutateAsync(alert.id);
  };

  const handleResolve = async () => {
    await resolveAlert.mutateAsync({
      alertId: alert.id,
      resolutionNotes,
      linkedCapaId: undefined,
    });
    setShowResolveForm(false);
    setResolutionNotes("");
  };

  const handleCreateCapa = () => {
    onOpenChange(false);
    onCreateCapa?.(alert);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0", severityConfig.bgColor)}>
              <SeverityIcon className={cn("h-6 w-6", severityConfig.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg leading-tight">{alert.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <TypeIcon className="h-4 w-4" />
                {typeConfig.label}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto pr-4">
          <div className="space-y-6">
            {/* Status & Severity Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              <Badge className={cn(severityConfig.bgColor, severityConfig.color)}>
                {severityConfig.label}
              </Badge>
              <span className="text-xs text-slate-400 ml-auto">
                {formatDistanceToNow(alert.createdAt.toDate(), { addSuffix: true, locale: fr })}
              </span>
            </div>

            {/* Description */}
            <div className="rounded-lg border bg-slate-50 p-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Description</h4>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{alert.description}</p>
            </div>

            {/* Alert Type Info */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <TypeIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Type d'alerte</span>
              </div>
              <p className="text-sm text-slate-500">{typeConfig.description}</p>
            </div>

            {/* Affected Scope */}
            {(alert.affectedDepartments?.length || alert.affectedEmployeeCount || alert.siteId) && (
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Périmètre concerné</h4>
                <div className="grid grid-cols-2 gap-3">
                  {alert.affectedEmployeeCount && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{alert.affectedEmployeeCount}</p>
                        <p className="text-xs text-slate-500">Employé{alert.affectedEmployeeCount > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  )}
                  {alert.affectedDepartments && alert.affectedDepartments.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{alert.affectedDepartments.length}</p>
                        <p className="text-xs text-slate-500">Département{alert.affectedDepartments.length > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-700">Chronologie</h4>
              
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Alerte créée</p>
                  <p className="text-xs text-slate-500">
                    {format(alert.createdAt.toDate(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Acknowledged */}
              {alert.acknowledgedAt && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">Accusé de réception</p>
                    <p className="text-xs text-slate-500">
                      {format(alert.acknowledgedAt.toDate(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              )}

              {/* Resolved */}
              {alert.resolvedAt && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">Résolue</p>
                    <p className="text-xs text-slate-500">
                      {format(alert.resolvedAt.toDate(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                    {alert.resolutionNotes && (
                      <p className="text-sm text-slate-600 mt-1 bg-emerald-50 rounded p-2">
                        {alert.resolutionNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Linked CAPA */}
            {alert.linkedCapaId && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">
                    CAPA associée
                  </span>
                </div>
                <p className="text-xs text-indigo-600 mt-1">ID: {alert.linkedCapaId}</p>
              </div>
            )}

            {/* Resolution Form */}
            {showResolveForm && (
              <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div>
                  <Label htmlFor="resolution-notes" className="text-emerald-700">
                    Notes de résolution
                  </Label>
                  <Textarea
                    id="resolution-notes"
                    placeholder="Décrivez les actions prises pour résoudre cette alerte..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleResolve}
                    disabled={resolveAlert.isPending || !resolutionNotes.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {resolveAlert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmer la résolution
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowResolveForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!showResolveForm && !isResolved && (
              <div className="flex flex-wrap gap-2">
                {isActive && (
                  <Button
                    variant="outline"
                    onClick={handleAcknowledge}
                    disabled={acknowledgeAlert.isPending}
                  >
                    {acknowledgeAlert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Eye className="mr-2 h-4 w-4" />
                    Accusé de réception
                  </Button>
                )}
                
                {(isActive || isAcknowledged) && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowResolveForm(true)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Résoudre
                    </Button>
                    
                    <Button
                      onClick={handleCreateCapa}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Créer CAPA
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default HealthAlertDetailModal;

