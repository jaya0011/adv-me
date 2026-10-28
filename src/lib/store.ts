"use client";

import { useSyncExternalStore } from "react";
import { achievementById } from "@/data/achievements";
import { projects } from "@/data/portfolio";
import { THEMES, type ThemeId } from "@/data/themes";
import { dayKey, daysBetween, questFor, questMet } from "./daily";
import { playSfx, type Sfx } from "./sound";

export type GameId = "bugs" | "sprint" | "stack" | "memory" | "dodge";

export const LOWER_IS_BETTER: Partial<Record<GameId, boolean>> = { memory: true };

export type LoopState = {
  visits: number;
  firstVisit: string | null;
  lastVisitDay: string | null;
  streak: number;
  xp: number;
  achievements: Record<string, number>;
  scores: Partial<Record<GameId, number>>;
  plays: Partial<Record<GameId, number>>;
  theme: ThemeId;
  sound: boolean;
  dailyDone: string | null;
  projectsOpened: string[];
};

export const DEFAULT_STATE: LoopState = {
  visits: 0,
  firstVisit: null,
  lastVisitDay: null,
  streak: 0,
  xp: 0,
  achievements: {},
  scores: {},
  plays: {},
  theme: "nebula",
  sound: true,
  dailyDone: null,
  projectsOpened: [],
};

const KEY = "jaya-loop-v1";
const SESSION_KEY = "jaya-loop-session";

let state: LoopState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<LoopState>) };
  } catch {
    state = DEFAULT_STATE;
  }
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode) – progress just won't persist
  }
  listeners.forEach((l) => l());
}

function update(fn: (s: LoopState) => Partial<LoopState>) {
  load();
  state = { ...state, ...fn(state) };
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getLoop() {
  load();
  return state;
}

export function useLoop<T>(selector: (s: LoopState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getLoop()),
    () => selector(DEFAULT_STATE),
  );
}

const noopSubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/* ---------------- toasts ---------------- */

export type Toast = { id: number; icon: string; title: string; desc?: string; kind?: "achievement" | "theme" | "info" };
let toasts: Toast[] = [];
let toastId = 0;
const toastListeners = new Set<() => void>();
const EMPTY: Toast[] = [];

export function pushToast(t: Omit<Toast, "id">) {
  const toast = { ...t, id: ++toastId };
  toasts = [...toasts, toast].slice(-4);
  toastListeners.forEach((l) => l());
  window.setTimeout(() => dismissToast(toast.id), 4200);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  toastListeners.forEach((l) => l());
}

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      toastListeners.add(l);
      return () => toastListeners.delete(l);
    },
    () => toasts,
    () => EMPTY,
  );
}

/* ---------------- actions ---------------- */

export function sfx(kind: Sfx) {
  if (getLoop().sound) playSfx(kind);
}

export const levelFor = (xp: number) => Math.floor(xp / 100) + 1;
export const LEVEL_TITLES = ["Visitor", "Explorer", "Player", "Regular", "Insider", "Power User", "Legend", "Mythic"];
export const levelTitle = (lvl: number) => LEVEL_TITLES[Math.min(lvl - 1, LEVEL_TITLES.length - 1)];

export function addXp(amount: number) {
  if (amount <= 0) return;
  const before = getLoop().xp;
  const after = before + amount;
  update(() => ({ xp: after }));
  for (const t of THEMES) {
    if (t.unlockXp > 0 && before < t.unlockXp && after >= t.unlockXp) {
      pushToast({ icon: "🎨", title: `Theme unlocked: ${t.name}`, desc: "Switch to it from the palette button in the nav.", kind: "theme" });
    }
  }
  if (levelFor(after) > levelFor(before)) {
    pushToast({ icon: "⬆️", title: `Level ${levelFor(after)} · ${levelTitle(levelFor(after))}`, desc: "You levelled up!", kind: "info" });
  }
}

export function unlock(id: string) {
  const def = achievementById[id];
  if (!def || getLoop().achievements[id]) return;
  update((s) => ({ achievements: { ...s.achievements, [id]: Date.now() } }));
  pushToast({ icon: def.icon, title: def.title, desc: `${def.desc} +${def.xp} XP`, kind: "achievement" });
  sfx("unlock");
  addXp(def.xp);
}

