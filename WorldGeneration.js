/**
 * ==========================================
 * PROJECT ADDENDUM & 4-MONTH ROADMAP
 * ==========================================
 * 
 * CORE ARCHITECTURAL RULES:
 * - Viewport: Top-down orthogonal (Binding of Isaac style). Strictly NO isometric/Hades angles.
 * - Room Sizing: Dynamic micro-grids. Action worlds = 15x15; Rest/Chest stops = 7x7 for intimacy.
 * - Procedural Safeguards: Rest stops can NEVER be adjacent to spawn and must always follow an action room.
 * - Narrative Diegesis: Use Alice's dialogue ("The world feels condensed") to justify procedural boundaries.
 * 
 * ==========================================
 * CHARACTER & SYSTEM DESIGN ARCHITECTURE
 * ==========================================
 * - Roster System: 3 Active Combatants + 3 Bench Support (Bench characters perform 
 *   automated passive actions/buffs every round; active units gain XP, benched get 30-50%). (LATE DEVELOPMENT ONLY)
 * - Cody (Echo) Motif: Kuuga/W hybrid. Jack of all trades with equal base stats. 
 *   His forms ("echo" allies) serve as built-in tutorials for team mechanics.
 * - Code Reuse & Modular Mechanics (Save Development Time):
 *   * Directional Cones / AOE Grids: Shared math powers Ethan's Ice Cone, Rebecca's 
 *     Shotgun, Rose's Whip. Differentiated entirely via 
 *     audiovisual juice (screen shake, flash overlays, foley snapshots).
 *   * Rapid-Input (Spam-Click): Shared math for Strike and Cody's Speed Form. 
 *     Kinesthetic feedback via reticle jitter and enemy sprite ghost-shaking.
 *   * Timing Bars: Shared math for Rose's Dagger/Whip combos and Cody's Flow form.
 * - Campfire Economy: Rest, cook, brew potions (5 parts = 1 potion), and craft 
 *   ammo for Rebecca's rifle/shotgun/explosives. Scrap walls replace complex crafting.
 * 
 * ==========================================
 * DEVELOPMENT PRIORITIES (MoSCoW FRAMEWORK)
 * ==========================================
 * 
 * 1. MUST-HAVE (Months 1–2): Core Functional Loop
 *    [ ] Player movement & basic grid/AABB collision.
 *    [ ] Macro map generation + BFS accessibility validation.
 *    [ ] Micro map rendering (15x15 action rooms vs 7x7 safe rooms).
 *    [ ] Basic enemy AI (old-school Zelda style tracking/movement) + XP drops.
 *    [ ] Game state manager (Title -> Macro Map -> Micro Room -> Game Over).
 *    [ ] Base form implementation for active characters & 3-active / 3-bench roster loop.
 * 
 * 2. SHOULD-HAVE (Month 3): Polish & Identity
 *    [ ] UI Overlays: DOM-based text boxes for Alice's dialogue pools (3+ lines).
 *    [ ] Kamen Rider-inspired static hero art & high-contrast enemy sprites.
 *    [ ] Canvas Juice: Screen shakes, hit flashes, cone particle effects, 
 *        radial gradient lighting for campfires; chest open shine effect.
 *    [ ] Campfire crafting UI (ammo/potion loop using 5-part conversion rules).
 * 
 * 3. COULD-HAVE (Month 4 - Time Permitting): Expansion
 *    [ ] Campfire interaction mechanics (talking with companions during rest).
 *    [ ] Mini-boss implementation at fixed macro-node milestones.
 *    [ ] Walking/attack animation frames for hero and enemy sprites.
 * 
 * 4. WON'T-HAVE (Strictly Out of Scope):
 *    [ ] Isometric sorting, voice acting, complex branching dialogue trees, 
 *        dynamic lighting engines, infinite/endless scrolling modes, 16 individual 
 *        fully unique form sub-engines (stick to base forms + modular shared logic).
 * ==========================================
 */


import { createNoise2D } from 'https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/+esm';
const noise2D = createNoise2D();

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const tileSize = canvas.width / 15; 

let noiseSeedOffset = Math.random() * 1000;

