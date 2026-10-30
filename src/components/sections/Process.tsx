"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { process } from "@/data/portfolio";
import { Eyebrow } from "../ui/Reveal";

/** Back into the dark: scrolling rides a comet once round the ∞, one project stage at a time. */
export function Process() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => setStep(Math.min(process.length - 1, Math.floor(p * process.length))));
  const s = process[step];

  return (
    <section ref={ref} id="process" data-chapter="process" className="relative h-[340vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden px-5 pb-14 pt-20 sm:px-8 lg:px-10">
        <Eyebrow numeral="VI">How a project runs, on loop</Eyebrow>

        <div className="relative flex flex-col items-center text-center">
          <span aria-hidden className="absolute left-1/2 top-1/2 h-[170%] w-[min(92vw,62rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(5_7_12/0.7),transparent)]" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={s.step} className="relative" initial={{ opacity: 0, y: 26, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -20, filter: "blur(8px)" }} transition={{ duration: 0.3 }}>
              <p className="poster text-[clamp(3.6rem,11vw,11rem)]">{s.step}</p>
              <p className="mt-2 text-lg text-muted">{s.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <ol className="mx-auto flex w-full max-w-2xl items-center justify-between font-mono text-xs">
          {process.map((p, i) => (
            <li key={p.step} className={`transition-colors duration-300 ${i === step ? "text-accent" : "text-muted/60"}`}>
              {String(i + 1).padStart(2, "0")}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
