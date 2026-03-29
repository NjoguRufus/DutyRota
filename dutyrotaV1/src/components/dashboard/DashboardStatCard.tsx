import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  iconClassName: string;
  onClick: () => void;
  compact?: boolean;
}

/**
 * Compact stat tile: icon + title on one row, prominent value below.
 */
export function DashboardStatCard({
  title,
  value,
  hint,
  icon: Icon,
  iconClassName,
  onClick,
  compact,
}: DashboardStatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border/80 bg-card/90 text-left shadow-sm transition-all",
        compact ? "p-2.5" : "p-3.5",
        "hover:border-border hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      )}
    >
      <div className={cn("flex items-center gap-2", compact ? "mb-1" : "mb-2")}>
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            iconClassName
          )}
        >
          <Icon className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
        </span>
        <h3 className="min-w-0 flex-1 text-xs font-semibold leading-tight text-foreground sm:text-[13px]">
          {title}
        </h3>
      </div>
      <p
        className={cn(
          "font-semibold tabular-nums tracking-tight text-foreground",
          compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:text-xs">
          {hint}
        </p>
      ) : null}
    </button>
  );
}
