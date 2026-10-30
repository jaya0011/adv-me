"use client";

import { ArrowUp, ArrowUpRight, Check, Copy, Send } from "lucide-react";
import { useState } from "react";
import { profile } from "@/data/portfolio";
import { confetti } from "@/lib/confetti";
import { scrollToTop } from "@/lib/scroll";
import { pushToast, sfx, unlock, useHydrated, useLoop } from "@/lib/store";
import { GitHubIcon, InstagramIcon, LinkedInIcon, LoopMark } from "../ui/icons";
import { Eyebrow, Reveal, RiseWords } from "../ui/Reveal";

const TYPES = ["Website", "Web app", "Mobile app", "Ecommerce", "WordPress", "Something else"];

const FIELD = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 outline-none transition-colors placeholder:text-muted/70 focus:border-accent";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [message, setMessage] = useState("");

  const copy = async (e: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      // clipboard blocked; the mailto link still works
    }
    setCopied(true);
    sfx("coin");
    confetti({ x: e.clientX, y: e.clientY, count: 60 });
    unlock("say-hi");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `${type} enquiry${name ? ` from ${name}` : ""}`;
    const body = `Hi Jaya,\n\n${message}\n\n${name ? `- ${name}` : ""}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    unlock("say-hi");
    pushToast({ icon: "✉️", title: "Opening your mail app…", desc: "Your message is pre-filled. Just hit send." });
  };

  const socials = [
    { label: "GitHub", href: profile.github, Icon: GitHubIcon },
    { label: "LinkedIn", href: profile.linkedin, Icon: LinkedInIcon },
    { label: "Instagram", href: profile.instagram, Icon: InstagramIcon },
  ];

  return (
    <section id="contact" data-chapter="contact" className="relative">
      <div className="mx-auto grid min-h-[100svh] max-w-site content-center gap-12 px-5 py-28 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div className="flex flex-col">
          <Eyebrow numeral="VIII">Open to freelance projects</Eyebrow>
          <h2 className="poster mt-5 text-[clamp(3rem,6.6vw,6.75rem)]">
            <RiseWords text={["Got", "an", "idea?"]} />
            <RiseWords text={["Let's", "put", "it"]} delay={0.14} />
            <RiseWords text={[<span key="m" className="mark">on loop.</span>]} delay={0.28} />
          </h2>

          <Reveal delay={0.2}>
            <a href={`mailto:${profile.email}`} className="mt-8 block break-all text-xl tracking-[-0.015em] underline decoration-1 underline-offset-[0.25em] sm:text-2xl">
              {profile.email}
            </a>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <button onClick={copy} className="btn">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy email"}
              </button>
              <span className="text-muted">{profile.location}</span>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 rounded-full px-3.5 py-2 text-sm shadow-[inset_0_0_0_1px_var(--line)] transition-colors hover:bg-surface-2">
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <form onSubmit={send} className="panel flex h-full flex-col gap-5 p-6 sm:p-8">
            <p className="text-xl font-medium tracking-[-0.02em]">A quick project brief</p>
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Who's asking?" className={FIELD} />
            </label>
            <fieldset>
              <legend className="mb-1.5 text-sm text-muted">What are we building?</legend>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    aria-pressed={type === t}
                    onClick={() => setType(t)}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${type === t ? "bg-fg text-bg" : "shadow-[inset_0_0_0_1px_var(--line)] hover:bg-surface-2"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block flex-1">
              <span className="mb-1.5 block text-sm text-muted">Tell me about it</span>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Goals, timeline, links, anything helps." className={`${FIELD} h-[calc(100%-1.75rem)] min-h-28 resize-none`} />
            </label>
            <button type="submit" className="btn group self-start">
              Send via email <Send className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const hydrated = useHydrated();
  const visits = useLoop((s) => s.visits);
  return (
    <footer id="colophon" className="relative z-10">
      <div className="mx-auto flex max-w-site flex-col items-center justify-between gap-4 px-5 pb-16 pt-6 text-sm text-muted sm:flex-row sm:px-8 md:pb-14 lg:px-10">
        <div className="flex items-center gap-3">
          <LoopMark className="h-3.5 w-7 text-accent" />
          <span>© {profile.name}. Designed &amp; built in Amritsar.</span>
        </div>
        <button onClick={scrollToTop} className="btn btn-line group">
          <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" /> Loop again
        </button>
        <p>{hydrated && visits > 1 ? `Loop #${visits}. See you next time.` : "See you next loop."}</p>
      </div>
    </footer>
  );
}
