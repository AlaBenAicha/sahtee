/**
 * Application Routes Configuration
 */

import { createBrowserRouter, Navigate } from "react-router-dom";

// Layout
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Public Pages
import LandingPage from "@/pages/LandingPage";

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
            element: <DashboardPage />,
          },
          {
            path: "incidents",
            element: <IncidentsPage />,
          },
          {
            path: "capa",
            element: <CAPAPage />,
          },
          {
            path: "training",
            element: <TrainingPage />,
          },
          {
            path: "compliance",
            element: <CompliancePage />,
          },
          {
            path: "health",
            element: <HealthPage />,
          },
          {
            path: "analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "admin",
            element: <AdminPage />,
          },
          {
            path: "admin/roles",
            element: <RolesPage />,
          },
          {
            path: "admin/users",
            element: <UsersPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
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
