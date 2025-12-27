/**
 * CAPA Kanban Board Component
 * 
 * Drag-and-drop Kanban board for managing CAPAs.
 * Columns: CAPA urgentes, A planifier, A faire, En cours, Terminées
 */

import { useState, useMemo } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CAPACard } from "./CAPACard";
import { cn } from "@/lib/utils";
import { useCAPAsByColumn, useMoveCAPAToColumn } from "@/hooks/useCAPAs";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { ActionPlan } from "@/types/capa";

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  bgColor: string;
}

const columns: KanbanColumn[] = [
  {
    id: "urgent",
    title: "CAPA Urgentes",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  {
    id: "to_plan",
    title: "À planifier",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: "todo",
    title: "À faire",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "in_progress",
    title: "En cours",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    id: "done",
    title: "Terminées",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
];

interface CAPAKanbanBoardProps {
  onCAPAClick?: (capa: ActionPlan) => void;
  onCreateClick?: () => void;
}

export function CAPAKanbanBoard({ onCAPAClick, onCreateClick }: CAPAKanbanBoardProps) {
  const { data: capasByColumn, isLoading, error } = useCAPAsByColumn();
  const { mutate: moveCAPA } = useMoveCAPAToColumn();
  const { canCreate, canUpdate } = useFeaturePermissions("capa");

  const [draggedCapa, setDraggedCapa] = useState<ActionPlan | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, capa: ActionPlan) => {
    if (!canUpdate) return;
    setDraggedCapa(capa);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", capa.id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    if (!canUpdate || !draggedCapa) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!canUpdate || !draggedCapa) return;

    const capaId = e.dataTransfer.getData("text/plain");
    if (capaId) {
      moveCAPA({ capaId, column: columnId });
    }

    setDraggedCapa(null);
  };

  const handleDragEnd = () => {
    setDraggedCapa(null);
    setDragOverColumn(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 pb-4 w-full">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-1 min-w-[200px] rounded-lg border bg-card p-3"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-6" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Erreur lors du chargement du tableau Kanban
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 pb-4">
        {columns.map((column) => {
          const columnCapas = capasByColumn?.[column.id] || [];

          return (
            <div
              key={column.id}
              className={cn(
                "flex-1 min-w-[200px] rounded-lg border transition-colors flex flex-col",
                column.bgColor,
                dragOverColumn === column.id && "ring-2 ring-primary"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between p-3 border-b bg-background/50 rounded-t-lg shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className={cn("font-semibold text-sm truncate", column.color)}>
                    {column.title}
                  </h3>
                  <Badge variant="secondary" className="h-5 text-xs shrink-0">
                    {columnCapas.length}
                  </Badge>
                </div>

                {canCreate && column.id === "todo" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={onCreateClick}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Column content */}
              <ScrollArea className="flex-1 h-[calc(100vh-320px)]">
                <div className="p-3 space-y-3">
                  {columnCapas.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                      Aucune action
                    </div>
                  ) : (
                    columnCapas.map((capa) => (
                      <div
                        key={capa.id}
                        draggable={canUpdate}
                        onDragStart={(e) => handleDragStart(e, capa)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "transition-opacity",
                          draggedCapa?.id === capa.id && "opacity-50"
                        )}
                      >
                        <CAPACard
                          capa={capa}
                          onClick={() => onCAPAClick?.(capa)}
                          isDraggable={canUpdate}
                        />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}

