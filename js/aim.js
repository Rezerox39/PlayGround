import { AIM_MODES, AIM_TIPS } from "./data.js";
import { state, commit, addXp, recordEvent, bestForMode } from "./store.js";
import { icon, esc, num, clamp, toast } from "./ui.js";

class Sound {
  constructor() { this.ctx = null; }
  ok() { return state.settings.sound; }
  ensure() {
    if (!this.ok()) return null;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!this.ctx) this.ctx = new Ctx();
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    } catch { return null; }
  }
  blip({ freq = 800, end = freq, dur = 0.07, type = "sine", gain = 0.05, delay = 0 }) {
    const ctx = this.ensure();
    if (!ctx) return;
    try {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), t + dur);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain, t + 0.008);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(amp).connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    } catch { /* audio is best effort */ }
  }
  hit(streak) { this.blip({ freq: 620 + Math.min(streak, 14) * 42, end: 980 + Math.min(streak, 14) * 40, dur: 0.06, type: "triangle", gain: 0.055 }); }
  miss() { this.blip({ freq: 180, end: 90, dur: 0.11, type: "square", gain: 0.035 }); }
  end() {
    this.blip({ freq: 523, dur: 0.1, type: "triangle", gain: 0.05 });
    this.blip({ freq: 659, dur: 0.12, type: "triangle", gain: 0.05, delay: 0.09 });
    this.blip({ freq: 784, dur: 0.2, type: "triangle", gain: 0.05, delay: 0.18 });
  }
}

const sound = new Sound();

function modeBadge(mode) {
  return `${mode.name.toUpperCase()} · ${mode.tag.toUpperCase()}`;
}

function gradeFor(score, accuracy, mode) {
  const value = (score / mode.par) * 0.75 + (accuracy / 100) * 0.25;
  if (value >= 1.02) return { grade: "S", pct: 100, headline: "Surgical." };
  if (value >= 0.82) return { grade: "A", pct: 86, headline: "Sharp." };
  if (value >= 0.63) return { grade: "B", pct: 70, headline: "Solid." };
  if (value >= 0.42) return { grade: "C", pct: 54, headline: "Warming up." };
  return { grade: "D", pct: 34, headline: "Keep drilling." };
}

class AimTrainer {
  constructor({ canvas, stage, onHud, onEnd, onTick }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.stage = stage;
    this.onHud = onHud;
    this.onEnd = onEnd;
    this.onTick = onTick;
    this.mode = AIM_MODES.flick;
    this.cssW = 0; this.cssH = 0; this.dpr = 1;
    this.targets = []; this.particles = []; this.floats = [];
    this.running = false; this.raf = null;
    this.startAt = 0; this.pausedAt = 0; this.pausedTotal = 0;
    this.score = 0; this.hits = 0; this.shots = 0; this.streak = 0; this.bestStreak = 0;
    this.reactions = []; this.seq = 0; this.lastHud = 0;
    this.pointer = { x: 0, y: 0, inside: false };
    this.boundTick = this.tick.bind(this);
    this.resize = this.resize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(stage);
    this.canvas.addEventListener("pointerdown", this.onPointer);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.resize();
    this.draw(performance.now());
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = null;
    this.observer.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onPointer);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  resize() {
    const rect = this.stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const oldW = this.cssW || rect.width;
    const oldH = this.cssH || rect.height;
    this.cssW = rect.width; this.cssH = rect.height;
    this.dpr = Math.min(2.5, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.cssW * this.dpr);
    this.canvas.height = Math.round(this.cssH * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const sx = this.cssW / oldW, sy = this.cssH / oldH;
    for (const t of this.targets) { t.x *= sx; t.y *= sy; }
    for (const p of this.particles) { p.x *= sx; p.y *= sy; }
    for (const f of this.floats) { f.x *= sx; f.y *= sy; }
    this.draw(performance.now());
  }

  setMode(id) {
    this.stopRun();
    this.mode = AIM_MODES[id] || AIM_MODES.flick;
    this.targets = []; this.particles = []; this.floats = [];
    this.score = 0; this.hits = 0; this.shots = 0; this.streak = 0; this.bestStreak = 0;
    this.reactions = [];
    this.draw(performance.now());
  }

  stopRun() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = null;
    this.pausedAt = 0; this.pausedTotal = 0;
  }

