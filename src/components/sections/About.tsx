"use client";

import { GraduationCap, Lightbulb } from "lucide-react";
import { education, profile, strengths } from "@/data/portfolio";
import { tipFor, dayKey } from "@/lib/daily";
import { useHydrated } from "@/lib/store";
import { Reveal, SectionHeading } from "../ui/Reveal";

const K = ({ children }: { children: React.ReactNode }) => <span className="text-accent-3">{children}</span>;
const S = ({ children }: { children: React.ReactNode }) => <span className="text-accent-2">{children}</span>;
const P = ({ children }: { children: React.ReactNode }) => <span className="text-fg">{children}</span>;
const C = ({ children }: { children: React.ReactNode }) => <span className="text-muted/70 italic">{children}</span>;

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-site px-4 py-28 sm:px-6 md:py-36 lg:px-10">
      <SectionHeading
        index="01"
        kicker="About"
        title={
          <>
            I turn ideas into <span className="text-gradient">products people use.</span>
          </>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="min-w-0">
          {profile.summary.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className={`mb-5 leading-relaxed ${i === 0 ? "text-xl text-fg sm:text-2xl" : "text-base text-muted sm:text-lg"}`}>{p}</p>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <p className="mb-8 border-l-2 border-accent pl-4 font-display text-lg italic">{profile.goal}</p>
          </Reveal>

          <Reveal delay={0.25}>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">What I bring</p>
            <ul className="flex flex-wrap gap-2">
              {strengths.map((s) => (
                <li key={s} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm transition hover:border-accent hover:text-accent">
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Reveal>
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-xs text-muted">jaya.config.ts</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-muted">
                <code>
                  <C>{"// hi, I'm Jaya"}</C>
                  {"\n"}
                  <K>export const</K> <P>jaya</P> = {"{"}
                  {"\n  "}role: <S>&quot;Full-Stack Developer&quot;</S>,
                  {"\n  "}based: <S>&quot;Amritsar, Punjab, IN&quot;</S>,
                  {"\n  "}studying: <S>&quot;MSc CS @ GNDU&quot;</S>,
                  {"\n  "}stack: [<S>&quot;Next.js&quot;</S>, <S>&quot;NestJS&quot;</S>, <S>&quot;React Native&quot;</S>, <S>&quot;PHP&quot;</S>],
                  {"\n  "}ships: [<S>&quot;web&quot;</S>, <S>&quot;iOS&quot;</S>, <S>&quot;Android&quot;</S>, <S>&quot;WordPress&quot;</S>],
                  {"\n  "}freelance: <K>true</K>,
                  {"\n  "}mode: <S>&quot;on loop&quot;</S>, <C>{"// ∞"}</C>
                  {"\n"}
                  {"}"}
                  <span className="animate-blink ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-accent" />
                </code>
              </pre>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card p-6">
              <p className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                <GraduationCap className="h-4 w-4 text-accent" /> Education
              </p>
              <ol className="relative space-y-6 border-l border-line pl-6">
                {education.map((e) => (
                  <li key={e.degree} className="relative">
                    <span
                      className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-bg ${e.current ? "bg-accent animate-pulse-ring" : "bg-muted"}`}
                    />
                    <p className="font-display text-lg font-semibold leading-tight">{e.degree}</p>
                    <p className="text-sm text-muted">{e.school}</p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                        e.current ? "bg-accent/15 text-accent" : "bg-surface-2 text-muted"
                      }`}
                    >
                      {e.status}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <TipOfTheDay />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TipOfTheDay() {
  const hydrated = useHydrated();
  return (
    <div className="card flex gap-4 p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-3/15 text-accent-3">
        <Lightbulb className="h-5 w-5" />
      </span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Dev tip of the day · new one tomorrow</p>
        <p className="mt-1 text-sm">{hydrated ? tipFor(dayKey()) : "…"}</p>
      </div>
    </div>
  );
}
