import { useState, useEffect } from "react";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRotas, Rota } from "@/hooks/useRotas";
import { formatDate, getShiftTimeDisplay } from "@/lib/rotaData";

export default function ViewSchedule() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getStaffRotas } = useRotas();

  const [upcomingShifts, setUpcomingShifts] = useState<Rota[]>([]);
  const [pastShifts, setPastShifts] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStaffRotas() {
      if (user?.name) {
        setLoading(true);
        const staffRotas = await getStaffRotas(user.name);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = staffRotas.filter(
          (rota) => new Date(rota.shiftDate) >= today
        );

        const past = staffRotas
          .filter((rota) => new Date(rota.shiftDate) < today)
          .reverse();

        setUpcomingShifts(upcoming);
        setPastShifts(past);
        setLoading(false);
      }
    }
    loadStaffRotas();
  }, [user?.name, getStaffRotas]);

  const handleLogout = async () => {
    await logout();
    navigate("/staff/login");
  };

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

      <main className="max-w-3xl mx-auto p-6 mt-4">
        <button
          onClick={() => navigate("/staff/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-2">My Schedule</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Duty shifts for {user?.name ?? "Staff Member"}
        </p>

        {/* Loading State */}
        {loading && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground text-sm mt-3">Loading your schedule...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Upcoming Shifts */}
            <div className="bg-card rounded-xl border border-border mb-6">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">
                  Upcoming Shifts ({upcomingShifts.length})
                </h2>
              </div>

              {upcomingShifts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <CalendarDays className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No upcoming shifts scheduled
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Shift Time</th>
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingShifts.map((shift) => (
                        <tr
                          key={shift.id}
                          className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                        >
                          <td className="py-3 px-5 text-foreground font-medium">
                            {formatDate(shift.shiftDate)}
                          </td>
                          <td className="py-3 px-5 text-foreground">
                            {getShiftTimeDisplay(shift.shiftTime)}
                          </td>
                          <td className="py-3 px-5 text-foreground">{shift.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Past Shifts */}
            {pastShifts.length > 0 && (
              <div className="bg-card rounded-xl border border-border">
                <div className="p-5 border-b border-border">
                  <h2 className="font-semibold text-foreground">
                    Past Shifts ({pastShifts.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Shift Time</th>
                        <th className="text-left py-3 px-5 font-medium text-muted-foreground">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastShifts.slice(0, 5).map((shift) => (
                        <tr
                          key={shift.id}
                          className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors opacity-70"
                        >
                          <td className="py-3 px-5 text-foreground">
                            {formatDate(shift.shiftDate)}
                          </td>
                          <td className="py-3 px-5 text-foreground">
                            {getShiftTimeDisplay(shift.shiftTime)}
                          </td>
                          <td className="py-3 px-5 text-foreground">{shift.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pastShifts.length > 5 && (
                  <div className="p-3 text-center border-t border-border">
                    <span className="text-muted-foreground text-xs">
                      Showing 5 of {pastShifts.length} past shifts
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
