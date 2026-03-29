import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Download, FileText, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReports, type ReportType } from "@/hooks/useReports";
import { toast } from "sonner";
import { userFacingFirestoreActionError } from "@/lib/firebaseQueryErrors";

export default function Reports() {
  const { user } = useAuth();
  const {
    reports,
    generateReport,
    downloadReport,
    removeReport,
    reportTypes,
    formatReportDate,
    loading,
    error,
  } = useReports();

  const [formData, setFormData] = useState({
    reportType: "weekly" as ReportType,
    reportDate: new Date().toISOString().split("T")[0],
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    reportId: string | null;
    reportName: string;
  }>({
    open: false,
    reportId: null,
    reportName: "",
  });

  const handleGenerate = async () => {
    if (!formData.reportDate) {
      toast.error("Please select a date");
      return;
    }

    setIsGenerating(true);
    try {
      await generateReport(formData.reportType, formData.reportDate);
      toast.success("Report generated and saved");
    } catch (err) {
      toast.error(userFacingFirestoreActionError("generateReport", err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      downloadReport(report);
      toast.success("Report downloaded");
    }
  };

  const handleDeleteClick = (reportId: string, reportName: string) => {
    setDeleteModal({
      open: true,
      reportId,
      reportName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.reportId) return;

    try {
      await removeReport(deleteModal.reportId);
      toast.success("Report deleted");
    } catch {
      toast.error("Failed to delete report");
    }

    setDeleteModal({ open: false, reportId: null, reportName: "" });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, reportId: null, reportName: "" });
  };

  return (
    <DashboardLayout userName={user?.name ?? "Admin"}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate reports from live rota and staff data in Firestore
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm"
          >
            {error}
          </div>
        )}

        <div className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="mb-4 font-semibold text-foreground">Generate report</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Report type
              </label>
              <select
                value={formData.reportType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reportType: e.target.value as ReportType,
                  }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {(Object.keys(reportTypes) as ReportType[]).map((key) => (
                  <option key={key} value={key}>
                    {reportTypes[key]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={formData.reportDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reportDate: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Weekly: week containing this date. Monthly & coverage: calendar month of this date.
              </p>
            </div>
            <div className="flex items-stretch sm:col-span-2 sm:items-end lg:col-span-1">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">
              Saved reports ({reports.length})
            </h2>
          </div>

          {loading && reports.length === 0 ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground text-sm mt-3">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No saved reports yet. Generate one above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-5 sm:py-3 sm:text-sm">
                      Report name
                    </th>
                    <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground md:table-cell sm:px-5 sm:py-3 sm:text-sm">
                      Date
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-5 sm:py-3 sm:text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-accent/50"
                    >
                      <td className="px-3 py-2.5 text-foreground sm:px-5 sm:py-3">
                        {report.reportName}
                      </td>
                      <td className="hidden px-3 py-2.5 text-foreground md:table-cell sm:px-5 sm:py-3">
                        {formatReportDate(report.reportDate)}
                      </td>
                      <td className="px-3 py-2.5 sm:px-5 sm:py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleDownload(report.id)}
                            className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(report.id, report.reportName)}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                            title="Delete report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deleteModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-report-modal-title"
        >
          <div
            className="absolute inset-0 bg-foreground/20"
            onClick={handleDeleteCancel}
            aria-hidden="true"
          />
          <div className="relative mx-4 max-h-[min(90dvh,720px)] w-full max-w-md overflow-y-auto overscroll-contain rounded-xl border border-border bg-card p-4 shadow-xl sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 id="delete-report-modal-title" className="text-lg font-semibold text-foreground">
                  Delete report
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-foreground">
                    {deleteModal.reportName}
                  </span>
                  ? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={loading}
                className="min-h-11 w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
