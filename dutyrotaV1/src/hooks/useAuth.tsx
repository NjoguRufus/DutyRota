import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  AppUser,
  initAuthListener,
  initMockAuth,
  login as firebaseLogin,
  logout as firebaseLogout,
  mockLogin,
  mockLogout,
  onAuthChange,
} from "@/lib/auth";
import { USE_MOCK_AUTH } from "@/lib/config";

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
    if (USE_MOCK_AUTH) {
      // Initialize mock auth from localStorage
      initMockAuth();
      setLoading(false);
    } else {
      // Initialize Firebase auth listener
      const unsubscribe = initAuthListener();
      
      // Give it a moment to check auth state
      const timeout = setTimeout(() => setLoading(false), 1000);
      
      return () => {
        unsubscribe();
        clearTimeout(timeout);
      };
    }
  }, []);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = onAuthChange((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (USE_MOCK_AUTH) {
        const result = mockLogin(email, password);
        setLoading(false);
        return { success: result.success, error: result.error };
      } else {
        const result = await firebaseLogin(email, password);
        setLoading(false);
        return { success: result.success, error: result.error };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    if (USE_MOCK_AUTH) {
      mockLogout();
    } else {
      await firebaseLogout();
    }
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
