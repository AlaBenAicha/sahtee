/**
 * CAPA Page - Corrective and Preventive Actions
 * 
 * Main page for managing CAPAs with Kanban/List views.
 * Enforces CRUD permissions using FeatureGuard and useFeaturePermissions.
 */

import { useState } from "react";
import { Plus, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CAPAStatusTiles,
  CAPAFilters,
  ViewToggle,
  CAPAKanbanBoard,
  CAPAListView,
  CAPADetailModal,
  CAPAForm,
} from "@/components/capa";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { ActionPlan, CAPAFilters as CAPAFiltersType, ViewMode } from "@/types/capa";

export default function CAPAPage() {
  const { canCreate, canRead } = useFeaturePermissions("capa");

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filters, setFilters] = useState<CAPAFiltersType>({});
  const [selectedCapa, setSelectedCapa] = useState<ActionPlan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCapa, setEditingCapa] = useState<ActionPlan | null>(null);

  const handleCAPAClick = (capa: ActionPlan) => {
    setSelectedCapa(capa);
    setShowDetailModal(true);
  };

  const handleCreateClick = () => {
    setEditingCapa(null);
    setShowFormModal(true);
  };

  const handleEditClick = (capa: ActionPlan) => {
    setEditingCapa(capa);
    setShowFormModal(true);
    setShowDetailModal(false);
  };

  const handleEditFromDetail = () => {
    if (selectedCapa) {
      setEditingCapa(selectedCapa);
      setShowFormModal(true);
      setShowDetailModal(false);
    }
  };

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Accès restreint</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          Vous n'avez pas les permissions nécessaires pour accéder au module CAPA.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CAPA Room</h1>
          <p className="text-muted-foreground mt-1">
            Actions Correctives et Préventives
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle action
            </Button>
          )}
        </div>
      </div>

      {/* KPI Status Tiles */}
      <CAPAStatusTiles />

      {/* Main content tabs */}
      <Tabs defaultValue="actions" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="actions">Plan d'actions</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              CAPA-AI
            </TabsTrigger>
          </TabsList>

          {/* View toggle - only for actions tab */}
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>

        <TabsContent value="actions" className="space-y-4">
          {/* Filters */}
          <CAPAFilters filters={filters} onFiltersChange={setFilters} />

          {/* View content */}
          {viewMode === "kanban" ? (
            <CAPAKanbanBoard
              onCAPAClick={handleCAPAClick}
              onCreateClick={handleCreateClick}
            />
          ) : viewMode === "list" ? (
            <CAPAListView
              filters={filters}
              onCAPAClick={handleCAPAClick}
              onEditClick={handleEditClick}
            />
          ) : (
            // Calendar view - placeholder for now
            <div className="flex items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
              Vue calendrier à venir
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          {/* AI Panel content */}
          <div className="rounded-lg border bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-8">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="rounded-full bg-violet-100 dark:bg-violet-900/50 p-4 mb-4">
                <Sparkles className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold">CAPA-AI</h3>
              <p className="text-muted-foreground mt-2">
                L'assistant IA analyse vos incidents et propose des actions
                correctives intelligentes basées sur les meilleures pratiques.
              </p>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Analyser les incidents
                </Button>
                <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                  <Sparkles className="h-4 w-4" />
                  Générer des suggestions
                </Button>
              </div>
            </div>
          </div>

          {/* AI Suggestions placeholder */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border p-4 space-y-3 bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    <span className="text-xs text-muted-foreground">
                      Suggestion #{i}
                    </span>
                  </div>
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded dark:bg-violet-900/40">
                    85% confiance
                  </span>
                </div>
                <h4 className="font-medium text-sm">
                  Exemple de suggestion IA #{i}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Description de l'action suggérée basée sur l'analyse des
                  incidents récents et des tendances identifiées.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Ignorer
                  </Button>
                  <Button size="sm" className="flex-1">
                    Accepter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <CAPADetailModal
        capaId={selectedCapa?.id || null}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onEditClick={handleEditFromDetail}
      />

      {/* Create/Edit Form Modal */}
      <CAPAForm
        capa={editingCapa}
        open={showFormModal}
        onOpenChange={setShowFormModal}
      />
    </div>
  );
}
