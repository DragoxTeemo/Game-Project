/**
 * Heroes and villains each have one shared pool.
 * Each round will increase the current mana whether it is used or not:
 * Round 1 = 20
 * Round 2 = 40
 * ...
 * Round 5 = 100;
 * Round n = 100;
 * 
 * If MANA is consumed during any round, leftover mana will not increase
 */

export class SharedManaPool {
    constructor(incrementPerRound = 20, cap = 100) {
        this.current = 0;
        this.cap = cap;
        this.incrementPerRound = incrementPerRound;
    }

    advanceRound() {
        this.current = Math.min(this.cap, this.current + this.incrementPerRound);
        return this.current;
    }

    canAfford(amount) {
        return this.amount >= amount;
    }

    spend(amount) {
        if (!this.canAfford(amount)) return false;
        this.current -= amount;
        return true;
    }

    reset() {
        this.current = 0;
    }
}