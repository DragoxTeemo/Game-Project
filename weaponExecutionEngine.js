import { MiniGameSystem } from "./miniGameSystem.js";
import { CombatAction } from "./combatEngine.js";

export function executeWeaponAttack(attacker, primaryTarget, weapon, obstacles, grid, enemiesInRoom, aimDirection) {
    let aimState = "white";
    let isCovered = false;

    // 1. Evaluate Aim / Cover State for Ranged Weapons
    if (weapon.scope === "SINGLE" && weapon.type === "FIREARM") {
        aimState = evaluateAimState(attacker.position, primaryTarget.position, weapon, obstacles);
        if (aimState === "red") {
            return { success: false, reason: "Target out of range or blocked by solid cover." };
        }
        isCovered = (aimState === "yellow");
    }

    // 2. Resolve Minigames using your complete MiniGameSystem architecture
    let minigameResult = { multiplier: 1.0, text: "Hit!" };
    
    switch (weapon.minigameType) {
        case "RNG":
            let baseAccuracy = 85;
            if (isCovered) baseAccuracy -= 25; // BlazE cover penalty
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

    // 3. Execute Grid Interaction (Cone AOE vs Single Target)
    let hitResults = { enemiesDamaged: 0, scrapDestroyed: 0 };
    
    if (weapon.scope === "AOE_CONE") {
        hitResults = executeAceGreatSword(attacker, attacker.position, aimDirection, grid, enemiesInRoom, minigameResult.multiplier);
    } else {
        let hitChance = calculateHitProb(attacker, primaryTarget);
        if (Math.random() <= hitChance && minigameResult.multiplier > 0) {
            let finalDamage = Math.floor(weapon.basePower * minigameResult.multiplier);
            primaryTarget.hp -= finalDamage;
            hitResults.enemiesDamaged = 1;
        }
    }

    let action = new CombatAction(
        weapon.name,
        weapon.type === "FIREARM" ? "Magic" : "Physical",
        attacker.currentElement || "Physical",
        weapon.basePower,
        weapon.scope,
        weapon.range
    );

    return { action, minigameResult, aimState, hitResults };
}