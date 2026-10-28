"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/store";
import type { GameProps } from "./registry";
import { readThemeColors, StartOverlay } from "./StartOverlay";

const LABELS = ["git init", "npm install", "lint", "unit tests", "build", "migrate db", "deploy", "monitor", "hotfix", "scale up", "cache", "v2.0", "ship it"];
const BLOCK_H = 30;
const BASE_W = 220;

type Block = { x: number; w: number; label: string; hue: number };
type Debris = { x: number; y: number; w: number; vy: number; vr: number; r: number; hue: number };

export default function DeployStack({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [floors, setFloors] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const theme = readThemeColors();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.min(wrapRef.current!.clientWidth, 440);
    const H = 540;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const baseW = Math.min(BASE_W, W * 0.6);
    const stack: Block[] = [{ x: (W - baseW) / 2, w: baseW, label: "localhost", hue: theme.hue }];
    const debris: Debris[] = [];
    let moving = { x: 0, w: baseW, dir: 1, speed: 2.4 };
    let camera = 0;
    let perfectStreak = 0;
    let over = false;
    let raf = 0;
    let fallY = -1;

    const nextBlock = () => {
      const top = stack[stack.length - 1];
      moving = { x: Math.random() < 0.5 ? -top.w : W, w: top.w, dir: 1, speed: Math.min(2.4 + stack.length * 0.14, 7.5) };
      moving.dir = moving.x < 0 ? 1 : -1;
    };
    nextBlock();

    const yFor = (i: number) => H - 70 - i * BLOCK_H;

    const drawBlock = (x: number, y: number, w: number, hue: number, label: string, alpha = 1) => {
      ctx.globalAlpha = alpha;
      const g = ctx.createLinearGradient(x, y, x, y + BLOCK_H);
      g.addColorStop(0, `hsl(${hue} 80% 66%)`);
      g.addColorStop(1, `hsl(${hue} 70% 50%)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(x, y, w, BLOCK_H - 3, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(x + 4, y + 2, Math.max(0, w - 8), 2);
      if (w > 60) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.font = "600 11px var(--font-jetbrains), monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x + w / 2, y + BLOCK_H / 2 - 1);
      }
      ctx.globalAlpha = 1;
    };

    const drop = () => {
      if (over) return;
      const top = stack[stack.length - 1];
      const left = Math.max(moving.x, top.x);
      const right = Math.min(moving.x + moving.w, top.x + top.w);
      const overlap = right - left;
      const hue = (theme.hue + stack.length * 11) % 360;
      const label = LABELS[(stack.length - 1) % LABELS.length];
      if (overlap <= 0) {
        over = true;
        fallY = yFor(stack.length);
        sfx("lose");
        window.setTimeout(() => onGameOver(stack.length - 1), 900);
        return;
      }
      if (Math.abs(moving.x - top.x) < 5) {
        perfectStreak++;
        let w = top.w;
        if (perfectStreak >= 3) w = Math.min(baseW, w + 14);
        stack.push({ x: top.x - (w - top.w) / 2, w, label, hue });
        sfx("perfect");
        setFlash(perfectStreak >= 3 ? "PERFECT ×" + perfectStreak + " · +width" : "PERFECT");
      } else {
        perfectStreak = 0;
        stack.push({ x: left, w: overlap, label, hue });
        const cutX = moving.x < top.x ? moving.x : right;
        debris.push({ x: cutX, y: yFor(stack.length - 1), w: moving.w - overlap, vy: 0, vr: (Math.random() - 0.5) * 0.08, r: 0, hue });
        sfx("drop");
        setFlash(null);
      }
      setFloors(stack.length - 1);
      nextBlock();
    };

    const frame = () => {
      // update
      if (!over) {
        moving.x += moving.speed * moving.dir;
        if (moving.x + moving.w > W + 40 && moving.dir > 0) moving.dir = -1;
        if (moving.x < -40 && moving.dir < 0) moving.dir = 1;
      }
      const targetCam = Math.max(0, stack.length * BLOCK_H - H * 0.5);
      camera += (targetCam - camera) * 0.08;

      // draw
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, `hsl(${(theme.hue + stack.length * 4) % 360} 60% 20% / 0.35)`);
      bg.addColorStop(1, "transparent");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(0, camera);
      // ground
      ctx.fillStyle = theme.line;
      ctx.fillRect(0, H - 40, W, 1);
      stack.forEach((b, i) => {
        const y = yFor(i);
        if (y + camera > -BLOCK_H && y + camera < H + BLOCK_H) drawBlock(b.x, y, b.w, b.hue, b.label);
      });
      if (!over) {
        drawBlock(moving.x, yFor(stack.length), moving.w, (theme.hue + stack.length * 11) % 360, LABELS[(stack.length - 1) % LABELS.length]);
      } else if (fallY > -1) {
        fallY += 6;
        drawBlock(moving.x, fallY, moving.w, (theme.hue + stack.length * 11) % 360, "💥", 0.7);
      }
      for (const d of debris) {
        d.vy += 0.5;
        d.y += d.vy;
        d.r += d.vr;
        ctx.save();
        ctx.translate(d.x + d.w / 2, d.y + BLOCK_H / 2);
        ctx.rotate(d.r);
        drawBlock(-d.w / 2, -BLOCK_H / 2, d.w, d.hue, "", 0.6);
        ctx.restore();
      }
      ctx.restore();
      while (debris.length && debris[0].y > H - camera + 200) debris.shift();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        drop();
      }
    };
    canvas.addEventListener("pointerdown", drop);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", drop);
      window.removeEventListener("keydown", onKey);
    };
  }, [playing, onGameOver]);

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-[440px] select-none">
      <div className="mb-3 flex items-center justify-between font-mono text-sm">
        <span>
          floors <b className="text-lg text-accent">{floors}</b>
        </span>
        <span className="text-accent-3">{flash}</span>
      </div>
      <div className="relative h-[540px] overflow-hidden rounded-2xl border border-line bg-bg-2">
        {!playing && (
          <StartOverlay
            emoji="🏗️"
            title="Deploy Stack"
            hint="Drop each stage of the pipeline right on top of the last one. Tap, click or press Space."
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
