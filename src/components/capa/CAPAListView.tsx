/**
 * CAPA List View Component
 * 
 * Table view for CAPA management with sorting and pagination.
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
  Sparkles,
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCAPAs, useDeleteCAPA } from "@/hooks/useCAPAs";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { ActionPlan, ActionPriority, ActionStatus, CAPAFilters } from "@/types/capa";

interface CAPAListViewProps {
  filters: CAPAFilters;
  onCAPAClick?: (capa: ActionPlan) => void;
  onEditClick?: (capa: ActionPlan) => void;
}

type SortField = "reference" | "title" | "priority" | "status" | "dueDate" | "progress" | "assigneeName";
type SortDirection = "asc" | "desc";

const priorityOrder: Record<ActionPriority, number> = {
  critique: 0,
  haute: 1,
  moyenne: 2,
  basse: 3,
};

const statusOrder: Record<ActionStatus, number> = {
  draft: 0,
  pending_approval: 1,
  approved: 2,
  in_progress: 3,
  blocked: 4,
  completed: 5,
  verified: 6,
  closed: 7,
};

const priorityConfig: Record<ActionPriority, { label: string; color: string }> = {
  critique: { label: "Critique", color: "bg-red-100 text-red-700 dark:bg-red-900/40" },
  haute: { label: "Haute", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40" },
  moyenne: { label: "Moyenne", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40" },
  basse: { label: "Basse", color: "bg-green-100 text-green-700 dark:bg-green-900/40" },
};

const statusConfig: Record<ActionStatus, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-700 dark:bg-gray-800" },
  pending_approval: { label: "En attente", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40" },
  approved: { label: "Approuvé", color: "bg-secondary text-primary dark:bg-primary/40" },
  in_progress: { label: "En cours", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40" },
  blocked: { label: "Bloqué", color: "bg-red-100 text-red-700 dark:bg-red-900/40" },
  completed: { label: "Terminé", color: "bg-secondary text-primary dark:bg-primary/40" },
  verified: { label: "Vérifié", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/40" },
  closed: { label: "Clôturé", color: "bg-gray-100 text-gray-500 dark:bg-gray-800" },
};

export function CAPAListView({ filters, onCAPAClick, onEditClick }: CAPAListViewProps) {
  const { data: capas = [], isLoading, error } = useCAPAs(filters);
  const { mutate: deleteCAPA } = useDeleteCAPA();
  const { canUpdate, canDelete } = useFeaturePermissions("capa");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedCapas = useMemo(() => {
    return [...capas].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "reference":
          comparison = a.reference.localeCompare(b.reference);
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "priority":
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "status":
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "dueDate":
          comparison = a.dueDate.toMillis() - b.dueDate.toMillis();
          break;
        case "progress":
          comparison = a.progress - b.progress;
          break;
        case "assigneeName":
          comparison = a.assigneeName.localeCompare(b.assigneeName);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [capas, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(capas.map((c) => c.id)));
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

  const handleDelete = (capaId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette action ?")) {
      deleteCAPA(capaId);
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
        Erreur lors du chargement de la liste
      </div>
    );
  }

  if (capas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Aucune action trouvée</p>
        <p className="text-sm">Modifiez vos filtres ou créez une nouvelle action</p>
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
                checked={selectedIds.size === capas.length && capas.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-[120px]">
              <SortButton field="reference">Référence</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="title">Titre</SortButton>
            </TableHead>
            <TableHead className="w-[100px]">
              <SortButton field="priority">Priorité</SortButton>
            </TableHead>
            <TableHead className="w-[100px]">
              <SortButton field="status">Statut</SortButton>
            </TableHead>
            <TableHead className="w-[120px]">
              <SortButton field="dueDate">Échéance</SortButton>
            </TableHead>
            <TableHead className="w-[100px]">
              <SortButton field="progress">Progression</SortButton>
            </TableHead>
            <TableHead className="w-[150px]">
              <SortButton field="assigneeName">Assigné à</SortButton>
            </TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCapas.map((capa) => {
            const priority = priorityConfig[capa.priority];
            const status = statusConfig[capa.status];
            const dueDate = capa.dueDate.toDate();
            const isOverdue = dueDate < new Date() && !["completed", "verified", "closed"].includes(capa.status);

            return (
              <TableRow
                key={capa.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  isOverdue && "bg-red-50/50 dark:bg-red-950/20"
                )}
                onClick={() => onCAPAClick?.(capa)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(capa.id)}
                    onCheckedChange={(checked) => handleSelectOne(capa.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {capa.reference}
                    </span>
                    {capa.aiGenerated && (
                      <Sparkles className="h-3 w-3 text-violet-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{capa.title}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-xs", priority.color)}>
                    {priority.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-xs", status.color)}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm",
                      isOverdue && "text-red-600 font-medium"
                    )}
                  >
                    {dueDate.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={capa.progress} className="h-2 w-16" />
                    <span className="text-xs text-muted-foreground">
                      {capa.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      user={{ photoURL: null, email: null }}
                      userProfile={{ firstName: capa.assigneeName, lastName: "" }}
                      className="h-6 w-6"
                      fallbackClassName="text-[10px]"
                    />
                    <span className="text-sm truncate max-w-[100px]">
                      {capa.assigneeName}
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
                      <DropdownMenuItem onClick={() => onCAPAClick?.(capa)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </DropdownMenuItem>
                      {canUpdate && (
                        <DropdownMenuItem onClick={() => onEditClick?.(capa)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(capa.id)}
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

