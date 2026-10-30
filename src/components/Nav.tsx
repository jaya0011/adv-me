"use client";

import { Command, Lock, Menu, Palette, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { THEMES } from "@/data/themes";
import { scrollToTop } from "@/lib/scroll";
import { openPalette, setTheme, sfx, toggleSound, unlock, useLoop } from "@/lib/store";
import { LoopMark } from "./ui/icons";

export const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "arcade", label: "Arcade" },
  { id: "contact", label: "Contact" },
];

const ICON_BTN = "grid h-9 w-9 place-items-center rounded-full text-fg/60 transition hover:bg-surface-2 hover:text-fg";

export function Nav() {
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const clicks = useRef({ n: 0, t: 0 });

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-6% 0px -92% 0px" },
    );
    ["top", ...NAV_LINKS.map((l) => l.id), "process"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const onLogo = () => {
    const now = Date.now();
    clicks.current.n = now - clicks.current.t < 600 ? clicks.current.n + 1 : 1;
    clicks.current.t = now;
    if (clicks.current.n >= 5) {
      clicks.current.n = 0;
      unlock("curious");
    }
    scrollToTop();
  };

  return (
    <>
      {/* Floats over the world; only Services needs it to switch to ink. */}
      <header className={`fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-bg via-bg/75 to-transparent pb-3 text-fg transition-colors duration-300 ${active === "services" ? "tone-light" : ""}`}>
        <nav className="flex w-full items-center gap-2 px-3 py-3 sm:px-6">
          <button onClick={onLogo} className="group flex items-center gap-2 rounded-lg px-2 py-1.5" aria-label="Back to top">
            <LoopMark className="h-3.5 w-7 text-accent transition-transform duration-700 group-hover:rotate-180" />
            <span className="font-mono text-xs uppercase tracking-[0.24em]">Jaya</span>
          </button>

          <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className={`block px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${active === l.id ? "text-fg" : "text-fg/50 hover:text-fg"}`}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button
              onClick={() => {
                toggleSound();
                sfx("click");
              }}
              className={ICON_BTN}
              aria-label="Toggle sound"
            >
              <SoundIcon />
            </button>
            <div className="relative">
              <button onClick={() => setThemesOpen((v) => !v)} className={ICON_BTN} aria-label="Change theme" aria-expanded={themesOpen}>
                <Palette className="h-4 w-4" />
              </button>
              <AnimatePresence>{themesOpen && <ThemeMenu onClose={() => setThemesOpen(false)} />}</AnimatePresence>
            </div>
            <button onClick={openPalette} className="hidden h-9 items-center gap-1 rounded-full px-3 text-xs text-fg/60 shadow-[inset_0_0_0_1px_var(--line)] transition hover:text-fg sm:flex" aria-label="Open command palette">
              <Command className="h-3.5 w-3.5" />K
            </button>
            <button onClick={() => setMenuOpen(true)} className={`${ICON_BTN} lg:hidden`} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-[60] flex flex-col bg-bg p-6 text-fg lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <button onClick={() => setMenuOpen(false)} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-surface-2" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <ul className="mt-6 flex flex-col">
              {NAV_LINKS.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + 0.04 * i }}>
                  <a href={`#${l.id}`} onClick={() => setMenuOpen(false)} className="poster block border-b border-line py-4 text-4xl">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <button
              onClick={() => {
                setMenuOpen(false);
                openPalette();
              }}
              className="btn mt-auto w-full"
            >
              <Command className="h-4 w-4" /> Open command palette
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SoundIcon() {
  const sound = useLoop((s) => s.sound);
  return sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />;
}

function ThemeMenu({ onClose }: { onClose: () => void }) {
  const xp = useLoop((s) => s.xp);
  const current = useLoop((s) => s.theme);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
      className="absolute right-0 top-12 w-72 rounded-2xl border border-line bg-bg-2 p-2 text-fg shadow-[0_24px_50px_-20px_rgb(0_0_0/0.6)]"
    >
      <p className="eyebrow px-2 pb-2 pt-1 !text-[10px]">Change the light · earn XP for more</p>
      {THEMES.map((t) => {
        const locked = xp < t.unlockXp;
        return (
          <button
            key={t.id}
            disabled={locked}
            onClick={() => {
              setTheme(t.id);
              sfx("click");
            }}
            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${current === t.id ? "bg-surface-2" : "hover:bg-surface"} ${locked ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span className="grid h-9 w-9 shrink-0 grid-cols-2 overflow-hidden rounded-md border border-line">
              {t.swatch.map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{t.name}</span>
              <span className="block truncate text-xs text-muted">{locked ? `Unlocks at ${t.unlockXp} XP` : t.vibe}</span>
            </span>
            {locked ? <Lock className="h-3.5 w-3.5 text-muted" /> : current === t.id && <span className="h-2 w-2 rounded-full bg-accent" />}
          </button>
        );
      })}
    </motion.div>
  );
}
