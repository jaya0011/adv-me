export type ThemeId = "nebula" | "sunset" | "matrix" | "aurum";

export type Theme = {
  id: ThemeId;
  name: string;
  vibe: string;
  unlockXp: number;
  swatch: [string, string, string, string];
};

export const THEMES: Theme[] = [
  { id: "nebula", name: "Deep Space", vibe: "Mint and amber in the dark", unlockXp: 0, swatch: ["#05070c", "#7fdcc0", "#ffb26b", "#e9eef6"] },
  { id: "sunset", name: "Sunset", vibe: "Warm Punjab evenings", unlockXp: 100, swatch: ["#0d0705", "#ff8a4c", "#ffcf7a", "#fff1e6"] },
  { id: "matrix", name: "Terminal", vibe: "Green phosphor hacker", unlockXp: 250, swatch: ["#030a06", "#5fe39a", "#b6f25a", "#d7ffe1"] },
  { id: "aurum", name: "Aurum", vibe: "Gold, like a jeweller's vault", unlockXp: 500, swatch: ["#090704", "#e0bf74", "#fff0c8", "#fbf6e9"] },
];

export const themeById = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<ThemeId, Theme>;
