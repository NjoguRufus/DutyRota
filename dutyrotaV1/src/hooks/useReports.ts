import { useState, useEffect, useCallback } from "react";
import {
  deleteReport,
  formatReportDate,
  REPORT_TYPE_LABELS,
  runReportGenerator,
  saveReport,
  subscribeToReports,
  type ReportTypeOption,
  type SavedReport,
} from "@/services/reportService";
import { userFacingFirestoreSubscriptionError } from "@/lib/firebaseQueryErrors";

export type Report = SavedReport;
export type ReportType = ReportTypeOption;

export function useReports() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToReports(
      (list) => {
        setReports(list);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(userFacingFirestoreSubscriptionError("subscribeToReports", e));
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const generateReport = useCallback(async (type: ReportTypeOption, date: string) => {
    const { csvContent, reportName, reportDate } = await runReportGenerator(type, date);
    return saveReport({
      reportName,
      reportType: REPORT_TYPE_LABELS[type],
      reportDate,
      format: "csv",
      content: csvContent,
    });
  }, []);

  const removeReport = useCallback(async (id: string) => {
    await deleteReport(id);
    return true;
  }, []);

  const downloadReport = useCallback((report: SavedReport) => {
    const csvContent = report.content || "";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.reportName.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    reports,
    loading,
    error,
    generateReport,
    removeReport,
    downloadReport,
    reportTypes: REPORT_TYPE_LABELS,
    formatReportDate,
  };
}
