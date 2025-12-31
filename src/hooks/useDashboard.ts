/**
 * Dashboard Hooks
 * 
 * React Query hooks for the 360° Board dashboard.
 * Provides data fetching, caching, and real-time updates for:
 * - Dashboard metrics and KPIs
 * - Risk map data
 * - Alert feed
 * - Trend data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getDashboardMetrics,
  subscribeToDashboardMetrics,
  getAlerts,
  subscribeToAlerts,
  markAlertAsRead,
  dismissAlert,
  getRiskMapData,
  getTrendData,
  getAIRecommendations,
  subscribeToAIRecommendations,
  updateRecommendationStatus,
  acceptRecommendation,
} from "@/services/dashboardService";
import { subscribeToAggregatedAlerts } from "@/services/alertAggregationService";
import { calculateAllKPIs, getKPIsByCategory } from "@/services/kpiService";
import type {
  DashboardMetrics,
  DashboardAlert,
  AlertFetchOptions,
  RiskMapViewMode,
} from "@/types/dashboard";

import type { AIRecommendation } from "@/types/dashboard";

// Re-export for use by consumers
export type { DashboardKPI, DashboardAlert, DashboardMetrics, RiskMapViewMode, AIRecommendation } from "@/types/dashboard";

// Query keys for caching
export const dashboardKeys = {
  all: ["dashboard"] as const,
  metrics: (orgId: string) => [...dashboardKeys.all, "metrics", orgId] as const,
  kpis: (orgId: string) => [...dashboardKeys.all, "kpis", orgId] as const,
  kpisByCategory: (orgId: string, category: string) =>
    [...dashboardKeys.kpis(orgId), category] as const,
  riskMap: (orgId: string, viewMode: string) =>
    [...dashboardKeys.all, "riskMap", orgId, viewMode] as const,
  alerts: (orgId: string) => [...dashboardKeys.all, "alerts", orgId] as const,
  trends: (orgId: string, kpiId: string, period: string) =>
    [...dashboardKeys.all, "trends", orgId, kpiId, period] as const,
  recommendations: (orgId: string) => [...dashboardKeys.all, "recommendations", orgId] as const,
};

// =============================================================================
// Dashboard Metrics Hooks
// =============================================================================

/**
 * Hook to fetch dashboard metrics with caching
 */
export function useDashboardMetrics() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: dashboardKeys.metrics(orgId || ""),
    queryFn: () => getDashboardMetrics(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time dashboard metrics updates
 */
export function useRealtimeDashboardMetrics() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToDashboardMetrics(orgId, (newMetrics) => {
      setMetrics(newMetrics);
      setIsLoading(false);
      
      // Update React Query cache
      if (newMetrics) {
        queryClient.setQueryData(dashboardKeys.metrics(orgId), newMetrics);
      }
    });

    return () => unsubscribe();
  }, [orgId, queryClient]);

  return { metrics, isLoading, error };
}

// =============================================================================
// KPI Hooks
// =============================================================================

/**
 * Hook to fetch all KPIs for the organization
 */
export function useKPIs() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: dashboardKeys.kpis(orgId || ""),
    queryFn: () => calculateAllKPIs(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch KPIs by category (lead or lag)
 */
export function useKPIsByCategory(category: "lead" | "lag") {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: dashboardKeys.kpisByCategory(orgId || "", category),
    queryFn: () => getKPIsByCategory(orgId!, category),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to manually refresh KPIs
 */
export function useRefreshKPIs() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error("No organization ID");
      return calculateAllKPIs(orgId);
    },
    onSuccess: (data) => {
      if (orgId) {
        queryClient.setQueryData(dashboardKeys.kpis(orgId), data);
      }
    },
  });
}

// =============================================================================
// Risk Map Hooks
// =============================================================================

/**
 * Hook to fetch risk map data with support for initial/residual view modes
 */
