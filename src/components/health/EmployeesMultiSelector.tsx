/**
 * Employees Multi-Selector Component
 * 
 * A searchable dropdown component for selecting multiple employees from the organization.
 * Used for OrganizationExposure and other features requiring multi-employee selection.
 */

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
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
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEmployeeSearch, useOrganizationEmployees } from "@/hooks/useEmployeeSearch";
import type { User } from "@/types/user";

interface EmployeesMultiSelectorProps {
  /** Currently selected users */
  value: User[];
  /** Callback when selection changes */
  onChange: (users: User[]) => void;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Filter by department ID */
  departmentId?: string;
  /** CSS class for the trigger button */
  className?: string;
  /** Maximum number of employees that can be selected */
  maxSelection?: number;
  /** Error message to display */
  error?: string;
}

/**
 * Get user initials for avatar fallback
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function EmployeesMultiSelector({
  value = [],
  onChange,
  placeholder = "Sélectionner des employés...",
  disabled = false,
  departmentId,
  className,
  maxSelection,
  error,
}: EmployeesMultiSelectorProps) {
  const [open, setOpen] = useState(false);

  // Get selected user IDs for exclusion
  const selectedIds = useMemo(() => value.map((u) => u.id), [value]);

  // Search hook for filtering
  const {
    searchQuery,
    setSearchQuery,
    employees: searchResults,
    isLoading: isSearching,
    clearSearch,
  } = useEmployeeSearch({
    departmentId,
    maxResults: 15,
  });

  // Get initial list of employees when no search query
  const { data: initialEmployees = [], isLoading: isLoadingInitial } = useOrganizationEmployees({
    limit: 30,
    departmentId,
  });

  // Use search results if searching, otherwise use initial list
  const displayEmployees = searchQuery.length >= 2 ? searchResults : initialEmployees;

  const isLoading = isSearching || isLoadingInitial;
  const isMaxSelected = maxSelection ? value.length >= maxSelection : false;

  // Clear search when popover closes
  useEffect(() => {
    if (!open) {
      clearSearch();
    }
  }, [open, clearSearch]);

  const handleToggle = (user: User) => {
    const isSelected = selectedIds.includes(user.id);
    
    if (isSelected) {
      // Remove user
      onChange(value.filter((u) => u.id !== user.id));
    } else if (!isMaxSelected) {
      // Add user
      onChange([...value, user]);
    }
  };

  const handleRemove = (userId: string) => {
    onChange(value.filter((u) => u.id !== userId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal min-h-[40px] h-auto py-2",
              value.length === 0 && "text-muted-foreground",
              error && "border-red-500",
              className
            )}
          >
            <span className="truncate">
              {value.length === 0
                ? placeholder
                : `${value.length} employé${value.length > 1 ? "s" : ""} sélectionné${value.length > 1 ? "s" : ""}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Rechercher un employé..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {!isLoading && displayEmployees.length === 0 && (
                <CommandEmpty>
                  {searchQuery.length >= 2
                    ? "Aucun employé trouvé."
                    : "Commencez à taper pour rechercher..."}
                </CommandEmpty>
              )}

              {!isLoading && displayEmployees.length > 0 && (
                <CommandGroup heading="Employés">
                  {displayEmployees.map((employee) => {
                    const isSelected = selectedIds.includes(employee.id);
                    const isDisabledItem = !isSelected && isMaxSelected;
                    
                    return (
                      <CommandItem
                        key={employee.id}
                        value={employee.id}
                        onSelect={() => handleToggle(employee)}
                        disabled={isDisabledItem}
                        className={cn(
                          "flex items-center gap-3 py-2",
                          isDisabledItem && "opacity-50"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={employee.photoURL} alt={employee.displayName} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(employee.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">
                            {employee.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {employee.email}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected employees as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((user) => (
            <Badge
              key={user.id}
              variant="secondary"
              className="flex items-center gap-1 py-1 pl-1 pr-2"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={user.photoURL} alt={user.displayName} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[120px]">{user.displayName}</span>
              <button
                type="button"
                onClick={() => handleRemove(user.id)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {maxSelection && (
        <p className="text-xs text-muted-foreground">
          {value.length} / {maxSelection} employés sélectionnés
        </p>
      )}
    </div>
  );
}

export default EmployeesMultiSelector;
