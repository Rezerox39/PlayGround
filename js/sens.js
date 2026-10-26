import { SENS_GAMES, SENS_PRESETS } from "./data.js";
import { state, commit, recordEvent } from "./store.js";
import { icon, esc, num, formatSens, clamp, toast, copyText, debounce } from "./ui.js";
import { cm360For, sensForCm, eDPI, gameById } from "./calc.js";

let rootEl = null;
let persist = null;

function readValues() {
  const game = document.getElementById("sensGame")?.value || state.sens.game;
  const dpi = Number(document.getElementById("sensDpi")?.value ?? state.sens.dpi);
  const sens = Number(document.getElementById("sensValue")?.value ?? state.sens.sens);
  const pad = Number(document.getElementById("sensPad")?.value ?? state.sens.pad);
  return { game, dpi, sens, pad };
}

function conversions(dpi, cm) {
  return SENS_GAMES.map((g) => ({ game: g, value: sensForCm(g.id, dpi, cm) }));
}

function rowsMarkup(list, sourceId) {
  return list.map(({ game, value }) => `<div class="convert-row ${game.id === sourceId ? "active" : ""}">
    <span class="game-dot" style="background:${game.color}"></span>
    <span class="name">${esc(game.name)}${game.id === sourceId ? ' <span class="badge badge-violet">SOURCE</span>' : ""}<small>${esc(game.note)}</small></span>
    <span class="val">${value ? formatSens(value) : "—"}</span>
    <button class="copy-btn" type="button" data-copy="${esc(value ? formatSens(value) : "")}" data-game="${game.id}" title="Copy ${esc(game.name)} sensitivity" aria-label="Copy ${esc(game.name)} sensitivity">${icon("copy", "icon-sm")}</button>
  </div>`).join("");
}

function readoutMarkup() {
  const { game, dpi, sens, pad } = readValues();
  const cm = cm360For(game, dpi, sens);
  const edpi = eDPI(dpi, sens);
  const g = gameById(game);
  const pct = cm ? clamp(((cm - 10) / 50) * 95 + 5, 5, 100) : 0;
  const swipes = cm && pad ? pad / 10 / cm : 0;
  const perSwipe = cm && pad ? (pad / 10 / cm) * 360 : 0;
  return `<div class="dial" id="sensDial" style="--pct:${pct.toFixed(1)}">
      <div class="dial-inner">
        <div>
          <div class="dial-value" id="dialValue">${cm ? cm.toFixed(1) : "—"}</div>
          <div class="dial-unit">cm / 360°</div>
        </div>
      </div>
    </div>
    <div class="sens-readout">
      <div class="eyebrow">YOUR TRUE SENSITIVITY</div>
      <h3>${cm ? `${cm.toFixed(1)} cm for a full turn` : "Enter a valid DPI and sensitivity"}</h3>
      <p class="fine">${esc(g.name)} · ${num(dpi)} DPI · in-game ${formatSens(sens) || "—"}${cm ? ` · <b style="color:var(--text)">${num(edpi)} eDPI</b>` : ""}</p>
      <div class="sens-meta">
        <div><small>eDPI</small><b class="tnum">${edpi ? num(edpi) : "—"}</b></div>
        <div><small>Full pad swipes</small><b class="tnum">${swipes ? swipes.toFixed(2) : "—"}</b></div>
        <div><small>One swipe covers</small><b class="tnum">${perSwipe ? Math.round(perSwipe) + "°" : "—"}</b></div>
        <div><small>Mousepad</small><b class="tnum">${pad ? num(pad) + " mm" : "—"}</b></div>
      </div>
    </div>`;
}

function padMarkup() {
  const { game, dpi, sens, pad } = readValues();
  const cm = cm360For(game, dpi, sens);
  if (!cm || !pad) return "";
  const width = clamp((cm / (pad / 10)) * 100, 6, 100);
  const swipes = pad / 10 / cm;
  return `<div class="pad-visual" aria-hidden="true"><div class="pad-sweep" style="width:${width}%">${Math.round(width)}%</div></div>
    <p class="fine" style="margin-top:8px">${swipes.toFixed(2)} full pad swipes to turn 360°. ${swipes < 1 ? "A full 360° fits inside one pad sweep." : swipes > 2.5 ? "Expect a lot of lifting and re-centering." : "A comfortable range for most players."}</p>`;
}

