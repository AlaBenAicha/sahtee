/**
 * Employee Selector Component
 * 
 * A searchable dropdown component for selecting an employee from the organization.
 * Uses the useEmployeeSearch hook for debounced search functionality.
 */

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface EmployeeSelectorProps {
  /** Currently selected user */
  value?: User | null;
  /** Callback when user is selected */
  onSelect: (user: User | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Filter by department ID */
  departmentId?: string;
  /** Exclude specific user IDs */
  excludeUserIds?: string[];
  /** CSS class for the trigger button */
  className?: string;
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

export function EmployeeSelector({
  value,
  onSelect,
  placeholder = "Sélectionner un employé...",
  disabled = false,
  departmentId,
  excludeUserIds = [],
  className,
  error,
}: EmployeeSelectorProps) {
  const [open, setOpen] = useState(false);

  // Search hook for filtering
  const {
    searchQuery,
    setSearchQuery,
    employees: searchResults,
    isLoading: isSearching,
    clearSearch,
  } = useEmployeeSearch({
    departmentId,
    excludeUserIds,
    maxResults: 10,
  });

  // Get initial list of employees when no search query
  const { data: initialEmployees = [], isLoading: isLoadingInitial } = useOrganizationEmployees({
    limit: 20,
    departmentId,
  });

  // Use search results if searching, otherwise use initial list
  const displayEmployees = searchQuery.length >= 2 
    ? searchResults 
    : initialEmployees.filter((emp) => !excludeUserIds.includes(emp.id));

  const isLoading = isSearching || isLoadingInitial;

  // Clear search when popover closes
  useEffect(() => {
    if (!open) {
      clearSearch();
    }
  }, [open, clearSearch]);

  const handleSelect = (user: User) => {
    onSelect(user);
    setOpen(false);
  };

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500",
              className
            )}
          >
            {value ? (
              <div className="flex items-center gap-2 truncate">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={value.photoURL} alt={value.displayName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(value.displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{value.displayName}</span>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
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
                  {displayEmployees.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={employee.id}
                      onSelect={() => handleSelect(employee)}
                      className="flex items-center gap-3 py-2"
                    >
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
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value?.id === employee.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

/**
 * Simplified employee display component for showing a selected employee
 */
export function EmployeeDisplay({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-slate-50 p-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.photoURL} alt={user.displayName} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(user.displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">{user.displayName}</span>
        <span className="text-sm text-muted-foreground truncate">{user.email}</span>
      </div>
    </div>
  );
}

export default EmployeeSelector;
