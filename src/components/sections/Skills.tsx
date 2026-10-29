"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { skillGroups } from "@/data/portfolio";
import { sfx } from "@/lib/store";
import { Reveal, SectionHeading } from "../ui/Reveal";

export function Skills() {
  const [active, setActive] = useState(0);
  const group = skillGroups[active];

  return (
    <section id="skills" className="relative mx-auto max-w-site px-4 py-28 sm:px-6 md:py-36 lg:px-10">
      <SectionHeading
        index="02"
        kicker="Skills"
        title={
          <>
            One developer, <span className="text-gradient">the whole stack.</span>
          </>
        }
        sub="Pick a category and its skills move into orbit. Hover the orbit to pause it."
      />

      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="flex flex-col gap-2" role="tablist" aria-label="Skill categories">
            {skillGroups.map((g, i) => (
              <button
                key={g.id}
                role="tab"
                aria-selected={i === active}
                onClick={() => {
                  setActive(i);
                  sfx("click");
                }}
                className={`group relative flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                  i === active ? "border-accent/50 bg-accent/10" : "border-line bg-surface hover:border-line hover:bg-surface-2"
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="flex-1">
                  <span className="block font-display text-lg font-semibold">{g.label}</span>
                  <span className="block text-sm text-muted">{g.blurb}</span>
                </span>
                <span className={`font-mono text-xs ${i === active ? "text-accent" : "text-muted"}`}>
                  {String(g.skills.length).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="orbit relative mx-auto aspect-square w-[80%] max-w-[520px] sm:w-full [container-type:inline-size]">
            {/* rings */}
            <div className="absolute inset-[4%] rounded-full border border-dashed border-line" />
            <div className="absolute inset-[20%] rounded-full border border-line" />
            <div className="absolute inset-[34%] rounded-full bg-gradient-to-br from-accent/20 to-accent-3/10 blur-2xl" />

            {/* core */}
            <div className="absolute inset-[34%] grid place-items-center rounded-full border border-line bg-bg-2/80 text-center backdrop-blur">
              <AnimatePresence mode="wait">
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-4xl">{group.emoji}</div>
                  <div className="mt-1 font-display text-sm font-bold sm:text-base">{group.label}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* orbiting skills */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={group.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="orbit-spin absolute inset-0">
                  {group.skills.map((s, i) => {
                    const angle = (360 / group.skills.length) * i - 90;
                    const radius = i % 2 === 0 ? 40 : 31;
                    return (
                      <div
                        key={s}
                        className="absolute left-1/2 top-1/2"
                        style={{ transform: `rotate(${angle}deg) translateX(${radius}cqw) rotate(${-angle}deg) translate(-50%, -50%)` }}
                      >
                        <div className="orbit-counter">
                          <span className="block whitespace-nowrap rounded-full border border-line bg-bg/80 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur transition hover:scale-110 hover:border-accent hover:text-accent sm:text-sm">
                            {s}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
