import { BOSSES, GAME_TAGS } from "./data.js";
import { state, commit, recordEvent, addXp, clearBoss, isCleared } from "./store.js";
import { icon, esc, num, toast, openDialog, difficultyDots } from "./ui.js";

let rootEl = null;
const filters = { query: "", game: "all", difficulty: "all", hideCleared: false };

function filtered() {
  const q = filters.query.trim().toLowerCase();
  return BOSSES.filter((b) => {
    if (filters.game !== "all" && b.game !== filters.game) return false;
    if (filters.difficulty !== "all" && b.difficulty !== Number(filters.difficulty)) return false;
    if (filters.hideCleared && isCleared(b.id)) return false;
    if (!q) return true;
    return [b.name, b.game, b.region, b.weakness, b.summary, b.reward].join(" ").toLowerCase().includes(q);
  });
}

function gameCounts() {
  const map = new Map();
  for (const game of GAME_TAGS) {
    const bosses = BOSSES.filter((b) => b.game === game);
    map.set(game, { total: bosses.length, cleared: bosses.filter((b) => isCleared(b.id)).length });
  }
  return map;
}

function chipsMarkup() {
  const counts = gameCounts();
  const allCleared = state.codex.cleared.length;
  const chips = [`<button class="filter-chip ${filters.game === "all" ? "active" : ""}" type="button" data-game="all">All games <span class="dim">${allCleared}/${BOSSES.length}</span></button>`];
  for (const game of GAME_TAGS) {
    const c = counts.get(game);
    chips.push(`<button class="filter-chip ${filters.game === game ? "active" : ""}" type="button" data-game="${esc(game)}">${esc(game)} <span class="dim">${c.cleared}/${c.total}</span></button>`);
  }
  return chips.join("");
}

function bossCard(b) {
  const cleared = isCleared(b.id);
  return `<button class="boss-card ${cleared ? "cleared" : ""}" type="button" data-boss="${b.id}" aria-label="${esc(b.name)}, ${esc(b.game)}. ${cleared ? "Cleared." : "Open plan."}">
    <span class="boss-emblem" style="background:${b.gameColor}1f;color:${b.gameColor};border-color:${b.gameColor}55">${esc(b.sigil)}</span>
    <span class="boss-main">
      <span class="boss-name">${esc(b.name)} ${cleared ? icon("check") : ""}</span>
      <span class="boss-sub">${esc(b.game)} · ${esc(b.region)}</span>
      <span class="boss-sub">${difficultyDots(b.difficulty)} <span>${esc(b.weakness)}</span></span>
    </span>
    <span class="boss-right">
      <span class="badge ${cleared ? "badge-lime" : ""}">${cleared ? "CLEARED" : `D${b.difficulty}`}</span>
      ${icon("chevron")}
    </span>
  </button>`;
}

function listMarkup() {
  const list = filtered();
  if (!list.length) {
    return `<div class="empty">${icon("search")}<div style="margin-top:8px">No bosses match those filters.</div><button class="btn btn-ghost btn-sm" type="button" id="clearFilters" style="margin-top:12px">Clear filters</button></div>`;
  }
  const groups = [];
  for (const b of list) {
    if (!groups.length || groups[groups.length - 1].game !== b.game) groups.push({ game: b.game, items: [] });
    groups[groups.length - 1].items.push(b);
  }
  return groups.map((group) => {
    const c = gameCounts().get(group.game);
    return `<div class="codex-group">
      <div class="codex-group-head"><span class="eyebrow">${esc(group.game)}</span><span class="fine">${c.cleared}/${c.total} cleared</span></div>
      <div class="boss-list">${group.items.map(bossCard).join("")}</div>
    </div>`;
  }).join("");
}

function progressMarkup() {
  const pct = (state.codex.cleared.length / BOSSES.length) * 100;
  return `<div class="codex-progress">
    <div class="ring" id="codexRing" style="--pct:${pct.toFixed(1)}"><span id="codexRingText">${Math.round(pct)}%</span></div>
    <div>
      <div style="font-size:18px;font-weight:600"><span id="codexCount">${state.codex.cleared.length}</span> of ${BOSSES.length} bosses cleared</div>
      <p class="fine" style="margin-top:4px">Mark fights as cleared to unlock progress. Tips stay available forever.</p>
    </div>
  </div>`;
}

