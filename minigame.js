/**
 * Shared Minigame Manager
 * Every minigame resolves to a multiplier that multiplies the final damage:
 * - 0.0 = Miss / Failure
 * - 0.6 = Partial Hit / Grazed
 * - 1.0 = Full Standard Hit
 * - 1.2+ = Critical / Perfect Hit
 */

export class MiniGameSystem {
    // Drag to target for Ace and Echo
    static runSliderMiniGame(containerElement, onComplete) {
        // Implementation: DOM or Canvas element where user drags a marker along a line.
        // Returns multiplier based on accuracy proximity.
        let accuracyMulti = 1.0; //on completion
        onComplete(accuracyMulti)
    }

    // Fallout Style RNG with scrap/cover affecting accuracy
    static runRNGHitCheck(baseAccuracy = 85, isBehindCover = false) {
        let finalChance = isBehindCover ? baseAccuracy - 25: baseAccuracy; 
        let roll = Math.random() * 100;

        if (roll <= finalChance) {
            return {multiplier: 1.0, text: "Hit!"};
        } else {
            return {multiplier: 0.0, text: "Miss!"};
        }
    }
    // Rose's Undertale/Deltarune; Full damage 
    static resolveTimingBar(barStopPosition, targetZoneStart, targetZoneEnd, partialZoneStart, partialZoneEnd) {
        if (barStopPosition >= targetZoneStart && barStopPosition <= targetZoneEnd) {
            return { multiplier: 1.2, text: "Perfect!"};
        } else if (barStopPosition >= partialZoneStart && barStopPosition <= partialZoneEnd) {
            return { multiplier: 0.6, text: "Graze Hit"};
        } else {
            return { multiplier: 0.0, text: "Miss!"};
        }
    }

    // Strike's speed punch aka JoJo punch
    static runSpamClick(clickCount, targetClickNeeded) {
        let ratio = clickCount / targetClickNeeded;
        if (ratio >= 1.0) return { multiplier: 1.0, text: ""};
        if (ratio >= 0.7) return { multiplier: 0.7, text: ""};
        if (ratio >= 0.4) return { multiplier: 0.4, text: ""};
        return { multiplier: 0.0, text: "Missed!"}; 
    }
}