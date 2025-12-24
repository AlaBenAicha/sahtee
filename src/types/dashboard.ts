/**
 * Dashboard Types - Analytics and AI-related types
 * Includes 360° Board KPIs, Risk Map, Alerts, and Trend data
 */

import type { Timestamp } from "firebase/firestore";
import type { Priority } from "./common";
import type { HazardCategory } from "./health";

// =============================================================================
// 360° Board - Risk Map Types
// =============================================================================

/** Risk reference for the risk map cells */
export interface RiskReference {
  id: string;
  title: string;
  category: HazardCategory;
  departmentId?: string;
  departmentName?: string;
}

/** Risk map cell representing a position on the 5x5 matrix */
export interface RiskMapCell {
  likelihood: 1 | 2 | 3 | 4 | 5;
  severity: 1 | 2 | 3 | 4 | 5;
  count: number;
  risks: RiskReference[];
}

/** Risk map view mode */
export type RiskMapViewMode = "initial" | "residual";

// =============================================================================
// 360° Board - Extended KPI Types
// =============================================================================

/** Trend data for KPI changes over time */
export interface TrendData {
  direction: "up" | "down" | "stable";
  percentage: number;
  period: "day" | "week" | "month";
}

/** Historical trend point for charts */
export interface TrendPoint {
  date: Timestamp;
  value: number;
  label?: string;
}

/** KPI category for dashboard grouping */
export type KPICategory = "lead" | "lag";

/** Extended dashboard KPI with sparklines and thresholds */
export interface DashboardKPI {
  id: string;
  category: KPICategory;
  name: string;
  shortName?: string;
  description?: string;
  value: number;
  unit: string;
  format?: "number" | "percentage" | "days" | "rate";
  target?: number;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: TrendData;
  sparklineData: number[];
  status: "good" | "warning" | "critical";
  lastUpdated: Timestamp;
  icon?: string;
}

// =============================================================================
// 360° Board - Alert Feed Types
// =============================================================================

/** Alert type categories */
export type DashboardAlertType =
  | "incident"
  | "capa"
  | "compliance"
  | "training"
  | "health"
  | "system";

/** Alert priority levels */
export type DashboardAlertPriority = "low" | "medium" | "high" | "critical";

/** Dashboard alert for the alert feed */
export interface DashboardAlert {
  id: string;
  type: DashboardAlertType;
  priority: DashboardAlertPriority;
  title: string;
  description: string;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  entityId?: string;
  entityType?: EntityType;
  createdAt: Timestamp;
  readBy: string[];
  dismissedBy: string[];
}

// =============================================================================
// 360° Board - Aggregated Metrics
// =============================================================================

/** Aggregated dashboard metrics for the 360° Board */
export interface DashboardMetrics {
  organizationId: string;
  calculatedAt: Timestamp;
  kpis: DashboardKPI[];
  riskMatrix: RiskMapCell[][];
  alertsSummary: {
    total: number;
    unread: number;
    critical: number;
    actionRequired: number;
  };
  lastIncidentDate?: Timestamp;
  daysSinceLastIncident: number;
}

/** Options for fetching alerts */
export interface AlertFetchOptions {
  types?: DashboardAlertType[];
  priorities?: DashboardAlertPriority[];
  includeRead?: boolean;
  includeDismissed?: boolean;
  limit?: number;
}

// =============================================================================
// Original Dashboard Types (preserved)
// =============================================================================

/** Dashboard widget types */
export type WidgetType =
  | "stat_card"
  | "line_chart"
  | "bar_chart"
  | "pie_chart"
  | "donut_chart"
  | "table"
  | "list"
  | "calendar"
  | "map"
  | "gauge"
  | "timeline"
  | "heatmap";

/** Dashboard widget configuration */
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  
  // Layout
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Data source
  dataSource: WidgetDataSource;
  
  // Display options
  options: Record<string, unknown>;
  
  // Refresh
  refreshInterval?: number; // in seconds
  lastRefreshed?: Timestamp;
}

/** Widget data source configuration */
export interface WidgetDataSource {
  type: "realtime" | "aggregated" | "static";
  collection?: string;
  query?: WidgetQuery;
  aggregation?: AggregationType;
  dateRange?: "today" | "week" | "month" | "quarter" | "year" | "custom";
}

/** Widget query parameters */
export interface WidgetQuery {
  filters: Array<{
    field: string;
    operator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "array-contains";
    value: unknown;
  }>;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
  limit?: number;
}

/** Aggregation types for widgets */
export type AggregationType = 
  | "count"
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "group_by";

