"use client";

import { useEffect, useRef } from "react";
import { HELLO, HELLO_STROKE, WRITE_ANGLE } from "@/lib/pencil";
import { PencilArt } from "./ui/PencilArt";

/**
 * First-load-per-session splash: a pencil circles while the page loads (0→100%),
 * then writes "hello", and the word settles into its place in the hero. Driven by rAF
 * writing straight to the DOM so it never re-renders; the boot script in layout hides
 * it for the rest of the session.
 */

const CX = 221;
const CY = 86;
const R = 66;
const TRAIL_SEGMENTS = 18;
const TRAIL_MAX = 1.7; // radians
const SPIN = (Math.PI * 2) / 1150; // rad per ms
const SCALE = 0.86; // pencil size inside the 440×180 box

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const ringPoint = (a: number): [number, number] => [CX + R * Math.cos(a), CY + R * Math.sin(a)];

export function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const helloRef = useRef<SVGPathElement>(null);
  const pencilRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGGElement>(null);
  const skipRef = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    const svg = svgRef.current;
    const hello = helloRef.current;
    const pencil = pencilRef.current;
    const trail = trailRef.current;
    if (!root || !svg || !hello || !pencil || !trail || html.classList.contains("intro-seen")) return;

    const finish = () => html.classList.add("intro-seen");

    const exit = () => {
      html.classList.add("intro-leaving");
      const target = document.getElementById("hero-hello")?.getBoundingClientRect();
      if (!target || window.scrollY > 40) {
        // Reloaded partway down the page: nothing to land on, so just lift the sheet.
        root.style.animation = "intro-exit 0.9s cubic-bezier(0.7,0,0.2,1) forwards";
        root.addEventListener("animationend", finish, { once: true });
        return;
      }
      // Land the written word exactly on the hero's copy of it.
      const from = svg.getBoundingClientRect();
      const scale = target.width / from.width;
      root.style.pointerEvents = "none";
      root.style.animation = "none";
      root.style.transition = "background-color 0.6s ease 0.45s";
      root.style.backgroundColor = "transparent";
      pencil.style.opacity = "0";
      if (hintRef.current) {
        hintRef.current.style.animation = "none";
        hintRef.current.style.opacity = "0";
      }
      svg.style.transformOrigin = "0 0";
      svg.style.transition = "transform 1.05s cubic-bezier(0.7,0,0.2,1)";
      svg.style.transform = `translate(${target.left - from.left}px, ${target.top - from.top}px) scale(${scale})`;
      window.setTimeout(finish, 1100);
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hello.style.strokeDashoffset = "0";
      hello.style.opacity = "1";
      pencil.style.opacity = "0";
      if (countRef.current) countRef.current.style.opacity = "0";
      const id = setTimeout(exit, 900);
      return () => clearTimeout(id);
    }

    const len = hello.getTotalLength();
    const segs = Array.from(trail.children) as SVGPathElement[];
    // A pencil keeps its angle in the hand: only the tip moves.
    const drawPencil = (x: number, y: number, tilt = 0) => {
      pencil.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(WRITE_ANGLE + tilt).toFixed(2)}) scale(${SCALE})`);
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
      const dt = Math.max(0, now - last);
      last = now;
      const t = now - start;

      if (skipRef.current && !exitAt) {
        exitAt = now;
        hello.style.strokeDashoffset = "0";
        hello.style.opacity = "1";
        if (countRef.current) countRef.current.dataset.out = "";
        drawTrail(spinAngle, 0);
        exit();
      }

      if (!loadedAt) {
        // Counter: time-based, but holds at 92% until the page has actually loaded (or 6s pass).
        const ready = document.readyState === "complete" || t > 6000;
        const target = Math.min(ease(clamp01(t / 2000)), ready ? 1 : 0.92);
        shown += (target - shown) * Math.min(1, dt / 90);
        if (target === 1 && shown > 0.995) {
          shown = 1;
          loadedAt = now;
        }
        if (countRef.current) countRef.current.textContent = `${Math.round(shown * 100)}`;

        spinAngle += SPIN * dt * Math.min(1, t / 500);
        drawTrail(spinAngle, Math.min(TRAIL_MAX, spinAngle + Math.PI / 2));
        drawPencil(...ringPoint(spinAngle));
      } else if (!exitAt) {
        const p = now - loadedAt;
        const move = ease(clamp01((p - 150) / 700));
        const write = clamp01((p - 850) / 2300);

        if (p > 100 && countRef.current) countRef.current.dataset.out = "";
        drawTrail(spinAngle, TRAIL_MAX * (1 - clamp01(p / 700)));

        if (write === 0) {
          const [rx, ry] = ringPoint(spinAngle);
          drawPencil(lerp(rx, start0.x, move), lerp(ry, start0.y, move));
        } else {
          const e = easeSine(write);
          const pt = hello.getPointAtLength(len * e);
          hello.style.strokeDashoffset = `${1 - e}`;
          hello.style.opacity = "1";
          // A small rock of the wrist so the pencil doesn't look bolted on.
          drawPencil(pt.x, pt.y, Math.sin(e * Math.PI * 9) * 2.4);
        }

        if (p > 3350) {
          exitAt = now;
          exit();
        }
      }

      if (!exitAt) raf = requestAnimationFrame(tick);
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
      className="fixed inset-0 z-[300] grid cursor-pointer place-items-center overflow-hidden bg-bg text-fg"
      // Safety net: if JS never runs, still get out of the way.
      style={{ animation: "intro-exit 0.9s 12s cubic-bezier(0.7,0,0.2,1) forwards" }}
    >
      <style>{`
        @keyframes intro-exit { to { transform: translateY(-100%); visibility: hidden; } }
        @keyframes intro-hint { from { opacity: 0 } to { opacity: 1 } }
        #loop-intro [data-out] { opacity: 0; transform: translateY(-14px); }
      `}</style>

      <div className="relative w-[min(78vw,26rem)]">
        <div
          ref={countRef}
          className="absolute inset-x-0 bottom-[calc(100%+1.5rem)] text-center font-mono text-sm tabular-nums text-muted transition-[opacity,transform] duration-500 ease-out"
        >
          0
        </div>

        <svg ref={svgRef} viewBox="0 0 440 180" className="w-full overflow-visible" fill="none" aria-hidden>
          <g ref={trailRef} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-accent">
            {Array.from({ length: TRAIL_SEGMENTS }, (_, i) => (
              <path key={i} opacity={((i + 1) / TRAIL_SEGMENTS) ** 1.6 * 0.8} />
            ))}
          </g>
          <path
            ref={helloRef}
            d={HELLO}
            stroke="var(--accent)"
            strokeWidth={HELLO_STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            // Hidden until the pen touches down: a zero-length dash still paints a round cap.
            style={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}
          />
          <g ref={pencilRef} className="transition-opacity duration-300" style={{ filter: "drop-shadow(1px 5px 4px rgb(0 0 0 / 0.22))" }}>
            <PencilArt />
          </g>
        </svg>
      </div>

      <div ref={hintRef} className="absolute bottom-8 text-xs text-muted transition-opacity duration-300" style={{ animation: "intro-hint 0.6s 1.2s both" }}>
        click anywhere to skip
      </div>
    </div>
  );
}
