import { isAlive } from "../data/UnitState";

// grid[x][y]; units carry tile coords on unit.x / unit.y.
// Impassable: column, wall, natural_wall, scrap, other living units. Mud costs 2 (unless mover.isImmuneToMud).
const BLOCKED = new Set(["column", "natural_wall", "wall", "scrap"]);
const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];

export const tileDistance = (a,b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// Speed -> Movement points 
export function movementBudget(speed = 0) {
    if (speed >= 65) return 8;
    if (speed >= 45) return 7;
    if (speed >= 30) return 6;
    if (speed >= 20) return 5;
    if (speed >= 10) return 4;
    return 3;
}

export function isPassable(grid, x, y) {
    const tile = grid[x]?.[y];
    return !!tile && !BLOCKED.has(tile.type) && !tile.isIndestructible;
}
 
export const tileCost = (tile, mover = null) =>
    tile.type === "mud" && !mover?.isImmuneToMud ? 2 : 1;
 
function occupiedKeys(units, mover) {
    const keys = new Set();
    for (const u of units) if (u !== mover && isAlive(u)) keys.add(`${u.x},${u.y}`);
    return keys;
}
 
// Dijkstra flood limited by budget. Includes the start tile at cost 0.
export function getReachableTiles(grid, start, budget, units = [], mover = null) {
    const occupied = occupiedKeys(units, mover);
    const best = new Map([[`${start.x},${start.y}`, 0]]);
    const open = [{ x: start.x, y: start.y, cost: 0 }];
 
    while (open.length) {
        open.sort((a, b) => a.cost - b.cost);
        const cur = open.shift();
        if (cur.cost > best.get(`${cur.x},${cur.y}`)) continue;
        for (const [dx, dy] of DIRS) {
            const nx = cur.x + dx, ny = cur.y + dy, key = `${nx},${ny}`;
            if (!isPassable(grid, nx, ny) || occupied.has(key)) continue;
            const cost = cur.cost + tileCost(grid[nx][ny], mover);
            if (cost > budget || cost >= (best.get(key) ?? Infinity)) continue;
            best.set(key, cost);
            open.push({ x: nx, y: ny, cost });
        }
    }
    return [...best].map(([k, cost]) => {
        const [x, y] = k.split(",").map(Number);
        return { x, y, cost };
    });
}
 
// A*. Returns [start, ..., target] or []. The target tile may be occupied (it is the goal), nothing else may.
export function findPath(grid, start, target, units = [], mover = null) {
    const occupied = occupiedKeys(units, mover);
    const tKey = `${target.x},${target.y}`;
    const bestG = new Map([[`${start.x},${start.y}`, 0]]);
    const open = [{ x: start.x, y: start.y, g: 0, f: tileDistance(start, target), parent: null }];
 
    while (open.length) {
        open.sort((a, b) => a.f - b.f);
        const cur = open.shift();
        if (cur.g > bestG.get(`${cur.x},${cur.y}`)) continue;
        if (cur.x === target.x && cur.y === target.y) {
            const path = [];
            for (let n = cur; n; n = n.parent) path.unshift({ x: n.x, y: n.y });
            return path;
        }
        for (const [dx, dy] of DIRS) {
            const nx = cur.x + dx, ny = cur.y + dy, key = `${nx},${ny}`;
            if (!isPassable(grid, nx, ny)) continue;
            if (occupied.has(key) && key !== tKey) continue;
            const g = cur.g + tileCost(grid[nx][ny], mover);
            if (g >= (bestG.get(key) ?? Infinity)) continue;
            bestG.set(key, g);
            open.push({ x: nx, y: ny, g, f: g + tileDistance({ x: nx, y: ny }, target), parent: cur });
        }
    }
    return [];
}
