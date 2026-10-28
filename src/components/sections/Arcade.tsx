"use client";

import { Lock, Play, RotateCcw, Trophy, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { THEMES } from "@/data/themes";
import { confetti } from "@/lib/confetti";
import { dayKey, msUntilMidnight, questFor } from "@/lib/daily";
import {
  levelFor,
  levelTitle,
  recordGame,
  setTheme,
  sfx,
  useHydrated,
  useLoop,
  type GameId,
  type GameResult,
} from "@/lib/store";
import { GAMES, gameById, type GameProps } from "../games/registry";
import { Reveal, SectionHeading, trackSpotlight } from "../ui/Reveal";

const loading = () => <div className="grid h-80 place-items-center font-mono text-sm text-muted">loading game…</div>;
const COMPONENTS: Record<GameId, React.ComponentType<GameProps>> = {
  bugs: dynamic(() => import("../games/BugSmash"), { ssr: false, loading }),
  sprint: dynamic(() => import("../games/SyntaxSprint"), { ssr: false, loading }),
  stack: dynamic(() => import("../games/DeployStack"), { ssr: false, loading }),
  memory: dynamic(() => import("../games/MemoryMerge"), { ssr: false, loading }),
  dodge: dynamic(() => import("../games/LoopDodge"), { ssr: false, loading }),
};

export function Arcade() {
  const [active, setActive] = useState<GameId | null>(null);

  useEffect(() => {
    const onPlay = (e: Event) => {
      document.getElementById("arcade")?.scrollIntoView({ behavior: "smooth" });
      setActive((e as CustomEvent<GameId>).detail);
    };
    window.addEventListener("loop:play", onPlay);
    return () => window.removeEventListener("loop:play", onPlay);
  }, []);

  return (
    <section id="arcade" className="relative py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-bg-2/60 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="05"
          kicker="The Loop Arcade"
          title={
            <>
              Take a break. <span className="text-gradient">Break a record.</span>
            </>
          }
          sub="Five small games I built for this site. Your scores, XP and achievements are saved in your browser, so you can pick up where you left off. A new daily quest arrives at midnight, and levelling up unlocks new site themes."
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <PlayerCard />
          </Reveal>
          <Reveal delay={0.08}>
            <DailyQuest onPlay={setActive} />
          </Reveal>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GAMES.map((g, i) => (
            <Reveal key={g.id} delay={i * 0.06}>
              <GameCard id={g.id} onPlay={() => setActive(g.id)} />
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <TrophyRoom />
          </Reveal>
          <Reveal delay={0.08}>
            <ThemeShelf />
          </Reveal>
        </div>
      </div>

      <AnimatePresence>{active && <GameModal key={active} id={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </section>
  );
}

function PlayerCard() {
  const hydrated = useHydrated();
  const s = useLoop((x) => x);
  const lvl = levelFor(s.xp);
  const unlocked = Object.keys(s.achievements).length;
  const plays = Object.values(s.plays).reduce((a, b) => a + (b ?? 0), 0);
  const pct = s.xp % 100;

  return (
    <div className="card h-full overflow-hidden p-6">
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="16" fill="none" stroke="var(--line)" strokeWidth="2.5" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="url(#xp-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${hydrated ? pct : 0} 100`}
              pathLength={100}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="xp-grad">
                <stop offset="0" stopColor="var(--accent)" />
                <stop offset="1" stopColor="var(--accent-3)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-mono text-[9px] uppercase text-muted">lvl</div>
              <div className="font-display text-2xl font-bold leading-none">{hydrated ? lvl : "–"}</div>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Your player card</p>
          <p className="font-display text-2xl font-bold">{hydrated ? levelTitle(lvl) : "…"}</p>
          <p className="text-sm text-muted">
            {hydrated ? `${s.xp} XP · ${100 - pct} XP to level ${lvl + 1}` : "loading your save…"}
          </p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-4 gap-2 text-center">
        {[
          ["visits", s.visits],
          ["streak", `${s.streak}🔥`],
          ["games", plays],
          ["trophies", `${unlocked}/${ACHIEVEMENTS.length}`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-surface-2 px-1 py-2.5">
            <dd className="font-display text-lg font-bold">{hydrated ? v : "–"}</dd>
            <dt className="font-mono text-[9px] uppercase tracking-wider text-muted">{l}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

function useCountdown() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(msUntilMidnight());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  if (ms === null) return "--:--:--";
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");
}

function DailyQuest({ onPlay }: { onPlay: (id: GameId) => void }) {
  const hydrated = useHydrated();
  const dailyDone = useLoop((s) => s.dailyDone);
  const countdown = useCountdown();
  const today = hydrated ? dayKey() : null;
  const quest = today ? questFor(today) : null;
  const done = !!today && dailyDone === today;
  const g = quest ? gameById[quest.game] : null;

  return (
    <div
      onPointerMove={trackSpotlight}
      className="spotlight relative h-full overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-transparent to-accent-3/10 p-6"
    >
      <div className="absolute -right-6 -top-6 text-[9rem] leading-none opacity-10">{g?.emoji ?? "📅"}</div>
      <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em]">
        <span className="text-accent">Daily quest · {today ?? "…"}</span>
        <span className="text-muted">resets in {countdown}</span>
      </div>
      <p className="mt-5 max-w-md font-display text-3xl font-bold leading-tight sm:text-4xl">{quest ? quest.label : "Loading today's quest…"}</p>
      <p className="mt-2 text-sm text-muted">Reward: +50 XP and the 📅 Daily Driver trophy. Same quest for everyone today.</p>
      <div className="mt-6 flex items-center gap-3">
        {done ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-5 py-3 text-sm font-semibold text-success">
            ✓ Completed. See you tomorrow!
          </span>
        ) : (
          <button
            disabled={!quest}
            onClick={() => quest && onPlay(quest.game)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition hover:scale-[1.03]"
          >
            <Play className="h-4 w-4 fill-current" /> Play {g?.name ?? ""}
          </button>
        )}
      </div>
    </div>
  );
}

function GameCard({ id, onPlay }: { id: GameId; onPlay: () => void }) {
  const g = gameById[id];
  const hydrated = useHydrated();
  const best = useLoop((s) => s.scores[id]);
  const plays = useLoop((s) => s.plays[id] ?? 0);
  return (
    <button
      onClick={() => {
        sfx("click");
        onPlay();
      }}
      onPointerMove={trackSpotlight}
      className="card spotlight group flex h-full w-full flex-col overflow-hidden text-left transition hover:-translate-y-1.5 hover:border-accent/50"
    >
      <div
        className="relative grid aspect-[4/3] place-items-center overflow-hidden"
        style={{ background: `radial-gradient(circle at 30% 20%, ${g.colors[0]}55, transparent 60%), radial-gradient(circle at 80% 90%, ${g.colors[1]}55, transparent 60%)` }}
      >
        <div className="grid-bg absolute inset-0 opacity-50" />
        <span className="relative text-6xl transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-125">{g.emoji}</span>
        <span className="absolute bottom-3 right-3 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-fg text-bg opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="h-4 w-4 fill-current" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-bold">{g.name}</h3>
        <p className="text-xs text-muted">{g.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-4 font-mono text-[11px]">
          <span className="flex items-center gap-1 text-accent">
            <Trophy className="h-3 w-3" />
            {hydrated && best !== undefined ? `${best} ${g.unit}` : "no score yet"}
          </span>
          <span className="text-muted">{hydrated ? `${plays}×` : ""}</span>
        </div>
      </div>
    </button>
  );
}

function TrophyRoom() {
  const hydrated = useHydrated();
  const got = useLoop((s) => s.achievements);
  const count = hydrated ? Object.keys(got).length : 0;
  return (
    <div className="card h-full p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Trophy room</p>
        <p className="font-mono text-xs text-accent">
          {count}/{ACHIEVEMENTS.length}
        </p>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-gradient-to-r from-accent via-accent-3 to-accent-2 transition-all duration-1000" style={{ width: `${(count / ACHIEVEMENTS.length) * 100}%` }} />
      </div>
      <ul className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5 xl:grid-cols-10">
        {ACHIEVEMENTS.map((a) => {
          const has = hydrated && !!got[a.id];
          const hidden = a.secret && !has;
          return (
            <li key={a.id} className="group relative">
              <div
                tabIndex={0}
                className={`grid aspect-square place-items-center rounded-xl border text-2xl transition ${
                  has ? "border-accent/40 bg-accent/10" : "border-line bg-surface grayscale"
                }`}
              >
                <span className={has ? "" : "opacity-30"}>{hidden ? "❔" : a.icon}</span>
              </div>
              <div className="glass pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded-xl p-3 text-center opacity-0 shadow-xl transition group-focus-within:opacity-100 group-hover:opacity-100">
                <p className="text-sm font-semibold">{hidden ? "Secret trophy" : a.title}</p>
                <p className="mt-0.5 text-xs text-muted">{hidden ? "Keep exploring. Some things are hidden." : a.desc}</p>
                <p className="mt-1 font-mono text-[10px] text-accent">{has ? "✓ unlocked" : `+${a.xp} XP`}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ThemeShelf() {
  const hydrated = useHydrated();
  const xp = useLoop((s) => s.xp);
  const current = useLoop((s) => s.theme);
  return (
    <div className="card h-full p-6">
      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Unlockable themes</p>
      <ul className="flex flex-col gap-2">
        {THEMES.map((t) => {
          const locked = !hydrated || xp < t.unlockXp;
          return (
            <li key={t.id}>
              <button
                disabled={locked}
                onClick={() => {
                  setTheme(t.id);
                  sfx("click");
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                  hydrated && current === t.id ? "border-accent bg-accent/10" : "border-line hover:border-accent/50"
                } ${locked ? "cursor-not-allowed" : ""}`}
              >
                <span className="flex h-8 w-14 shrink-0 overflow-hidden rounded-lg border border-line">
                  {t.swatch.map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
                <span className="flex-1 text-sm font-semibold">{t.name}</span>
                {locked && t.unlockXp > 0 ? (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-muted">
                    <Lock className="h-3 w-3" /> {t.unlockXp} XP
                  </span>
                ) : (
                  hydrated && current === t.id && <span className="font-mono text-[11px] text-accent">active</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GameModal({ id, onClose }: { id: GameId; onClose: () => void }) {
  const g = gameById[id];
  const Game = COMPONENTS[id];
  const best = useLoop((s) => s.scores[id]);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [meta, setMeta] = useState<Record<string, number>>({});

  const onGameOver = useCallback(
    (score: number, m: Record<string, number> = {}) => {
      const r = recordGame(id, score, m);
      setMeta(m);
      setResult(r);
      if (r.isRecord || r.questCompleted) {
        sfx("win");
        confetti();
      }
    },
    [id],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const again = () => {
    setResult(null);
    setRound((r) => r + 1);
  };

  return (
    <motion.div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-label={g.name}
        initial={{ y: 40, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 40, scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex max-h-[100svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-line bg-bg shadow-2xl sm:max-h-[94vh] sm:rounded-3xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <span className="text-2xl">{g.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold leading-tight">{g.name}</p>
            <p className="truncate font-mono text-[11px] text-muted">
              {g.scoreLabel}: {best !== undefined ? `${best} ${g.unit}` : "–"}
            </p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-surface-2 hover:bg-accent hover:text-on-accent" aria-label="Close game">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
          <Game key={round} onGameOver={onGameOver} />
          <p className="mx-auto mt-5 max-w-lg text-center text-xs leading-relaxed text-muted">{g.howTo}</p>

          <AnimatePresence>
            {result && (
              <motion.div
                className="absolute inset-0 z-20 grid place-items-center bg-bg/85 p-6 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="text-center">
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                    {result.isRecord ? "🏆 new personal best" : result.firstPlay ? "first score on the board" : "game over"}
                  </p>
                  <p className="mt-3 font-display text-7xl font-extrabold">
                    <span className={result.isRecord ? "text-gradient" : ""}>{result.score}</span>
                    <span className="ml-2 text-2xl text-muted">{g.unit}</span>
                  </p>
                  {id === "sprint" && meta.wpm !== undefined && (
                    <p className="mt-1 font-mono text-xs text-muted">
                      raw {meta.wpm} wpm · {meta.accuracy}% accuracy
                    </p>
                  )}
                  {id === "dodge" && meta.time !== undefined && <p className="mt-1 font-mono text-xs text-muted">survived {meta.time}s</p>}
                  {id === "memory" && meta.seconds !== undefined && <p className="mt-1 font-mono text-xs text-muted">in {meta.seconds}s</p>}
                  <div className="mt-5 flex flex-wrap justify-center gap-2 font-mono text-xs">
                    <span className="rounded-full bg-accent/15 px-3 py-1.5 text-accent">+{result.xp} XP</span>
                    <span className="rounded-full bg-surface-2 px-3 py-1.5">
                      best: {result.best} {g.unit}
                    </span>
                    {result.questCompleted && <span className="rounded-full bg-success/15 px-3 py-1.5 text-success">📅 daily quest +50 XP</span>}
                  </div>
                  <div className="mt-8 flex justify-center gap-3">
                    <button
                      autoFocus
                      onClick={again}
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-on-accent transition hover:scale-[1.04]"
                    >
                      <RotateCcw className="h-4 w-4" /> Play again
                    </button>
                    <button onClick={onClose} className="rounded-full border border-line px-6 py-3 font-semibold transition hover:border-accent">
                      Back to site
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