export function useRiskMap(viewMode: RiskMapViewMode = "residual") {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: dashboardKeys.riskMap(orgId || "", viewMode),
    queryFn: () => getRiskMapData(orgId!, viewMode),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes - refetch more often for dashboard freshness
    refetchOnWindowFocus: true,
  });
}

// =============================================================================
// Alert Hooks
// =============================================================================

/**
 * Hook to fetch alerts with options
 * Returns real data only - no mock fallback
 */
export function useAlerts(options: AlertFetchOptions = {}) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: [...dashboardKeys.alerts(orgId || ""), options],
    queryFn: async () => {
      if (!orgId) return [];
      return await getAlerts(orgId, options);
    },
    enabled: !!orgId,
    staleTime: 1 * 60 * 1000, // 1 minute - alerts should be more fresh
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time alert updates
 * Uses aggregated alerts from multiple sources:
 * - Incidents (critical/severe, or needing action)
 * - CAPAs (high/critical priority, overdue, or due soon)
 * - Health alerts (active exposure thresholds, overdue visits)
 * - AI recommendations (critical/high priority)
 */
export function useRealtimeAlerts(options: AlertFetchOptions = {}) {
  const { userProfile, user } = useAuth();
  const orgId = userProfile?.organizationId;
  const userId = user?.uid;
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      setAlerts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the aggregated alerts subscription that combines data from
      // incidents, CAPAs, health alerts, and AI recommendations
      const unsubscribe = subscribeToAggregatedAlerts(
        orgId,
        (aggregatedAlerts) => {
          setAlerts(aggregatedAlerts);
          setIsLoading(false);
          
          // Update React Query cache
          queryClient.setQueryData([...dashboardKeys.alerts(orgId), options], aggregatedAlerts);
        },
        { limit: options.limit || 50 }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      setAlerts([]);
    }
  }, [orgId, queryClient, JSON.stringify(options)]);

  // Calculate unread count
  const unreadCount = alerts.filter(
    (alert) => userId && !alert.readBy.includes(userId)
  ).length;

  // Filter dismissed alerts
  const visibleAlerts = alerts.filter(
    (alert) => !userId || !alert.dismissedBy.includes(userId)
  );

  return { alerts: visibleAlerts, unreadCount, isLoading, error };
}

/**
 * Hook to mark an alert as read
 */
export function useMarkAlertRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      if (!user?.uid) throw new Error("Not authenticated");
      await markAlertAsRead(alertId, user.uid);
    },
    onSuccess: () => {
      // Invalidate alerts cache to refetch
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

/**
 * Hook to dismiss an alert
 */
export function useDismissAlert() {
  const { user, userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      if (!user?.uid) throw new Error("Not authenticated");
      await dismissAlert(alertId, user.uid);
    },
    onMutate: async (alertId) => {
      // Optimistic update
      if (orgId && user?.uid) {
        await queryClient.cancelQueries({ queryKey: dashboardKeys.alerts(orgId) });
        
        const previousAlerts = queryClient.getQueryData<DashboardAlert[]>(
          dashboardKeys.alerts(orgId)
        );
        
        if (previousAlerts) {
          queryClient.setQueryData(
            dashboardKeys.alerts(orgId),
            previousAlerts.map((alert) =>
              alert.id === alertId
                ? { ...alert, dismissedBy: [...alert.dismissedBy, user.uid] }
                : alert
            )
          );
        }
        
        return { previousAlerts };
      }
    },
    onError: (_err, _alertId, context) => {
      // Rollback on error
      if (orgId && context?.previousAlerts) {
        queryClient.setQueryData(dashboardKeys.alerts(orgId), context.previousAlerts);
      }
    },
    onSettled: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts(orgId) });
      }
    },
  });
}

// =============================================================================
// Trend Data Hooks
// =============================================================================

/**
 * Hook to fetch trend data for a specific KPI
 */
export function useTrendData(
  kpiId: string,
  period: "7d" | "30d" | "90d" | "1y" = "30d"
) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: dashboardKeys.trends(orgId || "", kpiId, period),
    queryFn: () => getTrendData(orgId!, kpiId, period),
    enabled: !!orgId && !!kpiId,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// AI Recommendations Hooks
