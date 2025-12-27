/**
 * Employee Search Hook
 * 
 * Provides debounced search functionality for organization employees.
 * Uses searchUsers from userService with React Query for caching.
 */

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { searchUsers, getUsersByOrganization } from "@/services/userService";
import type { User } from "@/types/user";

interface UseEmployeeSearchOptions {
  /** Minimum characters to trigger search (default: 2) */
  minSearchLength?: number;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Maximum results to return (default: 10) */
  maxResults?: number;
  /** Filter by department ID */
  departmentId?: string;
  /** Exclude specific user IDs from results */
  excludeUserIds?: string[];
}

interface UseEmployeeSearchResult {
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Search results */
  employees: User[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Clear search */
  clearSearch: () => void;
}

/**
 * Hook for searching employees within the organization
 */
export function useEmployeeSearch(
  options: UseEmployeeSearchOptions = {}
): UseEmployeeSearchResult {
  const {
    minSearchLength = 2,
    debounceMs = 300,
    maxResults = 10,
    departmentId,
    excludeUserIds = [],
  } = options;

  const { userProfile } = useAuth();
  const organizationId = userProfile?.organizationId || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const shouldSearch = debouncedQuery.length >= minSearchLength && !!organizationId;

  // Query for searching employees
  const {
    data: searchResults = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employee-search", organizationId, debouncedQuery, departmentId],
    queryFn: async () => {
      if (!shouldSearch) return [];
      
      const results = await searchUsers(organizationId, debouncedQuery, maxResults * 2);
      
      // Filter by department if specified
      let filtered = departmentId
        ? results.filter((user) => user.departmentId === departmentId)
        : results;
      
      // Exclude specified user IDs
      if (excludeUserIds.length > 0) {
        filtered = filtered.filter((user) => !excludeUserIds.includes(user.id));
      }
      
      return filtered.slice(0, maxResults);
    },
    enabled: shouldSearch,
    staleTime: 30000, // Cache for 30 seconds
  });

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  // Filter results by excluded IDs (memoized)
  const employees = useMemo(() => {
    return searchResults;
  }, [searchResults]);

  return {
    searchQuery,
    setSearchQuery,
    employees,
    isLoading: shouldSearch && isLoading,
    error: error as Error | null,
    clearSearch,
  };
}

/**
 * Hook for fetching all employees (for initial list display)
 */
export function useOrganizationEmployees(
  options: { limit?: number; departmentId?: string } = {}
) {
  const { limit = 20, departmentId } = options;
  const { userProfile } = useAuth();
  const organizationId = userProfile?.organizationId || "";

  return useQuery({
    queryKey: ["organization-employees", organizationId, departmentId, limit],
    queryFn: async () => {
      const result = await getUsersByOrganization(organizationId, { page: 1, limit });
      
      let items = result.items;
      
      // Filter by department if specified
      if (departmentId) {
        items = items.filter((user) => user.departmentId === departmentId);
      }
      
      return items;
    },
    enabled: !!organizationId,
    staleTime: 60000, // Cache for 1 minute
  });
}

export default useEmployeeSearch;
