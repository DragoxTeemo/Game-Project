import { Virus } from "../entities/Virus.js";
import { FoeArchetypes, MasterFoeRegistry } from "../data/foeConfig.js";

export function calculateGroupAverageLevel(party) {
    if (!party || party.length === 0) return 1;
    const total = party.reduce((sum, rider) => sum + (rider.level || 1), 0);
    return Math.max(1, Math.round(total / party.length));
}

/**
 * Distributes XP separately to active and benched members.
 * @param {Array} activeParty - Riders currently in combat (receive 100% scaled XP)
 * @param {Array} benchedParty - Riders in reserve (receive reduced bench XP, e.g., 50%)
 * @param {number} totalXpPool - Base XP pool from the encounter
 * @param {number} benchRatio - Percentage of XP benched allies receive (default 0.5 or 50%)
 */


export function distributeAdjustedEXP(activeParty = [], benchedParty = [], totalXpPool, benchRatio = 0.5) {
    const avgLevel = calculateGroupAverageLevel([...activeParty, ...benchedParty]);
    const reward = (group, efficiency) => group.forEach(rider => {
        const diff = (rider.level || 1) - avgLevel;
        let mult = 1.0;
        if (diff > 0) mult = Math.max(0.2, 1.0 - diff * 0.05);       // high-level outlier penalty
        else if (diff < 0) mult = Math.min(2.0, 1.0 + Math.abs(diff) * 0.1); // low-level outlier boost
        rider.gainXp?.(Math.floor(totalXpPool * mult * efficiency));
    });
    reward(activeParty, 1.0);
    reward(benchedParty, benchRatio);
}
 
export class EncounterDirector {
    // Single budget formula, capped so late game can't spawn dozens of foes.
    static calculateThreatBudget(groupAverageLevel) {
        return Math.min(36, Math.floor(3 + groupAverageLevel * 0.28));
    }
 
    static generateRoomEncounter(groupAverageLevel, maxEnemies = 8) {
        const budget = this.calculateThreatBudget(groupAverageLevel);
        const registry = [];
        for (const [archetype, data] of Object.entries(MasterFoeRegistry))
            for (const [tier, t] of Object.entries(data.tiers))
                registry.push({ archetype, tier, cost: t.cost, minLevel: t.minLevel });
 
        // 15% chance of a single-archetype themed encounter.
        let theme = null;
        const roll = Math.random();
        if (roll < 0.05) theme = FoeArchetypes.AIRBORNE;
        else if (roll < 0.10) theme = FoeArchetypes.CYTOPATH;
        else if (roll < 0.15) theme = FoeArchetypes.VIRION;
 
        const spawned = [];
        let spent = 0;
        for (let attempts = 0; attempts < 100 && spawned.length < maxEnemies; attempts++) {
            const remaining = budget - spent;
            const eligible = registry.filter(e =>
                e.minLevel <= groupAverageLevel && e.cost <= remaining && (!theme || e.archetype === theme));
 
            if (!eligible.length) {
                if (theme && !spawned.length) { theme = null; continue; } // theme impossible: drop it only before anything spawned
                break;                                                    // otherwise stop: keeps themed rooms pure
            }
            if (spawned.length && Math.random() < 0.30) break;
 
            const pool = [];
            for (const e of eligible) for (let w = 0; w < Math.max(1, 10 - e.cost); w++) pool.push(e);
            const chosen = pool[Math.floor(Math.random() * pool.length)];
            spawned.push(new Virus(`Virus_${spawned.length + 1}`, chosen.archetype, chosen.tier, groupAverageLevel));
            spent += chosen.cost;
        }
        return spawned;
    }
}
