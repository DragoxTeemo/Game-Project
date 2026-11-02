/**
 * All Out Attacks/Finishers: If all threats are unconscious then performing an Finisher (all perform the same function which is defeating all foes in the area)
 * 
 */

/** 
 *Level x = ax^3 + bx^2 + cx floor function btw
 *Cody/Echo: a = 1, b = 14, c = 25
 *Ex: Level 99 = 1(99)^3 + 14(99)^2 + 25(99) =  1,109,988

 *Echo: a = 1.3, b = 12, c = 20
 *Ethan/Ace: a = 1.2, b = 15, c = 10
 *Rebecca/BlazE: a = .7, b = 12, c = 40
 *Kira/Rose: a = .8, b = 13, c = 30
 *JJ/Strike: a = .65, b = 11, c = 50
 *Alice/Star: a = 1.5, b = 16, c = 10
 */
import { Elements } from "./elements.js";

export class MaskedRider {
    constructor(id, registryData) {
        this.id = id;
        this.name = registryData.name;
        this.codename = registryData.codename;
        this.level = 1;
        this.xp = 0;

        this.coefficients = {
            a: registryData.coefficients?.a ?? 1,
            b: registryData.coefficients?.b ?? 1,
            c: registryData.coefficients?.c ?? 1
        };
        this.a = this.coefficients.a;
        this.b = this.coefficients.b;
        this.c = this.coefficients.c;
        
        this.curvePowerFactor = this.calculateCurvePower(); // Automatically derive growth modifier from the cubic coefficients
        this.baseElement = registryData.elements || Elements.PHYSICAL.name;
        this.elements = this.baseElement;
        this.allowedElements = registryData.allowedElements || null; // Store allowed list

        if (registryData.forms) {
            this.hasForms = true;
            this.forms = registryData.forms;
            let defaultFormKey = Object.keys(this.forms)[0];
            this.activeFormKey = defaultFormKey;

            let initialForm = this.forms[defaultFormKey];
            this.statAffinities = initialForm.statWeight;
            if (initialForm.elements) {
                this.elements = initialForm.elements;
            }
        } else {
            this.hasForms = false;
            this.statAffinities = registryData.statAffinities || registryData.statweight || {
                strength: 1.0, 
                defense: 1.0, 
                magic: 1.0, 
                ward: 1.0, 
                speed: 1.0
            };
        }

        // Visible public stats starting at the universal baseline
        const baseStatBaseline = 3; 
        this.strength = baseStatBaseline;
        this.defense = baseStatBaseline;
        this.magic = baseStatBaseline;
        this.ward = baseStatBaseline;
        this.speed = baseStatBaseline;

        // Hidden background accumulator to tract exact decimal growth
        this.statAccumulators = {
            strength: baseStatBaseline / (this.statAffinities.strength || 1.0),
            defense: baseStatBaseline / (this.statAffinities.defense || 1.0),
            magic: baseStatBaseline / (this.statAffinities.magic || 1.0),
            ward: baseStatBaseline / (this.statAffinities.ward || 1.0),
            speed: baseStatBaseline / (this.statAffinities.speed || 1.0)
        };

        // Use unified HP formula starting at level 1
        this.maxHp = this.calculateMaxHpForLevel(1);
        this.hp = this.maxHp;

        this.isDefeated = false;
        this.hasBonusAction = false;
    }

    infuseEchoElement(elementName) {
        if (this.codename !== "Echo") {
            console.warn(`${this.codename} does not support secondary element infusion.`);
            return false;
        }

        const allowedEchoElements = [
            Elements.FIRE.name,
            Elements.ICE.name,
            Elements.WIND.name,
            Elements.LIGHTNING.name
        ];
        if (!allowedEchoElements.includes(elementName)) {
            console.warn(`Cody cannot use ${elementName}. Restricted to Fire, Ice, Wind, and Lightning.`);
            return false;
        }
        this.elements = elementName;
        console.log(`Cody infused his auxiliary form with element: ${elementName}`);
        return true;
    }

