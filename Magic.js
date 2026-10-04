import { Elements } from "./elements";

//similar to weapon.js
export class MagicSpell {
    constructor(name, element, basePower, scope, magicCost, range = 1) {
        this.name = name;
        this.type = "Magic";
        this.element = element;
        this.basePower = basePower;
        this.scope = scope;
        this.magicCost = magicCost;
        this.range = range;
    }
}

export const Spells = {
    ACE: {  
        SINGLE: new MagicSpell("Ice Spike", Elements.ICE.name, 40, "SINGLE", 15, 4),
        AOE: new MagicSpell("Frost Tree", Elements.ICE.name, 40, "AOE", 35, 2)
    },
    BLAZE: {
        SINGLE: new MagicSpell("Spark", Elements.LIGHTNING.name, 40, "Single", 15, 2),
        AOE: new MagicSpell("Lightning Bolt", Elements.LIGHTNING.name, 45, "AOE", 35, 5)
    },
    ROSE: {
        SINGLE: new MagicSpell("Fire Bolt", Elements.FIRE.name, 40, "SINGLE", 15, 4),
        AOE: new MagicSpell("Fire Dance", Elements.Fire.name, 40, "AOE", 35, 5)
    },
    STRIKE: {
        SINGLE: new MagicSpell("Wind Slice", Elements.WIND.name, 40, "SINGLE", 10, 4),
        AOE: new MagicSpell("Wind Explosion", Elements.WIND.name, 40, "AOE", 20, 5)
    }
}