import { state, subscribe, updateStreak, formatXp, levelForXp } from "./store.js";
import { icon, toast, openDialog } from "./ui.js";
import home from "./home.js";
import aim from "./aim.js";
import sens from "./sens.js";
import build from "./build.js";
import codex from "./codex.js";
import { openProfile, closeProfile, mountProfile, applySettings } from "./profile.js";

const routes = { home, aim, sens, build, codex };
const titles = { home: "Dashboard", aim: "Aim Lab", sens: "Sensitivity Lab", build: "Build Lab", codex: "Boss Codex" };
const main = document.getElementById("main");
let currentRoute = "";
let currentView = null;

function updateChrome() {
  const level = levelForXp();
  const topLevel = document.getElementById("topLevel");
  const topXp = document.getElementById("topXp");
  if (topLevel) topLevel.textContent = String(level);
  if (topXp) topXp.textContent = `${formatXp(state.xp)} XP`;
  document.title = `${titles[currentRoute] || "Game Helper"} · NEXUS`;
}

function updateTabs(route) {
  document.querySelectorAll(".tab").forEach((tab) => {
    const active = tab.dataset.route === route;
    tab.classList.toggle("active", active);
    if (active) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
}

function parseRoute() {
  const raw = (window.location.hash || "").replace(/^#\/?/, "").split("?")[0];
  return routes[raw] ? raw : "home";
}

function navigate() {
  const route = parseRoute();
  if (currentView && typeof currentView.destroy === "function") currentView.destroy();
  closeProfile();
  main.innerHTML = "";
  const section = document.createElement("section");
  section.className = "view active";
  main.appendChild(section);
  currentRoute = route;
  currentView = routes[route];
  try {
    currentView.mount(section);
  } catch (error) {
    console.error("NEXUS: view failed to mount", error);
    section.innerHTML = `<div class="card" style="margin-top:20px"><h2>Something went wrong</h2><p class="muted" style="margin-top:8px">Reload the app to reset the view. Your progress is safe.</p><button class="btn btn-primary" style="margin-top:14px" onclick="location.reload()">Reload</button></div>`;
  }
  updateTabs(route);
  updateChrome();
  window.scrollTo({ top: 0, behavior: "auto" });
  try { main.focus({ preventScroll: true }); } catch { main.focus(); }
}

let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

function showInstallHelp() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  openDialog(
    `<div class="modal-body" style="padding:24px">
      <div class="row" style="gap:10px">${icon("download")}<span class="eyebrow">INSTALL NEXUS</span></div>
      <h2 style="margin-top:10px">Add NEXUS to your home screen</h2>
      <p class="fine" style="margin-top:8px">It runs full-screen and keeps working offline — no store update required.</p>
      <div class="install-steps">
        ${ios
          ? `<div class="install-step"><b>1</b><span>Open this page in Safari.</span></div>
             <div class="install-step"><b>2</b><span>Tap the Share button.</span></div>
             <div class="install-step"><b>3</b><span>Choose “Add to Home Screen”.</span></div>`
          : `<div class="install-step"><b>1</b><span>Open the browser menu (⋮ or the install icon in the address bar).</span></div>
             <div class="install-step"><b>2</b><span>Choose “Install app” or “Add to Home screen”.</span></div>
             <div class="install-step"><b>3</b><span>Launch NEXUS from your home screen.</span></div>`}
      </div>
    </div>
    <div class="modal-actions"><button class="btn btn-primary" type="button" data-close-dialog>Got it</button></div>`,
  );
}

async function promptInstall() {
  if (!deferredPrompt) { showInstallHelp(); return; }
  try {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") toast("NEXUS installed", { icon: "download" });
    deferredPrompt = null;
    installBtn.hidden = true;
  } catch {
    showInstallHelp();
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("NEXUS: service worker unavailable", error));
  });
}

function init() {
  applySettings();
  updateStreak();
  mountProfile();
  updateChrome();

  if (!window.location.hash) {
    history.replaceState(null, "", "#/home");
  }
  currentRoute = parseRoute();
  navigate();
  window.addEventListener("hashchange", navigate);

  subscribe(() => updateChrome());

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-profile]")) { openProfile(); return; }
    if (event.target.closest("[data-close-profile]")) { closeProfile(); return; }
  });
  const scrim = document.getElementById("scrim");
  if (scrim) scrim.addEventListener("click", closeProfile);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const sheet = document.getElementById("profileSheet");
      if (sheet && sheet.classList.contains("open")) closeProfile();
    }
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) installBtn.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (installBtn) installBtn.hidden = true;
    toast("NEXUS installed", { icon: "download" });
  });
  if (installBtn) installBtn.addEventListener("click", promptInstall);
  document.addEventListener("nexus:install", promptInstall);

  window.addEventListener("offline", () => toast("Offline mode — drills and tools still work", { tone: "warn", icon: "info", timeout: 3200 }));

  registerServiceWorker();

  if (window.matchMedia("(display-mode: standalone)").matches) document.body.classList.add("standalone");
}

init();
