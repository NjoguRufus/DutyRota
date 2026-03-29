import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Building2,
  Loader2,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStaffRotas } from "@/hooks/useStaffRotas";
import { useNotifications } from "@/hooks/useNotifications";
import { getStaffByAuthUid } from "@/services/staffService";
import type { StaffMember } from "@/services/staffService";
import { StaffPortalHeader } from "@/components/StaffPortalHeader";
import { formatDate, getShiftTimeDisplay } from "@/lib/rotaUtils";
import { formatNotificationTime } from "@/lib/formatNotificationTime";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { upcoming, loading: rotaLoading, error: rotaError } = useStaffRotas(user?.uid);
  const { notifications, loading: notifLoading, markAsRead } = useNotifications(user?.uid);

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

  const nextShift = upcoming[0];
  const recentNotifications = notifications.slice(0, 8);
  const displayName = staffProfile?.fullName ?? user?.name ?? "there";

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      <StaffPortalHeader staffProfile={staffProfile} profileLoading={profileLoading} />

      <main className="mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-y-auto overflow-x-hidden px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        {/* Page header — not a heavy card */}
        <div className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Staff portal
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Welcome, {profileLoading ? "…" : displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {staffProfile?.department ? (
                <span className="inline-flex items-center rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                  {staffProfile.department}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">
                {rotaLoading
                  ? "Loading schedule…"
                  : upcoming.length === 0
                    ? "No upcoming shifts"
                    : `${upcoming.length} upcoming shift${upcoming.length === 1 ? "" : "s"}`}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full shrink-0 gap-2 rounded-xl border-border/80 bg-card/80 shadow-sm backdrop-blur-sm hover:bg-accent sm:w-auto"
            onClick={() => navigate("/staff/schedule")}
          >
            Full schedule
            <ChevronRight className="h-4 w-4 opacity-70" />
          </Button>
        </div>

        {rotaError ? (
          <div
            className="mb-8 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {rotaError}
          </div>
        ) : null}

        {/* Next shift — structured summary panel */}
        <section className="mb-12">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Next upcoming shift
          </h2>

          {rotaLoading && !nextShift ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card/60 py-16 shadow-sm backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Loading your schedule…</p>
            </div>
          ) : !rotaLoading && !nextShift ? (
            <div className="rounded-2xl border border-dashed border-border/90 bg-muted/20 px-6 py-14 text-center shadow-inner">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
                <CalendarDays className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-base font-medium text-foreground">No upcoming shift assigned yet.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                When your manager assigns a rota, the date, time, and department will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-md shadow-black/[0.04] backdrop-blur-sm">
              <div className="grid divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="flex gap-4 p-5 sm:p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Date
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                      {formatDate(nextShift!.shiftDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 sm:p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Shift time
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                      {getShiftTimeDisplay(nextShift!.shiftTime)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 sm:p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Department
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                      {nextShift!.department}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent notifications */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent notifications
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-md shadow-black/[0.04] backdrop-blur-sm">
            {notifLoading && recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Loading notifications…</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-base font-medium text-foreground">No recent notifications.</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Assignment alerts and updates from your team will show up here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/70">
                {recentNotifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!n.read) void markAsRead(n.id);
                      }}
                      className={cn(
                        "flex w-full gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40",
                        !n.read && "bg-primary/[0.04]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          n.read ? "bg-transparent" : "bg-primary shadow-sm shadow-primary/40"
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-semibold text-foreground">{n.title}</p>
                          <time
                            className="text-[11px] tabular-nums text-muted-foreground"
                            dateTime={n.createdAt}
                          >
                            {formatNotificationTime(n.createdAt)}
                          </time>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{n.message}</p>
                        {!n.read ? (
                          <p className="text-[11px] font-medium text-primary">Unread · tap to mark read</p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
