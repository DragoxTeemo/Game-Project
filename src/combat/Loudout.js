import { CHARACTER_WEAPONS, createBlazeArsenal } from "./weapons";
import { Spells, StarSpells, EchoSpells } from "./MagicSpells";

export function buildLoadout(arsenal = createBlazeArsenal()) {
    const flattenSpells = spellObj => Object.values(spellObj).flat(); // Helper to extract and flatten spells from an object containing { SINGLE: [...], AOE: [...] }
    const flattenMultiCategory = dictionary => Object.values(dictionary).flatMap(flattenSpells);

    return {
        ECHO: {
            weapons: [CHARACTER_WEAPONS.ECHO],   
            spells: flattenMultiCategory(EchoSpells)
        },
        Ace: {
            weapons: [CHARACTER_WEAPONS.ACE],
            spells: flattenSpells(Spells.ACE)
        },
        BLAZE: { 
            weapons: [arsenal.PISTOL, arsenal.SHOTGUN, arsenal.RIFLE], 
            spells: flattenSpells(Spells.BLAZE) 
        },
        ROSE: { 
            weapons: [CHARACTER_WEAPONS.ROSE],   
            spells: flattenSpells(Spells.ROSE) 
        },
        STRIKE: { 
            weapons: [CHARACTER_WEAPONS.STRIKE], 
            spells: flattenSpells(Spells.STRIKE) 
        },
        STAR: { 
            weapons: [CHARACTER_WEAPONS.STAR],   
            spells: flattenMultiCategory(StarSpells) 
        }
    }
}

    