"use client";

import {
  BriefcaseBusiness,
  Bug,
  Brain,
  CodeXml,
  CornerDownLeft,
  Dices,
  Gamepad2,
  Keyboard,
  Layers,
  Lock,
  Mail,
  Orbit,
  RotateCcw,
  Search,
  SearchX,
  Send,
  UserRound,
  Volume2,
  VolumeX,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { profile, projects } from "@/data/portfolio";
import { THEMES, type Theme } from "@/data/themes";
import { scrollToId } from "@/lib/scroll";
import { GAMES } from "./games/registry";
import { NAV_LINKS } from "./Nav";
import { GitHubIcon, ICONS, InstagramIcon, LinkedInIcon } from "./ui/icons";
import { getLoop, openProject, playGame, pushToast, resetProgress, setTheme, toggleSound, unlock, type GameId } from "@/lib/store";

type Item = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  colors?: [string, string];
  swatch?: Theme["swatch"];
  locked?: boolean;
  run: () => void;
};

const NAV_ICONS: Record<string, LucideIcon> = {
  about: UserRound,
  skills: CodeXml,
  work: BriefcaseBusiness,
  services: Wrench,
  arcade: Gamepad2,
  contact: Send,
};

const GAME_ICONS: Record<GameId, LucideIcon> = { dodge: Orbit, bugs: Bug, stack: Layers, sprint: Keyboard, memory: Brain };

