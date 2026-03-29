import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  AppUser,
  initAuthListener,
  login as firebaseLogin,
  logout as firebaseLogout,
  onAuthChange,
} from "@/lib/auth";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const offAuth = onAuthChange((newUser) => {
      setUser(newUser);
      setLoading(false);
    });
    const offListener = initAuthListener();
    return () => {
      offAuth();
      offListener();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await firebaseLogin(email, password);
      setLoading(false);
      return { success: result.success, error: result.error };
    } catch {
      setLoading(false);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    await firebaseLogout();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === "admin",
    isStaff: user?.role === "staff",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
