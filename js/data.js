export const SENS_GAMES = [
  { id: "cs2", name: "Counter-Strike 2", short: "CS2", yaw: 0.022, color: "#f5a623", note: "Raw input, no acceleration" },
  { id: "valorant", name: "VALORANT", short: "VAL", yaw: 0.07, color: "#ff4655", note: "Default yaw, raw input" },
  { id: "apex", name: "Apex Legends", short: "APEX", yaw: 0.022, color: "#da292a", note: "Hipfire yaw; ADS uses multipliers" },
  { id: "overwatch", name: "Overwatch 2", short: "OW2", yaw: 0.0066, color: "#f99e1a", note: "Horizontal sensitivity" },
  { id: "fortnite", name: "Fortnite", short: "FN", yaw: 0.005555, color: "#9d8cff", note: "Look sensitivity; ADS scales separately" },
];

export const SENS_PRESETS = [
  { cm: 18, label: "18 cm", tag: "Speed" },
  { cm: 25, label: "25 cm", tag: "Fast" },
  { cm: 30, label: "30 cm", tag: "Balanced" },
  { cm: 35, label: "35 cm", tag: "Control" },
  { cm: 45, label: "45 cm", tag: "Precision" },
];

export const AIM_MODES = {
  flick: {
    id: "flick",
    name: "Flick",
    tag: "One target",
    blurb: "A single target appears anywhere. Snap, click, reset. The purest test of target acquisition.",
    duration: 30,
    targets: 1,
    radius: 24,
    baseScore: 100,
    par: 1100,
    color: "#a78bfa",
  },
  grid: {
    id: "grid",
    name: "Gridshot",
    tag: "Six targets",
    blurb: "Clear a field of six targets as fast as you can. Builds speed, pathing, and click economy.",
    duration: 30,
    targets: 6,
    radius: 20,
    baseScore: 55,
    par: 1700,
    color: "#22d3ee",
  },
  precision: {
    id: "precision",
    name: "Precision",
    tag: "Small targets",
    blurb: "Tiny targets, zero room for sloppy clicks. Builds micro-correction and calm hands.",
    duration: 30,
    targets: 3,
    radius: 12,
    baseScore: 150,
    par: 900,
    color: "#ff4d6d",
  },
};

export const GAME_TAGS = ["Elden Ring", "Minecraft", "Terraria", "Hades", "Hollow Knight"];

