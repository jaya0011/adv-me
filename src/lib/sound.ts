export type Sfx = "click" | "hit" | "crit" | "miss" | "coin" | "drop" | "perfect" | "lose" | "win" | "unlock" | "flip";

type Note = [freq: number, start: number, dur: number, type?: OscillatorType, gain?: number];

const PATTERNS: Record<Sfx, Note[]> = {
  click: [[880, 0, 0.04, "square", 0.04]],
  flip: [[520, 0, 0.05, "triangle", 0.08]],
  hit: [[660, 0, 0.06, "square", 0.06], [990, 0.04, 0.06, "square", 0.05]],
  crit: [[660, 0, 0.05, "square", 0.06], [990, 0.04, 0.05, "square", 0.06], [1320, 0.08, 0.08, "square", 0.06]],
  miss: [[180, 0, 0.16, "sawtooth", 0.06]],
  coin: [[988, 0, 0.06, "square", 0.05], [1319, 0.06, 0.12, "square", 0.05]],
  drop: [[300, 0, 0.07, "triangle", 0.12]],
  perfect: [[784, 0, 0.07, "triangle", 0.1], [1175, 0.06, 0.12, "triangle", 0.1]],
  lose: [[392, 0, 0.14, "triangle", 0.1], [311, 0.13, 0.14, "triangle", 0.1], [233, 0.26, 0.3, "triangle", 0.1]],
  win: [[523, 0, 0.1, "triangle", 0.1], [659, 0.1, 0.1, "triangle", 0.1], [784, 0.2, 0.1, "triangle", 0.1], [1047, 0.3, 0.3, "triangle", 0.1]],
  unlock: [[1047, 0, 0.08, "sine", 0.1], [1319, 0.08, 0.08, "sine", 0.1], [1568, 0.16, 0.25, "sine", 0.1]],
};

let ctx: AudioContext | null = null;

export function playSfx(kind: Sfx) {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    for (const [freq, start, dur, type = "sine", gain = 0.08] of PATTERNS[kind]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(gain, now + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    }
  } catch {
    // Audio is a nice-to-have; ignore failures (autoplay policies, old browsers).
  }
}
