import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MoreHorizontal,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const PRIMARY = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { label: "Staff", to: "/admin/manage-staff", icon: Users },
  { label: "Schedules", to: "/admin/rota-schedules", icon: CalendarDays },
] as const;

export function AdminMobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive =
    location.pathname.startsWith("/admin/reports") ||
    location.pathname.startsWith("/admin/settings");

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-6px_28px_-12px_rgba(0,0,0,0.18)] backdrop-blur-md dark:shadow-[0_-6px_28px_-12px_rgba(0,0,0,0.45)] lg:hidden"
        aria-label="Primary mobile navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
          {PRIMARY.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-transparent text-current"
                      )}
                    >
                      <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
                    </span>
                    <span className="max-w-full truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors",
              moreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                moreActive ? "bg-primary/15 text-primary" : "bg-transparent"
              )}
            >
              <MoreHorizontal className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
            </span>
            <span className="max-w-full truncate">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          overlayClassName={cn(
            "z-40 bg-black/60",
            /* Dim only the area above the bottom nav (must match DashboardLayout pb). */
            "top-0 right-0 left-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))]"
          )}
          className={cn(
            "z-[55] max-h-[min(42vh,280px)] rounded-t-2xl border border-border/80 border-b-0 bg-card p-0 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.5)] lg:hidden",
            /* Anchored above the nav bar with a small gap (nav stays visible & tappable). */
            "bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px)+0.375rem)]"
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div
            className="flex flex-col items-center border-b border-border/60 px-4 pb-3 pt-2"
            aria-hidden
          >
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex flex-col gap-1 p-3 pb-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted/80"
              onClick={() => {
                setMoreOpen(false);
                navigate("/admin/reports");
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </span>
              Reports
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted/80"
              onClick={() => {
                setMoreOpen(false);
                navigate("/admin/settings");
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </span>
              Settings
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
