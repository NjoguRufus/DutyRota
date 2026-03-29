import { useCallback, useEffect, useRef, useState } from "react";

const W_KEY = "dutyrota-admin-sidebar-width";
const C_KEY = "dutyrota-admin-sidebar-collapsed";

const MIN_W = 220;
const MAX_W = 320;
const DEFAULT_W = 272;
const COLLAPSED_W = 72;

function readWidth(): number {
  if (typeof window === "undefined") return DEFAULT_W;
  const n = Number.parseInt(localStorage.getItem(W_KEY) ?? "", 10);
  if (Number.isNaN(n)) return DEFAULT_W;
  return Math.min(MAX_W, Math.max(MIN_W, n));
}

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(C_KEY) === "1";
}

export function useAdminSidebar() {
  const [width, setWidthState] = useState(readWidth);
  const [collapsed, setCollapsedState] = useState(readCollapsed);
  const widthRef = useRef(width);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  const setWidth = useCallback((w: number) => {
    const clamped = Math.min(MAX_W, Math.max(MIN_W, w));
    setWidthState(clamped);
    localStorage.setItem(W_KEY, String(clamped));
  }, []);

  const setCollapsed = useCallback((c: boolean) => {
    setCollapsedState(c);
    localStorage.setItem(C_KEY, c ? "1" : "0");
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((v) => {
      const next = !v;
      localStorage.setItem(C_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const startResize = useCallback(
    (clientXStart: number) => {
      const startW = widthRef.current;
      const onMove = (e: MouseEvent) => {
        const delta = e.clientX - clientXStart;
        setWidth(startW + delta);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [setWidth]
  );

  return {
    width,
    collapsed,
    setCollapsed,
    toggleCollapsed,
    startResize,
    minWidth: MIN_W,
    maxWidth: MAX_W,
    collapsedWidth: COLLAPSED_W,
  };
}