// 1. MICRO MAP GENERATION
function generateMicroMap(width, height) {
    let grid = [];
    let potentialScraps = [];
    noiseSeedOffset += 18.4;

    for (let x = 0; x < width; x++) {
        grid[x] = [];
        for (let y = 0; y < height; y++) {
            let noiseVal = (noise2D((x + noiseSeedOffset) * 0.2, (y + noiseSeedOffset) * 0.2) + 1) / 2;
            
            let tileType = "floor";
            if (noiseVal > 0.80) {
                tileType = "scrap";
                potentialScraps.push({ x, y, noiseVal });
            } else if (noiseVal > 0.70) {
                tileType = "mud";
            }
            grid[x][y] = tileType;
        }
    }

    potentialScraps.sort((a, b) => b.noiseVal - a.noiseVal);
    let confirmedScraps = [];

    for (let candidate of potentialScraps) {
        let tooClose = false;
        for (let placed of confirmedScraps) {
            let distChebyshev = Math.max(Math.abs(candidate.x - placed.x), Math.abs(candidate.y - placed.y));
            if (distChebyshev <= 2) { tooClose = true; break; }
        }
        if (!tooClose) { confirmedScraps.push(candidate); } 
        else { grid[candidate.x][candidate.y] = "mud"; }
    }

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (grid[x][y] === "mud") {
                let mudNeighbors = 0;
                let allNeighbors = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (let [dx, dy] of allNeighbors) {
                    let nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[nx][ny] === "mud") {
                        mudNeighbors++;
                    }
                }
                if (mudNeighbors < 1) { grid[x][y] = "floor"; }
            }
        }
    }
    return grid;
}

