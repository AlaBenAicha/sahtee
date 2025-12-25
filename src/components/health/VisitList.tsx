/**
 * Visit List Component
 * 
 * Displays a list of medical visits with filtering and actions.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  FileEdit,
  Trash2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMedicalVisits, useUpcomingVisits, useOverdueVisits, useDeleteMedicalVisit, useIsPhysician } from "@/hooks/useHealth";
import type { MedicalVisit, MedicalVisitStatus, ExaminationType } from "@/types/health";

const VISIT_STATUS_CONFIG: Record<MedicalVisitStatus, { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: "Planifiée", color: "bg-blue-100 text-blue-700", icon: Calendar },
  completed: { label: "Effectuée", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-slate-100 text-slate-700", icon: XCircle },
  no_show: { label: "Absent", color: "bg-red-100 text-red-700", icon: AlertCircle },
  overdue: { label: "En retard", color: "bg-red-100 text-red-700", icon: Clock },
};

const EXAM_TYPE_LABELS: Record<ExaminationType, string> = {
  pre_employment: "Embauche",
  periodic: "Périodique",
  return_to_work: "Reprise",
  special_surveillance: "Surveillance",
  exit: "Sortie",
};

interface VisitListProps {
  onSelectVisit?: (visit: MedicalVisit) => void;
  onEditVisit?: (visit: MedicalVisit) => void;
  onCreateVisit?: () => void;
}

export function VisitList({ onSelectVisit, onEditVisit, onCreateVisit }: VisitListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const isPhysician = useIsPhysician();
  const deleteVisit = useDeleteMedicalVisit();
  
  const { data: allVisits, isLoading: allLoading } = useMedicalVisits();
  const { data: upcomingVisits, isLoading: upcomingLoading } = useUpcomingVisits(10);
  const { data: overdueVisits, isLoading: overdueLoading } = useOverdueVisits();

  const isLoading = allLoading || upcomingLoading || overdueLoading;

  // Filter visits based on tab and search
  const getFilteredVisits = () => {
    let visits: MedicalVisit[] = [];
    
    switch (activeTab) {
      case "upcoming":
        visits = upcomingVisits || [];
        break;
      case "overdue":
        visits = overdueVisits || [];
        break;
      case "completed":
        visits = (allVisits || []).filter(v => v.status === "completed");
        break;
      default:
        visits = allVisits || [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      visits = visits.filter(
        v =>
          v.employeeName.toLowerCase().includes(query) ||
          v.departmentName.toLowerCase().includes(query) ||
          EXAM_TYPE_LABELS[v.type].toLowerCase().includes(query)
      );
    }

    return visits;
  };

  const filteredVisits = getFilteredVisits();

  const handleDelete = async (visitId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette visite ?")) {
      await deleteVisit.mutateAsync(visitId);
    }
  };

  const renderVisitRow = (visit: MedicalVisit) => {
    const statusConfig = VISIT_STATUS_CONFIG[visit.status];
    const StatusIcon = statusConfig.icon;
    const scheduledDate = visit.scheduledDate.toDate();

    return (
      <TableRow key={visit.id} className="cursor-pointer hover:bg-slate-50">
        <TableCell onClick={() => onSelectVisit?.(visit)}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800">{visit.employeeName}</p>
              <p className="text-xs text-slate-500">{visit.departmentName}</p>
            </div>
          </div>
        </TableCell>
        <TableCell onClick={() => onSelectVisit?.(visit)}>
          <Badge variant="outline">{EXAM_TYPE_LABELS[visit.type]}</Badge>
        </TableCell>
        <TableCell onClick={() => onSelectVisit?.(visit)}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {scheduledDate.toLocaleDateString("fr-FR")}
            </span>
            {visit.scheduledTime && (
              <span className="text-sm text-slate-400">{visit.scheduledTime}</span>
            )}
          </div>
        </TableCell>
        <TableCell onClick={() => onSelectVisit?.(visit)}>
          <span className="text-sm text-slate-600">{visit.location}</span>
        </TableCell>
        <TableCell onClick={() => onSelectVisit?.(visit)}>
          <Badge className={cn("flex items-center gap-1 w-fit", statusConfig.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </TableCell>
        <TableCell>
          {isPhysician && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelectVisit?.(visit)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditVisit?.(visit)}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDelete(visit.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Visites médicales
            </CardTitle>
            <CardDescription>
              Gestion des visites médicales planifiées
            </CardDescription>
          </div>
          {isPhysician && (
            <Button onClick={onCreateVisit}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle visite
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              Toutes ({allVisits?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              À venir ({upcomingVisits?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="relative">
              En retard ({overdueVisits?.length || 0})
              {(overdueVisits?.length || 0) > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Effectuées
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <Calendar className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-2">Aucune visite trouvée</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map(renderVisitRow)}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-slate-500 border-t pt-4">
          <span>{filteredVisits.length} visite{filteredVisits.length > 1 ? "s" : ""}</span>
          {(overdueVisits?.length || 0) > 0 && (
            <Badge variant="destructive">
              {overdueVisits?.length} en retard
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default VisitList;

