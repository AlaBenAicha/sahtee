/**
 * Compliance Status Tiles Component
 * 
 * Displays 4 KPI tiles for the Conformity Room:
 * - Overall compliance rate
 * - Non-compliant requirements count
 * - Upcoming audits
 * - Open findings
 */

import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  AlertTriangle 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplianceCounts } from "@/hooks/useCompliance";
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

export function ComplianceStatusTiles() {
  const { counts, isLoading, error } = useComplianceCounts();

  const tiles: StatusTile[] = [
    {
      id: "compliance_rate",
      label: "Taux de Conformité",
      value: `${counts.complianceRate}%`,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: counts.complianceRate >= 80 
        ? "text-emerald-600" 
        : counts.complianceRate >= 50 
          ? "text-amber-600" 
          : "text-red-600",
      bgColor: counts.complianceRate >= 80 
        ? "bg-emerald-50 dark:bg-emerald-950/30" 
        : counts.complianceRate >= 50 
          ? "bg-amber-50 dark:bg-amber-950/30" 
          : "bg-red-50 dark:bg-red-950/30",
      description: "Taux global de conformité réglementaire",
    },
    {
      id: "non_compliant",
      label: "Non Conformes",
      value: counts.nonCompliantCount,
      icon: <XCircle className="h-5 w-5" />,
      color: counts.nonCompliantCount === 0 
        ? "text-emerald-600" 
        : counts.nonCompliantCount <= 5 
          ? "text-amber-600" 
          : "text-red-600",
      bgColor: counts.nonCompliantCount === 0 
        ? "bg-emerald-50 dark:bg-emerald-950/30" 
        : counts.nonCompliantCount <= 5 
          ? "bg-amber-50 dark:bg-amber-950/30" 
          : "bg-red-50 dark:bg-red-950/30",
      description: "Exigences non conformes à traiter",
    },
    {
      id: "upcoming_audits",
      label: "Audits Planifiés",
      value: counts.upcomingAudits,
      icon: <Calendar className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      description: "Audits programmés à venir",
    },
    {
      id: "open_findings",
      label: "Écarts Ouverts",
      value: counts.openFindings,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: counts.openFindings === 0 
        ? "text-emerald-600" 
        : counts.overdueFindings > 0 
          ? "text-red-600" 
          : "text-amber-600",
      bgColor: counts.openFindings === 0 
        ? "bg-emerald-50 dark:bg-emerald-950/30" 
        : counts.overdueFindings > 0 
          ? "bg-red-50 dark:bg-red-950/30" 
          : "bg-amber-50 dark:bg-amber-950/30",
      description: counts.overdueFindings > 0 
        ? `Dont ${counts.overdueFindings} en retard`
        : "Constats d'audit à traiter",
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
          Erreur lors du chargement des statistiques de conformité
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

