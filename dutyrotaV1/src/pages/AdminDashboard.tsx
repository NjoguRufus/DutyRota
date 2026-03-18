import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, CalendarPlus, BarChart3, CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { useRotas } from "@/hooks/useRotas";
import { formatDate, getShiftTimeDisplay } from "@/lib/rotaData";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, loading: employeesLoading } = useEmployees();
  const { getRecent, rotas, loading: rotasLoading } = useRotas();

  const recentSchedules = getRecent(5);
  const isLoading = employeesLoading || rotasLoading;

  const stats = [
    {
      title: "Manage Staff",
      description: `${employees.length} Employees`,
      icon: Users,
      color: "bg-primary",
      link: "/admin/manage-staff",
    },
    {
      title: "Create Rota",
      description: "Schedule Shifts",
      icon: CalendarPlus,
      color: "bg-secondary",
      link: "/admin/create-rota",
    },
    {
      title: "View Reports",
      description: "Weekly & Monthly Stats",
      icon: BarChart3,
      color: "bg-success",
      link: "/admin/reports",
    },
    {
      title: "Rota Schedules",
      description: `${rotas.length} Total Shifts`,
      icon: CalendarDays,
      color: "bg-primary",
      link: "/admin/rota-schedules",
    },
  ];

  return (
    <DashboardLayout userName={user?.name ?? "Admin"}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome, {user?.name ?? "Admin"}</p>
          </div>
          <button
            onClick={() => navigate("/admin/create-rota")}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Quick Create <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <button
              key={stat.title}
              onClick={() => navigate(stat.link)}
              className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-md transition-shadow group"
            >
              <div className={`w-11 h-11 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{stat.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </button>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Schedules</h2>
            <button
              onClick={() => navigate("/admin/rota-schedules")}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground text-sm mt-3">Loading schedules...</p>
            </div>
          ) : recentSchedules.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-3">No schedules created yet</p>
              <button
                onClick={() => navigate("/admin/create-rota")}
                className="text-primary text-sm font-medium hover:underline"
              >
                Create your first schedule
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-5 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-5 font-medium text-muted-foreground">Staff Name</th>
                    <th className="text-left py-3 px-5 font-medium text-muted-foreground hidden md:table-cell">Shift Time</th>
                    <th className="text-left py-3 px-5 font-medium text-muted-foreground hidden lg:table-cell">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSchedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="py-3 px-5 text-foreground">{formatDate(schedule.shiftDate)}</td>
                      <td className="py-3 px-5 text-foreground">{schedule.staffName}</td>
                      <td className="py-3 px-5 text-foreground hidden md:table-cell">{getShiftTimeDisplay(schedule.shiftTime)}</td>
                      <td className="py-3 px-5 text-foreground hidden lg:table-cell">{schedule.department}</td>
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
