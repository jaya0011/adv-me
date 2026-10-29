"use client";

import { useEffect, useRef } from "react";

/**
 * First-load-per-session splash: a pencil circles while the page loads (0→100%),
 * then writes "hello" and the curtain lifts. Driven by rAF writing straight to
 * the DOM so it never re-renders; the boot script in layout hides it for the
 * rest of the session.
 */

// Single-stroke cursive "hello", drawn in a 440×180 box.
const HELLO =
  "M18 138C48 122 88 72 98 42C106 16 84 10 77 36C71 70 64 118 60 150C70 116 90 101 105 103C121 105 118 130 120 144C122 156 136 153 146 141C162 131 190 126 192 108C193 95 170 95 163 113C155 136 171 155 191 152C206 150 216 140 223 129C241 104 264 60 267 36C269 16 249 16 246 40C243 70 242 120 248 144C252 156 266 153 276 138C294 110 318 60 321 36C323 16 303 16 300 40C297 70 296 120 302 144C306 156 319 153 329 140C339 121 360 104 379 106C358 101 341 122 345 140C349 158 379 157 385 134C390 116 381 104 372 108C386 114 405 110 424 98";

const CX = 221;
const CY = 86;
const R = 66;
const TRAIL_SEGMENTS = 18;
const TRAIL_MAX = 1.7; // radians
const SPIN = (Math.PI * 2) / 1150; // rad per ms
const WRITE_HEADING = (-62 * Math.PI) / 180; // pencil held up-and-right of the tip

// Pencil parts as [fromTip, toTip, widthAtStart, widthAtEnd, fill], painted in order.
const L = 112;
const W = 17;
const PARTS: [number, number, number, number, string][] = [
  [0, 21, 0, W, "#e6c79c"],
  [0, 7, 0, 5, "#2b2724"],
  [21, 84, W, W, "color-mix(in oklab, var(--accent) 62%, black)"],
  [21, 84, W * 0.66, W * 0.66, "var(--accent)"],
  [23, 84, 3, 3, "color-mix(in oklab, var(--accent) 45%, white)"],
  [84, 100, W + 1, W + 1, "#c9ccd3"],
  [87, 89, W + 1, W + 1, "#8b8f98"],
  [95, 97, W + 1, W + 1, "#8b8f98"],
  [100, L, W - 1, W - 6, "#ee8f9e"],
];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** Point at arc length s along a curve leaving (x, y) with heading h and curvature k. */
function along(x: number, y: number, h: number, k: number, s: number): [number, number, number] {
  if (Math.abs(k) < 1e-5) return [x + s * Math.cos(h), y + s * Math.sin(h), h];
  const h2 = h + k * s;
  return [x + (Math.sin(h2) - Math.sin(h)) / k, y + (Math.cos(h) - Math.cos(h2)) / k, h2];
}

/** Filled band between s0 and s1 along the curve, tapering w0→w1. */
function ribbon(x: number, y: number, h: number, k: number, s0: number, s1: number, w0: number, w1: number) {
  const n = Math.max(2, Math.ceil((s1 - s0) / 3));
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const [px, py, ph] = along(x, y, h, k, lerp(s0, s1, t));
    const half = lerp(w0, w1, t) / 2;
    const nx = -Math.sin(ph) * half;
    const ny = Math.cos(ph) * half;
    left.push(`${(px + nx).toFixed(2)} ${(py + ny).toFixed(2)}`);
    right.unshift(`${(px - nx).toFixed(2)} ${(py - ny).toFixed(2)}`);
  }
  return `M${left.join("L")}L${right.join("L")}Z`;
}

const ringPoint = (a: number): [number, number] => [CX + R * Math.cos(a), CY + R * Math.sin(a)];

