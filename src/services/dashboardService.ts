/**
 * Dashboard Firestore Service
 * 
 * Handles all dashboard-related database operations including:
 * - Dashboard metrics retrieval
 * - Alert subscriptions and management
 * - Risk map data
 * - Trend data queries
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  DashboardMetrics,
  DashboardAlert,
  DashboardKPI,
  RiskMapCell,
  TrendPoint,
  AlertFetchOptions,
} from "@/types/dashboard";

const DASHBOARD_METRICS_COLLECTION = "dashboardMetrics";
const ALERTS_COLLECTION = "alerts";
const KPI_HISTORY_COLLECTION = "kpiHistory";

// =============================================================================
// Dashboard Metrics Operations
// =============================================================================

/**
 * Get dashboard metrics for an organization
 */
export async function getDashboardMetrics(orgId: string): Promise<DashboardMetrics | null> {
  const docRef = doc(db, DASHBOARD_METRICS_COLLECTION, orgId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    // Return mock metrics if no real data exists yet
    return getMockDashboardMetrics(orgId);
  }
  
  return { ...docSnap.data() } as DashboardMetrics;
}

/**
 * Subscribe to real-time dashboard metrics updates
 */
export function subscribeToDashboardMetrics(
  orgId: string,
  callback: (metrics: DashboardMetrics | null) => void
): Unsubscribe {
  const docRef = doc(db, DASHBOARD_METRICS_COLLECTION, orgId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ ...docSnap.data() } as DashboardMetrics);
    } else {
      callback(getMockDashboardMetrics(orgId));
    }
  });
}

/**
 * Update dashboard metrics (typically called by Cloud Functions)
 */
export async function updateDashboardMetrics(
  orgId: string,
  metrics: Partial<DashboardMetrics>
): Promise<void> {
  const docRef = doc(db, DASHBOARD_METRICS_COLLECTION, orgId);
  
  await setDoc(docRef, {
    ...metrics,
    organizationId: orgId,
    calculatedAt: serverTimestamp(),
  }, { merge: true });
}

// =============================================================================
// Alert Operations
// =============================================================================

/**
 * Get alerts for an organization
 */
export async function getAlerts(
  orgId: string,
  options: AlertFetchOptions = {}
): Promise<DashboardAlert[]> {
  const {
    types,
    priorities,
    // Note: includeRead and includeDismissed require composite indexes
    // Filtering is done client-side for now
    limit = 20,
  } = options;

  let q = query(
    collection(db, ALERTS_COLLECTION),
    where("organizationId", "==", orgId),
    orderBy("createdAt", "desc"),
    firestoreLimit(limit)
  );

  // Note: Additional filtering for types/priorities would need composite indexes
  // For now, we'll filter client-side for flexibility
  
  const querySnapshot = await getDocs(q);
  let alerts = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as DashboardAlert[];

  // Client-side filtering
  if (types && types.length > 0) {
    alerts = alerts.filter(a => types.includes(a.type));
  }
  if (priorities && priorities.length > 0) {
    alerts = alerts.filter(a => priorities.includes(a.priority));
  }

  return alerts;
}

/**
 * Subscribe to real-time alert updates
 */
export function subscribeToAlerts(
  orgId: string,
  _userId: string,
  callback: (alerts: DashboardAlert[]) => void,
  options: AlertFetchOptions = {}
): Unsubscribe {
  const { limit = 20 } = options;

  const q = query(
    collection(db, ALERTS_COLLECTION),
    where("organizationId", "==", orgId),
    orderBy("createdAt", "desc"),
    firestoreLimit(limit)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const alerts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DashboardAlert[];
    
    callback(alerts);
  });
}

/**
 * Mark an alert as read by a user
 */
export async function markAlertAsRead(alertId: string, userId: string): Promise<void> {
  const docRef = doc(db, ALERTS_COLLECTION, alertId);
  
  await updateDoc(docRef, {
    readBy: arrayUnion(userId),
  });
}

/**
 * Dismiss an alert for a user
 */
export async function dismissAlert(alertId: string, userId: string): Promise<void> {
  const docRef = doc(db, ALERTS_COLLECTION, alertId);
  
  await updateDoc(docRef, {
    dismissedBy: arrayUnion(userId),
  });
}

