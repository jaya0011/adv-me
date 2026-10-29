"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { categories, projects, type Category, type Project } from "@/data/portfolio";
import { openedProject, sfx, useHydrated, useLoop } from "@/lib/store";
import { ICONS } from "../ui/icons";
import { Reveal, SectionHeading, trackSpotlight } from "../ui/Reveal";

const domainOf = (url?: string) => (url ? url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "private build");

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
    <section id="work" className="relative mx-auto max-w-site px-4 py-28 sm:px-6 md:py-36 lg:px-10">
      <SectionHeading
        index="03"
        kicker="Selected work"
        title={
          <>
            Things I&apos;ve <span className="text-gradient">built and shipped.</span>
          </>
        }
        sub="Ecommerce, SaaS, healthcare, edtech and business websites. Open any card for the full case file."
      />

      <Reveal>
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <LayoutGroup>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${filter === c ? "text-on-accent" : "text-muted hover:text-fg"}`}
              >
                {filter === c && (
                  <motion.span layoutId="filter-pill" className="absolute inset-0 -z-10 rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                {c}
              </button>
            ))}
          </LayoutGroup>
          <CaseCounter />
        </div>
      </Reveal>

      <motion.div layout className="grid grid-flow-dense gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={projects.indexOf(p)} delay={i * 0.04} onOpen={() => open(p.id)} />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {openId && <ProjectDrawer id={openId} onClose={() => setOpenId(null)} onNavigate={open} />}
      </AnimatePresence>
    </section>
  );
}

function CaseCounter() {
  const hydrated = useHydrated();
  const opened = useLoop((s) => s.projectsOpened.length);
  if (!hydrated) return null;
  return (
    <span className="ml-auto font-mono text-xs text-muted">
      case files opened: <span className="text-accent">{opened}</span>/{projects.length}
    </span>
  );
}

function ProjectCard({ project: p, index, delay, onOpen }: { project: Project; index: number; delay: number; onOpen: () => void }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const opened = useLoop((s) => s.projectsOpened.includes(p.id));
  const hydrated = useHydrated();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={p.featured ? "lg:col-span-2" : ""}
      style={{ perspective: 1200 }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
        onPointerMove={(e) => {
          trackSpotlight(e);
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -6, y: ((e.clientX - r.left) / r.width - 0.5) * 8 });
        }}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        className="card spotlight group flex h-full cursor-pointer flex-col overflow-hidden transition-[transform,border-color] duration-300 ease-out hover:border-accent/40"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <ProjectCover project={p} index={index} tall={p.featured} />
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            <span>{p.type}</span>
            {hydrated && opened && <span className="text-accent">✓ read</span>}
          </div>
          <h3 className="font-display text-2xl font-bold tracking-tight">{p.name}</h3>
          <p className="mt-2 text-sm text-muted">{p.tagline}</p>
          {p.tech.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {p.tech.slice(0, p.featured ? 6 : 3).map((t) => (
                <li key={t} className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                  {t}
                </li>
              ))}
              {p.tech.length > (p.featured ? 6 : 3) && (
                <li className="rounded-md px-1 py-0.5 font-mono text-[11px] text-muted">+{p.tech.length - (p.featured ? 6 : 3)}</li>
              )}
            </ul>
          )}
          <div className="mt-auto flex items-center justify-between pt-6 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-fg transition-colors group-hover:text-accent">
              Open case file <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-muted transition hover:text-fg"
              >
                live <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ProjectCover({ project: p, index, tall }: { project: Project; index: number; tall?: boolean }) {
  const Icon = ICONS[p.icon];
  const [a, b] = p.colors;
  return (
    <div
      className={`relative overflow-hidden ${tall ? "aspect-[16/9] lg:aspect-[21/9]" : "aspect-[16/9]"}`}
      style={{
        background: `radial-gradient(120% 120% at 0% 0%, ${a}55, transparent 55%), radial-gradient(120% 120% at 100% 100%, ${b}66, transparent 55%), var(--bg-2)`,
      }}
    >
      <div className="grid-bg absolute inset-0 opacity-60" />
      {/* faux browser bar */}
      <div className="absolute inset-x-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-white/30" />
        <span className="h-2 w-2 rounded-full bg-white/30" />
        <span className="h-2 w-2 rounded-full bg-white/30" />
        <span className="ml-2 truncate font-mono text-[10px] text-white/70">{domainOf(p.url)}</span>
      </div>
      {/* orbiting rings */}
      <div className="absolute left-1/2 top-[58%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 transition-transform duration-1000 group-hover:scale-125" />
      <div className="absolute left-1/2 top-[58%] h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 transition-transform duration-1000 group-hover:scale-150" />
      <div
        className="absolute left-1/2 top-[58%] grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl text-white shadow-2xl transition-transform duration-500 group-hover:-translate-y-[60%] group-hover:rotate-6 group-hover:scale-110"
        style={{ background: `linear-gradient(135deg, ${a}, ${b})`, boxShadow: `0 20px 60px -10px ${b}` }}
      >
        {Icon && <Icon className="h-9 w-9" strokeWidth={1.6} />}
      </div>
      <span className="absolute bottom-3 right-4 font-display text-5xl font-extrabold text-white/10">{String(index + 1).padStart(2, "0")}</span>
    </div>
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
    <motion.div className="fixed inset-0 z-[90] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-label={`${p.name} case file`}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-line bg-bg"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Case file {String(idx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => onNavigate(prev.id)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2" aria-label="Previous project">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => onNavigate(next.id)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2" aria-label="Next project">
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="ml-1 grid h-9 w-9 place-items-center rounded-lg bg-surface-2 hover:bg-accent hover:text-on-accent" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="group flex-1 overflow-y-auto"
          >
            <ProjectCover project={p} index={idx} />
            <div className="p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{p.type}</p>
              <h3 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">{p.name}</h3>
              <p className="mt-4 text-lg leading-relaxed text-muted">{p.overview}</p>

              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-fg px-5 py-3 text-sm font-semibold text-bg transition hover:scale-[1.03]"
                >
                  Visit {domainOf(p.url)} <ArrowUpRight className="h-4 w-4" />
                </a>
              )}

              <h4 className="mb-4 mt-10 font-mono text-xs uppercase tracking-[0.2em] text-muted">Key features</h4>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 rounded-xl border border-line bg-surface p-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>

              {p.roadmap && (
                <>
                  <h4 className="mb-4 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">On the roadmap</h4>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {p.roadmap.map((f) => (
                      <li key={f} className="flex gap-2.5 rounded-xl border border-dashed border-line p-3 text-sm text-muted">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-2" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {p.contribution && (
                <>
                  <h4 className="mb-3 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">My contribution</h4>
                  <p className="text-sm leading-relaxed">{p.contribution}</p>
                </>
              )}

              {p.tech.length > 0 && (
                <>
                  <h4 className="mb-4 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">Built with</h4>
                  <ul className="flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <li key={t} className="rounded-full border border-line px-3 py-1 font-mono text-xs">
                        {t}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <button
                onClick={() => onNavigate(next.id)}
                className="mt-12 flex w-full items-center justify-between rounded-2xl border border-line p-5 text-left transition hover:border-accent"
              >
                <span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Next case file</span>
                  <span className="font-display text-xl font-semibold">{next.name}</span>
                </span>
                <ArrowRight className="h-5 w-5 text-accent" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.aside>
    </motion.div>
  );
}
