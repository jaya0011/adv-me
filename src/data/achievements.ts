export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  xp: number;
  secret?: boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "hello-world", title: "Hello, World", desc: "Visited the loop for the first time.", icon: "👋", xp: 10 },
  { id: "back-on-loop", title: "Back on Loop", desc: "Came back for a second visit.", icon: "🔁", xp: 25 },
  { id: "infinite-loop", title: "Infinite Loop", desc: "Visited 7 times. You're basically family.", icon: "♾️", xp: 75 },
  { id: "on-a-roll", title: "On a Roll", desc: "Visited 3 days in a row.", icon: "🔥", xp: 50 },
  { id: "night-owl", title: "Night Owl", desc: "Browsed between midnight and 5 AM.", icon: "🦉", xp: 20 },
  { id: "case-reader", title: "Case Reader", desc: "Opened 3 project case files.", icon: "📂", xp: 25 },
  { id: "due-diligence", title: "Due Diligence", desc: "Opened every project case file.", icon: "🗂️", xp: 50 },
  { id: "player-one", title: "Player One", desc: "Played your first arcade game.", icon: "🕹️", xp: 15 },
  { id: "arcade-regular", title: "Arcade Regular", desc: "Played all five arcade games.", icon: "🎟️", xp: 50 },
  { id: "exterminator", title: "Exterminator", desc: "Scored 25+ in Bug Smash.", icon: "🐞", xp: 40 },
  { id: "fast-fingers", title: "Fast Fingers", desc: "Hit 40+ WPM in Syntax Sprint.", icon: "⌨️", xp: 40 },
  { id: "skyscraper", title: "Skyscraper", desc: "Stacked 15+ floors in Deploy Stack.", icon: "🏗️", xp: 40 },
  { id: "photographic", title: "Photographic", desc: "Solved Memory Merge in 12 moves or fewer.", icon: "🧠", xp: 40 },
  { id: "orbiter", title: "Orbiter", desc: "Survived 30 seconds in Loop Dodge.", icon: "🪐", xp: 40 },
  { id: "daily-driver", title: "Daily Driver", desc: "Completed a daily quest.", icon: "📅", xp: 30 },
  { id: "power-user", title: "Power User", desc: "Opened the command palette.", icon: "⌘", xp: 15 },
  { id: "stylist", title: "Stylist", desc: "Switched the site theme.", icon: "🎨", xp: 10 },
  { id: "say-hi", title: "Say Hi", desc: "Copied the email or started a message.", icon: "✉️", xp: 20 },
  { id: "cheat-code", title: "Cheat Code", desc: "↑ ↑ ↓ ↓ ← → ← → B A. Respect.", icon: "🎮", xp: 50, secret: true },
  { id: "curious", title: "Curious Cat", desc: "Clicked the logo 5 times in a row.", icon: "🐈", xp: 20, secret: true },
];

export const achievementById = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a])) as Record<string, Achievement>;
