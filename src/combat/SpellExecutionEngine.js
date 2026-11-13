import { CombatAction } from "./CombatAction.js";
import { CombatMath } from "./CombatMath.js";
import { evaluateAimState } from "./tactics.js";
import { isAlive } from "./unitState.js";

/**
 * @param attacker     caster (MaskedRider or Virus)
 * @param primaryTarget single target (ignored for AOE)
 * @param spell        MagicSpell
 * @param manaPool     the caster side's SharedManaPool
 * @param targetPool   all valid AOE targets (heroes cast with activeEnemies, villains with party)
 * @param minigameResult optional pre-resolved outcome; defaults to a guaranteed hit
 * @param grid         when given, single-target casts need range + line of sight and fail before spending mana
 */

export function executeSpellCast(attacker, primaryTarget, spell, manaPool, targetPool = [], minigameResult = null, grid = null) {
    if (!manaPool.canAfford(spell.magicCost)) {
        return { 
            success: false, reason: "Not enough shared mana." 
        };
    }
 
    const isAoe = spell.scope === "AOE";
    if (!isAoe && grid) {
        if (!isAlive(primaryTarget)) return { success: false, reason: "no_target" };
        if (evaluateAimState(attacker, primaryTarget, spell.range ?? 1, grid) === "red") return { 
            success: false, reason: "no_sight" 
        };
    }
 
    const result = minigameResult || { multiplier: 1.0, text: "Hit!" };
    manaPool.spend(spell.magicCost); // casting costs mana even on a miss
 
    const hitResults = { enemiesDamaged: 0 };
    if (result.multiplier > 0) {
        for (const target of isAoe ? targetPool : [primaryTarget]) {
            if (!isAlive(target)) continue;
            const raw = CombatMath.calculateMagicDamage(attacker, target, spell.basePower);
            const fx = CombatMath.elementMultiplier(target, spell.element);
            CombatMath.applyDamage(target, Math.floor(raw * fx * result.multiplier));
            hitResults.enemiesDamaged++;
        }
    }
    const action = new CombatAction(spell.name, "Magic", spell.element, spell.basePower, spell.scope, spell.range, spell.magicCost);
    return { 
        success: true, 
        hit: result.multiplier > 0, 
        action, 
        minigameResult: result, 
        hitResults 
    };
}