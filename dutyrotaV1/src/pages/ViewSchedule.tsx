import { useState, useEffect } from "react";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStaffRotas } from "@/hooks/useStaffRotas";
import { getStaffByAuthUid } from "@/services/staffService";
import type { StaffMember } from "@/services/staffService";
import { StaffPortalHeader } from "@/components/StaffPortalHeader";
import { formatDate, getShiftTimeDisplay } from "@/lib/rotaUtils";

export default function ViewSchedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rotas, loading, error } = useStaffRotas(user?.uid);

  const [staffProfile, setStaffProfile] = useState<StaffMember | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setStaffProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    getStaffByAuthUid(user.uid)
      .then(setStaffProfile)
      .finally(() => setProfileLoading(false));
  }, [user?.uid]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShifts = rotas.filter((rota) => new Date(rota.shiftDate) >= today);
  const pastShifts = rotas
    .filter((rota) => new Date(rota.shiftDate) < today)
    .sort((a, b) => new Date(b.shiftDate).getTime() - new Date(a.shiftDate).getTime());

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      <StaffPortalHeader staffProfile={staffProfile} profileLoading={profileLoading} />

      <main className="mx-auto mt-3 min-h-0 w-full max-w-3xl flex-1 overflow-y-auto overflow-x-hidden px-4 pb-14 sm:mt-4 sm:px-6 sm:pb-12">
        <button
          type="button"
          onClick={() => navigate("/staff/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <h1 className="mb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          My Schedule
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Duty shifts for {staffProfile?.fullName ?? user?.name ?? "Staff Member"}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground text-sm mt-3">Loading your schedule…</p>
          </div>
        )}

        {!loading && (
          <>
            <div className="bg-card rounded-xl border border-border mb-6">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">
                  Upcoming shifts ({upcomingShifts.length})
                </h2>
              </div>

              {upcomingShifts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <CalendarDays className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No upcoming shifts scheduled</p>
                </div>
              ) : (
                <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-5 sm:py-3 sm:text-sm">
                          Date
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-5 sm:py-3 sm:text-sm">
                          Shift Time
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-5 sm:py-3 sm:text-sm">
                          Department
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingShifts.map((shift) => (
                        <tr
                          key={shift.id}
                          className="border-b border-border last:border-0 transition-colors hover:bg-accent/50"
                        >
                          <td className="px-3 py-2.5 font-medium text-foreground sm:px-5 sm:py-3">
                            {formatDate(shift.shiftDate)}
                          </td>
                          <td className="px-3 py-2.5 text-foreground sm:px-5 sm:py-3">
                            {getShiftTimeDisplay(shift.shiftTime)}
                          </td>
                          <td className="px-3 py-2.5 text-foreground sm:px-5 sm:py-3">{shift.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {pastShifts.length > 0 && (
              <div className="bg-card rounded-xl border border-border">
                <div className="p-5 border-b border-border">
                  <h2 className="font-semibold text-foreground">
                    Past shifts ({pastShifts.length})
                  </h2>
                </div>
                <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-5 sm:py-3 sm:text-sm">
                          Date
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-5 sm:py-3 sm:text-sm">
                          Shift Time
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-5 sm:py-3 sm:text-sm">
                          Department
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastShifts.slice(0, 5).map((shift) => (
                        <tr
                          key={shift.id}
                          className="border-b border-border opacity-70 transition-colors last:border-0 hover:bg-accent/50"
                        >
                          <td className="px-3 py-2.5 text-foreground sm:px-5 sm:py-3">
                            {formatDate(shift.shiftDate)}
                          </td>
                          <td className="px-3 py-2.5 text-foreground sm:px-5 sm:py-3">
                            {getShiftTimeDisplay(shift.shiftTime)}
                          </td>
                          <td className="px-3 py-2.5 text-foreground sm:px-5 sm:py-3">{shift.department}</td>
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
