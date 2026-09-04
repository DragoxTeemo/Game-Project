import { Virus, MasterFoeRegistry } from "./foes";

export function calculateGroupAverageLevel(party) {
    if (!party || party.length === 0) return 1;
    let totalLevel = party.reduce((sum, rider) => sum + (rider.level || 1), 0);
    return Math.max(1, Math.round(totalLevel / party.length));
}

export function distrubuteAdjustedEXP(party, totalXpPool) {
    let avgLevel = calculateGroupAverageLevel(party);

    party.forEach(rider => {
        let levelDiff = (rider.level || 1) - avgLevel;
        let multiplier = 1.0;

        if (levelDiff > 0) {
            multiplier = Math.max(0.2, 1.0 - (levelDiff * 0.05)); // High outlier penalty
        } else if (levelDiff < 0) {
            multiplier = Math.min(2.0, 1.0 + (Math.abs(levelDiff) * 0.1)); // low outlier boost
        }

        let finalExp = Math.floor(totalXpPool * multiplier);
        if (typeof rider.gainXp === "function") {
            rider.gainXp(finalExp);
        }
    });
}

export class EncounterDirector {
    static generateRoomEncounter(groupAverageLevel) {
        let threatBudget = Math.floor(2 + groupAverageLevel * 0.55);
        let spawnedEnemies = [];

        //Automatically flattened MasterFoeRegistry into a dynamic spawn list
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
        while (threatBudget > 0) {
            let eligible = enemyRegistry.filter(e => e.minLevel <= groupAverageLevel && e.cost <= threatBudget);
            if (eligible.length === 0) break;

            let weightedPool = [];
            eligible.forEach(enemy => {
                let levelDelta = groupAverageLevel - enemy.minLevel;
                let weight = Math.max(1, 10 - (levelDelta * 0.8)); 
                for (let w = 0; w < weight; w++) {
                    weightedPool.push(enemy);
                }
            });

            let chosen = weightedPool[Math.floor(Math.random() * weightedPool.length)];
            let virusInstance = new Virus(`Virus_${spawnedEnemies.length + 1}`, chosen.archetype, chosen.tier, groupAverageLevel);
            spawnedEnemies.push(virusInstance);
            threatBudget -= chosen.cost;
        }
        return spawnedEnemies;
    }
}