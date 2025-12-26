/**
 * PDF Generator Utility
 * Generates PDF reports using jsPDF
 */

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import type { UserOptions } from "jspdf-autotable";

// Extend jsPDF with autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

// Brand colors
const COLORS = {
  primary: "#10b981", // emerald-500
  primaryDark: "#059669", // emerald-600
  text: "#1e293b", // slate-800
  textLight: "#64748b", // slate-500
  border: "#e2e8f0", // slate-200
  background: "#f8fafc", // slate-50
  white: "#ffffff",
  danger: "#ef4444", // red-500
  warning: "#f59e0b", // amber-500
  success: "#22c55e", // green-500
};

/**
 * Create a new PDF document with SAHTEE branding
 */
function createDocument(title: string, orientation: "portrait" | "landscape" = "portrait"): jsPDF {
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  // Add header
  addHeader(doc, title);

  return doc;
}

/**
 * Add SAHTEE header to document
 */
function addHeader(doc: jsPDF, title: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(COLORS.primary);
  doc.rect(0, 0, pageWidth, 25, "F");

  // Logo placeholder (text-based)
  doc.setTextColor(COLORS.white);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("SAHTEE", 15, 15);

  // Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(title, pageWidth - 15, 15, { align: "right" });

  // Date
  doc.setFontSize(8);
  const date = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(date, pageWidth - 15, 20, { align: "right" });

  // Reset text color
  doc.setTextColor(COLORS.text);
}

/**
 * Add footer with page numbers
 */
function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight);

    // Page number
    doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    // Footer line
    doc.setDrawColor(COLORS.border);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

    // Confidentiality notice
    doc.text(
      "Document confidentiel - SAHTEE © " + new Date().getFullYear(),
      15,
      pageHeight - 10
    );
  }
}

/**
 * Add a section title
 */
function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.primaryDark);
  doc.text(title, 15, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.text);
  return y + 8;
}

/**
 * Add KPI cards section
 */
function addKPICards(
  doc: jsPDF,
  kpis: Array<{ label: string; value: string | number; unit?: string; trend?: string }>,
  y: number
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = (pageWidth - 40) / 4;
  const cardHeight = 25;
  const startX = 15;

  kpis.forEach((kpi, index) => {
    const x = startX + index * (cardWidth + 5);

    // Card background
    doc.setFillColor(COLORS.background);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "F");

    // Value
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.primaryDark);
    const valueText = `${kpi.value}${kpi.unit || ""}`;
    doc.text(valueText, x + cardWidth / 2, y + 10, { align: "center" });

    // Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.textLight);
    doc.text(kpi.label, x + cardWidth / 2, y + 18, { align: "center" });

    // Trend
    if (kpi.trend) {
      doc.setFontSize(7);
      doc.setTextColor(kpi.trend.startsWith("+") ? COLORS.success : COLORS.danger);
      doc.text(kpi.trend, x + cardWidth / 2, y + 22, { align: "center" });
    }
  });

  doc.setTextColor(COLORS.text);
  return y + cardHeight + 10;
}

/**
 * Generate monthly SST report
 */
