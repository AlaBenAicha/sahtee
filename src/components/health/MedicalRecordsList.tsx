/**
 * Medical Records List Component
 * 
 * Displays a list of employee medical records.
 * Physician-only access - shows full PHI data.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  FileText,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHealthRecords, useIsPhysician } from "@/hooks/useHealth";
import type { HealthRecord, FitnessStatus } from "@/types/health";

const FITNESS_STATUS_CONFIG: Record<FitnessStatus, { label: string; color: string; icon: React.ElementType }> = {
  fit: { label: "Apte", color: "bg-secondary text-primary", icon: CheckCircle },
  fit_with_restrictions: { label: "Apte avec restrictions", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  temporarily_unfit: { label: "Inapte temporaire", color: "bg-red-100 text-red-700", icon: Clock },
  permanently_unfit: { label: "Inapte définitif", color: "bg-red-100 text-red-700", icon: XCircle },
  pending_examination: { label: "En attente", color: "bg-slate-100 text-slate-700", icon: Clock },
};

interface MedicalRecordsListProps {
  onSelectRecord?: (record: HealthRecord) => void;
  onCreateRecord?: () => void;
}

export function MedicalRecordsList({ onSelectRecord, onCreateRecord }: MedicalRecordsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FitnessStatus | "all">("all");
  
  const isPhysician = useIsPhysician();
  
  const { data: records, isLoading, error } = useHealthRecords({
    fitnessStatus: statusFilter !== "all" ? [statusFilter] : undefined,
    searchQuery: searchQuery || undefined,
  });

  if (!isPhysician) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-800">Accès restreint</h3>
          <p className="mt-2 text-slate-600">
            Seuls les médecins du travail peuvent accéder aux fiches médicales individuelles.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Log the actual error for debugging
    console.error("[MedicalRecordsList] Error loading health records:", error);
    
    // Check if it's a Firestore index error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isIndexError = errorMessage.includes("index") || errorMessage.includes("FAILED_PRECONDITION");
    
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-800">Erreur de chargement</h3>
          <p className="mt-2 text-slate-600">
            {isIndexError 
              ? "L'index de base de données est en cours de création. Veuillez réessayer dans quelques minutes."
              : "Impossible de charger les fiches médicales. Veuillez réessayer."
            }
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-2 text-xs text-slate-400 font-mono break-all">
              {errorMessage}
            </p>
          )}
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
              <FileText className="h-5 w-5 text-indigo-500" />
              Fiches Médicales
            </CardTitle>
            <CardDescription>
              Gestion des dossiers médicaux des employés
            </CardDescription>
          </div>
          <Button onClick={onCreateRecord}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle fiche
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, poste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FitnessStatus | "all")}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(FITNESS_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !records || records.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <User className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2">Aucune fiche médicale trouvée</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prochaine visite</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const statusConfig = FITNESS_STATUS_CONFIG[record.fitnessStatus];
                  const StatusIcon = statusConfig.icon;
                  const nextVisit = record.nextExaminationDue?.toDate();
                  const isOverdue = nextVisit && nextVisit < new Date();

                  return (
                    <TableRow
                      key={record.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => onSelectRecord?.(record)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                          <span className="font-medium text-slate-800">
                            {record.employeeName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {record.departmentId}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {record.jobTitle}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("flex items-center gap-1 w-fit", statusConfig.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {nextVisit ? (
                          <div className="flex items-center gap-2">
                            <Calendar className={cn("h-4 w-4", isOverdue ? "text-red-500" : "text-slate-400")} />
                            <span className={cn("text-sm", isOverdue ? "text-red-600 font-medium" : "text-slate-600")}>
                              {nextVisit.toLocaleDateString("fr-FR")}
                            </span>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">En retard</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Non planifiée</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord?.(record);
                        }}>
                          Voir
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
        {records && records.length > 0 && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{records.length} fiche{records.length > 1 ? "s" : ""} médicale{records.length > 1 ? "s" : ""}</span>
            <div className="flex gap-4">
              {Object.entries(FITNESS_STATUS_CONFIG).map(([status, config]) => {
                const count = records.filter(r => r.fitnessStatus === status).length;
                if (count === 0) return null;
                return (
                  <span key={status} className="flex items-center gap-1">
                    <div className={cn("h-2 w-2 rounded-full", config.color.split(" ")[0])} />
                    {count} {config.label.toLowerCase()}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MedicalRecordsList;