export const BOSSES = [
  {
    id: "margit", name: "Margit, the Fell Omen", game: "Elden Ring", gameColor: "#d4af37", sigil: "ER",
    region: "Stormveil Castle", level: "Level 20–25 · +3 weapon", difficulty: 2,
    weakness: "Bleed · Scarlet Rot",
    summary: "The first wall. A patience test built around delayed swings and one very punishable jump attack.",
    reward: "Talisman Pouch",
    phases: [
      { name: "Phase 1", detail: "Sword and staff combos. Punish after the leaping overhead slam." },
      { name: "Phase 2", detail: "Summons a holy hammer and daggers. Stay close to roll through the hammer." },
    ],
    tips: [
      "Use Margit's Shackle twice in phase one to stagger him. Patches sells it.",
      "Summon Sorcerer Rogier or a Spirit Ash. The fight is tuned around split aggro.",
      "Roll into his delayed swings, not away — his combos track your roll direction.",
      "Punish the long staff spin and the jump slam, then reset spacing.",
      "Bleed or Scarlet Rot both work. A bleed ash on a fast weapon is enough.",
    ],
  },
  {
    id: "godrick", name: "Godrick the Grafted", game: "Elden Ring", gameColor: "#d4af37", sigil: "ER",
    region: "Stormveil Castle", level: "Level 25–30 · +4 weapon", difficulty: 2,
    weakness: "Bleed · Jump attacks",
    summary: "A spectacle boss with a grafted dragon arm and a very exploitable blind side.",
    reward: "Godrick's Great Rune",
    phases: [
      { name: "Phase 1", detail: "Axe sweeps and storm stomps. Hug his left leg and punish recovery." },
      { name: "Phase 2", detail: "Grafts a dragon head. Stay underneath and attack the arm, not the head." },
    ],
    tips: [
      "Hug his left side. Most axe swings miss a target that stays glued to the hip.",
      "Roll through the storm stomp, then take one or two hits — never a full combo.",
      "In phase two, close the gap when he raises the dragon head for fire breath.",
      "Jump attacks break his stance quickly, especially on the arm.",
      "Use the Nepheli Loux summon to keep his attention off you.",
    ],
  },
  {
    id: "radahn", name: "Starscourge Radahn", game: "Elden Ring", gameColor: "#d4af37", sigil: "ER",
    region: "Caelid — Redmane Castle", level: "Level 60–70", difficulty: 4,
    weakness: "Scarlet Rot · Torrent",
    summary: "A festival of summons against a gravity archer the size of a hill. Rot him early, then survive the meteor.",
    reward: "Remembrance of the Starscourge",
    phases: [
      { name: "Phase 1", detail: "Gravity arrows and horseback charges. Rot him early and fight from mid-range." },
      { name: "Phase 2", detail: "Opens with a meteor dive. Ride away, then re-engage after the impact." },
    ],
    tips: [
      "Activate the Radahn Festival and summon every NPC sign before pulling him.",
      "Scarlet Rot breath or rot arrows applied early will do the heavy lifting.",
      "Fight on Torrent and circle at mid-range. Do not stand still for the arrow rain.",
      "When phase two starts, sprint away from the meteor, then return once it lands.",
      "Stay behind his legs and leave before the spin. Two hits, then mount up.",
    ],
  },
  {
    id: "mohg", name: "Mohg, Lord of Blood", game: "Elden Ring", gameColor: "#d4af37", sigil: "ER",
    region: "Mohgwyn Palace", level: "Level 100–120", difficulty: 4,
    weakness: "Bleed · Purifying Crystal Tear",
    summary: "A blood ritual you can fully negate, wrapped in a spear combo that punishes panic rolls.",
    reward: "Remembrance of the Blood Lord",
    phases: [
      { name: "Phase 1", detail: "Spear combos with bloodflame trails. Roll late and punish the thrust." },
      { name: "Phase 2", detail: "Wings and blood rain. Stay close; the ritual Nihil is fully avoidable." },
    ],
    tips: [
      "Put the Purifying Crystal Tear in your Flask of Wondrous Physick. It negates Nihil.",
      "When he counts 'Tres, Duo, Unus', heal and prepare for the ritual.",
      "Roll into the spear thrusts, not away — the bloodflame trail punishes retreat.",
      "Bleed is effective both ways. Avoid chip trades unless you are running a bleed build.",
      "In phase two, stay under him and punish the wing slam recovery.",
    ],
  },
  {
    id: "firegiant", name: "Fire Giant", game: "Elden Ring", gameColor: "#d4af37", sigil: "ER",
    region: "Mountaintops of the Giants", level: "Level 100–120", difficulty: 3,
    weakness: "Bleed · Torrent",
    summary: "A camera boss with ankles. Stay low, stay behind, and respect the roll.",
    reward: "Remembrance of the Fire Giant",
    phases: [
      { name: "Phase 1", detail: "Attack the left ankle. Mount up to escape the roll, then dismount to swing." },
      { name: "Phase 2", detail: "Target the wrists when he slams. Snow breath punishes greedy combos." },
    ],
    tips: [
      "Phase one: stay behind the left ankle and punish idle stomps.",
      "Use Torrent to outrun the roll, then dismount for a short damage window.",
      "When he rises for the fire breath, move to his side, not backward.",
      "Phase two: hit the wrists after the slam. Two hits and reset.",
      "Bleed plus a fast weapon turns the long health bar into a manageable fight.",
    ],
  },
  {
    id: "malenia", name: "Malenia, Blade of Miquella", game: "Elden Ring", gameColor: "#d4af37", sigil: "ER",
    region: "Miquella's Haligtree", level: "Level 120–150", difficulty: 5,
    weakness: "Bleed · Frost · Jump attacks",
    summary: "The hardest duel in the Lands Between. Learn Waterfowl or bring answers to it.",
    reward: "Remembrance of the Rot Goddess",
    phases: [
      { name: "Phase 1", detail: "Waterfowl Dance is the check. Run from flurry one, dodge into two and three." },
      { name: "Phase 2", detail: "Scarlet Aeonia opens the phase. Run under and behind her, then punish." },
    ],
    tips: [
      "For Waterfowl: sprint away from the first flurry, then roll into the second and third.",
      "She heals through shields and on blocked chip damage. Avoid chip trades entirely.",
      "Jump attacks break her poise and let you reset the dance.",
      "Frost pots can interrupt Waterfowl if you react early.",
      "Keep a summon to split aggro, but remember she heals off it too.",
      "Phase two: when she rises for Scarlet Aeonia, run underneath and to her back.",
    ],
  },
  {
    id: "enderdragon", name: "Ender Dragon", game: "Minecraft", gameColor: "#6cc04a", sigil: "MC",
    region: "The End", level: "Endgame gear", difficulty: 3,
    weakness: "End Crystals · Beds",
    summary: "The original final boss. Break the crystals, then burst the dragon while it perches.",
    reward: "Dragon Egg · 12,000 XP (first kill)",
    phases: [
      { name: "Crystals", detail: "Shoot every end crystal from cover. Caged crystals need a careful angle." },
      { name: "Perch", detail: "When it lands at the portal, burst the head with melee or beds." },
    ],
    tips: [
      "Bring blocks, a water bucket, a bow, arrows, and slow-falling potions.",
      "Destroy the end crystals first — they heal the dragon and explode.",
      "Some crystals are caged. Shoot from a safe angle or climb the obsidian tower.",
      "When the dragon perches at the center, place beds and detonate them, or melee the head.",
      "Use water to negate dragon's breath and fall damage. Never fight it in the open air.",
    ],
  },
  {
    id: "wither", name: "The Wither", game: "Minecraft", gameColor: "#6cc04a", sigil: "MC",
    region: "Overworld / Nether", level: "Netherite gear", difficulty: 4,
    weakness: "Smite V · Milk",
    summary: "A flying demolition engine. Choose the arena before you build the summon — it matters more than your sword.",
    reward: "Nether Star",
    phases: [
      { name: "Spawn", detail: "It explodes and is invulnerable at spawn. Back off, then engage in your tunnel." },
      { name: "Chase", detail: "Smite V plus milk for the wither effect. Keep it in a corridor to stop escapes." },
    ],
    tips: [
      "Fight in a long, lit underground tunnel so the Wither cannot fly into the open sky.",
      "Never summon it near your base — the spawn explosion is enormous.",
      "Bring milk to clear the wither effect and golden apples for emergencies.",
      "Smite V is the single biggest damage upgrade for this fight.",
      "At half health it gains armor and dives. Keep moving and use the tunnel to break line of sight.",
    ],
  },
  {
    id: "eyeofcthulhu", name: "Eye of Cthulhu", game: "Terraria", gameColor: "#7ad0e8", sigil: "TR",
    region: "Surface — night", level: "Pre-Hardmode start", difficulty: 1,
    weakness: "Platform arena · Hermes Boots",
    summary: "The tutorial boss that teaches movement. Two long platform rows are the whole strategy.",
    reward: "Demonite / Crimtane Ore",
    phases: [
      { name: "Phase 1", detail: "Spawns servants and charges. Keep running along the platforms." },
      { name: "Phase 2", detail: "Exposed eye, faster charges. Stay mobile and chip from range." },
    ],
    tips: [
      "Build two long rows of platforms before summoning. Vertical space beats armor here.",
      "Use shurikens, a bow, or any ranged weapon while backpedaling.",
      "Kill the servants in phase one instead of letting them stack up.",
      "When it starts spinning, it is about to charge. Keep running and jump the moment it commits.",
      "A campfire and heart lantern at the arena make the fight far more forgiving.",
    ],
  },
  {
    id: "skeletron", name: "Skeletron", game: "Terraria", gameColor: "#7ad0e8", sigil: "TR",
    region: "Dungeon entrance — night", level: "Pre-Hardmode", difficulty: 2,
    weakness: "Kill the hands first",
    summary: "A two-hand check. Remove the hands, then learn the spin.",
    reward: "Dungeon access · Expert: Bone Glove",
    phases: [
      { name: "Hands", detail: "Both hands track you independently. Kill them first while circling." },
      { name: "Head", detail: "The head spins and accelerates. Dodge sideways, not backward." },
    ],
    tips: [
      "Fight on a flat arena above the dungeon. Rough terrain is the real boss.",
      "Kill both hands first; the head is far easier alone.",
      "When the head begins spinning, move perpendicular to its path.",
      "He only spawns at night. Dawn will despawn him, so start early.",
      "Hermes Boots and a Cloud in a Bottle make the spin trivial.",
    ],
  },
  {
    id: "wallofflesh", name: "Wall of Flesh", game: "Terraria", gameColor: "#7ad0e8", sigil: "TR",
    region: "The Underworld", level: "End of pre-Hardmode", difficulty: 3,
    weakness: "Beenades · Long Hellbridge",
    summary: "A chase, not a duel. Build the bridge, stack speed, and never stop moving.",
    reward: "Pwnhammer · Hardmode",
    phases: [
      { name: "Chase", detail: "The wall pushes you across the map. Move right and damage the eyes." },
      { name: "Frenzy", detail: "Below half health it speeds up. Beenades and burst damage end it early." },
    ],
    tips: [
      "Build a long, flat bridge across the Underworld before summoning.",
      "Beenades are the classic answer — they shred both eyes and the mouth.",
      "The eyes have the lowest defense. Aim there when you can.",
      "Obsidian Skin potions let you ignore lava splashes from the ceiling.",
      "Defeating it permanently activates Hardmode, so prepare your world first.",
    ],
  },
  {
    id: "moonlord", name: "Moon Lord", game: "Terraria", gameColor: "#7ad0e8", sigil: "TR",
    region: "Lunar Events — finale", level: "Endgame gear", difficulty: 5,
    weakness: "Kill the eyes · Dodge the ray",
    summary: "Three eyes, one death ray, and no room for greed. Damage the eyes, then finish the core.",
    reward: "Portal Gun · Luminite · Trophy",
    phases: [
      { name: "Eyes", detail: "Destroy the two hand eyes first, then the head eye. Each opens a weak point." },
      { name: "Core", detail: "The exposed core is the kill. Dodge the sweeping death ray and keep healing." },
    ],
    tips: [
      "Kill the hand eyes first, then the head eye. The core only opens after all three.",
      "Dodge the Phantasmal Deathray by dashing or teleporting perpendicular to its sweep.",
      "Use Super Healing Potions on cooldown and keep a stack of buff potions.",
      "Stardust Dragon plus a strong ranged weapon lets you focus on dodging.",
      "Build a wide arena; the fight is about horizontal movement, not standing your ground.",
    ],
  },
  {
    id: "meg", name: "Megaera", game: "Hades", gameColor: "#ff6b4a", sigil: "HD",
    region: "Tartarus", level: "Run start", difficulty: 1,
    weakness: "Dash behind · Keep distance",
    summary: "The first sister. A clean movement check with generous punish windows.",
    reward: "Darkness · Gemstones",
    phases: [
      { name: "Phase 1", detail: "Lunges and whip combos. Bait the lunge, dash through it, punish the back." },
    ],
    tips: [
      "Bait the lunge, dash through her, and attack her back.",
      "After the whip combo she pauses. That is your window.",
      "Keep moving in a wide circle; the arena is bigger than it feels.",
      "Cast at range while closing. Do not trade hits to prove a point.",
      "Her spin has a clear windup — dash out early, not late.",
    ],
  },
  {
    id: "hydra", name: "Bone Hydra", game: "Hades", gameColor: "#ff6b4a", sigil: "HD",
    region: "Asphodel", level: "Mid-run", difficulty: 2,
    weakness: "Focus heads · Avoid lava",
    summary: "A stationary bruiser with adds and fire. Treat the lava as a second enemy.",
    reward: "Darkness",
    phases: [
      { name: "Heads", detail: "Multiple heads spit projectiles. Kill them one at a time." },
      { name: "Main head", detail: "The armored head slams and summons. Punish after the slam." },
    ],
    tips: [
      "Kill the smaller heads one at a time instead of spreading damage.",
      "Strafe the fireball volleys; they are slow and predictable.",
      "When the main head slams, punish immediately, then reposition.",
      "Never fight with lava at your back. Clear a safe lane first.",
      "Dash through projectiles using i-frames rather than running around them.",
    ],
  },
  {
    id: "theseus", name: "Theseus & Asterius", game: "Hades", gameColor: "#ff6b4a", sigil: "HD",
    region: "Elysium", level: "Late run", difficulty: 3,
    weakness: "Kill Asterius first",
    summary: "A two-body problem. Separate them, kill the bull, then take the king.",
    reward: "Darkness · Diamonds",
    phases: [
      { name: "Asterius", detail: "The minotaur charges and swings. Use pillars to break his path." },
      { name: "Theseus", detail: "The king throws a tracking spear. Dodge late, punish after the throw." },
    ],
    tips: [
      "Focus Asterius first while kiting Theseus around the pillars.",
      "Use the pillars to block and break Asterius' charge.",
      "Dodge Theseus' spear late — it tracks your initial movement.",
      "When Theseus calls for divine aid, move out of the marked circles immediately.",
      "Save a Greater Call or big burst for Theseus once Asterius is down.",
    ],
  },
  {
    id: "hadesboss", name: "Hades", game: "Hades", gameColor: "#ff6b4a", sigil: "HD",
    region: "Temple of Styx", level: "Final boss", difficulty: 5,
    weakness: "Greater Call · Dodge the spin",
    summary: "The final exam. Two phases, godly reinforcements, and a spin that ends runs.",
    reward: "Ending · Fated List progress",
    phases: [
      { name: "Phase 1", detail: "Spear combos and invisibility. Learn the timing, dash through, punish." },
      { name: "Phase 2", detail: "Calls the gods and adds AoE. Keep a Death Defiance in reserve." },
    ],
    tips: [
      "Phase one is a spear dance: dash through his thrusts, not away.",
      "Punish after the big spin and the invisibility recovery.",
      "Save at least one Death Defiance for phase two.",
      "In phase two, watch the ground circles from god calls and move early.",
      "Use a Greater Call during his long animations for free damage.",
      "Do not chase him into the center during the spin — wait it out.",
    ],
  },
  {
    id: "hornet", name: "Hornet", game: "Hollow Knight", gameColor: "#cbd5e1", sigil: "HK",
    region: "Greenpath", level: "Early game", difficulty: 2,
    weakness: "Pogo · Dodge the dash",
    summary: "A movement tutorial disguised as a duel. Learn to pogo and the fight clicks.",
    reward: "Mothwing Cloak (dash)",
    phases: [
      { name: "Phase 1", detail: "Needle throws and a horizontal dash. Jump the dash and pogo her." },
      { name: "Phase 2", detail: "Adds a aerial dive and faster patterns. Stay centered, punish landings." },
    ],
    tips: [
      "Jump over her dash and pogo down onto her for free damage.",
      "Punish after the needle throw, then reposition to the center.",
      "Do not heal greedily; heal after she retreats, not mid-combo.",
      "Use Vengeful Spirit when she is across the arena.",
      "Stay away from the walls — she corner-traps there.",
    ],
  },
  {
    id: "mantislords", name: "Mantis Lords", game: "Hollow Knight", gameColor: "#cbd5e1", sigil: "HK",
    region: "Fungal Wastes", level: "Mid game", difficulty: 3,
    weakness: "One at a time · Down-slash",
    summary: "A rhythm fight that becomes a two-body test. Read the telegraphs, not the bodies.",
    reward: "Mark of Pride",
    phases: [
      { name: "Duel", detail: "One lord at a time. Jump the low dash, dash under the high throw." },
      { name: "Duo", detail: "Two lords share the arena. Track both and punish landings." },
    ],
    tips: [
      "Phase one: jump the low dash and down-slash the landing.",
      "Dash under the high projectile throw, then punish the recovery.",
      "In phase two, keep both on screen and move to the center of the arena.",
      "Do not commit to long combos — one or two hits then reposition.",
      "Use Desolate Dive's i-frames when you are cornered.",
    ],
  },
  {
    id: "radiance", name: "The Radiance", game: "Hollow Knight", gameColor: "#cbd5e1", sigil: "HK",
    region: "Dream — finale", level: "Endgame", difficulty: 5,
    weakness: "Abyss Shriek · Nail arts",
    summary: "Bullet-hell patience. Stay under her, punish between beams, and do not rush the climb.",
    reward: "Dream No More ending",
    phases: [
      { name: "Ground", detail: "Sword rain and beams. Stay beneath her and punish after each beam." },
      { name: "Climb", detail: "Platform ascent with spikes and orbs. Keep moving upward, pogo when safe." },
    ],
    tips: [
      "Abyss Shriek is your best damage window when she hovers above you.",
      "Dodge sword rain by walking, not dashing — save the dash for beams.",
      "Stay under her between attacks and punish the beam recovery.",
      "In the climb, keep moving upward and pogo the platforms.",
      "Unbreakable Strength plus Shaman Stone is the standard endgame setup.",
    ],
  },
];

