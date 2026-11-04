import { FoeArchetypes } from "../data/foeConfig.js";
import { evaluateAimState } from "./tactics.js";
import { getReachableTiles, findPath, movementBudget, tileCost } from "./Pathfinding.js";

const alive = u => u && u.hp > 0 && !u.isDefeated;

export class FoeAIController {
    static takeTurn(actor, ctx) {
        const { grid, party, allies = [], availableActions = [], manaPool = null } = ctx;
        const none = { moveTo: null, action: null, target: null, aimState: null };
        const targets = party.filter(alive);
        if (!grid || !targets.length) return none;

        const actions = availableActions
            .map(a => a.action ?? a)
            .filter(a => !manaPool || manaPool.canAfford(a.magicCost ?? 0));
        const units = [...party, ...allies].filter(alive);
        const budget = movementBudget(actor.speed);
        const reachable = getReachableTiles(grid, actor, budget, units, actor);

        // Score each (action, target) once so the random variance doesn't jitter the tile choice.
        const base = new Map();
        for (const a of actions) for (const t of targets) base.set(`${a.name}|${targets.indexOf(t)}`, this.evaluateActionScore(actor, a, t));

        let best = null;
        for (const tile of reachable) {
            for (const action of actions) {
                for (let i = 0; i < targets.length; i++) {
                    const aim = evaluateAimState(tile, targets[i], action.range ?? 1, grid);
                    if (aim === "red") continue;
                    const score = base.get(`${action.name}|${i}`) - tile.cost * 0.5 - (aim === "yellow" ? 10 : 0);
                    if (!best || score > best.score) best = { score, tile, action, target: targets[i], aim };
                }
            }
        }

        if (best) {
            const stay = best.tile.x === actor.x && best.tile.y === actor.y;
            return { moveTo: stay ? null : { x: best.tile.x, y: best.tile.y }, action: best.action, target: best.target, aimState: best.aim };
        }
        return { ...none, moveTo: this.advance(actor, targets, units, grid, budget) };
    }

    // No shot this turn: walk the shortest path toward the nearest hero, stopping on the last affordable free tile.
    static advance(actor, targets, units, grid, budget) {
        let path = null;
        for (const t of targets) {
            const p = findPath(grid, actor, t, units, actor);
            if (p.length > 1 && (!path || p.length < path.length)) path = p;
        }
        if (!path) return null;
        let spent = 0, dest = null;
        for (let i = 1; i < path.length - 1; i++) { // last node is the hero's tile
            const cost = tileCost(grid[path[i].x][path[i].y], actor);
            if (spent + cost > budget) break;
            spent += cost;
            dest = path[i];
        }
        return dest ? { x: dest.x, y: dest.y } : null;
    }

    static evaluateActionScore(actor, action, target) {
        let score = action.power ?? action.basePower ?? 0;

        const maxHp = target.maxHp ?? target.maxHP ?? 1;
        if (target.hp / maxHp < 0.3) score += 30; // finish low-HP heroes

        const el = action.element;
        if (el) {
            if (target.weaknesses?.includes(el)) score += 20;
            if (target.resistances?.includes(el)) score -= 10;
            if (target.immunities?.includes(el)) score -= 50;
        }

        if (actor.archetype === FoeArchetypes.AIRBORNE && (action.range ?? 1) > 1) score += 20;
        if (actor.archetype === FoeArchetypes.CYTOPATH && action.type === "Magic") score += 20;

        return score + Math.floor(Math.random() * 10) - 5;
    }
}