function html() {
  const { game, dpi, sens, pad } = state.sens;
  const list = conversions(dpi, cm360For(game, dpi, sens));
  return `<div class="view-head">
    <div>
      <p class="eyebrow">SENSITIVITY LAB</p>
      <h1>Dial in your <span class="grad-text">cm/360</span></h1>
      <p>Stop guessing between games. Convert once, keep the same physical mouse feel everywhere.</p>
    </div>
    <span class="chip">${icon("crosshair")}${SENS_GAMES.length} games supported</span>
  </div>

  <div class="sens-grid">
    <div class="stack">
      <section class="card">
        <div class="card-head">
          <div class="card-title">${icon("mouse")}Your setup</div>
          <span class="card-note">Saved locally</span>
        </div>
        <div class="form-grid">
          <div class="field span-2">
            <label for="sensGame">Source game</label>
            <select class="select" id="sensGame">
              ${SENS_GAMES.map((g) => `<option value="${g.id}" ${g.id === game ? "selected" : ""}>${esc(g.name)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="sensDpi">Mouse DPI</label>
            <div class="input-suffix"><input class="input" id="sensDpi" type="number" inputmode="numeric" min="100" max="32000" step="50" value="${dpi}" /><span>DPI</span></div>
          </div>
          <div class="field">
            <label for="sensValue">In-game sens</label>
            <div class="input-suffix"><input class="input" id="sensValue" type="number" inputmode="decimal" min="0.001" max="100" step="0.001" value="${sens}" /><span>SENS</span></div>
          </div>
          <div class="field span-2">
            <label for="sensPad">Mousepad width</label>
            <div class="input-suffix"><input class="input" id="sensPad" type="number" inputmode="numeric" min="100" max="1200" step="10" value="${pad}" /><span>MM</span></div>
          </div>
        </div>
        <div style="margin-top:16px">
          <div class="label" style="margin-bottom:8px">Quick targets</div>
          <div class="preset-row" id="presetRow">
            ${SENS_PRESETS.map((p) => `<button class="chip" type="button" data-preset="${p.cm}">${esc(p.label)} <span style="color:var(--dim)">${esc(p.tag)}</span></button>`).join("")}
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div class="card-title">${icon("target")}Mousepad match</div>
          <span class="card-note">Physical check</span>
        </div>
        <div id="padWrap">${padMarkup()}</div>
      </section>
    </div>

    <div class="stack">
      <section class="card">
        <div class="sens-hero" id="sensHero">${readoutMarkup()}</div>
      </section>

      <section class="card">
        <div class="card-head">
          <div class="card-title">${icon("crosshair")}Converted sensitivity</div>
          <button class="link-btn" type="button" id="copyAll">${icon("copy", "icon-sm")}Copy all</button>
        </div>
        <div class="convert-list" id="convertList">${rowsMarkup(list, game)}</div>
        <div class="help-note" style="margin-top:14px">Same cm/360 across games at the same DPI. Scoped/ADS multipliers and FOV are not applied — tune those in-game. Constants can change with patches.</div>
      </section>
    </div>
  </div>

  <section class="card" style="margin-top:16px">
    <div class="card-head">
      <div class="card-title">${icon("info")}How cm/360 works</div>
      <span class="card-note">60-second read</span>
    </div>
    <div class="sens-faq">
      <div><b>cm/360°</b><p>The physical distance you move your mouse to complete one full turn. It is the only number that transfers fairly between games.</p></div>
      <div><b>eDPI</b><p>DPI × in-game sensitivity. Useful within one game, misleading across games because each engine uses a different yaw constant.</p></div>
      <div><b>How to test</b><p>Open a training range, place your mouse at the pad's left edge, and swipe until you have turned exactly 360°. Adjust until the swipe matches your target.</p></div>
    </div>
  </section>`;
}

function refresh() {
  if (!rootEl) return;
  const hero = rootEl.querySelector("#sensHero");
  if (hero) hero.innerHTML = readoutMarkup();
  const list = rootEl.querySelector("#convertList");
  const { game, dpi, sens } = readValues();
  if (list) list.innerHTML = rowsMarkup(conversions(dpi, cm360For(game, dpi, sens)), game);
  const padWrap = rootEl.querySelector("#padWrap");
  if (padWrap) padWrap.innerHTML = padMarkup();
}

function scheduleSave(values) {
  if (!persist) {
    persist = debounce(() => {
      const v = readValues();
      if (v.dpi > 0) state.sens.game = v.game;
      if (v.dpi > 0) state.sens.dpi = v.dpi;
      if (v.sens > 0) state.sens.sens = v.sens;
      if (v.pad > 0) state.sens.pad = v.pad;
      commit();
    }, 300);
  }
  persist(values);
}

function applyPreset(cm) {
  const { game, dpi } = readValues();
  const value = sensForCm(game, dpi, cm);
  if (!value) return;
  const input = document.getElementById("sensValue");
  if (input) input.value = Number(value.toFixed(4));
  state.sens.game = game;
  state.sens.dpi = dpi;
  state.sens.sens = Number(value.toFixed(4));
  recordEvent("sens", { cm });
  commit();
  refresh();
  toast(`${cm} cm/360° applied to ${gameById(game).short}`, { icon: "crosshair" });
}

export default {
  mount(root) {
    rootEl = root;
    root.innerHTML = html();
    refresh();

    const onInput = () => {
      const v = readValues();
      if (v.dpi > 0 && v.sens > 0) scheduleSave(v);
      refresh();
    };
    root.addEventListener("input", onInput);
    root.addEventListener("change", onInput);

    root.addEventListener("click", async (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { applyPreset(Number(preset.dataset.preset)); return; }
      const copyBtn = event.target.closest("[data-copy]");
      if (copyBtn) {
        const value = copyBtn.dataset.copy;
        if (!value) return;
        const ok = await copyText(value);
        const gameName = gameById(copyBtn.dataset.game).short;
        toast(ok ? `${gameName} sens ${value} copied` : "Copy failed", { tone: ok ? undefined : "warn" });
        return;
      }
      if (event.target.closest("#copyAll")) {
        const { game, dpi, sens } = readValues();
        const cm = cm360For(game, dpi, sens);
        const text = conversions(dpi, cm).map(({ game: g, value }) => `${g.name}: ${formatSens(value)}`).join("\n");
        const ok = await copyText(text);
        toast(ok ? "All sensitivities copied" : "Copy failed", { tone: ok ? undefined : "warn" });
      }
    });
  },
  destroy() {
    persist = null;
    rootEl = null;
  },
};
