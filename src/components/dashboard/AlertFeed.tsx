/**
 * Alert Feed Component
 * 
 * Real-time alert feed for the 360° Board.
 * Displays alerts with priority indicators, actions, and mark-read functionality.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  GraduationCap,
  Heart,
  Info,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardAlert, DashboardAlertType, DashboardAlertPriority } from "@/types/dashboard";

interface AlertFeedProps {
  alerts: DashboardAlert[];
  userId?: string;
  loading?: boolean;
  onMarkRead?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  onAlertClick?: (alert: DashboardAlert) => void;
  className?: string;
}

/**
 * Get icon for alert type
 */
function getAlertIcon(type: DashboardAlertType) {
  const icons: Record<DashboardAlertType, React.ElementType> = {
    incident: AlertTriangle,
    capa: CheckCircle,
    compliance: Shield,
    training: GraduationCap,
    health: Heart,
    system: Settings,
  };
  return icons[type] || Bell;
}

/**
 * Get priority colors
 */
function getPriorityStyles(priority: DashboardAlertPriority) {
  switch (priority) {
    case "critical":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "text-red-500",
        badge: "bg-red-100 text-red-700 border-red-200",
      };
    case "high":
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: "text-orange-500",
        badge: "bg-orange-100 text-orange-700 border-orange-200",
      };
    case "medium":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "text-amber-500",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
      };
    default:
      return {
        bg: "bg-slate-50",
        border: "border-slate-200",
        icon: "text-slate-500",
        badge: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

/**
 * Get alert type label in French
 */
function getTypeLabel(type: DashboardAlertType): string {
  const labels: Record<DashboardAlertType, string> = {
    incident: "Incident",
    capa: "CAPA",
    compliance: "Conformité",
    training: "Formation",
    health: "Santé",
    system: "Système",
  };
  return labels[type];
}

/**
 * Format relative time
 */
function formatRelativeTime(timestamp: { toDate: () => Date } | Date | null | undefined): string {
  if (!timestamp) {
    return "Date inconnue";
  }
  
  try {
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return "Date inconnue";
  }
}

/**
 * Individual Alert Item
 */
interface AlertItemProps {
  alert: DashboardAlert;
  userId?: string;
  onMarkRead?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  onClick?: () => void;
}

function AlertItem({ alert, userId, onMarkRead, onDismiss, onClick }: AlertItemProps) {
  const Icon = getAlertIcon(alert.type);
  const styles = getPriorityStyles(alert.priority);
  const isRead = userId ? alert.readBy.includes(userId) : false;

  return (
    <div
      className={cn(
        "relative p-3 rounded-lg border transition-all duration-150",
        styles.bg,
        styles.border,
        !isRead && "ring-2 ring-offset-1",
        !isRead && alert.priority === "critical" && "ring-red-300",
        !isRead && alert.priority === "high" && "ring-orange-300",
        !isRead && alert.priority === "medium" && "ring-amber-300",
        !isRead && alert.priority === "low" && "ring-slate-300",
        onClick && "cursor-pointer hover:shadow-sm"
      )}
      onClick={() => {
        if (onClick) onClick();
        if (!isRead && onMarkRead) onMarkRead(alert.id);
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("flex-shrink-0 mt-0.5", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn("text-xs", styles.badge)}>
              {getTypeLabel(alert.type)}
            </Badge>
            {alert.actionRequired && (
              <Badge variant="outline" className="text-xs bg-secondary text-primary border-secondary">
                Action requise
              </Badge>
            )}
          </div>

          <h4 className="font-medium text-slate-900 text-sm leading-snug">
            {alert.title}
          </h4>

          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
            {alert.description}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(alert.createdAt)}
            </div>

            {alert.actionUrl && alert.actionLabel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary hover:text-primary hover:bg-secondary -mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = alert.actionUrl!;
                }}
              >
                {alert.actionLabel}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(alert.id);
            }}
            aria-label="Fermer l'alerte"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Unread indicator */}
        {!isRead && (
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
        )}
      </div>
    </div>
  );
}

/**
 * Alert Feed Component
 */
const INITIAL_VISIBLE_ALERTS = 3;

export function AlertFeed({
  alerts,
  userId,
  loading = false,
  onMarkRead,
  onDismiss,
  onAlertClick,
  className,
}: AlertFeedProps) {
  const [filter, setFilter] = useState<DashboardAlertPriority | "all">("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter alerts
  const filteredAlerts = filter === "all"
    ? alerts
    : alerts.filter((a) => a.priority === filter);

  // Determine which alerts to display
  const visibleAlerts = isExpanded 
    ? filteredAlerts 
    : filteredAlerts.slice(0, INITIAL_VISIBLE_ALERTS);
  
  const hiddenCount = filteredAlerts.length - INITIAL_VISIBLE_ALERTS;
  const hasMoreAlerts = hiddenCount > 0;

  // Count unread
  const unreadCount = userId
    ? alerts.filter((a) => !a.readBy.includes(userId)).length
    : 0;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertes
            {filteredAlerts.length > 0 && (
              <Badge className="bg-primary text-white text-xs">
                {filteredAlerts.length}
              </Badge>
            )}
          </CardTitle>
        </div>

        {/* Priority filter */}
        <div className="flex gap-1 mt-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs h-7"
          >
            Toutes
          </Button>
          <Button
            variant={filter === "critical" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("critical")}
            className="text-xs h-7"
          >
            Critiques
          </Button>
          <Button
            variant={filter === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("high")}
            className="text-xs h-7"
          >
            Élevées
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Info className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Aucune alerte</p>
          </div>
        ) : (
          <>
            {/* Show alerts with optional ScrollArea when expanded */}
            {isExpanded ? (
              <ScrollArea className="h-[400px] pr-3">
                <div className="space-y-3">
                  {visibleAlerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      userId={userId}
                      onMarkRead={onMarkRead}
                      onDismiss={onDismiss}
                      onClick={onAlertClick ? () => onAlertClick(alert) : undefined}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="space-y-3">
                {visibleAlerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    userId={userId}
                    onMarkRead={onMarkRead}
                    onDismiss={onDismiss}
                    onClick={onAlertClick ? () => onAlertClick(alert) : undefined}
                  />
                ))}
              </div>
            )}

            {/* Show more/less button */}
            {hasMoreAlerts && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-primary hover:text-primary hover:bg-secondary"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Afficher moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Afficher {hiddenCount} alerte{hiddenCount > 1 ? "s" : ""} de plus
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {/* Mark all as read */}
        {unreadCount > 0 && onMarkRead && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-slate-500 hover:text-slate-700"
            onClick={() => {
              alerts
                .filter((a) => userId && !a.readBy.includes(userId))
                .forEach((a) => onMarkRead(a.id));
            }}
          >
            Tout marquer comme lu
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact Alert Badge for sidebar
 */
export function AlertBadge({
  count,
  criticalCount,
  onClick,
}: {
  count: number;
  criticalCount?: number;
  onClick?: () => void;
}) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        criticalCount && criticalCount > 0
          ? "bg-red-100 text-red-700"
          : "bg-secondary text-primary"
      )}
    >
      <Bell className="h-3 w-3" />
      {count}
    </button>
  );
}

export default AlertFeed;
