/**
 * Health Alert Card Component
 * 
 * Displays a single health alert with actions.
 */

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  Biohazard,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAcknowledgeHealthAlert, useResolveHealthAlert } from "@/hooks/useHealth";
import type { HealthAlert, HealthAlertSeverity, HealthAlertType } from "@/types/health";

const SEVERITY_CONFIG: Record<HealthAlertSeverity, { label: string; color: string; icon: React.ElementType }> = {
  info: { label: "Info", color: "bg-secondary text-primary border-secondary", icon: Bell },
  warning: { label: "Attention", color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
  critical: { label: "Critique", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
};

const ALERT_TYPE_CONFIG: Record<HealthAlertType, { label: string; icon: React.ElementType }> = {
  exposure_threshold: { label: "Dépassement exposition", icon: Biohazard },
  visit_overdue: { label: "Visite en retard", icon: Calendar },
  trend_detected: { label: "Tendance détectée", icon: TrendingUp },
  outbreak: { label: "Foyer détecté", icon: AlertTriangle },
  fitness_change: { label: "Changement aptitude", icon: Users },
  restriction_expiry: { label: "Restriction expirant", icon: Clock },
};

interface HealthAlertCardProps {
  alert: HealthAlert;
  onViewDetails?: (alert: HealthAlert) => void;
  onCreateCapa?: (alert: HealthAlert) => void;
}

export function HealthAlertCard({
  alert,
  onViewDetails,
  onCreateCapa,
}: HealthAlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  
  const acknowledgeAlert = useAcknowledgeHealthAlert();
  const resolveAlert = useResolveHealthAlert();

  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const typeConfig = ALERT_TYPE_CONFIG[alert.type];
  const SeverityIcon = severityConfig.icon;
  const TypeIcon = typeConfig.icon;

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

  const isActive = alert.status === "active";
  const isAcknowledged = alert.status === "acknowledged";

  return (
    <Card
      className={cn(
        "border transition-all",
        isActive && alert.severity === "critical" && "border-red-300 shadow-md",
        isActive && alert.severity === "warning" && "border-amber-300",
        !isActive && "opacity-75"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "rounded-full p-2",
              alert.severity === "critical"
                ? "bg-red-100"
                : alert.severity === "warning"
                ? "bg-amber-100"
                : "bg-secondary"
            )}
          >
            <SeverityIcon
              className={cn(
                "h-5 w-5",
                alert.severity === "critical"
                  ? "text-red-600"
                  : alert.severity === "warning"
                  ? "text-amber-600"
                  : "text-primary"
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-slate-800 line-clamp-1">
                  {alert.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn("text-xs", severityConfig.color)}>
                    {severityConfig.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <TypeIcon className="h-3 w-3" />
                    {typeConfig.label}
                  </Badge>
                </div>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {formatDistanceToNow(alert.createdAt.toDate(), { addSuffix: true, locale: fr })}
              </span>
            </div>

            {/* Description */}
            <p className={cn("text-sm text-slate-600 mt-2", !expanded && "line-clamp-2")}>
              {alert.description}
            </p>

            {/* Expand toggle */}
            {alert.description.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-indigo-600 hover:underline mt-1 flex items-center gap-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Plus
                  </>
                )}
              </button>
            )}

            {/* Affected Info */}
            {(alert.affectedDepartments?.length || alert.affectedEmployeeCount) && (
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                {alert.affectedEmployeeCount && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {alert.affectedEmployeeCount} employé{alert.affectedEmployeeCount > 1 ? "s" : ""}
                  </span>
                )}
                {alert.affectedDepartments && alert.affectedDepartments.length > 0 && (
                  <span>
                    {alert.affectedDepartments.length} département{alert.affectedDepartments.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}

            {/* Resolution Form */}
            {showResolveForm && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Notes de résolution..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleResolve} disabled={resolveAlert.isPending}>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Confirmer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowResolveForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!showResolveForm && (
              <div className="flex items-center gap-2 mt-3">
                {isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAcknowledge}
                    disabled={acknowledgeAlert.isPending}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Accusé réception
                  </Button>
                )}
                {(isActive || isAcknowledged) && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowResolveForm(true)}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Résoudre
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCreateCapa?.(alert)}
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Créer CAPA
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetails?.(alert)}
                >
                  Détails
                </Button>
              </div>
            )}

            {/* Resolved Info */}
            {alert.status === "resolved" && (
              <div className="mt-3 rounded-lg border border-secondary bg-secondary p-2">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Résolue</span>
                </div>
                {alert.resolutionNotes && (
                  <p className="text-sm text-primary mt-1">{alert.resolutionNotes}</p>
                )}
                {alert.resolvedAt && (
                  <p className="text-xs text-primary mt-1">
                    {format(alert.resolvedAt.toDate(), "d MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                )}
              </div>
            )}

            {/* Linked CAPA */}
            {alert.linkedCapaId && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  <FileText className="mr-1 h-3 w-3" />
                  CAPA liée
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HealthAlertCard;

