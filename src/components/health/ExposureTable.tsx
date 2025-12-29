/**
 * Exposure Table Component
 * 
 * Displays a table of exposure monitoring records with alert levels.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  AlertTriangle,
  Biohazard,
  Minus,
  Filter,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useExposures, useCriticalExposures } from "@/hooks/useHealth";
import type { OrganizationExposure, HazardCategory } from "@/types/health";

const ALERT_LEVEL_CONFIG = {
  low: { label: "Faible", color: "bg-secondary text-primary", progressColor: "bg-primary" },
  moderate: { label: "Modéré", color: "bg-secondary text-primary", progressColor: "bg-primary" },
  elevated: { label: "Élevé", color: "bg-amber-100 text-amber-700", progressColor: "bg-amber-500" },
  critical: { label: "Critique", color: "bg-red-100 text-red-700", progressColor: "bg-red-500" },
};

const HAZARD_TYPE_CONFIG: Record<HazardCategory, { label: string; color: string }> = {
  physical: { label: "Physique", color: "bg-purple-100 text-purple-700" },
  chemical: { label: "Chimique", color: "bg-orange-100 text-orange-700" },
  biological: { label: "Biologique", color: "bg-green-100 text-green-700" },
  ergonomic: { label: "Ergonomique", color: "bg-pink-100 text-pink-700" },
  psychosocial: { label: "Psychosocial", color: "bg-indigo-100 text-indigo-700" },
  mechanical: { label: "Mécanique", color: "bg-slate-100 text-slate-700" },
  electrical: { label: "Électrique", color: "bg-yellow-100 text-yellow-700" },
  thermal: { label: "Thermique", color: "bg-red-100 text-red-700" },
  environmental: { label: "Environnemental", color: "bg-teal-100 text-teal-700" },
};

interface ExposureTableProps {
  onSelectExposure?: (exposure: OrganizationExposure) => void;
  onCreateExposure?: () => void;
}

export function ExposureTable({ onSelectExposure, onCreateExposure }: ExposureTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hazardFilter, setHazardFilter] = useState<HazardCategory | "all">("all");
  const [alertFilter, setAlertFilter] = useState<string>("all");

  const { data: exposures, isLoading } = useExposures({
    hazardType: hazardFilter !== "all" ? [hazardFilter] : undefined,
  });
  const { data: criticalExposures } = useCriticalExposures();

  // Filter exposures
  const filteredExposures = (exposures || []).filter((exposure) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !exposure.agent.toLowerCase().includes(query) &&
        !exposure.area.toLowerCase().includes(query) &&
        !(exposure.departmentName?.toLowerCase().includes(query))
      ) {
        return false;
      }
    }
    if (alertFilter !== "all" && exposure.alertLevel !== alertFilter) {
      return false;
    }
    return true;
  });

  // Note: Trend is now just a placeholder since measurements are in a separate collection.
  // For detailed trends, open the exposure detail modal.
  const getTrendIcon = (_history?: { value: number }[]) => {
    // Trends are now calculated from the measurements collection - show neutral icon
    return Minus;
  };

  const getTrendColor = (_history?: { value: number }[]) => {
    // Trends are now calculated from the measurements collection
    return "text-slate-400";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Biohazard className="h-5 w-5 text-orange-500" />
              Surveillance des expositions
            </CardTitle>
            <CardDescription>
              Suivi des niveaux d'exposition aux agents dangereux
            </CardDescription>
          </div>
          <Button onClick={onCreateExposure}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle exposition
          </Button>
        </div>

        {/* Critical Exposures Warning */}
        {criticalExposures && criticalExposures.length > 0 && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-700">
                {criticalExposures.length} exposition{criticalExposures.length > 1 ? "s" : ""} dépasse{criticalExposures.length > 1 ? "nt" : ""} les seuils réglementaires
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher par agent, zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={hazardFilter} onValueChange={(v) => setHazardFilter(v as HazardCategory | "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {Object.entries(HAZARD_TYPE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={alertFilter} onValueChange={setAlertFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous niveaux</SelectItem>
              {Object.entries(ALERT_LEVEL_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredExposures.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Biohazard className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2">Aucune exposition enregistrée</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent / Zone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead className="text-center">% Limite</TableHead>
                  <TableHead>Employés exposés</TableHead>
                  <TableHead>Tendance</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExposures.map((exposure) => {
                  const alertConfig = ALERT_LEVEL_CONFIG[exposure.alertLevel];
                  const hazardConfig = HAZARD_TYPE_CONFIG[exposure.hazardType];
                  const TrendIcon = getTrendIcon(exposure.measurementHistory || []);
                  const trendColor = getTrendColor(exposure.measurementHistory || []);

                  return (
                    <TableRow
                      key={exposure.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => onSelectExposure?.(exposure)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-800">{exposure.agent}</p>
                          <p className="text-xs text-slate-500">{exposure.area}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", hazardConfig.color)}>
                          {hazardConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", alertConfig.color)}>
                          {alertConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.min(exposure.percentOfLimit, 100)}
                            className={cn(
                              "h-2 w-24",
                              exposure.percentOfLimit >= 100 && "animate-pulse"
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              exposure.percentOfLimit >= 100
                                ? "text-red-600"
                                : exposure.percentOfLimit >= 80
                                  ? "text-amber-600"
                                  : "text-slate-600"
                            )}
                          >
                            {exposure.percentOfLimit.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {exposure.exposedEmployeeCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <TrendIcon className={cn("h-4 w-4", trendColor)} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectExposure?.(exposure);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-slate-500 border-t pt-4">
          <span>{filteredExposures.length} exposition{filteredExposures.length > 1 ? "s" : ""}</span>
          <div className="flex gap-4">
            {Object.entries(ALERT_LEVEL_CONFIG).map(([level, config]) => {
              const count = filteredExposures.filter((e) => e.alertLevel === level).length;
              if (count === 0) return null;
              return (
                <span key={level} className="flex items-center gap-1">
                  <div className={cn("h-2 w-2 rounded-full", config.progressColor)} />
                  {count} {config.label.toLowerCase()}
                </span>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExposureTable;

