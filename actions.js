/**
 * Future concepts:
 * Minigame feature, in a modular/shared system:
 * -Ace: A simple mouse-grab-slide mechanic to replicate the act of cleaving/attacking with his giant sword, not always in the same place
 *      so can attack down to up or left to right
 * - BlazE: a Fallout Style percent chance to shooting, but when enemies are behind scrap, there will be a -10% on all of BlazE's attacks
 * - Rose: An undertale/deltarune style attack time bar feature
 * - Strike: spam clicking the mouce on a random area of the screen 
 * - Echo using his Echoes of allies will be the same as his allies just that in the addition of elemental damage on top of the basic attacks 
 *      (as he has the Echoes + Elements for a total of 16 combinations) to prevent a time sink the elemental damage is a percentage on top of
 *      basic attacks (so like 10%-25% as he progressively gets stronger as simple as a for each 25% level is when the damage percentage increases)
 *      for sake of simplicity each new form is literally the same as each respective allies
 * - Alice might be a time sink as this is a Pokemon/Persona feature:
 *      Each Mystic change affects her spells (Dragon for Ice, Phoenix for Fire, Unicorn for Light, Peacock for Shadow, Pixie for Wind)
 *      Right now only two spells exist: Single Target and AOE spells and each form changes her stats each for the respective ally
 *      Dragon is Ace so high defense; Pixie might be Rose's agility; Unicorn is Strike's Speed; Phoenix is Blaze's stats; 
 *      Peacock and Princess (Base Form) is the only unique one  
 */

// An executed skill instance which will be processed by an engine during a turn
export class CombatAction {
    constructor(name, type, element, power, scope, range = 1) {
        this.name = name;           // "Shotgun", "Ice Spike", "Whip Strike"
        this.type = type;           // "Physical" (strength/defense) or "Magic" (magic/ward)
        this.element = element;     // Elements.FIRE.name (and other elements) or Elements.PHYSICAL.name (not an element but is effectively no different)
        this.power = power;         // (Base Power that's not counting the strength/magic against defense/ward)
        this.scope = scope;         // AOE (Has a certain range like a radius of 4+ (character movement in average is 4)) vs Single Target 
        this.range = range;         // For single target for how far the attack is
    }
}