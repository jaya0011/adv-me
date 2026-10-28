"use client";

import { CornerDownLeft, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { profile, projects } from "@/data/portfolio";
import { THEMES } from "@/data/themes";
import { GAMES } from "./games/registry";
import { NAV_LINKS } from "./Nav";
import { getLoop, openProject, playGame, pushToast, resetProgress, setTheme, toggleSound, unlock } from "@/lib/store";

type Item = { id: string; group: string; label: string; hint?: string; icon: string; run: () => void };

function buildItems(close: () => void): Item[] {
  const go = (id: string) => () => {
    close();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const ext = (url: string) => () => {
    close();
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return [
    ...NAV_LINKS.map((l) => ({ id: `nav-${l.id}`, group: "Navigate", label: `Go to ${l.label}`, icon: "→", run: go(l.id) })),
    ...GAMES.map((g) => ({
      id: `play-${g.id}`,
      group: "Arcade",
      label: `Play ${g.name}`,
      hint: g.tagline,
      icon: g.emoji,
      run: () => {
        close();
        playGame(g.id);
      },
    })),
    {
      id: "play-random",
      group: "Arcade",
      label: "Surprise me",
      hint: "Random game",
      icon: "🎲",
      run: () => {
        close();
        playGame(GAMES[Math.floor(Math.random() * GAMES.length)].id);
      },
    },
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      group: "Projects",
      label: p.name,
      hint: p.type,
      icon: "📁",
      run: () => {
        close();
        document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
        window.setTimeout(() => openProject(p.id), 450);
      },
    })),
    ...THEMES.map((t) => ({
      id: `theme-${t.id}`,
      group: "Themes",
      label: `Theme: ${t.name}`,
      hint: getLoop().xp < t.unlockXp ? `🔒 ${t.unlockXp} XP` : t.vibe,
      icon: "🎨",
      run: () => {
        if (!setTheme(t.id)) pushToast({ icon: "🔒", title: `${t.name} is locked`, desc: `Reach ${t.unlockXp} XP in the arcade to unlock it.` });
        close();
      },
    })),
    {
      id: "copy-email",
      group: "Contact",
      label: "Copy email address",
      hint: profile.email,
      icon: "✉️",
      run: () => {
        void navigator.clipboard?.writeText(profile.email);
        pushToast({ icon: "📋", title: "Email copied", desc: profile.email });
        unlock("say-hi");
        close();
      },
    },
    { id: "gh", group: "Contact", label: "Open GitHub", hint: "jaya0011", icon: "🐙", run: ext(profile.github) },
    { id: "li", group: "Contact", label: "Open LinkedIn", icon: "💼", run: ext(profile.linkedin) },
    { id: "ig", group: "Contact", label: "Open Instagram", hint: profile.instagramHandle, icon: "📸", run: ext(profile.instagram) },
    {
      id: "sound",
      group: "Settings",
      label: "Toggle sound effects",
      icon: "🔊",
      run: () => {
        toggleSound();
        close();
      },
    },
    {
      id: "reset",
      group: "Settings",
      label: "Reset my loop progress",
      hint: "XP, scores, achievements",
      icon: "♻️",
      run: () => {
        if (window.confirm("Reset all XP, high scores and achievements?")) {
          resetProgress();
          pushToast({ icon: "♻️", title: "Progress reset", desc: "A fresh loop begins." });
        }
        close();
      },
    },
  ];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      unlock("power-user");
    };
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => {
          if (!o) unlock("power-user");
          return !o;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("loop:palette", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("loop:palette", show);
    };
  }, []);

  return <AnimatePresence>{open && <Palette onClose={() => setOpen(false)} />}</AnimatePresence>;
}

function Palette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => buildItems(onClose), [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(q));
  }, [items, query]);

  const selected = Math.min(index, Math.max(0, filtered.length - 1));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((selected + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((selected - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      filtered[selected]?.run();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-bg/60 px-4 pt-[12vh] backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-label="Command palette"
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Jump anywhere, play a game, switch theme…"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted">No matches. Try “play” or “theme”.</p>}
          {filtered.map((item, i) => {
            const header = item.group !== filtered[i - 1]?.group ? item.group : null;
            return (
              <div key={item.id}>
                {header && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{header}</p>}
                <button
                  data-index={i}
                  onMouseMove={() => setIndex(i)}
                  onClick={item.run}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    i === selected ? "bg-accent/15 text-fg" : "text-fg/90"
                  }`}
                >
                  <span className="grid w-6 place-items-center">{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && <span className="hidden truncate text-xs text-muted sm:block">{item.hint}</span>}
                  {i === selected && <CornerDownLeft className="h-3.5 w-3.5 text-accent" />}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
