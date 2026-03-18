/**
 * Centralized mock data store for reports
 * This module can later be replaced with Firebase/Firestore calls
 */

export interface Report {
  id: string;
  reportName: string;
  reportType: ReportType;
  reportDate: string;
  generatedAt: string;
  fileType: "csv" | "pdf" | "xlsx";
}

export type ReportType = "weekly" | "monthly" | "department";

export const REPORT_TYPES: Record<ReportType, string> = {
  weekly: "Weekly Rota Report",
  monthly: "Monthly Staff Summary",
  department: "Department Coverage Report",
};

// Initial seed data
const initialReports: Report[] = [
  {
    id: "report-001",
    reportName: "Weekly Rota Report - March Week 2",
    reportType: "weekly",
    reportDate: "2026-03-14",
    generatedAt: "2026-03-14T10:00:00.000Z",
    fileType: "csv",
  },
  {
    id: "report-002",
    reportName: "Monthly Staff Summary - February 2026",
    reportType: "monthly",
    reportDate: "2026-03-01",
    generatedAt: "2026-03-01T09:00:00.000Z",
    fileType: "csv",
  },
  {
    id: "report-003",
    reportName: "Department Coverage Report - News Room",
    reportType: "department",
    reportDate: "2026-02-28",
    generatedAt: "2026-02-28T14:00:00.000Z",
    fileType: "csv",
  },
];

// In-memory store
let reports: Report[] = [...initialReports];

// Listeners for state changes
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

/**
 * Subscribe to report data changes
 */
export function subscribeToReports(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get all reports
 */
export function getReports(): Report[] {
  return [...reports].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
}

/**
 * Get a single report by ID
 */
export function getReportById(id: string): Report | undefined {
  return reports.find((r) => r.id === id);
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a report name based on type and date
 */
export function generateReportName(type: ReportType, date: string): string {
  const dateObj = new Date(date);
  
  switch (type) {
    case "weekly": {
      const weekNum = Math.ceil(dateObj.getDate() / 7);
      const monthName = dateObj.toLocaleDateString("en-US", { month: "long" });
      return `Weekly Rota Report - ${monthName} Week ${weekNum}`;
    }
    case "monthly": {
      const monthYear = dateObj.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      return `Monthly Staff Summary - ${monthYear}`;
    }
    case "department": {
      const formattedDate = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `Department Coverage Report - ${formattedDate}`;
    }
    default:
      return `Report - ${date}`;
  }
}

/**
 * Create a new report
 */
export function createReport(
  data: Omit<Report, "id" | "generatedAt">
): Report {
  const newReport: Report = {
    ...data,
    id: generateId(),
    generatedAt: new Date().toISOString(),
  };
  reports = [newReport, ...reports];
  notifyListeners();
  return newReport;
}

/**
 * Delete a report
 */
export function deleteReport(id: string): boolean {
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) return false;

  reports = [...reports.slice(0, index), ...reports.slice(index + 1)];
  notifyListeners();
  return true;
}

/**
 * Format a date for display
 */
export function formatReportDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
