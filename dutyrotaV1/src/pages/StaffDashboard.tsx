import { useState, useEffect } from "react";
import { CalendarDays, Clock, Building, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRotas, Rota } from "@/hooks/useRotas";
import { formatDate, getShiftTimeDisplay } from "@/lib/rotaData";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getStaffRotas } = useRotas();

  const [upcomingShifts, setUpcomingShifts] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStaffRotas() {
      if (user?.name) {
        setLoading(true);
        const allStaffRotas = await getStaffRotas(user.name);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = allStaffRotas.filter(
          (rota) => new Date(rota.shiftDate) >= today
        );
        
        setUpcomingShifts(upcoming);
        setLoading(false);
      }
    }
    loadStaffRotas();
  }, [user?.name, getStaffRotas]);

  const handleLogout = async () => {
    await logout();
    navigate("/staff/login");
  };

  const nextShift = upcomingShifts[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CM</span>
          </div>
          <span className="font-semibold text-foreground text-sm">Cape Media Staff Portal</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-6 mt-8">
        {/* Welcome Card */}
        <div className="bg-card rounded-xl border border-border p-8 text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary text-2xl font-bold">
              {user?.name?.split(" ").map(n => n[0]).join("") ?? "S"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome, {user?.name ?? "Staff"}</h1>
          <p className="text-muted-foreground text-sm mb-6">Here's your staff portal</p>

          {/* Upcoming shifts summary */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CalendarDays className="h-4 w-4" />
                <span>
                  {upcomingShifts.length === 0
                    ? "No upcoming shifts scheduled"
                    : upcomingShifts.length === 1
                    ? "1 upcoming shift"
                    : `${upcomingShifts.length} upcoming shifts`}
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => navigate("/staff/schedule")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <CalendarDays className="h-5 w-5" /> View My Schedule
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground text-sm mt-3">Loading your schedule...</p>
          </div>
        )}

        {/* Next Shift Card */}
        {!loading && nextShift && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Next Upcoming Shift</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{formatDate(nextShift.shiftDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shift Time</p>
                  <p className="font-medium text-foreground">{getShiftTimeDisplay(nextShift.shiftTime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Building className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium text-foreground">{nextShift.department}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No shifts message */}
        {!loading && upcomingShifts.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No Upcoming Shifts</h3>
            <p className="text-muted-foreground text-sm">
              You don't have any shifts scheduled. Check back later or contact your administrator.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
