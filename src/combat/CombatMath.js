export const CombatMath = {
    calculatePhysicalDamage(attacker, defender, power, variance = 0.1) {
        const ratio = (attacker.strength || 1) / Math.max(1, defender.defense || 1);
        const raw = power * Math.min(2.0, Math.max(0.25, ratio));
        return Math.max(1, Math.floor(raw * (1 + (Math.random() * variance * 2 - variance))));
    },
    calculateMagicDamage(attacker, defender, power, variance = 0.1) {
        const ratio = (attacker.magic || 1) / Math.max(1, defender.ward || 1);
        const raw = power * Math.min(2.0, Math.max(0.25, ratio));
        return Math.max(1, Math.floor(raw * (1 + (Math.random() * variance * 2 - variance))));
    },
    calculateDamage(attacker, defender, action) {
        const power = action.power ?? action.basePower ?? 0;
        return action.type === "Magic"
            ? this.calculateMagicDamage(attacker, defender, power)
            : this.calculatePhysicalDamage(attacker, defender, power);
    },
    // Weakness / resist / immunity multiplier. Riders have no profile, so they return 1.
    elementMultiplier(target, element) {
        return target.evaluateElementalEffect?.(element)?.multiplier ?? 1;
    },
    // Single place HP is reduced: clamps at 0 and flags defeat.
    applyDamage(target, amount) {
        target.hp = Math.max(0, target.hp - amount);
        if (target.hp === 0) target.isDefeated = true;
        return amount;
    }
};
