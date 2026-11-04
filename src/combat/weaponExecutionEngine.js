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
    
    // Resolve Minigames using your complete MiniGameSystem architecture
    let minigameResult = { multiplier: 1.0, text: "Hit!" };
    
    switch (weapon.minigameType) {
        case "RNG":
            let baseAccuracy = 85;
            if (isCovered) baseAccuracy -= 10; // BlazE cover penalty
            minigameResult = MiniGameSystem.runRNGHitCheck(baseAccuracy, isCovered);
            break;
            
        case "SLIDER":
            // Placeholder callback for DOM/Canvas container integration
            minigameResult = { multiplier: 1.0, text: "Perfect!" };
            break;
            
        case "TIMING":
            // Example execution for Rose's whip timing bar
            minigameResult = MiniGameSystem.resolveTimingBar(50, 40, 60, 20, 80);
            break;
            
        case "SPAM":
            // Example execution for Strike's gauntlet combo (passing dummy values for counts)
            minigameResult = MiniGameSystem.runSpamClick(15, 12);
            break;
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