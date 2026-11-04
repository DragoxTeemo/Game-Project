/**
 * Shared Minigame Manager
 * Every minigame resolves to a multiplier that multiplies the final damage:
 * - 0.0 = Miss / Failure
 * - 0.6 = Partial Hit / Grazed
 * - 1.0 = Full Standard Hit
 * - 1.2+ = Critical / Perfect Hit
 */

export class MiniGameSystem {
    static runSliderMiniGame(containerElement, onComplete) {
        onComplete(1.0); // stub
    }

    // Fallout Style RNG with scrap/cover affecting accuracy
    static runRNGHitCheck(baseAccuracy = 85, isBehindCover = false) {
        const chance = isBehindCover ? baseAccuracy - 10 : baseAccuracy;
        return Math.random() * 100 <= chance
            ? { multiplier: 1.0, text: "Hit!" }
            : { multiplier: 0.0, text: "Miss!" };
    }

    // Rose's Undertale/Deltarune; Full damage 
    static resolveTimingBar(pos, tStart, tEnd, pStart, pEnd) {
        if (pos >= tStart && pos <= tEnd) return { multiplier: 1.2, text: "Perfect!" };
        if (pos >= pStart && pos <= pEnd) return { multiplier: 1.0, text: "Hit" };
        return { multiplier: 0.6, text: "Graze!" };
    }

    // Strike's speed punch aka JoJo punch
    static runSpamClick(clickCount, targetClickNeeded) {
        const ratio = clickCount / targetClickNeeded;
        if (ratio >= 1.0) return { multiplier: 1.0, text: "" };
        if (ratio >= 0.7) return { multiplier: 0.7, text: "" };
        if (ratio >= 0.4) return { multiplier: 0.4, text: "" };
        return { multiplier: 0.0, text: "Missed!" };
    }
}