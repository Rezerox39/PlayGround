# NEXUS — Game Helper & Aim Lab

**Your unfair advantage.** A mobile-first, installable companion for competitive players: aim trainer, sensitivity converter, loadout lab, and boss codex — all in one offline-friendly PWA.

Built with vanilla HTML, CSS, and ES modules. No framework, no build step, no account, no analytics.

## Features

- **Aim Lab** — Flick, Gridshot, and Precision drills with a 30-second timer, live score/accuracy/streak, reaction time, particles, hit sounds, grades, personal bests, and run history.
- **Sens Lab** — True cm/360° conversion across CS2, VALORANT, Apex Legends, Overwatch 2, and Fortnite. Includes eDPI, full-pad swipes, mousepad matching, presets, and one-tap copy.
- **Build Lab** — Five weapon archetypes, six attachment slots, live damage/range/control/handling/fire-rate stats, DPS and TTK at 100/150/200 HP, plus saved loadouts.
- **Boss Codex** — 19 fight plans across Elden Ring, Minecraft, Terraria, Hades, and Hollow Knight with search, filters, phase notes, weaknesses, rewards, and cleared-progress tracking.
- **Progress & profile** — XP levels, daily streaks, rotating directives, achievements, sound/motion settings, shareable progress, and local reset.
- **Installable PWA** — Service-worker offline shell, app manifest, home-screen shortcuts, and store-ready assets.

All progress is stored locally in `localStorage` under `nexus.progress.v1`.

## Run locally

The app is fully static. Serve the repository root over HTTP (the service worker requires HTTPS or `localhost`):

```sh
python3 -m http.server 3002
# or
npx serve .
```

Then open <http://localhost:3002>. The app uses hash routing (`#/home`, `#/aim`, `#/sens`, `#/build`, `#/codex`), so it works from any static host.

The bundled `start.sh` / `capture.sh` wrappers expect the OMGithub runtime (`RUNTIME_DIR`); the static command above is enough for local development.

## Tests

```sh
node tests/calc.test.mjs
```

Covers cm/360 round-trips for every supported game, eDPI, attachment math, loadout stat bounds, TTK, and content integrity.

Syntax-check all modules:

```sh
for f in js/*.js sw.js store/capture-store.mjs; do node --check "$f"; done
```

## Project structure

```
index.html               App shell, icon sprite, chrome
css/styles.css           Design system and responsive layouts
js/app.js                Router, chrome, PWA wiring, install prompt
js/home.js               Dashboard, stats, directives, chart
js/aim.js                Canvas aim trainer and scoring
js/sens.js               Sensitivity converter
js/build.js              Loadout builder and save/apply
js/codex.js              Boss browser, filters, detail sheet
js/profile.js            Profile, achievements, settings
js/store.js              State, XP, streaks, daily events
js/data.js               Games, modes, bosses, weapons, achievements
js/calc.js               Pure conversion and loadout math
js/ui.js                 DOM/formatting helpers
sw.js                    Offline shell cache
manifest.webmanifest     PWA manifest and shortcuts
privacy.html             Standalone privacy policy
store/                   Play Store listing kit and capture scripts
tests/calc.test.mjs      Unit checks for math and content
```

## Store kit

`store/listing.md` contains Play Store copy, ASO keywords, screenshot order, TWA packaging steps, and a launch checklist. Generated 1080×1920 screenshots live in `store/screenshots/`, with a 1024×500 feature graphic at `store/feature-graphic.png`.

Regenerate the visual assets after UI changes:

```sh
node store/capture-store.mjs
```

The script uses a seeded demo profile and a headless Chromium via `playwright-core`. Set `PLAYWRIGHT_CORE` if it is not in the default lookup path, and set `BASE_URL` if the app is not on `http://localhost:3002`.

## Privacy

No accounts, ads, analytics, or remote data collection. Progress stays on-device and can be reset from the profile sheet. See `privacy.html`.

## Disclaimer

NEXUS is an independent, fan-made companion. It is not affiliated with, endorsed by, or sponsored by any game publisher. Game names, boss names, and related marks belong to their respective owners. Sensitivity constants and loadout values are community guidance and may change with game patches.

---

Built with [OMGithub](https://omgithub.com).
