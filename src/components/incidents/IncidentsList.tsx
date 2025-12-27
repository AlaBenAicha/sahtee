/**
 * Incidents List Component
 * 
 * Table/grid view of incidents with sorting and filtering.
 */

import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { IncidentStatusBadge, IncidentSeverityBadge } from "./IncidentStatusBadge";
import { cn } from "@/lib/utils";
import { useIncidents, useDeleteIncident } from "@/hooks/useIncidents";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/types/capa";

interface IncidentsListProps {
  filters?: {
    status?: IncidentStatus[];
    severity?: IncidentSeverity[];
    searchQuery?: string;
  };
  onIncidentClick?: (incident: Incident) => void;
  onEditClick?: (incident: Incident) => void;
}

type SortField = "reference" | "severity" | "status" | "reportedAt" | "location";
type SortDirection = "asc" | "desc";

const severityOrder: Record<IncidentSeverity, number> = {
  critical: 0,
  severe: 1,
  moderate: 2,
  minor: 3,
};

const statusOrder: Record<IncidentStatus, number> = {
  reported: 0,
  acknowledged: 1,
  investigating: 2,
  action_plan_created: 3,
  resolved: 4,
  closed: 5,
};

const typeLabels: Record<string, string> = {
  accident: "Accident",
  near_miss: "Presqu'accident",
  unsafe_condition: "Condition dangereuse",
  unsafe_act: "Acte dangereux",
};

export function IncidentsList({ filters = {}, onIncidentClick, onEditClick }: IncidentsListProps) {
  const { data: incidents = [], isLoading, error } = useIncidents(filters);
  const { mutate: deleteIncident } = useDeleteIncident();
  const { canUpdate, canDelete } = useFeaturePermissions("incidents");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("reportedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "reference":
          comparison = a.reference.localeCompare(b.reference);
          break;
        case "severity":
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case "status":
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "reportedAt":
          comparison = a.reportedAt.toMillis() - b.reportedAt.toMillis();
          break;
        case "location":
          comparison = a.location.localeCompare(b.location);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [incidents, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(incidents.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleDelete = (incidentId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet incident ?")) {
      deleteIncident(incidentId);
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortDirection === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Erreur lors du chargement des incidents
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Aucun incident trouvé</p>
        <p className="text-sm">Modifiez vos filtres ou créez un nouveau signalement</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={selectedIds.size === incidents.length && incidents.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-[120px]">
              <SortButton field="reference">Référence</SortButton>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead className="w-[100px]">
              <SortButton field="severity">Gravité</SortButton>
            </TableHead>
            <TableHead className="w-[120px]">
              <SortButton field="status">Statut</SortButton>
            </TableHead>
            <TableHead className="w-[150px]">
              <SortButton field="location">Lieu</SortButton>
            </TableHead>
            <TableHead className="w-[140px]">
              <SortButton field="reportedAt">Date</SortButton>
            </TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedIncidents.map((incident) => {
            const reportedDate = incident.reportedAt.toDate();

            return (
              <TableRow
                key={incident.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  incident.severity === "critical" && "bg-red-50/50 dark:bg-red-950/20",
                  incident.severity === "severe" && "bg-orange-50/50 dark:bg-orange-950/20"
                )}
                onClick={() => onIncidentClick?.(incident)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(incident.id)}
                    onCheckedChange={(checked) => handleSelectOne(incident.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{incident.reference}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{incident.description}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs">
                    {typeLabels[incident.type] || incident.type}
                  </span>
                </TableCell>
                <TableCell>
                  <IncidentSeverityBadge severity={incident.severity} />
                </TableCell>
                <TableCell>
                  <IncidentStatusBadge status={incident.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[100px]">{incident.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {reportedDate.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      {reportedDate.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onIncidentClick?.(incident)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </DropdownMenuItem>
                      {canUpdate && (
                        <DropdownMenuItem onClick={() => onEditClick?.(incident)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(incident.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

