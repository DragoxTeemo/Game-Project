import {Elements} from "./elements";

//Placeholder names
export const FoeArchetypes = {
    BOKOBOLIN: "Bokobolin", // Basic threat
    MOBLIN:    "Moblin",    // Juggernaut threat
    LIZALFOS:  "Lizalfos"   // Range focus threat
};

// Using BOTW Color system as a simple way to show strength, a potential idea is less of the main color and focus
// on secondary colors to emphasize danger level
export const FoeTiers = {
    RED:    "Red",
    BLUE:   "Blue",
    BLACK:  "Black",
    SILVER: "Silver"
};

export const MasterFoeRegistry = {
    [FoeArchetypes.BOKOBOLIN]: {
        baseStats: { hp: 1.0, str: 1.0, def: 1.0, mag: 1.0, wrd: 1.0, spd: 1.0 },
        tiers: {
            [FoeTiers.RED]:    { cost: 1, minLevel: 1,  xpMin: 45,   xpMax: 140,  tierMult: 1.0, profile: {weak: [Elements.FIRE.name, Elements.LIGHTNING.name], resist: [], immune: []} },
            [FoeTiers.BLUE]:   { cost: 3, minLevel: 5,  xpMin: 180,  xpMax: 380,  tierMult: 1.25, profile: {weak: [Elements.ICE.name], resist: [Elements.FIRE.name], immune: []} },
            [FoeTiers.BLACK]:  { cost: 5, minLevel: 22, xpMin: 450,  xpMax: 850,  tierMult: 1.50, profile: {weak: [Elements.WIND.name], resist: [Elements.LIGHT.name], immune: [Elements.SHADOW.name]} },
            [FoeTiers.SILVER]: { cost: 7, minLevel: 42, xpMin: 1200, xpMax: 2500, tierMult: 2.00, profile: {weak: [Elements.LIGHT.name], resist: [], immune: [Elements.SHADOW.name, Elements.FIRE.name]} }
        }
    },
    [FoeArchetypes.LIZALFOS]: {
        baseStats: { hp: 1.1, str: 1.1, def: 0.8, mag: 1.2, wrd: 0.8, spd: 1.3 },
        tiers: {
            [FoeTiers.RED]:    { cost: 2, minLevel: 2,  xpMin: 75,   xpMax: 160,  tierMult: 1.0, profile: {weak: [Elements.LIGHTNING.name, Elements.WIND.name], resist: [], immune: []} },
            [FoeTiers.BLUE]:   { cost: 4, minLevel: 9,  xpMin: 240,  xpMax: 450,  tierMult: 1.25, profile: {weak: [Elements.FIRE.name], resist: [Elements.LIGHTNING.name], immune: []} },
            [FoeTiers.BLACK]:  { cost: 6, minLevel: 28, xpMin: 580,  xpMax: 980,  tierMult: 1.50, profile: {weak: [Elements.ICE.name], resist: [Elements.FIRE.name], immune: [Elements.WIND.name]} },
            [FoeTiers.SILVER]: { cost: 8, minLevel: 46, xpMin: 1500, xpMax: 3000, tierMult: 2.00, profile: {weak: [Elements.SHADOW.name], resist: [], immune: [Elements.LIGHTNING.name, Elements.FIRE.name]} }
        }
    },
    [FoeArchetypes.MOBLIN]: {
        baseStats: { hp: 1.2, str: 1.3, def: 1.1, mag: 0.8, wrd: 1.1, spd: 0.6 },
        tiers: {
            [FoeTiers.RED]:    { cost: 3, minLevel: 4,  xpMin: 110,  xpMax: 210,  tierMult: 1.0, profile: {weak: [Elements.ICE.name, Elements.WIND.name], resist: [], immune: []} },
            [FoeTiers.BLUE]:   { cost: 6, minLevel: 15, xpMin: 320,  xpMax: 600,  tierMult: 1.25, profile: {weak: [Elements.WIND.name], resist: [Elements.ICE.name], immune: []} },
            [FoeTiers.BLACK]:  { cost: 9, minLevel: 34, xpMin: 720,  xpMax: 1200, tierMult: 1.50, profile: {weak: [Elements.LIGHTNING.name], resist: [Elements.SHADOW.name], immune: [Elements.ICE.name]} },
            [FoeTiers.SILVER]: { cost: 12, minLevel: 52, xpMin: 2000, xpMax: 4000, tierMult: 2.00, profile: {weak: [Elements.FIRE.name], resist: [Elements.WIND.name], immune: [Elements.ICE.name, Elements.LIGHTNING.name]} }
        }
    }
};

