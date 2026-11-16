import { CHARACTER_WEAPONS, createFirearm, createBlazeArsenal } from "./weapons.js";
import { Spells, StarSpells, EchoSpells } from "./MagicSpells.js";

export function buildLoadout(arsenal = createBlazeArsenal()) {
    const flattenSpells = spellObj => Object.values(spellObj).flat();
    const flattenMultiCategory = dictionary => Object.values(dictionary).flatMap(flattenSpells);

    return {
        ECHO: {
            weapons: [
                CHARACTER_WEAPONS.ECHO_HAMMER,
                CHARACTER_WEAPONS.ECHO_BLADE,
                CHARACTER_WEAPONS.ECHO_FLOW,
                CHARACTER_WEAPONS.ECHO_SPEED,
                createFirearm("ECHO_PISTOL") // Echo Range Form weapon
            ],   
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
            weapons: [
                CHARACTER_WEAPONS.STAR_DRAGON,
                CHARACTER_WEAPONS.STAR_UNICORN,
                CHARACTER_WEAPONS.STAR_PEACOCK,
                CHARACTER_WEAPONS.STAR_PRINCESS,
                createFirearm("STAR_PIXIE_GUN") // Star Pixie Form weapon
                // Star Phoenix has no physical weapon, only Phoenix Spells
            ],   
            spells: flattenMultiCategory(StarSpells) 
        }
    };
}