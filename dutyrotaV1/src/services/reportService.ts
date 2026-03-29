import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getRotasByDateRange } from "./rotaService";
import { getAllStaff } from "./staffService";

const COLLECTION = "reports";

export type ReportTypeOption = "weekly" | "monthly" | "department";

export interface SavedReport {
  id: string;
  reportName: string;
  reportType: string;
  reportDate: string;
  generatedAt: string;
  format: string;
  content: string;
}

export const REPORT_TYPE_LABELS: Record<ReportTypeOption, string> = {
  weekly: "Weekly Report",
  monthly: "Monthly Staff Summary",
  department: "Department Coverage Report",
};

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Monday–Sunday week containing anchorDate (YYYY-MM-DD). */
export function getWeekBounds(anchorDate: string): { start: string; end: string } {
  const d = new Date(anchorDate + "T12:00:00");
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { start: formatYMD(mon), end: formatYMD(sun) };
}

function lastDayOfMonth(year: number, monthIndex0: number): string {
  const last = new Date(year, monthIndex0 + 1, 0);
  return formatYMD(last);
}

export function getMonthBounds(yearMonth: string): { start: string; end: string } {
  const [y, m] = yearMonth.split("-").map(Number);
  const start = `${yearMonth}-01`;
  const end = lastDayOfMonth(y, m - 1);
  return { start, end };
}

function escapeCsv(cell: string): string {
  if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

export function formatReportDate(reportDate: string): string {
  if (!reportDate) return "";
  const d = new Date(
    reportDate.includes("T") ? reportDate : `${reportDate}T12:00:00`
  );
  if (Number.isNaN(d.getTime())) return reportDate;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function generateWeeklyReport(
  anchorDate: string
): Promise<{ csvContent: string; reportName: string }> {
  const { start, end } = getWeekBounds(anchorDate);
  const rotas = await getRotasByDateRange(start, end);
  const byDept: Record<string, number> = {};
  rotas.forEach((r) => {
    byDept[r.department] = (byDept[r.department] || 0) + 1;
  });

  let csv = `Weekly Report (${start} to ${end})\n\n`;
  csv += "Department,Shift Count\n";
  Object.entries(byDept)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([dept, n]) => {
      csv += `${escapeCsv(dept)},${n}\n`;
    });
  csv += "\nDate,Staff Name,Department,Shift Time,Status\n";
  rotas.forEach((r) => {
    csv += `${r.shiftDate},${escapeCsv(r.staffName)},${escapeCsv(r.department)},${r.shiftTime},${r.status}\n`;
  });

  const reportName = `Weekly Report ${start} to ${end}`;
  return { csvContent: csv, reportName };
}

export async function generateMonthlyStaffSummary(
  yearMonth: string
): Promise<{ csvContent: string; reportName: string }> {
  const { start, end } = getMonthBounds(yearMonth);
  const rotas = await getRotasByDateRange(start, end);
  const staffList = await getAllStaff();
  const byAuth: Record<string, { name: string; department: string; count: number }> = {};

  staffList.forEach((s) => {
    byAuth[s.authUid] = { name: s.fullName, department: s.department, count: 0 };
  });

  rotas.forEach((r) => {
    const key = r.staffAuthUid || r.staffId;
    if (!byAuth[key]) {
      byAuth[key] = {
        name: r.staffName,
        department: r.department,
        count: 0,
      };
    }
    byAuth[key].count += 1;
  });

  let csv = `Monthly Staff Summary (${yearMonth})\n\n`;
  csv += "Staff Name,Department,Assignments in month\n";
  Object.values(byAuth)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((row) => {
      csv += `${escapeCsv(row.name)},${escapeCsv(row.department)},${row.count}\n`;
    });

  const reportName = `Monthly Staff Summary ${yearMonth}`;
  return { csvContent: csv, reportName };
}

export async function generateDepartmentCoverageReport(
  yearMonth: string
): Promise<{ csvContent: string; reportName: string }> {
  const { start, end } = getMonthBounds(yearMonth);
  const rotas = await getRotasByDateRange(start, end);
  const byDept: Record<string, number> = {};
  rotas.forEach((r) => {
    byDept[r.department] = (byDept[r.department] || 0) + 1;
  });

  let csv = `Department Coverage (${yearMonth})\n\n`;
  csv += "Department,Scheduled shifts\n";
  Object.entries(byDept)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([dept, n]) => {
      csv += `${escapeCsv(dept)},${n}\n`;
    });

  const reportName = `Department Coverage ${yearMonth}`;
  return { csvContent: csv, reportName };
}

export async function runReportGenerator(
  type: ReportTypeOption,
  dateInput: string
): Promise<{ csvContent: string; reportName: string; reportDate: string }> {
  if (type === "weekly") {
    const out = await generateWeeklyReport(dateInput);
    const { start } = getWeekBounds(dateInput);
    return { ...out, reportDate: start };
  }
  if (type === "monthly") {
    const ym = dateInput.slice(0, 7);
    const out = await generateMonthlyStaffSummary(ym);
    return { ...out, reportDate: `${ym}-01` };
  }
  const ym = dateInput.slice(0, 7);
  const out = await generateDepartmentCoverageReport(ym);
  return { ...out, reportDate: `${ym}-01` };
}

function mapReportDoc(id: string, data: Record<string, unknown>): SavedReport {
  const gen = data.generatedAt as { toDate?: () => Date } | string | undefined;
  const generatedAt =
    typeof gen === "object" && gen?.toDate
      ? gen.toDate()!.toISOString()
      : String(gen ?? "");

  return {
    id,
    reportName: String(data.reportName ?? ""),
    reportType: String(data.reportType ?? ""),
    reportDate: String(data.reportDate ?? ""),
    generatedAt,
    format: String(data.format ?? "csv"),
    content: String(data.content ?? ""),
  };
}

export async function saveReport(input: {
  reportName: string;
  reportType: string;
  reportDate: string;
  format: string;
  content: string;
}): Promise<SavedReport> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    generatedAt: serverTimestamp(),
  });
  const snap = await getDoc(doc(db, COLLECTION, ref.id));
  if (!snap.exists()) throw new Error("Report save failed.");
  return mapReportDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function deleteReport(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export function subscribeToReports(
  onNext: (reports: SavedReport[]) => void,
  onError?: (e: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION), orderBy("generatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      onNext(snap.docs.map((d) => mapReportDoc(d.id, d.data() as Record<string, unknown>)));
    },
    (err) => onError?.(err)
  );
}
