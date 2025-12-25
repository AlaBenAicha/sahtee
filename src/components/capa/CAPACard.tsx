/**
 * CAPA Card Component
 * 
 * Displays a single CAPA action plan in card format.
 * Used in both Kanban board and list views.
 */

import { useMemo } from "react";
import {
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Paperclip,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ActionPlan, ActionPriority, ActionStatus, ActionCategory } from "@/types/capa";

interface CAPACardProps {
  capa: ActionPlan;
  onClick?: () => void;
  isDraggable?: boolean;
  className?: string;
}

const priorityConfig: Record<ActionPriority, { label: string; color: string; bgColor: string }> = {
  critique: { label: "Critique", color: "text-red-700", bgColor: "bg-red-100 dark:bg-red-900/40" },
  haute: { label: "Haute", color: "text-orange-700", bgColor: "bg-orange-100 dark:bg-orange-900/40" },
  moyenne: { label: "Moyenne", color: "text-yellow-700", bgColor: "bg-yellow-100 dark:bg-yellow-900/40" },
  basse: { label: "Basse", color: "text-green-700", bgColor: "bg-green-100 dark:bg-green-900/40" },
};

const statusConfig: Record<ActionStatus, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "text-gray-500" },
  pending_approval: { label: "En attente", color: "text-amber-500" },
  approved: { label: "Approuvé", color: "text-blue-500" },
  in_progress: { label: "En cours", color: "text-indigo-500" },
  blocked: { label: "Bloqué", color: "text-red-500" },
  completed: { label: "Terminé", color: "text-emerald-500" },
  verified: { label: "Vérifié", color: "text-teal-500" },
  closed: { label: "Clôturé", color: "text-gray-400" },
};

const categoryLabels: Record<ActionCategory, string> = {
  correctif: "Correctif",
  preventif: "Préventif",
};

export function CAPACard({ capa, onClick, isDraggable = false, className }: CAPACardProps) {
  const priority = priorityConfig[capa.priority];
  const status = statusConfig[capa.status];

  const dueDate = useMemo(() => {
    const date = capa.dueDate.toDate();
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  }, [capa.dueDate]);

  const isOverdue = useMemo(() => {
    const now = Date.now();
    return capa.dueDate.toMillis() < now && !["completed", "verified", "closed"].includes(capa.status);
  }, [capa.dueDate, capa.status]);

  const isDueSoon = useMemo(() => {
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const dueTime = capa.dueDate.toMillis();
    return dueTime > now && dueTime < now + threeDays && !["completed", "verified", "closed"].includes(capa.status);
  }, [capa.dueDate, capa.status]);

  const assigneeInitials = capa.assigneeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
          "group relative",
          isOverdue && "border-red-300 dark:border-red-700",
          isDueSoon && "border-amber-300 dark:border-amber-700",
          className
        )}
        onClick={onClick}
      >
        {/* Drag handle */}
        {isDraggable && (
          <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            {/* Reference and AI badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {capa.reference}
              </span>
              {capa.aiGenerated && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="h-5 px-1 gap-0.5">
                      <Sparkles className="h-3 w-3 text-violet-500" />
                      <span className="text-[10px]">IA</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Généré par IA ({capa.aiConfidence}% confiance)
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Priority badge */}
            <Badge
              variant="secondary"
              className={cn("text-[10px] font-medium", priority.color, priority.bgColor)}
            >
              {priority.label}
            </Badge>
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium line-clamp-2 leading-tight mt-1">
            {capa.title}
          </h4>
        </CardHeader>

        <CardContent className="p-3 pt-0 space-y-3">
          {/* Category badge */}
          <Badge variant="outline" className="text-[10px]">
            {categoryLabels[capa.category]}
          </Badge>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{capa.progress}%</span>
            </div>
            <Progress value={capa.progress} className="h-1.5" />
          </div>

          {/* Metadata row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {/* Due date */}
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue && "text-red-600 dark:text-red-400",
                    isDueSoon && "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {isOverdue ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : isDueSoon ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}
                  <span>{dueDate}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isOverdue
                  ? "En retard"
                  : isDueSoon
                  ? "Échéance proche"
                  : "Date d'échéance"}
              </TooltipContent>
            </Tooltip>

            {/* Indicators */}
            <div className="flex items-center gap-2">
              {capa.comments.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-0.5">
                      <MessageSquare className="h-3 w-3" />
                      <span>{capa.comments.length}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {capa.comments.length} commentaire{capa.comments.length > 1 ? "s" : ""}
                  </TooltipContent>
                </Tooltip>
              )}

              {capa.checklistItems.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>
                        {capa.checklistItems.filter((i) => i.completed).length}/
                        {capa.checklistItems.length}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {capa.checklistItems.filter((i) => i.completed).length} sur{" "}
                    {capa.checklistItems.length} tâches complétées
                  </TooltipContent>
                </Tooltip>
              )}

              {(capa.linkedTrainingIds.length > 0 ||
                capa.linkedEquipmentIds.length > 0 ||
                capa.linkedDocumentIds.length > 0) && (
                <Tooltip>
                  <TooltipTrigger>
                    <Paperclip className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>Éléments liés</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary/10">
                  {assigneeInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {capa.assigneeName}
              </span>
            </div>

            <span className={cn("text-[10px] font-medium", status.color)}>
              {status.label}
            </span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

