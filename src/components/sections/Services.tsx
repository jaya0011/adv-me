"use client";

import { process, services } from "@/data/portfolio";
import { ICONS } from "../ui/icons";
import { Reveal, SectionHeading, trackSpotlight } from "../ui/Reveal";

export function Services() {
  return (
    <section id="services" className="relative mx-auto max-w-site px-4 py-28 sm:px-6 md:py-36 lg:px-10">
      <SectionHeading
        index="04"
        kicker="Services"
        title={
          <>
            What I can <span className="text-gradient">build for you.</span>
          </>
        }
        sub="For businesses, startups and individuals: one developer who can take your project from the first call to launch day and keep it running afterwards."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => {
          const Icon = ICONS[s.icon];
          return (
            <Reveal key={s.title} delay={(i % 3) * 0.06}>
              <div onPointerMove={trackSpotlight} className="card spotlight group h-full p-6 transition hover:-translate-y-1 hover:border-accent/40">
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/12 text-accent transition group-hover:scale-110 group-hover:bg-accent group-hover:text-on-accent">
                    {Icon && <Icon className="h-5 w-5" />}
                  </span>
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
              </div>
            </Reveal>
          );
        })}
        <Reveal delay={0.12}>
          <a
            href="#contact"
            className="group flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-accent via-accent-3 to-accent-2 p-6 text-on-accent transition hover:-translate-y-1"
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">Something else?</span>
            <span className="mt-8 font-display text-2xl font-bold leading-tight">
              Tell me what you&apos;re building and I&apos;ll tell you how I&apos;d approach it. →
            </span>
          </a>
        </Reveal>
      </div>

      <Reveal className="mt-20">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">How a project runs</p>
        <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {process.map((p, i) => (
            <li key={p.step} className="group relative bg-bg p-5 transition hover:bg-bg-2">
              <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-6 font-display text-lg font-semibold">{p.step}</p>
              <p className="text-xs text-muted">{p.desc}</p>
              {i === process.length - 1 && <span className="absolute right-4 top-4 text-accent" title="…and back to the start">↺</span>}
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
