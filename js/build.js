import { WEAPONS, ATTACHMENT_SLOTS } from "./data.js";
import { state, commit, recordEvent, addXp } from "./store.js";
import { icon, esc, num, toast, openDialog } from "./ui.js";
import { attachmentOption, computeLoadout } from "./calc.js";

let rootEl = null;

function weapon() {
  return WEAPONS.find((w) => w.id === state.build.current.weapon) || WEAPONS[0];
}

function loadout() {
  return computeLoadout(weapon(), state.build.current.attachments);
}

function miniBars(w) {
  const cells = [
    Math.round(w.dmg / 25),
    Math.round(w.rpm / 180),
    Math.round(w.range / 20),
    Math.round(w.control / 20),
    Math.round(w.handling / 20),
  ];
  return `<span class="mini-bars">${cells.map((v) => `<i class="${v > 0 ? "on" : ""}"></i>`).join("")}</span>`;
}

function weaponStrip() {
  return WEAPONS.map((w) => `<button class="weapon-card ${w.id === weapon().id ? "active" : ""}" type="button" data-weapon="${w.id}" aria-pressed="${w.id === weapon().id}">
      <span class="wclass">${esc(w.class)}</span>
      <b>${esc(w.name)}</b>
      <small>${esc(w.tag)}</small>
      ${miniBars(w)}
    </button>`).join("");
}

function attachmentGrid() {
  return ATTACHMENT_SLOTS.map((slot) => {
    const current = state.build.current.attachments[slot.id] || "none";
    return `<div class="attach">
      <small>${esc(slot.label)}</small>
      <select data-slot="${slot.id}" aria-label="${esc(slot.label)} attachment">
        ${slot.options.map((o) => `<option value="${o.id}" ${o.id === current ? "selected" : ""}>${esc(o.label)}</option>`).join("")}
      </select>
    </div>`;
  }).join("");
}

function bar(label, value, opts = {}) {
  const tone = value < 38 ? "low" : value > 75 ? "high" : "";
  return `<div class="stat-bar-row"><span>${esc(label)}</span><div class="stat-bar ${tone}"><i style="width:${value}%"></i></div><b>${value}</b></div>`;
}

function statsMarkup() {
  const w = weapon();
  const data = loadout();
  const stats = data.stats;
  return `<div class="stat-bars">
      ${bar("Damage", stats.damage)}
      ${bar("Range", stats.range)}
      ${bar("Control", stats.control)}
      ${bar("Handling", stats.handling)}
      ${bar("Fire rate", stats.fireRate)}
    </div>
    <div style="height:1px;background:var(--line);margin:16px 0"></div>
    <div class="stat-bar-row" style="grid-template-columns:1fr auto;gap:4px 10px;margin-bottom:12px">
      <span>DPS · body</span><b style="font-size:16px;color:var(--text)">${num(data.dps)}</b>
      <span>DPS · head</span><b style="font-size:16px;color:var(--text)">${num(data.headDps)}</b>
    </div>
    <div class="ttk-grid">
      ${data.ttk.map((t) => `<div class="ttk"><small>${t.hp} HP</small><b>${t.ms ? num(t.ms) : "0"}</b><span> ms · ${t.shots} hit${t.shots > 1 ? "s" : ""}</span></div>`).join("")}
    </div>
    <div class="row" style="margin-top:12px">
      <span class="chip">${icon("layers")}${data.mag} rounds</span>
      <span class="chip">${icon("zap")}${num(w.rpm)} RPM</span>
      <span class="chip">${icon("sword")}${data.pellets > 1 ? `${w.dmg} × ${data.pellets} pellets` : `${num(data.bodyDamage)} dmg`}</span>
    </div>
    <p class="fine" style="margin-top:12px">${esc(w.desc)}</p>`;
}

function savedMarkup() {
  const saved = state.build.saved;
  if (!saved.length) return `<div class="empty">${icon("layers")}<div style="margin-top:8px">No saved loadouts yet. Tune the build, then save it.</div></div>`;
  return saved.map((entry) => {
    const w = WEAPONS.find((x) => x.id === entry.weapon) || WEAPONS[0];
    return `<div class="saved-row">
      <span class="badge badge-violet">${esc(w.class.split(" ").map((p) => p[0]).join(""))}</span>
      <span class="name">${esc(entry.name)}<small>${esc(w.name)} · ${esc(entry.summary || "")}</small></span>
      <button class="btn btn-ghost btn-sm" type="button" data-apply="${entry.id}">Apply</button>
      <button class="icon-btn" type="button" data-delete="${entry.id}" aria-label="Delete ${esc(entry.name)}" style="width:34px;height:34px">${icon("trash", "icon-sm")}</button>
    </div>`;
  }).join("");
}

