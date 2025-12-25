/**
 * Equipment Filters Component
 *
 * Provides filtering options for the equipment catalog including
 * category, status, priority, and search functionality.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import type { EquipmentCategory, EquipmentStatus, EquipmentPriority } from "@/types/capa";

export interface EquipmentFiltersType {
  searchQuery?: string;
  category?: EquipmentCategory[];
  status?: EquipmentStatus[];
  priority?: EquipmentPriority[];
}

interface EquipmentFiltersProps {
  currentFilters: EquipmentFiltersType;
  onFilterChange: (filters: EquipmentFiltersType) => void;
}

const categories: { value: EquipmentCategory; label: string }[] = [
  { value: "epi", label: "EPI" },
  { value: "ergonomie", label: "Ergonomie" },
  { value: "securite", label: "Sécurité" },
  { value: "signalisation", label: "Signalisation" },
  { value: "formation", label: "Formation" },
  { value: "autre", label: "Autre" },
];

const statuses: { value: EquipmentStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "approved", label: "Approuvé" },
  { value: "ordered", label: "Commandé" },
  { value: "received", label: "Reçu" },
  { value: "deployed", label: "Déployé" },
  { value: "rejected", label: "Rejeté" },
];

const priorities: { value: EquipmentPriority; label: string }[] = [
  { value: "critique", label: "Critique" },
  { value: "haute", label: "Haute" },
  { value: "moyenne", label: "Moyenne" },
  { value: "basse", label: "Basse" },
];

export function EquipmentFilters({ currentFilters, onFilterChange }: EquipmentFiltersProps) {
  const [searchValue, setSearchValue] = useState(currentFilters.searchQuery || "");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onFilterChange({ ...currentFilters, searchQuery: value || undefined });
  };

  const toggleCategory = (category: EquipmentCategory) => {
    const current = currentFilters.category || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onFilterChange({ ...currentFilters, category: updated.length > 0 ? updated : undefined });
  };

  const toggleStatus = (status: EquipmentStatus) => {
    const current = currentFilters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFilterChange({ ...currentFilters, status: updated.length > 0 ? updated : undefined });
  };

  const togglePriority = (priority: EquipmentPriority) => {
    const current = currentFilters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onFilterChange({ ...currentFilters, priority: updated.length > 0 ? updated : undefined });
  };

  const clearFilters = () => {
    setSearchValue("");
    onFilterChange({});
  };

  const activeFiltersCount =
    (currentFilters.category?.length || 0) +
    (currentFilters.status?.length || 0) +
    (currentFilters.priority?.length || 0) +
    (currentFilters.searchQuery ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Rechercher équipement..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Catégorie
            {currentFilters.category && currentFilters.category.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {currentFilters.category.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Catégories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {categories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.value}
              checked={currentFilters.category?.includes(category.value)}
              onCheckedChange={() => toggleCategory(category.value)}
            >
              {category.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Statut
            {currentFilters.status && currentFilters.status.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {currentFilters.status.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Statuts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statuses.map((status) => (
            <DropdownMenuCheckboxItem
              key={status.value}
              checked={currentFilters.status?.includes(status.value)}
              onCheckedChange={() => toggleStatus(status.value)}
            >
              {status.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Priorité
            {currentFilters.priority && currentFilters.priority.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {currentFilters.priority.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Priorités</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {priorities.map((priority) => (
            <DropdownMenuCheckboxItem
              key={priority.value}
              checked={currentFilters.priority?.includes(priority.value)}
              onCheckedChange={() => togglePriority(priority.value)}
            >
              {priority.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Effacer ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
}

