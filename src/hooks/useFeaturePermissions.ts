/**
 * useFeaturePermissions - Hook for CRUD permission checks
 * 
 * Provides granular CRUD permission checks for a specific feature module.
 * Use this hook in page components to control button states, form visibility, etc.
 */

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { FeatureModule, CRUDPermissions } from "@/types/organization";

interface FeaturePermissionsResult {
  /** Whether the user can create items in this feature */
  canCreate: boolean;
  /** Whether the user can read/view items in this feature */
  canRead: boolean;
  /** Whether the user can update/edit items in this feature */
  canUpdate: boolean;
  /** Whether the user can delete items in this feature */
  canDelete: boolean;
  /** The full CRUD permissions object */
  permissions: CRUDPermissions;
  /** Whether the user has any access to this feature */
  hasAnyAccess: boolean;
  /** Whether the user has full (all CRUD) access to this feature */
  hasFullAccess: boolean;
}

/**
 * Hook to get CRUD permissions for a specific feature module
 * 
 * @param feature - The feature module to check permissions for
 * @returns Object with boolean flags for each CRUD operation
 * 
 * @example
 * ```tsx
 * const { canCreate, canUpdate, canDelete } = useFeaturePermissions("compliance");
 * 
 * return (
 *   <Button disabled={!canCreate}>
 *     <Plus /> Nouvel audit
 *   </Button>
 * );
 * ```
 */
export function useFeaturePermissions(feature: FeatureModule): FeaturePermissionsResult {
  const { getFeaturePermissions } = useAuth();

  return useMemo(() => {
    const permissions = getFeaturePermissions(feature);
    
    const canCreate = permissions.create;
    const canRead = permissions.read;
    const canUpdate = permissions.update;
    const canDelete = permissions.delete;
    
    return {
      canCreate,
      canRead,
      canUpdate,
      canDelete,
      permissions,
      hasAnyAccess: canCreate || canRead || canUpdate || canDelete,
      hasFullAccess: canCreate && canRead && canUpdate && canDelete,
    };
  }, [feature, getFeaturePermissions]);
}

export default useFeaturePermissions;

