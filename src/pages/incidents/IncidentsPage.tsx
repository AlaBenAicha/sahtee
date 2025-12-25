/**
 * Incidents Page
 * 
 * Main page for incident management with:
 * - Summary tiles showing key statistics
 * - Filters for status, severity, type, and date range
 * - View toggle (grid/list)
 * - Incident list with sorting
 * - Create/Edit incident form
 * - Detail modal
 */

import { useState } from "react";
import {
  AlertTriangle,
  Plus,
  Grid3X3,
  List,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IncidentCard,
  IncidentsList,
  IncidentFilters,
  IncidentFilterValues,
  IncidentForm,
  IncidentDetailModal,
} from "@/components/incidents";
import CRUDGuard from "@/components/auth/CRUDGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useIncidents, useIncidentStats } from "@/hooks/useIncidents";
import { toast } from "sonner";
import type { Incident } from "@/types/capa";

type ViewMode = "grid" | "list";

export default function IncidentsPage() {
  const { canPerformAction } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<IncidentFilterValues>({});
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: incidents = [], isLoading, error } = useIncidents(filters);
  const { data: stats, isLoading: isLoadingStats } = useIncidentStats();

  const handleFilterChange = (newFilters: IncidentFilterValues) => {
    setFilters(newFilters);
  };

  const handleOpenIncidentForm = (incident?: Incident) => {
    setSelectedIncident(incident || null);
    setShowIncidentForm(true);
  };

  const handleCloseIncidentForm = () => {
    setShowIncidentForm(false);
    setSelectedIncident(null);
  };

  const handleOpenIncidentDetail = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailOpen(true);
  };

  const handleCloseIncidentDetail = () => {
    setIsDetailOpen(false);
    setSelectedIncident(null);
  };

  const handleEditFromDetail = () => {
    setIsDetailOpen(false);
    setShowIncidentForm(true);
  };

  if (error) {
    toast.error("Erreur lors du chargement des incidents", { description: error.message });
  }

  const canCreateIncident = canPerformAction("incidents", "create");

  // Calculate trend
  const trend = stats
    ? stats.thisMonth - stats.lastMonth
    : 0;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-red-500" : trend < 0 ? "text-green-500" : "text-muted-foreground";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Incidents
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez et suivez les incidents de sécurité
          </p>
        </div>
        {canCreateIncident && (
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => handleOpenIncidentForm()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Déclarer un incident
          </Button>
        )}
      </div>

      {/* Stats Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.thisMonth || 0}</div>
                {trend !== 0 && (
                  <p className={`text-xs ${trendColor}`}>
                    {trend > 0 ? "+" : ""}{trend} vs mois dernier
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En investigation</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                {stats?.pendingInvestigation || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                {stats?.bySeverity?.critical || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <IncidentFilters
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as ViewMode)}
        >
          <ToggleGroupItem value="grid" aria-label="Vue grille">
            <Grid3X3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Vue liste">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Content */}
      <CRUDGuard feature="incidents" action="read">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
                <AlertTriangle className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Aucun incident trouvé
              </h3>
              <p className="text-slate-500 mt-2 max-w-md">
                {Object.keys(filters).length > 0
                  ? "Modifiez vos filtres ou créez un nouveau signalement"
                  : "Vous n'avez pas encore signalé d'incidents. Cliquez sur le bouton ci-dessus pour en créer un."}
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onClick={() => handleOpenIncidentDetail(incident)}
              />
            ))}
          </div>
        ) : (
          <IncidentsList
            filters={filters}
            onIncidentClick={handleOpenIncidentDetail}
            onEditClick={handleOpenIncidentForm}
          />
        )}
      </CRUDGuard>

      {/* Incident Form Modal */}
      <IncidentForm
        incident={selectedIncident}
        isOpen={showIncidentForm}
        onClose={handleCloseIncidentForm}
      />

      {/* Incident Detail Modal */}
      {selectedIncident && isDetailOpen && (
        <IncidentDetailModal
          incident={selectedIncident}
          isOpen={isDetailOpen}
          onClose={handleCloseIncidentDetail}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
}
