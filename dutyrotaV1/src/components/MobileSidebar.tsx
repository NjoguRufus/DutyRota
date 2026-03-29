import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarBrandSection } from "@/components/layout/SidebarBrandSection";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Manage Staff", url: "/admin/manage-staff", icon: Users },
  { title: "Rota Schedules", url: "/admin/rota-schedules", icon: CalendarDays },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute bottom-0 left-0 top-0 flex w-[min(18rem,88vw)] flex-col border-r border-border/80 bg-card shadow-2xl shadow-black/10">
            <div className="flex items-start justify-between gap-2 border-b border-border/70 p-4">
              <div className="min-w-0 flex-1">
                <SidebarBrandSection />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav
              className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-3"
              aria-label="Main navigation"
            >
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    end
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                    )}
                    activeClassName=""
                    onClick={() => setOpen(false)}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-white/15 text-primary-foreground"
                          : "bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="border-t border-border/70 p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60">
                  <LogOut className="h-[18px] w-[18px]" />
                </span>
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
