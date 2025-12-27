/**
 * Exposure Selector Component
 * 
 * A searchable multi-select component for selecting exposures from OrganizationExposure records.
 * Supports selecting existing exposures or creating new ones inline.
 */

import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, Plus, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useExposures } from "@/hooks/useHealth";
import { ExposureForm } from "@/components/health/ExposureForm";
import type { OrganizationExposure, HazardCategory } from "@/types/health";

const HAZARD_TYPE_CONFIG: Record<HazardCategory, { label: string; color: string }> = {
  physical: { label: "Physique", color: "bg-purple-100 text-purple-700" },
  chemical: { label: "Chimique", color: "bg-orange-100 text-orange-700" },
  biological: { label: "Biologique", color: "bg-green-100 text-green-700" },
  ergonomic: { label: "Ergonomique", color: "bg-pink-100 text-pink-700" },
  psychosocial: { label: "Psychosocial", color: "bg-indigo-100 text-indigo-700" },
  mechanical: { label: "Mécanique", color: "bg-slate-100 text-slate-700" },
  electrical: { label: "Électrique", color: "bg-yellow-100 text-yellow-700" },
  thermal: { label: "Thermique", color: "bg-red-100 text-red-700" },
  environmental: { label: "Environnemental", color: "bg-teal-100 text-teal-700" },
};

const ALERT_LEVEL_CONFIG = {
  low: { label: "Faible", color: "bg-emerald-100 text-emerald-700" },
  moderate: { label: "Modéré", color: "bg-blue-100 text-blue-700" },
  elevated: { label: "Élevé", color: "bg-amber-100 text-amber-700" },
  critical: { label: "Critique", color: "bg-red-100 text-red-700" },
};