export async function generateMonthlyReport(data: {
  organizationName: string;
  period: string;
  kpis: {
    complianceRate: number;
    accidentFrequency: number;
    lostDays: number;
    capaCompletionRate: number;
  };
  incidents: Array<{ date: string; type: string; severity: string; status: string }>;
  capas: Array<{ title: string; priority: string; status: string; dueDate: string }>;
  trainings: { completed: number; inProgress: number; planned: number };
}): Promise<Blob> {
  const doc = createDocument(`Rapport SST - ${data.period}`);
  let y = 35;

  // Organization name
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textLight);
  doc.text(`Organisation: ${data.organizationName}`, 15, y);
  y += 10;

  // KPI Section
  y = addSectionTitle(doc, "Indicateurs Clés", y);
  y = addKPICards(doc, [
    { label: "Taux de conformité", value: data.kpis.complianceRate, unit: "%" },
    { label: "Taux de fréquence AT", value: data.kpis.accidentFrequency.toFixed(2) },
    { label: "Jours perdus", value: data.kpis.lostDays },
    { label: "CAPA clôturées", value: data.kpis.capaCompletionRate, unit: "%" },
  ], y);

  // Incidents Table
  if (data.incidents.length > 0) {
    y = addSectionTitle(doc, "Incidents du mois", y);
    doc.autoTable({
      startY: y,
      head: [["Date", "Type", "Gravité", "Statut"]],
      body: data.incidents.map((i) => [i.date, i.type, i.severity, i.status]),
      theme: "grid",
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // CAPA Table
  if (data.capas.length > 0) {
    y = addSectionTitle(doc, "Actions CAPA", y);
    doc.autoTable({
      startY: y,
      head: [["Titre", "Priorité", "Statut", "Échéance"]],
      body: data.capas.map((c) => [c.title, c.priority, c.status, c.dueDate]),
      theme: "grid",
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Training Summary
  y = addSectionTitle(doc, "Formations", y);
  doc.setFontSize(10);
  doc.text(`• Complétées: ${data.trainings.completed}`, 20, y);
  doc.text(`• En cours: ${data.trainings.inProgress}`, 80, y);
  doc.text(`• Planifiées: ${data.trainings.planned}`, 140, y);

  // Add footer
  addFooter(doc);

  return doc.output("blob");
}

/**
 * Generate incident report
 */
export async function generateIncidentReport(incident: {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  location: string;
  occurredAt: string;
  reportedBy: string;
  affectedPersons?: string[];
  rootCause?: string;
  immediateActions?: string[];
}): Promise<Blob> {
  const doc = createDocument(`Rapport d'Incident - ${incident.id}`);
  let y = 35;

  // Incident header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(incident.title, 15, y);
  y += 8;

  // Status badge
  const statusColor =
    incident.status === "closed"
      ? COLORS.success
      : incident.status === "under_investigation"
        ? COLORS.warning
        : COLORS.danger;
  doc.setFillColor(statusColor);
  doc.roundedRect(15, y, 30, 6, 1, 1, "F");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.white);
  doc.text(incident.status.toUpperCase(), 30, y + 4.5, { align: "center" });
  doc.setTextColor(COLORS.text);
  y += 15;

  // Details section
  y = addSectionTitle(doc, "Détails de l'incident", y);

  const details = [
    ["Type", incident.type],
    ["Gravité", incident.severity],
    ["Lieu", incident.location],
    ["Date/Heure", incident.occurredAt],
    ["Déclaré par", incident.reportedBy],
  ];

  doc.autoTable({
    startY: y,
    body: details,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { cellWidth: "auto" },
    },
    margin: { left: 15, right: 15 },
  });
  y = doc.lastAutoTable.finalY + 10;

  // Description
  y = addSectionTitle(doc, "Description", y);
  doc.setFontSize(10);
  const splitDescription = doc.splitTextToSize(incident.description, 180);
  doc.text(splitDescription, 15, y);
  y += splitDescription.length * 5 + 10;

  // Affected persons
  if (incident.affectedPersons && incident.affectedPersons.length > 0) {
    y = addSectionTitle(doc, "Personnes concernées", y);
    incident.affectedPersons.forEach((person) => {
      doc.text(`• ${person}`, 20, y);
      y += 5;
    });
    y += 5;
  }

  // Root cause
  if (incident.rootCause) {
    y = addSectionTitle(doc, "Cause racine", y);
    doc.setFontSize(10);
    const splitCause = doc.splitTextToSize(incident.rootCause, 180);
    doc.text(splitCause, 15, y);
    y += splitCause.length * 5 + 10;
  }

  // Immediate actions
  if (incident.immediateActions && incident.immediateActions.length > 0) {
    y = addSectionTitle(doc, "Actions immédiates", y);
    incident.immediateActions.forEach((action) => {
      doc.text(`• ${action}`, 20, y);
      y += 5;
    });
  }

  // Add footer
  addFooter(doc);

  return doc.output("blob");
}

/**
 * Generate CAPA list report
 */
export async function generateCAPAReport(data: {
  organizationName: string;
  period: string;
  capas: Array<{
    id: string;
    title: string;
    type: string;
    priority: string;
    status: string;
    assignee: string;
    dueDate: string;
    progress: number;
  }>;
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}): Promise<Blob> {
  const doc = createDocument(`Rapport CAPA - ${data.period}`, "landscape");
  let y = 35;

  // Summary
  y = addSectionTitle(doc, "Résumé", y);
  y = addKPICards(doc, [
    { label: "Total CAPA", value: data.summary.total },
    { label: "Complétées", value: data.summary.completed },
    { label: "En cours", value: data.summary.inProgress },
    { label: "En retard", value: data.summary.overdue },
  ], y);

  // CAPA Table
  y = addSectionTitle(doc, "Liste des CAPA", y);
  doc.autoTable({
    startY: y,
    head: [["ID", "Titre", "Type", "Priorité", "Statut", "Responsable", "Échéance", "Progression"]],
    body: data.capas.map((c) => [
      c.id,
      c.title.substring(0, 40) + (c.title.length > 40 ? "..." : ""),
      c.type,
      c.priority,
      c.status,
      c.assignee,
      c.dueDate,
      `${c.progress}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 10, right: 10 },
  });

  // Add footer
  addFooter(doc);

  return doc.output("blob");
}

/**
 * Generate compliance report
 */
export async function generateComplianceReport(data: {
  organizationName: string;
  overallScore: number;
  norms: Array<{
    code: string;
    name: string;
    status: string;
    score: number;
    lastAudit?: string;
  }>;
  audits: Array<{
    title: string;
    type: string;
    date: string;
    score?: number;
    findings: number;
  }>;
}): Promise<Blob> {
  const doc = createDocument("Rapport de Conformité");
  let y = 35;

  // Overall score
  doc.setFontSize(10);
  doc.text(`Organisation: ${data.organizationName}`, 15, y);
  y += 10;

  // Score display
  doc.setFillColor(
    data.overallScore >= 80
      ? COLORS.success
      : data.overallScore >= 60
        ? COLORS.warning
        : COLORS.danger
  );
  doc.roundedRect(15, y, 60, 25, 3, 3, "F");
  doc.setFontSize(24);
  doc.setTextColor(COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.overallScore}%`, 45, y + 15, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Score global", 45, y + 21, { align: "center" });
  doc.setTextColor(COLORS.text);
  y += 35;

  // Norms table
  y = addSectionTitle(doc, "Conformité par norme", y);
  doc.autoTable({
    startY: y,
    head: [["Code", "Norme", "Statut", "Score", "Dernier audit"]],
    body: data.norms.map((n) => [
      n.code,
      n.name.substring(0, 50),
      n.status,
      `${n.score}%`,
      n.lastAudit || "N/A",
    ]),
    theme: "grid",
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 15, right: 15 },
  });
  y = doc.lastAutoTable.finalY + 10;

  // Audits table
  if (data.audits.length > 0) {
    y = addSectionTitle(doc, "Audits récents", y);
    doc.autoTable({
      startY: y,
      head: [["Titre", "Type", "Date", "Score", "Constats"]],
      body: data.audits.map((a) => [
        a.title,
        a.type,
        a.date,
        a.score ? `${a.score}%` : "N/A",
        a.findings.toString(),
      ]),
      theme: "grid",
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });
  }

  // Add footer
  addFooter(doc);

  return doc.output("blob");
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
