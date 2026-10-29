"use client";

import { ArrowUpRight, Check, Copy, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { profile } from "@/data/portfolio";
import { confetti } from "@/lib/confetti";
import { pushToast, sfx, unlock, useHydrated, useLoop } from "@/lib/store";
import { GitHubIcon, InstagramIcon, LinkedInIcon, LoopMark } from "../ui/icons";
import { Reveal } from "../ui/Reveal";

const TYPES = ["Website", "Web app", "Mobile app", "Ecommerce", "WordPress", "Something else"];

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
    { label: "GitHub", handle: "jaya0011", href: profile.github, Icon: GitHubIcon },
    { label: "LinkedIn", handle: "Jaya Arora", href: profile.linkedin, Icon: LinkedInIcon },
    { label: "Instagram", handle: profile.instagramHandle, href: profile.instagram, Icon: InstagramIcon },
  ];

  return (
    <section
      id="contact"
      className="relative mx-auto flex max-w-site flex-col justify-center px-4 py-28 sm:px-6 md:py-36 lg:min-h-[calc(100svh-5rem)] lg:px-10 lg:py-10"
    >
      <Reveal>
        <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted">
          <span className="text-accent">06</span>
          <span className="h-px w-10 bg-line" />
          Contact
        </div>
        {/* scales with viewport height too, so heading + form fit one screen */}
        <h2 className="font-display text-[clamp(2.6rem,min(9vw,9vh),6.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
          Got an idea?
          <br />
          <span className="text-gradient">Let&apos;s put it on loop.</span>
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:mt-[min(2.5rem,4vh)] lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <div className="flex h-full flex-col gap-4">
            <div className="card p-6">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-ring" /> Open to freelance projects
              </p>
              <a href={`mailto:${profile.email}`} className="mt-4 block break-all font-display text-2xl font-semibold transition hover:text-accent sm:text-3xl">
                {profile.email}
              </a>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-bg transition hover:scale-[1.03]"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy email"}
                </button>
                <span className="inline-flex items-center gap-1.5 px-2 text-sm text-muted">
                  <MapPin className="h-4 w-4" /> {profile.location}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {socials.map(({ label, handle, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group flex items-center gap-3 p-4 transition hover:-translate-y-1 hover:border-accent/50"
                >
                  <Icon className="h-6 w-6 shrink-0 transition group-hover:text-accent" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block truncate text-xs text-muted">{handle}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={send} className="card flex h-full flex-col gap-3.5 p-6 lg:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Quick project brief</p>
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Who's asking?"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 outline-none transition placeholder:text-muted/60 focus:border-accent"
              />
            </label>
            <fieldset>
              <legend className="mb-1.5 text-sm text-muted">What are we building?</legend>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      type === t ? "border-accent bg-accent text-on-accent" : "border-line hover:border-accent"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block flex-1">
              <span className="mb-1.5 block text-sm text-muted">Tell me about it</span>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Goals, timeline, links, anything helps."
                className="h-full min-h-24 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 outline-none transition placeholder:text-muted/60 focus:border-accent"
              />
            </label>
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-3 px-5 py-3 font-semibold text-on-accent transition hover:brightness-110"
            >
              Send via email <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
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
    <footer className="relative border-t border-line">
      <div className="mx-auto flex max-w-site flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <LoopMark className="h-4 w-8 text-accent" />
          <span>© {profile.name}. Designed &amp; built in Amritsar.</span>
        </div>
        <div className="font-mono text-xs">
          {hydrated && visits > 0 ? `you've been here ${visits} time${visits === 1 ? "" : "s"} · see you next loop ∞` : "see you next loop ∞"}
        </div>
      </div>
      <div className="pointer-events-none select-none overflow-hidden">
        <p className="text-outline -mb-[0.22em] text-center font-display text-[22vw] font-extrabold leading-none tracking-[-0.06em] opacity-40">
          on loop
        </p>
      </div>
    </footer>
  );
}
