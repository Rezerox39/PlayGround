const nf = new Intl.NumberFormat("en-US");

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function icon(name, cls = "") {
  return `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

export function num(value) {
  return nf.format(Math.round(value || 0));
}

export function pct(value, digits = 0) {
  return `${Number(value || 0).toFixed(digits)}%`;
}

export function formatSens(value) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 10) return value.toFixed(2).replace(/\.?0+$/, "");
  if (value >= 1) return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function longDate(date = new Date()) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function toast(message, opts = {}) {
  const root = document.getElementById("toasts");
  if (!root) return;
  const node = document.createElement("div");
  node.className = `toast ${opts.tone === "warn" ? "warn" : ""}`;
  node.innerHTML = `${icon(opts.icon || (opts.tone === "warn" ? "info" : "check"))}<span>${esc(message)}</span>`;
  root.appendChild(node);
  const timeout = opts.timeout ?? 2800;
  window.setTimeout(() => {
    node.classList.add("out");
    window.setTimeout(() => node.remove(), 260);
  }, timeout);
}

export function openDialog(html, opts = {}) {
  const root = document.getElementById("modalRoot");
  const dialog = document.createElement("dialog");
  dialog.className = opts.className || "modal";
  dialog.innerHTML = html;
  root.appendChild(dialog);
  const close = () => {
    if (dialog.open) dialog.close();
    dialog.remove();
  };
  dialog.addEventListener("close", () => dialog.remove());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && opts.dismissable !== false) close();
  });
  dialog.querySelectorAll("[data-close-dialog]").forEach((btn) => btn.addEventListener("click", close));
  dialog.showModal();
  if (opts.onMount) opts.onMount(dialog, close);
  return { dialog, close };
}

export function confirmDialog({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false }) {
  return new Promise((resolve) => {
    const { dialog, close } = openDialog(
      `<div class="modal-body" style="padding:24px">
        <h2 style="font-size:20px">${esc(title)}</h2>
        <p class="muted" style="margin-top:8px;font-size:13px;line-height:1.6">${esc(message)}</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-cancel type="button">${esc(cancelLabel)}</button>
        <button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-ok type="button">${esc(confirmLabel)}</button>
      </div>`,
    );
    dialog.querySelector("[data-cancel]").addEventListener("click", () => { close(); resolve(false); });
    dialog.querySelector("[data-ok]").addEventListener("click", () => { close(); resolve(true); });
    dialog.addEventListener("close", () => resolve(false), { once: true });
  });
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    area.remove();
    return ok;
  }
}

export function debounce(fn, delay = 200) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function difficultyDots(level) {
  return `<span class="difficulty" aria-label="Difficulty ${level} of 5">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= level ? "on" : ""}"></i>`).join("")}</span>`;
}
