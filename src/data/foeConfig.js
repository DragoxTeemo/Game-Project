import {Elements} from "./elements";

//Placeholder names
export const FoeArchetypes = {
    VIRION: "Virions", // Basic threat
    CYTOPATH: "Cytopaths",    // Juggernaut threat
    AIRBORNE: "Airbornes"   // Range focus threat
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
    [FoeArchetypes.VIRION]: {
        baseStats: { hp: 1.0, str: 1.0, def: 1.0, mag: 1.0, wrd: 1.0, spd: 1.0 },
        tiers: {
            [FoeTiers.RED]:    { cost: 1, minLevel: 1,  xpMin: 45,   xpMax: 140,  tierMult: 1.0, profile: {weak: [Elements.FIRE.name, Elements.LIGHTNING.name], resist: [], immune: []} },
            [FoeTiers.BLUE]:   { cost: 3, minLevel: 5,  xpMin: 180,  xpMax: 380,  tierMult: 1.25, profile: {weak: [Elements.ICE.name], resist: [Elements.FIRE.name], immune: []} },
            [FoeTiers.BLACK]:  { cost: 5, minLevel: 22, xpMin: 450,  xpMax: 850,  tierMult: 1.50, profile: {weak: [Elements.WIND.name], resist: [Elements.LIGHT.name], immune: [Elements.SHADOW.name]} },
            [FoeTiers.SILVER]: { cost: 7, minLevel: 42, xpMin: 1200, xpMax: 2500, tierMult: 2.00, profile: {weak: [Elements.LIGHT.name], resist: [], immune: [Elements.SHADOW.name, Elements.FIRE.name]} }
        }
    },
    [FoeArchetypes.AIRBORNE]: {
        baseStats: { hp: 1.1, str: 1.1, def: 0.8, mag: 1.2, wrd: 0.8, spd: 1.3 },
        tiers: {
            [FoeTiers.RED]:    { cost: 2, minLevel: 2,  xpMin: 75,   xpMax: 160,  tierMult: 1.0, profile: {weak: [Elements.LIGHTNING.name, Elements.WIND.name], resist: [], immune: []} },
            [FoeTiers.BLUE]:   { cost: 4, minLevel: 9,  xpMin: 240,  xpMax: 450,  tierMult: 1.25, profile: {weak: [Elements.FIRE.name], resist: [Elements.LIGHTNING.name], immune: []} },
            [FoeTiers.BLACK]:  { cost: 6, minLevel: 28, xpMin: 580,  xpMax: 980,  tierMult: 1.50, profile: {weak: [Elements.ICE.name], resist: [Elements.FIRE.name], immune: [Elements.WIND.name]} },
            [FoeTiers.SILVER]: { cost: 8, minLevel: 46, xpMin: 1500, xpMax: 3000, tierMult: 2.00, profile: {weak: [Elements.SHADOW.name], resist: [], immune: [Elements.LIGHTNING.name, Elements.FIRE.name]} }
        }
    },
    [FoeArchetypes.CYTOPATH]: {
        baseStats: { hp: 1.2, str: 1.3, def: 1.1, mag: 0.8, wrd: 1.1, spd: 0.6 },
        tiers: {
            [FoeTiers.RED]:    { cost: 3, minLevel: 4,  xpMin: 110,  xpMax: 210,  tierMult: 1.0, profile: {weak: [Elements.ICE.name, Elements.WIND.name], resist: [], immune: []} },
            [FoeTiers.BLUE]:   { cost: 6, minLevel: 15, xpMin: 320,  xpMax: 600,  tierMult: 1.25, profile: {weak: [Elements.WIND.name], resist: [Elements.ICE.name], immune: []} },
            [FoeTiers.BLACK]:  { cost: 9, minLevel: 34, xpMin: 720,  xpMax: 1200, tierMult: 1.50, profile: {weak: [Elements.LIGHTNING.name], resist: [Elements.SHADOW.name], immune: [Elements.ICE.name]} },
            [FoeTiers.SILVER]: { cost: 12, minLevel: 52, xpMin: 2000, xpMax: 4000, tierMult: 2.00, profile: {weak: [Elements.FIRE.name], resist: [Elements.WIND.name], immune: [Elements.ICE.name, Elements.LIGHTNING.name]} }
        }
    }
};

