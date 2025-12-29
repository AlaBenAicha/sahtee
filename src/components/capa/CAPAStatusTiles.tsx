/**
 * CAPA Status Tiles Component
 * 
 * Displays 4 KPI tiles for the CAPA Room:
 * - Urgent CAPAs
 * - Overdue CAPAs
 * - In Progress CAPAs
 * - Closed on Time Rate
 */

import { AlertTriangle, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCAPACounts } from "@/hooks/useCAPAs";
import { cn } from "@/lib/utils";

interface StatusTile {
  id: string;
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

export function CAPAStatusTiles() {
  const { counts, isLoading, error } = useCAPACounts();

  const closedOnTimeRate = counts.total > 0
    ? Math.round((counts.closedOnTime / counts.completed) * 100) || 0
    : 0;

  const tiles: StatusTile[] = [
    {
      id: "urgent",
      label: "CAPA Urgentes",
      value: counts.urgent,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      description: "Actions critiques à traiter immédiatement",
    },
    {
      id: "overdue",
      label: "En Retard",
      value: counts.overdue,
      icon: <Clock className="h-5 w-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      description: "Actions dépassant la date d'échéance",
    },
    {
      id: "in_progress",
      label: "En Cours",
      value: counts.inProgress,
      icon: <PlayCircle className="h-5 w-5" />,
      color: "text-primary",
      bgColor: "bg-secondary dark:bg-primary/30",
      description: "Actions actuellement en traitement",
    },
    {
      id: "closed_on_time",
      label: "Clôturées à Temps",
      value: `${closedOnTimeRate}%`,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "text-primary",
      bgColor: "bg-secondary dark:bg-primary/30",
      description: "Taux de clôture dans les délais",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
        <CardContent className="p-4 text-center text-red-600 dark:text-red-400">
          Erreur lors du chargement des statistiques CAPA
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile) => (
        <Card
          key={tile.id}
          className={cn(
            "transition-all hover:shadow-md cursor-pointer",
            tile.bgColor
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  tile.color,
                  "bg-white dark:bg-gray-900"
                )}
              >
                {tile.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {tile.label}
                </p>
                <p className={cn("text-2xl font-bold", tile.color)}>
                  {tile.value}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {tile.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

