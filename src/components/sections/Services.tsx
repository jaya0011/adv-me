"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { services } from "@/data/portfolio";
import { Eyebrow, Reveal, RiseWords } from "../ui/Reveal";

const TICKER = ["Websites", "Web apps", "Android", "iOS", "WordPress", "Ecommerce", "APIs", "Databases"];

/** The one daylight chapter: after the tunnel, the whole page opens up into paper. */
export function Services() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const side = useTransform(scrollYProgress, [0, 1], [9, 0]);
  const round = useTransform(scrollYProgress, [0, 1], [56, 0]);
  const clipPath = useTransform([side, round], ([s, r]) => `inset(0 ${s}% 0 ${s}% round ${r}px ${r}px 0 0)`);

  return (
    <motion.section ref={ref} id="services" data-chapter="services" style={{ clipPath }} className="tone-light relative z-20 bg-bg text-fg">
      <div aria-hidden className="overflow-hidden border-b border-line py-4">
        <div className="animate-marquee flex w-max">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="poster px-6 text-[clamp(1.6rem,3vw,2.6rem)] text-fg/30">
              {t} <span className="mark ml-10">∞</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-site px-5 py-24 sm:px-8 md:py-32 lg:px-10">
        <Eyebrow numeral="V">Services</Eyebrow>
        <h2 className="poster mt-5 text-[clamp(3rem,9vw,9.5rem)]">
          <RiseWords text={["What", "I", "can"]} />
          <RiseWords text={[<span key="m" className="mark">build for you.</span>]} delay={0.15} />
        </h2>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-xl">
            <p className="text-lg leading-relaxed text-muted">
              For businesses, startups and individuals: one developer who can take your project from the first call to launch day and keep it running afterwards.
            </p>
          </Reveal>
          <Reveal>
            <a href="#contact" className="btn group">
              Start a project
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>

        <ol className="mt-16 border-t border-line">
          {services.map((s, i) => (
            <li key={s.title}>
              <Reveal y={16}>
                <div className="group relative grid grid-cols-[2.5rem_1fr] items-baseline gap-x-3 overflow-hidden border-b border-line py-5 md:grid-cols-[4rem_1.1fr_1fr] md:py-6">
                  <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-fg transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
                  <span className="relative pl-1 font-mono text-xs text-muted transition-colors duration-300 group-hover:text-bg/60">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="poster relative text-[clamp(1.6rem,3vw,2.75rem)] transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:text-bg">{s.title}</h3>
                  <p className="relative col-start-2 mt-1 pr-4 text-muted transition-colors duration-300 group-hover:text-bg/75 md:col-start-3 md:mt-0">{s.desc}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </motion.section>
  );
}
