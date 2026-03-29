import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type UserPreferences,
  loadUserPreferences,
  persistUserPreferences,
  applyThemeClass,
} from "@/lib/userPreferences";

interface UserPreferencesContextValue {
  preferences: UserPreferences;
  /** Replace all preferences, persist, and apply theme. */
  setPreferences: (next: UserPreferences) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => loadUserPreferences());

  const setPreferences = useCallback((next: UserPreferences) => {
    persistUserPreferences(next);
    setPreferencesState(next);
    applyThemeClass(next.theme);
  }, []);

  useEffect(() => {
    applyThemeClass(preferences.theme);
  }, [preferences.theme]);

  const value = useMemo(
    () => ({ preferences, setPreferences }),
    [preferences, setPreferences]
  );

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContextValue {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) {
    throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  }
  return ctx;
}
