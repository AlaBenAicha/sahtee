/**
 * Training Card Component
 * 
 * Displays a single training plan with progress and status.
 */

import { useMemo } from "react";
import {
  BookOpen,
  Clock,
  Users,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle2,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TrainingPlan } from "@/types/capa";

interface TrainingCardProps {
  training: TrainingPlan;
  onClick?: () => void;
  onEnroll?: () => void;
  showEnrollButton?: boolean;
  className?: string;
}

const priorityConfig = {
  obligatoire: { label: "Obligatoire", color: "bg-red-100 text-red-700 border-red-300" },
  recommandee: { label: "Recommandée", color: "bg-amber-100 text-amber-700 border-amber-300" },
  optionnelle: { label: "Optionnelle", color: "bg-blue-100 text-blue-700 border-blue-300" },
};

const sourceLabels: Record<string, string> = {
  capa: "CAPA",
  incident: "Incident",
  risk: "Analyse de risque",
  regulation: "Réglementation",
  internal: "Interne",
};

export function TrainingCard({
  training,
  onClick,
  onEnroll,
  showEnrollButton = false,
  className,
}: TrainingCardProps) {
  const dueDate = useMemo(() => {
    const date = training.dueDate.toDate();
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [training.dueDate]);

  const isOverdue = useMemo(() => {
    return training.dueDate.toMillis() < Date.now();
  }, [training.dueDate]);

  const completionRate = useMemo(() => {
    const { total, completed } = training.completionStatus;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [training.completionStatus]);

  const priorityInfo = priorityConfig[training.priority] || priorityConfig.optionnelle;

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group",
          isOverdue && training.completionStatus.completed < training.completionStatus.total
            && "border-red-300 dark:border-red-700",
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium line-clamp-1">{training.courseName}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={priorityInfo.color}>
                    {priorityInfo.label}
                  </Badge>
                  {training.mandatory && (
                    <Badge variant="secondary" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Obligatoire
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-3">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {training.description}
          </p>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>
                    {training.completionStatus.completed}/{training.completionStatus.total}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {training.completionStatus.completed} terminé(s) sur{" "}
                {training.completionStatus.total} inscrit(s)
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{training.durationMinutes} min</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Durée estimée</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue ? "text-red-600" : "text-muted-foreground"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{dueDate}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isOverdue ? "Date limite dépassée" : "Date limite"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Source */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge variant="outline" className="text-xs">
              {sourceLabels[training.source] || training.source}
            </Badge>

            {showEnrollButton && onEnroll && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnroll();
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                S'inscrire
              </Button>
            )}

            {completionRate === 100 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium">Terminé</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

