/**
 * View Toggle Component
 * 
 * Toggles between different view modes for CAPA lists.
 * Supports: Kanban, List, Calendar views.
 */

import { LayoutGrid, List, Calendar } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ViewMode } from "@/types/capa";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

const viewOptions: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: "kanban", label: "Kanban", icon: <LayoutGrid className="h-4 w-4" /> },
  { value: "list", label: "Liste", icon: <List className="h-4 w-4" /> },
  { value: "calendar", label: "Calendrier", icon: <Calendar className="h-4 w-4" /> },
];

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(value) => value && onViewChange(value as ViewMode)}
        className={className}
      >
        {viewOptions.map((option) => (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={option.value}
                aria-label={option.label}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {option.icon}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>{option.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}

