/**
 * Dashboard Layout Component
 * 
 * Responsive grid layout for the 360° Board.
 * Desktop: 3-column layout (main 2/3, sidebar 1/3)
 * Tablet: 2-column layout
 * Mobile: Single column, stacked
 */

import React from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main Dashboard Container
 */
export function DashboardContainer({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

/**
 * Dashboard Header Section
 */
interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-slate-600 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Dashboard Grid - Main content area
 * 2/3 main content, 1/3 sidebar on desktop
 */
interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 lg:grid-cols-3 gap-6",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Main Content Area (2/3 width on desktop)
 */
export function MainContent({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("lg:col-span-2 space-y-6", className)}>
      {children}
    </div>
  );
}

/**
 * Sidebar Area (1/3 width on desktop)
 */
export function Sidebar({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("lg:col-span-1 space-y-6", className)}>
      {children}
    </div>
  );
}

/**
 * Full Width Section
 */
export function FullWidthSection({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("lg:col-span-3", className)}>
      {children}
    </div>
  );
}

/**
 * Two Column Section within main content
 */
export function TwoColumnSection({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 gap-6",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Stats Grid - For KPI cards
 */
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function StatsGrid({ children, columns = 5, className }: StatsGridProps) {
  const colsClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5",
  };

  return (
    <div className={cn(
      "grid grid-cols-1 gap-4",
      colsClass[columns],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Section with title
 */
interface SectionProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  subtitle,
  actions,
  children,
  className,
}: SectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Card Grid - For action cards
 */
export function CardGrid({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Dashboard Widget Wrapper
 */
interface WidgetProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3;
  className?: string;
}

export function Widget({ children, span = 1, className }: WidgetProps) {
  const spanClass = {
    1: "",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
  };

  return (
    <div className={cn(spanClass[span], className)}>
      {children}
    </div>
  );
}

/**
 * Responsive visibility helpers
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return <div className="hidden lg:block">{children}</div>;
}

export function MobileOnly({ children }: { children: React.ReactNode }) {
  return <div className="lg:hidden">{children}</div>;
}

export function TabletUp({ children }: { children: React.ReactNode }) {
  return <div className="hidden md:block">{children}</div>;
}

/**
 * Empty State Component
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      className
    )}>
      {icon && (
        <div className="mb-4 text-slate-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * Loading Overlay
 */
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        {message && (
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        )}
      </div>
    </div>
  );
}

// Export all layout components
export default {
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
};
