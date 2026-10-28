"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { confetti } from "@/lib/confetti";
import { dismissToast, registerVisit, unlock, useLoop, useToasts } from "@/lib/store";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** Invisible glue: theme sync, visit tracking, secret codes, cursor glow, toasts. */
export function LoopRuntime() {
  const theme = useLoop((s) => s.theme);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
  }, [theme]);

  useEffect(() => {
    registerVisit();
  }, []);

  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === KONAMI[pos] ? pos + 1 : k === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        confetti({ count: 220 });
        unlock("cheat-code");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = glowRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
        el.style.opacity = "1";
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[600px] w-[600px] [@media(pointer:fine)]:block rounded-full opacity-0 transition-opacity duration-700"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 9%, transparent), transparent 60%)" }}
      />
      <Toasts />
    </>
  );
}

function Toasts() {
  const toasts = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[150] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={() => dismissToast(t.id)}
            className="glass pointer-events-auto flex items-start gap-3 rounded-2xl p-3.5 text-left shadow-2xl"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-xl">{t.icon}</span>
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                {t.kind === "achievement" ? "Achievement unlocked" : t.kind === "theme" ? "New theme" : "Loop update"}
              </span>
              <span className="block font-display text-sm font-semibold">{t.title}</span>
              {t.desc && <span className="block text-xs text-muted">{t.desc}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
