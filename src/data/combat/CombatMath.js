/**
 * Calculates physical and magic damage
 * Bridges character stats with attack power and applies a clamped ratio to ensure balanced damage scaling
 */

export const CombatMath = {
    calculatePhysicalDamage(attacker, defender, power, variance = 0.1) {
        let statRatio = (attacker.strength || 1) / Math.max(1, defender.defense || 1);
        let raw = power * Math.min(2.0, Math.max(0.25, statRatio))
        let varianceMulti = 1 + ((Math.random() * variance * 2) - variance);
        return Math.max(1, Math.floor(raw * varianceMulti));   
    },
    calculateMagicDamage(attacker, defender, power, variance = 0.1) {
        let statRatio = (attacker.magic || 1) / Math.max(1, defender.ward || 1);
        let raw = power * Math.min(2.0, Math.max(0.25, statRatio));
        let varianceMulti = 1 + ((Math.random() * variance * 2) - variance);
        return Math.max(1, Math.floor(raw * varianceMulti));
    },
    calculateDamage(attacker, defender, action) {
        // Fallback from action.power to action.basePower
        const power = action.power ?? action.basePower;

        return action.type === "Magic" ? this.calculateMagicDamage(attacker, defender, power) : this.calculatePhysicalDamage(attacker, defender, power);
    }
}