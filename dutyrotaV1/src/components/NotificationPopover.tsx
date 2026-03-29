import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatNotificationTime } from "@/lib/formatNotificationTime";
import { cn } from "@/lib/utils";

interface NotificationPopoverProps {
  userId: string | undefined;
}

export function NotificationPopover({ userId }: NotificationPopoverProps) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, error, markAsRead } =
    useNotifications(userId);

  const handleOpenItem = async (id: string, read: boolean) => {
    if (!read) {
      try {
        await markAsRead(id);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative rounded-lg"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(20rem,calc(100vw-1.5rem))] max-w-[20rem] overflow-hidden rounded-xl border-border/80 p-0 shadow-lg"
        align="end"
        sideOffset={8}
      >
        <div className="border-b border-border/80 bg-muted/30 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <p className="text-[11px] text-muted-foreground">Live updates from your team</p>
        </div>
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="p-4 text-sm text-destructive">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <ScrollArea className="h-[min(320px,50vh)]">
            <ul className="p-1">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleOpenItem(n.id, n.read)}
                    className={cn(
                      "w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-foreground">{n.title}</span>
                      {!n.read && (
                        <span className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1 leading-snug">
                      {n.message}
                    </p>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      {formatNotificationTime(n.createdAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
