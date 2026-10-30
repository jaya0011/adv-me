"use client";

import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { setLenis } from "@/lib/scroll";

// three.js is heavy and browser-only, so it loads after the page and never on the server.
const World = dynamic(() => import("./World"), { ssr: false });

const CHAPTERS = [
  { id: "top", numeral: "I", name: "Origin" },
  { id: "about", numeral: "II", name: "The spark" },
  { id: "skills", numeral: "III", name: "The stack" },
  { id: "work", numeral: "IV", name: "The work" },
  { id: "services", numeral: "V", name: "Services" },
  { id: "process", numeral: "VI", name: "The loop" },
  { id: "arcade", numeral: "VII", name: "Arcade" },
  { id: "contact", numeral: "VIII", name: "Contact" },
];

/** The smooth-scroll engine, the 3D world, and the small instrument readout over them. */
export function Stage() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.9, anchors: { duration: 1.6 } });
    setLenis(lenis);
    // Drawers and game modals lock the body; the scroller has to stand down with them.
    const mo = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => {
      mo.disconnect();
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <World />
      <Readout />
    </>
  );
}

function Readout() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.scrollY + window.innerHeight * 0.5;
      let at = 0;
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= mid) at = i;
      });
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setIndex(at);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const c = CHAPTERS[index];
  const light = c.id === "services";
  return (
    <div aria-hidden className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden items-end justify-between px-6 pb-5 font-mono text-[10px] uppercase tracking-[0.28em] transition-colors duration-300 md:flex ${light ? "text-black/55" : "text-white/55"}`}>
      <span>
        <span className={light ? "text-black/85" : "text-white/90"}>{c.numeral}</span>
        <span className="mx-3 inline-block h-px w-8 bg-current align-middle opacity-50" />
        {c.name}
      </span>
      <span className="flex items-center gap-3 tabular-nums">
        <span className="relative block h-px w-28 bg-current/25">
          <span className="absolute inset-y-0 left-0 bg-current" style={{ width: `${progress * 100}%` }} />
        </span>
        {String(Math.round(progress * 100)).padStart(3, "0")}
      </span>
    </div>
  );
}
