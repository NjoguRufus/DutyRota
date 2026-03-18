import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface StaffGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard for staff-only pages.
 * Redirects to staff login (/staff/login) if user is not logged in or is not staff.
 */
export function StaffGuard({ children }: StaffGuardProps) {
  const { user, loading, isStaff } = useAuth();

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
    return <Navigate to="/staff/login" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
