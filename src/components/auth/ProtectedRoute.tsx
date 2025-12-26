/**
 * ProtectedRoute - Wrapper component for authenticated routes
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  redirectPath?: string;
  requireEmailVerified?: boolean;
}

export default function ProtectedRoute({
  redirectPath = "/login",
  requireEmailVerified = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isEmailVerified, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Redirect to email verification page if email is not verified
  if (requireEmailVerified && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Render the protected content
  return <Outlet />;
}
