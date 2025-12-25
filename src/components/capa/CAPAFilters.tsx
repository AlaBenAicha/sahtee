/**
 * CAPA Filters Component
 * 
 * Filter bar for CAPA list/kanban views.
 * Supports filtering by status, priority, category, assignee, and date range.
 */

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Calendar,
  User,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CAPAFilters as CAPAFiltersType, ActionStatus, ActionPriority, ActionCategory } from "@/types/capa";

interface CAPAFiltersProps {
  filters: CAPAFiltersType;
  onFiltersChange: (filters: CAPAFiltersType) => void;
  className?: string;
}

const statusOptions: { value: ActionStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "pending_approval", label: "En attente" },
  { value: "approved", label: "Approuvé" },
  { value: "in_progress", label: "En cours" },
  { value: "blocked", label: "Bloqué" },
  { value: "completed", label: "Terminé" },
  { value: "verified", label: "Vérifié" },
  { value: "closed", label: "Clôturé" },
];

const priorityOptions: { value: ActionPriority; label: string; color: string }[] = [
  { value: "critique", label: "Critique", color: "bg-red-500" },
  { value: "haute", label: "Haute", color: "bg-orange-500" },
  { value: "moyenne", label: "Moyenne", color: "bg-yellow-500" },
  { value: "basse", label: "Basse", color: "bg-green-500" },
];

const categoryOptions: { value: ActionCategory; label: string }[] = [
  { value: "correctif", label: "Correctif" },
  { value: "preventif", label: "Préventif" },
];

export function CAPAFilters({ filters, onFiltersChange, className }: CAPAFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.status?.length,
    filters.priority?.length,
    filters.category?.length,
    filters.assigneeId,
    filters.dateRange,
  ].filter(Boolean).length;

  const handleStatusToggle = (status: ActionStatus) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, status: updated.length > 0 ? updated : undefined });
  };

  const handlePriorityToggle = (priority: ActionPriority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onFiltersChange({ ...filters, priority: updated.length > 0 ? updated : undefined });
  };

  const handleCategoryToggle = (category: ActionCategory) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onFiltersChange({ ...filters, category: updated.length > 0 ? updated : undefined });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value || undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const clearFilter = (key: keyof CAPAFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search and filter bar */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence, titre..."
            value={filters.searchQuery || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Filter popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtres</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto py-1 px-2 text-xs"
                  >
                    Tout effacer
                  </Button>
                )}
              </div>

              <Separator />

              {/* Priority filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  Priorité
                </Label>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handlePriorityToggle(option.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors",
                        "border hover:bg-muted",
                        filters.priority?.includes(option.value)
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border"
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full", option.color)} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  Statut
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.status?.includes(option.value) || false}
                        onCheckedChange={() => handleStatusToggle(option.value)}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase">
                  Catégorie
                </Label>
                <div className="flex gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleCategoryToggle(option.value)}
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded-md text-sm transition-colors",
                        "border hover:bg-muted",
                        filters.category?.includes(option.value)
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters pills */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          {filters.priority?.map((priority) => (
            <Badge
              key={priority}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  priorityOptions.find((p) => p.value === priority)?.color
                )}
              />
              {priorityOptions.find((p) => p.value === priority)?.label}
              <button
                onClick={() => handlePriorityToggle(priority)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {filters.status?.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1 pr-1">
              {statusOptions.find((s) => s.value === status)?.label}
              <button
                onClick={() => handleStatusToggle(status)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {filters.category?.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1 pr-1">
              {categoryOptions.find((c) => c.value === category)?.label}
              <button
                onClick={() => handleCategoryToggle(category)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1 pr-1">
              <Search className="h-3 w-3" />
              "{filters.searchQuery}"
              <button
                onClick={() => clearFilter("searchQuery")}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