// =============================================================================

/**
 * Hook to fetch AI recommendations
 */
export function useAIRecommendations(limit: number = 10) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;

  return useQuery({
    queryKey: dashboardKeys.recommendations(orgId || ""),
    queryFn: () => getAIRecommendations(orgId!, limit),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for real-time AI recommendations
 */
export function useRealtimeAIRecommendations(limit: number = 10) {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      setRecommendations([]);
      return;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToAIRecommendations(orgId, (newRecs) => {
      setRecommendations(newRecs);
      setIsLoading(false);
      
      // Update React Query cache
      queryClient.setQueryData(dashboardKeys.recommendations(orgId), newRecs);
    }, limit);

    return () => unsubscribe();
  }, [orgId, limit, queryClient]);

  return { recommendations, isLoading };
}

/**
 * Hook to accept an AI recommendation
 */
export function useAcceptRecommendation() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendationId: string) => {
      return await acceptRecommendation(recommendationId, true);
    },
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.recommendations(orgId) });
      }
    },
  });
}

/**
 * Hook to dismiss an AI recommendation
 */
export function useDismissRecommendation() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.organizationId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendationId: string) => {
      await updateRecommendationStatus(recommendationId, "dismissed");
    },
    onMutate: async (recommendationId) => {
      // Optimistic update
      if (orgId) {
        await queryClient.cancelQueries({ queryKey: dashboardKeys.recommendations(orgId) });
        
        const previousRecs = queryClient.getQueryData<AIRecommendation[]>(
          dashboardKeys.recommendations(orgId)
        );
        
        if (previousRecs) {
          queryClient.setQueryData(
            dashboardKeys.recommendations(orgId),
            previousRecs.filter(rec => rec.id !== recommendationId)
          );
        }
        
        return { previousRecs };
      }
    },
    onError: (_err, _recId, context) => {
      // Rollback on error
      if (orgId && context?.previousRecs) {
        queryClient.setQueryData(dashboardKeys.recommendations(orgId), context.previousRecs);
      }
    },
    onSettled: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.recommendations(orgId) });
      }
    },
  });
}

// =============================================================================
// Aggregate Hooks
// =============================================================================

/**
 * Hook that combines all dashboard data into a single object
 * Useful for the main dashboard page
 */
export function useDashboardData(riskMapViewMode: RiskMapViewMode = "residual") {
  const metricsQuery = useDashboardMetrics();
  const kpisQuery = useKPIs();
  const riskMapQuery = useRiskMap(riskMapViewMode);
  const alertsQuery = useAlerts({ limit: 10 });

  const isLoading =
    metricsQuery.isLoading ||
    kpisQuery.isLoading ||
    riskMapQuery.isLoading ||
    alertsQuery.isLoading;

  const error =
    metricsQuery.error ||
    kpisQuery.error ||
    riskMapQuery.error ||
    alertsQuery.error;

  return {
    metrics: metricsQuery.data,
    kpis: kpisQuery.data,
    riskMap: riskMapQuery.data,
    alerts: alertsQuery.data,
    isLoading,
    error,
    refetch: () => {
      metricsQuery.refetch();
      kpisQuery.refetch();
      riskMapQuery.refetch();
      alertsQuery.refetch();
    },
  };
}

/**
 * Hook to get the count of unread/critical items for badges
 */
export function useDashboardBadges() {
  const { user } = useAuth();
  const alertsQuery = useAlerts({ limit: 50 });

  const alerts = alertsQuery.data || [];
  const userId = user?.uid;

  return {
    unreadAlerts: userId
      ? alerts.filter((a) => !a.readBy.includes(userId)).length
      : 0,
    criticalAlerts: alerts.filter((a) => a.priority === "critical").length,
    actionRequired: alerts.filter((a) => a.actionRequired).length,
    isLoading: alertsQuery.isLoading,
  };
}
