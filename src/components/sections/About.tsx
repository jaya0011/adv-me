"use client";

import { animate, motion, useInView, useMotionValue, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { education, profile, strengths } from "@/data/portfolio";
import { dayKey, tipFor } from "@/lib/daily";
import { useHydrated } from "@/lib/store";
import { Eyebrow, LitText, Reveal, RiseWords } from "../ui/Reveal";

const STATS: [number, string, string][] = [
  [9, "+", "projects shipped"],
  [20, "+", "HR modules built"],
  [3, "", "platforms: web, iOS, Android"],
  [5, "", "arcade games below"],
];

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const lit = useTransform(scrollYProgress, [0.02, 0.86], [0, 1]);
  const textOut = useTransform(scrollYProgress, [0.9, 1], [1, 0]);
  const textY = useTransform(scrollYProgress, [0.9, 1], [0, -50]);

  return (
    <section id="about" data-chapter="about" className="relative">
      <div ref={ref} className="lg:h-[230vh]">
      <div className="mx-auto max-w-site lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center">
        <motion.div style={{ opacity: textOut, y: textY }} className="max-lg:panel mx-5 mt-24 p-5 sm:mx-8 sm:p-8 lg:mx-0 lg:mt-0 lg:w-[54%] lg:px-10 lg:py-0">
          <Eyebrow numeral="II">The spark</Eyebrow>
          <h2 className="poster mt-5 text-[clamp(2.6rem,5.6vw,5.6rem)]">
            <RiseWords text={["I", "turn", "ideas", "into"]} />
            <RiseWords text={["products", <span key="m" className="mark">people use.</span>]} delay={0.2} />
          </h2>
          <LitText text={profile.summary.join(" ")} progress={lit} className="mt-8 max-w-[44rem] text-[clamp(1.1rem,1.55vw,1.45rem)] leading-[1.5] tracking-[-0.01em]" />
        </motion.div>
      </div>
      </div>

      <div className="mx-auto max-w-site px-5 pb-24 pt-14 sm:px-8 lg:px-10 lg:pb-32 lg:pt-10">
        <div className="panel p-6 sm:p-8 lg:p-10">
          <dl className="grid grid-cols-2 gap-6 border-b border-line pb-8 lg:grid-cols-4">
            {STATS.map(([n, suffix, label]) => (
              <div key={label}>
                <dt className="poster text-[clamp(2.8rem,5vw,4.5rem)]">
                  <Count to={n} />
                  {suffix}
                </dt>
                <dd className="mt-1 max-w-[12rem] text-sm text-muted">{label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            <Reveal>
              <h3 className="eyebrow">Studying</h3>
              <ol className="mt-3">
                {education.map((e) => (
                  <li key={e.degree} className="border-t border-line py-3">
                    <p className="font-medium leading-snug tracking-[-0.01em]">{e.degree}</p>
                    <p className="text-sm text-muted">{e.school}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                      {e.current && <span className="h-1.5 w-1.5 rounded-full bg-accent text-accent animate-pulse-ring" />}
                      {e.status}
                    </p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.08}>
              <h3 className="eyebrow">What I bring</h3>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                {strengths.map((s) => (
                  <li key={s} className="border-t border-line py-1.5 text-sm">
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.16} className="flex flex-col justify-between gap-6">
              <p className="font-hand text-[1.6rem] leading-snug">&ldquo;{profile.goal}&rdquo;</p>
              <TipOfTheDay />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Counts up the first time it comes into view. */
function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => String(Math.round(v)));
  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, to, value]);
  return <motion.span ref={ref}>{text}</motion.span>;
}

function TipOfTheDay() {
  const hydrated = useHydrated();
  return (
    <aside className="rounded-xl border border-line bg-surface p-4">
      <p className="eyebrow">Dev tip of the day</p>
      <p className="mt-2 text-sm leading-snug">{hydrated ? tipFor(dayKey()) : "…"}</p>
      <p className="mt-1.5 text-xs text-muted">A new one tomorrow.</p>
    </aside>
  );
}
