import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginCredentialFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  emailId: string;
  passwordId: string;
  submitLabel?: string;
}

export function LoginCredentialForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  isLoading,
  onSubmit,
  emailId,
  passwordId,
  submitLabel = "Sign in",
}: LoginCredentialFormProps) {
  const inputShell =
    "relative flex items-center rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm transition-all duration-200 " +
    "focus-within:border-cyan-400/35 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100/95"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={emailId} className="block text-xs font-medium uppercase tracking-wider text-slate-400">
          Email
        </label>
        <div className={inputShell}>
          <span className="pl-3.5 text-slate-500" aria-hidden>
            <Mail className="h-[18px] w-[18px]" />
          </span>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            disabled={isLoading}
            autoComplete="email"
            className="h-12 w-full flex-1 bg-transparent pl-3 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={passwordId}
          className="block text-xs font-medium uppercase tracking-wider text-slate-400"
        >
          Password
        </label>
        <div className={inputShell}>
          <span className="pl-3.5 text-slate-500" aria-hidden>
            <Lock className="h-[18px] w-[18px]" />
          </span>
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            autoComplete="current-password"
            className="h-12 w-full flex-1 bg-transparent pl-3 pr-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold text-[#061018] shadow-lg transition-all duration-200 disabled:opacity-60"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]" />
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-300/0 via-white/25 to-blue-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative flex items-center gap-2 text-sm font-semibold tracking-wide">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            submitLabel
          )}
        </span>
      </button>
    </form>
  );
}