/** Key performance indicator */
export interface KPI {
  id: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  target?: number;
  trend: "up" | "down" | "stable";
  trendPercentage?: number;
  status: "good" | "warning" | "critical";
  lastUpdated: Timestamp;
}

/** Dashboard summary for overview page */
export interface DashboardSummary {
  organizationId: string;
  generatedAt: Timestamp;
  
  // Quick stats
  stats: QuickStats;
  
  // Recent activity
  recentActivity: ActivityItem[];
  
  // Upcoming items
  upcomingTasks: UpcomingTask[];
  upcomingDeadlines: UpcomingDeadline[];
  
  // Alerts
  alerts: Alert[];
  
  // AI recommendations
  recommendations: AIRecommendation[];
}

/** Quick statistics for dashboard */
export interface QuickStats {
  // Incidents
  openIncidents: number;
  incidentsThisMonth: number;
  incidentsTrend: number;
  
  // CAPA
  openCapas: number;
  overdueCapas: number;
  capaCompletionRate: number;
  
  // Training
  pendingTrainings: number;
  trainingComplianceRate: number;
  
  // Compliance
  complianceRate: number;
  upcomingAudits: number;
  openFindings: number;
  
  // Health
  overdueExaminations: number;
  ltifr: number;
}

/** Activity item for recent activity feed */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  entityId: string;
  entityType: EntityType;
  timestamp: Timestamp;
  metadata?: Record<string, unknown>;
}

/** Activity types */
export type ActivityType =
  | "created"
  | "updated"
  | "completed"
  | "assigned"
  | "commented"
  | "approved"
  | "rejected"
  | "uploaded"
  | "deleted";

/** Entity types for activity tracking */
export type EntityType =
  | "incident"
  | "capa"
  | "training"
  | "audit"
  | "finding"
  | "document"
  | "user"
  | "risk_assessment";

/** Upcoming task */
export interface UpcomingTask {
  id: string;
  title: string;
  type: EntityType;
  dueDate: Timestamp;
  priority: Priority;
  assigneeId?: string;
  assigneeName?: string;
  status: string;
}

/** Upcoming deadline */
export interface UpcomingDeadline {
  id: string;
  title: string;
  type: "capa" | "training" | "audit" | "review" | "certification";
  dueDate: Timestamp;
  daysRemaining: number;
  critical: boolean;
}

/** System alert */
export interface Alert {
  id: string;
  type: "warning" | "error" | "info" | "success";
  category: AlertCategory;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  dismissible: boolean;
  dismissed: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

/** Alert categories */
export type AlertCategory =
  | "overdue"
  | "compliance"
  | "safety"
  | "system"
  | "subscription";

/** AI-generated recommendation */
export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-100
  priority: Priority;
  
  // Action
  actionType: "view" | "create" | "update" | "assign";
  actionUrl?: string;
  actionPayload?: Record<string, unknown>;
  
  // Status
  status: "pending" | "accepted" | "rejected" | "dismissed";
  
  // Metadata
  basedOn: RecommendationBasis;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

/** Types of AI recommendations */
export type RecommendationType =
  | "training"          // Suggest training based on incidents
  | "capa"             // Suggest corrective action
  | "risk_assessment"   // Suggest risk review
  | "equipment"        // Suggest PPE or equipment
  | "compliance"       // Suggest compliance action
  | "optimization";    // Process improvement suggestion

/** Basis for AI recommendation */
export interface RecommendationBasis {
  incidents?: string[];
  patterns?: string[];
  regulations?: string[];
  historicalData?: boolean;
  similarOrganizations?: boolean;
}

/** Notification for user */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  
  // Link
  entityId?: string;
  entityType?: EntityType;
  actionUrl?: string;
  
  // Status
  read: boolean;
  readAt?: Timestamp;
  
  // Delivery
  channels: NotificationChannel[];
  deliveredVia: NotificationChannel[];
  
  // Timing
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

/** Notification types */
export type NotificationType =
  | "assignment"
  | "mention"
  | "deadline"
  | "update"
  | "approval"
  | "comment"
  | "system";

/** Notification delivery channels */
export type NotificationChannel = "in_app" | "email" | "push" | "sms";

/** Suggested action from AI engine */
export interface SuggestedAction {
  id: string;
  type: "capa" | "training" | "equipment" | "document" | "meeting";
  title: string;
  description: string;
  priority: Priority;
  confidence: number;
  estimatedEffort: "low" | "medium" | "high";
  expectedImpact: "low" | "medium" | "high";
  deadline?: Timestamp;
  assigneeId?: string;
  sourceIncidentId?: string;
  status: "suggested" | "accepted" | "modified" | "rejected";
}