function drawMicroMapVisual(grid) {
    const colors = { floor: "#d3d3d3", mud: "#8b5a2b", scrap: "#ff4500" };
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            ctx.fillStyle = colors[grid[x][y]] || "#000000";
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.strokeStyle = "#222";
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

export function generateValidatedMacroMap(groupLevel = 1) {
    let roomCount = Math.min(20, Math.floor(6 + (groupLevel * 0.35))); 
    let loopChance = Math.min(0.85, 0.15 + (groupLevel * 0.015)); 
    let chestChance = Math.min(0.4, 0.1 + (groupLevel * 0.005));

    let allNodes = new Map();
    let occupiedCoords = new Set();
    let currentX = 0, currentY = 0;
    
    let firstNode = { 
        id: "Room_0", x: currentX, y: currentY, 
        connections: [], enemies: 0, hasChest: false, isStart: true, isCampfire: false 
    };
    allNodes.set(firstNode.id, firstNode);
    occupiedCoords.add(`${currentX},${currentY}`);

    let i = 1;
    let currentActiveNode = firstNode;

    while (i < roomCount) {
        let directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
        directions.sort(() => Math.random() - 0.5);
        
        let placedOne = false;
        for (let dir of directions) {
            let nextX = currentActiveNode.x + dir.x;
            let nextY = currentActiveNode.y + dir.y;
            let coordKey = `${nextX},${nextY}`;

            if (!occupiedCoords.has(coordKey)) {
                let newNodeId = `Room_${i}`;
                let enemyScalingCount = Math.floor(Math.random() * 2) + Math.floor(groupLevel / 10);

                let newNode = { 
                    id: newNodeId, x: nextX, y: nextY, 
                    connections: [currentActiveNode.id], 
                    enemies: Math.max(1, enemyScalingCount), 
                    hasChest: Math.random() < chestChance,
                    isStart: false,
                    isCampfire: false 
                };
                
                currentActiveNode.connections.push(newNodeId);
                allNodes.set(newNodeId, newNode);
                occupiedCoords.add(coordKey);
                
                currentActiveNode = Math.random() > 0.4 ? newNode : firstNode;
                i++;
                placedOne = true;
                break;
            }
        }

        if (!placedOne) {
            let nodeKeys = Array.from(allNodes.keys());
            currentActiveNode = allNodes.get(nodeKeys[Math.floor(Math.random() * nodeKeys.length)]);
        }
    }

    // Add multi-choice loops
    let nodeList = Array.from(allNodes.values());
    if (groupLevel > 5) {
        for (let nodeA of nodeList) {
            for (let nodeB of nodeList) {
                if (nodeA.id !== nodeB.id && !nodeA.connections.includes(nodeB.id)) {
                    let dist = Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
                    if (dist === 1 && Math.random() < loopChance) {
                        nodeA.connections.push(nodeB.id);
                        nodeB.connections.push(nodeA.id);
                    }
                }
            }
        }
    }

    // --- CHEST SEPARATION PASS ---
    for (let nodeA of nodeList) {
        if (nodeA.hasChest) {
            for (let neighborId of nodeA.connections) {
                let neighbor = allNodes.get(neighborId);
                if (neighbor && neighbor.hasChest && !neighbor.isStart) {
                    neighbor.hasChest = false;
                }
            }
        }
    }

    // --- CAMPFIRE ASSIGNMENT PASS (FIXED: Now properly invoked) ---
    assignCampfiresToMacroMap(allNodes, roomCount);

    let startNode = allNodes.get("Room_0");
    let success = isMapFullyAccessible(startNode, allNodes);

    return { success, allNodes, groupLevel };
} 

function assignCampfiresToMacroMap(allNodes, roomCount) {
    let targetCampfires = roomCount >= 16 ? 3 : roomCount >= 10 ? 2 : roomCount >= 8 ? 1 : 0;
    if (targetCampfires === 0) return;

    let candidateNodes = Array.from(allNodes.values()).filter(node => {
        let isAdjacentToSpawn = node.connections.includes("Room_0");
        return !node.isStart && !node.hasChest && !isAdjacentToSpawn;
    });

    candidateNodes.sort(() => Math.random() - 0.5);

    let placedCampfires = 0;
    for (let node of candidateNodes) {
        if (placedCampfires >= targetCampfires) break;
        let followsActionRoom = node.connections.some(neighborId => {
            let neighbor = allNodes.get(neighborId);
            return neighbor && neighbor.enemies > 0 && !neighbor.isStart;
        });

        if (followsActionRoom || node.enemies > 0) {
            node.isCampfire = true;
            node.enemies = 0; 
            placedCampfires++;
        }
    }
}

export function drawMacroMapVisual(macroData) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let nodes = Array.from(macroData.allNodes.values());
    if (nodes.length === 0) return;

    let minX = Math.min(...nodes.map(n => n.x)), maxX = Math.max(...nodes.map(n => n.x));
    let minY = Math.min(...nodes.map(n => n.y)), maxY = Math.max(...nodes.map(n => n.y));
    let spanX = Math.max(1, maxX - minX), spanY = Math.max(1, maxY - minY);
    let padding = 60, usableW = canvas.width - padding * 2, usableH = canvas.height - padding * 2;

    let getCanvasCoords = (nx, ny) => ({
        x: padding + ((nx - minX) / spanX) * usableW,
        y: padding + ((ny - minY) / spanY) * usableH
    });

    ctx.strokeStyle = "#4ea8de";
    ctx.lineWidth = 3;
    let drawn = new Set();

    for (let node of nodes) {
        let posA = getCanvasCoords(node.x, node.y);
        for (let neighborId of node.connections) {
            let neighbor = macroData.allNodes.get(neighborId);
            if (neighbor) {
                let pairKey = [node.id, neighborId].sort().join("-");
                if (!drawn.has(pairKey)) {
                    drawn.add(pairKey);
                    let posB = getCanvasCoords(neighbor.x, neighbor.y);
                    ctx.beginPath();
                    ctx.moveTo(posA.x, posA.y);
                    ctx.lineTo(posB.x, posB.y);
                    ctx.stroke();
                }
            }
        }
    }

    for (let node of nodes) {
        let pos = getCanvasCoords(node.x, node.y);
        if (node.id === "Room_0" || node.isStart) ctx.fillStyle = "#38b000"; 
        else if (node.hasChest) ctx.fillStyle = "#7209b7"; 
        else if (node.isCampfire) ctx.fillStyle = "#fb8500"; 
        else ctx.fillStyle = "#ffb703"; 
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.id.replace("Room_", "R"), pos.x, pos.y);
    }
}

function isMapFullyAccessible(startNode, allNodes) {
    if (!startNode || allNodes.size === 0) return false;
    let visited = new Set();
    let queue = [startNode];
    visited.add(startNode.id);

    while (queue.length > 0) {
        let currentNode = queue.shift();
        for (let neighborId of currentNode.connections) {
            let neighborNode = allNodes.get(neighborId);
            if (neighborNode && !visited.has(neighborNode.id)) {
                visited.add(neighborNode.id);
                queue.push(neighborNode);
            }
        }
    }
    return visited.size === allNodes.size;
}

// Initial micro render on script load
let initialMicro = generateMicroMap(15, 15);
drawMicroMapVisual(initialMicro);

/**
 * 
 * Generates an organic cave/wall system on a 15x15 micro-grid.
 * Enforces indestructible natural walls, scrap spawn distribution, 
 * and guaranteed 4-way perimeter accessibility via BFS validation.
 */
