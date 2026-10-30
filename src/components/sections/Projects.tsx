"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { categories, projects, type Category, type Project } from "@/data/portfolio";
import { openedProject, sfx, useHydrated, useLoop } from "@/lib/store";
import { ICONS } from "../ui/icons";
import { Eyebrow } from "../ui/Reveal";

const domainOf = (url?: string) => (url ? url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "private build");
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Eases each step so a project holds still in front of you before the next rushes in. */
const hold = (v: number) => {
  const whole = Math.floor(v);
  const f = v - whole;
  const k = clamp((f - 0.5) / 0.5, 0, 1);
  return whole + k * k * (3 - 2 * k);
};

export function Projects() {
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const shown = projects.filter((p) => filter === "All" || p.categories.includes(filter));

  const open = useCallback((id: string) => {
    setOpenId(id);
    openedProject(id);
    sfx("flip");
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => open((e as CustomEvent<string>).detail);
    window.addEventListener("loop:project", onOpen);
    return () => window.removeEventListener("loop:project", onOpen);
  }, [open]);

  return (
    <section id="work" data-chapter="work" className="relative">
      <Flight key={filter} shown={shown} filter={filter} setFilter={setFilter} onOpen={open} />
      <AnimatePresence>{openId && <ProjectDrawer id={openId} onClose={() => setOpenId(null)} onNavigate={open} />}</AnimatePresence>
    </section>
  );
}

