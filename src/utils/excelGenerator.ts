/**
 * Excel Generator Utility
 * Generates Excel exports using xlsx library
 */

import * as XLSX from "xlsx";

/**
 * Column configuration for auto-width calculation
 */
interface ColumnConfig {
  header: string;
  key: string;
  width?: number;
}

/**
 * Create a workbook with auto-width columns
 */
function createWorkbook(): XLSX.WorkBook {
  return XLSX.utils.book_new();
}

/**
 * Calculate column widths based on content
 */
function calculateColumnWidths<T extends Record<string, unknown>>(
  data: T[],
  headers: string[]
): { wch: number }[] {
  const widths = headers.map((header) => header.length);

  data.forEach((row) => {
    headers.forEach((header, index) => {
      const value = String(row[header] ?? "");
      widths[index] = Math.max(widths[index], value.length);
    });
  });

  // Add some padding and cap at reasonable max
  return widths.map((w) => ({ wch: Math.min(w + 2, 50) }));
}

/**
 * Add a worksheet with formatted data
 */
function addWorksheet<T extends Record<string, unknown>>(
  workbook: XLSX.WorkBook,
  data: T[],
  sheetName: string,
  columns?: ColumnConfig[]
): void {
  if (data.length === 0) {
    // Create empty sheet with headers only
    const headers = columns?.map((c) => c.header) || [];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    return;
  }

  // Determine columns from data or config
  const keys = columns?.map((c) => c.key) || Object.keys(data[0]);
  const headers = columns?.map((c) => c.header) || keys;

  // Transform data to array of arrays
  const rows = data.map((row) => keys.map((key) => row[key] ?? ""));

  // Create worksheet with headers
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  ws["!cols"] = calculateColumnWidths(data, keys);

  // Add to workbook
  XLSX.utils.book_append_sheet(workbook, ws, sheetName);
}

/**
 * Download workbook as file
 */
function downloadWorkbook(workbook: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(workbook, filename);
}

/**
 * Export generic data to Excel
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = "Données",
  columns?: ColumnConfig[]
): void {
  const workbook = createWorkbook();
  addWorksheet(workbook, data, sheetName, columns);
  downloadWorkbook(workbook, filename);
}

/**
 * Export incidents to Excel
 */
export function exportIncidents(
  incidents: Array<{
    id: string;
    title: string;
    type: string;
    severity: string;
    status: string;
    location: string;
    occurredAt: string | Date;
    reportedBy: string;
    description?: string;
  }>,
  filename = "incidents.xlsx"
): void {
  const columns: ColumnConfig[] = [
    { header: "ID", key: "id" },
    { header: "Titre", key: "title" },
    { header: "Type", key: "type" },
    { header: "Gravité", key: "severity" },
    { header: "Statut", key: "status" },
    { header: "Lieu", key: "location" },
    { header: "Date", key: "occurredAt" },
    { header: "Déclaré par", key: "reportedBy" },
    { header: "Description", key: "description" },
  ];

  // Format dates
  const formattedData = incidents.map((i) => ({
    ...i,
    occurredAt:
      i.occurredAt instanceof Date
        ? i.occurredAt.toLocaleDateString("fr-FR")
        : i.occurredAt,
  }));

  exportToExcel(formattedData, filename, "Incidents", columns);
}

/**
 * Export CAPAs to Excel
 */
export function exportCAPAs(
  capas: Array<{
    id: string;
    title: string;
    type: string;
    priority: string;
    status: string;
    assignee?: string;
    dueDate: string | Date;
    progress: number;
    description?: string;
    category?: string;
  }>,
  filename = "capas.xlsx"
): void {
  const columns: ColumnConfig[] = [
    { header: "ID", key: "id" },
    { header: "Titre", key: "title" },
    { header: "Type", key: "type" },
    { header: "Catégorie", key: "category" },
    { header: "Priorité", key: "priority" },
    { header: "Statut", key: "status" },
    { header: "Responsable", key: "assignee" },
    { header: "Échéance", key: "dueDate" },
    { header: "Progression (%)", key: "progress" },
    { header: "Description", key: "description" },
  ];

  // Format dates
  const formattedData = capas.map((c) => ({
    ...c,
    dueDate:
      c.dueDate instanceof Date
        ? c.dueDate.toLocaleDateString("fr-FR")
        : c.dueDate,
  }));

  exportToExcel(formattedData, filename, "CAPA", columns);
}

/**
 * Export trainings to Excel
 */
export function exportTrainings(
  trainings: Array<{
    id: string;
    title: string;
    category: string;
    duration: number;
    enrolledCount: number;
    completedCount: number;
    isRequired: boolean;
  }>,
  filename = "formations.xlsx"
): void {
  const columns: ColumnConfig[] = [
    { header: "ID", key: "id" },
    { header: "Titre", key: "title" },
    { header: "Catégorie", key: "category" },
    { header: "Durée (min)", key: "duration" },
    { header: "Inscrits", key: "enrolledCount" },
    { header: "Complétées", key: "completedCount" },
    { header: "Obligatoire", key: "isRequired" },
  ];

  // Format booleans
  const formattedData = trainings.map((t) => ({
    ...t,
    isRequired: t.isRequired ? "Oui" : "Non",
  }));

  exportToExcel(formattedData, filename, "Formations", columns);
}