export class Virus {
    constructor(title, archetype, tier, groupLevel) {
        this.title = title;
        this.archetype = archetype; // Uses FoeArchetypes
        this.tier = tier;           // Uses FoeTiers
        this.level = this.calculateScaledLevel(groupLevel, tier);

        this.isImmuneToMud = (this.archetype === FoeArchetypes.LIZALFOS);

        this.applyArchetypeScaling();
        this.applyElementalProfile();
        this.xpReward = this.calculateStaticXpReward();
    }

    calculateScaledLevel(groupLevel, tier) {
        let tierBonus = { 
            [FoeTiers.RED]: 0, 
            [FoeTiers.BLUE]: Math.floor(groupLevel * 0.2), 
            [FoeTiers.BLACK]: Math.floor(groupLevel * 0.3),
            [FoeTiers.SILVER]: Math.floor(groupLevel * 0.5)
        }[tier] || 0;
        return Math.min(99, Math.max(1, groupLevel + tierBonus));
    }

    applyArchetypeScaling() {
        const entry = MasterFoeRegistry[this.archetype] || MasterFoeRegistry[FoeArchetypes.BOKOBOLIN];
        const tierData = entry.tiers[this.tier] || entry.tiers[FoeTiers.RED];
        let mod = entry.baseStats;
        let tierMult = tierData.tierMult;

        this.maxHP = Math.floor((30 + (this.level * 5.5)) * mod.hp * tierMult);
        this.hp = this.maxHP;

        this.strength = Math.floor((4 + (this.level * 0.55)) * mod.str * tierMult);
        this.defense  = Math.floor((4 + (this.level * 0.50)) * mod.def * tierMult);
        this.magic    = Math.floor((4 + (this.level * 0.50)) * mod.mag * tierMult);
        this.ward     = Math.floor((4 + (this.level * 0.45)) * mod.wrd * tierMult);
        this.speed    = Math.floor((5 + (this.level * 0.60)) * mod.spd * tierMult);

        this.isDefeated = false;
    }
    calculateStaticXpReward() {
        const entry = MasterFoeRegistry[this.archetype] || MasterFoeRegistry[FoeArchetypes.BOKOBOLIN]; //Fall back
        const tierData = entry.tiers[this.tier] || entry.tiers[FoeTiers.RED];

        const archetypeMultipliers = {
            [FoeArchetypes.BOKOBOLIN]: 1.0,
            [FoeArchetypes.LIZALFOS]:  1.2,
            [FoeArchetypes.MOBLIN]:    1.5
        };

        let multiplier = archetypeMultipliers[this.archetype] || 1.0;
        let randomBase = Math.floor(Math.random() * (tierData.xpMax - tierData.xpMin + 1)) + tierData.xpMin;
        return Math.floor(randomBase * multiplier);
    }

    applyElementalProfile() {
        const entry = MasterFoeRegistry[this.archetype] || MasterFoeRegistry[FoeArchetypes.BOKOBOLIN];
        const tierData = entry.tiers[this.tier] || entry.tiers[FoeTiers.RED];

        this.weaknesses = tierData.profile.weak;
        this.resistances = tierData.profile.resist;
        this.immunities = tierData.profile.immune;
    }

    evaluateElementalEffect(incomingElement) {
        if (this.immunities.includes(incomingElement)) {
            return {type: "IMMUNE", multiplier: 0.0, message: "Blocked"};
        }
        if (this.resistances.includes(incomingElement)) {
            return {type: "RESIST", multiplier: 0.5, message: "Resisted" };
        }
        if (this.weaknesses.includes(incomingElement)) {
            return {type: "WEAK", multiplier: 1.5, message: "Weak"};
        }
        return {type: "NORMAL", multiplier: 1.0, message: ""};
    }
}