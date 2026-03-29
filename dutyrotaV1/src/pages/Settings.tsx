import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import {
  User,
  Shield,
  SlidersHorizontal,
  Info,
  Bell,
  Palette,
  LayoutGrid,
  Languages,
  KeyRound,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { auth, db } from "@/lib/firebase";
import { getStaffByAuthUid } from "@/services/staffService";
import { APP_DISPLAY_NAME, APP_VERSION_LABEL, ORGANIZATION_NAME } from "@/lib/appInfo";
import type { UserPreferences } from "@/lib/userPreferences";
import { preferencesEqual } from "@/lib/userPreferences";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatWhen(isoOrMs: string | number | undefined): string {
  if (isoOrMs === undefined || isoOrMs === "") return "—";
  const d = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm",
        className
      )}
    >
      <div className="border-b border-border/70 bg-muted/20 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/50 py-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-sm text-foreground sm:text-right",
          mono && "break-all font-mono text-xs sm:max-w-[60%]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { preferences, setPreferences } = useUserPreferences();
  const [draft, setDraft] = useState<UserPreferences>(() => ({ ...preferences }));
  const [saving, setSaving] = useState(false);

  const [userDocCreated, setUserDocCreated] = useState<string | null>(null);
  const [staffDepartment, setStaffDepartment] = useState<string | null>(null);
  const [lastSignIn, setLastSignIn] = useState<string>("—");
  const [accountCreatedAuth, setAccountCreatedAuth] = useState<string>("—");

  useEffect(() => {
    setDraft({ ...preferences });
  }, [preferences]);

  const prefsDirty = !preferencesEqual(draft, preferences);

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 120));
      setPreferences({ ...draft });
      toast.success("Preferences saved", {
        description: "Your choices are stored on this device and apply across the app.",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (cancelled || !snap.exists()) return;
      const data = snap.data();
      const c = data.createdAt;
      if (typeof c === "string") setUserDocCreated(c);
      else if (c && typeof c === "object" && "toDate" in c && typeof (c as { toDate: () => Date }).toDate === "function") {
        setUserDocCreated((c as { toDate: () => Date }).toDate().toISOString());
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || user.role !== "staff") {
      setStaffDepartment(null);
      return;
    }
    let cancelled = false;
    getStaffByAuthUid(user.uid).then((s) => {
      if (!cancelled) setStaffDepartment(s?.department ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.role]);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u?.metadata) return;
    setLastSignIn(formatWhen(u.metadata.lastSignInTime));
    setAccountCreatedAuth(formatWhen(u.metadata.creationTime));
  }, [user?.uid]);

  const profileCreatedDisplay = userDocCreated ? formatWhen(userDocCreated) : "—";

  return (
    <DashboardLayout userName={user?.name ?? "Admin"}>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Profile, account security, preferences, and system information.
          </p>
        </div>

        {!user ? (
          <p className="text-sm text-muted-foreground">You are not signed in.</p>
        ) : (
          <div className="space-y-6">
            <SectionCard
              icon={User}
              title="Profile information"
              description="Details from your Firestore user profile and directory."
            >
              <dl>
                <Row label="Full name" value={user.name} />
                <Row label="Email" value={user.email} />
                <Row label="Role" value={<span className="capitalize">{user.role}</span>} />
                <Row label="User ID" value={user.uid} mono />
                <Row
                  label="Department"
                  value={
                    user.role === "staff"
                      ? staffDepartment ?? "—"
                      : "Admin accounts are not tied to a rota department."
                  }
                />
                <Row label="Profile record created" value={profileCreatedDisplay} />
              </dl>
            </SectionCard>

            <SectionCard
              icon={Shield}
              title="Account"
              description="Authentication status and sign-in activity."
            >
              <dl>
                <Row
                  label="Account type"
                  value={user.role === "admin" ? "Administrator" : "Staff portal"}
                />
                <Row label="Login email" value={user.email} />
                <Row label="Authentication" value="Firebase Authentication · Email & password" />
                <Row label="Account created (Auth)" value={accountCreatedAuth} />
                <Row label="Last sign-in" value={lastSignIn} />
              </dl>
              <div className="mt-5 rounded-xl border border-dashed border-border/90 bg-muted/15 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Password & security
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Password changes and MFA are managed in Firebase Authentication. Contact your
                  administrator if you need a reset link or policy updates.
                </p>
              </div>
            </SectionCard>

            <SectionCard
              icon={SlidersHorizontal}
              title="System preferences"
              description="Adjust appearance and behaviour. Click Save to store on this device."
            >
              {prefsDirty ? (
                <p
                  className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100"
                  role="status"
                >
                  You have unsaved changes — save to apply and persist them.
                </p>
              ) : null}
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="pref-theme" className="text-sm font-medium">
                        Dark appearance
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Navy–charcoal dark theme across the app (saved with Save).
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pref-theme"
                    checked={draft.theme === "dark"}
                    onCheckedChange={(on) =>
                      setDraft((d) => ({ ...d, theme: on ? "dark" : "light" }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="pref-inapp" className="text-sm font-medium">
                        In-app assignment alerts
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Notification bell and feed entries (saved locally).
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pref-inapp"
                    checked={draft.inAppAssignmentAlerts}
                    onCheckedChange={(on) =>
                      setDraft((d) => ({ ...d, inAppAssignmentAlerts: on }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="pref-email-sum" className="text-sm font-medium">
                        Email summaries
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Preference is saved; automated email is not connected yet.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pref-email-sum"
                    checked={draft.emailSummaries}
                    onCheckedChange={(on) => setDraft((d) => ({ ...d, emailSummaries: on }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="pref-dash" className="text-sm font-medium">
                        Compact dashboard
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Tighter stat tiles on the admin dashboard.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pref-dash"
                    checked={draft.compactDashboard}
                    onCheckedChange={(on) =>
                      setDraft((d) => ({ ...d, compactDashboard: on }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="pref-lang" className="text-sm font-medium">
                        Localisation
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Saved for when additional locales are available (UI stays English UK).
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pref-lang"
                    checked={draft.localizationExtra}
                    onCheckedChange={(on) =>
                      setDraft((d) => ({ ...d, localizationExtra: on }))
                    }
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-5">
                <Button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={!prefsDirty || saving}
                  className="min-w-[7rem]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save preferences"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!prefsDirty || saving}
                  onClick={() => setDraft({ ...preferences })}
                >
                  Reset
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              icon={Info}
              title="About this system"
              description="Internal operations platform for scheduling and coverage."
            >
              <dl>
                <Row label="System name" value={APP_DISPLAY_NAME} />
                <Row label="Version" value={APP_VERSION_LABEL} />
                <Row label="Organisation" value={ORGANIZATION_NAME} />
              </dl>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Centralised duty rota for newsroom and media teams: staff scheduling, shift assignments,
                notifications, and reporting in one place.
              </p>
            </SectionCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
