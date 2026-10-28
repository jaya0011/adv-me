# Jaya Arora · Portfolio (on loop ∞)

The portfolio of Jaya Arora, a full-stack and freelance developer. Built with Next.js 16, React 19, Tailwind CSS v4 and Motion.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (fully static)
npm run start
```

## What's inside

- **Hero**: canvas particles flowing around an infinity loop that react to the cursor, plus a visitor counter ("loop #N", day streak).
- **About / Skills / Work / Services / Contact**: content comes from `src/data/portfolio.ts`. The skills orbit around a core, each project opens as a case file, and the contact brief opens a pre-filled email.
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
