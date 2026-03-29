import { PanelLeft, Search } from "lucide-react";
import { MobileSidebar } from "./MobileSidebar";
import { NotificationPopover } from "@/components/NotificationPopover";
import { AdminProfileMenu } from "@/components/AdminProfileMenu";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface TopNavbarProps {
  userName?: string;
  /** Desktop-only control to collapse/expand the admin sidebar */
  onDesktopSidebarToggle?: () => void;
}

export function TopNavbar({ userName, onDesktopSidebarToggle }: TopNavbarProps) {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const displayName = user?.name ?? userName ?? "Admin";

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border/80 bg-card/85 shadow-sm backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <MobileSidebar />
          {onDesktopSidebarToggle ? (
            <button
              type="button"
              onClick={onDesktopSidebarToggle}
              className="hidden rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
              aria-label="Toggle sidebar width"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          ) : null}
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search…"
              className="h-10 w-full rounded-xl border border-border/80 bg-background/80 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {preferences.inAppAssignmentAlerts ? (
            <NotificationPopover userId={user?.uid} />
          ) : null}
          <AdminProfileMenu displayName={displayName} />
        </div>
      </div>
    </header>
  );
}
