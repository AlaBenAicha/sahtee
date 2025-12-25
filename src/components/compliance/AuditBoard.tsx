/**
 * Audit Board Component
 * 
 * Displays audits in table or calendar view with filtering capabilities.
 */

import { useState, useMemo } from "react";
import {
  Calendar,
  List,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  PauseCircle,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAudits } from "@/hooks/useCompliance";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { Audit, AuditFilters, AuditStatus, AuditType, RegulatoryFramework } from "@/types/conformity";
import { cn } from "@/lib/utils";

interface AuditBoardProps {
  onAuditClick?: (audit: Audit) => void;
  onCreateAudit?: () => void;
}

const STATUS_CONFIG: Record<AuditStatus, { label: string; color: string; icon: React.ReactNode }> = {
  planned: {
    label: "Planifié",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <Calendar className="h-3 w-3" />,
  },
  in_progress: {
    label: "En cours",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <PlayCircle className="h-3 w-3" />,
  },
  pending_report: {
    label: "Rapport en attente",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    icon: <PauseCircle className="h-3 w-3" />,
  },
  completed: {
    label: "Terminé",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  cancelled: {
    label: "Annulé",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    icon: <XCircle className="h-3 w-3" />,
  },
};

const TYPE_LABELS: Record<AuditType, string> = {
  internal: "Interne",
  external: "Externe",
  certification: "Certification",
  surveillance: "Surveillance",
  regulatory: "Réglementaire",
};

const FRAMEWORK_LABELS: Record<RegulatoryFramework, string> = {
  iso_45001: "ISO 45001",
  iso_14001: "ISO 14001",
  iso_9001: "ISO 9001",
  ohsas_18001: "OHSAS 18001",
  tunisian_labor: "Code du Travail",
  cnam: "CNAM",
  ancsep: "ANCSEP",
  custom: "Personnalisé",
};

function formatDate(timestamp: { toDate: () => Date } | Date): string {
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AuditBoard({ onAuditClick, onCreateAudit }: AuditBoardProps) {
  const { canCreate } = useFeaturePermissions("compliance");
  const [view, setView] = useState<"table" | "calendar">("table");
  const [filters, setFilters] = useState<AuditFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  const { data: audits, isLoading, error } = useAudits({
    ...filters,
    searchQuery: searchQuery || undefined,
  });

  const handleStatusFilter = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, status: undefined }));
    } else {
      setFilters(prev => ({ ...prev, status: [value as AuditStatus] }));
    }
  };

  const handleTypeFilter = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, type: undefined }));
    } else {
      setFilters(prev => ({ ...prev, type: [value as AuditType] }));
    }
  };

  // Group audits by month for calendar view
  const auditsByMonth = useMemo(() => {
    if (!audits) return {};
    
    return audits.reduce((acc, audit) => {
      const date = audit.plannedStartDate.toDate();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(audit);
      return acc;
    }, {} as Record<string, Audit[]>);
  }, [audits]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          Erreur lors du chargement des audits
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Audits
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as "table" | "calendar")}>
              <TabsList className="h-8">
                <TabsTrigger value="table" className="h-7 px-2">
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="calendar" className="h-7 px-2">
                  <Calendar className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {canCreate && onCreateAudit && (
              <Button onClick={onCreateAudit} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvel audit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un audit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status?.[0] || "all"}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.type?.[0] || "all"}
            onValueChange={handleTypeFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {!audits || audits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Aucun audit trouvé</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {searchQuery || filters.status || filters.type
                ? "Aucun audit ne correspond à vos critères de recherche."
                : "Commencez par planifier votre premier audit."}
            </p>
            {canCreate && onCreateAudit && (
              <Button onClick={onCreateAudit} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Planifier un audit
              </Button>
            )}
          </div>
        ) : view === "table" ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[120px]">Référentiel</TableHead>
                  <TableHead className="w-[120px]">Dates</TableHead>
                  <TableHead className="w-[100px]">Statut</TableHead>
                  <TableHead className="w-[80px]">Écarts</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((audit) => {
                  const statusConfig = STATUS_CONFIG[audit.status];
                  return (
                    <TableRow
                      key={audit.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onAuditClick?.(audit)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{audit.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {audit.scope}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[audit.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {FRAMEWORK_LABELS[audit.framework]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p>{formatDate(audit.plannedStartDate)}</p>
                          {audit.plannedEndDate && (
                            <p className="text-muted-foreground">
                              → {formatDate(audit.plannedEndDate)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusConfig.color)}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {audit.findings.length > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            {audit.findings.length}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          // Calendar view
          <div className="space-y-6">
            {Object.entries(auditsByMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([monthKey, monthAudits]) => {
                const [year, month] = monthKey.split("-").map(Number);
                const monthName = new Date(year, month - 1).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                });

                return (
                  <div key={monthKey}>
                    <h4 className="font-medium mb-3 capitalize">{monthName}</h4>
                    <div className="grid gap-2">
                      {monthAudits.map((audit) => {
                        const statusConfig = STATUS_CONFIG[audit.status];
                        return (
                          <div
                            key={audit.id}
                            className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                            onClick={() => onAuditClick?.(audit)}
                          >
                            <div className="flex-shrink-0 w-12 text-center">
                              <p className="text-2xl font-bold">
                                {audit.plannedStartDate.toDate().getDate()}
                              </p>
                              <p className="text-xs text-muted-foreground uppercase">
                                {audit.plannedStartDate.toDate().toLocaleDateString("fr-FR", { weekday: "short" })}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{audit.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{audit.scope}</p>
                            </div>
                            <Badge className={cn("flex-shrink-0", statusConfig.color)}>
                              {statusConfig.icon}
                              <span className="ml-1">{statusConfig.label}</span>
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

