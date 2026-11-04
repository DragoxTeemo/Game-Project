import { Virus } from "../entities/Virus.js";
import { FoeArchetypes, MasterFoeRegistry } from "../data/foeConfig.js";

export function calculateGroupAverageLevel(party) {
    if (!party || party.length === 0) return 1;
    let totalLevel = party.reduce((sum, rider) => sum + (rider.level || 1), 0);
    return Math.max(1, Math.round(totalLevel / party.length));
}

/**
 * Distributes XP separately to active and benched members.
 * @param {Array} activeParty - Riders currently in combat (receive 100% scaled XP)
 * @param {Array} benchedParty - Riders in reserve (receive reduced bench XP, e.g., 50%)
 * @param {number} totalXpPool - Base XP pool from the encounter
 * @param {number} benchRatio - Percentage of XP benched allies receive (default 0.5 or 50%)
 */


export function distributeAdjustedEXP(activeParty = [], benchedParty = [], totalXpPool, benchRatio = 0.5) {
    // Calculate the overall roster average level so both active and benched share a unified baseline
    const completeRoster = [...activeParty, ...benchedParty];
    let avgLevel = calculateGroupAverageLevel(completeRoster);

    // Helper logic to process a specific group with an efficiency modifier
    const rewardGroup = (group, efficiencyMultiplier) => {
        group.forEach(rider => {
            let levelDiff = (rider.level || 1) - avgLevel;
            let multiplier = 1.0;

            if (levelDiff > 0) {
                multiplier = Math.max(0.2, 1.0 - (levelDiff * 0.05)); // High outlier penalty
            } else if (levelDiff < 0) {
                multiplier = Math.min(2.0, 1.0 + (Math.abs(levelDiff) * 0.1)); // Low outlier boost
            }
            
            // Combine base pool, level outlier modifier, and active/bench efficiency
            let finalExp = Math.floor(totalXpPool * multiplier * efficiencyMultiplier);
            if (typeof rider.gainXp === "function") {
                rider.gainXp(finalExp);
            }
        });
    };
    rewardGroup(activeParty, 1.0); // Active members recieve full efficiency
    rewardGroup(benchedParty, benchRatio); //Benched member recieve half
}

export class EncounterDirector {
    /**
     * Dynamically calculates an encounter threat budget smoothly from level 1 to 99.
     * 
     * @param {number} groupAverageLevel - The average level of the party.
     * @returns {number} The calculated threat budget points.
     */
    static calculateThreatBudget(groupAverageLevel) {
        // Smooth continuous scaling to prevent mid-game or late-game "drags"
        // Scales from 3 points at level 1 up to ~47 points at level 99
        return Math.floor(3 + (groupAverageLevel * 0.45));
    }

    static generateRoomEncounter(groupAverageLevel, maxEnemies = 8) {
        // Scaled budget bounded to prevent massive spam
        let threatBudget = Math.min(36, Math.floor(3 + groupAverageLevel * 0.28));
        let spawnedEnemies = [];


        // Flatten MasterFoeRegistry into a dynamic spawn list
        let enemyRegistry = [];
        for (let [archetype, archData] of Object.entries(MasterFoeRegistry)) {
            for (let [tier, tierData] of Object.entries(archData.tiers)) {
                enemyRegistry.push({
                    archetype: archetype,
                    tier: tier,
                    cost: tierData.cost,
                    minLevel: tierData.minLevel
                });
            }
        }

        // Fun variation override: 15% chance for a specialized theme encounter (All Ranged, All Tanks, etc.)
        let themeOverride = null;
        let rollTheme = Math.random();
        if (rollTheme < 0.05) {
            themeOverride = FoeArchetypes.AIRBORNE; // All Ranged Ambush
        } else if (rollTheme < 0.10) {
            themeOverride = FoeArchetypes.CYTOPATH; // All Tank Juggernaut Wave
        } else if (rollTheme < 0.15) {
            themeOverride = FoeArchetypes.VIRION;   // Swarm Wave
        }

        let currentBudgetSpent = 0;
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            attempts++;

            let remainingBudget = threatBudget - currentBudgetSpent;

            let eligible = enemyRegistry.filter(e => {
                if (e.minLevel > groupAverageLevel) return false;
                if (e.cost > remainingBudget) return false;
                if (themeOverride && e.archetype !== themeOverride) return false;
                return true;
            });

            if (eligible.length === 0 && themeOverride) {
                themeOverride = null;
                continue;
            }

            if (eligible.length === 0 || (currentBudgetSpent > 0 && spawnedEnemies.length > 0 && Math.random() < 0.30)) {
                if (spawnedEnemies.length > 0) break;
            }

            if (eligible.length === 0) break;

            let weightedPool = [];
            eligible.forEach(enemy => {
                let weight = Math.max(1, 10 - enemy.cost);
                for (let w = 0; w < weight; w++) {
                    weightedPool.push(enemy);
                }
            });

            let chosen = weightedPool[Math.floor(Math.random() * weightedPool.length)];
            let virusInstance = new Virus(`Virus_${spawnedEnemies.length + 1}`, chosen.archetype, chosen.tier, groupAverageLevel);
            
            spawnedEnemies.push(virusInstance);
            currentBudgetSpent += chosen.cost;

            if (spawnedEnemies.length >= maxEnemies) break;
        }

        return spawnedEnemies;
    }
}
