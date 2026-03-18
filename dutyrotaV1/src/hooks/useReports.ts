import { useState, useEffect, useCallback } from "react";
import { USE_MOCK_DATA } from "@/lib/config";

// Mock data imports
import {
  Report,
  ReportType,
  getReports,
  getReportById,
  createReport,
  deleteReport,
  subscribeToReports,
  generateReportName,
  REPORT_TYPES,
} from "@/lib/reportData";
import { getRotas } from "@/lib/rotaData";
import { getEmployees } from "@/lib/mockData";

// Firebase imports
import {
  FirebaseReport,
  getFirebaseReports,
  getFirebaseReportById,
  createFirebaseReport,
  deleteFirebaseReport,
  subscribeToFirebaseReports,
} from "@/lib/firebaseReports";

// Re-export types
export type { Report, ReportType };

/**
 * Hook for accessing and managing report data
 * Supports both mock data and Firebase based on USE_MOCK_DATA config
 */
export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize and subscribe to data changes
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setReports(getReports());
      setLoading(false);
      
      const unsubscribe = subscribeToReports(() => {
        setReports(getReports());
      });
      return unsubscribe;
    } else {
      const unsubscribe = subscribeToFirebaseReports((data) => {
        setReports(data as Report[]);
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  const generateReport = useCallback(
    async (type: ReportType, date: string) => {
      setLoading(true);
      try {
        const reportName = generateReportName(type, date);
        
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const newReport = createReport({
            reportName,
            reportType: type,
            reportDate: date,
            fileType: "csv",
          });
          setLoading(false);
          return newReport;
        } else {
          const newReport = await createFirebaseReport({
            reportName,
            reportType: type,
            reportDate: date,
            fileType: "csv",
          });
          setLoading(false);
          return newReport as Report;
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    []
  );

  const removeReport = useCallback(async (id: string) => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const success = deleteReport(id);
        setLoading(false);
        return success;
      } else {
        await deleteFirebaseReport(id);
        setLoading(false);
        return true;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const getReport = useCallback(
    async (id: string) => {
      if (USE_MOCK_DATA) {
        return getReportById(id);
      } else {
        return (await getFirebaseReportById(id)) as Report | null;
      }
    },
    []
  );

  /**
   * Generate CSV content for a report
   * Note: This uses mock data functions for content generation
   * In a real app, this might be generated server-side
   */
  const generateReportContent = useCallback(
    (report: Report): string => {
      const rotas = getRotas();
      const employees = getEmployees();

      let csvContent = "";

      switch (report.reportType) {
        case "weekly": {
          csvContent = "Date,Staff Name,Shift Time,Department\n";
          rotas.forEach((rota) => {
            csvContent += `${rota.shiftDate},${rota.staffName},${rota.shiftTime},${rota.department}\n`;
          });
          break;
        }
        case "monthly": {
          csvContent = "Employee Name,Department,Email,Phone,Total Shifts\n";
          employees.forEach((emp) => {
            const shiftCount = rotas.filter((r) => r.staffId === emp.id).length;
            csvContent += `${emp.name},${emp.department},${emp.email},${emp.phoneNumber},${shiftCount}\n`;
          });
          break;
        }
        case "department": {
          csvContent = "Department,Staff Count,Total Shifts\n";
          const deptStats: Record<string, { staffCount: Set<string>; shifts: number }> = {};
          rotas.forEach((rota) => {
            if (!deptStats[rota.department]) {
              deptStats[rota.department] = { staffCount: new Set(), shifts: 0 };
            }
            deptStats[rota.department].staffCount.add(rota.staffId);
            deptStats[rota.department].shifts++;
          });
          Object.entries(deptStats).forEach(([dept, stats]) => {
            csvContent += `${dept},${stats.staffCount.size},${stats.shifts}\n`;
          });
          break;
        }
      }

      return csvContent;
    },
    []
  );

  /**
   * Download a report as CSV
   */
  const downloadReport = useCallback(
    (report: Report) => {
      const csvContent = generateReportContent(report);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.reportName.replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [generateReportContent]
  );

  return {
    reports,
    loading,
    generateReport,
    removeReport,
    getReport,
    downloadReport,
    reportTypes: REPORT_TYPES,
  };
}
