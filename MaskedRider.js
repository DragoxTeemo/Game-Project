/**
 * All Out Attacks/Finishers: If all threats are unconscious then performing an Finisher (all perform the same function which is defeating all foes in the area)
 * 
 */

/** 
 *Level x = ax^3 + bx^2 + cx floor function btw
 *Cody/Echo: a = 1, b = 14, c = 25
 *Ex: Level 99 = 1(99)^3 + 14(99)^2 + 25(99) =  1,109,988

 *Ethan/Ace: a = 1.2, b = 15, c = 10
 *Rebecca/BlazE: a = .7, b = 12, c = 40
 *Kira/Rose: a = .8, b = 13, c = 30
 *JJ/Strike: a = .65, b = 11, c = 50
 *Alice/Star: a = 1.5, b = 16, c = 10
 */

// entities.js
class MaskedRider {
    constructor(name, codename, coefficients, weights, elements = null, statAffinities = null) {
        this.name = name;
        this.codename = codename;
        this.level = 1;
        this.xp = 0;

        this.a = coefficients.a;
        this.b = coefficients.b;
        this.c = coefficients.c;
        this.weights = weights; // {hp: 0.4, strength: 0.15, ...}
        this.elements = elements;

        this.curvePowerFactor = this.calculateCurvePower(); // Automatically derive growth modifier from the cubic coefficients
        this.statAffinities = statAffinities || {strength: 10, defense: 10, magic: 10, ward: 10, speed: 10}; //If not provided, default to standard weight

        // Visible public stats starting at the universal baseline
        this.strength = 10;
        this.defense = 10;
        this.magic = 10;
        this.ward = 10;
        this.speed = 10;

        // Hidden background accumulator to tract exact decimal growth
        this.statAccumulators = {
            strength: 10.0,
            defense: 10.0,
            magic: 10.0,
            ward: 10.0,
            speed: 10.0
        };

        this.maxHp = 100;
        this.hp = this.maxHp;
        this.isDefeated = false;
        this.hasBonusAction = false;
    }

    move(gridCoordinates) {
        console.log(`${this.codename} traverses the micro-grid based on speed: ${this.speed} towards coordinates (${gridCoordinates.x}, ${gridCoordinates.y})`);
    }

    getXpRequirementPerLevel(targetLevel) {
        let x = targetLevel;
        return Math.floor(this.a * Math.pow(x, 3) + this.b * Math.pow(x, 2) + this.c * x);
    } 

    gainXp(amount) {
        this.xp += amount;
        while (this.xp >= this.getXpRequirementPerLevel(this.level + 1)) {
            this.level++;

            let oldMaxHp = this.maxHp;
            this.calculateStatGrowth(); 
            let hpGain = this.maxHp - oldMaxHp;
            this.hp = Math.min(this.maxHp, this.hp + Math.max(0, hpGain));
            console.log(`${this.codename} leveled up to level ${this.level}`);
        }
    }

    calculateStatGrowth() {
        let baseScaling = 0.55;

        this.strength = this.updateSingleStat('strength', baseScaling);
        this.defense  = this.updateSingleStat('defense', baseScaling);
        this.magic    = this.updateSingleStat('magic', baseScaling);
        this.ward     = this.updateSingleStat('ward', baseScaling);
        this.speed    = this.updateSingleStat('speed', baseScaling);

        let rawCurve = (this.a * Math.pow(this.level, 3) + this.b * Math.pow(this.level, 2) + this.c * this.level);
        let calculateHp = Math.floor(rawCurve / 2200) + 50; 
        this.maxHp = Math.min(999, calculateHp);
    }

    updateSingleStat(statName, baseScaling) {
        let affinity = this.statAffinities[statName] || 1.0;
        let growthIncrement = baseScaling * this.curvePowerFactor * affinity; // Growth increment combines: Base Scaling * Character's Curve Power * Specific Stat Affinity
        this.statAccumulators[statName] += growthIncrement; // Add to background accumulator
        return Math.min(99, Math.floor(this.statAccumulators[statName])); // Return whole integer floor, ensuring stats never drop below baseline 10 and cap at 99
    }
}

/**
const alice = new MaskedRider(
    "Alice", "Rider-A", 
    { a: 1.5, b: 16, c: 10 }, 
    { strength: 0.9, defense: 0.8, magic: 1.4, ward: 1.3, speed: 1.1 }
);

// Rebecca has lower coefficients (a = 0.7, b = 12, c = 40), scaling more steadily.
const rebecca = new MaskedRider(
    "Rebecca", "Rider-R", 
    { a: 0.7, b: 12, c: 40 }, 
    { strength: 1.0, defense: 1.1, magic: 0.8, ward: 0.9, speed: 1.3 }
);

*/
/*
class Antagonist {
    constructor(name, title, level, element, weakness) {
        this.name = name;
        this.title = title;
        this.level = level;
        this.element = element;
        this.weakness = weakness;
        
        // Boss-tier stats scaling aggressively with level
        this.maxHp = 250 + (level * 45);
        this.hp = this.maxHp;
        this.strength = 18 + (level * 4);
        this.defense  = 14 + (level * 3);
        this.magic    = 16 + (level * 3.5);
        this.ward     = 12 + (level * 2.5);
        this.speed    = 10 + (level * 2);

        this.isDefeated = false;
}
*/