export function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const helloRef = useRef<SVGPathElement>(null);
  const pencilRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGGElement>(null);
  const skipRef = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    const hello = helloRef.current;
    const pencil = pencilRef.current;
    const trail = trailRef.current;
    if (!root || !hello || !pencil || !trail || html.classList.contains("intro-seen")) return;

    const finish = () => html.classList.add("intro-seen");
    const exit = () => {
      root.style.animation = "intro-exit 0.9s cubic-bezier(0.7,0,0.2,1) forwards";
      root.addEventListener("animationend", finish, { once: true });
    };

    const len = hello.getTotalLength();

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hello.style.strokeDashoffset = "0";
      hello.style.opacity = "1";
      if (countRef.current) countRef.current.style.opacity = "0";
      const id = setTimeout(exit, 900);
      return () => clearTimeout(id);
    }

    const parts = Array.from(pencil.children) as SVGPathElement[];
    const segs = Array.from(trail.children) as SVGPathElement[];
    const drawPencil = (x: number, y: number, h: number, k: number) => {
      PARTS.forEach(([s0, s1, w0, w1], i) => parts[i].setAttribute("d", ribbon(x, y, h, k, s0, s1, w0, w1)));
    };
    const drawTrail = (head: number, span: number) => {
      segs.forEach((seg, i) => {
        if (span < 0.01) return seg.setAttribute("d", "");
        const [x1, y1] = ringPoint(head - span * (1 - i / TRAIL_SEGMENTS));
        const [x2, y2] = ringPoint(head - span * (1 - (i + 1) / TRAIL_SEGMENTS));
        seg.setAttribute("d", `M${x1.toFixed(2)} ${y1.toFixed(2)}A${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`);
      });
    };

    const start0 = hello.getPointAtLength(0);
    const start = performance.now();
    let shown = 0;
    let last = start;
    let loadedAt = 0; // when the counter reached 100
    let spinAngle = -Math.PI / 2;
    let exitAt = 0;
    let raf = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const t = now - start;

      if (skipRef.current && !exitAt) {
        exitAt = now;
        exit();
      }

      if (!loadedAt) {
        // Counter: time-based, but holds at 92% until the page has actually loaded (or 6s pass).
        const ready = document.readyState === "complete" || t > 6000;
        const target = Math.min(ease(clamp01(t / 2300)), ready ? 1 : 0.92);
        shown += (target - shown) * Math.min(1, dt / 90);
        if (target === 1 && shown > 0.995) {
          shown = 1;
          loadedAt = now;
        }
        if (countRef.current) countRef.current.textContent = `${Math.round(shown * 100)}%`;

        spinAngle += SPIN * dt * Math.min(1, t / 500);
        drawTrail(spinAngle, Math.min(TRAIL_MAX, spinAngle + Math.PI / 2));
        drawPencil(...ringPoint(spinAngle), spinAngle + Math.PI / 2, 1 / R);
      } else {
        const p = now - loadedAt;
        const move = ease(clamp01((p - 150) / 750));
        const write = clamp01((p - 900) / 2500);
        const lift = ease(clamp01((p - 3500) / 550));

        if (p > 100 && countRef.current) countRef.current.dataset.out = "";
        drawTrail(spinAngle, TRAIL_MAX * (1 - clamp01(p / 700)));

        if (write === 0) {
          const [rx, ry] = ringPoint(spinAngle);
          const h0 = spinAngle + Math.PI / 2;
          drawPencil(
            lerp(rx, start0.x, move),
            lerp(ry, start0.y, move),
            h0 + wrapAngle(WRITE_HEADING - h0) * move,
            (1 - move) / R,
          );
        } else {
          const e = easeSine(write);
          const pt = hello.getPointAtLength(len * e);
          hello.style.strokeDashoffset = `${1 - e}`;
          hello.style.opacity = "1";
          // A small rock of the wrist so the pencil doesn't look bolted on.
          const h = WRITE_HEADING + Math.sin(e * Math.PI * 7) * 0.05 * (1 - lift);
          drawPencil(pt.x + lift * 46, pt.y - lift * 64, h, 0);
          pencil.style.opacity = `${1 - lift}`;
        }

        if (p > 4400 && !exitAt) {
          exitAt = now;
          exit();
        }
      }

      if (!exitAt || now - exitAt < 1000) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      id="loop-intro"
      ref={rootRef}
      role="status"
      aria-label="Loading"
      onClick={() => {
        skipRef.current = true;
      }}
      className="fixed inset-0 z-[300] grid cursor-pointer place-items-center overflow-hidden bg-bg"
      // Safety net: if JS never runs, still get out of the way.
      style={{ animation: "intro-exit 0.9s 12s cubic-bezier(0.7,0,0.2,1) forwards" }}
    >
      <style>{`
        @keyframes intro-exit { to { transform: translateY(-100%); visibility: hidden; } }
        @keyframes intro-hint { from { opacity: 0 } to { opacity: 1 } }
        #loop-intro [data-out] { opacity: 0; transform: translateY(-24px) scale(0.92); filter: blur(6px); }
      `}</style>

      <div className="relative w-[min(84vw,30rem)]">
        <div
          ref={countRef}
          className="absolute inset-x-0 bottom-[calc(100%-0.5rem)] text-center font-display text-[clamp(3.5rem,13vw,6.5rem)] font-extrabold leading-none tracking-[-0.05em] tabular-nums transition-[opacity,transform,filter] duration-500 ease-out"
          style={{ color: "color-mix(in oklab, var(--accent) 55%, var(--fg))" }}
        >
          0%
        </div>

        <svg viewBox="0 0 440 180" className="w-full overflow-visible" fill="none" aria-hidden>
          <defs>
            <linearGradient id="intro-ink" x1="0" x2="1">
              <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--accent) 70%, var(--fg))" }} />
              <stop offset="1" style={{ stopColor: "var(--accent)" }} />
            </linearGradient>
          </defs>
          <g ref={trailRef} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-fg">
            {Array.from({ length: TRAIL_SEGMENTS }, (_, i) => (
              <path key={i} opacity={((i + 1) / TRAIL_SEGMENTS) ** 1.6 * 0.85} />
            ))}
          </g>
          <path
            ref={helloRef}
            d={HELLO}
            stroke="url(#intro-ink)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            // Hidden until the pen touches down: a zero-length dash still paints a round cap.
            style={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}
          />
          <g ref={pencilRef} style={{ filter: "drop-shadow(0 6px 10px rgb(0 0 0 / 0.35))" }}>
            {PARTS.map(([, , , , fill], i) => (
              <path key={i} style={{ fill }} />
            ))}
          </g>
        </svg>
      </div>

      <div
        className="absolute bottom-8 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
        style={{ animation: "intro-hint 0.6s 1.2s both" }}
      >
        click anywhere to skip
      </div>
    </div>
  );
}
