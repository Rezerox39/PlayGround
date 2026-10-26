import { BOSSES } from "./data.js";
import { state, dailyChallenges, claimChallenge, lifetimeStats, levelProgress, formatXp } from "./store.js";
import { icon, esc, num, longDate, greeting, toast, difficultyDots } from "./ui.js";
import { cm360For, gameById } from "./calc.js";

function chartMarkup() {
  const runs = state.aim.history.slice(-10);
  if (!runs.length) {
    return `<div class="chart-empty">${icon("target")}<span style="margin-top:8px">No drills yet. Your score curve appears here.</span></div>`;
  }
  if (runs.length === 1) {
    return `<div class="chart-empty" style="border-style:solid">${icon("zap")}<span style="margin-top:8px">First run logged: <b style="color:var(--text)">${num(runs[0].score)}</b>. Run again to start the curve.</span></div>`;
  }
  const scores = runs.map((r) => r.score);
  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const span = Math.max(1, max - min);
  const w = 320;
  const h = 100;
  const step = runs.length > 1 ? w / (runs.length - 1) : w;
  const points = runs.map((r, i) => {
    const x = runs.length > 1 ? i * step : w / 2;
    const y = h - 8 - ((r.score - min) / span) * (h - 20);
    return [x, y];
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M0,${h} L${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")} L${w},${h} Z`;
  const dots = points.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === points.length - 1 ? 3.4 : 2.2}" fill="#0a0a12" stroke="#a78bfa" stroke-width="1.6"/>`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Recent drill scores">
    <defs>
      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#a78bfa"/>
        <stop offset="100%" stop-color="#22d3ee"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#chartFill)"/>
    <polyline points="${line}" fill="none" stroke="url(#chartLine)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    ${dots}
  </svg>`;
}

function dailyMarkup() {
  const challenges = dailyChallenges();
  const claimed = challenges.filter((c) => c.claimed).length;
  const items = challenges.map((c) => {
    const pct = Math.min(100, (c.rawProgress / c.target) * 100);
    const value = c.metric === "accuracy" ? `${Math.round(c.rawProgress)}%` : num(Math.min(c.rawProgress, c.target));
    const target = c.metric === "accuracy" ? `${c.target}%` : c.target;
    let action;
    if (c.claimed) action = `<span class="chip chip-live">${icon("check")} Claimed</span>`;
    else if (c.ready) action = `<button class="btn btn-primary btn-sm" type="button" data-claim="${c.id}">Claim +${c.xp} XP</button>`;
    else action = `<span class="chip">${value} / ${target}</span>`;
    return `<div class="daily-item">
      <div class="spread">
        <div><div class="daily-title">${esc(c.title)}</div><div class="daily-sub">${esc(c.desc)}</div></div>
        ${action}
      </div>
      <div class="progress" style="margin-top:10px"><span style="width:${c.claimed ? 100 : pct}%"></span></div>
    </div>`;
  }).join("");
  return `<section class="card daily">
    <div class="card-head">
      <div class="card-title">${icon("flame")} Daily directives</div>
      <span class="badge ${claimed ? "badge-lime" : ""}">${claimed}/2</span>
    </div>
    <div class="daily-list">${items}</div>
    <p class="fine">Resets at midnight. Directives award XP toward your operator level.</p>
  </section>`;
}

function featuredMarkup() {
  const open = BOSSES.filter((b) => !state.codex.cleared.includes(b.id));
  const pool = open.length ? open : BOSSES;
  const index = Math.floor(Date.now() / 86400000) % pool.length;
  const boss = pool[index];
  return `<section class="card featured">
    <div class="featured-banner">
      <div class="row" style="gap:8px">
        <span class="badge" style="background:${boss.gameColor}22;color:${boss.gameColor}">${esc(boss.game)}</span>
        ${difficultyDots(boss.difficulty)}
      </div>
      <span class="fine">CODEX PICK</span>
    </div>
    <div class="featured-body">
      <div class="featured-name">${esc(boss.name)}</div>
      <div class="featured-meta">
        <span class="chip">${icon("shield")}${esc(boss.region)}</span>
        <span class="chip">${icon("sword")}${esc(boss.weakness)}</span>
      </div>
      <p class="featured-tip">${esc(boss.tips[0])}</p>
      <button class="btn btn-soft btn-sm" type="button" style="margin-top:14px" data-featured-boss="${boss.id}">Open boss plan ${icon("chevron")}</button>
    </div>
  </section>`;
}

function html() {
  const stats = lifetimeStats();
  const level = levelProgress();
  const c = cm360For(state.sens.game, state.sens.dpi, state.sens.sens);
  const todayRuns = state.aim.history.filter((r) => new Date(r.ts).toDateString() === new Date().toDateString());
  const todayBest = todayRuns.length ? Math.max(...todayRuns.map((r) => r.score)) : 0;
  const game = gameById(state.sens.game);

  return `<div class="hello">
    <p class="eyebrow">${esc(longDate())} · ${esc(greeting()).toUpperCase()}</p>
    <h1>${esc(greeting())}, <span class="grad-text">Operator</span></h1>
  </div>

  <div class="home-grid">
    <div class="home-col">
      <section class="hero card">
        <svg class="hero-rings" viewBox="0 0 320 320" aria-hidden="true">
          <circle cx="160" cy="160" r="148" stroke-width="1"/>
          <circle cx="160" cy="160" r="108" stroke-width="1.2"/>
          <circle cx="160" cy="160" r="66" stroke-width="1.4"/>
          <circle cx="160" cy="160" r="30" fill="none" stroke="rgba(255,77,109,0.55)" stroke-width="1.6"/>
          <circle class="dot" cx="160" cy="160" r="4.5"/>
          <circle cx="160" cy="52" r="3" fill="#22d3ee"/>
          <circle cx="258" cy="220" r="2.5" fill="#a78bfa"/>
        </svg>
        <div>
          <div class="hero-meta">
            <span class="badge badge-violet">30-SECOND PROTOCOL</span>
            ${todayBest ? `<span class="chip chip-live">${icon("zap")}Today's best ${num(todayBest)}</span>` : `<span class="chip">${icon("zap")}Warm-up ready</span>`}
          </div>
          <h2>Your aim,<br/>upgraded.</h2>
          <p>Three drills, one sensitivity lab, zero excuses. NEXUS turns ten focused minutes into measurable progress.</p>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary" type="button" data-action="start-aim">${icon("play")}Start aim drill</button>
          <a class="btn btn-ghost" href="#/sens">${icon("crosshair")}Sens Lab</a>
        </div>
      </section>

      <div class="stat-grid">
        <div class="stat stat-hot">
          <div class="stat-top"><span class="stat-label" style="margin:0">Streak</span>${icon("flame")}</div>
          <div class="stat-value tnum">${stats.streak}<small>d</small></div>
          <div class="stat-label">Daily training</div>
        </div>
        <div class="stat stat-violet">
          <div class="stat-top"><span class="stat-label" style="margin:0">Best score</span>${icon("trophy")}</div>
          <div class="stat-value tnum">${num(stats.bestScore)}</div>
          <div class="stat-label">All modes</div>
        </div>
        <div class="stat stat-cyan">
          <div class="stat-top"><span class="stat-label" style="margin:0">cm / 360°</span>${icon("crosshair")}</div>
          <div class="stat-value tnum">${c ? c.toFixed(1) : "—"}</div>
          <div class="stat-label">${esc(game.short)} · ${num(state.sens.dpi)} DPI</div>
        </div>
        <div class="stat">
          <div class="stat-top"><span class="stat-label" style="margin:0">Codex</span>${icon("book")}</div>
          <div class="stat-value tnum">${stats.cleared}<small>/ ${BOSSES.length}</small></div>
          <div class="stat-label">Bosses cleared</div>
        </div>
      </div>

      <section class="card">
        <div class="card-head">
          <div class="card-title">${icon("zap")}Performance curve</div>
          <span class="card-note">${state.aim.history.length ? `${state.aim.history.length === 1 ? "Last run" : `Last ${Math.min(10, state.aim.history.length)} runs`}` : "Awaiting data"}</span>
        </div>
        <div class="chart-wrap">${chartMarkup()}</div>
        <div class="row" style="margin-top:12px;justify-content:space-between">
          <span class="fine">Lifetime accuracy <b style="color:var(--text)">${stats.accuracy || 0}%</b> · ${num(stats.runs)} drills</span>
          <button class="link-btn" type="button" data-open-profile>Full stats ${icon("chevron", "icon-sm")}</button>
        </div>
      </section>
    </div>

    <div class="home-col">
      ${dailyMarkup()}

      <div class="jump-grid">
        <a class="jump" href="#/sens">
          <span class="jump-arrow">${icon("chevron")}</span>
          ${icon("crosshair")}
          <span><b>Sens Lab</b><small>Convert cm/360</small></span>
        </a>
        <a class="jump" href="#/build">
          <span class="jump-arrow">${icon("chevron")}</span>
          ${icon("layers")}
          <span><b>Build Lab</b><small>Tune a loadout</small></span>
        </a>
        <a class="jump" href="#/codex">
          <span class="jump-arrow">${icon("chevron")}</span>
          ${icon("book")}
          <span><b>Boss Codex</b><small>${BOSSES.length} fight plans</small></span>
        </a>
        <button class="jump" type="button" data-open-profile>
          <span class="jump-arrow">${icon("chevron")}</span>
          ${icon("user")}
          <span><b>Operator</b><small>Level ${level.level} · ${formatXp(state.xp)} XP</small></span>
        </button>
      </div>

      ${featuredMarkup()}
    </div>
  </div>

  <p class="footer-note fine">Fan-made companion. Not affiliated with or endorsed by any game publisher. Stats and tactics are community guidance, not official data.</p>`;
}

function paint(root) {
  root.innerHTML = html();
}

function bind(root) {
  root.addEventListener("click", async (event) => {
    const claim = event.target.closest("[data-claim]");
    if (claim) {
      const result = claimChallenge(claim.dataset.claim);
      if (result) {
        toast(`Directive complete · +${result.delta} XP`, { icon: "trophy" });
        if (result.leveledUp) toast(`Level ${result.level} reached`, { icon: "spark" });
        paint(root);
      }
      return;
    }
    const boss = event.target.closest("[data-featured-boss]");
    if (boss) {
      window.__nexusOpenBoss = boss.dataset.featuredBoss;
      window.location.hash = "#/codex";
      return;
    }
    if (event.target.closest('[data-action="start-aim"]')) {
      window.__nexusAutoStart = true;
      window.location.hash = "#/aim";
    }
  });
}

export default {
  html,
  mount(root) {
    paint(root);
    bind(root);
  },
  destroy() {},
};
