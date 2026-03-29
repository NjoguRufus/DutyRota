import { Check, Radio } from "lucide-react";

const FEATURES = [
  "Staff Scheduling",
  "Shift Assignments",
  "Real-time Notifications",
  "Department Reports",
] as const;

interface PremiumLoginLayoutProps {
  children: React.ReactNode;
}

export function PremiumLoginLayout({ children }: PremiumLoginLayoutProps) {
  return (
    <div className="login-premium relative min-h-screen overflow-x-hidden bg-[#05080f] font-login text-slate-200 antialiased">
      {/* Base gradient */}
      <div
        className="pointer-events-none fixed inset-0 opacity-100 animate-login-fade-in"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(34, 211, 238, 0.08), transparent 50%), linear-gradient(165deg, #0a1628 0%, #0c1220 38%, #060a12 100%)",
        }}
      />

      {/* Soft glow orbs */}
      <div
        className="pointer-events-none fixed -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[100px] animate-login-float-slow"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed right-0 top-0 h-[380px] w-[380px] translate-x-1/4 -translate-y-1/4 rounded-full bg-blue-600/12 blur-[90px]"
        style={{ animationDelay: "2s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-0 left-1/3 h-[300px] w-[500px] rounded-full bg-indigo-600/10 blur-[100px]"
        aria-hidden
      />

      {/* Subtle grid + signal motif */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <svg
        className="pointer-events-none fixed bottom-8 left-8 hidden h-24 w-48 text-cyan-500/10 lg:block"
        viewBox="0 0 200 60"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M0 40 Q 30 20, 60 40 T 120 40 T 180 40"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.6"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative z-10 flex min-h-screen flex-col lg:grid lg:grid-cols-[1fr_minmax(320px,520px)]">
        {/* Branding panel */}
        <aside className="relative flex flex-col justify-between border-b border-white/[0.06] px-6 py-10 sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r lg:py-14 lg:pl-12 lg:pr-8 xl:pl-16">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-blue-600/[0.04]" />

          <div className="relative animate-login-fade-in">
            <div className="mb-6 flex justify-center lg:justify-start">
              <img
                src="/logo.png"
                alt="CAPE Media"
                className="h-16 w-auto max-w-[220px] object-contain drop-shadow-[0_8px_32px_rgba(34,211,238,0.15)] sm:h-20 lg:h-24 lg:max-w-[280px]"
              />
            </div>

            <h1 className="font-login-display text-center text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-left lg:text-[1.75rem] xl:text-4xl">
              CAPE Media Duty Rota System
            </h1>
            <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-slate-400 lg:mx-0 lg:text-left lg:text-base">
              Manage staff schedules, assignments, and coverage in one centralized platform.
            </p>

            <ul className="mx-auto mt-8 max-w-md space-y-3 lg:mx-0">
              {FEATURES.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-10 hidden items-center gap-2 text-xs text-slate-600 lg:flex">
            <Radio className="h-3.5 w-3.5 text-cyan-500/50" aria-hidden />
            <span>Secure access · Newsroom-ready operations</span>
          </div>
        </aside>

        {/* Form column */}
        <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:py-14">
          <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-transparent to-transparent lg:hidden" />

          <div className="relative w-full max-w-[420px] opacity-0 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5)] animate-login-slide-up">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-px shadow-2xl backdrop-blur-xl">
              <div className="rounded-[15px] bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-6 py-8 sm:px-8 sm:py-10">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
