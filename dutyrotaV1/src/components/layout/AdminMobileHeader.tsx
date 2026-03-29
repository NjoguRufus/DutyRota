import { NotificationPopover } from "@/components/NotificationPopover";
import { AdminProfileMenu } from "@/components/AdminProfileMenu";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface AdminMobileHeaderProps {
  userName?: string;
}

/**
 * Branded admin header for small screens (sidebar replaced by bottom nav).
 */
export function AdminMobileHeader({ userName }: AdminMobileHeaderProps) {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const displayName = user?.name ?? userName ?? "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-[3.75rem] shrink-0 items-center border-b border-border/80 bg-card/95 px-3 shadow-sm backdrop-blur-md lg:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <img
          src="/logo.png"
          alt="CAPE Media"
          className="h-9 w-auto max-h-9 shrink-0 object-contain object-left"
          width={40}
          height={36}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight tracking-tight text-foreground">
            Cape Media Duty Rota System
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {preferences.inAppAssignmentAlerts ? (
          <NotificationPopover userId={user?.uid} />
        ) : null}
        <AdminProfileMenu displayName={displayName} />
      </div>
    </header>
  );
}