export const WEAPONS = [
  {
    id: "ar", name: "Vanguard AR", class: "Assault Rifle", tag: "All-rounder",
    dmg: 31, rpm: 640, mag: 30, hs: 1.55, range: 82, control: 63, handling: 58,
    desc: "Reliable at every range. The default pick when you do not know the map.",
  },
  {
    id: "smg", name: "Wraith SMG", class: "SMG", tag: "Close range",
    dmg: 22, rpm: 900, mag: 25, hs: 1.4, range: 44, control: 52, handling: 84,
    desc: "Fast handling and a blistering fire rate. Wins every fight inside 10 meters.",
  },
  {
    id: "sniper", name: "Longbow", class: "Sniper", tag: "One-shot",
    dmg: 96, rpm: 46, mag: 5, hs: 2.2, range: 99, control: 42, handling: 33,
    desc: "One shot, one kill — if you land it. Punishing when you miss.",
  },
  {
    id: "shotgun", name: "Breach-12", class: "Shotgun", tag: "Door opener",
    dmg: 13, rpm: 92, mag: 7, hs: 1.5, range: 22, control: 45, handling: 51,
    desc: "Eight pellets of instant regret. Useless past the second doorway.",
  },
  {
    id: "lmg", name: "Bulwark LMG", class: "LMG", tag: "Suppression",
    dmg: 29, rpm: 580, mag: 75, hs: 1.45, range: 88, control: 71, handling: 29,
    desc: "A moving wall of lead. Slow to raise, impossible to out-sustain.",
  },
];

