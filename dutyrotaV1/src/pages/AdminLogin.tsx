import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createAdminAuthAccount } from "@/lib/auth";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { PremiumLoginLayout } from "@/components/auth/PremiumLoginLayout";
import { LoginCredentialForm } from "@/components/auth/LoginCredentialForm";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, isAdmin, isStaff } = useAuth();

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createConfirm, setCreateConfirm] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

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
      // Redirect handled by useEffect
    } else {
      setError(result.error || "Invalid credentials");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    if (!createName.trim()) {
      setCreateError("Name is required");
      return;
    }
    if (!createEmail.trim()) {
      setCreateError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createEmail)) {
      setCreateError("Enter a valid email");
      return;
    }
    if (!createPassword || createPassword.length < 6) {
      setCreateError("Password must be at least 6 characters");
      return;
    }
    if (createPassword !== createConfirm) {
      setCreateError("Passwords do not match");
      return;
    }

    setCreateSubmitting(true);
    try {
      const result = await createAdminAuthAccount(
        createEmail,
        createPassword,
        createName.trim()
      );
      if ("error" in result) {
        setCreateError(result.error);
        return;
      }
      toast.success(
        "Admin account created in Firebase. Sign in above with that email and password."
      );
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateConfirm("");
      setShowCreateAdmin(false);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-amber-500/20 bg-black/20 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/15";

  return (
    <PremiumLoginLayout>
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/90 lg:text-left">
        Admin console
      </p>
      <h2 className="font-login-display text-center text-2xl font-semibold tracking-tight text-white lg:text-left">
        Welcome back
      </h2>
      <p className="mt-2 text-center text-sm text-slate-400 lg:text-left">
        Sign in to access your dashboard
      </p>
      <p className="mt-1 text-center text-xs text-slate-500 lg:text-left">
        Admin &amp; staff portal access
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
          emailId="admin-email"
          passwordId="admin-password"
          submitLabel="Sign in"
        />
      </div>

      <div className="mt-8 border-t border-white/[0.08] pt-6">
        <button
          type="button"
          onClick={() => {
            setShowCreateAdmin((v) => !v);
            setCreateError("");
          }}
          className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-amber-200/90 transition-colors hover:text-amber-100"
        >
          <span>Create admin account (temporary setup)</span>
          {showCreateAdmin ? (
            <ChevronUp className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
          )}
        </button>

        {showCreateAdmin ? (
          <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-950/25 p-4 backdrop-blur-sm">
            <div className="mb-4 flex gap-2 text-xs leading-relaxed text-amber-100/80">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80" aria-hidden />
              <p>
                Use this once to register your admin email and password, then log in above. Remove
                this section before going live if you do not want public sign-ups. Deploy Firestore
                rules that allow bootstrap, then disable this UI when finished.
              </p>
            </div>

            {createError ? (
              <div
                role="alert"
                className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100"
              >
                {createError}
              </div>
            ) : null}

            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label htmlFor="bootstrap-admin-name" className="mb-1 block text-xs font-medium text-slate-400">
                  Admin name
                </label>
                <input
                  id="bootstrap-admin-name"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Your name"
                  disabled={createSubmitting}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="bootstrap-admin-email" className="mb-1 block text-xs font-medium text-slate-400">
                  Email
                </label>
                <input
                  id="bootstrap-admin-email"
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={createSubmitting}
                  autoComplete="off"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="bootstrap-admin-password" className="mb-1 block text-xs font-medium text-slate-400">
                  Password
                </label>
                <input
                  id="bootstrap-admin-password"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={createSubmitting}
                  autoComplete="new-password"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="bootstrap-admin-confirm" className="mb-1 block text-xs font-medium text-slate-400">
                  Confirm password
                </label>
                <input
                  id="bootstrap-admin-confirm"
                  type="password"
                  value={createConfirm}
                  onChange={(e) => setCreateConfirm(e.target.value)}
                  placeholder="Repeat password"
                  disabled={createSubmitting}
                  autoComplete="new-password"
                  className={fieldClass}
                />
              </div>
              <button
                type="submit"
                disabled={createSubmitting}
                className="w-full rounded-lg bg-amber-600/90 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-600/20 disabled:opacity-50"
              >
                {createSubmitting ? "Creating…" : "Create admin account"}
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        Staff member?{" "}
        <Link
          to="/staff/login"
          className="font-medium text-cyan-400/90 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
        >
          Sign in to staff portal
        </Link>
      </p>
    </PremiumLoginLayout>
  );
}
