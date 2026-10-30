"use client";

import { motion, useMotionValueEvent, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 24,
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
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** "III ——— The stack": the little instrument label above each chapter. */
export function Eyebrow({ numeral, children }: { numeral: string; children: ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-3">
      <span className="text-accent">{numeral}</span>
      <span className="h-px w-8 bg-current opacity-40" />
      {children}
    </p>
  );
}

/** Words that rise out of their own baseline, one after another, as they enter view. */
export function RiseWords({ text, className, delay = 0 }: { text: ReactNode[]; className?: string; delay?: number }) {
  return (
    <motion.span className={`block ${className ?? ""}`} initial="hide" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
      {text.map((word, i) => (
        <span key={i} className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{ hide: { y: "115%" }, show: { y: 0 } }}
            transition={{ duration: 1.05, delay: delay + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
            {i < text.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Body copy that inks itself in, word by word, against a scroll progress. */
export function LitText({ text, progress, className }: { text: string; progress: MotionValue<number>; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useMotionValueEvent(progress, "change", (v) => ref.current?.style.setProperty("--p", v.toFixed(4)));
  const words = text.split(" ");
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="lit" style={{ ["--i" as string]: (i / words.length).toFixed(4) }}>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}
