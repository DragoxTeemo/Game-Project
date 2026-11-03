//Calculates the exact tile distance between two grid coordinates
export function tileDistance(posA, posB) {
    return Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y); //Manhattan distance for grid layouts
}

export function getReachableTiles(startPos, movementBudget, obstacles, unit) {
    const reachable = new Map(); // key: x, y; value: cost
    const queue = [{x: startPos.x, y: startPos.y, cost: 0}];

    reachable.set(`${startPos.x},${startPos.y}`, 0);

    while (queue.length > 0) {
        queue.sort((a,b) => a.cost - b.cost);
        let current = queue.shift();

        const neighbor = [
            { x: current.x, y: current.y - 1 }, // North
            { x: current.x, y: current.y + 1 }, // South
            { x: current.x - 1, y: current.y }, // West
            { x: current.x + 1, y: current.y }  // East
        ];

        for (let next of neighbor) {
            // Bound check
            if (next.x < 0 || next.x >= grid.length || next.y < 0 || next.y >= grid[0].length) {
                continue;
            }

            let tile = grid[next.x][next.y];
            let key = `${next.x},${next.y}`;

            // Column, wall, and scrap are impassable for movement
            if (tile.type === "column" || tile.type === "natural_wall" || tile.type === "wall" || tile.type === "scrap" || tile.isIndestructible) {
                continue;
            }
            // Check if another unit occupies this tile
            let isOccupied = units.some(u => u.x === next.x && u.y === next.y && u.hp > 0 && !u.isDefeated);
            if (isOccupied) {
                continue;
            }

            // Check dynamic obstacles if passed
            let isBlockedByObstacle = obstacles?.some(o => o.x === next.x && o.y === next.y && o.isSolid);
            if (isBlockedByObstacle) {
                continue;
            }
            // Mud costs 2 movement while standard floor costs 1
            let moveCost = (tile.type === "mud") ? 2 : 1;
            let totalCost = current.cost + moveCost;

            if (totalCost <= movementBudget) {
                if (!reachable.has(key) || totalCost < reachable.get(key)) {
                    reachable.set(key, totalCost);
                    queue.push({x: next.x, y: next.y, cost: totalCost});
                }
            }
        }
    }

    return Array.from(reachable.entries()).map(([key, cost]) => {
        let [x,y] = key.split(',').map(Number);
        return {x, y, cost};
    });
}

export function findPath(startPos, targetPos, grid, obstacles, unity) {
    let openSet = [{x: startPos.x, y: startPos.y, g: 0, h: tileDistance(startPos, targetPos), parent: null}];
    let closedSet = new Set();

    let getNodeKey = (node) => `${node.x},${node.y}`;

    while (openSet.length > 0) {
        // Sort by lowest f score (g + h)
        openSet.sort((a,b) => (a.g + a.h) - (b.g + b.h));
        let current = openSet.shift();
        let currentKey = getNodeKey(current);

        if (current.x === targetPos.x && current.y === targetPos.y) {
            //Reconsturct path
            let path = [];
            let curr = current;
            while (curr) {
                path.unshift({x: curr.x, y: curr.y});
                curr = curr.parent;
            }
            return path; // Array of coordinates from start to target
        }
        closedSet.add(currentKey);
        
        const neighbor = [
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 },
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y }
        ];

        for (let next of neighbor) {
            if (next.x < 0 || next.x >= grid.length || next.y < 0 || next.y >= grid[0].length) {
                continue;
            }

            let nextKey = `${next.x},${next.y}`;
            if (closedSet.has(nextKey)) continue;

            let tile = grid[next.x][next.y];

            if (tile.type === "column" || tile.type === "natural_wall" || tile.type === "wall" || tile.type === "scrap" || tile.isIndestructible) {
                continue;
            }

            let isOccupied = units.some(u => u.x === next.x && u.y === next.y && u.hp > 0 && !u.isDefeated);
            if (isOccupied && (next.x !== targetPos.x || next.y !== targetPos.y)) {
                continue; // Can't step through occupied tiles unless it's the final target destination
            }

            let moveCost = (tile.type === "mud") ? 2 : 1;
            let tentativeG = current.g + moveCost;

            let neighborNode = openSet.find(n => n.x === next.x && n.y === next.y);

            if (!neighborNode) {
                neighborNode = {
                    x: next.x,
                    y: next.y,
                    g: tentativeG,
                    h: tileDistance(next, targetPos),
                    parent: current
                };
                openSet.push(neighborNode);
            } else if (tentativeG < neighborNode.g) {
                neighborNode.g = tentativeG;
                neighborNode.parent = current;
            }
        }
    }
    return []; // // Return empty array if no path exists around walls/obstacles
}