  start() {
    this.stopRun();
    this.resize();
    this.targets = []; this.particles = []; this.floats = [];
    this.score = 0; this.hits = 0; this.shots = 0; this.streak = 0; this.bestStreak = 0;
    this.reactions = []; this.pausedTotal = 0; this.pausedAt = 0;
    this.running = true;
    this.startAt = performance.now();
    this.lastHud = 0;
    for (let i = 0; i < this.mode.targets; i++) this.spawnTarget();
    this.onHud({ time: this.mode.duration, score: 0, accuracy: null, streak: 0, running: true });
    this.raf = requestAnimationFrame((now) => this.tick(now));
  }

  spawnTarget() {
    const m = this.mode;
    const r = m.radius;
    const padTop = 88;
    const pad = r + 16;
    let x = pad, y = pad, ok = false;
    for (let attempt = 0; attempt < 40 && !ok; attempt++) {
      x = pad + Math.random() * Math.max(1, this.cssW - pad * 2);
      y = padTop + Math.random() * Math.max(1, this.cssH - padTop - pad);
      ok = this.targets.every((t) => Math.hypot(t.x - x, t.y - y) > (t.r + r) * 1.35);
    }
    this.targets.push({ x, y, r, born: performance.now(), phase: Math.random() * Math.PI * 2, id: ++this.seq });
  }

  onPointer(event) {
    if (!this.running) return;
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.shots += 1;
    let hitIndex = -1;
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      if (Math.hypot(t.x - x, t.y - y) <= t.r + (event.pointerType === "touch" ? 8 : 2)) { hitIndex = i; break; }
    }
    if (hitIndex >= 0) {
      const target = this.targets[hitIndex];
      const reaction = Math.max(80, performance.now() - target.born);
      this.reactions.push(reaction);
      this.hits += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      const speed = this.mode.id === "flick" ? clamp(220 - reaction * 0.22, 0, 140) : 0;
      const mult = 1 + Math.min(1.5, Math.floor(this.streak / 5) * 0.15);
      const gained = Math.round((this.mode.baseScore + speed) * mult);
      this.score += gained;
      this.targets.splice(hitIndex, 1);
      this.spawnTarget();
      this.burst(target.x, target.y, this.mode.color);
      this.floats.push({ x: target.x, y: target.y - 8, text: `+${gained}`, life: 1, color: "#e9e5ff" });
      if (this.floats.length > 24) this.floats.splice(0, this.floats.length - 24);
      if (this.particles.length > 220) this.particles.splice(0, this.particles.length - 220);
      sound.hit(this.streak);
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 8);
      this.burst(x, y, "#ff4d6d", 5);
      this.floats.push({ x, y: y - 6, text: "MISS", life: 0.8, color: "#ff8fa3" });
      if (this.floats.length > 24) this.floats.splice(0, this.floats.length - 24);
      if (this.particles.length > 220) this.particles.splice(0, this.particles.length - 220);
      this.stage.classList.remove("shake");
      void this.stage.offsetWidth;
      this.stage.classList.add("shake");
      sound.miss();
    }
    this.updateHud();
  }

  burst(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 190;
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, size: 1.5 + Math.random() * 2.5 });
    }
  }

  onVisibility() {
    if (!this.running) return;
    if (document.hidden) {
      if (!this.pausedAt) this.pausedAt = performance.now();
    } else if (this.pausedAt) {
      this.pausedTotal += performance.now() - this.pausedAt;
      this.pausedAt = 0;
    }
  }

  elapsed(now) {
    return Math.max(0, (now - this.startAt - this.pausedTotal - (this.pausedAt ? now - this.pausedAt : 0)) / 1000);
  }

  tick(now) {
    if (this.running) {
      const elapsed = this.elapsed(now);
      const remaining = Math.max(0, this.mode.duration - elapsed);
      if (remaining <= 0) {
        this.finish(now);
        return;
      }
      if (now - this.lastHud > 60) { this.updateHud(remaining); this.lastHud = now; }
      this.raf = requestAnimationFrame(this.boundTick);
    }
    this.draw(now);
  }

  updateHud(time = this.mode.duration - this.elapsed(performance.now())) {
    this.onHud({
      time: Math.max(0, time),
      score: this.score,
      accuracy: this.shots ? (this.hits / this.shots) * 100 : null,
      streak: this.streak,
      running: this.running,
    });
  }

  draw(now) {
    const ctx = this.ctx;
    if (!this.cssW || !this.cssH) return;
    ctx.clearRect(0, 0, this.cssW, this.cssH);

    for (const t of this.targets) {
      const age = now - t.born;
      const pop = Math.min(1, age / 160);
      const ease = 1 - Math.pow(1 - pop, 3);
      const pulse = 1 + Math.sin(now / 380 + t.phase) * 0.035;
      const r = t.r * ease * pulse;
      if (r <= 0.5) continue;
      ctx.save();
      ctx.shadowColor = this.mode.color;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10, 10, 18, 0.72)";
      ctx.fill();
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = this.mode.color;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r * 0.58, 0, Math.PI * 2);
      ctx.strokeStyle = `${this.mode.color}88`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(t.x, t.y, Math.max(1.8, r * 0.12), 0, Math.PI * 2);
      ctx.fillStyle = "#f3f4fb";
      ctx.fill();
      ctx.restore();
    }

    for (const p of this.particles) {
      p.x += p.vx * 0.016; p.y += p.vy * 0.016;
      p.vx *= 0.94; p.vy *= 0.94; p.vy += 45 * 0.016;
      p.life -= 0.024;
      if (p.life <= 0) continue;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    ctx.globalAlpha = 1;

    for (const f of this.floats) {
      f.y -= 34 * 0.016; f.life -= 0.018;
      if (f.life <= 0) continue;
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = f.color;
      ctx.font = "600 15px 'Space Grotesk', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
    }
    this.floats = this.floats.filter((f) => f.life > 0);
    ctx.globalAlpha = 1;
  }

  finish(now) {
    this.stopRun();
    const accuracy = this.shots ? (this.hits / this.shots) * 100 : 0;
    const avgReaction = this.reactions.length ? this.reactions.reduce((a, b) => a + b, 0) / this.reactions.length : 0;
    const prevBest = bestForMode(this.mode.id);
    const newBest = this.score > prevBest;
    state.aim.runs += 1;
    state.aim.shots += this.shots;
    state.aim.hits += this.hits;
    state.aim.bestCombo = Math.max(state.aim.bestCombo || 0, this.bestStreak);
    if (newBest) state.aim.best[this.mode.id] = this.score;
    state.aim.history.push({
      ts: Date.now(),
      mode: this.mode.id,
      score: this.score,
      accuracy: Math.round(accuracy * 10) / 10,
      reactions: Math.round(avgReaction),
      shots: this.shots,
      hits: this.hits,
      streak: this.bestStreak,
    });
    if (state.aim.history.length > 40) state.aim.history.splice(0, state.aim.history.length - 40);
    recordEvent("run", { mode: this.mode.id, score: this.score, accuracy: Math.round(accuracy * 10) / 10, shots: this.shots, hits: this.hits });
    const xp = Math.round(this.score / 8) + 10 + (newBest ? 40 : 0);
    const level = addXp(xp);
    sound.end();
    this.updateHud(0);
    this.onEnd({
      mode: this.mode,
      score: this.score,
      accuracy,
      avgReaction,
      bestStreak: this.bestStreak,
      hits: this.hits,
      shots: this.shots,
      newBest,
      xp,
      leveledUp: level.leveledUp,
      level: level.level,
    });
  }
}