export const ATTACHMENT_SLOTS = [
  {
    id: "muzzle", label: "Muzzle", options: [
      { id: "none", label: "None", mods: {} },
      { id: "comp", label: "Compensator", mods: { control: 9, handling: -3 } },
      { id: "brake", label: "Muzzle Brake", mods: { control: 11, handling: -5 } },
      { id: "supp", label: "Suppressor", mods: { range: 4, control: 2, handling: -6 } },
    ],
  },
  {
    id: "barrel", label: "Barrel", options: [
      { id: "none", label: "None", mods: {} },
      { id: "long", label: "Long Barrel", mods: { range: 13, control: 4, handling: -7 } },
      { id: "short", label: "Short Barrel", mods: { handling: 9, range: -8 } },
      { id: "heavy", label: "Heavy Barrel", mods: { range: 7, control: 9, handling: -10 } },
    ],
  },
  {
    id: "optic", label: "Optic", options: [
      { id: "none", label: "Iron Sights", mods: {} },
      { id: "reflex", label: "Reflex", mods: { handling: 3, control: 2 } },
      { id: "holo", label: "Holographic", mods: { control: 5, range: 3, handling: -2 } },
      { id: "scope", label: "2× Scope", mods: { range: 11, control: 3, handling: -5 } },
    ],
  },
  {
    id: "under", label: "Underbarrel", options: [
      { id: "none", label: "None", mods: {} },
      { id: "vert", label: "Vertical Grip", mods: { control: 10, handling: -2 } },
      { id: "angled", label: "Angled Grip", mods: { control: 4, handling: 6 } },
      { id: "laser", label: "Laser", mods: { handling: 9, control: 2 } },
    ],
  },
  {
    id: "mag", label: "Magazine", options: [
      { id: "none", label: "Standard", mods: {} },
      { id: "ext", label: "Extended", mods: { handling: -5 }, magAdd: 12 },
      { id: "fast", label: "Fast Mag", mods: { handling: 9 }, magAdd: -6 },
      { id: "drum", label: "Drum", mods: { handling: -12 }, magAdd: 30 },
    ],
  },
  {
    id: "stock", label: "Stock", options: [
      { id: "none", label: "None", mods: {} },
      { id: "tac", label: "Tactical Stock", mods: { control: 8, handling: 5 } },
      { id: "light", label: "Light Stock", mods: { handling: 10, control: -5 } },
      { id: "heavy", label: "Heavy Stock", mods: { control: 11, handling: -5 } },
    ],
  },
];