function html() {
  return `<div class="view-head">
    <div>
      <p class="eyebrow">BOSS CODEX</p>
      <h1>Know the <span class="grad-text">fight</span></h1>
      <p>${BOSSES.length} community-tested plans across ${GAME_TAGS.length} games. Weaknesses, phases, and the tips that actually matter.</p>
    </div>
    <span class="chip">${icon("shield")}${state.codex.cleared.length} cleared</span>
  </div>

  <section class="card" style="margin-bottom:16px">
    ${progressMarkup()}
  </section>

  <div class="stack" style="margin-bottom:14px">
    <div class="filter-row">
      <div class="search-wrap">
        ${icon("search")}
        <input class="input" id="codexSearch" type="search" placeholder="Search bosses, regions…" value="${esc(filters.query)}" autocomplete="off" />
      </div>
      <select class="select" id="codexDifficulty" style="width:auto;min-width:140px" aria-label="Filter by difficulty">
        <option value="all">Any difficulty</option>
        ${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${filters.difficulty === String(n) ? "selected" : ""}>Difficulty ${n}</option>`).join("")}
      </select>
      <button class="filter-chip ${filters.hideCleared ? "active" : ""}" type="button" id="hideCleared" aria-pressed="${filters.hideCleared}">${icon("check", "icon-sm")}Hide cleared</button>
    </div>
    <div class="filter-chips" id="gameChips">${chipsMarkup()}</div>
  </div>

  <div id="bossListWrap">${listMarkup()}</div>`;
}

function renderProgress() {
  const pct = (state.codex.cleared.length / BOSSES.length) * 100;
  const ring = rootEl?.querySelector("#codexRing");
  if (ring) ring.style.setProperty("--pct", pct.toFixed(1));
  const txt = rootEl?.querySelector("#codexRingText");
  if (txt) txt.textContent = `${Math.round(pct)}%`;
  const count = rootEl?.querySelector("#codexCount");
  if (count) count.textContent = String(state.codex.cleared.length);
  const chip = rootEl?.querySelector(".view-head .chip");
  if (chip) chip.innerHTML = `${icon("shield")}${state.codex.cleared.length} cleared`;
  const headCount = rootEl?.querySelector(".filter-chips [data-game='all'] .dim");
  if (headCount) headCount.textContent = `${state.codex.cleared.length}/${BOSSES.length}`;
}

function renderList() {
  const wrap = rootEl?.querySelector("#bossListWrap");
  if (wrap) wrap.innerHTML = listMarkup();
  const chips = rootEl?.querySelector("#gameChips");
  if (chips) chips.innerHTML = chipsMarkup();
}

function openBoss(id) {
  const boss = BOSSES.find((b) => b.id === id);
  if (!boss) return;
  const cleared = isCleared(boss.id);
  const { dialog, close } = openDialog(
    `<div class="modal-hero" style="background:radial-gradient(120% 160% at 100% 0%, ${boss.gameColor}2e, transparent 62%), linear-gradient(150deg, rgba(139,92,246,0.16), rgba(255,255,255,0.02))">
      <button class="icon-btn modal-close" type="button" data-close-dialog aria-label="Close">${icon("x")}</button>
      <div class="row" style="gap:8px">
        <span class="badge" style="background:${boss.gameColor}22;color:${boss.gameColor}">${esc(boss.game)}</span>
        ${difficultyDots(boss.difficulty)}
        ${cleared ? `<span class="badge badge-lime">${icon("check")}Cleared</span>` : ""}
      </div>
      <h2 style="margin-top:12px">${esc(boss.name)}</h2>
      <p class="fine" style="margin-top:8px;max-width:46ch">${esc(boss.summary)}</p>
    </div>
    <div class="modal-body">
      <div class="info-grid">
        <div><small>Region</small><b>${esc(boss.region)}</b></div>
        <div><small>Recommended</small><b>${esc(boss.level)}</b></div>
        <div><small>Weakness</small><b>${esc(boss.weakness)}</b></div>
        <div><small>Reward</small><b>${esc(boss.reward)}</b></div>
      </div>
      <h3>Phases</h3>
      ${boss.phases.map((p) => `<div class="phase-row"><b>${esc(p.name)}</b><span>${esc(p.detail)}</span></div>`).join("")}
      <h3>Fight plan</h3>
      <ul class="tip-list">${boss.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" type="button" data-close-dialog>Close</button>
      <button class="btn ${cleared ? "btn-ghost" : "btn-primary"}" type="button" id="toggleClear">${icon(cleared ? "reset" : "check")}${cleared ? "Mark not cleared" : "Mark as cleared"}</button>
    </div>`,
    {
      onMount: (dlg) => {
        dlg.querySelector("#toggleClear").addEventListener("click", () => {
          const nowCleared = !isCleared(boss.id);
          clearBoss(boss.id, nowCleared);
          if (nowCleared) {
            recordEvent("clear", { boss: boss.id });
            const xp = addXp(60);
            toast(`${boss.name} cleared · +60 XP`, { icon: "trophy" });
            if (xp.leveledUp) toast(`Level ${xp.level} reached`, { icon: "spark" });
          } else {
            commit();
            toast(`${boss.name} marked uncleared`, { icon: "reset" });
          }
          commit();
          close();
          renderProgress();
          renderList();
        });
      },
    },
  );
  return dialog;
}

export default {
  mount(root) {
    rootEl = root;
    root.innerHTML = html();

    const search = root.querySelector("#codexSearch");
    search.addEventListener("input", () => {
      filters.query = search.value;
      renderList();
    });
    root.querySelector("#codexDifficulty").addEventListener("change", (event) => {
      filters.difficulty = event.target.value;
      renderList();
    });
    root.querySelector("#hideCleared").addEventListener("click", (event) => {
      filters.hideCleared = !filters.hideCleared;
      event.currentTarget.classList.toggle("active", filters.hideCleared);
      event.currentTarget.setAttribute("aria-pressed", String(filters.hideCleared));
      renderList();
    });
    root.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-game]");
      if (chip) {
        filters.game = chip.dataset.game;
        renderList();
        return;
      }
      if (event.target.closest("#clearFilters")) {
        filters.query = "";
        filters.game = "all";
        filters.difficulty = "all";
        filters.hideCleared = false;
        const searchInput = root.querySelector("#codexSearch");
        if (searchInput) searchInput.value = "";
        const diff = root.querySelector("#codexDifficulty");
        if (diff) diff.value = "all";
        const hide = root.querySelector("#hideCleared");
        if (hide) { hide.classList.remove("active"); hide.setAttribute("aria-pressed", "false"); }
        renderList();
        return;
      }
      const card = event.target.closest("[data-boss]");
      if (card) openBoss(card.dataset.boss);
    });

    if (window.__nexusOpenBoss) {
      const id = window.__nexusOpenBoss;
      window.__nexusOpenBoss = null;
      window.setTimeout(() => openBoss(id), 120);
    }
  },
  destroy() {
    rootEl = null;
  },
};