let trainer = null;
let currentMode = "flick";
let rootEl = null;

function coachNotes() {
  const day = Math.floor(Date.now() / 86400000);
  const picks = [AIM_TIPS[day % AIM_TIPS.length], AIM_TIPS[(day + 2) % AIM_TIPS.length], AIM_TIPS[(day + 4) % AIM_TIPS.length]];
  return picks.map((tip) => `<div class="tip">${icon("check")}<span>${esc(tip)}</span></div>`).join("");
}

function pbRows() {
  return Object.values(AIM_MODES).map((mode) => {
    const best = bestForMode(mode.id);
    return `<button class="pb-row ${mode.id === currentMode ? "active" : ""}" type="button" data-mode="${mode.id}" aria-label="Start ${mode.name} drill">
      <span><span class="pb-name">${esc(mode.name)} ${mode.id === currentMode ? `<span class="badge badge-violet">ACTIVE</span>` : ""}</span><span class="pb-desc">${esc(mode.blurb.split(".")[0])}.</span></span>
      <b class="tnum">${best ? num(best) : "—"}</b>
    </button>`;
  }).join("");
}

function html() {
  const mode = AIM_MODES[currentMode];
  const best = bestForMode(currentMode);
  return `<div class="view-head">
    <div>
      <p class="eyebrow">AIM LAB</p>
      <h1>Train the <span class="grad-text">click</span></h1>
      <p>30-second drills with honest feedback. No ranks to protect, no teammates to blame.</p>
    </div>
    <div class="seg" id="modeSeg" role="group" aria-label="Drill mode">
      ${Object.values(AIM_MODES).map((m) => `<button type="button" data-mode-tab="${m.id}" class="${m.id === currentMode ? "active" : ""}" aria-pressed="${m.id === currentMode}">${esc(m.name)}</button>`).join("")}
    </div>
  </div>

  <div class="aim-stage" id="aimStage">
    <canvas class="aim-canvas" id="aimCanvas" aria-label="Aim training arena"></canvas>
    <div class="aim-hud" aria-live="off">
      <div class="hud-cluster">
        <div class="hud hud-time"><small>Time</small><b id="hudTime">30.0</b></div>
        <div class="hud"><small>Score</small><b id="hudScore">0</b></div>
      </div>
      <div class="hud-cluster">
        <div class="hud"><small>Acc</small><b id="hudAcc">—</b></div>
        <div class="hud"><small>Streak</small><b id="hudStreak">0</b></div>
      </div>
    </div>
    <div class="aim-combo" id="aimCombo"></div>
    <div class="aim-overlay" id="aimOverlay">
      <div class="aim-intro" id="aimIntro">
        <span class="badge badge-violet" id="introBadge">${esc(modeBadge(mode))}</span>
        <h3 id="introTitle">${esc(mode.name)}</h3>
        <p id="introDesc">${esc(mode.blurb)}</p>
        <div class="aim-best"><span class="chip">${icon("trophy")}PB <b id="introBest" style="color:var(--text)">${best ? num(best) : "—"}</b></span><span class="chip">${icon("timer")}${mode.duration}s</span></div>
        <button class="btn btn-primary btn-block" type="button" data-start>${icon("play")}Start drill</button>
        <p class="fine" style="margin-top:12px">Click or tap targets. Press <b>Space</b> to start. Progress saves locally.</p>
      </div>
      <div class="aim-result" id="aimResult" hidden></div>
    </div>
  </div>

  <div class="aim-below">
    <section class="card">
      <div class="card-head">
        <div class="card-title">${icon("trophy")}Personal bests</div>
        <span class="card-note">Tap to drill</span>
      </div>
      <div class="pb-list" id="pbList">${pbRows()}</div>
    </section>
    <section class="card">
      <div class="card-head">
        <div class="card-title">${icon("spark")}Coach notes</div>
        <span class="card-note">Rotates daily</span>
      </div>
      <div class="tips">${coachNotes()}</div>
      <div class="row" style="margin-top:16px;gap:8px">
        <span class="chip">${icon("mouse")}Low sens builds control</span>
        <span class="chip">${icon("timer")}Short, focused runs</span>
      </div>
    </section>
  </div>`;
}

