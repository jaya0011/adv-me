export type ThemeId = "nebula" | "paper" | "sunset" | "matrix" | "aurum";

export type Theme = {
  id: ThemeId;
  name: string;
  vibe: string;
  unlockXp: number;
  swatch: [string, string, string, string];
};

export const THEMES: Theme[] = [
  { id: "nebula", name: "Nebula", vibe: "Deep space, neon edges", unlockXp: 0, swatch: ["#07060f", "#a78bfa", "#22d3ee", "#f472b6"] },
  { id: "paper", name: "Paper", vibe: "Daylight editorial", unlockXp: 0, swatch: ["#f6f3ec", "#6d28d9", "#0e7490", "#db2777"] },
  { id: "sunset", name: "Sunset", vibe: "Warm Punjab evenings", unlockXp: 100, swatch: ["#120707", "#fb923c", "#f43f5e", "#facc15"] },
  { id: "matrix", name: "Terminal", vibe: "Green phosphor hacker", unlockXp: 250, swatch: ["#020803", "#22c55e", "#a3e635", "#34d399"] },
  { id: "aurum", name: "Aurum", vibe: "Gold, like a jeweller's vault", unlockXp: 500, swatch: ["#0b0906", "#e8c26a", "#f5e6b8", "#c08a3e"] },
];

export const themeById = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<ThemeId, Theme>;
