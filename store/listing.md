# NEXUS — Play Store listing kit

> **Honest note:** no one can guarantee a million sales. The assets and positioning below are built to maximise install conversion and store ranking; growth still depends on retention, reviews, and user acquisition. Iterate on the store listing after launch.

## Store listing copy

**App name (28 / 30 chars)**
```
NEXUS: Game Helper & Aim Lab
```

**Short description (67 / 80 chars)**
```
Aim trainer, sens converter, loadout lab, and boss codex — offline.
```

**Full description**

```
Train smarter. Play better. NEXUS is the pocket companion for players who want measurable improvement, not another generic guide app.

AIM LAB
• Three 30-second drills: Flick, Gridshot, and Precision
• Live score, accuracy, average reaction time, and streak tracking
• Personal bests, grade cards, and a performance curve you can actually read
• Built-in hit sounds, particles, and pause-safe runs

SENSITIVITY LAB
• Convert your true cm/360° across CS2, VALORANT, Apex Legends, Overwatch 2, and Fortnite
• eDPI, full-pad swipe count, and mousepad matching
• Quick targets from 18 cm to 45 cm, with one-tap copy for every game
• The only sensitivity number that transfers fairly between games

BUILD LAB
• Five weapon archetypes and six attachment slots
• Live damage, range, control, handling, fire rate, DPS, and TTK
• Save up to 20 loadouts and apply them instantly
• Understand the trade-off before you spend the match learning it

BOSS CODEX
• 19 fight plans across Elden Ring, Minecraft, Terraria, Hades, and Hollow Knight
• Weaknesses, recommended level, rewards, phase notes, and concise tactics
• Search, game filters, difficulty filters, and cleared-progress tracking
• No 20-minute video. The plan you need, in 30 seconds.

BUILT FOR FOCUS
• 100% offline after first load
• No account. No ads. No analytics. No data collection.
• Installable full-screen app with home-screen shortcuts
• Local progress you can reset at any time

NEXUS is an independent, fan-made companion. It is not affiliated with, endorsed by, or sponsored by any game publisher. Game names and boss names belong to their respective owners. Sensitivity constants and loadout values are community guidance and may change with game patches.
```

**Category:** Games (secondary: Tools)

**Tags / ASO keywords**
```
aim trainer, aim lab, sensitivity converter, cm/360, edpi, sensitivity calculator, loadout builder, ttk calculator, boss guide, boss codex, game companion, fps trainer, gaming utility, offline game guide, crosshair trainer
```

**Content rating:** Everyone / PEGI 7 (contains mild fantasy violence references in text). Complete the IARC questionnaire honestly.

**Ads:** No ads. **In-app purchases:** No. **Data safety:** No data collected, no data shared. Data is stored locally and can be deleted in-app.

## Visual assets

| Asset | Spec | File |
|---|---|---|
| App icon | 512×512 PNG, 32-bit | `../assets/icons/icon-512.png` |
| Adaptive icon foreground | 512×512 PNG, 33% safe zone | `../assets/icons/maskable-512.png` |
| Feature graphic | 1024×500 PNG, no alpha | `feature-graphic.png` |
| Phone screenshots | 1080×1920 PNG, 7 of 8 | `screenshots/*.png` |
| Privacy policy | Public HTTPS URL | `../privacy.html` |
| Store listing | This document | `listing.md` |

**Screenshot order and captions**
1. `01-home.png` — “Your aim, upgraded.”
2. `02-aim.png` — “30-second drills. Real feedback.”
3. `03-sens.png` — “One cm/360. Every game.”
4. `04-codex.png` — “Know the fight before you enter.”
5. `05-build.png` — “Build the loadout. Know the math.”
6. `06-profile.png` — “Progress you can measure.”
7. `07-boss-plan.png` — “The plan, not a 20-minute video.”

## Android packaging (TWA)

1. Deploy the PWA to an HTTPS domain (the service worker requires HTTPS).
2. Replace the placeholders in `twa-manifest.json` with your domain, package ID, and signing key.
3. Install Bubblewrap and build the app bundle:
   ```sh
   npm install -g @bubblewrap/cli
   bubblewrap init --manifest https://your-domain.example/manifest.webmanifest
   bubblewrap build
   ```
4. Publish the release SHA-256 fingerprint at `https://your-domain.example/.well-known/assetlinks.json` using `assetlinks.template.json`. Without this, the app opens with a browser address bar.
5. Upload the generated `.aab` to Play Console → Internal testing → Production.
6. Set the privacy policy URL to your deployed `privacy.html`, complete Data safety and content rating, then roll out.

## Launch checklist

- [ ] Replace placeholder domain, package ID, and signing fingerprint.
- [ ] Verify Lighthouse PWA installability and offline reload.
- [ ] Capture fresh screenshots after any UI change.
- [ ] Test on a real low-end Android phone at 360 px width.
- [ ] Add a public support email to the privacy policy and listing.
- [ ] Run a closed test with 20 target users; measure D1/D7 retention.
- [ ] A/B test the first screenshot and short description after launch.
- [ ] Keep sensitivity constants and boss data reviewed after game patches.
