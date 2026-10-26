import { state, commit, resetProgress, levelProgress, lifetimeStats, achievements, formatXp } from "./store.js";
import { BOSSES } from "./data.js";
import { icon, esc, num, toast, copyText, confirmDialog } from "./ui.js";

let lastFocus = null;

function rankTitle(level) {
  if (level >= 12) return "Apex Operator";
  if (level >= 8) return "Specialist";
  if (level >= 5) return "Operator";
  if (level >= 3) return "Contender";
  return "Rookie";
}

function stat(label, value, suffix = "") {
  return `<div class="profile-stat"><b class="tnum">${value}${suffix}</b><small>${esc(label)}</small></div>`;
}

function content() {
  const stats = lifetimeStats();
  const level = levelProgress();
  const list = achievements();
  const unlocked = list.filter((a) => a.unlocked).length;
  const sound = state.settings.sound;
  const motion = state.settings.motion;
  const totalXpToNext = Math.max(0, level.next - state.xp);
  const xpPct = Math.max(0, Math.min(100, level.pct));

  return `<div class="profile-hero">
    <div class="profile-avatar">NX</div>
    <div style="flex:1;min-width:0">
      <h2>Operator</h2>
      <p>${esc(rankTitle(level.level))} · Level ${level.level}</p>
      <div class="xp-track">
        <div class="progress"><span style="width:${xpPct}%"></span></div>
        <div class="progress-meta"><span>${formatXp(state.xp)} XP</span><span>${formatXp(totalXpToNext)} XP to ${level.level + 1}</span></div>
      </div>
    </div>
  </div>

  <div class="profile-stats">
    ${stat("Aim drills", num(stats.runs))}
    ${stat("Lifetime accuracy", stats.accuracy || 0, "%")}
    ${stat("Best score", num(stats.bestScore))}
    ${stat("Day streak", stats.streak)}
    ${stat("Bosses cleared", `${stats.cleared}/${BOSSES.length}`)}
    ${stat("Saved loadouts", stats.saved)}
  </div>

  <div class="sheet-section">
    <div class="spread" style="margin-bottom:10px">
      <div class="card-title" style="margin:0">${icon("trophy")}Achievements</div>
      <span class="card-note">${unlocked}/${list.length}</span>
    </div>
    <div class="ach-grid">
      ${list.map((a) => `<div class="ach ${a.unlocked ? "" : "locked"}" title="${esc(a.desc)}">
        <span class="ach-icon">${icon(a.icon)}</span>
        <span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></span>
      </div>`).join("")}
    </div>
  </div>

  <div class="sheet-section">
    <div class="card-title" style="margin-bottom:6px">${icon("user")}Settings</div>
    <div class="setting-row">
      <div><b>Sound effects</b><small>Hit markers and drill audio</small></div>
      <button class="switch" type="button" role="switch" aria-checked="${sound}" aria-label="Sound effects" data-setting="sound"></button>
    </div>
    <div class="setting-row">
      <div><b>Animations</b><small>Disable ambient motion for focus</small></div>
      <button class="switch" type="button" role="switch" aria-checked="${motion}" aria-label="Animations" data-setting="motion"></button>
    </div>
    <div class="setting-row">
      <div><b>Offline ready</b><small>Install NEXUS as an app</small></div>
      <button class="btn btn-ghost btn-sm" type="button" data-install>${icon("download")}Install</button>
    </div>
  </div>

  <div class="sheet-actions">
    <button class="btn btn-soft btn-block" type="button" data-share>${icon("spark")}Share my progress</button>
    <button class="btn btn-danger btn-block" type="button" data-reset>${icon("reset")}Reset all progress</button>
  </div>

  <p class="disclaimer">NEXUS is a fan-made training companion and is not affiliated with, endorsed by, or sponsored by any game publisher. All game names and boss names belong to their respective owners. Progress is stored locally on this device. <a href="privacy.html" target="_blank" rel="noopener" style="color:var(--violet-soft);font-weight:600">Privacy policy</a></p>`;
}

function render() {
  const box = document.getElementById("profileContent");
  if (box) box.innerHTML = content();
}

function applySettings() {
  document.body.classList.toggle("reduced-motion", !state.settings.motion);
}

export function openProfile() {
  lastFocus = document.activeElement;
  render();
  const sheet = document.getElementById("profileSheet");
  const scrim = document.getElementById("scrim");
  if (!sheet || !scrim) return;
  sheet.classList.add("open");
  sheet.setAttribute("aria-hidden", "false");
  scrim.hidden = false;
  document.body.classList.add("sheet-open");
  const closeBtn = sheet.querySelector("[data-close-profile]");
  window.setTimeout(() => closeBtn?.focus(), 60);
}

export function closeProfile() {
  const sheet = document.getElementById("profileSheet");
  const scrim = document.getElementById("scrim");
  if (!sheet || !scrim) return;
  sheet.classList.remove("open");
  sheet.setAttribute("aria-hidden", "true");
  scrim.hidden = true;
  document.body.classList.remove("sheet-open");
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
}

export function mountProfile() {
  const box = document.getElementById("profileContent");
  if (!box || box.dataset.bound) return;
  box.dataset.bound = "1";

  box.addEventListener("click", async (event) => {
    const setting = event.target.closest("[data-setting]");
    if (setting) {
      const key = setting.dataset.setting;
      state.settings[key] = !state.settings[key];
      commit();
      setting.setAttribute("aria-checked", String(state.settings[key]));
      applySettings();
      toast(`${key === "sound" ? "Sound" : "Animations"} ${state.settings[key] ? "on" : "off"}`, { icon: key === "sound" ? (state.settings[key] ? "volume" : "mute") : "spark" });
      return;
    }
    if (event.target.closest("[data-install]")) {
      document.dispatchEvent(new CustomEvent("nexus:install"));
      return;
    }
    if (event.target.closest("[data-share]")) {
      const stats = lifetimeStats();
      const text = `NEXUS — Level ${stats.level} ${rankTitle(stats.level)} · Best aim score ${num(stats.bestScore)} · ${stats.cleared}/${BOSSES.length} bosses cleared. Train smarter.`;
      try {
        if (navigator.share) {
          await navigator.share({ title: "NEXUS — Game Helper", text, url: location.href });
          return;
        }
      } catch { /* user cancelled */ return; }
      const ok = await copyText(`${text} ${location.href}`);
      toast(ok ? "Progress summary copied" : "Could not share", { tone: ok ? undefined : "warn" });
      return;
    }
    if (event.target.closest("[data-reset]")) {
      const yes = await confirmDialog({
        title: "Reset all progress?",
        message: "This deletes your XP, aim history, saved loadouts, and cleared bosses from this device. It cannot be undone.",
        confirmLabel: "Reset everything",
        cancelLabel: "Keep my progress",
        danger: true,
      });
      if (!yes) return;
      resetProgress();
      closeProfile();
      window.location.hash = "#/home";
      window.location.reload();
    }
  });
}

export { applySettings, rankTitle };
