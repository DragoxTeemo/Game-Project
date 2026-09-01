import {createNoise2D} from 'simplex-noise';
const noise2D = createNoise2D();

function generateMap(width, height) {
    let grid = [];
    let centerX = width / 2;
    let centerY = height / 2;
    let maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let x = 0; x < width; x++) {
        grid[x] = [];
        for (let y = 0; y < height; y++) {
            let rawNoise = (noise2D(x * 0.1, y * 0.1) + 1) / 2; // get the raw simplex noise value (-1 to 1, normalize to 0 to 1)
            
            // Calculate distance from center (radial falloff)
            let distX = x - centerX;
            let distY = y - centerY;
            let distanceFromCenter = Math.sqrt(distX * distX + distY * distY);
            let distanceFactor = distanceFromCenter /   maxDistance; // 0 at center, 1 at edges

            let finalValue = rawNoise * distanceFactor; // Combine noise with distance so edges get denser hazards

            let tileType = "floor";
            if (finalValue > 0.65) {
                tileType = "scrap";
            } else if (finalValue > 0.45) {
                tileType = "mud";
            }
            grid[x][y] = tileType;

        }
    }
    return grid;
}