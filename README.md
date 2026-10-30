# Jaya Arora · Portfolio (on loop ∞)

The portfolio of Jaya Arora, a full-stack and freelance developer. Built with Next.js 16, React 19, Tailwind CSS v4 and Motion.

## Run it

```bash
npm install
npm run dev      # http://localhost:4002
npm run build    # production build (fully static)
npm run start
```

## What's inside

- **The world**: one WebGL scene behind the whole page (`src/components/world/`). 64,000 particles pour between an ∞, a spark, a stack, a tunnel and a planet's horizon while the camera flies a path set per chapter in `SHOTS`. Solid objects (the core, glass plates, the planet, warp streaks) live in `objects.ts`. Particles part around the cursor. Quality steps itself down on slow devices; add `?quality=high` to hold it at full. Lenis smooths the scrolling.
- **Intro**: the pencil writes "hello", then the word lands in the hero.
- **Chapters**: About, Skills, Work, Services, Process and Contact each have their own treatment. Work is a flight past real screenshots; Services is the one daylight chapter; Arcade powers on like a CRT.
- **Content**: content comes from `src/data/portfolio.ts`. Each project opens as a case file, and the contact brief opens a pre-filled email. Project screenshots live in `public/work/`; a project without a `shot` gets a typographic poster from its `poster` colours.
- **The Loop Arcade**: five original mini-games in `src/components/games/`:
  - Loop Dodge (orbit the core, dodge the bugs)
  - Bug Smash (30-second bug whacking)
  - Deploy Stack (timing-based block stacking)
  - Syntax Sprint (typing real code)
  - Memory Merge (tech pair matching)
- **Return-visit hooks** (stored in the visitor's localStorage, no backend needed):
  - XP and levels
  - 20 achievements, 2 of them secret
  - High scores
  - A daily quest and a dev tip of the day, both changing at midnight
  - 3 themes that unlock with XP (Sunset 100, Terminal 250, Aurum 500)
- **Command palette**: `Ctrl/⌘ + K` or `/`.
- **Easter eggs**: the Konami code, and clicking the logo 5 times quickly.

## Editing content

| What | File |
| --- | --- |
| Bio, skills, services, projects | `src/data/portfolio.ts` |
| Achievements | `src/data/achievements.ts` |
| Themes and unlock XP | `src/data/themes.ts` (colours live in `src/app/globals.css`) |
| Daily quests and dev tips | `src/lib/daily.ts` |
| Game list and descriptions | `src/components/games/registry.ts` |

## Deploy

Push to GitHub and import the repo on Vercel. No environment variables are needed.
