import type { GameId } from "./store";

export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysBetween(a: string, b: string) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: string) {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Quest = { game: GameId; target: number; label: string; lowerIsBetter?: boolean };

const QUESTS: Quest[] = [
  { game: "bugs", target: 20, label: "Score 20+ in Bug Smash" },
  { game: "bugs", target: 28, label: "Score 28+ in Bug Smash" },
  { game: "sprint", target: 35, label: "Type 35+ WPM in Syntax Sprint" },
  { game: "sprint", target: 45, label: "Type 45+ WPM in Syntax Sprint" },
  { game: "stack", target: 12, label: "Stack 12+ floors in Deploy Stack" },
  { game: "stack", target: 18, label: "Stack 18+ floors in Deploy Stack" },
  { game: "memory", target: 16, label: "Clear Memory Merge in ≤ 16 moves", lowerIsBetter: true },
  { game: "memory", target: 13, label: "Clear Memory Merge in ≤ 13 moves", lowerIsBetter: true },
  { game: "dodge", target: 150, label: "Score 150+ in Loop Dodge" },
  { game: "dodge", target: 260, label: "Score 260+ in Loop Dodge" },
];

export function questFor(day: string): Quest {
  const r = seededRandom(`quest:${day}`);
  return QUESTS[Math.floor(r() * QUESTS.length)];
}

export function questMet(q: Quest, game: GameId, score: number) {
  if (q.game !== game) return false;
  return q.lowerIsBetter ? score <= q.target : score >= q.target;
}

const TIPS = [
  "Name things for the reader who opens the file at 2 AM.",
  "A slow query is usually a missing index wearing a disguise.",
  "Ship the boring version first. Make it clever later, if anyone asks.",
  "If you've explained it in Slack twice, put it in the README.",
  "Tailwind tip: `grid-flow-dense` fills gaps in a bento layout.",
  "Validate on the server, even when the client already did.",
  "Role-based access is easier to build in on day one than to add on day ninety.",
  "Measure before you optimise. The profiler knows more than your gut.",
  "A good commit message saves future-you an afternoon of archaeology.",
  "Every webhook should be idempotent. Payments will retry.",
  "Mobile first means thumb first. Put primary actions within reach.",
  "Cache what's expensive, then write down how to invalidate it.",
  "Feature flags let you merge early and release late.",
  "Your users don't read error codes. Write error messages.",
];

export function tipFor(day: string) {
  const r = seededRandom(`tip:${day}`);
  return TIPS[Math.floor(r() * TIPS.length)];
}

export function msUntilMidnight(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}
