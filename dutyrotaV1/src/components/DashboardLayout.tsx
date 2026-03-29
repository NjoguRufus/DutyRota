import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAdminSidebar } from "@/hooks/useAdminSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

/**
 * Fixed-height shell: sidebar and navbar stay put; only main content scrolls.
 */
export function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  const sidebar = useAdminSidebar();
  const widthPx = sidebar.collapsed ? sidebar.collapsedWidth : sidebar.width;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/40">
        <AppSidebar
          collapsed={sidebar.collapsed}
          widthPx={widthPx}
          onToggleCollapse={sidebar.toggleCollapsed}
          onResizePointerDown={(clientX) => sidebar.startResize(clientX)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopNavbar
            userName={userName}
            onDesktopSidebarToggle={sidebar.toggleCollapsed}
          />
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
