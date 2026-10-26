import { ACHIEVEMENTS, AIM_MODES, DAILY_CHALLENGES } from "./data.js";

const KEY = "nexus.progress.v1";
const listeners = new Set();

const DEFAULTS = {
  version: 1,
  xp: 0,
  streak: { count: 0, last: null },
  aim: {
    best: { flick: 0, grid: 0, precision: 0 },
    history: [],
    runs: 0,
    shots: 0,
    hits: 0,
    bestCombo: 0,
  },
  sens: { game: "cs2", dpi: 800, sens: 1, pad: 450 },
  build: {
    current: { weapon: "ar", attachments: { muzzle: "none", barrel: "none", optic: "none", under: "none", mag: "none", stock: "none" } },
    saved: [],
  },
  codex: { cleared: [] },
  settings: { sound: true, motion: true },
  daily: { date: null, claimed: [] },
  events: [],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function merge(base, saved) {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : clone(base);
  if (base && typeof base === "object") {
    const out = {};
    for (const key of Object.keys(base)) out[key] = merge(base[key], saved && typeof saved === "object" ? saved[key] : undefined);
    if (saved && typeof saved === "object") for (const key of Object.keys(saved)) if (!(key in out)) out[key] = saved[key];
    return out;
  }
  return saved === undefined || saved === null ? base : saved;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return merge(clone(DEFAULTS), JSON.parse(raw));
  } catch (error) {
    console.warn("NEXUS: could not load saved progress", error);
  }
  return clone(DEFAULTS);
}

export const state = load();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function commit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("NEXUS: could not save progress", error);
  }
  for (const fn of listeners) fn(state);
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export function updateStreak() {
  const today = todayKey();
  if (state.streak.last === today) return;
  state.streak.count = state.streak.last === yesterdayKey() ? state.streak.count + 1 : 1;
  state.streak.last = today;
  commit();
}

export function levelForXp(xp = state.xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 60)) + 1;
}

export function levelProgress(xp = state.xp) {
  const level = levelForXp(xp);
  const current = (level - 1) ** 2 * 60;
  const next = level ** 2 * 60;
  return { level, current, next, into: xp - current, span: next - current, pct: Math.min(100, ((xp - current) / (next - current)) * 100) };
}

export function addXp(amount) {
  const before = levelForXp();
  state.xp = Math.max(0, state.xp + Math.round(amount || 0));
  const after = levelForXp();
  commit();
  return { leveledUp: after > before, level: after, delta: Math.round(amount || 0) };
}

export function recordEvent(type, data = {}) {
  state.events.push({ type, day: todayKey(), ts: Date.now(), ...data });
  if (state.events.length > 400) state.events.splice(0, state.events.length - 400);
}

function eventsToday() {
  const today = todayKey();
  return state.events.filter((e) => e.day === today);
}

export function challengeProgress(def) {
  const events = eventsToday();
  switch (def.metric) {
    case "drills":
      return events.filter((e) => e.type === "run").length;
    case "accuracy":
      return Math.max(0, ...events.filter((e) => e.type === "run" && (e.shots || 0) >= 15).map((e) => e.accuracy || 0));
    case "clears":
      return events.filter((e) => e.type === "clear").length;
    case "loadouts":
      return events.filter((e) => e.type === "save").length;
    case "bestScore":
      return Math.max(0, ...events.filter((e) => e.type === "run").map((e) => e.score || 0));
    case "sensChecks":
      return events.filter((e) => e.type === "sens").length;
    default:
      return 0;
  }
}

export function dailyChallenges() {
  const today = todayKey();
  if (state.daily.date !== today) {
    state.daily = { date: today, claimed: [] };
  }
  const seed = Math.floor(new Date(today + "T12:00:00").getTime() / 86400000);
  const first = seed % DAILY_CHALLENGES.length;
  const second = (seed + 2) % DAILY_CHALLENGES.length;
  return [DAILY_CHALLENGES[first], DAILY_CHALLENGES[second]].map((def) => {
    const progress = challengeProgress(def);
    return {
      ...def,
      progress: Math.min(progress, def.target),
      rawProgress: progress,
      ready: progress >= def.target,
      claimed: state.daily.claimed.includes(def.id),
    };
  });
}

export function claimChallenge(id) {
  const challenge = dailyChallenges().find((c) => c.id === id);
  if (!challenge || !challenge.ready || challenge.claimed) return null;
  state.daily.claimed.push(id);
  recordEvent("challenge", { id });
  return addXp(challenge.xp);
}

export function formatXp(xp) {
  if (xp >= 10000) return `${(xp / 1000).toFixed(1)}k`;
  return String(xp);
}

export function lifetimeStats() {
  const runs = state.aim.runs;
  const shots = state.aim.shots;
  const hits = state.aim.hits;
  const bestScore = Math.max(state.aim.best.flick || 0, state.aim.best.grid || 0, state.aim.best.precision || 0);
  return {
    runs,
    shots,
    hits,
    accuracy: shots ? Math.round((hits / shots) * 1000) / 10 : 0,
    bestScore,
    cleared: state.codex.cleared.length,
    saved: state.build.saved.length,
    streak: state.streak.count,
    bestCombo: state.aim.bestCombo || 0,
    level: levelForXp(),
  };
}

export function achievements() {
  const stats = lifetimeStats();
  const checks = {
    first_blood: stats.runs >= 1,
    deadeye: state.aim.history.some((run) => run.shots >= 20 && run.accuracy >= 80),
    centurion: stats.bestScore >= 1200,
    codex_keeper: stats.cleared >= 5,
    architect: stats.saved >= 1,
    triarii: stats.streak >= 3,
    operator: stats.level >= 5,
    converter: state.events.filter((e) => e.type === "sens").length >= 3,
  };
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!checks[a.id] }));
}

export function bestForMode(mode) {
  return state.aim.best[mode] || 0;
}

export function clearBoss(id, done) {
  const set = new Set(state.codex.cleared);
  if (done) set.add(id);
  else set.delete(id);
  state.codex.cleared = [...set];
}

export function isCleared(id) {
  return state.codex.cleared.includes(id);
}

export function resetProgress() {
  const fresh = clone(DEFAULTS);
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, fresh);
  state.streak.count = 1;
  state.streak.last = todayKey();
  commit();
}

export function aimModes() {
  return Object.values(AIM_MODES);
}
