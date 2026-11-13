import { evaluateAimState, calculateHitProb, getConeTiles, chebyshev } from "./tactics";
import { getReachableTiles, unitMovePoints } from "./pathfinding";
import { isAlive } from "../data/UnitState";

export const DIRECTIONS = { 
    UP: { x: 0, y: -1 }, 
    DOWN: { x: 0, y: 1 }, 
    LEFT: { x: -1, y: 0 }, 
    RIGHT: { x: 1, y: 0 } 
};

const isAxisDirection = d => !!d && Math.abs(d.x) + Math.abs(d.y) === 1 && Number.isInteger(d.x) && Number.isInteger(d.y);

export function targetFor(item) {
    if (item.type === "Magic") 
        return item.scope === "AOE" ? "none" : "single_foe";
    if (item.scope === "AOE_CONE") 
        return "direction";
    if (item.scope === "ALL_RANDOM") 
        return "none";
    return "single_foe"; // SINGLE and CONE_ADJACENT (shotgun: the picked foe plus its neighbours)
}

// The action menu for one rider. Disabled entries carry a reason so the UI can grey them out.
export function getLegalActions(actor, loadout, {mana}) {
    const out = [];
    const add = (kind, item, extra = {}) => out.push({
        id: `${kind}:${item.name}`, 
        kind, 
        item, 
        label: item.name,
        targeting: targetingFor(item), 
        enabled: true, reason: 
        null, ...extra
    });

    for (const w of loadout.weapons ?? []) {
        if (w.type === "FIREARM") {
            add("firearm", w, { 
                label: `${w.name} (${w.mag}/${w.magSize})`, 
                maxRounds: w.mag, 
                enabled: w.mag > 0, 
                reason: w.mag > 0 ? null : "empty" 
            });
            const reloadable = w.mag < w.magSize && w.reserve > 0;
            add("reload", w, { 
                label: `Reload ${w.name}`, 
                targeting: "none", 
                enabled: reloadable, 
                reason: reloadable ? null : (w.mag >= w.magSize ? "full" : "no_reserve") 
            });
        } else {
            add("weapon", w);
        }
    }
    for (const s of loadout.spells ?? []) {
        const ok = mana.canAfford(s.magicCost);
        add("spell", s, { 
            label: `${s.name} (${s.magicCost} MP)`, 
            enabled: ok, 
            reason: ok ? null : "mana" });
    }
    return out;
}

export function getMoveTiles(actor, {grid, party, enemies}) {
    const unit = [...party, ...enemies].filter(isAlive);
    return getReachableTiles(grid, actor, unitMovePoints(actor), units, actor);
}

function hitChanceFor(actor, item, target, aim) {
    if (item.type === "Magic") return 1.0;  // spells have no hit roll
    if (item.minigameType === "RNG") return Math.max(0, (item.accuracy ?? 85) - (aim === "yellow" ? 10 : 0)) / 100;
    return calculateHitProb(actor, target); // melee: speed-gap roll (x minigame result)
}

// Foes this actor could pick for a "single_foe" action. Only foes it can see (white) or partly see (yellow); red is never offered.
export function getValidTargets(actor, action, { grid, enemies }) {
    if (action.targeting !== "single_foe") return [];
    const item = action.item, range = item.range ?? 1;
    const out = [];
    for (const unit of enemies) {
        if (!isAlive(unit)) continue;
        const aim = evaluateAimState(actor, unit, range, grid);
        if (aim === "red") continue;
        out.push({ unit, aim, hitChance: hitChanceFor(actor, item, unit, aim), effect: unit.evaluateElementalEffect?.(item.element)?.type ?? "NORMAL" });
    }
    return out;
}

export function previewAction(actor, action, ctx, choice = {}) {
    const { grid, enemies } = ctx, item = action.item;
 
    if (action.targeting === "single_foe") {
        const primary = getValidTargets(actor, action, ctx).find(t => t.unit === choice.target);
        if (!primary) return { valid: false, reason: "invalid_target", affected: [] };
        const affected = [primary];
        if (item.scope === "CONE_ADJACENT") {
            for (const e of enemies) {
                if (e === primary.unit || !isAlive(e) || chebyshev(e, primary.unit) > 1) continue;
                const aim = evaluateAimState(actor, e, item.range, grid);
                if (aim !== "red") affected.push({ unit: e, aim, hitChance: hitChanceFor(actor, item, e, aim) * (item.secondaryMult ?? 0.6), splash: true });
            }
        }
        return { valid: true, affected };
    }
 
    if (action.targeting === "direction") {
        if (!isAxisDirection(choice.direction)) return { valid: false, reason: "invalid_direction", affected: [] };
        const tiles = getConeTiles(actor, choice.direction, item.range).filter(t => grid[t.x]?.[t.y]);
        const affected = enemies.filter(e => isAlive(e) && tiles.some(t => t.x === e.x && t.y === e.y))
            .map(unit => ({ unit, aim: "white", hitChance: 1 }));
        return { valid: true, tiles, affected, scrap: tiles.filter(t => grid[t.x][t.y].type === "scrap") };
    }
 
    // targeting "none"
    if (action.kind === "reload") return { valid: true, affected: [] };
    if (item.scope === "ALL_RANDOM") { // rifle: random pick among foes she can see
        const affected = enemies.filter(isAlive).map(unit => ({ unit, aim: evaluateAimState(actor, unit, item.range, grid) }))
            .filter(t => t.aim !== "red").map(t => ({ ...t, hitChance: hitChanceFor(actor, item, t.unit, t.aim) }));
        return affected.length ? { valid: true, affected } : { valid: false, reason: "no_sight", affected: [] };
    }
    return { valid: true, affected: enemies.filter(isAlive).map(unit => ({ unit, aim: "white", hitChance: 1 })) }; // AOE spell
}
 
// Final gate before the director resolves anything.
export function validatePlayerAction(actor, action, ctx, choice = {}) {
    if (!action) return { ok: false, reason: "unknown_action" };
    if (!action.enabled) return { ok: false, reason: action.reason ?? "disabled" };
    const preview = previewAction(actor, action, ctx, choice);
    return preview.valid ? { ok: true, preview } : { ok: false, reason: preview.reason };
}
