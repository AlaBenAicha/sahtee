/**
 * Application Routes Configuration
 */

import { createBrowserRouter, Navigate } from "react-router-dom";

// Layout
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FeatureGuard from "@/components/auth/FeatureGuard";

// Public Pages
import LandingPage from "@/pages/LandingPage";
import ReportPage from "@/pages/public/ReportPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

// App Pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import IncidentsPage from "@/pages/incidents/IncidentsPage";
import CAPAPage from "@/pages/capa/CAPAPage";
import TrainingPage from "@/pages/training/TrainingPage";
import EquipmentPage from "@/pages/equipment/EquipmentPage";
import CompliancePage from "@/pages/compliance/CompliancePage";
import HealthPage from "@/pages/health/HealthPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import AdminPage from "@/pages/admin/AdminPage";
import RolesPage from "@/pages/admin/RolesPage";
import UsersPage from "@/pages/admin/UsersPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import AcceptInvitationPage from "@/pages/auth/AcceptInvitationPage";

// Onboarding
import OnboardingPage from "@/pages/onboarding/OnboardingPage";

// Error Pages
import NotFoundPage from "@/pages/errors/NotFoundPage";
import AccessDeniedPage from "@/pages/errors/AccessDeniedPage";

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
    element: <ForgotPasswordPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/accept-invitation",
    element: <AcceptInvitationPage />,
  },

  // Public reporting route (for QR code scans)
  {
    path: "/report",
    element: <ReportPage />,
  },
  {
    path: "/report/:code",
    element: <ReportPage />,
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
                <DashboardPage />
              </FeatureGuard>
            ),
          },
          {
            path: "incidents",
            element: (
              <FeatureGuard feature="incidents">
                <IncidentsPage />
              </FeatureGuard>
            ),
          },
          {
            path: "capa",
            element: (
              <FeatureGuard feature="capa">
                <CAPAPage />
              </FeatureGuard>
            ),
          },
          {
            path: "training",
            element: (
              <FeatureGuard feature="training">
                <TrainingPage />
              </FeatureGuard>
            ),
          },
          {
            path: "equipment",
            element: (
              <FeatureGuard feature="equipment">
                <EquipmentPage />
              </FeatureGuard>
            ),
          },
          {
            path: "compliance",
            element: (
              <FeatureGuard feature="compliance">
                <CompliancePage />
              </FeatureGuard>
            ),
          },
          {
            path: "health",
            element: (
              <FeatureGuard feature="health">
                <HealthPage />
              </FeatureGuard>
            ),
          },
          {
            path: "analytics",
            element: (
              <FeatureGuard feature="analytics">
                <AnalyticsPage />
              </FeatureGuard>
            ),
          },
          {
            path: "admin",
            element: (
              <FeatureGuard feature="users">
                <AdminPage />
              </FeatureGuard>
            ),
          },
          {
            path: "admin/roles",
            element: (
              <FeatureGuard feature="roles">
                <RolesPage />
              </FeatureGuard>
            ),
          },
          {
            path: "admin/users",
            element: (
              <FeatureGuard feature="users">
                <UsersPage />
              </FeatureGuard>
            ),
          },
          {
            path: "settings",
            element: (
              <FeatureGuard feature="settings">
                <SettingsPage />
              </FeatureGuard>
            ),
          },
          {
            // Profile is always accessible to authenticated users
            path: "profile",
            element: <ProfilePage />,
          },
          {
            // Access denied page route
            path: "access-denied",
            element: <AccessDeniedPage />,
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
        element: <OnboardingPage />,
      },
    ],
  },

  // 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
