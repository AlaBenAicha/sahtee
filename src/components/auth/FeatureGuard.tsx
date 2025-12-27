/**
 * FeatureGuard - Route-level access control component
 * 
 * Checks if the current user has read access to a feature module.
 * If not, redirects to the Access Denied page.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { FeatureModule } from "@/types/organization";
import { Loader2 } from "lucide-react";

interface FeatureGuardProps {
  /** The feature module to check access for */
  feature: FeatureModule;
  /** The content to render if access is granted */
  children: React.ReactNode;
  /** Optional custom fallback (defaults to redirect to AccessDenied) */
  fallback?: React.ReactNode;
  /** Path to redirect to when access is denied (defaults to /app/access-denied) */
  redirectPath?: string;
}

export default function FeatureGuard({
  feature,
  children,
  fallback,
  redirectPath = "/app/access-denied",
}: FeatureGuardProps) {
  const { canAccessFeature, loading, isAuthenticated } = useAuth();

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

  // Check if user can access this feature
  const hasAccess = canAccessFeature(feature);

  if (!hasAccess) {
    // Return custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirect to access denied page
    return <Navigate to={redirectPath} replace />;
  }

  // User has access, render children
  return <>{children}</>;
}

