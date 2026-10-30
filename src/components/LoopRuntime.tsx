"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { confetti } from "@/lib/confetti";
import { dismissToast, registerVisit, unlock, useLoop, useToasts } from "@/lib/store";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** Invisible glue: theme sync, visit tracking, secret codes, toasts. */
export function LoopRuntime() {
  const theme = useLoop((s) => s.theme);

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

  return <Toasts />;
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
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-bg p-3.5 text-left text-fg shadow-[0_20px_40px_-20px_rgb(0_0_0/0.4)]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-2 text-xl">{t.icon}</span>
            <span className="min-w-0">
              <span className="block text-xs text-muted">
                {t.kind === "achievement" ? "achievement unlocked" : t.kind === "theme" ? "new theme" : "loop update"}
              </span>
              <span className="block text-sm font-semibold">{t.title}</span>
              {t.desc && <span className="block text-xs text-muted">{t.desc}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
