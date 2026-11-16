import { isPassable } from "./pathfinding";

export function createOpenGrid(width = 15, height = 15) {
    return Array.from({ length: width }, () =>
        Array.from({ length: height }, () => ({ type: "floor", isIndestructible: false, isCover: false })));
}

// Heroes start on the left edge band, foes on the right. Never on blocked tiles or on each other.
export function placeUnits(grid, heroes, foes) {
    const w = grid.length, h = grid[0].length;
    const taken = new Set();
    const place = (units, xMin, xMax) => {
        let lo = xMin, hi = xMax;
        const free = () => {
            const out = [];
            for (let x = lo; x <= hi; x++) for (let y = 0; y < h; y++)
                if (isPassable(grid, x, y) && !taken.has(`${x},${y}`)) out.push({ x, y });
            return out;
        };
        let spots = free();
        while (spots.length < units.length && (lo > 0 || hi < w - 1)) { lo = Math.max(0, lo - 1); hi = Math.min(w - 1, hi + 1); spots = free(); }
        spots.sort(() => Math.random() - 0.5);
        units.forEach((u, i) => { u.x = spots[i].x; u.y = spots[i].y; taken.add(`${u.x},${u.y}`); });
    };
    place(heroes, 0, 2);
    place(foes, w - 3, w - 1);
}