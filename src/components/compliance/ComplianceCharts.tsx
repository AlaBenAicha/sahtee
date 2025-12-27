/**
 * Compliance Charts Component
 * 
 * Displays compliance visualizations:
 * - Compliance by Framework (bar chart)
 * - Findings by Category (donut chart)
 */

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplianceMetrics, useAudits } from "@/hooks/useCompliance";

const FRAMEWORK_LABELS: Record<string, string> = {
  iso_45001: "ISO 45001",
  iso_14001: "ISO 14001",
  iso_9001: "ISO 9001",
  tunisian_labor: "Code Travail",
  cnam: "CNAM",
  ohsas_18001: "OHSAS 18001",
  ancsep: "ANCSEP",
  custom: "Personnalisé",
};

const FRAMEWORK_COLORS: Record<string, string> = {
  iso_45001: "#10b981",
  iso_14001: "#3b82f6",
  iso_9001: "#8b5cf6",
  tunisian_labor: "#f59e0b",
  cnam: "#ef4444",
  ohsas_18001: "#6366f1",
  ancsep: "#14b8a6",
  custom: "#6b7280",
};

const FINDING_CATEGORY_COLORS: Record<string, string> = {
  major_nonconformity: "#ef4444",
  minor_nonconformity: "#f59e0b",
  observation: "#3b82f6",
  opportunity_for_improvement: "#10b981",
  positive_finding: "#8b5cf6",
};

const FINDING_CATEGORY_LABELS: Record<string, string> = {
  major_nonconformity: "Non-conformité majeure",
  minor_nonconformity: "Non-conformité mineure",
  observation: "Observation",
  opportunity_for_improvement: "Opportunité d'amélioration",
  positive_finding: "Point fort",
};

export function ComplianceCharts() {
  const { data: metrics, isLoading: metricsLoading } = useComplianceMetrics();
  const { data: audits, isLoading: auditsLoading } = useAudits();

  // Prepare framework compliance data
  const frameworkData = useMemo(() => {
    if (!metrics?.frameworkCompliance) return [];
    
    return Object.entries(metrics.frameworkCompliance)
      .filter(([_, value]) => value > 0 || value === 0) // Include frameworks with 0% too
      .map(([framework, compliance]) => ({
        framework,
        name: FRAMEWORK_LABELS[framework] || framework,
        compliance: compliance || 0,
        fill: FRAMEWORK_COLORS[framework] || "#6b7280",
      }))
      .sort((a, b) => b.compliance - a.compliance);
  }, [metrics]);

  // Prepare findings by category data
  const findingsData = useMemo(() => {
    if (!audits) return [];
    
    const categoryCounts: Record<string, number> = {};
    
    for (const audit of audits) {
      for (const finding of audit.findings) {
        categoryCounts[finding.category] = (categoryCounts[finding.category] || 0) + 1;
      }
    }
    
    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        name: FINDING_CATEGORY_LABELS[category] || category,
        value: count,
        fill: FINDING_CATEGORY_COLORS[category] || "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);
  }, [audits]);

  const isLoading = metricsLoading || auditsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Compliance by Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Conformité par Référentiel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {frameworkData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Aucune donnée de conformité disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={frameworkData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={75}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, "Conformité"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="compliance" radius={[0, 4, 4, 0]}>
                  {frameworkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Findings by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Écarts par Catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          {findingsData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Aucun écart enregistré
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={findingsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {findingsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, "Écarts"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

