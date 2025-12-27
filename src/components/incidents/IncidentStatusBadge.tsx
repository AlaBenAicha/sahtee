/**
 * Incident Status Badge Component
 * 
 * Visual indicator for incident status and severity.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IncidentStatus, IncidentSeverity } from "@/types/capa";

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

interface IncidentSeverityBadgeProps {
  severity: IncidentSeverity;
  className?: string;
}

const statusConfig: Record<IncidentStatus, { label: string; color: string; bgColor: string }> = {
  reported: { label: "Signalé", color: "text-blue-700", bgColor: "bg-blue-100 dark:bg-blue-900/40" },
  acknowledged: { label: "Pris en compte", color: "text-indigo-700", bgColor: "bg-indigo-100 dark:bg-indigo-900/40" },
  investigating: { label: "En investigation", color: "text-amber-700", bgColor: "bg-amber-100 dark:bg-amber-900/40" },
  action_plan_created: { label: "CAPA créé", color: "text-purple-700", bgColor: "bg-purple-100 dark:bg-purple-900/40" },
  resolved: { label: "Résolu", color: "text-emerald-700", bgColor: "bg-emerald-100 dark:bg-emerald-900/40" },
  closed: { label: "Clôturé", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" },
};

const severityConfig: Record<IncidentSeverity, { label: string; color: string; bgColor: string }> = {
  minor: { label: "Mineur", color: "text-green-700", bgColor: "bg-green-100 dark:bg-green-900/40" },
  moderate: { label: "Modéré", color: "text-yellow-700", bgColor: "bg-yellow-100 dark:bg-yellow-900/40" },
  severe: { label: "Grave", color: "text-orange-700", bgColor: "bg-orange-100 dark:bg-orange-900/40" },
  critical: { label: "Critique", color: "text-red-700", bgColor: "bg-red-100 dark:bg-red-900/40" },
};

export function IncidentStatusBadge({ status, className }: IncidentStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(config.color, config.bgColor, className)}
    >
      {config.label}
    </Badge>
  );
}

export function IncidentSeverityBadge({ severity, className }: IncidentSeverityBadgeProps) {
  const config = severityConfig[severity];
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(config.color, config.bgColor, className)}
    >
      {config.label}
    </Badge>
  );
}