/**
 * 
 * UPDATED
function generateValidatedCaveMicroMap(width = 15, height = 15) {
    let grid = [];
    let maxAttempts = 50;
    let attempt = 0;
    let isValid = false;

    while (!isValid && attempt < maxAttempts) {
        attempt++;
        grid = createRawCaveLayout(width, height);
        isValid = validateCaveAccessibility(grid, width, height);
    }

    // Fallback safety grid if max attempts are somehow exceeded
    if (!isValid) {
        grid = createFallbackOpenGrid(width, height);
    }

    return grid;
}

function createRawCaveLayout(width, height) {
    let grid = [];
    let potentialScraps = [];
    noiseSeedOffset += 31.7;

    // Phase 1: Initial Simplex noise pass for natural walls and floors
    for (let x = 0; x < width; x++) {
        grid[x] = [];
        for (let y = 0; y < height; y++) {
            let nVal = (noise2D((x + noiseSeedOffset) * 0.15, (y + noiseSeedOffset) * 0.15) + 1) / 2;
            
            // Default tile properties
            let tileType = "floor";
            let isIndestructible = false;
            let isCover = false;

            // Enforce open borders in the center 3-5 tiles of all sides
            let isCenterMargin = (
                (x >= 5 && x <= 9 && (y === 0 || y === height - 1)) ||
                (y >= 5 && y <= 9 && (x === 0 || x === width - 1))
            );

            if (!isCenterMargin) {
                if (nVal > 0.72) {
                    tileType = "natural_wall";
                    isIndestructible = true; // Cannot be destroyed except by specialized mechanics
                } else if (nVal > 0.58) {
                    tileType = "scrap";
                    isCover = true; // Breakable via Ace's sword
                    potentialScraps.push({ x, y, nVal });
                } else if (nVal > 0.48) {
                    tileType = "mud"; // Movement penalty only
                }
            }

            grid[x][y] = { type: tileType, isIndestructible, isCover };
        }
    }

    // Phase 2: Cellular Automata smoothing pass for organic cave clusters
    let smoothedGrid = JSON.parse(JSON.stringify(grid));
    for (let x = 1; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
            // Do not alter perimeter margins
            let isPerimeter = (x === 0 || x === width - 1 || y === 0 || y === height - 1);
            if (isPerimeter) continue;

            let wallNeighbors = 0;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    if (grid[x + dx][y + dy].type === "natural_wall") {
                        wallNeighbors++;
                    }
                }
            }

            // Apply smoothing rules (cave generation life/death threshold)
            if (wallNeighbors >= 5) {
                smoothedGrid[x][y] = { type: "natural_wall", isIndestructible: true, isCover: false };
            } else if (wallNeighbors <= 2 && grid[x][y].type === "natural_wall") {
                smoothedGrid[x][y] = { type: "floor", isIndestructible: false, isCover: false };
            }
        }
    }

    return smoothedGrid;
}

function validateCaveAccessibility(grid, width, height) {
    // Define entry checkpoints in the center of all 4 sides
    let checkpoints = [
        { x: Math.floor(width / 2), y: 0 },          // Top Center
        { x: Math.floor(width / 2), y: height - 1 }, // Bottom Center
        { x: 0, y: Math.floor(height / 2) },         // Left Center
        { x: width - 1, y: Math.floor(height / 2) }  // Right Center
    ];

    let start = checkpoints[0];
    let visited = new Set();
    let queue = [start];
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
        let current = queue.shift();
        let neighbors = [
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 },
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y }
        ];

        for (let n of neighbors) {
            if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                let tile = grid[n.x][n.y];
                let key = `${n.x},${n.y}`;
                // Passable if not an indestructible natural wall
                if (!tile.isIndestructible && !visited.has(key)) {
                    visited.add(key);
                    queue.push(n);
                }
            }
        }
    }

    // Verify that all major side checkpoints are mutually reachable via BFS
    for (let cp of checkpoints) {
        if (!visited.has(`${cp.x},${cp.y}`)) {
            return false; // Map is blocked/fragmented
        }
    }

    return true;
}

function createFallbackOpenGrid(width, height) {
    let grid = [];
    for (let x = 0; x < width; x++) {
        grid[x] = [];
        for (let y = 0; y < height; y++) {
            grid[x][y] = { type: "floor", isIndestructible: false, isCover: false };
        }
    }
    return grid;
}

function drawCaveMicroMapVisual(grid) {
    const colors = { 
        floor: "#d3d3d3", 
        mud: "#8b5a2b", 
        scrap: "#ff4500", 
        natural_wall: "#333333" 
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            let tile = grid[x][y];
            ctx.fillStyle = colors[tile.type] || "#000000";
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.strokeStyle = "#111";
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}
 */