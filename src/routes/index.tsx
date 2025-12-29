/**
 * Application Routes Configuration
 * With lazy loading for performance optimization
 */

import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layout - loaded eagerly as it's always needed
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FeatureGuard from "@/components/auth/FeatureGuard";

// Loading component for lazy-loaded pages
import { Loader2 } from "lucide-react";

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Public Pages - eagerly loaded for fast initial experience
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";

// Lazy-loaded public pages
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const AcceptInvitationPage = lazy(() => import("@/pages/auth/AcceptInvitationPage"));
const ReportPage = lazy(() => import("@/pages/public/ReportPage"));

// Lazy-loaded App Pages
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const CAPAPage = lazy(() => import("@/pages/capa/CAPAPage"));
const EquipmentPage = lazy(() => import("@/pages/equipment/EquipmentPage"));
const CompliancePage = lazy(() => import("@/pages/compliance/CompliancePage"));
const HealthPage = lazy(() => import("@/pages/health/HealthPage"));
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage"));
const AdminPage = lazy(() => import("@/pages/admin/AdminPage"));
const RolesPage = lazy(() => import("@/pages/admin/RolesPage"));
const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const OnboardingPage = lazy(() => import("@/pages/onboarding/OnboardingPage"));

// Error Pages
const NotFoundPage = lazy(() => import("@/pages/errors/NotFoundPage"));
const AccessDeniedPage = lazy(() => import("@/pages/errors/AccessDeniedPage"));

// Helper to wrap lazy components with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/forgot-password",
    element: withSuspense(ForgotPasswordPage),
  },
  {
    path: "/verify-email",
    element: withSuspense(VerifyEmailPage),
  },
  {
    path: "/accept-invitation",
    element: withSuspense(AcceptInvitationPage),
  },

  // Public reporting route (for QR code scans)
  {
    path: "/report",
    element: withSuspense(ReportPage),
  },
  {
    path: "/report/:code",
    element: withSuspense(ReportPage),
  },

  // Protected routes
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: (
              <FeatureGuard feature="dashboard">
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            // Incidents redirect to CAPA Room (incidents is now a tab in CAPA)
            path: "incidents",
            element: <Navigate to="/app/capa" replace />,
          },
          {
            path: "capa",
            element: (
              <FeatureGuard feature="capa">
                <Suspense fallback={<PageLoader />}>
                  <CAPAPage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            // Training redirect to CAPA Room (training is now a tab in CAPA)
            path: "training",
            element: <Navigate to="/app/capa" replace />,
          },
          {
            path: "equipment",
            element: (
              <FeatureGuard feature="equipment">
                <Suspense fallback={<PageLoader />}>
                  <EquipmentPage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            path: "compliance",
            element: (
              <FeatureGuard feature="compliance">
                <Suspense fallback={<PageLoader />}>
                  <CompliancePage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            path: "health",
            element: (
              <FeatureGuard feature="health">
                <Suspense fallback={<PageLoader />}>
                  <HealthPage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            path: "analytics",
            element: (
              <FeatureGuard feature="analytics">
                <Suspense fallback={<PageLoader />}>
                  <AnalyticsPage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            path: "admin",
            element: (
              <FeatureGuard feature="users">
                <Suspense fallback={<PageLoader />}>
                  <AdminPage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            path: "admin/roles",
            element: (
              <FeatureGuard feature="roles">
                <Suspense fallback={<PageLoader />}>
                  <RolesPage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            path: "admin/users",
            element: (
              <FeatureGuard feature="users">
                <Suspense fallback={<PageLoader />}>
                  <UsersPage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            path: "settings",
            element: (
              <FeatureGuard feature="settings">
                <Suspense fallback={<PageLoader />}>
                  <SettingsPage />
                </Suspense>
              </FeatureGuard>
            ),
          },
          {
            // Profile is always accessible to authenticated users
            path: "profile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            // Access denied page route
            path: "access-denied",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AccessDeniedPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // Onboarding (protected but separate layout)
  {
    path: "/onboarding",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <OnboardingPage />
          </Suspense>
        ),
      },
    ],
  },

  // 404
  {
    path: "*",
    element: withSuspense(NotFoundPage),
  },
]);

export default router;
