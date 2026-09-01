export class TacticalEnvironment {
    /**
     * Calculates all discrete grid coordinates along a straight line using Bresenham's algorithm.
     * Excludes the source and target tiles.
     * 
     * @future_feature (Line-of-Sight UI & Multi-Raycasting):
     * - Extend or wrap this method to support sub-tile or multi-ray casting for partial sight mechanics.
     * - Cast parallel sub-rays (e.g., from tile corners) to calculate an exact visibility percentage (0% to 100%).
     * - Use the resulting percentage to dynamically drive UI elements (e.g., rendering a green line for clear sight, 
     *   a partial/yellow line for reduced accuracy, or a red line/blocked indicator for total obstruction).
     * - If visibility falls below a defined threshold (e.g., < 20%), prevent execution of CombatAction entirely; 
     *   otherwise, apply dynamic accuracy penalties (e.g., Fallout-style modifiers like BlazE's -10% cover penalty).
     * 
     * @param {Object} source - Starting coordinates {x, y}
     * @param {Object} target - Ending coordinates {x, y}
     * @returns {Array<Object>} Array of intermediate tile coordinates {x, y}
     */
        

    static getTilesAlongLine(source, target) {
        let tiles = [];
        let dx = Math.abs(target.x - source.x);
        let dy = Math.abs(target.y - source.y);
        let sx = (source.x < target.x) ? 1 : -1;
        let sy = (source.y < target.y) ? 1 : -1;
        let err = dx - dy;
        
        let current = { x: source.x, y: source.y };
        
        while (true) {
            if ((current.x !== source.x || current.y !== source.y) && 
                (current.x !== target.x || current.y !== target.y)) {
                tiles.push({ x: current.x, y: current.y });
            }
            
            if (current.x === target.x && current.y === target.y) break;
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                current.x += sx;
            }
            if (e2 < dx) {
                err += dx;
                current.y += sy;
            }
        }
        return tiles;
    }

    /**
     * Evaluates whether an obstacle blocks the line of sight between shooter and target.
     * 
     * @future_feature (Combat Execution & Echo/BlazE Integration):
     * - Hook this method into the skill execution pipeline for ranged CombatActions (e.g., BlazE's Shotgun).
     * - Feed the calculated visibility state into the combat handler to apply cover penalties (e.g., BlazE's -10% modifier).
     * - Ensure Echo Sniper inherits this exact evaluation logic when copying ally actions.
     * 
     * @param {Object} shooterPos - Attacking entity coordinates {x, y}
     * @param {Object} enemyPos - Target entity coordinates {x, y}
     * @returns {boolean} True if an obstacle intersects the line of sight, false otherwise
     */

    static evaluateCoverState(shooterPos, enemyPos, obstacles) {
        let dx = enemyPos.x - shooterPos.x;
        let dy = enemyPos.y - shooterPos.y;

        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            return false;
        }

        let pathTiles = this.getTilesAlongLine(shooterPos, enemyPos);
        return obstacles.some(obs => 
            pathTiles.some(tile => tile.x === obs.x && tile.y === obs.y)
        );
    }
}
// Found a better solution optimizing Bresenham's Line Algo and a Range-and-Cover Inspection
function evaluateAimState(playerPos, targetPos, weapon, obstacles) {
    let distance = Math.hypot(targetPos.x - playerPos.x, targetPos.y - playerPos.y); //checks the range
    if (distance > weapon.maxRange) {
        return "red"; // Out of range
    }

    let pathTiles = getTilesAlongLine(playerPos, targetPos); // Bresenham's line algo
    let hasSolidBlock = false;
    let hasCover = false;

    for (let tile of pathTiles) {
        let obstacle = obstacles.find(o => o.x === tile.x && o.y === tile.y); // check if obstacle blocks target
        if (obstacle) {
            if (obstacle.isSolid) {
                hasSolidBlock = true;
                break; // stops anymore checks
            } else if (obstacle.isCover) {
                hasCover = true;
            }
        }
    }
    if (hasSolidBlock) return "red";
    if (hasCover) return "yellow";
    return "white";
}

/**
 * Calculates tiles within a forward-facing cone.
 * @param {Object} origin - Attacker's coordinates {x, y}
 * @param {Object} direction - Normalized aiming vector e.g., {x: 0, y: -1} for North
 * @param {number} range - Weapon range (e.g., 2 for Titan Greatsword)
 * @returns {Array<Object>} Array of tile coordinates inside the cone
 */

