import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PremiumLoginLayout } from "@/components/auth/PremiumLoginLayout";
import { LoginCredentialForm } from "@/components/auth/LoginCredentialForm";

export default function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, isAdmin, isStaff } = useAuth();

  useEffect(() => {
    if (user) {
      if (isStaff) {
        navigate("/staff/dashboard");
      } else if (isAdmin) {
        navigate("/admin/dashboard");
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
      // Redirect handled by useEffect
    } else {
      setError(result.error || "Invalid credentials");
    }
  };

  return (
    <PremiumLoginLayout>
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/90 lg:text-left">
        Staff portal
      </p>
      <h2 className="font-login-display text-center text-2xl font-semibold tracking-tight text-white lg:text-left">
        Welcome back
      </h2>
      <p className="mt-2 text-center text-sm text-slate-400 lg:text-left">
        Sign in to view your schedule and notifications
      </p>
      <p className="mt-1 text-center text-xs text-slate-500 lg:text-left">
        Use the credentials provided by your administrator
      </p>

      <div className="mt-8">
        <LoginCredentialForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          error={error}
          isLoading={isLoading}
          onSubmit={handleLogin}
          emailId="staff-email"
          passwordId="staff-password"
          submitLabel="Sign in"
        />
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        Administrator?{" "}
        <Link
          to="/"
          className="font-medium text-cyan-400/90 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
        >
          Admin sign in
        </Link>
      </p>
    </PremiumLoginLayout>
  );
}
