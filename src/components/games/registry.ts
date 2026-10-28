import type { GameId } from "@/lib/store";

export type GameProps = {
  onGameOver: (score: number, meta?: Record<string, number>) => void;
};

export type GameMeta = {
  id: GameId;
  name: string;
  emoji: string;
  tagline: string;
  howTo: string;
  scoreLabel: string;
  unit: string;
  colors: [string, string];
};

export const GAMES: GameMeta[] = [
  {
    id: "dodge",
    name: "Loop Dodge",
    emoji: "🪐",
    tagline: "Orbit the core. Dodge the bugs.",
    howTo: "Your dot orbits the core on its own. Tap, click or press Space to reverse direction. Dodge the bugs coming out of the core and collect the commits.",
    scoreLabel: "Best score",
    unit: "pts",
    colors: ["#a78bfa", "#22d3ee"],
  },
  {
    id: "bugs",
    name: "Bug Smash",
    emoji: "🐞",
    tagline: "30 seconds. Squash every bug.",
    howTo: "Hit 🐛 for +1 and 🐞 for +3. Never hit a ✅ feature (−2). On desktop, keys 1–9 hit the matching tile.",
    scoreLabel: "Best score",
    unit: "pts",
    colors: ["#f472b6", "#fb923c"],
  },
  {
    id: "stack",
    name: "Deploy Stack",
    emoji: "🏗️",
    tagline: "Stack the pipeline sky-high.",
    howTo: "Tap, click or press Space to drop each block. Any overhang gets cut off. Line up 3 perfect drops in a row and the block grows back.",
    scoreLabel: "Best height",
    unit: "floors",
    colors: ["#34d399", "#0ea5e9"],
  },
  {
    id: "sprint",
    name: "Syntax Sprint",
    emoji: "⌨️",
    tagline: "Type real code against the clock.",
    howTo: "Type the snippet exactly. Enter adds a new line and indentation fills in automatically. Your score is WPM × accuracy.",
    scoreLabel: "Best WPM",
    unit: "wpm",
    colors: ["#22d3ee", "#6366f1"],
  },
  {
    id: "memory",
    name: "Memory Merge",
    emoji: "🧠",
    tagline: "Match the stack in as few moves as possible.",
    howTo: "Flip two cards at a time to find all 8 tech pairs. Fewer moves is better.",
    scoreLabel: "Fewest moves",
    unit: "moves",
    colors: ["#e8c26a", "#ec4899"],
  },
];

export const gameById = Object.fromEntries(GAMES.map((g) => [g.id, g])) as Record<GameId, GameMeta>;