interface ExposureSelectorProps {
  /** Currently selected exposure IDs */
  value: string[];
  /** Callback when selection changes */
  onChange: (exposureIds: string[], exposures: OrganizationExposure[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** CSS class for the trigger button */
  className?: string;
  /** Error message to display */
  error?: string;
  /** Employee ID to pre-fill when creating new exposure */
  employeeId?: string;
}

export function ExposureSelector({
  value,
  onChange,
  placeholder = "Sélectionner des expositions...",
  disabled = false,
  className,
  error,
  employeeId,
}: ExposureSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedExposures, setSelectedExposures] = useState<OrganizationExposure[]>([]);

  // Fetch all exposures for the organization
  const { data: allExposures = [], isLoading } = useExposures({});

  // Filter exposures based on search query
  const filteredExposures = allExposures.filter((exposure) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      exposure.agent.toLowerCase().includes(query) ||
      exposure.area.toLowerCase().includes(query) ||
      HAZARD_TYPE_CONFIG[exposure.hazardType]?.label.toLowerCase().includes(query)
    );
  });

  // Sync selectedExposures with value prop
  useEffect(() => {
    if (value.length === 0) {
      setSelectedExposures([]);
      return;
    }
    
    // Get exposure objects for the selected IDs
    const selected = allExposures.filter((exp) => value.includes(exp.id));
    setSelectedExposures(selected);
  }, [value, allExposures]);

  const handleSelect = useCallback((exposure: OrganizationExposure) => {
    const isSelected = value.includes(exposure.id);
    
    let newIds: string[];
    let newExposures: OrganizationExposure[];
    
    if (isSelected) {
      // Remove from selection
      newIds = value.filter((id) => id !== exposure.id);
      newExposures = selectedExposures.filter((exp) => exp.id !== exposure.id);
    } else {
      // Add to selection
      newIds = [...value, exposure.id];
      newExposures = [...selectedExposures, exposure];
    }
    
    setSelectedExposures(newExposures);
    onChange(newIds, newExposures);
  }, [value, selectedExposures, onChange]);

  const handleRemove = useCallback((exposureId: string) => {
    const newIds = value.filter((id) => id !== exposureId);
    const newExposures = selectedExposures.filter((exp) => exp.id !== exposureId);
    setSelectedExposures(newExposures);
    onChange(newIds, newExposures);
  }, [value, selectedExposures, onChange]);

  const handleExposureCreated = useCallback((newExposure: Partial<OrganizationExposure>) => {
    // After creation, the exposure will have an ID and be in the allExposures list
    // We'll select it automatically once the form closes and data refetches
    if (newExposure.id) {
      const fullExposure = newExposure as OrganizationExposure;
      const newIds = [...value, fullExposure.id];
      const newExposures = [...selectedExposures, fullExposure];
      setSelectedExposures(newExposures);
      onChange(newIds, newExposures);
    }
    setShowCreateForm(false);
  }, [value, selectedExposures, onChange]);

  return (
    <div className="space-y-2">
      {/* Selected Exposures Display */}
      {selectedExposures.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedExposures.map((exposure) => {
            const hazardConfig = HAZARD_TYPE_CONFIG[exposure.hazardType];
            const alertConfig = ALERT_LEVEL_CONFIG[exposure.alertLevel];
            
            return (
              <Badge
                key={exposure.id}
                variant="secondary"
                className="flex items-center gap-1 py-1 px-2"
              >
                <AlertTriangle className={cn("h-3 w-3", alertConfig?.color?.includes("red") ? "text-red-500" : "text-amber-500")} />
                <span className="font-medium">{exposure.agent}</span>
                <span className="text-xs text-muted-foreground">({hazardConfig?.label})</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(exposure.id);
                    }}
                    className="ml-1 rounded-full hover:bg-slate-200 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Selector Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              selectedExposures.length === 0 && "text-muted-foreground",
              error && "border-red-500",
              className
            )}
          >
            <span>
              {selectedExposures.length > 0
                ? `${selectedExposures.length} exposition${selectedExposures.length > 1 ? "s" : ""} sélectionnée${selectedExposures.length > 1 ? "s" : ""}`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Rechercher une exposition..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isLoading && filteredExposures.length === 0 && (
                <CommandEmpty>
                  Aucune exposition trouvée.
                </CommandEmpty>
              )}

              {!isLoading && filteredExposures.length > 0 && (
                <CommandGroup heading="Expositions">
                  {filteredExposures.map((exposure) => {
                    const isSelected = value.includes(exposure.id);
                    const hazardConfig = HAZARD_TYPE_CONFIG[exposure.hazardType];
                    const alertConfig = ALERT_LEVEL_CONFIG[exposure.alertLevel];
                    
                    return (
                      <CommandItem
                        key={exposure.id}
                        value={exposure.id}
                        onSelect={() => handleSelect(exposure)}
                        className="flex items-center gap-3 py-2"
                      >
                        <div className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border",
                          isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {exposure.agent}
                            </span>
                            <Badge className={cn("text-xs", hazardConfig?.color)}>
                              {hazardConfig?.label}
                            </Badge>
                            <Badge className={cn("text-xs", alertConfig?.color)}>
                              {alertConfig?.label}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground truncate">
                            {exposure.area} • {exposure.percentOfLimit?.toFixed(0) || 0}% de la limite
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              <CommandSeparator />
              
              {/* Create New Button */}
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCreateForm(true);
                  }}
                  className="flex items-center gap-2 py-2 text-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span>Créer une nouvelle exposition</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Create Exposure Form Modal */}
      <ExposureForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={handleExposureCreated}
      />
    </div>
  );
}

/**
 * Display component for showing selected exposures in read-only mode
 */
export function ExposureDisplay({ exposures }: { exposures: OrganizationExposure[] }) {
  if (exposures.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune exposition enregistrée
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {exposures.map((exposure) => {
        const hazardConfig = HAZARD_TYPE_CONFIG[exposure.hazardType];
        const alertConfig = ALERT_LEVEL_CONFIG[exposure.alertLevel];
        
        return (
          <div
            key={exposure.id}
            className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn(
                "h-4 w-4",
                exposure.alertLevel === "critical" || exposure.alertLevel === "elevated"
                  ? "text-red-500"
                  : "text-amber-500"
              )} />
              <div>
                <p className="font-medium text-slate-700">{exposure.agent}</p>
                <p className="text-xs text-slate-500">
                  {exposure.area} • {hazardConfig?.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs", alertConfig?.color)}>
                {exposure.percentOfLimit?.toFixed(0) || 0}%
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ExposureSelector;