export function registerVisit() {
  load();
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // fall through – count it anyway
  }
  const today = dayKey();
  const s = getLoop();
  let streak = 1;
  if (s.lastVisitDay) {
    const gap = daysBetween(s.lastVisitDay, today);
    streak = gap === 0 ? s.streak || 1 : gap === 1 ? s.streak + 1 : 1;
  }
  const visits = s.visits + 1;
  update(() => ({ visits, streak, lastVisitDay: today, firstVisit: s.firstVisit ?? today }));

  window.setTimeout(() => {
    unlock("hello-world");
    if (visits >= 2) unlock("back-on-loop");
    if (visits >= 7) unlock("infinite-loop");
    if (streak >= 3) unlock("on-a-roll");
    if (new Date().getHours() < 5) unlock("night-owl");
  }, 1800);
}

export function setTheme(id: ThemeId) {
  const t = THEMES.find((x) => x.id === id);
  if (!t || getLoop().xp < t.unlockXp) return false;
  if (getLoop().theme !== id) {
    update(() => ({ theme: id }));
    unlock("stylist");
  }
  return true;
}

export function toggleSound() {
  update((s) => ({ sound: !s.sound }));
}

export function openedProject(id: string) {
  const s = getLoop();
  if (s.projectsOpened.includes(id)) return;
  const opened = [...s.projectsOpened, id];
  update(() => ({ projectsOpened: opened }));
  if (opened.length >= 3) unlock("case-reader");
  if (projects.every((p) => opened.includes(p.id))) unlock("due-diligence");
}

export function resetProgress() {
  state = { ...DEFAULT_STATE, visits: 1, lastVisitDay: dayKey(), firstVisit: dayKey(), streak: 1 };
  emit();
}

export type GameResult = {
  score: number;
  best: number | undefined;
  isRecord: boolean;
  xp: number;
  questCompleted: boolean;
  firstPlay: boolean;
};

function xpForGame(game: GameId, score: number) {
  switch (game) {
    case "bugs":
      return Math.min(60, Math.max(5, score * 2));
    case "sprint":
      return Math.min(60, Math.max(5, score));
    case "stack":
      return Math.min(60, Math.max(5, score * 3));
    case "memory":
      return Math.max(10, 70 - score * 2);
    case "dodge":
      return Math.min(60, Math.max(5, Math.round(score / 5)));
  }
}

export function recordGame(game: GameId, score: number, meta: Record<string, number> = {}): GameResult {
  const s = getLoop();
  const prev = s.scores[game];
  const lower = LOWER_IS_BETTER[game];
  const isRecord = prev === undefined || (lower ? score < prev : score > prev);
  const plays = { ...s.plays, [game]: (s.plays[game] ?? 0) + 1 };
  const scores = isRecord ? { ...s.scores, [game]: score } : s.scores;
  update(() => ({ plays, scores }));

  const xp = xpForGame(game, score);
  addXp(xp);

  unlock("player-one");
  if ((["bugs", "sprint", "stack", "memory", "dodge"] as GameId[]).every((g) => plays[g])) unlock("arcade-regular");
  if (game === "bugs" && score >= 25) unlock("exterminator");
  if (game === "sprint" && score >= 40) unlock("fast-fingers");
  if (game === "stack" && score >= 15) unlock("skyscraper");
  if (game === "memory" && score <= 12) unlock("photographic");
  if (game === "dodge" && (meta.time ?? 0) >= 30) unlock("orbiter");

  let questCompleted = false;
  const today = dayKey();
  if (getLoop().dailyDone !== today && questMet(questFor(today), game, score)) {
    questCompleted = true;
    update(() => ({ dailyDone: today }));
    pushToast({ icon: "📅", title: "Daily quest complete!", desc: "+50 XP. A new quest arrives at midnight.", kind: "info" });
    addXp(50);
    unlock("daily-driver");
  }

  return { score, best: isRecord ? score : prev, isRecord: isRecord && prev !== undefined, xp, questCompleted, firstPlay: prev === undefined };
}

/* ---------------- cross-component events ---------------- */

export function playGame(id: GameId) {
  window.dispatchEvent(new CustomEvent<GameId>("loop:play", { detail: id }));
}

export function openProject(id: string) {
  window.dispatchEvent(new CustomEvent<string>("loop:project", { detail: id }));
}

export function openPalette() {
  window.dispatchEvent(new Event("loop:palette"));
}
