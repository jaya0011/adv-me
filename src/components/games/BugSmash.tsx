"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/store";
import type { GameProps } from "./registry";
import { StartOverlay } from "./StartOverlay";

const DURATION = 30;
const LINES = [
  "const app = express();",
  "await db.connect(url);",
  "if (!user) return 401;",
  "cart.items.push(sku);",
  "SELECT * FROM leaves;",
  "export default Page;",
  "add_action('init', fn);",
  "res.json({ ok: true });",
  "useEffect(() => {}, []);",
];

type Kind = "bug" | "crit" | "feature";
type Cell = { kind: Kind; id: number; until: number } | null;
type Pop = { id: number; cell: number; text: string; good: boolean };

const KIND: Record<Kind, { emoji: string; points: number; label: string }> = {
  bug: { emoji: "🐛", points: 1, label: "bug" },
  crit: { emoji: "🐞", points: 3, label: "critical" },
  feature: { emoji: "✅", points: -2, label: "feature" },
};

export default function BugSmash({ onGameOver }: GameProps) {
  const [playing, setPlaying] = useState(false);
  const [cells, setCells] = useState<Cell[]>(() => Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [combo, setCombo] = useState(0);
  const [pops, setPops] = useState<Pop[]>([]);
  const [shake, setShake] = useState(false);
  const scoreRef = useRef(0);
  const cellsRef = useRef<Cell[]>(cells);
  const comboRef = useRef(0);
  const ids = useRef(0);

  const setBoard = (next: Cell[]) => {
    cellsRef.current = next;
    setCells(next);
  };

  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    let raf = 0;
    let spawnTimer = 0;
    let done = false;

    const tick = () => {
      const now = performance.now();
      const left = Math.max(0, DURATION - (now - start) / 1000);
      setTimeLeft(left);
      const cur = cellsRef.current;
      if (cur.some((c) => c && c.until < now)) {
        const missedBug = cur.some((c) => c && c.until < now && c.kind !== "feature");
        if (missedBug) {
          comboRef.current = 0;
          setCombo(0);
        }
        setBoard(cur.map((c) => (c && c.until < now ? null : c)));
      }
      if (left <= 0 && !done) {
        done = true;
        window.clearTimeout(spawnTimer);
        setBoard(Array(9).fill(null));
        onGameOver(scoreRef.current);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const spawn = () => {
      const progress = (performance.now() - start) / 1000 / DURATION;
      const cur = cellsRef.current;
      const empty = cur.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
      if (empty.length) {
        const idx = empty[Math.floor(Math.random() * empty.length)];
        const roll = Math.random();
        const kind: Kind = roll < 0.2 ? "feature" : roll < 0.33 ? "crit" : "bug";
        const life = (kind === "crit" ? 700 : 1150) * (1 - 0.42 * progress);
        const next = [...cur];
        next[idx] = { kind, id: ++ids.current, until: performance.now() + life };
        setBoard(next);
      }
      spawnTimer = window.setTimeout(spawn, 560 - 300 * progress + Math.random() * 180);
    };

    raf = requestAnimationFrame(tick);
    spawnTimer = window.setTimeout(spawn, 300);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(spawnTimer);
    };
  }, [playing, onGameOver]);

  const hit = (i: number) => {
    if (!playing) return;
    const c = cellsRef.current[i];
    if (!c) return;
    const k = KIND[c.kind];
    let pts = k.points;
    if (c.kind === "feature") {
      comboRef.current = 0;
      setShake(true);
      window.setTimeout(() => setShake(false), 300);
      sfx("miss");
    } else {
      comboRef.current += 1;
      if (comboRef.current % 5 === 0) pts += 2;
      sfx(c.kind === "crit" ? "crit" : "hit");
    }
    setCombo(comboRef.current);
    scoreRef.current = Math.max(0, scoreRef.current + pts);
    setScore(scoreRef.current);
    const next = [...cellsRef.current];
    next[i] = null;
    setBoard(next);
    const pop = { id: ++ids.current, cell: i, text: pts > 0 ? `+${pts}` : `${pts}`, good: pts > 0 };
    setPops((p) => [...p.slice(-6), pop]);
    window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== pop.id)), 700);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 9) hit(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="mx-auto w-full max-w-md select-none">
      <div className="mb-4 flex items-center justify-between font-mono text-sm">
        <span>
          score <b className="text-lg text-accent">{score}</b>
        </span>
        <span className={combo >= 3 ? "text-accent-3" : "text-muted"}>combo ×{combo}</span>
        <span className={timeLeft < 6 ? "text-danger" : ""}>{timeLeft.toFixed(1)}s</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-3" style={{ width: `${(timeLeft / DURATION) * 100}%` }} />
      </div>

      <div className={`relative grid grid-cols-3 gap-2.5 ${shake ? "animate-shake" : ""}`}>
        {!playing && (
          <StartOverlay
            emoji="🐞"
            title="Bugs in production!"
            hint="Smash 🐛 and 🐞, but leave the ✅ features alone."
            onStart={() => {
              sfx("click");
              setPlaying(true);
            }}
          />
        )}
        {cells.map((c, i) => (
          <button
            key={i}
            onPointerDown={() => hit(i)}
            aria-label={c ? `Tile ${i + 1}: ${KIND[c.kind].label}` : `Tile ${i + 1}: empty`}
            className={`relative aspect-square overflow-hidden rounded-2xl border transition-colors ${
              c?.kind === "crit" ? "border-danger/60 bg-danger/10" : c?.kind === "feature" ? "border-success/50 bg-success/10" : c ? "border-accent/40 bg-accent/10" : "border-line bg-surface"
            }`}
          >
            <span className="absolute left-2 top-2 font-mono text-[10px] text-muted/60">{i + 1}</span>
            <span className="absolute inset-x-2 bottom-2 truncate text-left font-mono text-[9px] text-muted/50">{LINES[i]}</span>
            {c && (
              <span key={c.id} className="animate-pop absolute inset-0 grid place-items-center text-5xl drop-shadow-lg sm:text-6xl">
                {KIND[c.kind].emoji}
              </span>
            )}
            {pops
              .filter((p) => p.cell === i)
              .map((p) => (
                <span
                  key={p.id}
                  className={`animate-float-up pointer-events-none absolute inset-x-0 top-1/3 text-center font-display text-2xl font-bold ${p.good ? "text-success" : "text-danger"}`}
                >
                  {p.text}
                </span>
              ))}
          </button>
        ))}
      </div>
    </div>
  );
}
