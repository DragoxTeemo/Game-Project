import { MiniGameSystem } from "./minigames.js";
import { CombatAction } from "./CombatAction.js";
import { CombatMath } from "./CombatMath.js";
import { evaluateAimState, calculateHitProb, executeAceGreatSword } from "./tactics.js";
import { isAlive } from "../data/UnitState.js";

export function executeWeaponAttack(attacker, primaryTarget, weapon, obstacles, grid, enemiesInRoom, aimDirection) {
    const isCone = weapon.scope === "AOE_CONE";
    let aimState = "white";

    if (isCone) {
        if (!aimDirection) return { success: false, reason: "no_direction" };
    } else {
        if (!isAlive(primaryTarget)) return { success: false, reason: "no_target" };
        aimState = evaluateAimState(attacker, primaryTarget, weapon.range, grid);
        if (aimState === "red") return {success: false, reason: "Unable to target"};
    }
    
// Use the live minigame result passed from the UI, or fallback to RNG check if it's a firearm/default
    let minigameResult = preResolvedMinigame;
    if (!minigameResult) {
        if (weapon.minigameType === "RNG") {
            let baseAccuracy = weapon.accuracy ?? 85;
            let isCovered = (aimState === "yellow");
            minigameResult = MiniGameSystem.runRNGHitCheck(baseAccuracy, isCovered);
        } else {
            minigameResult = { multiplier: 1.0, text: "Hit!" };
        }
    }
    // Execute Grid Interaction (Cone AOE vs Single Target)
    let hitResults = { enemiesDamaged: 0, scrapDestroyed: 0 };
    
    if (isCone) {
        hitResults = executeAceGreatSword(attacker, weapon, aimDirection, grid, enemiesInRoom, minigameResult.multiplier);
    } else if (minigameResult.multiplier > 0 && Math.random() <= calculateHitProb(attacker, primaryTarget)) {
        const raw = CombatMath.calculatePhysicalDamage(attacker, primaryTarget, weapon.basePower);
        const fx = CombatMath.elementMultiplier(primaryTarget, attacker.elements ?? "Physical");
        CombatMath.applyDamage(primaryTarget, Math.floor(raw * fx * minigameResult.multiplier));
        hitResults.enemiesDamaged = 1;
    }

    const action = new CombatAction(weapon.name, "Physical", attacker.elements ?? "Physical", weapon.basePower, weapon.scope, weapon.range);
    return { success: true, action, minigameResult, aimState, hitResults };
}