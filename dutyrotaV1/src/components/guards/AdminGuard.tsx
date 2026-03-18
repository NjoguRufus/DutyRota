import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard for admin-only pages.
 * Redirects to admin login (/) if user is not logged in or is not an admin.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return <>{children}</>;
}
