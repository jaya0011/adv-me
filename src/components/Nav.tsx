"use client";

import { Command, Lock, Menu, Palette, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { THEMES } from "@/data/themes";
import { levelFor, openPalette, setTheme, sfx, toggleSound, unlock, useHydrated, useLoop } from "@/lib/store";
import { LoopMark } from "./ui/icons";

export const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "arcade", label: "Arcade" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const clicks = useRef({ n: 0, t: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV_LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const onLogo = () => {
    const now = Date.now();
    clicks.current.n = now - clicks.current.t < 600 ? clicks.current.n + 1 : 1;
    clicks.current.t = now;
    if (clicks.current.n >= 5) {
      clicks.current.n = 0;
      unlock("curious");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4">
        <nav
          className={`flex w-full max-w-site items-center gap-2 rounded-2xl px-2.5 py-2 transition-all duration-500 ${
            scrolled ? "glass shadow-[0_10px_40px_-10px_rgb(0_0_0/0.5)]" : "border border-transparent"
          }`}
        >
          <button onClick={onLogo} className="group flex items-center gap-2 rounded-xl px-2 py-1.5" aria-label="Back to top">
            <LoopMark className="h-5 w-10 text-accent transition-transform duration-700 group-hover:rotate-180" />
            <span className="font-display text-base font-bold tracking-tight">jaya</span>
          </button>

          <ul className="mx-auto hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className={`relative rounded-lg px-3 py-2 text-sm transition-colors ${active === l.id ? "text-fg" : "text-muted hover:text-fg"}`}
                >
                  {active === l.id && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-lg bg-surface-2" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                  )}
                  {l.label}
                  {l.id === "arcade" && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent-3 align-middle animate-pulse-ring" />}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <XpChip />
            <button
              onClick={() => {
                toggleSound();
                sfx("click");
              }}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-fg"
              aria-label="Toggle sound"
            >
              <SoundIcon />
            </button>
            <div className="relative">
              <button
                onClick={() => setThemesOpen((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-fg"
                aria-label="Change theme"
                aria-expanded={themesOpen}
              >
                <Palette className="h-4 w-4" />
              </button>
              <AnimatePresence>{themesOpen && <ThemeMenu onClose={() => setThemesOpen(false)} />}</AnimatePresence>
            </div>
            <button
              onClick={openPalette}
              className="hidden h-9 items-center gap-1.5 rounded-xl border border-line px-2.5 font-mono text-xs text-muted transition hover:border-accent hover:text-fg sm:flex"
              aria-label="Open command palette"
            >
              <Command className="h-3.5 w-3.5" />K
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-fg lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-bg/95 p-6 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button onClick={() => setMenuOpen(false)} className="ml-auto grid h-10 w-10 place-items-center rounded-xl bg-surface-2" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <ul className="mt-8 flex flex-col gap-2">
              {NAV_LINKS.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <a
                    href={`#${l.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-baseline gap-4 py-2 font-display text-4xl font-bold tracking-tight"
                  >
                    <span className="font-mono text-xs text-accent">0{i + 1}</span>
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
              className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-line py-4 font-mono text-sm text-muted"
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

function XpChip() {
  const hydrated = useHydrated();
  const xp = useLoop((s) => s.xp);
  const lvl = levelFor(xp);
  return (
    <a
      href="#arcade"
      className="group flex h-9 items-center gap-2 rounded-xl border border-line px-2.5 transition hover:border-accent"
      title={`${xp} XP total`}
    >
      <span className="font-mono text-[11px] font-semibold text-accent">LV {hydrated ? lvl : "–"}</span>
      <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-surface-2 sm:block">
        <span className="block h-full rounded-full bg-gradient-to-r from-accent to-accent-3 transition-all duration-700" style={{ width: `${hydrated ? xp % 100 : 0}%` }} />
      </span>
    </a>
  );
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
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="glass absolute right-0 top-12 w-72 rounded-2xl p-2 shadow-2xl"
    >
      <p className="px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Themes · earn XP to unlock</p>
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
            className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
              current === t.id ? "bg-surface-2" : "hover:bg-surface"
            } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span className="grid h-9 w-9 shrink-0 grid-cols-2 overflow-hidden rounded-lg border border-line">
              {t.swatch.map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{t.name}</span>
              <span className="block truncate text-xs text-muted">{locked ? `Unlocks at ${t.unlockXp} XP` : t.vibe}</span>
            </span>
            {locked ? <Lock className="h-3.5 w-3.5 text-muted" /> : current === t.id && <span className="h-2 w-2 rounded-full bg-accent" />}
          </button>
        );
      })}
    </motion.div>
  );
}
