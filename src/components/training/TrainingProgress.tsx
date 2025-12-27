/**
 * Training Progress Component
 * 
 * Displays progress for the current user's trainings.
 */

import { useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMyTrainingRecords, useMyTrainingSummary } from "@/hooks/useTrainings";
import type { TrainingRecord } from "@/types/capa";

interface TrainingProgressProps {
  onTrainingClick?: (recordId: string) => void;
}

const statusConfig = {
  not_started: { label: "Non commencé", color: "text-slate-500 bg-slate-100" },
  in_progress: { label: "En cours", color: "text-blue-600 bg-blue-100" },
  completed: { label: "Terminé", color: "text-green-600 bg-green-100" },
  failed: { label: "Échoué", color: "text-red-600 bg-red-100" },
};

export function TrainingProgress({ onTrainingClick }: TrainingProgressProps) {
  const { data: records = [], isLoading: isLoadingRecords } = useMyTrainingRecords();
  const summary = useMyTrainingSummary();

  const activeTrainings = useMemo(() => {
    return records.filter(
      (r) => r.status === "in_progress" || r.status === "not_started"
    );
  }, [records]);

  const recentlyCompleted = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return records
      .filter(
        (r) =>
          r.status === "completed" &&
          r.completedAt &&
          r.completedAt.toMillis() > thirtyDaysAgo
      )
      .slice(0, 5);
  }, [records]);

  if (isLoadingRecords || summary.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">formations assignées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
            <p className="text-xs text-muted-foreground">
              {summary.completionRate}% de complétion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.inProgress}</div>
            <p className="text-xs text-muted-foreground">formations actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overdue}</div>
            {summary.expiringWithin30Days > 0 && (
              <p className="text-xs text-amber-600">
                {summary.expiringWithin30Days} expire(nt) bientôt
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progression globale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {summary.completed} sur {summary.total} formations terminées
              </span>
              <span className="font-medium">{summary.completionRate}%</span>
            </div>
            <Progress value={summary.completionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Active Trainings */}
      {activeTrainings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Formations en cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTrainings.map((record) => (
              <TrainingRecordItem
                key={record.id}
                record={record}
                onClick={() => onTrainingClick?.(record.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recently Completed */}
      {recentlyCompleted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Récemment terminées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentlyCompleted.map((record) => (
              <TrainingRecordItem
                key={record.id}
                record={record}
                onClick={() => onTrainingClick?.(record.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {records.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Aucune formation assignée</h3>
            <p className="text-muted-foreground mt-2">
              Vous n'avez pas encore de formations assignées
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface TrainingRecordItemProps {
  record: TrainingRecord;
  onClick?: () => void;
}

function TrainingRecordItem({ record, onClick }: TrainingRecordItemProps) {
  const statusInfo = statusConfig[record.status] || statusConfig.not_started;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
        record.status === "in_progress" && "border-blue-200 bg-blue-50/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              Formation #{record.trainingPlanId.slice(0, 8)}
            </span>
            <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>
          {record.status === "in_progress" && (
            <div className="mt-1">
              <Progress value={record.progress} className="h-1.5" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {record.status === "completed" && record.score !== undefined && (
          <Badge variant="secondary">{record.score}%</Badge>
        )}
        {record.status === "in_progress" && (
          <span className="text-sm font-medium">{record.progress}%</span>
        )}
        {record.status === "not_started" && (
          <Button size="sm" variant="outline">
            Commencer
          </Button>
        )}
      </div>
    </div>
  );
}