    transform(formKey) {
        if (!this.hasForms || !this.forms[formKey]) return false;

        let targetForm = this.forms[formKey];
        let newAffinities = targetForm.statWeight;

        this.activeFormKey = formKey;
        this.statAffinities = newAffinities;
        if (targetForm.elements) {
            this.elements = targetForm.elements;
        }

        // Star and Echo forms change stats immediately. Other form swaps keep current stats 
        // and only update statAffinities for future growth.

        const changesStatsImmediately = (this.codename === "Star" || this.codename === "Echo");
        if (changesStatsImmediately) {
            this.updateAllStats();
            console.log(`${this.codename} shifted configuration into ${targetForm.formName || formKey} (Stats updated immediately)`);
        } else {
            // Adjust levelPool so that levelPool * newAffinity = currentStat (keeping current stats unchanged)
            this.statAccumulators.strength = this.strength / (newAffinities.strength || 1.0);
            this.statAccumulators.defense  = this.defense  / (newAffinities.defense || 1.0);
            this.statAccumulators.magic    = this.magic    / (newAffinities.magic || 1.0);
            this.statAccumulators.ward     = this.ward     / (newAffinities.ward || 1.0);
            this.statAccumulators.speed    = this.speed    / (newAffinities.speed || 1.0);

            console.log(`${this.codename} shifted configuration into ${targetForm.formName || formKey} (Stats unchanged, affinities updated for future growth)`);
        }

        return true;
    }

    move(gridCoordinates) {
        console.log(`${this.codename} traverses the micro-grid based on speed: ${this.speed} towards coordinates (${gridCoordinates.x}, ${gridCoordinates.y})`);
    }

    calculateCurvePower() {
        let coefficientSum = this.a + (this.b / 10) + (this.c / 100);
        return Math.min(1.5, Math.max(0.8, coefficientSum / 3.0));
    }

    getXpRequirementPerLevel(targetLevel) {
        let x = targetLevel;
        return Math.floor(this.a * Math.pow(x, 3) + this.b * Math.pow(x, 2) + this.c * x);
    }

    /**
     * Unified HP calculation based on growth curve to prevent sudden level 1 to level 2 leaps
     */
    calculateMaxHpForLevel(targetLevel) {
        let rawCurve = (this.a * Math.pow(targetLevel, 3) + this.b * Math.pow(targetLevel, 2) + this.c * targetLevel);
        let calculatedHp = Math.floor(rawCurve / 2200) + 50; 
        return Math.min(999, Math.max(20, calculatedHp));
    }

    gainXp(amount) {
        if (this.level >= 99) return; // Prevent gaining XP once max level is reached

        this.xp += amount;
        while (this.level < 99 && this.xp >= this.getXpRequirementPerLevel(this.level + 1)) {
            this.level++;

            let oldMaxHp = this.maxHp;
            this.calculateStatGrowth(); 
            let hpGain = this.maxHp - oldMaxHp;
            this.hp = Math.min(this.maxHp, this.hp + Math.max(0, hpGain));
            console.log(`${this.codename} leveled up to level ${this.level}`);
        }

        if (this.level >= 99) {
            this.level = 99;
        }
    }

    calculateStatGrowth() {
        let baseScaling = 0.45;

        this.strength = this.updateSingleStat('strength', baseScaling);
        this.defense  = this.updateSingleStat('defense', baseScaling);
        this.magic    = this.updateSingleStat('magic', baseScaling);
        this.ward     = this.updateSingleStat('ward', baseScaling);
        this.speed    = this.updateSingleStat('speed', baseScaling);

        this.maxHp = this.calculateMaxHpForLevel(this.level);
    }

    updateSingleStat(statName, baseScaling) {
        let levelProgressRatio = this.level / 99; 
        let diminishingFactor = 1.0 - (levelProgressRatio * 0.6); 

        // Accumulate growth in the level pool WITHOUT affinity baked in
        let growthIncrement = baseScaling * this.curvePowerFactor * diminishingFactor; 
        this.statAccumulators[statName] += growthIncrement; 

        // Derive current stat as levelPool × affinity
        let affinity = this.statAffinities[statName] || 1.0;
        return Math.min(99, Math.floor(this.statAccumulators[statName] * affinity)); 
    }

    updateAllStats() {
        this.strength = Math.min(99, Math.floor(this.statAccumulators.strength * (this.statAffinities.strength || 1.0)));
        this.defense  = Math.min(99, Math.floor(this.statAccumulators.defense * (this.statAffinities.defense || 1.0)));
        this.magic    = Math.min(99, Math.floor(this.statAccumulators.magic * (this.statAffinities.magic || 1.0)));
        this.ward     = Math.min(99, Math.floor(this.statAccumulators.ward * (this.statAffinities.ward || 1.0)));
        this.speed    = Math.min(99, Math.floor(this.statAccumulators.speed * (this.statAffinities.speed || 1.0)));
    }
}

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
