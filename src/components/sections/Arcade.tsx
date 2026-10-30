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
import { scrollToId } from "@/lib/scroll";
import { Eyebrow, Reveal } from "../ui/Reveal";
import { GameArt } from "./GameArt";

const loading = () => <div className="grid h-80 place-items-center font-pixel text-sm uppercase text-muted">loading game…</div>;
const COMPONENTS: Record<GameId, React.ComponentType<GameProps>> = {
  bugs: dynamic(() => import("../games/BugSmash"), { ssr: false, loading }),
  sprint: dynamic(() => import("../games/SyntaxSprint"), { ssr: false, loading }),
  stack: dynamic(() => import("../games/DeployStack"), { ssr: false, loading }),
  memory: dynamic(() => import("../games/MemoryMerge"), { ssr: false, loading }),
  dodge: dynamic(() => import("../games/LoopDodge"), { ssr: false, loading }),
};

const LABEL = "font-pixel text-[11px] uppercase tracking-wide text-muted";

export function Arcade() {
  const [active, setActive] = useState<GameId | null>(null);

  useEffect(() => {
    const onPlay = (e: Event) => {
      scrollToId("arcade");
      setActive((e as CustomEvent<GameId>).detail);
    };
    window.addEventListener("loop:play", onPlay);
    return () => window.removeEventListener("loop:play", onPlay);
  }, []);

  return (
    <motion.section
      id="arcade"
      data-chapter="arcade"
      className="crt relative z-20 overflow-hidden text-fg"
      initial="off"
      whileInView="on"
      viewport={{ once: true, margin: "0px 0px -35% 0px" }}
    >
      {/* The tube warms up: a bright line that opens into a picture. */}
      <motion.div
        className="relative mx-auto max-w-site px-5 py-24 sm:px-8 md:py-32 lg:px-10"
        variants={{
          off: { scaleY: 0.004, scaleX: 0.5, opacity: 0, filter: "brightness(5)" },
          on: { scaleY: 1, scaleX: 1, opacity: 1, filter: "brightness(1)" },
        }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="mb-12 max-w-4xl md:mb-16">
          <Eyebrow numeral="VII">The Loop Arcade</Eyebrow>
          <h2 className="mt-5 font-pixel text-[clamp(2.1rem,5.4vw,4.75rem)] uppercase leading-[1.05] tracking-[-0.03em]">
            Take a break.
            <br />
            <span className="text-accent">Break a record.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Five small games I built for this site. Your scores, XP and trophies stay in your browser, a new daily quest arrives at midnight, and levelling up unlocks new site themes.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <DailyQuest onPlay={setActive} />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <PlayerCard />
          </Reveal>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GAMES.map((g, i) => (
            <Reveal key={g.id} delay={i * 0.06}>
              <GameCard id={g.id} onPlay={() => setActive(g.id)} />
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <TrophyRoom />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <ThemeShelf />
          </Reveal>
        </div>
      </motion.div>

      <AnimatePresence>{active && <GameModal key={active} id={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </motion.section>
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
    <div className="flex h-full flex-col justify-between gap-6 rounded-xl border border-line p-6">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className={LABEL}>Player one</p>
          <p className="font-pixel text-sm text-accent">LV {hydrated ? String(lvl).padStart(2, "0") : "--"}</p>
        </div>
        <p className="poster mt-2 text-3xl">{hydrated ? levelTitle(lvl) : "…"}</p>
        <div className="mt-4 grid grid-cols-[repeat(20,1fr)] gap-[3px]" aria-hidden>
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i} className={`h-3 ${hydrated && i * 5 < pct ? "bg-accent" : "bg-surface-2"}`} />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{hydrated ? `${s.xp} XP · ${100 - pct} XP to level ${lvl + 1}` : "loading your save…"}</p>
      </div>
      <dl className="grid grid-cols-4 gap-2 border-t border-line pt-4">
        {[
          ["visits", s.visits],
          ["streak", s.streak],
          ["games", plays],
          ["trophies", `${unlocked}/${ACHIEVEMENTS.length}`],
        ].map(([l, v]) => (
          <div key={l} className="flex flex-col-reverse gap-1">
            <dt className={LABEL}>{l}</dt>
            <dd className="font-pixel text-lg leading-none">{hydrated ? v : "-"}</dd>
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
    <div className="tone-field flex h-full flex-col justify-between gap-6 rounded-xl bg-bg p-6 text-fg md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-pixel text-[11px] uppercase tracking-wide">
        <span>Daily quest · {today ?? "…"}</span>
        <span>resets in {countdown}</span>
      </div>
      <p className="poster max-w-xl text-[clamp(1.9rem,3vw,2.75rem)]">{quest ? quest.label : "Loading today's quest…"}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {done ? (
          <span className="btn">Completed. See you tomorrow!</span>
        ) : (
          <button disabled={!quest} onClick={() => quest && onPlay(quest.game)} className="btn">
            <Play className="h-4 w-4 fill-current" /> Play {g?.name ?? ""}
          </button>
        )}
        <p className="text-sm text-muted">+50 XP and the Daily Driver trophy. Same quest for everyone today.</p>
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
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line text-left transition-colors hover:border-accent"
    >
      <div className="scanlines relative aspect-[8/5] overflow-hidden bg-bg-2 text-fg">
        <GameArt id={id} />
        <span className="absolute inset-0 grid place-items-center bg-accent font-pixel text-sm uppercase text-on-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          Press start
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold tracking-[-0.02em]">{g.name}</h3>
        <p className="mt-0.5 text-sm leading-snug text-muted">{g.tagline}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 font-pixel text-[11px] uppercase">
          <span className="flex items-center gap-1.5 text-accent">
            <Trophy className="h-3 w-3" />
            {hydrated && best !== undefined ? `${best} ${g.unit}` : "no score yet"}
          </span>
          <span className="text-muted">{hydrated ? `${plays}x` : ""}</span>
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
    <div className="h-full rounded-xl border border-line p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className={LABEL}>Trophy room</p>
        <p className="font-pixel text-sm text-accent">
          {count}/{ACHIEVEMENTS.length}
        </p>
      </div>
      <ul className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {ACHIEVEMENTS.map((a) => {
          const has = hydrated && !!got[a.id];
          const hidden = a.secret && !has;
          return (
            <li key={a.id} className="group relative">
              <div
                tabIndex={0}
                className={`grid aspect-square place-items-center rounded-sm text-2xl transition ${has ? "bg-accent/15 ring-1 ring-accent" : "bg-surface grayscale"}`}
              >
                <span className={has ? "" : "opacity-30"}>{hidden ? "❔" : a.icon}</span>
              </div>
              <div className="glass pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded-md p-3 text-center opacity-0 shadow-xl transition group-focus-within:opacity-100 group-hover:opacity-100">
                <p className="text-sm font-semibold">{hidden ? "Secret trophy" : a.title}</p>
                <p className="mt-0.5 text-xs text-muted">{hidden ? "Keep exploring. Some things are hidden." : a.desc}</p>
                <p className="mt-1 font-pixel text-[10px] uppercase text-accent">{has ? "unlocked" : `+${a.xp} XP`}</p>
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
    <div className="h-full rounded-xl border border-line p-6">
      <p className={`${LABEL} mb-4`}>Unlockable themes</p>
      <ul className="flex flex-col">
        {THEMES.map((t) => {
          const locked = !hydrated || xp < t.unlockXp;
          return (
            <li key={t.id} className="border-t border-line first:border-t-0">
              <button
                disabled={locked}
                onClick={() => {
                  setTheme(t.id);
                  sfx("click");
                }}
                className={`flex w-full items-center gap-3 py-2 text-left transition hover:text-accent ${locked ? "cursor-not-allowed text-muted hover:text-muted" : ""}`}
              >
                <span className="flex h-6 w-12 shrink-0 overflow-hidden rounded-sm">
                  {t.swatch.map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
                <span className="flex-1 font-semibold">{t.name}</span>
                {locked && t.unlockXp > 0 ? (
                  <span className="flex items-center gap-1 font-pixel text-[10px] uppercase text-muted">
                    <Lock className="h-3 w-3" /> {t.unlockXp} XP
                  </span>
                ) : (
                  hydrated && current === t.id && <span className="font-pixel text-[10px] uppercase text-accent">active</span>
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
    <motion.div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-bg/85" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-label={g.name}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex max-h-[100svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl border border-line bg-bg shadow-2xl sm:max-h-[94vh] sm:rounded-xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-pixel text-lg uppercase">{g.name}</p>
            <p className="mt-1 truncate font-pixel text-[10px] uppercase text-muted">
              {g.scoreLabel}: {best !== undefined ? `${best} ${g.unit}` : "-"}
            </p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md bg-surface-2 hover:bg-accent hover:text-on-accent" aria-label="Close game">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
          <Game key={round} onGameOver={onGameOver} />
          <p className="mx-auto mt-5 max-w-lg text-center text-sm leading-relaxed text-muted">{g.howTo}</p>

          <AnimatePresence>
            {result && (
              <motion.div className="absolute inset-0 z-20 grid place-items-center bg-bg/95 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="text-center">
                  <p className="font-pixel text-xs uppercase text-muted">{result.isRecord ? "new personal best" : result.firstPlay ? "first score on the board" : "game over"}</p>
                  <p className="poster mt-4 text-7xl">
                    <span className={result.isRecord ? "text-accent" : ""}>{result.score}</span>
                    <span className="ml-2 text-2xl text-muted">{g.unit}</span>
                  </p>
                  {id === "sprint" && meta.wpm !== undefined && (
                    <p className="mt-1 font-mono text-xs text-muted">
                      raw {meta.wpm} wpm · {meta.accuracy}% accuracy
                    </p>
                  )}
                  {id === "dodge" && meta.time !== undefined && <p className="mt-1 font-mono text-xs text-muted">survived {meta.time}s</p>}
                  {id === "memory" && meta.seconds !== undefined && <p className="mt-1 font-mono text-xs text-muted">in {meta.seconds}s</p>}
                  <div className="mt-5 flex flex-wrap justify-center gap-2 font-pixel text-[11px] uppercase">
                    <span className="rounded-sm bg-accent px-3 py-1.5 text-on-accent">+{result.xp} XP</span>
                    <span className="rounded-sm bg-surface-2 px-3 py-1.5">
                      best: {result.best} {g.unit}
                    </span>
                    {result.questCompleted && <span className="rounded-sm bg-success/20 px-3 py-1.5 text-success">daily quest +50 XP</span>}
                  </div>
                  <div className="mt-8 flex justify-center gap-3">
                    <button autoFocus onClick={again} className="btn">
                      <RotateCcw className="h-4 w-4" /> Play again
                    </button>
                    <button onClick={onClose} className="btn btn-line">
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
