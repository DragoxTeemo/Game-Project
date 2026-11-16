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
        
        this.curvePowerFactor = this.calculateCurvePower();
        this.baseElement = registryData.elements || Elements.PHYSICAL.name;
        this.elements = this.baseElement;
        this.allowedElements = registryData.allowedElements || []; 

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
            if (initialForm.allowedElements) {
                this.allowedElements = initialForm.allowedElements;
            }
        } else {
            this.hasForms = false;
            this.statAffinities = registryData.statAffinities || {
                strength: 1.0, defense: 1.0, magic: 1.0, ward: 1.0, speed: 1.0
            };
        }

        // Base Stats
        const baseStatBaseline = 3; 
        this.baseStats = {
            strength: baseStatBaseline,
            defense: baseStatBaseline,
            magic: baseStatBaseline,
            ward: baseStatBaseline,
            speed: baseStatBaseline
        };

        this.strength = baseStatBaseline;
        this.defense = baseStatBaseline;
        this.magic = baseStatBaseline;
        this.ward = baseStatBaseline;
        this.speed = baseStatBaseline;

        this.statAccumulators = {
            strength: baseStatBaseline / (this.statAffinities.strength || 1.0),
            defense: baseStatBaseline / (this.statAffinities.defense || 1.0),
            magic: baseStatBaseline / (this.statAffinities.magic || 1.0),
            ward: baseStatBaseline / (this.statAffinities.ward || 1.0),
            speed: baseStatBaseline / (this.statAffinities.speed || 1.0)
        };

        this.maxHp = this.calculateMaxHpForLevel(1);
        this.hp = this.maxHp;

        this.isDefeated = false;
        this.hasBonusAction = false;
        
        // --- STATUS & BUFF TRACKING (3-Round Durations) ---
        this.activeBuffs = []; // Array of { stat, modifier, duration }
        this.extraMovementTiles = 0; // For Strike's speed buff
    }

    /**
     * Replaces hardcoded arrays. Validates element against the active form or registry's allowed list.
     */
    setElement(elementName) {
        if (!this.allowedElements || this.allowedElements.length === 0) {
            console.warn(`${this.codename}'s current form (${this.activeFormKey}) does not support elemental infusion.`);
            return false;
        }

        if (!this.allowedElements.includes(elementName)) {
            console.warn(`${elementName} is not accessible in ${this.activeFormKey} form.`);
            return false;
        }

        this.elements = elementName;
        console.log(`${this.codename} successfully infused active element: ${elementName}`);
        return true;
    }

    transform(formKey) {
        if (!this.hasForms || !this.forms[formKey]) return false;

        let targetForm = this.forms[formKey];
        let newAffinities = targetForm.statWeight;

        this.activeFormKey = formKey;
        this.statAffinities = newAffinities;

        // 1. Update allowed elements pool based on the form configuration
        this.allowedElements = targetForm.allowedElements || [];

        // 2. Base form or element-less forms reset the active element
        if (targetForm.elements === null || this.allowedElements.length === 0) {
            this.elements = null; // Or Elements.PHYSICAL.name if preferred
            console.log(`${this.codename} transformed into ${targetForm.formName || formKey}. Element slot cleared.`);
        } else {
            // Keep current element if it's valid in the new form, otherwise default to the first allowed element
            if (!this.allowedElements.includes(this.elements)) {
                this.elements = this.allowedElements[0];
            }
            console.log(`${this.codename} transformed into ${targetForm.formName || formKey}. Allowed elements updated.`);
        }

        // Stat adjustment logic...
        const changesStatsImmediately = (this.codename === "Star" || this.codename === "Echo");
        if (changesStatsImmediately) {
            this.updateAllStats();
        } else {
            this.statAccumulators.strength = this.strength / (newAffinities.strength || 1.0);
            this.statAccumulators.defense  = this.defense  / (newAffinities.defense || 1.0);
            this.statAccumulators.magic    = this.magic    / (newAffinities.magic || 1.0);
            this.statAccumulators.ward     = this.ward     / (newAffinities.ward || 1.0);
            this.statAccumulators.speed    = this.speed    / (newAffinities.speed || 1.0);
        }

        return true;
    }

    // --- 3-ROUND BUFF / DEBUFF SYSTEM ---

    applyBuff(stat, modifier, duration = 3) {
        this.activeBuffs.push({ stat, modifier, duration });
        console.log(`${this.codename}'s ${stat} boosted by ${modifier} for ${duration} rounds.`);
    }

    tickBuffs() {
        this.activeBuffs.forEach(buff => buff.duration--);
        // Filter out expired buffs
        this.activeBuffs = this.activeBuffs.filter(buff => {
            if (buff.duration <= 0) {
                console.log(`${this.codename}'s buff to ${buff.stat} has worn off.`);
                return false;
            }
            return true;
        });
        if (this.extraMovementTiles > 0) {
            this.extraMovementTiles--;
        }
    }

    // --- CHARACTER SPECIAL SUPPORT ACTIONS ---

    // Ace: Boost Defense (1 ally)
    static supportAce(targetAlly) {
        targetAlly.applyBuff('defense', 0.25, 3);
    }

    // BlazE: Boost Attack (1 ally)
    static supportBlazE(targetAlly) {
        targetAlly.applyBuff('strength', 0.25, 3);
    }

    // Rose: Boost Magic (team) + Random Stat (single target, or team if magic)
    supportRose(partyAllies) {
        // Boost team magic
        partyAllies.forEach(ally => ally.applyBuff('magic', 0.20, 3));

        // Random single target stat buff
        const possibleStats = ['strength', 'speed', 'ward', 'defense', 'magic'];
        const chosenStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];
        
        if (chosenStat === 'magic') {
            partyAllies.forEach(ally => ally.applyBuff(chosenStat, 0.15, 3));
            console.log("Rose's song rolled Magic! Boosted Magic for the entire team.");
        } else {
            const targetAlly = partyAllies[Math.floor(Math.random() * partyAllies.length)];
            targetAlly.applyBuff(chosenStat, 0.30, 3);
            console.log(`Rose's song rolled ${chosenStat}! Boosted ${chosenStat} for ${targetAlly.name}.`);
        }
    }

    // Strike: Boost Speed (1 ally) + Extra Movement Tile
    static supportStrike(targetAlly) {
        targetAlly.applyBuff('speed', 0.30, 3);
        targetAlly.extraMovementTiles += 1;
        console.log(`${targetAlly.name} gains +1 movement tile and increased speed for 3 rounds!`);
    }

    // Star Form-Specific Debuffs/Buffs on target foe or ally
    executeStarFormAction(target) {
        switch (this.activeFormKey) {
            case "DRAGON":
                target.applyBuff('strength', -0.25, 3); // Lowers enemy attack
                break;
            case "PIXIE":
                target.applyBuff('speed', -0.25, 3);    // Lowers enemy speed
                break;
            case "PHOENIX":
                target.applyBuff('magic', -0.25, 3);    // Lowers enemy magic
                break;
            case "PEACOCK":
                target.applyBuff('defense', -0.25, 3);  // Lowers enemy defense
                break;
            case "PRINCESS":
                target.applyBuff('ward', 0.30, 3);      // Grants Ward to ally
                break;
            case "UNICORN":
                target.applyBuff('ward', -0.25, 3);     // Lowers enemy ward
                break;
            default:
                console.log("No special form action available.");
        }
    }

    calculateCurvePower() {
        let coefficientSum = this.a + (this.b / 10) + (this.c / 100);
        return Math.min(1.5, Math.max(0.8, coefficientSum / 3.0));
    }

    getXpRequirementPerLevel(targetLevel) {
        let x = targetLevel;
        return Math.floor(this.a * Math.pow(x, 3) + this.b * Math.pow(x, 2) + this.c * x);
    }

    calculateMaxHpForLevel(targetLevel) {
        let rawCurve = (this.a * Math.pow(targetLevel, 3) + this.b * Math.pow(targetLevel, 2) + this.c * targetLevel);
        let calculatedHp = Math.floor(rawCurve / 2200) + 50; 
        return Math.min(999, Math.max(20, calculatedHp));
    }

    gainXp(amount) {
        if (this.level >= 99) return;
        this.xp += amount;
        while (this.level < 99 && this.xp >= this.getXpRequirementPerLevel(this.level + 1)) {
            this.level++;
            let oldMaxHp = this.maxHp;
            this.calculateStatGrowth(); 
            let hpGain = this.maxHp - oldMaxHp;
            this.hp = Math.min(this.maxHp, this.hp + Math.max(0, hpGain));
        }
        if (this.level >= 99) this.level = 99;
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
        let growthIncrement = baseScaling * this.curvePowerFactor * diminishingFactor; 
        this.statAccumulators[statName] += growthIncrement; 

        let affinity = this.statAffinities[statName] || 1.0;
        let finalStat = Math.floor(this.statAccumulators[statName] * affinity);
        
        // Apply active buffs if any
        const activeBuff = this.activeBuffs.find(b => b.stat === statName);
        if (activeBuff) {
            finalStat = Math.floor(finalStat * (1 + activeBuff.modifier));
        }
        return Math.min(99, Math.max(1, finalStat));
    }

    updateAllStats() {
        this.strength = this.updateSingleStat('strength', 0);
        this.defense  = this.updateSingleStat('defense', 0);
        this.magic    = this.updateSingleStat('magic', 0);
        this.ward     = this.updateSingleStat('ward', 0);
        this.speed    = this.updateSingleStat('speed', 0);
    }
}