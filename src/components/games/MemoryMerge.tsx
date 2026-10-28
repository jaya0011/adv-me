"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/store";
import type { GameProps } from "./registry";
import { StartOverlay } from "./StartOverlay";

const TECH = [
  { key: "react", glyph: "⚛", label: "React", color: "#61dafb" },
  { key: "next", glyph: "▲", label: "Next.js", color: "#9ca3af" },
  { key: "node", glyph: "⬢", label: "Node.js", color: "#68a063" },
  { key: "php", glyph: "<?", label: "PHP", color: "#8892bf" },
  { key: "ts", glyph: "TS", label: "TypeScript", color: "#3178c6" },
  { key: "pg", glyph: "🐘", label: "Postgres", color: "#336791" },
  { key: "expo", glyph: "◎", label: "Expo", color: "#a78bfa" },
  { key: "wp", glyph: "W", label: "WordPress", color: "#21759b" },
];

type Card = { id: number; key: string };

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryMerge({ onGameOver }: GameProps) {
  const [deck, setDeck] = useState<Card[]>(() => TECH.flatMap((t, i) => [{ id: i * 2, key: t.key }, { id: i * 2 + 1, key: t.key }]));
  const [playing, setPlaying] = useState(false);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(id);
  }, [playing]);

  const flip = (idx: number) => {
    if (!playing || lock.current || flipped.includes(idx) || matched.has(deck[idx].key)) return;
    sfx("flip");
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length < 2) return;

    const m = moves + 1;
    setMoves(m);
    const [a, b] = next;
    if (deck[a].key === deck[b].key) {
      const done = new Set(matched).add(deck[a].key);
      setMatched(done);
      setFlipped([]);
      sfx("coin");
      if (done.size === TECH.length) {
        sfx("win");
        lock.current = true;
        window.setTimeout(() => onGameOver(m, { seconds: Math.round((performance.now() - startedAt) / 1000) }), 700);
      }
    } else {
      lock.current = true;
      window.setTimeout(() => {
        setFlipped([]);
        lock.current = false;
      }, 750);
    }
  };

  const seconds = playing ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;

  return (
    <div className="mx-auto w-full max-w-md select-none">
      <div className="mb-4 flex items-center justify-between font-mono text-sm">
        <span>
          moves <b className="text-lg text-accent">{moves}</b>
        </span>
        <span className="text-muted">
          pairs {matched.size}/{TECH.length}
        </span>
        <span>{seconds}s</span>
      </div>
      <div className="relative grid grid-cols-4 gap-2.5">
        {!playing && (
          <StartOverlay
            emoji="🧠"
            title="Memory Merge"
            hint="Find all 8 tech pairs. Perfect memory takes 8 moves. Can you get it in 12?"
            onStart={() => {
              sfx("click");
              setDeck((d) => shuffle(d));
              setStartedAt(performance.now());
              setNow(performance.now());
              setPlaying(true);
            }}
          />
        )}
        {deck.map((card, i) => {
          const tech = TECH.find((t) => t.key === card.key)!;
          const isUp = flipped.includes(i) || matched.has(card.key);
          return (
            <button
              key={card.id}
              onClick={() => flip(i)}
              data-flipped={isUp}
              aria-label={isUp ? tech.label : "Hidden card"}
              className="flip-card aspect-[3/4]"
            >
              <div className="flip-inner relative h-full w-full">
                <div className="flip-face absolute inset-0 grid place-items-center rounded-xl border border-line bg-gradient-to-br from-surface-2 to-surface">
                  <span className="font-display text-2xl font-bold text-accent/60">∞</span>
                </div>
                <div
                  className={`flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl border ${
                    matched.has(card.key) ? "border-success/60" : "border-line"
                  }`}
                  style={{ background: `linear-gradient(140deg, ${tech.color}33, ${tech.color}0d)` }}
                >
                  <span className="font-display text-2xl font-bold sm:text-3xl" style={{ color: tech.color }}>
                    {tech.glyph}
                  </span>
                  <span className="text-[10px] font-medium text-muted sm:text-xs">{tech.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
