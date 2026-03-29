import { cn } from "@/lib/utils";

interface SidebarBrandSectionProps {
  /** Icon-only strip when sidebar is collapsed */
  collapsed?: boolean;
  className?: string;
}

/**
 * Admin sidebar brand — logo only (no boxed container), scales with layout.
 */
export function SidebarBrandSection({ collapsed, className }: SidebarBrandSectionProps) {
  if (collapsed) {
    return (
      <div className={cn("flex justify-center px-1 py-2", className)}>
        <img
          src="/logo.png"
          alt="CAPE Media"
          className="h-10 w-auto max-w-[3rem] object-contain object-center"
          width={48}
          height={40}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 px-1 pt-1", className)}>
      <img
        src="/logo.png"
        alt="CAPE Media"
        className="h-[52px] w-auto max-w-[4.5rem] shrink-0 object-contain object-left"
        width={72}
        height={52}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-tight tracking-tight text-foreground">
          CAPE Media
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Duty Rota System
        </p>
      </div>
    </div>
  );
}
