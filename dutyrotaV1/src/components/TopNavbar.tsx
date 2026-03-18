import { Search, Bell } from "lucide-react";
import { MobileSidebar } from "./MobileSidebar";

interface TopNavbarProps {
  userName?: string;
}

export function TopNavbar({ userName = "Admin" }: TopNavbarProps) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-semibold">
              {userName.charAt(0)}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">{userName}</span>
        </div>
      </div>
    </header>
  );
}
