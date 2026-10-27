import { CombatAction } from "./actions.js";
import { CombatMath } from "./CombatMath.js";

/**
 * executeSpellCast
 * @param {Object} attacker - caster (MaskedRider or Virus instance)
 * @param {Object} primaryTarget - intended single target (ignored for AOE scope)
 * @param {Object} spell - a MagicSpell instance (magic.js / foeSpells.js)
 * @param {SharedManaPool} manaPool - the caster side's shared pool (heroMana or villainMana)
 * @param {Array} targetPool - the full set of valid AOE targets, used when spell.scope === "AOE".
 *     A hero spell passes GameDirector.activeEnemies; a villain spell passes GameDirector.party.
 *     (Previously hardcoded as enemiesInRoom, which only worked for hero-cast spells.)
 * @param {Object} [minigameResult] - optional pre-resolved minigame outcome; defaults to a guaranteed hit
 */


export function executeSpellCast(attacker, primaryTarget, spell, manaPool, targetPool = [], minigameResult = null) {
    if (!manaPool.canAfford(spell.magicCost)) {
        return { success: false, reason: "Not enough shared mana." };
    }
 
    let resolvedMinigame = minigameResult || { multiplier: 1.0, text: "Hit!" };
 
    // Casting still costs mana even on a miss - only the damage application is skipped
    manaPool.spend(spell.magicCost);
 
    let hitResults = { enemiesDamaged: 0 };
 
    if (resolvedMinigame.multiplier > 0) {
        let targets = spell.scope === "AOE" ? targetPool : [primaryTarget];
        targets.forEach(target => {
            if (!target || target.isDefeated) return;
            let rawDamage = CombatMath.calculateMagicDamage(attacker, target, spell.basePower);
            let finalDamage = Math.floor(rawDamage * resolvedMinigame.multiplier);
            target.hp -= finalDamage;
            hitResults.enemiesDamaged++;
        });
    }
    let action = new CombatAction(
        spell.name,
        "Magic",
        spell.element,
        spell.basePower,
        spell.scope,
        spell.range,
        spell.magicCost
    );
    return { success: true, hit: resolvedMinigame.multiplier > 0, action, minigameResult: resolvedMinigame, hitResults };
}