/**
 * Training Catalog Component
 * 
 * Displays available trainings in a grid with filters.
 */

import { useState } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Grid3X3,
  List,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrainingCard } from "./TrainingCard";
import { useTrainingPlans } from "@/hooks/useTrainings";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { TrainingPlan, TrainingPriority } from "@/types/capa";

interface TrainingCatalogProps {
  onCreateClick: () => void;
  onTrainingClick: (training: TrainingPlan) => void;
  onEnrollClick?: (training: TrainingPlan) => void;
}

type ViewMode = "grid" | "list";

export function TrainingCatalog({
  onCreateClick,
  onTrainingClick,
  onEnrollClick,
}: TrainingCatalogProps) {
  const { canCreate } = useFeaturePermissions("training");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TrainingPriority>("all");
  const [mandatoryFilter, setMandatoryFilter] = useState<"all" | "mandatory" | "optional">("all");

  const filters = {
    searchQuery: searchQuery || undefined,
    priority: priorityFilter !== "all" ? [priorityFilter] : undefined,
    mandatory: mandatoryFilter === "all" ? undefined : mandatoryFilter === "mandatory",
  };

  const { data: trainings = [], isLoading, error } = useTrainingPlans(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-red-500">Erreur lors du chargement des formations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="obligatoire">Obligatoire</SelectItem>
              <SelectItem value="recommandee">Recommandée</SelectItem>
              <SelectItem value="optionnelle">Optionnelle</SelectItem>
            </SelectContent>
          </Select>

          {/* Mandatory Filter */}
          <Select value={mandatoryFilter} onValueChange={(v) => setMandatoryFilter(v as typeof mandatoryFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="mandatory">Obligatoires</SelectItem>
              <SelectItem value="optional">Optionnelles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
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

          {/* Create Button */}
          {canCreate && (
            <Button onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle formation
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {trainings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Aucune formation trouvée</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {searchQuery || priorityFilter !== "all" || mandatoryFilter !== "all"
                ? "Modifiez vos filtres ou créez une nouvelle formation"
                : "Créez des formations pour vos collaborateurs"}
            </p>
            {canCreate && (
              <Button onClick={onCreateClick} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Créer une formation
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainings.map((training) => (
            <TrainingCard
              key={training.id}
              training={training}
              onClick={() => onTrainingClick(training)}
              onEnroll={onEnrollClick ? () => onEnrollClick(training) : undefined}
              showEnrollButton={!!onEnrollClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {trainings.map((training) => (
            <TrainingCard
              key={training.id}
              training={training}
              onClick={() => onTrainingClick(training)}
              onEnroll={onEnrollClick ? () => onEnrollClick(training) : undefined}
              showEnrollButton={!!onEnrollClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