/**
 * Export compliance norms to Excel
 */
export function exportNorms(
  norms: Array<{
    code: string;
    name: string;
    category: string;
    status: string;
    complianceScore: number;
    lastAuditDate?: string | Date;
    nextAuditDate?: string | Date;
  }>,
  filename = "conformite.xlsx"
): void {
  const columns: ColumnConfig[] = [
    { header: "Code", key: "code" },
    { header: "Nom", key: "name" },
    { header: "Catégorie", key: "category" },
    { header: "Statut", key: "status" },
    { header: "Score (%)", key: "complianceScore" },
    { header: "Dernier audit", key: "lastAuditDate" },
    { header: "Prochain audit", key: "nextAuditDate" },
  ];

  // Format dates
  const formattedData = norms.map((n) => ({
    ...n,
    lastAuditDate: n.lastAuditDate
      ? n.lastAuditDate instanceof Date
        ? n.lastAuditDate.toLocaleDateString("fr-FR")
        : n.lastAuditDate
      : "N/A",
    nextAuditDate: n.nextAuditDate
      ? n.nextAuditDate instanceof Date
        ? n.nextAuditDate.toLocaleDateString("fr-FR")
        : n.nextAuditDate
      : "N/A",
  }));

  exportToExcel(formattedData, filename, "Conformité", columns);
}

/**
 * Export audits to Excel
 */
export function exportAudits(
  audits: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    scheduledDate: string | Date;
    completedDate?: string | Date;
    auditor: string;
    score?: number;
    findingsCount: number;
  }>,
  filename = "audits.xlsx"
): void {
  const columns: ColumnConfig[] = [
    { header: "ID", key: "id" },
    { header: "Titre", key: "title" },
    { header: "Type", key: "type" },
    { header: "Statut", key: "status" },
    { header: "Date prévue", key: "scheduledDate" },
    { header: "Date réalisée", key: "completedDate" },
    { header: "Auditeur", key: "auditor" },
    { header: "Score (%)", key: "score" },
    { header: "Constats", key: "findingsCount" },
  ];

  // Format dates
  const formattedData = audits.map((a) => ({
    ...a,
    scheduledDate:
      a.scheduledDate instanceof Date
        ? a.scheduledDate.toLocaleDateString("fr-FR")
        : a.scheduledDate,
    completedDate: a.completedDate
      ? a.completedDate instanceof Date
        ? a.completedDate.toLocaleDateString("fr-FR")
        : a.completedDate
      : "N/A",
    score: a.score ?? "N/A",
  }));

  exportToExcel(formattedData, filename, "Audits", columns);
}

/**
 * Export health exposures to Excel
 */
export function exportExposures(
  exposures: Array<{
    id: string;
    type: string;
    agent: string;
    department: string;
    lastMeasurement: number;
    unit: string;
    limit: number;
    percentOfLimit: number;
    measurementDate: string | Date;
  }>,
  filename = "expositions.xlsx"
): void {
  const columns: ColumnConfig[] = [
    { header: "ID", key: "id" },
    { header: "Type", key: "type" },
    { header: "Agent", key: "agent" },
    { header: "Département", key: "department" },
    { header: "Mesure", key: "lastMeasurement" },
    { header: "Unité", key: "unit" },
    { header: "Limite", key: "limit" },
    { header: "% Limite", key: "percentOfLimit" },
    { header: "Date mesure", key: "measurementDate" },
  ];

  // Format dates
  const formattedData = exposures.map((e) => ({
    ...e,
    measurementDate:
      e.measurementDate instanceof Date
        ? e.measurementDate.toLocaleDateString("fr-FR")
        : e.measurementDate,
  }));

  exportToExcel(formattedData, filename, "Expositions", columns);
}

/**
 * Create multi-sheet workbook for comprehensive export
 */
export function exportMultiSheet(
  sheets: Array<{
    name: string;
    data: Record<string, unknown>[];
    columns?: ColumnConfig[];
  }>,
  filename: string
): void {
  const workbook = createWorkbook();

  sheets.forEach((sheet) => {
    addWorksheet(workbook, sheet.data, sheet.name, sheet.columns);
  });

  downloadWorkbook(workbook, filename);
}

/**
 * Export KPI dashboard data to Excel
 */
export function exportDashboardData(
  data: {
    kpis: Record<string, number | string>;
    incidents: Array<Record<string, unknown>>;
    capas: Array<Record<string, unknown>>;
    trainings: Array<Record<string, unknown>>;
  },
  filename = "dashboard_export.xlsx"
): void {
  const workbook = createWorkbook();

  // KPIs sheet
  const kpiData = Object.entries(data.kpis).map(([key, value]) => ({
    Indicateur: key,
    Valeur: value,
  }));
  addWorksheet(workbook, kpiData, "KPIs", [
    { header: "Indicateur", key: "Indicateur" },
    { header: "Valeur", key: "Valeur" },
  ]);

  // Other sheets
  if (data.incidents.length > 0) {
    addWorksheet(workbook, data.incidents, "Incidents");
  }
  if (data.capas.length > 0) {
    addWorksheet(workbook, data.capas, "CAPA");
  }
  if (data.trainings.length > 0) {
    addWorksheet(workbook, data.trainings, "Formations");
  }

  downloadWorkbook(workbook, filename);
}