export const ACHIEVEMENTS = [
  { id: "first_blood", name: "First Blood", desc: "Finish your first aim drill.", icon: "target" },
  { id: "deadeye", name: "Deadeye", desc: "Finish a drill at 80%+ accuracy.", icon: "crosshair" },
  { id: "centurion", name: "Centurion", desc: "Score 1,200+ in a single drill.", icon: "zap" },
  { id: "codex_keeper", name: "Codex Keeper", desc: "Clear five bosses in the Codex.", icon: "book" },
  { id: "architect", name: "Architect", desc: "Save a custom loadout.", icon: "layers" },
  { id: "triarii", name: "Triarii", desc: "Reach a 3-day training streak.", icon: "flame" },
  { id: "operator", name: "Operator", desc: "Reach level 5.", icon: "shield" },
  { id: "converter", name: "Sens Sensei", desc: "Dial in three sensitivity presets.", icon: "crosshair" },
];

export const DAILY_CHALLENGES = [
  { id: "drills", title: "Run 3 aim drills", desc: "Any mode, any score.", metric: "drills", target: 3, xp: 120 },
  { id: "accuracy", title: "Hit 75% accuracy", desc: "Minimum 15 shots in one drill.", metric: "accuracy", target: 75, xp: 100 },
  { id: "codex", title: "Clear one boss", desc: "Mark a boss defeated in the Codex.", metric: "clears", target: 1, xp: 110 },
  { id: "loadout", title: "Save a loadout", desc: "Build and name a custom loadout.", metric: "loadouts", target: 1, xp: 90 },
  { id: "score", title: "Score 800 in a drill", desc: "Single run, any mode.", metric: "bestScore", target: 800, xp: 130 },
  { id: "sens", title: "Dial in a sensitivity", desc: "Apply a preset in the Sens Lab.", metric: "sensChecks", target: 1, xp: 80 },
];

export const AIM_TIPS = [
  "Start slow enough to hit 90%. Speed follows accuracy, not the other way around.",
  "Keep your eyes on the target, not your crosshair. Your hand follows your focus.",
  "Do a 2-minute drill before ranked. It is a warm-up, not a performance.",
  "Change one variable at a time: sensitivity, grip, or posture — never all three.",
  "Stop a drill when your accuracy drops below 60%. Fatigue teaches bad habits.",
];

export const QUOTES = [
  "The best players are not faster. They are earlier.",
  "Practice does not make perfect. Practice makes permanent.",
  "Your crosshair placement is a prediction, not a reaction.",
  "Consistency is a skill. Treat it like one.",
  "One clean drill beats an hour of autopilot.",
];
