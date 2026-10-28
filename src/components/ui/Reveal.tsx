"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  index,
  kicker,
  title,
  sub,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <Reveal className="mb-12 md:mb-16">
      <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted">
        <span className="text-accent">{index}</span>
        <span className="h-px w-10 bg-line" />
        {kicker}
      </div>
      <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">{title}</h2>
      {sub && <p className="mt-5 max-w-2xl text-base text-muted md:text-lg">{sub}</p>}
    </Reveal>
  );
}

/** Tracks the pointer inside an element and exposes it as --mx / --my for the `spotlight` utility. */
export function trackSpotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}
