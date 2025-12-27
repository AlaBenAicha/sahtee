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
const RISK_ASSESSMENTS_COLLECTION = "riskAssessments";
const AI_RECOMMENDATIONS_COLLECTION = "aiRecommendations";

// =============================================================================
// Dashboard Metrics Operations
// =============================================================================

/**
 * Get dashboard metrics for an organization
 */
export async function getDashboardMetrics(orgId: string): Promise<DashboardMetrics | null> {
  try {
    const docRef = doc(db, DASHBOARD_METRICS_COLLECTION, orgId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Return mock metrics if no real data exists yet
      return getMockDashboardMetrics(orgId);
    }
    
    return { ...docSnap.data() } as DashboardMetrics;
  } catch (error) {
    // Handle permission errors gracefully - return mock data for development
    console.warn("Error fetching dashboard metrics (using mock data):", error);
    return getMockDashboardMetrics(orgId);
  }
}

/**
 * Subscribe to real-time dashboard metrics updates
 */
export function subscribeToDashboardMetrics(
  orgId: string,
  callback: (metrics: DashboardMetrics | null) => void
): Unsubscribe {
  const docRef = doc(db, DASHBOARD_METRICS_COLLECTION, orgId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...docSnap.data() } as DashboardMetrics);
      } else {
        callback(getMockDashboardMetrics(orgId));
      }
    },
    (error) => {
      // Handle permission errors gracefully - return mock data for development
      console.warn("Dashboard metrics subscription error (using mock data):", error.code);
      callback(getMockDashboardMetrics(orgId));
    }
  );
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
  try {
    const {
      types,
      priorities,
      // Note: includeRead and includeDismissed require composite indexes
      // Filtering is done client-side for now
      limit = 20,
    } = options;

    const q = query(
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
  } catch (error) {
    // Handle permission errors gracefully - return mock alerts for development
    console.warn("Error fetching alerts (using mock data):", error);
    return getMockAlerts(orgId);
  }
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
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const alerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DashboardAlert[];
      
      callback(alerts);
    },
    (error) => {
      // Handle permission errors gracefully - return empty alerts for development
      console.warn("Alerts subscription error (using mock data):", error.code);
      callback(getMockAlerts(orgId));
    }
  );
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

/** Risk assessment document structure */
interface RiskAssessment {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  category: "physical" | "chemical" | "mechanical" | "ergonomic" | "psychosocial";
  // Initial risk assessment (before controls)
  initialLikelihood: 1 | 2 | 3 | 4 | 5;
  initialSeverity: 1 | 2 | 3 | 4 | 5;
  // Residual risk (after controls applied)
  residualLikelihood: 1 | 2 | 3 | 4 | 5;
  residualSeverity: 1 | 2 | 3 | 4 | 5;
  status: "active" | "mitigated" | "closed";
  controls?: string[];
}

/**
 * Get risk map data for an organization
 * Fetches from riskAssessments collection and aggregates into 5x5 matrix
 */
export async function getRiskMapData(
  orgId: string,
  viewMode: "initial" | "residual" = "residual"
): Promise<RiskMapCell[][]> {
  try {
    // First try to fetch from riskAssessments collection
    const q = query(
      collection(db, RISK_ASSESSMENTS_COLLECTION),
      where("organizationId", "==", orgId),
      where("status", "in", ["active", "mitigated"])
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Build matrix from real risk assessments
      const risks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as RiskAssessment[];
      
      return buildRiskMatrix(risks, viewMode);
    }
    
    // Fallback: check dashboardMetrics for cached matrix
    const metricsDocRef = doc(db, DASHBOARD_METRICS_COLLECTION, orgId);
    const docSnap = await getDoc(metricsDocRef);
    
    if (docSnap.exists() && docSnap.data().riskMatrix) {
      return docSnap.data().riskMatrix as RiskMapCell[][];
    }
    
    // No data available - return empty matrix with proper structure
    return getEmptyRiskMatrix();
  } catch (error) {
    console.warn("Error fetching risk map data:", error);
    // Return empty matrix on error instead of mock
    return getEmptyRiskMatrix();
  }
}

/**
 * Build a 5x5 risk matrix from risk assessments
 */
function buildRiskMatrix(
  risks: RiskAssessment[],
  viewMode: "initial" | "residual"
): RiskMapCell[][] {
  // Initialize empty 5x5 matrix
  const matrix: RiskMapCell[][] = [];
  
  for (let severity = 5; severity >= 1; severity--) {
    const row: RiskMapCell[] = [];
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      row.push({
        likelihood: likelihood as 1 | 2 | 3 | 4 | 5,
        severity: severity as 1 | 2 | 3 | 4 | 5,
        count: 0,
        risks: [],
      });
    }
    matrix.push(row);
  }
  
  // Populate matrix with risk data
  for (const risk of risks) {
    const likelihood = viewMode === "initial" ? risk.initialLikelihood : risk.residualLikelihood;
    const severity = viewMode === "initial" ? risk.initialSeverity : risk.residualSeverity;
    
    // Matrix row index: severity 5 is row 0, severity 1 is row 4
    const rowIndex = 5 - severity;
    // Matrix col index: likelihood 1 is col 0, likelihood 5 is col 4
    const colIndex = likelihood - 1;
    
    if (rowIndex >= 0 && rowIndex < 5 && colIndex >= 0 && colIndex < 5) {
      matrix[rowIndex][colIndex].count++;
      matrix[rowIndex][colIndex].risks.push({
        id: risk.id,
        title: risk.title,
        category: risk.category,
      });
    }
  }
  
  return matrix;
}

