//equipment data template
export const WeaponType = {
    MELEE_SWORD: "Greatsword",  // Ace and Echo Blade (Cone AOE)
    RANGED_GUN: "Firearm",      // BlazE and Echo Range
    WHIP: "Whip",               // Rose and Echo Flow (Cone AOE)
    GAUNTLET: "Gauntlet",       // Strike and Echo Speed
    HAMMER: "Hammer",           // Echo's base weapon
    DRAGON_CLAW: "Dragon Claws" // Star's Dragon Form
};

export class CharacterWeapon {
    constructor(name, type, basePower, range, scope, minigameType) {
        this.name = name;
        this.type = type;               // Physical or magic
        this.basePower = basePower;
        this.range = range;             // How far the attack is based on number of tiles
        this.scope = scope;             //AOE or Single Target
        this.minigameType = minigameType; // Slider, RNG, Timing, or Spam
    }
}

// Rifle and Shotgun Requires ammo: 
// For Rifles, can craft 8-10 bullets (perhaps a dnd-like chance mechanic, deciding between a default +x (increments per level percentage every 10 levels For Rebecca) 
// and a dice roll (d6 by default, increments as Alice levels up every 20 levels) 
// (10 scrap for rifle ammo? depends on how often scraps will drop we'll say characters drop xp and a chance to drop scrap (scrap is a default term for loot drops))
//As for shotguns is during crafting only 3-4 bullets can be made (+1 (increments per 20 levels; as for Alice the dice starts at 1d4 increase per a fair amount)
export const CharacterWeapon = {
    ACE: new CharacterWeapon("Titan Greatsword", WeaponType.MELEE_SWORD, 65, 2, "AOE_CONE", "SLIDER"),
    BLAZE_PISTOL: new CharacterWeapon("Pistol", WeaponType.RANGED_GUN, 30, 5, "SINGLE", "RNG"),
    BLAZE_AR: new CharacterWeapon("Assault Rifle", WeaponType.RANGED_GUN, 50, 8, "SINGLE", "RNG"), 
    BLAZE_SHOTGUN: new CharacterWeapon("Shotgun", WeaponType.RANGED_GUN, 80, 3, "AOE_CONE", "RNG"), 
    ROSE: new CharacterWeapon("Plasma Whip", WeaponType.WHIP, 45, 3, "AOE")


}