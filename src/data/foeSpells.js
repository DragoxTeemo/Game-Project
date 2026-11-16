import { Elements } from "./elements.js";
import { Spells, StarSpells, EchoSpells } from "../combat/MagicSpells.js"; // Import main spell registries

/**
 * Foe Basic Attacks (Unlimited physical strikes keyed by archetype)
 */
export const FoeBasicAttacks = {
    VIRIONS: { 
        name: "Claw", 
        type: "Physical", 
        element: Elements.PHYSICAL.name, 
        basePower: 20, 
        scope: "SINGLE", 
        range: 1, 
        accuracy: 90, 
        magicCost: 0 
    },
    CYTOPATHS: { 
        name: "Slam", 
        type: "Physical", 
        element: Elements.PHYSICAL.name, 
        basePower: 30, 
        scope: "SINGLE", 
        range: 1, 
        accuracy: 90, 
        magicCost: 0 
    },
    AIRBORNES: { 
        name: "Spit", 
        type: "Physical", 
        element: Elements.PHYSICAL.name, 
        basePower: 18, 
        scope: "SINGLE", 
        range: 6, 
        accuracy: 90, 
        magicCost: 0 
    }
};

/**
 * Tiered Foe Spells reusing shared spell definitions from the main registries.
 * Mapped dynamically by Foe Archetype and Threat Tier (Red, Blue, Black, Silver).
 */
export const FoeTieredAbilities = {
    VIRIONS: {
        Red: [
            Spells.BLAZE.SINGLE[0] // "Rom" (Lightning Single)
        ],
        Blue: [
            EchoSpells.ECHO_ICE.SINGLE[0], // "Da" (Ice Single)
            EchoSpells.ECHO_ICE.AOE[0]     // "Nada" (Ice AOE)
        ],
        Black: [
            StarSpells.PEACOCK.AOE[0],     // "Natoi" (Shadow AOE)
            Spells.STRIKE.SINGLE[0]        // "Zo" (Wind Single)
        ],
        Silver: [
            Spells.ROSE.AOE[0],            // "Nalua" (Fire AOE)
            StarSpells.PEACOCK.SINGLE[0]   // "Toi" (Shadow Single)
        ]
    },
    AIRBORNES: {
        Red: [
            Spells.BLAZE.SINGLE[0]         // "Rom" (Lightning Single)
        ],
        Blue: [
            Spells.BLAZE.SINGLE[0],        // "Rom" (Lightning Single)
            Spells.BLAZE.AOE[0]            // "Narom" (Lightning AOE)
        ],
        Black: [
            Spells.STRIKE.SINGLE[0],       // "Zo" (Wind Single)
            Spells.STRIKE.AOE[0]           // "Nazo" (Wind AOE)
        ],
        Silver: [
            Spells.BLAZE.AOE[0],           // "Narom" (Lightning AOE)
            StarSpells.UNICORN.SINGLE[0]   // "Sang" (Light Single)
        ]
    },
    CYTOPATHS: {
        Red: [
            Spells.ROSE.SINGLE[0]          // "Lua" (Fire Single)
        ],
        Blue: [
            EchoSpells.ECHO_ICE.SINGLE[0], // "Da" (Ice Single)
            EchoSpells.ECHO_ICE.AOE[0]     // "Nada" (Ice AOE)
        ],
        Black: [
            StarSpells.PEACOCK.SINGLE[0],  // "Toi" (Shadow Single)
            Spells.STRIKE.AOE[0]           // "Nazo" (Wind AOE)
        ],
        Silver: [
            Spells.ROSE.AOE[0],            // "Nalua" (Fire AOE)
            EchoSpells.ECHO_ICE.SINGLE[0]  // "Da" (Ice Single)
        ]
    }
};

/**
 * Retrieves all available actions (basic physical strikes + unlocked tiered elemental spells) 
 * for a specific enemy instance based on its archetype and rarity tier.
 * 
 * @param {string} archetype - e.g., FoeArchetypes.VIRION ("Virions")
 * @param {string} tier - e.g., FoeTiers.RED ("Red"), FoeTiers.SILVER ("Silver")
 * @returns {Array} List of usable action and magic objects for AI evaluation
 */
export function getFoeActions(archetype, tier) {
    const basicAttack = FoeBasicAttacks[archetype] ?? FoeBasicAttacks.VIRIONS;
    const tierSpells = FoeTieredAbilities[archetype]?.[tier] || [];
    
    return [basicAttack, ...tierSpells];
}