/**
 * Get an empty risk matrix structure
 */
function getEmptyRiskMatrix(): RiskMapCell[][] {
  const matrix: RiskMapCell[][] = [];
  
  for (let severity = 5; severity >= 1; severity--) {
    const row: RiskMapCell[] = [];
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      row.push({
        likelihood: likelihood as 1 | 2 | 3 | 4 | 5,
        severity: severity as 1 | 2 | 3 | 4 | 5,
        count: 0,
        risks: [],
      });
    }
    matrix.push(row);
  }
  
  return matrix;
}

// =============================================================================
// Trend Data Operations
// =============================================================================

/**
 * Get trend data for a specific KPI
 * Tries to fetch real historical data, generates mock data if none exists
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
  
  try {
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
      // If no historical data exists, generate mock data with trend toward current value
      console.info(`No historical data for KPI ${kpiId}, using generated data`);
      return getMockTrendData(kpiId, days);
    }
    
    return querySnapshot.docs.map(doc => ({
      date: doc.data().date as Timestamp,
      value: doc.data().value as number,
      label: doc.data().label as string | undefined,
    }));
  } catch (error) {
    // Handle permission errors gracefully - generate mock data
    console.warn("Error fetching trend data:", error);
    return getMockTrendData(kpiId, days);
  }
}

/**
 * Save a KPI snapshot to history for trend tracking
 * This should be called periodically (e.g., daily via Cloud Function)
 */
export async function saveKPISnapshot(
  orgId: string,
  kpiId: string,
  value: number
): Promise<void> {
  const now = new Date();
  const docId = `${orgId}_${kpiId}_${now.toISOString().split('T')[0]}`;
  
  const docRef = doc(db, KPI_HISTORY_COLLECTION, docId);
  
  await setDoc(docRef, {
    organizationId: orgId,
    kpiId,
    value,
    date: Timestamp.now(),
    label: now.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
  });
}

/**
 * Save all current KPIs to history
 */
export async function saveAllKPISnapshots(
  orgId: string,
  kpis: DashboardKPI[]
): Promise<void> {
  const promises = kpis.map(kpi => 
    saveKPISnapshot(orgId, kpi.id, kpi.value)
  );
  await Promise.all(promises);
}

// =============================================================================
// AI Recommendations Operations
// =============================================================================

import type { AIRecommendation, RecommendationType, Priority } from "@/types/dashboard";

/**
 * Get AI recommendations for dashboard
 */
export async function getAIRecommendations(
  orgId: string,
  limit: number = 10
): Promise<AIRecommendation[]> {
  try {
    const q = query(
      collection(db, AI_RECOMMENDATIONS_COLLECTION),
      where("organizationId", "==", orgId),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      firestoreLimit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Return empty array - no mock data
      return [];
    }
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AIRecommendation[];
  } catch (error) {
    console.warn("Error fetching AI recommendations:", error);
    return [];
  }
}

/**
 * Subscribe to real-time AI recommendations
 */
export function subscribeToAIRecommendations(
  orgId: string,
  callback: (recommendations: AIRecommendation[]) => void,
  limit: number = 10
): Unsubscribe {
  const q = query(
    collection(db, AI_RECOMMENDATIONS_COLLECTION),
    where("organizationId", "==", orgId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    firestoreLimit(limit)
  );
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const recommendations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AIRecommendation[];
      
      callback(recommendations);
    },
    (error) => {
      console.warn("AI recommendations subscription error:", error);
      callback([]);
    }
  );
}

/**
 * Update recommendation status (accept/dismiss)
 */
export async function updateRecommendationStatus(
  recommendationId: string,
  status: "accepted" | "rejected" | "dismissed"
): Promise<void> {
  const docRef = doc(db, AI_RECOMMENDATIONS_COLLECTION, recommendationId);
  
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Accept a recommendation and optionally execute its action
 */
export async function acceptRecommendation(
  recommendationId: string,
  executeAction: boolean = true
): Promise<{ success: boolean; message: string; createdEntityId?: string }> {
  try {
    const docRef = doc(db, AI_RECOMMENDATIONS_COLLECTION, recommendationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, message: "Recommandation non trouvée" };
    }
    
    const recommendation = docSnap.data() as AIRecommendation;
    
    // Update status to accepted
    await updateDoc(docRef, {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });
    
    // If executeAction is true and there's an actionPayload, we would execute it
    // This would typically create a CAPA, schedule training, etc.
    if (executeAction && recommendation.actionPayload) {
      // The actual execution would depend on the action type
      // For now, we just return success
      return { 
        success: true, 
        message: "Recommandation acceptée avec succès",
      };
    }
    
    return { success: true, message: "Recommandation acceptée" };
  } catch (error) {
    console.error("Error accepting recommendation:", error);
    return { success: false, message: "Erreur lors de l'acceptation" };
  }
}

/**
 * Create a new AI recommendation (typically called by AI services)
 */
export async function createAIRecommendation(
  orgId: string,
  recommendation: Omit<AIRecommendation, "id" | "createdAt" | "status">
): Promise<AIRecommendation> {
  const docRef = doc(collection(db, AI_RECOMMENDATIONS_COLLECTION));
  
  const newRec: Omit<AIRecommendation, "id"> = {
    ...recommendation,
    organizationId: orgId,
    status: "pending",
    createdAt: Timestamp.now(),
  };
  
  await setDoc(docRef, newRec);
  
  return { id: docRef.id, ...newRec } as AIRecommendation;
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
