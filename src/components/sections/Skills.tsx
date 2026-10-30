"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { skillGroups } from "@/data/portfolio";
import { worldState } from "@/lib/scroll";
import { Eyebrow, RiseWords } from "../ui/Reveal";

export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(skillGroups.length - 1, Math.floor(p * skillGroups.length));
    worldState.layer = i;
    setActive(i);
  });

  const g = skillGroups[active];

  return (
    <section ref={ref} id="skills" data-chapter="skills" className="relative lg:h-[520vh]">
      {/* Desktop: pinned, the camera descends the plates while one layer of text answers it. */}
      <div className="sticky top-0 mx-auto hidden h-[100svh] max-w-site items-center px-10 lg:flex">
        <div className="w-[46%]">
          <Eyebrow numeral="III">The stack</Eyebrow>
          <h2 className="poster mt-5 text-[clamp(2.6rem,4.8vw,4.8rem)]">
            <RiseWords text={["One", "developer,"]} />
            <RiseWords text={[<span key="m" className="mark">the whole stack.</span>]} delay={0.15} />
          </h2>

          <ol className="mt-9 flex items-center gap-2" aria-hidden>
            {skillGroups.map((s, i) => (
              <li key={s.id} className={`h-px flex-1 transition-colors duration-300 ${i <= active ? "bg-accent" : "bg-line"}`} />
            ))}
          </ol>

          <div className="relative mt-7 min-h-[15rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={g.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                <p className="font-mono text-xs text-accent">
                  LAYER {String(active + 1).padStart(2, "0")} / {String(skillGroups.length).padStart(2, "0")}
                </p>
                <h3 className="poster mt-2 text-[2.6rem]">{g.label}</h3>
                <p className="mt-2 text-lg text-muted">{g.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {g.skills.map((s) => (
                    <li key={s} className="rounded-full border border-line px-3 py-1 text-sm">
                      {s}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Phones: every layer readable in sequence. */}
      <div className="px-5 py-20 sm:px-8 lg:hidden">
        <Eyebrow numeral="III">The stack</Eyebrow>
        <h2 className="poster mt-5 text-[clamp(2.6rem,9vw,4rem)]">
          One developer, <span className="mark">the whole stack.</span>
        </h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {skillGroups.map((s, i) => (
            <article key={s.id} className="panel p-5">
              <p className="font-mono text-xs text-accent">LAYER {String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 text-xl font-medium tracking-[-0.02em]">{s.label}</h3>
              <p className="mt-1 text-sm text-muted">{s.blurb}</p>
              <p className="mt-3 text-sm leading-relaxed">{s.skills.join(" · ")}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
