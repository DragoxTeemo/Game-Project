import {Elements, ElementCycles } from "./elements";

//Placeholder names
export const FoeArchetypes = {
    BOKOBOLIN: "Bokobolin",
    MOBLIN:    "Moblin",
    LIZALFOS:  "Lizalfos"
};

export const FoeTiers = {
    RED:    "Red",
    BLUE:   "Blue",
    BLACK:  "Black",
    SILVER: "Silver"
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
        const archetypes = {
            [FoeArchetypes.BOKOBOLIN]: { hp: 1.0, str: 1.0, def: 1.0, mag: 1.0, wrd: 1.0, spd: 1.0 },
            [FoeArchetypes.MOBLIN]:    { hp: 1.8, str: 1.4, def: 1.3, mag: 0.8, wrd: 1.4, spd: 0.6 },
            [FoeArchetypes.LIZALFOS]:  { hp: 1.1, str: 1.1, def: 0.9, mag: 1.4, wrd: 0.9, spd: 1.5 },
        };

        const tierMultipliers = {
            [FoeTiers.RED]: 1.0,
            [FoeTiers.BLUE]: 1.35,
            [FoeTiers.BLACK]: 1.80,
            [FoeTiers.SILVER]: 2.50
        };

        let mod = archetypes[this.archetype] || archetypes[FoeArchetypes.BOKOBOLIN];
        let tierMult = tierMultipliers[this.tier] || 1.0;

        this.maxHP = Math.floor((40 + (this.level * 15)) * mod.hp * tierMult);
        this.hp = this.maxHP;
        this.strength = Math.floor((5 + (this.level * 1.8)) * mod.str * tierMult);
        this.defense  = Math.floor((3 + (this.level * 1.4)) * mod.def * tierMult);
        this.magic    = Math.floor((4 + (this.level * 1.5)) * mod.str * tierMult);
        this.ward     = Math.floor((3 + (this.level * 1.2)) * mod.def * tierMult);
        this.speed    = Math.floor((6 + (this.level * 1.6)) * mod.spd * tierMult);

        this.isDefeated = false;
    }

    applyElementalProfile() {
    const profiles = {
        [FoeArchetypes.BOKOBOLIN]: {
            [FoeTiers.RED]:     {weak: [Elements.FIRE.name, Elements.LIGHTNING.name], resist: [], immune: []}, 
            [FoeTiers.BLUE]:    {weak: [Elements.ICE.name], resist: [Elements.FIRE.name], immune: []},
            [FoeTiers.BLACK]:   {weak: [Elements.WIND.name], resist: [Elements.LIGHT.name], immune: [Elements.SHADOW.name]},
            [FoeTiers.SILVER]:  {weak: [Elements.LIGHT.name], resist: [], immune: [Elements.SHADOW.name, Elements.FIRE.name]}
        },
        [FoeArchetypes.MOBLIN]: {
            [FoeTiers.RED]:     {weak: [Elements.ICE.name, Elements.WIND.name], resist: [], immune: []},
            [FoeTiers.BLUE]:    {weak: [Elements.WIND.name], resist: [Elements.ICE.name], immune: []},
            [FoeTiers.BLACK]:   {weak: [Elements.LIGHTNING.name], resist: [Elements.SHADOW.name], immune: [Elements.ICE.name]},
            [FoeTiers.SILVER]:  {weak: [Elements.FIRE.name], resist: [Elements.WIND.name], immune: [Elements.ICE.name, Elements.LIGHTNING.name]}
        },
        [FoeArchetypes.LIZALFOS]: {
            [FoeTiers.RED]:     {weak: [Elements.LIGHTNING.name, Elements.WIND.name], resist: [], immune: []},
            [FoeTiers.BLUE]:    {weak: [Elements.FIRE.name], resist: [Elements.LIGHTNING.name], immune: []},
            [FoeTiers.BLACK]:   {weak: [Elements.ICE.name], resist: [Elements.FIRE.name], immune: [Elements.WIND.name]},
            [FoeTiers.SILVER]:  {weak: [Elements.SHADOW.name], resist: [], immune: [Elements.LIGHTNING.name, Elements.FIRE.name]}
        }
    };

    let archetypeProfile = profiles[this.archetype] || profiles[FoeArchetypes.BOKOBOLIN];
    let tierProfile = archetypeProfile[this.tier] || {weak: [], resist: [], immune: []};

    this.weaknesses = tierProfile.weak;
    this.resistances = tierProfile.resist;
    this.immunities = tierProfile.immune;
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