interface SidebarResizeHandleProps {
  onPointerDown: (clientX: number) => void;
  disabled?: boolean;
}

export function SidebarResizeHandle({ onPointerDown, disabled }: SidebarResizeHandleProps) {
  if (disabled) return null;

  return (
    <button
      type="button"
      aria-label="Resize sidebar"
      className="absolute right-0 top-0 z-10 h-full w-3 translate-x-1/2 cursor-col-resize border-0 bg-transparent p-0 hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      onMouseDown={(e) => {
        e.preventDefault();
        onPointerDown(e.clientX);
      }}
    />
  );
}
