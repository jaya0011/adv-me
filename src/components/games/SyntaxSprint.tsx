"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/store";
import type { GameProps } from "./registry";
import { StartOverlay } from "./StartOverlay";

const LIMIT = 60;

const SNIPPETS = [
  `const total = cart.items.reduce(\n  (sum, item) => sum + item.price * item.qty,\n  0\n);`,
  `export async function GET(req) {\n  const user = await auth(req);\n  if (!user) return new Response(null, { status: 401 });\n  return Response.json(user);\n}`,
  `function isOnLeave(employee, date) {\n  return employee.leaves.some(\n    (l) => date >= l.start && date <= l.end\n  );\n}`,
  `add_action('init', function () {\n  register_post_type('gemstone', [\n    'public' => true,\n  ]);\n});`,
  `const slots = therapist.availability\n  .filter((s) => !s.booked)\n  .map((s) => s.start);`,
  `@Get(':id')\nfindOne(@Param('id') id: string) {\n  return this.employees.findOne(id);\n}`,
  `while (alive) {\n  learn();\n  build();\n  ship();\n}`,
  `const [theme, setTheme] = useState('nebula');\nuseEffect(() => {\n  document.body.dataset.theme = theme;\n}, [theme]);`,
];

export default function SyntaxSprint({ onGameOver }: GameProps) {
  const [target, setTarget] = useState(SNIPPETS[0]);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState<number | null>(null);
  const [armed, setArmed] = useState(false);
  const [now, setNow] = useState(0);
  const [errors, setErrors] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const finished = useRef(false);

  const elapsed = started ? (now - started) / 1000 : 0;
  const correctChars = [...typed].filter((ch, i) => ch === target[i]).length;
  const wpm = elapsed > 1 ? Math.round(correctChars / 5 / (elapsed / 60)) : 0;
  const accuracy = keystrokes ? Math.max(0, (keystrokes - errors) / keystrokes) : 1;

  const finish = (finalTyped: string, finalErrors: number, finalKeys: number, endAt: number) => {
    if (finished.current || !started) return;
    finished.current = true;
    const secs = Math.max(1, (endAt - started) / 1000);
    const correct = [...finalTyped].filter((ch, i) => ch === target[i]).length;
    const w = correct / 5 / (secs / 60);
    const acc = finalKeys ? Math.max(0, (finalKeys - finalErrors) / finalKeys) : 0;
    onGameOver(Math.round(w * acc), { wpm: Math.round(w), accuracy: Math.round(acc * 100) });
  };

  useEffect(() => {
    if (!started) return;
    const id = window.setInterval(() => {
      const t = performance.now();
      setNow(t);
      if ((t - started) / 1000 >= LIMIT) finish(typed, errors, keystrokes, t);
    }, 100);
    return () => window.clearInterval(id);
  });

  const onChange = (value: string) => {
    if (finished.current) return;
    if (value.length < typed.length) {
      setTyped(value);
      return;
    }
    let next = typed;
    let errs = errors;
    let keys = keystrokes;
    for (const raw of value.slice(typed.length)) {
      if (next.length >= target.length) break;
      const ch = raw === "\r" ? "\n" : raw;
      keys++;
      if (ch !== target[next.length]) {
        errs++;
        sfx("miss");
      }
      next += ch;
      if (ch === "\n") {
        while (target[next.length] === " ") next += " ";
      }
    }
    const t = performance.now();
    if (!started) {
      setStarted(t);
      setNow(t);
    }
    setTyped(next);
    setErrors(errs);
    setKeystrokes(keys);
    if (next.length >= target.length) {
      sfx("win");
      // use t as start if this was the very first keystroke
      if (started) finish(next, errs, keys, t);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      onChange(typed + "  ");
    }
  };

  const begin = () => {
    sfx("click");
    setTarget(SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]);
    setArmed(true);
    window.setTimeout(() => inputRef.current?.focus(), 30);
  };

  const timeLeft = Math.max(0, LIMIT - elapsed);
  const lines = target.split("\n");
  const lineStarts = lines.map((_, li) => lines.slice(0, li).reduce((n, l) => n + l.length + 1, 0));

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 grid grid-cols-3 gap-2 font-mono text-sm">
        <Stat label="wpm" value={wpm} />
        <Stat label="accuracy" value={`${Math.round(accuracy * 100)}%`} />
        <Stat label="time" value={`${timeLeft.toFixed(0)}s`} warn={timeLeft < 10 && !!started} />
      </div>

      <div className="relative" onClick={() => inputRef.current?.focus()}>
        {!armed && <StartOverlay emoji="⌨️" title="Syntax Sprint" hint="The clock starts on your first keystroke. You have 60 seconds." onStart={begin} />}
        <pre className="min-h-56 overflow-x-auto whitespace-pre rounded-2xl border border-line bg-bg-2 p-5 font-mono [font-variant-ligatures:none] text-[13px] leading-7 sm:text-[15px]">
          {lines.map((line, li) => {
            const start = lineStarts[li];
            return (
              <div key={li}>
                {[...line, "\n"].map((ch, ci) => {
                  const idx = start + ci;
                  if (idx >= target.length) return null;
                  const t = typed[idx];
                  const isCaret = idx === typed.length;
                  const cls =
                    t === undefined ? "text-muted/60" : t === ch ? "text-fg" : "bg-danger/30 text-danger rounded-sm";
                  return (
                    <span key={ci} className={`relative ${cls}`}>
                      {isCaret && <span className="animate-blink absolute -left-px top-1 h-5 w-0.5 bg-accent" />}
                      {ch === "\n" ? <span className="text-muted/30">↵</span> : ch}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </pre>
        <textarea
          ref={inputRef}
          value={typed}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Type the code snippet here"
          className="absolute inset-0 h-full w-full cursor-text resize-none opacity-0"
        />
      </div>
      <p className="mt-3 text-center text-xs text-muted">Click the snippet to focus. Backspace fixes mistakes. Tab adds two spaces.</p>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-center">
      <div className={`font-display text-2xl font-bold ${warn ? "text-danger" : "text-accent"}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</div>
    </div>
  );
}
