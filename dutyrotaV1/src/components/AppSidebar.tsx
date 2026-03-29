import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarBrandSection } from "@/components/layout/SidebarBrandSection";
import { SidebarResizeHandle } from "@/components/layout/SidebarResizeHandle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Manage Staff", url: "/admin/manage-staff", icon: Users },
  { title: "Rota Schedules", url: "/admin/rota-schedules", icon: CalendarDays },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

interface AppSidebarProps {
  collapsed: boolean;
  widthPx: number;
  onToggleCollapse: () => void;
  onResizePointerDown: (clientX: number) => void;
}

export function AppSidebar({
  collapsed,
  widthPx,
  onToggleCollapse,
  onResizePointerDown,
}: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside
      style={{ width: widthPx }}
      className="relative hidden h-full min-h-0 shrink-0 flex-col border-r border-border/80 bg-gradient-to-b from-card via-card to-muted/25 shadow-[4px_0_32px_-16px_rgba(15,23,42,0.12)] transition-[width] duration-200 ease-out lg:flex"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {collapsed ? (
        <div className="flex shrink-0 flex-col items-center gap-2 border-b border-border/50 px-2 py-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <SidebarBrandSection collapsed />
        </div>
      ) : (
        <div className="flex shrink-0 items-start justify-between gap-1 border-b border-border/50 px-3 pb-3 pt-3">
          <div className="min-w-0 flex-1 pr-1">
            <SidebarBrandSection />
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-2 pt-3"
        aria-label="Main navigation"
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.url;
          const link = (
            <NavLink
              key={item.title}
              to={item.url}
              end
              className={cn(
                "group flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
              )}
              activeClassName=""
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
              {!collapsed && <span className="truncate">{item.title}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.title} delayDuration={300}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-border/70 bg-card/50 p-2 backdrop-blur-sm">
        {collapsed ? (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-xl px-0 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60">
                  <LogOut className="h-[18px] w-[18px]" />
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Log out
            </TooltipContent>
          </Tooltip>
        ) : (
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
        )}
      </div>

      <SidebarResizeHandle
        disabled={collapsed}
        onPointerDown={(clientX) => onResizePointerDown(clientX)}
      />
    </aside>
  );
}