function html() {
  const w = weapon();
  return `<div class="view-head">
    <div>
      <p class="eyebrow">BUILD LAB</p>
      <h1>Build a <span class="grad-text">loadout</span></h1>
      <p>Plan the trade-offs before the match. Every attachment changes the math.</p>
    </div>
    <span class="chip">${icon("info")}Simulation model</span>
  </div>

  <div class="build-grid">
    <div class="stack">
      <section class="card">
        <div class="card-head">
          <div class="card-title">${icon("sword")}Primary weapon</div>
          <span class="card-note">${WEAPONS.length} archetypes</span>
        </div>
        <div class="weapon-strip">${weaponStrip()}</div>
      </section>

      <section class="card">
        <div class="card-head">
          <div class="card-title">${icon("layers")}Attachments</div>
          <button class="link-btn" type="button" id="resetAttach">${icon("reset", "icon-sm")}Reset</button>
        </div>
        <div class="attach-grid">${attachmentGrid()}</div>
      </section>
    </div>

    <div class="stack">
      <section class="card">
        <div class="card-head">
          <div class="card-title">${icon("zap")}Effective stats</div>
          <span class="badge">${esc(w.class)}</span>
        </div>
        <div id="statsWrap">${statsMarkup()}</div>
      </section>

      <section class="card">
        <div class="card-head">
          <div class="card-title">${icon("trophy")}Saved loadouts</div>
          <span class="card-note">${state.build.saved.length} / 20</span>
        </div>
        <div class="saved-list" id="savedList">${savedMarkup()}</div>
        <button class="btn btn-primary btn-block" type="button" id="saveBuild" style="margin-top:12px" ${state.build.saved.length >= 20 ? "disabled" : ""}>${icon("plus")}Save this loadout</button>
        <p class="fine" style="margin-top:10px">Stats are an illustrative planning model, not publisher weapon data.</p>
      </section>
    </div>
  </div>`;
}

function paint() {
  if (!rootEl) return;
  rootEl.innerHTML = html();
}

function updateStats() {
  const wrap = rootEl?.querySelector("#statsWrap");
  if (wrap) wrap.innerHTML = statsMarkup();
  const badge = rootEl?.querySelector('.card-head .badge');
  if (badge) badge.textContent = weapon().class;
}

function summarize() {
  const w = weapon();
  const active = ATTACHMENT_SLOTS.map((slot) => {
    const option = attachmentOption(slot.id, state.build.current.attachments[slot.id]);
    return option && option.id !== "none" ? option.label : null;
  }).filter(Boolean);
  return `${w.name}${active.length ? ` · ${active.slice(0, 2).join(", ")}` : ""}`;
}

function saveLoadout() {
  const w = weapon();
  const suggested = `${w.name} build`;
  const { dialog, close } = openDialog(
    `<div class="modal-body" style="padding:24px">
      <span class="eyebrow">SAVE LOADOUT</span>
      <h2 style="margin-top:6px">Name your build</h2>
      <p class="fine" style="margin-top:6px">Visible only on this device.</p>
      <div class="field" style="margin-top:16px">
        <label for="loadoutName">Loadout name</label>
        <input class="input" id="loadoutName" maxlength="32" value="${esc(suggested)}" autocomplete="off" />
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" type="button" data-close-dialog>Cancel</button>
      <button class="btn btn-primary" type="button" id="confirmSave">${icon("check")}Save</button>
    </div>`,
    {
      onMount: (dlg, done) => {
        const input = dlg.querySelector("#loadoutName");
        input.focus();
        input.select();
        const submit = () => {
          const name = input.value.trim().slice(0, 32) || suggested;
          const id = `lo_${Date.now().toString(36)}`;
          const summary = summarize().replace(`${w.name} · `, "");
          state.build.saved.unshift({
            id,
            name,
            weapon: w.id,
            attachments: { ...state.build.current.attachments },
            summary: summary || w.class,
            ts: Date.now(),
          });
          if (state.build.saved.length > 20) state.build.saved.length = 20;
          recordEvent("save", { weapon: w.id });
          const xp = addXp(40);
          done();
          paint();
          toast(`"${name}" saved · +40 XP`, { icon: "layers" });
          if (xp.leveledUp) toast(`Level ${xp.level} reached`, { icon: "spark" });
        };
        dlg.querySelector("#confirmSave").addEventListener("click", submit);
        input.addEventListener("keydown", (event) => { if (event.key === "Enter") submit(); });
      },
    },
  );
  return dialog;
}

export default {
  mount(root) {
    rootEl = root;
    paint();

    root.addEventListener("click", (event) => {
      const weaponBtn = event.target.closest("[data-weapon]");
      if (weaponBtn) {
        state.build.current.weapon = weaponBtn.dataset.weapon;
        commit();
        paint();
        return;
      }
      if (event.target.closest("#resetAttach")) {
        for (const slot of ATTACHMENT_SLOTS) state.build.current.attachments[slot.id] = "none";
        commit();
        paint();
        toast("Attachments reset", { icon: "reset" });
        return;
      }
      if (event.target.closest("#saveBuild")) { saveLoadout(); return; }
      const apply = event.target.closest("[data-apply]");
      if (apply) {
        const entry = state.build.saved.find((s) => s.id === apply.dataset.apply);
        if (!entry) return;
        state.build.current = { weapon: entry.weapon, attachments: { ...entry.attachments } };
        commit();
        paint();
        toast(`"${entry.name}" applied`, { icon: "check" });
        return;
      }
      const del = event.target.closest("[data-delete]");
      if (del) {
        const entry = state.build.saved.find((s) => s.id === del.dataset.delete);
        state.build.saved = state.build.saved.filter((s) => s.id !== del.dataset.delete);
        commit();
        paint();
        toast(entry ? `"${entry.name}" removed` : "Loadout removed", { icon: "trash" });
      }
    });

    root.addEventListener("change", (event) => {
      const select = event.target.closest("[data-slot]");
      if (!select) return;
      state.build.current.attachments[select.dataset.slot] = select.value;
      commit();
      updateStats();
    });
  },
  destroy() {
    rootEl = null;
  },
};
