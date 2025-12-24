/**
 * CRUDGuard - Component for protecting CRUD-specific pages
 * 
 * Use this component to protect pages that require specific CRUD permissions
 * (e.g., create page requires 'create' permission, edit page requires 'update' permission).
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { FeatureModule, CRUDPermissions } from "@/types/organization";
import { Loader2 } from "lucide-react";

interface CRUDGuardProps {
  /** The feature module to check access for */
  feature: FeatureModule;
  /** The CRUD action required (create, read, update, delete) */
  action: keyof CRUDPermissions;
  /** The content to render if access is granted */
  children: React.ReactNode;
  /** Optional custom fallback (defaults to redirect to AccessDenied) */
  fallback?: React.ReactNode;
  /** Path to redirect to when access is denied (defaults to /app/access-denied) */
  redirectPath?: string;
}

/**
 * CRUDGuard - Protects pages based on specific CRUD permissions
 * 
 * @example
 * ```tsx
 * // Protect an edit page - requires 'update' permission
 * <CRUDGuard feature="compliance" action="update">
 *   <EditCompliancePage />
 * </CRUDGuard>
 * 
 * // Protect a create page - requires 'create' permission
 * <CRUDGuard feature="incidents" action="create">
 *   <CreateIncidentPage />
 * </CRUDGuard>
 * ```
 */
export default function CRUDGuard({
  feature,
  action,
  children,
  fallback,
  redirectPath = "/app/access-denied",
}: CRUDGuardProps) {
  const { canPerformAction, loading, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth/permissions
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-500">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, let ProtectedRoute handle the redirect
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Check if user can perform the required action on this feature
  const hasPermission = canPerformAction(feature, action);

  if (!hasPermission) {
    // Return custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirect to access denied page
    return <Navigate to={redirectPath} replace />;
  }

  // User has permission, render children
  return <>{children}</>;
}

