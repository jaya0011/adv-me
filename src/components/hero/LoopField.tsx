"use client";

import { useEffect, useRef } from "react";

type Particle = {
  t: number;
  speed: number;
  offset: number;
  size: number;
  color: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

function readPalette() {
  const css = getComputedStyle(document.documentElement);
  return {
    colors: ["--accent", "--accent-2", "--accent-3"].map((v) => css.getPropertyValue(v).trim()),
    blend: (css.getPropertyValue("--blend").trim() || "lighter") as GlobalCompositeOperation,
  };
}

/** Particles streaming around a lemniscate (∞), pushed around by the pointer. */
export function LoopField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let palette = readPalette();
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = w < 640 ? 300 : 620;
      particles = Array.from({ length: count }, () => {
        const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        return {
          t: Math.random() * Math.PI * 2,
          speed: 0.12 + Math.random() * 0.18,
          offset: g * (w < 640 ? 22 : 34),
          size: Math.random() < 0.08 ? 2.2 : 0.6 + Math.random() * 1.2,
          color: Math.floor(Math.random() * 3),
          x: w / 2,
          y: h / 2,
          vx: 0,
          vy: 0,
        };
      });
    };

    const target = (p: Particle, time: number) => {
      const mobile = w < 768;
      const cx = mobile ? w * 0.5 : w * 0.7;
      const cy = mobile ? Math.min(h * 0.3, window.innerHeight * 0.24) : h * 0.5;
      const a = (mobile ? Math.min(w * 0.46, 220) : Math.min(w * 0.3, h * 0.62, 460)) * (1 + 0.025 * Math.sin(time * 0.6));
      const t = p.t;
      const s = Math.sin(t);
      const c = Math.cos(t);
      const d = 1 + s * s;
      const x = (a * c) / d;
      const y = (a * s * c) / d;
      // normal direction for band thickness
      const dt = 0.01;
      const s2 = Math.sin(t + dt);
      const c2 = Math.cos(t + dt);
      const d2 = 1 + s2 * s2;
      const tx = (a * c2) / d2 - x;
      const ty = (a * s2 * c2) / d2 - y;
      const len = Math.hypot(tx, ty) || 1;
      const wobble = Math.sin(time * 1.3 + p.t * 5) * 4;
      return { x: cx + x + (-ty / len) * (p.offset + wobble), y: cy + y + (tx / len) * (p.offset + wobble) };
    };

    const draw = (now: number) => {
      const time = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = palette.blend;
      for (const p of particles) {
        if (!reduce) p.t += p.speed * 0.016;
        const tg = target(p, time);
        let ax = (tg.x - p.x) * 0.06;
        let ay = (tg.y - p.y) * 0.06;
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 140 * 140) {
            const f = (1 - Math.sqrt(dist2) / 140) * 3.2;
            const inv = 1 / (Math.sqrt(dist2) || 1);
            ax += dx * inv * f;
            ay += dy * inv * f;
          }
        }
        p.vx = (p.vx + ax) * 0.82;
        p.vy = (p.vy + ay) * 0.82;
        p.x += p.vx;
        p.y += p.vy;
        ctx.globalAlpha = p.size > 2 ? 0.95 : 0.65;
        ctx.fillStyle = palette.colors[p.color];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      draw(now);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };

    resize();
    // settle particles onto the curve before first paint
    for (const p of particles) {
      const tg = target(p, 0);
      p.x = tg.x;
      p.y = tg.y;
    }
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = mouse.y > 0 && mouse.y < r.height;
    };
    const onLeave = () => (mouse.active = false);
    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && !reduce) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      palette = readPalette();
      if (reduce) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(performance.now());
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