function getConeTiles(origin, direction, range) {
    let affectedTiles = [];

    for (let d = 1; d <= range; d++) {
        let centerX = origin.x + (direction.x * d);
        let centerY = origin.y + (direction.y * d);
        
        affectedTiles.push({ x: centerX, y: centerY});

        // Spread outwards perpendicularly based on distance
        // Distance 1 = width of 3 (center + 1 left + 1 right)
        // Distance 2 = width of 5 (center + 2 left + 2 right)
        let perpX = direction.y;
        let perpY = -direction.x;
        
        for (let w = 1; w <= d; w++) {
            affectedTiles.push({x: centerX + (perpX * w), y: centerY + (perpY * w)});
            affectedTiles.push({ x: centerX - (perpX * w), y: centerY - (perpY * w) });
        }
    }
    return affectedTiles;
}


/**
 * Executes Ace's Titan Greatsword swing against a target tile.
 * If the target contains breakable scrap, it clears it to floor.
 * Natural walls remain completely unaffected.
 * 
 * @param {Object} character - The acting character (e.g., Ace)
 * @param {Object} targetTilePos - Grid coordinates {x, y} being attacked
 * @param {Array<Array>} grid - The active 15x15 micro-map grid
 * @returns {boolean} True if scrap was destroyed, false otherwise
 */

function executeAceGreatSword(character, originPos, aimDirection, grid, enemiesInRoom, minigameMultiplier = 1.0) {
    if (!character || character.weapon.scope !== "AOE_CONE") return { enemiesDamaged: 0, scrapDestroyed: 0 };

    let targetTiles = getConeTiles(originPos, aimDirection, character.weapon.range);
    let hitResults = { enemiesDamaged: 0, scrapDestroyed: 0 };

    for (let pos of targetTiles) {
        // Bound check
        if (pos.x >= 0 && pos.x < grid.length && pos.y >= 0 && pos.y < grid[0].length) {
            let tile = grid[pos.x][pos.y];

            // Destroy scrap
            if (tile.type === "scrap" && !tile.isIndestructible) {
                grid[pos.x][pos.y] = { type: "floor", isIndestructible: false, isCover: false };
                hitResults.scrapDestroyed++;
            }
            
            let enemyOnTile = enemiesInRoom.find(e => e.x === pos.x && e.y === pos.y);
            if (enemyOnTile) {
                let finalDamage = Math.floor(character.weapon.basePower * minigameMultiplier);
                enemyOnTile.hp -= finalDamage;
                hitResults.enemiesDamaged++;
            }
        }
    }
    return hitResults; // Triggers UI canvas juice (screen shake) if true
}

/**
 * Calculates the dynamic hit probability between an attacker and a target.
 * Enforces a guaranteed floor and ceiling to prevent frustrating RNG lockouts.
 * 
 * @param {Object} attacker - Rider or Virus instance executing the attack
 * @param {Object} target - Rider or Virus instance receiving the attack
 * @param {number} characterEvasionModifier - Flat or scaling modifier (e.g., -0.10 for Strike, -0.20 max for Rose)
 * @returns {number} Final hit probability percentage (bounded between 15% and 95%)
 */

function calculateHitProb(attacker, target, characterEvasionModifier = 0) {
    const BASE_HIT_CHANCE = 0.75;

    // Extract speed stat (defaults to 10 if undefined)
    let attackSpeed = attacker.speed || 10;
    let targetSpeed = target.speed || 10; 

    // Calculate speed delta ratio (capped to prevent extreme outliers)
    let speedDelta = (attackSpeed - targetSpeed) * 0.0005; // 0.5% shift per speed point difference    
    
    //Factor character's stat; Strike has a -10% to any incoming attacks, Rose starts at 5 and scales up to -20%
    let finalHitChance = BASE_HIT_CHANCE + speedDelta + characterEvasionModifier;

    // Hard bounds guarantee that no unit is completely untouchable (minimum 15% hit chance) 
    // and no attack is a guaranteed whiff against a sluggish target (maximum 95% hit chance)
    return Math.min(0.95, Math.max(0.15, finalHitChance));
}