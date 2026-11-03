import { FoeArchetypes } from "./foeConfig.js";
import { findPath, tileDistance } from "./pathfinding.js";

export class FoeAIController {
    static chooseAction(actor, party, allies, availableActions, grid = [], obstacles = []) {
        let bestAction = null;
        let bestScore = -Infinity;
        let bestTarget = null;

        // Filter out downed or defeated heroes
        const validTargets = party.filter(p => p.hp > 0 && !p.isDefeated);
        if (validTargets.length === 0) return { action: null, target: null };

        // 1. Filter actions by mana affordability first
        const affordableActions = availableActions.filter(action => {
            const cost = action.magicCost ?? action.baseCost ?? 0;
            if (actor.villainMana && typeof actor.villainMana.canAfford === "function") {
                return actor.villainMana.canAfford(cost);
            }
            return true;
        });

        const actionsToConsider = affordableActions.length > 0 ? affordableActions : availableActions;
        const allUnits = [...party, ...allies];

        // Single streamlined evaluation loop
        for (let action of actionsToConsider) {
            let actionObj = action.action || action;
            let maxRange = actionObj.range || action.range || 1; // Fallback range

            for (let target of validTargets) {
                let dist = tileDistance(actor, target);

                // Check if path exists around walls/columns if grid data is provided
                if (grid && grid.length > 0) {
                    let path = findPath({ x: actor.x, y: actor.y }, { x: target.x, y: target.y }, grid, obstacles, allUnits);
                    if (path.length === 0 && dist > maxRange) {
                        continue; // Completely walled off or unreachable
                    }
                } else if (dist > maxRange) {
                    continue; // Fallback distance check if no grid is loaded yet
                }

                // Evaluate score using your saved logic (elemental weaknesses, low HP, archetypes)
                let score = this.evaluateActionScore(actor, action, target, party, allies);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestAction = action;
                    bestTarget = target;
                }
            }
        }

        return { action: bestAction, target: bestTarget };
    }

    static evaluateActionScore(actor, action, target, party, allies) {
        const actionObj = action.action || action;
        let score = actionObj.power ?? actionObj.basePower ?? 0;

        // Target Health Exploitation (Execute low-HP heroes)
        let targetMaxHp = target.maxHp ?? target.maxHP ?? 1;
        const targetHpPercentage = target.hp / targetMaxHp;
        if (targetHpPercentage < 0.3) {
            score += 30; 
        }
        
        // Elemental Exploitation
        const element = actionObj.element || action.elements;
        if (element) {
            if (target.weaknesses?.includes(element)) score += 20;
            if (target.resistances?.includes(element)) score -= 10;
            if (target.immunities?.includes(element)) score -= 50;
        }
        
        // Archetype persona adjustments
        if (actor.archetype === FoeArchetypes.AIRBORNE && actionObj.type === "RANGED") {
            score += 20; 
        }
        if (actor.archetype === FoeArchetypes.CYTOPATH && actionObj.type === "MAGIC") {
            score += 20; 
        }

        // Low Health Self-Preservation
        const selfHpPercentage = actor.hp / actor.maxHP;
        if (selfHpPercentage < 0.3 && actionObj.type === "HEAL") {
            score += 50; 
        }

        // Random variance to make AI less deterministic (-5 to +4)
        score += Math.floor(Math.random() * 10) - 5;
        return score;
    }
}