/**
 * Create a new alert
 */
export async function createAlert(
  orgId: string,
  alert: Omit<DashboardAlert, "id" | "createdAt" | "readBy" | "dismissedBy">
): Promise<DashboardAlert> {
  const docRef = doc(collection(db, ALERTS_COLLECTION));
  
  const newAlert: Omit<DashboardAlert, "id"> & { organizationId: string } = {
    ...alert,
    organizationId: orgId,
    createdAt: Timestamp.now(),
    readBy: [],
    dismissedBy: [],
  };
  
  await setDoc(docRef, newAlert);
  
  return { id: docRef.id, ...alert, createdAt: Timestamp.now(), readBy: [], dismissedBy: [] };
}

// =============================================================================
// Risk Map Operations
// =============================================================================

/**
 * Get risk map data for an organization
 */
export async function getRiskMapData(
  orgId: string,
  _viewMode: "initial" | "residual" = "residual"
): Promise<RiskMapCell[][]> {
  const metricsDocRef = doc(db, DASHBOARD_METRICS_COLLECTION, orgId);
  const docSnap = await getDoc(metricsDocRef);
  
  if (!docSnap.exists() || !docSnap.data().riskMatrix) {
    return getMockRiskMatrix();
  }
  
  return docSnap.data().riskMatrix as RiskMapCell[][];
}

// =============================================================================
// Trend Data Operations
// =============================================================================

/**
 * Get trend data for a specific KPI
 */
export async function getTrendData(
  orgId: string,
  kpiId: string,
  period: "7d" | "30d" | "90d" | "1y" = "30d"
): Promise<TrendPoint[]> {
  const daysMap = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  };
  
  const days = daysMap[period];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const q = query(
    collection(db, KPI_HISTORY_COLLECTION),
    where("organizationId", "==", orgId),
    where("kpiId", "==", kpiId),
    where("date", ">=", Timestamp.fromDate(startDate)),
    orderBy("date", "asc")
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // Return mock trend data
    return getMockTrendData(kpiId, days);
  }
  
  return querySnapshot.docs.map(doc => ({
    date: doc.data().date as Timestamp,
    value: doc.data().value as number,
    label: doc.data().label as string | undefined,
  }));
}

// =============================================================================
// Mock Data Functions (for development/demo)
// =============================================================================

/**
 * Get mock dashboard metrics for development
 */
function getMockDashboardMetrics(orgId: string): DashboardMetrics {
  const now = Timestamp.now();
  
  return {
    organizationId: orgId,
    calculatedAt: now,
    kpis: getMockKPIs(),
    riskMatrix: getMockRiskMatrix(),
    alertsSummary: {
      total: 12,
      unread: 5,
      critical: 2,
      actionRequired: 3,
    },
    daysSinceLastIncident: 15,
  };
}

/**
 * Get mock KPIs for development
 */
