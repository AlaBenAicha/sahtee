/**
 * Incident Card Component
 * 
 * Card display for a single incident.
 */

import { useMemo } from "react";
import {
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  FileImage,
  Users,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IncidentStatusBadge, IncidentSeverityBadge } from "./IncidentStatusBadge";
import { cn } from "@/lib/utils";
import type { Incident } from "@/types/capa";

interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
  className?: string;
}

const typeLabels: Record<string, string> = {
  accident: "Accident",
  near_miss: "Presqu'accident",
  unsafe_condition: "Condition dangereuse",
  unsafe_act: "Acte dangereux",
};

export function IncidentCard({ incident, onClick, className }: IncidentCardProps) {
  const reportedDate = useMemo(() => {
    const date = incident.reportedAt.toDate();
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [incident.reportedAt]);

  const reportedTime = useMemo(() => {
    const date = incident.reportedAt.toDate();
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [incident.reportedAt]);

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
          "group relative",
          incident.severity === "critical" && "border-red-300 dark:border-red-700",
          incident.severity === "severe" && "border-orange-300 dark:border-orange-700",
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            {/* Reference and badges */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {incident.reference}
                </span>
                {incident.aiAnalysis && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="h-5 px-1 gap-0.5">
                        <Sparkles className="h-3 w-3 text-violet-500" />
                        <span className="text-[10px]">IA</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Analysé par IA</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <IncidentSeverityBadge severity={incident.severity} />
            </div>

            <IncidentStatusBadge status={incident.status} />
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-3">
          {/* Type badge */}
          <Badge variant="outline" className="text-xs">
            {typeLabels[incident.type] || incident.type}
          </Badge>

          {/* Description */}
          <p className="text-sm line-clamp-2 text-muted-foreground">
            {incident.description}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{incident.location}</span>
          </div>

          {/* Metadata row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{reportedDate}</span>
              <span className="text-muted-foreground/60">à {reportedTime}</span>
            </div>

            {/* Indicators */}
            <div className="flex items-center gap-2">
              {incident.photos.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-0.5">
                      <FileImage className="h-3 w-3" />
                      <span>{incident.photos.length}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {incident.photos.length} photo{incident.photos.length > 1 ? "s" : ""}
                  </TooltipContent>
                </Tooltip>
              )}

              {incident.affectedPersons.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-0.5">
                      <Users className="h-3 w-3" />
                      <span>{incident.affectedPersons.length}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {incident.affectedPersons.length} personne{incident.affectedPersons.length > 1 ? "s" : ""} affectée{incident.affectedPersons.length > 1 ? "s" : ""}
                  </TooltipContent>
                </Tooltip>
              )}

              {incident.linkedCapaIds.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <LinkIcon className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>CAPA lié</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Reporter */}
          <div className="flex items-center gap-2 pt-1 border-t text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">Signalé par {incident.reporterName}</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

