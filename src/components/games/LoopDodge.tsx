"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/store";
import type { GameProps } from "./registry";
import { readThemeColors, StartOverlay } from "./StartOverlay";

type Enemy = { x: number; y: number; vx: number; vy: number; r: number; wobble: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };

export default function LoopDodge({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hud, setHud] = useState({ score: 0, time: 0, commits: 0 });

  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const theme = readThemeColors();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const S = Math.min(wrapRef.current!.clientWidth, 460);
    canvas.width = S * dpr;
    canvas.height = S * dpr;
    canvas.style.width = `${S}px`;
    canvas.style.height = `${S}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const C = S / 2;
    const R = S * 0.36;
    const PR = Math.max(7, S * 0.018);
    let angle = -Math.PI / 2;
    let dir = 1;
    let t = 0;
    let commits = 0;
    let spawnIn = 1.2;
    let enemies: Enemy[] = [];
    let sparks: Spark[] = [];
    let orb = { a: Math.PI / 2, pulse: 0 };
    const trail: { x: number; y: number }[] = [];
    let last = performance.now();
    let raf = 0;
    let dead = false;
    let hudTimer = 0;

    const burst = (x: number, y: number, color: string, n = 16) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 40 + Math.random() * 160;
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.6 + Math.random() * 0.4, color });
      }
    };

    const spawn = () => {
      const speed = 70 + Math.min(t * 3.2, 120) + Math.random() * 40;
      const pattern = t > 12 && Math.random() < 0.25 ? 3 : 1;
      const base = Math.random() * Math.PI * 2;
      for (let i = 0; i < pattern; i++) {
        const a = base + (i - (pattern - 1) / 2) * 0.32;
        enemies.push({ x: C, y: C, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: S * 0.016 + Math.random() * 3, wobble: Math.random() * 10 });
      }
    };

    const flip = () => {
      if (dead) return;
      dir *= -1;
      sfx("click");
    };

    const frame = (nowT: number) => {
      const dt = Math.min(0.033, (nowT - last) / 1000);
      last = nowT;

      if (!dead) {
        t += dt;
        const w = 2.1 + Math.min(t * 0.03, 1.4);
        angle += w * dir * dt;
        spawnIn -= dt;
        if (spawnIn <= 0) {
          spawn();
          spawnIn = Math.max(0.32, 1.05 - t * 0.022) * (0.75 + Math.random() * 0.5);
        }
      }

      const px = C + Math.cos(angle) * R;
      const py = C + Math.sin(angle) * R;
      trail.push({ x: px, y: py });
      if (trail.length > 18) trail.shift();

      enemies = enemies.filter((e) => {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.wobble += dt * 12;
        if (!dead && Math.hypot(e.x - px, e.y - py) < e.r + PR - 1) {
          dead = true;
          burst(px, py, theme.danger, 40);
          sfx("lose");
          const score = Math.floor(t * 5) + commits * 20;
          window.setTimeout(() => onGameOver(score, { time: Math.floor(t) }), 1000);
        }
        return Math.abs(e.x - C) < S && Math.abs(e.y - C) < S;
      });

      // orb (commit) pickup
      orb.pulse += dt * 4;
      const ox = C + Math.cos(orb.a) * R;
      const oy = C + Math.sin(orb.a) * R;
      if (!dead && Math.hypot(ox - px, oy - py) < PR + 10) {
        commits++;
        sfx("coin");
        burst(ox, oy, theme.accent2, 14);
        orb = { a: angle + Math.PI * (0.6 + Math.random() * 0.8) * (Math.random() < 0.5 ? 1 : -1), pulse: 0 };
      }

      sparks = sparks.filter((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.life -= dt;
        return s.life > 0;
      });

      // ---- draw ----
      ctx.clearRect(0, 0, S, S);

      // core glow
      const pulse = 1 + Math.sin(t * 3) * 0.08;
      const glow = ctx.createRadialGradient(C, C, 0, C, C, R * 0.7);
      glow.addColorStop(0, `${theme.danger}55`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = theme.bg2;
      ctx.strokeStyle = theme.danger;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(C, C, S * 0.07 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = theme.danger;
      ctx.font = `700 ${Math.round(S * 0.026)}px var(--font-jetbrains), monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("prod", C, C);

      // ring
      ctx.strokeStyle = theme.line;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
      ctx.lineDashOffset = -t * 20;
      ctx.beginPath();
      ctx.arc(C, C, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // orb
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(orb.pulse * 0.5);
      const os = 7 + Math.sin(orb.pulse) * 1.5;
      ctx.fillStyle = theme.accent2;
      ctx.shadowColor = theme.accent2;
      ctx.shadowBlur = 16;
      ctx.fillRect(-os, -os, os * 2, os * 2);
      ctx.restore();

      // enemies
      for (const e of enemies) {
        ctx.fillStyle = theme.danger;
        ctx.shadowColor = theme.danger;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
        // little legs
        ctx.shadowBlur = 0;
        ctx.strokeStyle = theme.danger;
        ctx.lineWidth = 1.5;
        const heading = Math.atan2(e.vy, e.vx);
        for (const side of [-1, 1]) {
          for (const k of [-0.6, 0, 0.6]) {
            const la = heading + side * (Math.PI / 2) + k + Math.sin(e.wobble + k) * 0.25;
            ctx.beginPath();
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(e.x + Math.cos(la) * (e.r + 4), e.y + Math.sin(la) * (e.r + 4));
            ctx.stroke();
          }
        }
      }
      ctx.shadowBlur = 0;

      // player trail + player
      if (!dead) {
        trail.forEach((p, i) => {
          ctx.globalAlpha = (i / trail.length) * 0.5;
          ctx.fillStyle = theme.accent;
          ctx.beginPath();
          ctx.arc(p.x, p.y, PR * (i / trail.length), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.fillStyle = theme.accent;
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(px, py, PR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = theme.fg;
        ctx.beginPath();
        ctx.arc(px, py, PR * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const s of sparks) {
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;

      hudTimer += dt;
      if (hudTimer > 0.1 && !dead) {
        hudTimer = 0;
        setHud({ score: Math.floor(t * 5) + commits * 20, time: t, commits });
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        flip();
      }
    };
    canvas.addEventListener("pointerdown", flip);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", flip);
      window.removeEventListener("keydown", onKey);
    };
  }, [playing, onGameOver]);

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-[460px] select-none">
      <div className="mb-3 flex items-center justify-between font-mono text-sm">
        <span>
          score <b className="text-lg text-accent">{hud.score}</b>
        </span>
        <span className="text-accent-2">◆ {hud.commits} commits</span>
        <span className={hud.time >= 30 ? "text-success" : ""}>{hud.time.toFixed(1)}s</span>
      </div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-bg-2">
        {!playing && (
          <StartOverlay
            emoji="🪐"
            title="Loop Dodge"
            hint="You orbit by yourself. Tap, click or press Space to reverse. Grab the ◆ commits and dodge the bugs."
            onStart={() => {
              sfx("click");
              setPlaying(true);
            }}
          />
        )}
        <canvas ref={canvasRef} className="block touch-none" />
      </div>
    </div>
  );
}