function getMockKPIs(): DashboardKPI[] {
  const now = Timestamp.now();
  
  return [
    {
      id: "tf",
      category: "lag",
      name: "Taux de fréquence (TF)",
      shortName: "TF",
      description: "Nombre d'accidents avec arrêt × 1,000,000 / Heures travaillées",
      value: 12.5,
      unit: "",
      format: "number",
      target: 10,
      threshold: { warning: 15, critical: 25 },
      trend: { direction: "down", percentage: 8, period: "month" },
      sparklineData: [18, 16, 15, 14, 13, 12.5, 12],
      status: "warning",
      lastUpdated: now,
      icon: "activity",
    },
    {
      id: "tg",
      category: "lag",
      name: "Taux de gravité (TG)",
      shortName: "TG",
      description: "Jours perdus × 1,000 / Heures travaillées",
      value: 0.45,
      unit: "",
      format: "number",
      target: 0.3,
      threshold: { warning: 0.5, critical: 1.0 },
      trend: { direction: "stable", percentage: 2, period: "month" },
      sparklineData: [0.48, 0.46, 0.47, 0.45, 0.44, 0.45, 0.45],
      status: "good",
      lastUpdated: now,
      icon: "trending-down",
    },
    {
      id: "compliance-rate",
      category: "lag",
      name: "Taux de conformité",
      shortName: "Conformité",
      description: "Pourcentage d'éléments conformes",
      value: 87,
      unit: "%",
      format: "percentage",
      target: 95,
      threshold: { warning: 80, critical: 70 },
      trend: { direction: "up", percentage: 5, period: "month" },
      sparklineData: [78, 80, 82, 84, 85, 86, 87],
      status: "warning",
      lastUpdated: now,
      icon: "shield-check",
    },
    {
      id: "capa-closure",
      category: "lead",
      name: "Taux de clôture CAPA",
      shortName: "Clôture CAPA",
      description: "Pourcentage de CAPA clôturées dans les délais",
      value: 92,
      unit: "%",
      format: "percentage",
      target: 90,
      threshold: { warning: 85, critical: 75 },
      trend: { direction: "up", percentage: 3, period: "month" },
      sparklineData: [85, 87, 88, 89, 90, 91, 92],
      status: "good",
      lastUpdated: now,
      icon: "check-circle",
    },
    {
      id: "training-rate",
      category: "lead",
      name: "Taux de formation",
      shortName: "Formation",
      description: "Pourcentage de formations réalisées",
      value: 78,
      unit: "%",
      format: "percentage",
      target: 90,
      threshold: { warning: 75, critical: 60 },
      trend: { direction: "up", percentage: 6, period: "month" },
      sparklineData: [65, 68, 70, 72, 74, 76, 78],
      status: "warning",
      lastUpdated: now,
      icon: "graduation-cap",
    },
    {
      id: "days-without-incident",
      category: "lead",
      name: "Jours sans accident",
      shortName: "Jours sûrs",
      description: "Nombre de jours depuis le dernier accident avec arrêt",
      value: 45,
      unit: "jours",
      format: "days",
      target: 90,
      threshold: { warning: 30, critical: 0 },
      trend: { direction: "up", percentage: 0, period: "day" },
      sparklineData: [40, 41, 42, 43, 44, 45, 45],
      status: "good",
      lastUpdated: now,
      icon: "calendar-check",
    },
    {
      id: "near-miss-ratio",
      category: "lead",
      name: "Ratio presqu'accidents",
      shortName: "Presqu'accidents",
      description: "Ratio de presqu'accidents déclarés vs incidents",
      value: 3.2,
      unit: ":1",
      format: "rate",
      target: 5,
      threshold: { warning: 2, critical: 1 },
      trend: { direction: "up", percentage: 10, period: "month" },
      sparklineData: [2.5, 2.7, 2.8, 3.0, 3.1, 3.2, 3.2],
      status: "warning",
      lastUpdated: now,
      icon: "alert-triangle",
    },
  ];
}

/**
 * Get mock risk matrix for development
 */
function getMockRiskMatrix(): RiskMapCell[][] {
  // 5x5 matrix: [severity][likelihood]
  const matrix: RiskMapCell[][] = [];
  
  for (let severity = 5; severity >= 1; severity--) {
    const row: RiskMapCell[] = [];
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      // Generate some mock data with varying counts
      const baseCount = (severity + likelihood) > 6 ? Math.floor(Math.random() * 5) : 0;
      const count = likelihood >= 3 && severity >= 3 ? baseCount : Math.max(0, baseCount - 2);
      
      row.push({
        likelihood: likelihood as 1 | 2 | 3 | 4 | 5,
        severity: severity as 1 | 2 | 3 | 4 | 5,
        count,
        risks: count > 0 ? [
          {
            id: `risk-${severity}-${likelihood}`,
            title: `Risque ${severity}×${likelihood}`,
            category: ["physical", "chemical", "mechanical", "ergonomic", "psychosocial"][
              Math.floor(Math.random() * 5)
            ] as "physical" | "chemical" | "mechanical" | "ergonomic" | "psychosocial",
          }
        ] : [],
      });
    }
    matrix.push(row);
  }
  
  // Add some specific high-risk entries
  matrix[0][4].count = 2; // High severity, high likelihood
  matrix[0][4].risks = [
    { id: "risk-critical-1", title: "Risque chimique zone stockage", category: "chemical" },
    { id: "risk-critical-2", title: "Travail en hauteur", category: "physical" },
  ];
  
  matrix[1][3].count = 3; // Medium-high risk
  matrix[1][3].risks = [
    { id: "risk-high-1", title: "Manutention lourde", category: "ergonomic" },
    { id: "risk-high-2", title: "Bruit machines", category: "physical" },
    { id: "risk-high-3", title: "Circulation engins", category: "mechanical" },
  ];
  
  return matrix;
}

