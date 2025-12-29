/**
 * Norm Library Component
 * 
 * Displays a searchable and filterable table of regulatory norms/standards.
 */

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  FileText,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Clock,
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
import { Progress } from "@/components/ui/progress";
import { useNorms } from "@/hooks/useCompliance";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { NormWithRequirements, NormFilters, NormStatus, RegulatoryFramework } from "@/types/conformity";
import { cn } from "@/lib/utils";

interface NormLibraryProps {
  onNormClick?: (norm: NormWithRequirements) => void;
  onAddNorm?: () => void;
}

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

const STATUS_CONFIG: Record<NormStatus, { label: string; color: string; icon: React.ReactNode }> = {
  compliant: {
    label: "Conforme",
    color: "bg-secondary text-primary dark:bg-primary/30 dark:text-primary",
    icon: <Check className="h-3 w-3" />,
  },
  in_progress: {
    label: "En cours",
    color: "bg-secondary text-primary dark:bg-primary/30 dark:text-primary",
    icon: <Clock className="h-3 w-3" />,
  },
  non_compliant: {
    label: "Non conforme",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: <X className="h-3 w-3" />,
  },
  not_started: {
    label: "Non évalué",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

export function NormLibrary({ onNormClick, onAddNorm }: NormLibraryProps) {
  const { canCreate } = useFeaturePermissions("compliance");
  const [filters, setFilters] = useState<NormFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: norms, isLoading, error } = useNorms({
    ...filters,
    searchQuery: searchQuery || undefined,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleFrameworkFilter = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, framework: undefined }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        framework: [value as RegulatoryFramework] 
      }));
    }
  };

  const handleStatusFilter = (value: string) => {
    if (value === "all") {
      setFilters(prev => ({ ...prev, status: undefined }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        status: [value as NormStatus] 
      }));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
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
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          Erreur lors du chargement de la bibliothèque réglementaire
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bibliothèque Réglementaire
          </CardTitle>
          {canCreate && onAddNorm && (
            <Button onClick={onAddNorm} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une norme
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une norme..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={filters.framework?.[0] || "all"} 
            onValueChange={handleFrameworkFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Référentiel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les référentiels</SelectItem>
              {Object.entries(FRAMEWORK_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={filters.status?.[0] || "all"} 
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
        </div>

        {/* Table */}
        {!norms || norms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Aucune norme trouvée</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {searchQuery || filters.framework || filters.status
                ? "Aucune norme ne correspond à vos critères de recherche."
                : "Commencez par ajouter des normes à votre bibliothèque réglementaire."}
            </p>
            {canCreate && onAddNorm && (
              <Button onClick={onAddNorm} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une norme
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="w-[120px]">Référentiel</TableHead>
                  <TableHead className="w-[120px]">Statut</TableHead>
                  <TableHead className="w-[150px]">Conformité</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {norms.map((norm) => {
                  const statusConfig = STATUS_CONFIG[norm.status];
                  return (
                    <TableRow
                      key={norm.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onNormClick?.(norm)}
                    >
                      <TableCell className="font-medium">
                        {norm.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{norm.name}</p>
                          {norm.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {norm.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {FRAMEWORK_LABELS[norm.framework]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusConfig.color)}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{norm.complianceScore}%</span>
                            <span className="text-muted-foreground">
                              {norm.requirements.filter(r => r.status === "compliant").length}/
                              {norm.requirements.length}
                            </span>
                          </div>
                          <Progress 
                            value={norm.complianceScore} 
                            className="h-2"
                          />
                        </div>
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
        )}
      </CardContent>
    </Card>
  );
}

