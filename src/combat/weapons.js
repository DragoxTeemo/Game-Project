import { Elements } from "./elements.js";

export const WeaponType = {
    MELEE_SWORD: "Greatsword",   // Ace and Echo Blade (Cone AOE)
    RANGED_GUN: "FIREARM",       // BlazE and Echo Range. Must equal "FIREARM": GameDirector routes on it
    WHIP: "Whip",                // Rose and Echo Flow (Cone AOE)
    GAUNTLET: "Gauntlet",        // Strike and Echo Speed
    HAMMER: "Hammer",            // Echo's base weapon
    DRAGON_CLAW: "Dragon Claws"  // Star's Dragon Form 
};

export class CharacterWeapon {
    constructor(name, type, basePower, range, scope, minigameType) {
        this.name = name;
        this.type = type;
        this.basePower = basePower;
        this.range = range;               // tiles
        this.scope = scope;               // SINGLE or AOE_CONE
        this.minigameType = minigameType; // SLIDER, RNG, TIMING or SPAM
    }
}

export const CHARACTER_WEAPONS = {
    // --- ECHO'S WEAPONS ---
    ECHO_HAMMER: new CharacterWeapon("Shock Hammer", WeaponType.HAMMER, 50, 1, "SINGLE", null),
    ECHO_BLADE: new CharacterWeapon("Echo Blade", WeaponType.MELEE_SWORD, 55, 2, "AOE_CONE", "SLIDER"), // Ace base (65) - 10
    ECHO_FLOW: new CharacterWeapon("Echo Flow", WeaponType.WHIP, 40, 3, "AOE_CONE", "TIMING"),           // Rose base (45) - 5
    ECHO_SPEED: new CharacterWeapon("Echo Speed", WeaponType.GAUNTLET, 35, 1, "SINGLE", "SPAM"),         // Strike base (40) - 5

    // --- ACE, ROSE, STRIKE, BLAZE ---
    ACE: new CharacterWeapon("Titan Greatsword", WeaponType.MELEE_SWORD, 65, 2, "AOE_CONE", "SLIDER"),
    ROSE: new CharacterWeapon("Plasma Whip", WeaponType.WHIP, 45, 3, "AOE_CONE", "TIMING"),
    STRIKE: new CharacterWeapon("Pulse Gauntlets", WeaponType.GAUNTLET, 40, 1, "SINGLE", "SPAM"),

    // --- STAR'S FORM WEAPONS ---
    STAR_DRAGON_CLAW: new CharacterWeapon("Dragon Claws", WeaponType.DRAGON_CLAW, 55, 1, "SINGLE", "TIMING"), // Dragon Form
    STAR_UNI_LANCE: new CharacterWeapon("Uni-Lance", WeaponType.MELEE_SWORD, 50, 2, "SINGLE", null),          // Unicorn Form
    STAR_FEATHER_SWORD: new CharacterWeapon("Feather Sword", WeaponType.MELEE_SWORD, 45, 1, "SINGLE", null),  // Pixie/Feather Form alternative
    STAR_ROYAL_SCEPTER: new CharacterWeapon("Royal Scepter", WeaponType.MELEE_SWORD, 30, 1, "SINGLE", null)   // Princess Form
};

export const FirearmSpec = {
    PISTOL: {
        name: "Pistol", type: WeaponType.RANGED_GUN, scope: "Single", minigameType: "RNG", element: "Physical", 
        basePower: 18, range: 8, accuracy: 90, magSize: 8, infiniteReserve: true
    }, 
    SHOTGUN: {
        name: "Shotgun", type: WeaponType.RANGED_GUN, scope: "CONE_ADJACENT", minigameType: "RNG", element: "Physical",
        basePower: 22, range: 5, accuracy: 85, magSize: 6, secondaryMult: 0.6
    },
    RIFLE: {
        name: "Rifle", type: WeaponType.RANGED_GUN, scope: "ALL_RANDOM", minigameType: "RNG", element: "Physical",
        basePower: 14, range: 99, accuracy: 70, magSize: 30
    },
    // Echo Range: 10 damage, 6 magSize, infinite ammo, firearm reload logic when mag == 0
    ECHO_RANGE: {
        name: "Echo Range", type: WeaponType.RANGED_GUN, scope: "Single", minigameType: "RNG", element: "Physical",
        basePower: 10, range: 8, accuracy: 85, magSize: 6, infiniteReserve: true
    },
    // Star Pixie: Like BlazE's pistol but 5 damage, mag of 10
    STAR_PIXIE: {
        name: "Pixie Blaster", type: WeaponType.RANGED_GUN, scope: "Single", minigameType: "RNG", element: "Physical",
        basePower: 5, range: 8, accuracy: 90, magSize: 10, infiniteReserve: true
    }
};

export function createFirearm(key, reserve = 0) {
    const spec = FirearmSpec[key];
    if (!spec) return null;
    return {...spec, mag: spec.magSize, reserve: spec.infiniteReserve ? Infinity : reserve};
}

export function addReserve(firearm, amount) {
    if (!firearm || firearm.infiniteReserve || firearm.reserve === Infinity) {
        return firearm;
    }
    return {
        ...firearm,
        reserve: firearm.reserve + amount
    };
}

export const createBlazeArsenal = (rifleReserve = 0, shotgunReserve = 0) => ({
    PISTOL: createFirearm("PISTOL"),
    RIFLE: createFirearm("RIFLE", rifleReserve),
    SHOTGUN: createFirearm("SHOTGUN", shotgunReserve)
});