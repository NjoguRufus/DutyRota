export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "dutyrota-user-preferences";

export interface UserPreferences {
  theme: ThemeMode;
  compactDashboard: boolean;
  inAppAssignmentAlerts: boolean;
  emailSummaries: boolean;
  localizationExtra: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "light",
  compactDashboard: false,
  inAppAssignmentAlerts: true,
  emailSummaries: false,
  localizationExtra: false,
};

function mergeWithDefaults(p: Partial<UserPreferences>): UserPreferences {
  return { ...DEFAULT_USER_PREFERENCES, ...p };
}

/** Apply Tailwind `dark` class on <html> (call whenever theme changes). */
export function applyThemeClass(theme: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Run before React mounts to avoid light flash when user prefers dark.
 */
export function initThemeFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    if (parsed.theme === "dark" || parsed.theme === "light") {
      applyThemeClass(parsed.theme);
    }
  } catch {
    /* ignore */
  }
}

export function loadUserPreferences(): UserPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_USER_PREFERENCES };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return mergeWithDefaults(parsed);
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export function persistUserPreferences(prefs: UserPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  applyThemeClass(prefs.theme);
}

export function preferencesEqual(a: UserPreferences, b: UserPreferences): boolean {
  return (
    a.theme === b.theme &&
    a.compactDashboard === b.compactDashboard &&
    a.inAppAssignmentAlerts === b.inAppAssignmentAlerts &&
    a.emailSummaries === b.emailSummaries &&
    a.localizationExtra === b.localizationExtra
  );
}
