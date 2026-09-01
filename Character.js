class MaskedRider {
    Character(name, codename, coefficients, weights) {
        this.name = name;
        this.codename = codename;

        this.level = 1;
        this.xp = 0;

        this.a = coefficients.a;
        this.b = coefficients.b;
        this.c = coefficients.c;
        this.weights = weights // {hp: 0.4, strength: 0.15, ...}

        this.strength = 10;
        this.defense = 10;
        this.magic = 10;
        this.ward = 10;
        this.speed = 10;

        this.maxHp = 100;
        this.hp = this.maxHp;
        this.isDefeated = false;
    }

    /**
     * The goal here is to set the speed speed based on the stats
     */

    move(gridCoordinates) {
        console.log(`${this.codename} moves accross the grid based on speed: ${this.speed}`)
    }

    getXpRequirementPerLevel(targetLevel) {
        let x = targetLevel;
        let totalXp = (this.a * Math.pow(x, 3) + (this.b * Math.pow(x,2) + (this.c * x)))
        return Math.floor(totalXp)
    } 

    gainXp(amount) {
        this.xp += amount;
        // Check if XP threshold for next level is met
        while (this.xp >= this.getXpRequirementPerLevel(this.level + 1)) {
            this.level++;
            let oldMaxHp = this.maxHp;
            this.calculateStatGrowth(); // recalculates stats and sets new maxHp
            let hpGain = this.maxHp - oldMaxHp;
            this.hp = Math.min(this.maxHp, this.hp + Math.max(0, hpGain));

            console.log(`${this.codename} leveled up to level ${this.level}`);
        }
    }

    calculateStatGrowth() {
        // Regular 1-99 Stat Pool for Attributes (Strength, Defense, Magic, Ward, Speed)
        let statPool = Math.min(99, Math.floor((this.a * Math.pow(this.level, 3) + this.b * Math.pow(this.level, 2) + this.c * this.level) / 1000) + 10);
        this.strength = Math.min(99, Math.max(1, Math.floor(statPool * this.weights.strength)));
        this.defense = Math.min(99, Math.max(1, Math.floor(statPool * this.weights.strength)));
        this.magic = Math.min(99, Math.max(1, Math.floor(statPool * this.weights.strength)));
        this.ward = Math.min(99, Math.max(1, Math.floor(statPool * this.weights.strength)));
        this.speed = Math.min(99, Math.max(1, Math.floor(statPool * this.weights.strength)));

        // HP Scaling using the same cubic curve; dividing by 2200 yields a more balanced amount of hp for all characters
        let rawHpCurve = (this.a * Math.pow(this.level, 3) + this.b * Math.pow(this.level, 2) + this.c * this.level);
        let calculateHp = Math.floor(rawHpCurve/2200) + 50; 

        //HP cap is 999
        this.maxHp = Math.min(999, calculateHp);
    }
}

class Virus {
    Enemy(title, weight) {
        
    }
}

class Antagonist {
    Villain() {
        
    }
}