function buildItems(close: () => void): Item[] {
  const { xp, theme, sound } = getLoop();
  const go = (id: string) => () => {
    close();
    scrollToId(id);
  };
  const ext = (url: string) => () => {
    close();
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return [
    ...NAV_LINKS.map((l, i) => ({ id: `nav-${l.id}`, group: "Navigate", label: `Go to ${l.label}`, hint: `0${i + 1}`, icon: NAV_ICONS[l.id], run: go(l.id) })),
    ...GAMES.map((g) => ({
      id: `play-${g.id}`,
      group: "Arcade",
      label: `Play ${g.name}`,
      hint: g.tagline,
      icon: GAME_ICONS[g.id],
      colors: g.colors,
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
      icon: Dices,
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
      icon: ICONS[p.icon],
      colors: p.colors,
      run: () => {
        close();
        scrollToId("work");
        window.setTimeout(() => openProject(p.id), 450);
      },
    })),
    ...THEMES.map((t) => {
      const locked = xp < t.unlockXp;
      return {
        id: `theme-${t.id}`,
        group: "Themes",
        label: `Theme: ${t.name}`,
        hint: locked ? `${t.unlockXp} XP` : t.id === theme ? "Current" : t.vibe,
        swatch: t.swatch,
        locked,
        run: () => {
          if (!setTheme(t.id)) pushToast({ icon: "🔒", title: `${t.name} is locked`, desc: `Reach ${t.unlockXp} XP in the arcade to unlock it.` });
          close();
        },
      };
    }),
    {
      id: "copy-email",
      group: "Contact",
      label: "Copy email address",
      hint: profile.email,
      icon: Mail,
      run: () => {
        void navigator.clipboard?.writeText(profile.email);
        pushToast({ icon: "📋", title: "Email copied", desc: profile.email });
        unlock("say-hi");
        close();
      },
    },
    { id: "gh", group: "Contact", label: "Open GitHub", hint: "jaya0011", icon: GitHubIcon, run: ext(profile.github) },
    { id: "li", group: "Contact", label: "Open LinkedIn", icon: LinkedInIcon, run: ext(profile.linkedin) },
    { id: "ig", group: "Contact", label: "Open Instagram", hint: profile.instagramHandle, icon: InstagramIcon, run: ext(profile.instagram) },
    {
      id: "sound",
      group: "Settings",
      label: "Toggle sound effects",
      hint: sound ? "On" : "Off",
      icon: sound ? Volume2 : VolumeX,
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
      icon: RotateCcw,
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

function Tile({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  const shape = "h-8 w-8 shrink-0 overflow-hidden rounded-md transition-colors";

  if (item.swatch) {
    return (
      <span className={`grid grid-cols-2 border border-line ${shape} ${item.locked ? "opacity-50" : ""}`}>
        {item.swatch.map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </span>
    );
  }

  const tone = item.colors ? "text-white" : active ? "border border-transparent bg-fg text-bg" : "border border-line bg-surface text-muted";
  return (
    <span
      className={`grid place-items-center ${shape} ${tone}`}
      style={item.colors && { background: item.colors[0], color: "#15191a" }}
    >
      {Icon && <Icon className="h-4 w-4" />}
    </span>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent font-semibold text-accent">{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  );
}

const KBD = "grid h-5 min-w-5 place-items-center rounded border border-line bg-surface px-1 font-mono text-[10px] leading-none text-muted";

function Palette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => buildItems(onClose), [onClose]);
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(q));
  }, [items, q]);

  const selected = Math.min(index, Math.max(0, filtered.length - 1));
  const activeId = filtered[selected] && `palette-${filtered[selected].id}`;

  useEffect(() => {
    // the first row sits under its group label, so "nearest" would leave the label hidden
    if (selected === 0) listRef.current?.scrollTo({ top: 0 });
    else listRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected, q]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      setIndex((selected + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp" || e.key === "Tab") {
      e.preventDefault();
      setIndex((selected - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      filtered[selected]?.run();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="fixed inset-0 z-[320] flex items-start justify-center bg-black/40 px-4 pt-[10vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 480, damping: 36 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[40rem] overflow-hidden rounded-2xl border border-line bg-bg text-fg shadow-[0_30px_80px_-24px_rgb(0_0_0/0.45)]"
        >
          <div className="relative flex items-center gap-3 px-4">
            <Search className={`h-[18px] w-[18px] shrink-0 transition-colors ${q ? "text-accent" : "text-muted"}`} />
            <input
              autoFocus
              role="combobox"
              aria-expanded="true"
              aria-controls="palette-list"
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              aria-label="Search commands"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Jump, play or switch theme…"
              className="h-14 min-w-0 flex-1 bg-transparent text-base caret-fg outline-none placeholder:text-muted"
            />
            <button onClick={onClose} aria-label="Close command palette" className={`${KBD} transition-colors hover:border-accent hover:text-fg`}>
              ESC
            </button>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line" />
          </div>

          <motion.div
            ref={listRef}
            layoutScroll
            id="palette-list"
            data-lenis-prevent
            role="listbox"
            aria-label="Commands"
            className="max-h-[min(52dvh,28rem)] scroll-pb-8 overflow-y-auto overscroll-contain px-2 pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-2rem),transparent)] [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin]"
          >
            {filtered.length === 0 && (
              <div className="grid place-items-center gap-3 px-6 pb-6 pt-12 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted">
                  <SearchX className="h-5 w-5" />
                </span>
                <p className="text-sm">No matches for “{query.trim()}”</p>
                <p className="text-xs text-muted">Try “play” or “theme”.</p>
              </div>
            )}
            {filtered.map((item, i) => {
              const header = item.group !== filtered[i - 1]?.group ? item.group : null;
              const active = i === selected;
              return (
                <div key={item.id} role="presentation">
                  {header && (
                    <p aria-hidden className="px-2 pb-1 pt-3 text-xs font-medium text-muted">
                      {header}
                    </p>
                  )}
                  <button
                    id={`palette-${item.id}`}
                    role="option"
                    aria-selected={active}
                    tabIndex={-1}
                    data-index={i}
                    onMouseMove={() => setIndex(i)}
                    onClick={item.run}
                    className={`relative isolate flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left text-sm transition-colors ${
                      active ? "text-fg" : "text-fg/85"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="palette-pill"
                        className="absolute inset-0 -z-10 rounded-xl bg-accent/10 ring-1 ring-inset ring-accent/20"
                        transition={{ type: "spring", stiffness: 560, damping: 40 }}
                      />
                    )}
                    <Tile item={item} active={active} />
                    <span className="min-w-0 flex-1 truncate">
                      <Highlight text={item.label} query={q} />
                    </span>
                    {item.hint && (
                      <span className="hidden min-w-0 max-w-[50%] items-center gap-1.5 text-xs text-muted sm:flex">
                        {item.locked && <Lock className="h-3 w-3 shrink-0" />}
                        <span className="truncate">{item.hint}</span>
                      </span>
                    )}
                    <CornerDownLeft className={`h-3.5 w-3.5 shrink-0 text-accent transition-opacity ${active ? "opacity-100" : "opacity-0"}`} />
                  </button>
                </div>
              );
            })}
          </motion.div>

          <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-muted">
            <span className="hidden items-center gap-1.5 sm:flex">
              <kbd className={KBD}>↑</kbd>
              <kbd className={KBD}>↓</kbd>
              Navigate
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <kbd className={KBD}>
                <CornerDownLeft className="h-3 w-3" />
              </kbd>
              Select
            </span>
            <span className="ml-auto font-mono text-[10px] tabular-nums">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
}
