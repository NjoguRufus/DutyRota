import { LogOut, Moon, Sun, User } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { cn } from "@/lib/utils";

interface AdminProfileMenuProps {
  displayName?: string;
}

export function AdminProfileMenu({ displayName }: AdminProfileMenuProps) {
  const { user, logout } = useAuth();
  const { preferences, setPreferences } = useUserPreferences();
  const navigate = useNavigate();

  const name = user?.name ?? displayName ?? "Admin";
  const email = user?.email ?? "—";
  const role = user?.role ?? "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
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
          <span className="hidden max-w-[140px] truncate text-sm font-medium text-foreground sm:inline">
            {name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(16rem,calc(100vw-1.25rem))] max-w-sm rounded-xl border-border/80 p-2 shadow-lg"
      >
        <DropdownMenuLabel className="space-y-3 rounded-lg bg-muted/40 px-3 py-3 font-normal">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              <p className="text-xs capitalize text-muted-foreground">{role}</p>
            </div>
          </div>
          <div className="border-t border-border/60 pt-3 text-xs">
            <p className="text-muted-foreground">Email</p>
            <p className="truncate font-medium text-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          className="flex w-full cursor-default items-center gap-3 rounded-lg px-2 py-2.5 focus:bg-accent/60"
          onSelect={(e) => e.preventDefault()}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground">
            {preferences.theme === "dark" ? (
              <Moon className="h-4 w-4" aria-hidden />
            ) : (
              <Sun className="h-4 w-4" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Appearance</p>
            <p className="text-[11px] text-muted-foreground">
              {preferences.theme === "dark" ? "Dark mode on" : "Light mode"}
            </p>
          </div>
          <Switch
            checked={preferences.theme === "dark"}
            onCheckedChange={(on) =>
              setPreferences({
                ...preferences,
                theme: on ? "dark" : "light",
              })
            }
            aria-label="Toggle dark mode"
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
        </DropdownMenuItem>
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
  );
}
