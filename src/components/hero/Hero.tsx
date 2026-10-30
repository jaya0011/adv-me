"use client";

import { ArrowDown, ArrowUpRight, Gamepad2 } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/portfolio";
import { HELLO, HELLO_STROKE } from "@/lib/pencil";

const WORDS = ["web apps", "mobile apps", "ecommerce stores", "SaaS platforms", "WordPress plugins", "HR systems", "APIs"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // the title hangs in space, then the camera flies straight through it
  const scale = useTransform(scrollYProgress, [0, 0.9], [1, 1.9]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.8], [1, 0]);
  const blur = useTransform(scrollYProgress, [0.3, 0.85], ["blur(0px)", "blur(14px)"]);
  const actions = useTransform(scrollYProgress, [0.05, 0.4], [1, 0]);

  return (
    <section ref={ref} id="top" data-chapter="top" className="relative h-[230vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="pointer-events-none flex items-start justify-between px-5 pt-20 font-mono text-[10px] uppercase leading-relaxed tracking-[0.24em] text-muted sm:px-8 lg:px-10">
          <p className="rise">
            Full-stack developer
            <br />
            Freelance · {profile.location.split(",")[0]}, IN
          </p>
          <p className="rise hidden text-right sm:block">
            31.6340° N · 74.8723° E
            <br />
            Web · iOS · Android
          </p>
        </div>

        <motion.div style={{ scale, opacity, filter: blur }} className="relative flex flex-1 flex-col items-center justify-center px-5 text-center">
          <span aria-hidden className="absolute left-1/2 top-1/2 h-[70%] w-[min(92vw,70rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(5_7_12/0.72),transparent)]" />
          <svg id="hero-hello" viewBox="0 0 440 180" className="relative w-28 overflow-visible text-accent sm:w-36" fill="none" aria-hidden>
            <path d={HELLO} stroke="currentColor" strokeWidth={HELLO_STROKE} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 aria-label={profile.name} className="poster relative mt-1 overflow-hidden whitespace-nowrap pb-[0.12em] text-[clamp(3.6rem,12.5vw,12.5rem)] tracking-[-0.055em]">
            {Array.from(profile.name).map((ch, i) => (
              <span key={i} aria-hidden className="rise inline-block whitespace-pre" style={{ ["--d" as string]: 120 + i * 45, ["--from" as string]: "108%" }}>
                {ch}
              </span>
            ))}
          </h1>
          <p className="rise relative mt-3 text-[clamp(1.25rem,2.4vw,2.2rem)] tracking-[-0.02em]" style={{ ["--d" as string]: 300 }}>
            <span className="text-fg/85">I build</span> <RoleTicker />
          </p>
        </motion.div>

        <motion.div style={{ opacity: actions }} className="flex flex-col items-center gap-5 pb-16 md:pb-14">
          <div className="rise flex flex-wrap justify-center gap-3" style={{ ["--d" as string]: 460 }}>
            <a href="#work" className="btn group">
              See the work
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a href="#arcade" className="btn btn-line group">
              <Gamepad2 className="h-4 w-4 text-accent transition-transform group-hover:rotate-12" />
              Play the arcade
            </a>
          </div>
          <p className="eyebrow flex items-center gap-2">
            <ArrowDown className="h-3 w-3 animate-bounce" /> Scroll to begin
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function RoleTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % WORDS.length), 2400);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="inline-block min-w-[9ch] text-left align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={WORDS[i]}
          className="mark inline-block whitespace-nowrap pr-1"
          initial={{ y: "40%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-40%", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.3 }}
        >
          {WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
