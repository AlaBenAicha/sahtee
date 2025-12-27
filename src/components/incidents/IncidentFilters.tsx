/**
 * Incident Filters Component
 * 
 * Provides filtering options for incidents including:
 * - Status filter
 * - Severity filter
 * - Type filter
 * - Date range picker
 * - Search input
 */

import { useState } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import type { IncidentSeverity, IncidentStatus } from "@/types/capa";

interface IncidentFiltersProps {
  onFilterChange: (filters: IncidentFilterValues) => void;
  currentFilters: IncidentFilterValues;
}

export interface IncidentFilterValues {
  status?: IncidentStatus[];
  severity?: IncidentSeverity[];
  type?: string[];
  searchQuery?: string;
  dateRange?: { start: Date; end: Date };
}

const statusOptions: { value: IncidentStatus; label: string }[] = [
  { value: "reported", label: "Signalé" },
  { value: "acknowledged", label: "Pris en compte" },
  { value: "investigating", label: "En investigation" },
  { value: "action_plan_created", label: "CAPA créé" },
  { value: "resolved", label: "Résolu" },
  { value: "closed", label: "Clôturé" },
];

const severityOptions: { value: IncidentSeverity; label: string }[] = [
  { value: "critical", label: "Critique" },
  { value: "severe", label: "Grave" },
  { value: "moderate", label: "Modéré" },
  { value: "minor", label: "Mineur" },
];

const typeOptions: { value: string; label: string }[] = [
  { value: "accident", label: "Accident" },
  { value: "near_miss", label: "Presqu'accident" },
  { value: "unsafe_condition", label: "Condition dangereuse" },
  { value: "unsafe_act", label: "Acte dangereux" },
];

const dateRangeOptions: { value: string; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "quarter", label: "Ce trimestre" },
  { value: "year", label: "Cette année" },
  { value: "all", label: "Tout" },
];

function getDateRange(rangeKey: string): { start: Date; end: Date } | undefined {
  const now = new Date();
  const start = new Date();

  switch (rangeKey) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(now.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      return undefined;
    default:
      return undefined;
  }

  return { start, end: now };
}

export function IncidentFilters({ onFilterChange, currentFilters }: IncidentFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(currentFilters.searchQuery || "");
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({ ...currentFilters, searchQuery: value || undefined });
  };

  const handleStatusChange = (status: IncidentStatus, checked: boolean) => {
    const currentStatuses = currentFilters.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter((s) => s !== status);
    onFilterChange({ ...currentFilters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleSeverityChange = (severity: IncidentSeverity, checked: boolean) => {
    const currentSeverities = currentFilters.severity || [];
    const newSeverities = checked
      ? [...currentSeverities, severity]
      : currentSeverities.filter((s) => s !== severity);
    onFilterChange({ ...currentFilters, severity: newSeverities.length > 0 ? newSeverities : undefined });
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    const currentTypes = currentFilters.type || [];
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter((t) => t !== type);
    onFilterChange({ ...currentFilters, type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleDateRangeChange = (value: string) => {
    setSelectedDateRange(value);
    const dateRange = getDateRange(value);
    onFilterChange({ ...currentFilters, dateRange });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedDateRange("all");
    onFilterChange({});
  };

  const activeFilterCount = [
    currentFilters.status?.length || 0,
    currentFilters.severity?.length || 0,
    currentFilters.type?.length || 0,
    currentFilters.dateRange ? 1 : 0,
    currentFilters.searchQuery ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8 w-[200px]"
        />
      </div>

      {/* Date Range Select */}
      <Select value={selectedDateRange} onValueChange={handleDateRangeChange}>
        <SelectTrigger className="w-[160px]">
          <Calendar className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Advanced Filters Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Status */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Statut</h4>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={currentFilters.status?.includes(option.value) || false}
                      onCheckedChange={(checked) =>
                        handleStatusChange(option.value, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`status-${option.value}`}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Severity */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Gravité</h4>
              <div className="grid grid-cols-2 gap-2">
                {severityOptions.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`severity-${option.value}`}
                      checked={currentFilters.severity?.includes(option.value) || false}
                      onCheckedChange={(checked) =>
                        handleSeverityChange(option.value, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`severity-${option.value}`}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Type */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Type</h4>
              <div className="space-y-2">
                {typeOptions.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`type-${option.value}`}
                      checked={currentFilters.type?.includes(option.value) || false}
                      onCheckedChange={(checked) =>
                        handleTypeChange(option.value, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`type-${option.value}`}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1">
          <X className="h-3 w-3" />
          Effacer
        </Button>
      )}
    </div>
  );
}

