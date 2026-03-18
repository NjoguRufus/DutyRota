import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, isAdmin, isStaff } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else if (isStaff) {
        navigate("/staff/dashboard");
      }
    }
  }, [user, isAdmin, isStaff, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      // Auth state will trigger the useEffect above to redirect
    } else {
      setError(result.error || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">CM</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Cape Media Support Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">Duty Rota Management System</p>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Admin Login</h2>
          {error && (
            <div 
              role="alert" 
              aria-live="polite"
              className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
            >
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                disabled={isLoading}
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Staff member?{" "}
            <Link to="/staff/login" className="text-primary hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
