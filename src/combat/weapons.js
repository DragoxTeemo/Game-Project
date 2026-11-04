//equipment data template
export const WeaponType = {
    MELEE_SWORD: "Greatsword",  // Ace and Echo Blade (Cone AOE)
    RANGED_GUN: "FIREARM",      // BlazE and Echo Range. Must equal "FIREARM": GameDirector routes on it
    WHIP: "Whip",               // Rose and Echo Flow (Cone AOE)
    GAUNTLET: "Gauntlet",       // Strike and Echo Speed
    HAMMER: "Hammer",           // Echo's base weapon
    DRAGON_CLAW: "Dragon Claws" // Star's Dragon Form
};

export class CharacterWeapon {
    constructor(name, type, basePower, range, scope, minigameType) {
        this.name = name;
        this.type = type;
        this.basePower = basePower;
        this.range = range;               // tiles
        this.scope = scope;               // SINGLE or AOE_CONE
        this.minigameType = minigameType; // SLIDER, RNG, TIMING or SPAM (must match weaponExecutionEngine's switch)
    }
}

// Rifle and Shotgun Requires ammo: 
// For Rifles, can craft 8-10 bullets (perhaps a dnd-like chance mechanic, deciding between a default +x (increments per level percentage every 10 levels For Rebecca) 
// and a dice roll (d6 by default, increments as Alice levels up every 20 levels) 
// (10 scrap for rifle ammo? depends on how often scraps will drop we'll say characters drop xp and a chance to drop scrap (scrap is a default term for loot drops))
//As for shotguns is during crafting only 3-4 bullets can be made (+1 (increments per 20 levels; as for Alice the dice starts at 1d4 increase per a fair amount)
export const CHARACTER_WEAPONS = {
    ECHO: new CharacterWeapon("Shock Hammer", WeaponType.HAMMER, 50, 1, "SINGLE", null),
    ACE: new CharacterWeapon("Titan Greatsword", WeaponType.MELEE_SWORD, 65, 2, "AOE_CONE", "SLIDER"),
    ROSE: new CharacterWeapon("Plasma Whip", WeaponType.WHIP, 45, 3, "AOE_CONE", "TIMING"),
    STRIKE: new CharacterWeapon("Pulse Gauntlets", WeaponType.GAUNTLET, 40, 1, "SINGLE", "SPAM"),
    STAR: new CharacterWeapon("Dragon Claws", WeaponType.DRAGON_CLAW, 55, 1, "SINGLE", "TIMING")
};

export const FirearmSpec = {
    PISTOL: {
        name: "Pistol", type: WeaponType.RANGED_GUN, scope: "Single", minigameType: "RNG", element: "Physical", 
        basePower: 18, range: 8, accuracy: 90, magSize: 8, infiniteReserve: true
    }, 
    SHOTGUN: {
        // Player picks a primary foe; foes within 1 tile (diagonals count) of it are also hit.
        name: "Shotgun", type: WeaponType.RANGED_GUN, scope: "CONE_ADJACENT", minigameType: "RNG", element: "Physical",
        basePower: 22, range: 5, accuracy: 85, magSize: 6, secondaryMult: 0.6
    },
    RIFLE: {
        // No target selection: every round picks a random visible foe on the map.
        name: "Rifle", type: WeaponType.RANGED_GUN, scope: "ALL_RANDOM", minigameType: "RNG", element: "Physical",
        basePower: 14, range: 99, accuracy: 70, magSize: 30
    }
};


export function createFirearm(key, reserve = 0) {
    const spec = FirearmSpec[key];
    return {...spec, mag: spec.magSize, reserve: spec.infiniteReserve ? Infinity: reserve};
}

//Create once per run: ammo state lives on these objects (save/load them with the party).
export const createBlazeArsenal(rifleReserve = 0, shotgunReserve = 0) => ({
    PISTOL: createFirearm("PISTOL"),
    RIFLE: createFirearm("RIFLE", rifleReserve),
    SHOTGUN: createFirearm("SHOTGUN", shotgunReserve)
});