function setHud({ time, score, accuracy, streak }) {
  const t = document.getElementById("hudTime");
  const s = document.getElementById("hudScore");
  const a = document.getElementById("hudAcc");
  const k = document.getElementById("hudStreak");
  const combo = document.getElementById("aimCombo");
  if (t) t.textContent = time.toFixed(1);
  if (s) s.textContent = num(score);
  if (a) a.textContent = accuracy === null ? "—" : `${Math.round(accuracy)}%`;
  if (k) k.textContent = String(streak);
  if (combo) {
    combo.textContent = streak >= 3 ? `STREAK ×${streak}` : "";
    combo.classList.toggle("show", streak >= 3);
  }
}

function showIntro() {
  const mode = AIM_MODES[currentMode];
  document.getElementById("aimOverlay").classList.remove("hidden");
  document.getElementById("aimIntro").hidden = false;
  const result = document.getElementById("aimResult");
  result.hidden = true;
  document.getElementById("introBadge").textContent = modeBadge(mode);
  document.getElementById("introTitle").textContent = mode.name;
  document.getElementById("introDesc").textContent = mode.blurb;
  const best = bestForMode(currentMode);
  document.getElementById("introBest").textContent = best ? num(best) : "—";
  setHud({ time: mode.duration, score: 0, accuracy: null, streak: 0 });
}

