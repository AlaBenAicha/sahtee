/**
 * Dashboard Components Index
 * 
 * Export all 360° Board dashboard components for easy importing.
 */

// KPI Components
export { KPICard, KPICardSkeleton } from "./KPICard";
export { KPIBanner, CompactKPIBanner, KPISummary } from "./KPIBanner";

// Risk Map
export { RiskMap, CompactRiskMap } from "./RiskMap";

// Charts
export { TrendChart, MultiTrendChart } from "./TrendCharts";

// Alert Feed
export { AlertFeed, AlertBadge } from "./AlertFeed";

// Quick Actions
export {
  QuickActions,
  QuickActionButton,
  PrimaryActionButton,
  ActionCard,
} from "./QuickActions";

// AI Insights
export {
  AIInsightsPanel,
  AIInsightsSummary,
  getMockRecommendations,
} from "./AIInsightsPanel";

// Layout Components
export {
  DashboardContainer,
  DashboardHeader,
  DashboardGrid,
  MainContent,
  Sidebar,
  FullWidthSection,
  TwoColumnSection,
  StatsGrid,
  Section,
  CardGrid,
  Widget,
  DesktopOnly,
  MobileOnly,
  TabletUp,
  EmptyState,
  LoadingOverlay,
} from "./DashboardLayout";
