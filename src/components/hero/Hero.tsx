"use client";

import { ArrowDown, ArrowUpRight, Gamepad2, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { allTech, profile } from "@/data/portfolio";
import { openPalette, useHydrated, useLoop } from "@/lib/store";
import { LoopField } from "./LoopField";

const WORDS = ["web apps", "mobile apps", "ecommerce stores", "SaaS platforms", "WordPress plugins", "HR systems", "APIs"];

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
      <LoopField />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-[44vh] sm:px-6 md:pt-28">
        <VisitorLine />

        <h1 className="font-display font-extrabold leading-[0.82] tracking-[-0.04em]">
          <motion.span
            className="block text-[clamp(4.2rem,15vw,11.5rem)]"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease }}
          >
            {profile.firstName}
          </motion.span>
          <motion.span
            className="block text-[clamp(4.2rem,15vw,11.5rem)]"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.28, ease }}
          >
            <span className="text-outline hover:text-gradient">{profile.lastName}</span>
            <span className="text-accent">.</span>
          </motion.span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
          className="mt-8 max-w-xl"
        >
          <p className="font-display text-2xl font-medium leading-snug sm:text-3xl">
            Full-stack developer.
            <br />I build <RoleTicker />
          </p>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Freelance developer from Amritsar, now doing an MSc in Computer Science at GNDU. I work across the whole stack: Next.js
            frontends, NestJS APIs, React Native apps and custom WordPress builds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <a
            href="#work"
            className="group inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3.5 text-sm font-semibold text-bg transition hover:scale-[1.03]"
          >
            See my work
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            href="#arcade"
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:border-accent"
          >
            <Gamepad2 className="h-4 w-4 text-accent transition-transform group-hover:rotate-12" />
            Play the arcade
          </a>
          <button
            onClick={openPalette}
            className="hidden items-center gap-2 px-3 py-3.5 font-mono text-xs text-muted transition hover:text-fg sm:inline-flex"
          >
            or press <kbd className="rounded-md border border-line px-1.5 py-0.5">Ctrl</kbd>
            <kbd className="rounded-md border border-line px-1.5 py-0.5">K</kbd>
          </button>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-14 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"
        >
          {[
            ["9+", "projects shipped"],
            ["20+", "HR modules built"],
            ["3", "platforms: web, iOS, Android"],
            ["5", "arcade games below"],
          ].map(([n, l]) => (
            <div key={l} className="border-l border-line pl-4">
              <dt className="font-display text-3xl font-bold">{n}</dt>
              <dd className="text-xs leading-snug text-muted">{l}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <StatusCard />

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted md:flex"
      >
        scroll
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}

function RoleTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={WORDS[i]}
          className="inline-block whitespace-nowrap pb-1"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          {/* gradient lives on a child: Chrome drops background-clip:text on the animated layer itself */}
          <span className="text-gradient">{WORDS[i]}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function VisitorLine() {
  const hydrated = useHydrated();
  const visits = useLoop((s) => s.visits);
  const streak = useLoop((s) => s.streak);
  let text = "booting the loop…";
  if (hydrated && visits > 0) {
    text = visits === 1 ? "loop #1 · first time here? welcome 👋" : `welcome back · this is loop #${visits}`;
    if (streak > 1) text += ` · 🔥 ${streak}-day streak`;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] text-muted backdrop-blur"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-ring" />
      {text}
    </motion.div>
  );
}

function StatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 1.1, ease }}
      className="glass animate-float absolute bottom-24 right-6 hidden w-64 rounded-2xl p-4 xl:block"
    >
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> available for freelance
      </div>
      <p className="mt-3 text-sm font-semibold">Currently: MSc Computer Science @ GNDU</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
        <MapPin className="h-3 w-3" /> {profile.location}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {allTech.slice(0, 5).map((t) => (
          <span key={t} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function TechMarquee() {
  const row = [...allTech, ...allTech];
  return (
    <div className="relative overflow-hidden border-y border-line py-5 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="animate-marquee flex w-max gap-10" style={{ ["--marquee-duration" as string]: "45s" }}>
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-xl font-semibold text-muted sm:text-2xl">
            {t}
            <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