function showResult(result) {
  const overlay = document.getElementById("aimOverlay");
  const intro = document.getElementById("aimIntro");
  const box = document.getElementById("aimResult");
  const g = gradeFor(result.score, result.accuracy, result.mode);
  intro.hidden = true;
  box.hidden = false;
  overlay.classList.remove("hidden");
  const acc = result.shots ? `${result.accuracy.toFixed(1)}%` : "—";
  const reaction = result.avgReaction ? `${Math.round(result.avgReaction)} ms` : "—";
  const accText = result.accuracy >= 80 ? "Excellent click discipline." : result.accuracy >= 60 ? "Solid. Tighten the misses." : "Slow down and prioritize hits.";
  box.innerHTML = `
    <div class="grade" style="--pct:${g.pct}"><span>${g.grade}</span></div>
    ${result.newBest ? '<div class="new-best">New personal best</div>' : `<div class="badge badge-violet">${esc(result.mode.name)} complete</div>`}
    <h3 style="margin-top:6px">${esc(g.headline)}</h3>
    <p class="fine" style="margin-top:6px">${esc(accText)} ${result.bestStreak >= 5 ? `Best streak ×${result.bestStreak}.` : ""}</p>
    <div class="result-grid">
      <div class="result-cell"><small>Score</small><b>${num(result.score)}</b></div>
      <div class="result-cell"><small>Accuracy</small><b>${acc}</b></div>
      <div class="result-cell"><small>Avg react</small><b>${reaction}</b></div>
    </div>
    <p class="fine" style="margin-bottom:14px">+${result.xp} XP earned${result.leveledUp ? ` · Level ${result.level}` : ""}</p>
    <div class="result-actions">
      <button class="btn btn-primary" type="button" data-again>${icon("play")}Run it back</button>
      <button class="btn btn-ghost" type="button" data-done>Done</button>
    </div>`;
}

function refreshPb() {
  const list = document.getElementById("pbList");
  if (list) list.innerHTML = pbRows();
  document.querySelectorAll("[data-mode-tab]").forEach((btn) => {
    const active = btn.dataset.modeTab === currentMode;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

function startRun() {
  const overlay = document.getElementById("aimOverlay");
  overlay.classList.add("hidden");
  document.getElementById("aimCombo")?.classList.remove("show");
  trainer.start();
}

function switchMode(id, autoStart = false) {
  currentMode = AIM_MODES[id] ? id : "flick";
  state.aim.lastMode = currentMode;
  commit();
  trainer.setMode(currentMode);
  showIntro();
  refreshPb();
  if (autoStart) window.setTimeout(startRun, 60);
}

export default {
  mount(root) {
    rootEl = root;
    root.innerHTML = html();
    trainer = null;

    const canvas = root.querySelector("#aimCanvas");
    const stage = root.querySelector("#aimStage");
    trainer = new AimTrainer({
      canvas,
      stage,
      onHud: setHud,
      onEnd: (result) => {
        showResult(result);
        refreshPb();
        if (result.newBest) toast(`New ${result.mode.name} PB · ${num(result.score)}`, { icon: "trophy" });
        if (result.leveledUp) toast(`Level ${result.level} reached`, { icon: "spark" });
      },
    });
    trainer.setMode(currentMode);
    showIntro();

    const onModeTab = (event) => {
      const btn = event.target.closest("[data-mode-tab]");
      if (btn) switchMode(btn.dataset.modeTab);
    };
    const onOverlayClick = (event) => {
      if (event.target.closest("[data-start]")) { startRun(); return; }
      if (event.target.closest("[data-again]")) { startRun(); return; }
      if (event.target.closest("[data-done]")) { showIntro(); refreshPb(); }
    };
    const onPbClick = (event) => {
      const row = event.target.closest("[data-mode]");
      if (row) switchMode(row.dataset.mode, true);
    };
    const onKey = (event) => {
      if (event.code === "Space" && !event.repeat) {
        const active = document.activeElement;
        if (active && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(active.tagName)) return;
        event.preventDefault();
        if (!trainer.running) {
          const overlay = document.getElementById("aimOverlay");
          if (!overlay.classList.contains("hidden")) startRun();
        }
      }
    };

    root.addEventListener("click", onModeTab);
    root.addEventListener("click", onOverlayClick);
    root.addEventListener("click", onPbClick);
    window.addEventListener("keydown", onKey);
    root.__cleanup = () => {
      window.removeEventListener("keydown", onKey);
    };

    if (window.__nexusAutoStart) {
      window.__nexusAutoStart = false;
      window.setTimeout(startRun, 280);
    }
  },
  destroy() {
    if (rootEl && rootEl.__cleanup) rootEl.__cleanup();
    if (trainer) trainer.dispose();
    trainer = null;
    rootEl = null;
  },
};
