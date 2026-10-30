"use client";

import { Play } from "lucide-react";

/** Shared "press to start" screen used inside each game. */
export function StartOverlay({ emoji, title, hint, onStart }: { emoji: string; title: string; hint: string; onStart: () => void }) {
  return (
    <button
      onClick={onStart}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-bg/70 p-6 text-center backdrop-blur-sm"
    >
      <span className="animate-float text-6xl">{emoji}</span>
      <span className="poster text-2xl">{title}</span>
      <span className="max-w-xs text-sm text-muted">{hint}</span>
      <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-on-accent animate-pulse-ring">
        <Play className="h-4 w-4 fill-current" /> Start
      </span>
    </button>
  );
}

export function readThemeColors() {
  // read from the arcade, not the root: the section re-points the tokens to its dark tone
  const css = getComputedStyle(document.getElementById("arcade") ?? document.documentElement);
  const v = (n: string) => css.getPropertyValue(n).trim();
  return {
    bg: v("--bg"),
    bg2: v("--bg-2"),
    fg: v("--fg"),
    muted: v("--muted"),
    line: v("--line"),
    accent: v("--accent"),
    accent2: v("--accent-2"),
    accent3: v("--accent-3"),
    danger: v("--danger"),
    success: v("--success"),
    hue: Number(v("--hue")) || 260,
  };
}
