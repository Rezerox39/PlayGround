import assert from "node:assert/strict";
import { cm360For, sensForCm, computeLoadout, eDPI } from "../js/calc.js";
import { WEAPONS, ATTACHMENT_SLOTS, BOSSES, SENS_GAMES, AIM_MODES } from "../js/data.js";

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok  ${name}`); }
  catch (error) { console.error(`  FAIL ${name}`); console.error(error); process.exitCode = 1; }
}

console.log("cm/360 math");
test("CS2 800 DPI @ 1.0 is 51.95 cm", () => {
  const cm = cm360For("cs2", 800, 1);
  assert.ok(Math.abs(cm - 51.9545) < 0.01, `got ${cm}`);
});
test("Valorant requires a higher sens for the same cm/360", () => {
  const cm = 30;
  const val = sensForCm("valorant", 800, cm);
  const cs = sensForCm("cs2", 800, cm);
  assert.ok(val < cs, `${val} should be < ${cs}`);
  const roundTrip = cm360For("valorant", 800, val);
  assert.ok(Math.abs(roundTrip - cm) < 0.001, `got ${roundTrip}`);
});
test("round-trips for every supported game", () => {
  for (const game of SENS_GAMES) {
    const sens = sensForCm(game.id, 1600, 34.5);
    const cm = cm360For(game.id, 1600, sens);
    assert.ok(Math.abs(cm - 34.5) < 0.001, `${game.id}: ${cm}`);
  }
});
test("eDPI multiplies DPI and sens", () => {
  assert.equal(eDPI(800, 1.5), 1200);
});

console.log("loadout math");
test("every weapon computes finite stats and TTK", () => {
  for (const weapon of WEAPONS) {
    const data = computeLoadout(weapon, {});
    assert.ok(data.dps > 0, weapon.id);
    assert.ok(data.ttk.length === 3);
    for (const [key, value] of Object.entries(data.stats)) {
      assert.ok(Number.isFinite(value) && value >= 1 && value <= 100, `${weapon.id}.${key}=${value}`);
    }
    assert.ok(data.mag > 0, weapon.id);
  }
});
test("attachments modify stats and magazine", () => {
  const base = computeLoadout(WEAPONS[0], {});
  const modded = computeLoadout(WEAPONS[0], { muzzle: "comp", mag: "ext", barrel: "long" });
  assert.ok(modded.stats.control > base.stats.control);
  assert.ok(modded.stats.range > base.stats.range);
  assert.ok(modded.mag > base.mag);
});
test("every attachment slot has a none option and unique ids", () => {
  for (const slot of ATTACHMENT_SLOTS) {
    assert.ok(slot.options.some((o) => o.id === "none"), slot.id);
    assert.equal(new Set(slot.options.map((o) => o.id)).size, slot.options.length, slot.id);
  }
});

console.log("content");
test("boss ids are unique and content is complete", () => {
  const ids = BOSSES.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const boss of BOSSES) {
    assert.ok(boss.name && boss.game && boss.weakness && boss.summary, boss.id);
    assert.ok(boss.tips.length >= 4, boss.id);
    assert.ok(boss.phases.length >= 1, boss.id);
    assert.ok(boss.difficulty >= 1 && boss.difficulty <= 5, boss.id);
  }
});
test("aim modes have balanced configs", () => {
  for (const mode of Object.values(AIM_MODES)) {
    assert.ok(mode.duration >= 20 && mode.targets >= 1 && mode.radius >= 8, mode.id);
    assert.ok(mode.par > 0, mode.id);
  }
});

console.log(`\n${passed} checks passed`);