/**
 * Get mock trend data for development
 */
function getMockTrendData(kpiId: string, days: number): TrendPoint[] {
  const trendData: TrendPoint[] = [];
  const now = new Date();
  
  // Base values for different KPIs
  const baseValues: Record<string, number> = {
    "tf": 15,
    "tg": 0.5,
    "compliance-rate": 75,
    "capa-closure": 85,
    "training-rate": 70,
    "days-without-incident": 30,
    "near-miss-ratio": 2.5,
  };
  
  const baseValue = baseValues[kpiId] || 50;
  const variance = baseValue * 0.15; // 15% variance
  
  // Generate data points (one per day for shorter periods, aggregated for longer)
  const interval = days <= 30 ? 1 : days <= 90 ? 3 : 7;
  
  for (let i = days; i >= 0; i -= interval) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate value with some randomness but trending upward
    const trend = ((days - i) / days) * variance * 0.5; // Slight upward trend
    const noise = (Math.random() - 0.5) * variance;
    const value = baseValue + trend + noise;
    
    trendData.push({
      date: Timestamp.fromDate(date),
      value: Math.max(0, Math.round(value * 100) / 100),
      label: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    });
  }
  
  return trendData;
}

/**
 * Get mock alerts for development
 */
export function getMockAlerts(_orgId: string): DashboardAlert[] {
  const now = Timestamp.now();
  const hourAgo = Timestamp.fromMillis(now.toMillis() - 3600000);
  const dayAgo = Timestamp.fromMillis(now.toMillis() - 86400000);
  const weekAgo = Timestamp.fromMillis(now.toMillis() - 604800000);
  
  return [
    {
      id: "alert-1",
      type: "incident",
      priority: "critical",
      title: "Nouvel incident déclaré",
      description: "Chute dans l'atelier B - Zone de manutention",
      actionRequired: true,
      actionUrl: "/incidents",
      actionLabel: "Voir l'incident",
      entityId: "incident-123",
      entityType: "incident",
      createdAt: hourAgo,
      readBy: [],
      dismissedBy: [],
    },
    {
      id: "alert-2",
      type: "capa",
      priority: "high",
      title: "CAPA proche de l'échéance",
      description: "Action corrective #45 expire dans 3 jours",
      actionRequired: true,
      actionUrl: "/capa",
      actionLabel: "Gérer CAPA",
      entityId: "capa-45",
      entityType: "capa",
      createdAt: dayAgo,
      readBy: [],
      dismissedBy: [],
    },
    {
      id: "alert-3",
      type: "training",
      priority: "medium",
      title: "Formation complétée",
      description: "12 employés ont terminé la formation SST",
      actionRequired: false,
      actionUrl: "/training",
      createdAt: dayAgo,
      readBy: [],
      dismissedBy: [],
    },
    {
      id: "alert-4",
      type: "compliance",
      priority: "high",
      title: "Audit de conformité requis",
      description: "Revue trimestrielle planifiée pour la semaine prochaine",
      actionRequired: true,
      actionUrl: "/compliance",
      actionLabel: "Planifier",
      entityId: "audit-12",
      entityType: "audit",
      createdAt: weekAgo,
      readBy: [],
      dismissedBy: [],
    },
    {
      id: "alert-5",
      type: "health",
      priority: "low",
      title: "Examens médicaux à venir",
      description: "5 employés doivent passer leur visite médicale ce mois",
      actionRequired: false,
      actionUrl: "/health",
      createdAt: weekAgo,
      readBy: [],
      dismissedBy: [],
    },
  ];
}
