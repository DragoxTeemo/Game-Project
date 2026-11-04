import { MiniGameSystem } from "./minigames.js";
import { CombatMath } from "./CombatMath.js";
import { evaluateAimState, chebyshev } from "./tactics.js";
import { reloadFirearm } from "../data/weapons.js";

const alive = u => u && u.hp > 0 && !u.isDefeated;

function resolveShot(attacker, weapon, target, grid, damageMult = 1) {
    const aim = evaluateAimState(attacker, target, weapon.range, grid);
    if (aim === "red") return null; //cannot see target
    const roll = MiniGameSystem.runRNGHitCheck(weapon.accuracy, aim === "yellow");
    let damage = 0;
    if (roll.multiplier > 0) {
        const raw = CombatMath.calculatePhysicalDamage(attacker, target, weapon.basePower);
        const fx = CombatMath.elementMultiplier(target, weapon.element);
        damage = CombatMath.applyDamage(target, Math.floor(raw * fx * damageMult)); 
    }
    return {target, hit: roll.multiplier > 0, damage, aim};
}

/*
 * BlazE's turn with a firearm. Always ends her turn.
 * ctx: { mode: "fire" | "reload", target, rounds, grid, enemies }
 * She fires `rounds` (1..mag). Rounds are spent only when a legal shot exists; if the
 * target dies or nothing visible remains mid-volley, the leftover rounds stay in the magazine.
 */

export function executeFirearmAction(attacker, weapon, { mode = "fire", target = null, rounds = 1, grid, enemies = [] }) {
    if (mode === "reload") return reloadFirearm(weapon);
    if (weapon.mag <= 0) return { success: false, reason: "empty" };
 
    const want = Math.max(1, Math.min(Math.floor(rounds) || 1, weapon.mag));
    const shots = [];
    let spent = 0, stopReason = null;
 
    for (let i = 0; i < want; i++) {
        let primary;
        if (weapon.scope === "ALL_RANDOM") {
            // Pool rebuilt every round: kills and visibility are re-checked each time.
            const pool = enemies.filter(e => alive(e) && evaluateAimState(attacker, e, weapon.range, grid) !== "red");
            if (!pool.length) { stopReason = "no_sight"; break; }
            primary = pool[Math.floor(Math.random() * pool.length)];
        } else {
            primary = target;
            if (!alive(primary)) { stopReason = "no_target"; break; }
            if (evaluateAimState(attacker, primary, weapon.range, grid) === "red") { stopReason = "no_sight"; break; }
        }
 
        spent++;
        shots.push(resolveShot(attacker, weapon, primary, grid));
 
        if (weapon.scope === "CONE_ADJACENT") {
            for (const e of enemies) {
                if (e === primary || !alive(e) || chebyshev(e, primary) > 1) continue;
                const s = resolveShot(attacker, weapon, e, grid, weapon.secondaryMult ?? 0.6);
                if (s) shots.push(s);
            }
        }
    }
 
    weapon.mag -= spent;
    return {
        success: spent > 0,
        reason: spent > 0 ? undefined : stopReason,
        roundsFired: spent,
        hits: shots.filter(s => s.hit).length,
        totalDamage: shots.reduce((sum, s) => sum + s.damage, 0),
        shots,
        magRemaining: weapon.mag
    };
}
 
// Non-firearm, non-spell attacks (foe basic attacks): range + sight check, hit roll, damage.
export function executeBasicAttack(attacker, action, target, grid) {
    if (!alive(target)) return { success: false, reason: "no_target" };
    const aim = evaluateAimState(attacker, target, action.range ?? 1, grid);
    if (aim === "red") return { success: false, reason: "no_sight" };
    const roll = MiniGameSystem.runRNGHitCheck(action.accuracy ?? 90, aim === "yellow");
    let damage = 0;
    if (roll.multiplier > 0) {
        const raw = CombatMath.calculateDamage(attacker, target, action);
        damage = CombatMath.applyDamage(target, Math.floor(raw * CombatMath.elementMultiplier(target, action.element)));
    }
    return { success: true, hit: roll.multiplier > 0, damage, aim, target };
}
 
