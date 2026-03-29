import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import type { LucideIcon } from "lucide-react";
import { Users, CalendarPlus, BarChart3, CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useStaff } from "@/hooks/useStaff";
import { useRotas } from "@/hooks/useRotas";
import { useReports } from "@/hooks/useReports";
import { formatDate, getShiftTimeDisplay } from "@/lib/rotaUtils";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const { staff, loading: staffLoading, error: staffError } = useStaff();
  const { getRecent, rotas, loading: rotasLoading, error: rotasError } = useRotas();
  const { reports, loading: reportsLoading, error: reportsError } = useReports();

  const recentSchedules = getRecent(5);
  const upcomingCount = rotas.filter((r) => {
    const d = new Date(r.shiftDate);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }).length;

  const isLoading = staffLoading || rotasLoading || reportsLoading;
  const loadError = staffError || rotasError || reportsError;

  const stats: {
    title: string;
    value: string;
    hint: string;
    icon: LucideIcon;
    iconClassName: string;
    link: string;
    navigateState?: { openCreateRota?: boolean };
  }[] = [
    {
      title: "Manage Staff",
      value: String(staff.length),
      hint: "People in the directory",
      icon: Users,
      iconClassName: "bg-primary",
      link: "/admin/manage-staff",
    },
    {
      title: "Rota schedules",
      value: String(upcomingCount),
      hint:
        upcomingCount === 0
          ? "No upcoming shifts — create one"
          : `Upcoming shift${upcomingCount === 1 ? "" : "s"}`,
      icon: CalendarPlus,
      iconClassName: "bg-secondary",
      link: "/admin/rota-schedules",
      navigateState: { openCreateRota: true },
    },
    {
      title: "Saved reports",
      value: String(reports.length),
      hint: "CSV exports in Firestore",
      icon: BarChart3,
      iconClassName: "bg-success",
      link: "/admin/reports",
    },
    {
      title: "All schedules",
      value: String(rotas.length),
      hint: "Total shift records",
      icon: CalendarDays,
      iconClassName: "bg-primary",
      link: "/admin/rota-schedules",
    },
  ];

  return (
    <DashboardLayout userName={user?.name ?? "Admin"}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome, {user?.name ?? "Admin"}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/rota-schedules", { state: { openCreateRota: true } })}
            className="hidden items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Create Rota <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {loadError}
          </div>
        )}

        <div
          className={cn(
            "mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
            preferences.compactDashboard ? "gap-2 md:gap-3" : "gap-3 md:gap-4"
          )}
        >
          {stats.map((stat) => (
            <DashboardStatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              hint={stat.hint}
              icon={stat.icon}
              iconClassName={stat.iconClassName}
              compact={preferences.compactDashboard}
              onClick={() =>
                stat.navigateState
                  ? navigate(stat.link, { state: stat.navigateState })
                  : navigate(stat.link)
              }
            />
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
            <h2 className="font-semibold text-foreground">Recent schedules</h2>
            <button
              type="button"
              onClick={() => navigate("/admin/rota-schedules")}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Loading schedules…</p>
            </div>
          ) : recentSchedules.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CalendarDays className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mb-3 text-sm text-muted-foreground">No schedules created yet</p>
              <button
                type="button"
                onClick={() => navigate("/admin/rota-schedules", { state: { openCreateRota: true } })}
                className="text-sm font-medium text-primary hover:underline"
              >
                Create your first schedule
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/80">
                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-5 py-3 text-left font-medium text-muted-foreground">Staff</th>
                    <th className="hidden px-5 py-3 text-left font-medium text-muted-foreground md:table-cell">
                      Shift
                    </th>
                    <th className="hidden px-5 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSchedules.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-5 py-3 text-foreground">{formatDate(schedule.shiftDate)}</td>
                      <td className="px-5 py-3 text-foreground">{schedule.staffName}</td>
                      <td className="hidden px-5 py-3 text-foreground md:table-cell">
                        {getShiftTimeDisplay(schedule.shiftTime)}
                      </td>
                      <td className="hidden px-5 py-3 text-foreground lg:table-cell">
                        {schedule.department}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
