import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { NotificationPopover } from "@/components/NotificationPopover";
import type { StaffMember } from "@/services/staffService";
import { cn } from "@/lib/utils";

interface StaffPortalHeaderProps {
  staffProfile: StaffMember | null;
  profileLoading?: boolean;
}

export function StaffPortalHeader({
  staffProfile,
  profileLoading,
}: StaffPortalHeaderProps) {
  const { user, logout } = useAuth();
  const { preferences } = useUserPreferences();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/staff/login");
  };

  const name = staffProfile?.fullName ?? user?.name ?? "Staff";
  const email = staffProfile?.email ?? user?.email ?? "—";
  const department = staffProfile?.department ?? "—";

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border/80 bg-card/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/logo.png"
            alt="CAPE Media"
            className="h-11 w-auto max-w-[3.5rem] shrink-0 object-contain object-left"
            width={56}
            height={44}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              CAPE Media
            </p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Staff portal
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {preferences.inAppAssignmentAlerts ? (
            <NotificationPopover userId={user?.uid} />
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "h-auto gap-2 rounded-xl border border-transparent px-2 py-1.5",
                  "hover:border-border/80 hover:bg-muted/60"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 ring-2 ring-background">
                  <User className="h-4 w-4 text-primary" aria-hidden />
                </div>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-foreground sm:inline">
                  {profileLoading ? "…" : name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/80 p-2 shadow-lg">
              <DropdownMenuLabel className="space-y-3 rounded-lg bg-muted/40 px-3 py-3 font-normal">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">Staff</p>
                  </div>
                </div>
                <dl className="space-y-2 border-t border-border/60 pt-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="truncate font-medium text-foreground">{email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Department</dt>
                    <dd className="font-medium text-foreground">{department}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Role</dt>
                    <dd className="font-medium text-foreground">Staff</dd>
                  </div>
                </dl>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
