"use client";

/**
 * First-load-per-session splash. Pure CSS timing so it never blocks content;
 * the boot script in layout hides it for the rest of the session.
 */
export function Intro() {
  return (
    <div
      id="loop-intro"
      onClick={() => document.documentElement.classList.add("intro-seen")}
      className="fixed inset-0 z-[300] grid cursor-pointer place-items-center bg-bg"
      style={{ animation: "intro-exit 0.8s 2.1s cubic-bezier(0.7,0,0.2,1) forwards" }}
    >
      <style>{`
        @keyframes intro-exit { to { transform: translateY(-100%); visibility: hidden; } }
        @keyframes intro-fill { from { width: 0 } to { width: 100% } }
        @keyframes intro-rise { from { transform: translateY(110%) } to { transform: translateY(0) } }
      `}</style>
      <div className="flex flex-col items-center gap-6 px-6">
        <svg viewBox="0 0 64 32" className="w-40 sm:w-52" fill="none" aria-hidden>
          <defs>
            <linearGradient id="intro-g" x1="0" x2="1">
              <stop offset="0" stopColor="var(--accent)" />
              <stop offset="0.5" stopColor="var(--accent-3)" />
              <stop offset="1" stopColor="var(--accent-2)" />
            </linearGradient>
          </defs>
          <path
            d="M32 16c-5-6-9-9-13-9a9 9 0 1 0 0 18c4 0 8-3 13-9s9-9 13-9a9 9 0 1 1 0 18c-4 0-8-3-13-9z"
            stroke="url(#intro-g)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            style={{ animation: "draw-loop 1.6s cubic-bezier(0.65,0,0.35,1) forwards" }}
          />
        </svg>
        <div className="overflow-hidden">
          <div
            className="font-display text-3xl font-bold tracking-tight sm:text-5xl"
            style={{ animation: "intro-rise 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            Jaya Arora
          </div>
        </div>
        <div className="w-56 font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          <div className="mb-2 flex justify-between">
            <span>entering the loop</span>
            <span className="animate-blink">_</span>
          </div>
          <div className="h-px w-full bg-line">
            <div className="h-px bg-accent" style={{ animation: "intro-fill 1.9s cubic-bezier(0.65,0,0.35,1) forwards" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
