import { SENS_GAMES, ATTACHMENT_SLOTS } from "./data.js";

export function gameById(id) {
  return SENS_GAMES.find((g) => g.id === id) || SENS_GAMES[0];
}

export function cm360For(gameId, dpi, sens) {
  const game = gameById(gameId);
  const d = Number(dpi);
  const s = Number(sens);
  if (!(d > 0) || !(s > 0)) return 0;
  return (360 * 2.54) / (d * s * game.yaw);
}

export function sensForCm(gameId, dpi, cm) {
  const game = gameById(gameId);
  const d = Number(dpi);
  const c = Number(cm);
  if (!(d > 0) || !(c > 0)) return 0;
  return 914.4 / (d * c * game.yaw);
}

export function eDPI(dpi, sens) {
  return Number(dpi) * Number(sens);
}

export function clampStat(value) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

export function attachmentOption(slotId, optionId) {
  const slot = ATTACHMENT_SLOTS.find((s) => s.id === slotId);
  if (!slot) return null;
  return slot.options.find((o) => o.id === optionId) || slot.options[0];
}

export function computeLoadout(weapon, attachmentMap = {}) {
  const totals = { range: weapon.range, control: weapon.control, handling: weapon.handling };
  let magAdd = 0;
  for (const slot of ATTACHMENT_SLOTS) {
    const option = attachmentOption(slot.id, attachmentMap[slot.id] || "none");
    if (!option) continue;
    for (const [key, value] of Object.entries(option.mods || {})) {
      if (key in totals) totals[key] += value;
    }
    magAdd += option.magAdd || 0;
  }
  const pellets = weapon.id === "shotgun" ? 8 : 1;
  const bodyDamage = weapon.dmg * pellets;
  const dps = (bodyDamage * weapon.rpm) / 60;
  const headDps = (bodyDamage * weapon.hs * weapon.rpm) / 60;
  const ttk = [100, 150, 200].map((hp) => {
    const shots = Math.max(1, Math.ceil(hp / bodyDamage));
    const ms = ((shots - 1) * 60000) / weapon.rpm;
    return { hp, shots, ms };
  });
  return {
    stats: {
      damage: clampStat(bodyDamage),
      range: clampStat(totals.range),
      control: clampStat(totals.control),
      handling: clampStat(totals.handling),
      fireRate: clampStat((weapon.rpm / 1000) * 100),
    },
    mag: Math.max(1, weapon.mag + magAdd),
    bodyDamage,
    dps,
    headDps,
    ttk,
    pellets,
  };
}