/** Scroll flies you down the tunnel; each project comes out of the dark and goes past you. */
function Flight({
  shown,
  filter,
  setFilter,
  onOpen,
}: {
  shown: Project[];
  filter: "All" | Category;
  setFilter: (c: "All" | Category) => void;
  onOpen: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const place = useCallback(
    (p: number) => {
      const n = shown.length;
      const at = hold(p * Math.max(0, n - 1) * 0.9999);
      cards.current.forEach((el, i) => {
        if (!el) return;
        const f = at - i; // <0 still ahead in the dark, 0 in front of you, >0 gone past
        const side = i % 2 ? 1 : -1;
        const z = f < 0 ? f * 1500 : f * 1300;
        const x = clamp(-f, 0, 2) * side * 22;
        const rot = clamp(f, -1, 1) * side * -16;
        const fade = f < 0 ? clamp(1 + f / 2.4, 0, 1) : clamp(1 - f / 0.55, 0, 1);
        el.style.transform = `translate(-50%, -50%) translate3d(${x}vw, ${Math.abs(f) * 2}vh, ${z}px) rotateY(${rot}deg)`;
        el.style.opacity = String(fade);
        el.style.pointerEvents = Math.abs(f) < 0.4 ? "auto" : "none";
        el.style.visibility = fade <= 0.001 ? "hidden" : "visible";
        el.style.zIndex = String(100 - Math.round(Math.abs(f) * 10));
      });
      setCurrent(clamp(Math.round(at), 0, n - 1));
    },
    [shown.length],
  );

  useMotionValueEvent(scrollYProgress, "change", place);
  useEffect(() => {
    // first paint, and every time a filter swaps the deck
    const id = requestAnimationFrame(() => place(scrollYProgress.get()));
    return () => cancelAnimationFrame(id);
  }, [place, scrollYProgress]);

  const p = shown[current];

  return (
    <div ref={ref} className="relative" style={{ height: `${shown.length * 95 + 60}vh` }}>
      <div
        className="sticky top-0 h-[100svh] overflow-hidden"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const s = e.currentTarget.style;
          s.setProperty("--tx", ((e.clientX / window.innerWidth - 0.5) * 9).toFixed(2));
          s.setProperty("--ty", ((e.clientY / window.innerHeight - 0.5) * -7).toFixed(2));
          s.setProperty("--sx", `${((e.clientX / window.innerWidth) * 100).toFixed(1)}%`);
          s.setProperty("--sy", `${((e.clientY / window.innerHeight) * 100).toFixed(1)}%`);
        }}
      >
        <div className="absolute inset-x-0 top-0 z-[200] flex flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-gradient-to-b from-bg via-bg/70 to-transparent px-5 pb-8 pt-20 sm:px-8 lg:px-10">
          <Eyebrow numeral="IV">The work</Eyebrow>
          <div className="flex flex-wrap items-center gap-0.5">
            <LayoutGroup>
              {categories.map((c) => (
                <button key={c} onClick={() => setFilter(c)} className={`relative isolate rounded-full px-3 py-1 text-sm transition-colors ${filter === c ? "text-bg" : "text-muted hover:text-fg"}`}>
                  {filter === c && <motion.span layoutId="filter-pill" className="absolute inset-0 -z-10 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  {c}
                </button>
              ))}
            </LayoutGroup>
          </div>
        </div>

        <div className="absolute inset-0" style={{ perspective: "1100px", transformStyle: "preserve-3d" }}>
          {shown.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => {
                cards.current[i] = el;
              }}
              className="absolute left-1/2 top-[46%] w-[min(88vw,62vh*1.6,60rem)] will-change-transform"
            >
              <button
                onClick={() => onOpen(project.id)}
                aria-label={`Open the ${project.name} case file`}
                className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-bg-2 text-left shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9),0_0_0_1px_var(--line)] transition-transform duration-500 ease-out"
                style={{ transform: "rotateY(calc(var(--tx, 0) * 1deg)) rotateX(calc(var(--ty, 0) * 1deg))" }}
              >
                <Cover project={project} sizes="(max-width: 1024px) 90vw, 60rem" eager />
                {/* a sheen of light that slides across the glass as the card turns */}
                <span aria-hidden className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light" style={{ background: "radial-gradient(40rem circle at var(--sx, 50%) var(--sy, 30%), rgb(255 255 255 / 0.45), transparent 60%)" }} />
                <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35">
                  <span className="translate-y-2 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Open case file
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[200] flex items-end justify-between gap-6 bg-gradient-to-t from-bg via-bg/70 to-transparent px-5 pb-14 pt-16 sm:px-8 md:pb-12 lg:px-10">
          {p && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={p.id} className="min-w-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                <p className="font-mono text-xs text-accent">
                  {String(current + 1).padStart(2, "0")} / {String(shown.length).padStart(2, "0")} · {p.type}
                </p>
                <h3 className="poster mt-1 text-[clamp(1.9rem,5vw,4.5rem)]">{p.name}</h3>
              </motion.div>
            </AnimatePresence>
          )}
          <div className="flex shrink-0 items-center gap-4">
            <CaseCounter />
            {p && (
              <button onClick={() => onOpen(p.id)} aria-label={`Open the ${p.name} case file`} className="btn max-sm:!px-3">
                <span className="hidden sm:inline">Case file</span> <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseCounter() {
  const hydrated = useHydrated();
  const opened = useLoop((s) => s.projectsOpened.length);
  if (!hydrated) return null;
  return (
    <span className="hidden font-mono text-xs text-muted md:block">
      {opened}/{projects.length} opened
    </span>
  );
}

function Cover({ project: p, sizes, priority, eager }: { project: Project; sizes: string; priority?: boolean; eager?: boolean }) {
  if (p.shot) {
    return <Image src={p.shot} alt={`${p.name}, ${p.type.toLowerCase()}`} fill sizes={sizes} preload={priority} loading={eager ? "eager" : undefined} className="object-cover object-top" />;
  }
  const Icon = ICONS[p.icon];
  const { bg, fg } = p.poster ?? { bg: "#0c1118", fg: "#e9eef6" };
  return (
    <span className="absolute inset-0 flex flex-col justify-between overflow-hidden p-[5cqw] [container-type:size]" style={{ background: bg, color: fg }}>
      <span className="relative z-10 max-w-[70%] text-[max(0.85rem,1.9cqw)] font-medium leading-snug opacity-80">{p.tagline}</span>
      {Icon && <Icon aria-hidden strokeWidth={0.6} className="absolute -right-[4cqw] -top-[8cqh] h-[62cqh] w-[62cqh] opacity-20" />}
      <span className="poster relative z-10 text-[min(13cqw,32cqh)]">
        {p.name.split(" ").map((w) => (
          <span key={w} className="block">
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}

function ProjectDrawer({ id, onClose, onNavigate }: { id: string; onClose: () => void; onNavigate: (id: string) => void }) {
  const idx = projects.findIndex((p) => p.id === id);
  const p = projects[idx];
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(next.id);
      if (e.key === "ArrowLeft") onNavigate(prev.id);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, onNavigate, next.id, prev.id]);

  if (!p) return null;

  return (
    <motion.div className="fixed inset-0 z-[300] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-label={`${p.name} case file`}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-line bg-bg-2 text-fg shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="eyebrow">
            Case file {idx + 1} / {projects.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => onNavigate(prev.id)} className="grid h-9 w-9 place-items-center rounded-md hover:bg-surface-2" aria-label="Previous project">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => onNavigate(next.id)} className="grid h-9 w-9 place-items-center rounded-md hover:bg-surface-2" aria-label="Next project">
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="ml-1 grid h-9 w-9 place-items-center rounded-md bg-fg text-bg" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            data-lenis-prevent
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="flex-1 overflow-y-auto"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-bg">
              <Cover project={p} sizes="(max-width: 768px) 100vw, 42rem" priority />
            </div>
            <div className="p-6 sm:p-10">
              <p className="text-muted">{p.type}</p>
              <h3 className="poster mt-1 text-[clamp(2.4rem,5vw,3.5rem)]">{p.name}</h3>
              <p className="mt-5 text-lg leading-relaxed">{p.overview}</p>

              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn mt-7">
                  Visit {domainOf(p.url)} <ArrowUpRight className="h-4 w-4" />
                </a>
              )}

              <h4 className="eyebrow mb-2 mt-10">Key features</h4>
              <ul>
                {p.features.map((f) => (
                  <li key={f} className="border-t border-line py-2">
                    {f}
                  </li>
                ))}
              </ul>

              {p.roadmap && (
                <>
                  <h4 className="eyebrow mb-2 mt-10">On the roadmap</h4>
                  <ul>
                    {p.roadmap.map((f) => (
                      <li key={f} className="border-t border-dashed border-line py-2 text-muted">
                        {f}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {p.contribution && (
                <>
                  <h4 className="eyebrow mb-2 mt-10">My contribution</h4>
                  <p className="leading-relaxed">{p.contribution}</p>
                </>
              )}

              {p.tech.length > 0 && (
                <>
                  <h4 className="eyebrow mb-2 mt-10">Built with</h4>
                  <p className="font-mono text-sm leading-loose">{p.tech.join(" · ")}</p>
                </>
              )}

              <button onClick={() => onNavigate(next.id)} className="group/next mt-12 flex w-full items-end justify-between border-t border-line pt-5 text-left">
                <span>
                  <span className="eyebrow block">Next up</span>
                  <span className="poster mt-1 block text-3xl">{next.name}</span>
                </span>
                <ArrowRight className="mb-1 h-5 w-5 transition-transform group-hover/next:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.aside>
    </motion.div>
  );
}
