import { Elements } from "../data/elements";

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
        SINGLE: [
            new MagicSpell("Ice Spike", Elements.ICE.name, 40, "SINGLE", 15, 4)
        ],
        AOE: [
            new MagicSpell("Frost Tree", Elements.ICE.name, 40, "AOE", 35, 2)
        ]
    },
    BLAZE: {
        SINGLE: [
            new MagicSpell("Spark", Elements.LIGHTNING.name, 40, "SINGLE", 15, 2)
        ],
        AOE: [
            new MagicSpell("Lightning Bolt", Elements.LIGHTNING.name, 45, "AOE", 35, 5)
        ]
    },
    ROSE: {
        SINGLE: [
            new MagicSpell("Fire Bolt", Elements.FIRE.name, 40, "SINGLE", 15, 4)
        ],
        AOE: [
            new MagicSpell("Fire Dance", Elements.FIRE.name, 40, "AOE", 35, 5)
        ]
    },
    STRIKE: {
        SINGLE: [
            new MagicSpell("Wind Slice", Elements.WIND.name, 40, "SINGLE", 10, 4)
        ],
        AOE: [
            new MagicSpell("Wind Explosion", Elements.WIND.name, 40, "AOE", 20, 5)
        ]
    }
};

export const StarSpells = {
    PRINCESS: {
        SINGLE: [
            new MagicSpell("Royal Spark", Elements.LIGHTNING.name, 35, "SINGLE", 12, 4)
        ],
        AOE: [
            new MagicSpell("Crown Lightning", Elements.LIGHTNING.name, 40, "AOE", 25, 4)
        ]
    },
    DRAGON: {
        SINGLE: [
            new MagicSpell("Glacial Fang", Elements.ICE.name, 45, "SINGLE", 18, 2)
        ],
        AOE: [
            new MagicSpell("Dragon Breath Blizzard", Elements.ICE.name, 50, "AOE", 35, 3)
        ]
    },
    PHOENIX: {
        SINGLE: [
            new MagicSpell("Rebirth Flame", Elements.FIRE.name, 40, "SINGLE", 15, 5)
        ],
        AOE: [
            new MagicSpell("Crimson Wings", Elements.FIRE.name, 55, "AOE", 40, 6)
        ]
    },
    UNICORN: {
        SINGLE: [
            new MagicSpell("Horn Pierce", Elements.LIGHT.name, 35, "SINGLE", 10, 5)
        ],
        AOE: [
            new MagicSpell("Aura Burst", Elements.LIGHT.name, 40, "AOE", 30, 5)
        ]
    },
    PIXIE: {
        SINGLE: [
            new MagicSpell("Fairy Gust", Elements.WIND.name, 25, "SINGLE", 8, 6)
        ],
        AOE: [
            new MagicSpell("Pixie Cyclone", Elements.WIND.name, 35, "AOE", 20, 5)
        ]
    },
    PEACOCK: {
        SINGLE: [
            new MagicSpell("Shadow Plume", Elements.SHADOW.name, 35, "SINGLE", 12, 4)
        ],
        AOE: [
            new MagicSpell("Omen Display", Elements.SHADOW.name, 45, "AOE", 30, 5)
        ]
    }
};

export const EchoSpells = {
    ECHO_FIRE: {
        SINGLE: [
            new MagicSpell("Fire Blade", Elements.FIRE.name, 40, "SINGLE", 15, 4)
        ],
        AOE: [
            new MagicSpell("Flame Pillar", Elements.FIRE.name, 40, "AOE", 30, 4)
        ]    
    },
    ECHO_ICE: {
        SINGLE: [
            new MagicSpell("Frost Shard", Elements.ICE.name, 20, "SINGLE", 10, 1)
        ],
        AOE: [
            new MagicSpell("Frost Nova", Elements.ICE.name, 40, "AOE", 25, 5)
        ]
    },
    ECHO_WIND: {
        SINGLE: [
            new MagicSpell("Light Breeze", Elements.WIND.name, 20, "SINGLE", 15, 6)
        ],
        AOE: [
            new MagicSpell("Gale Storm", Elements.WIND.name, 50, "AOE", 30, 5)
        ]
    },
    ECHO_LIGHTNING: {
        SINGLE: [
            new MagicSpell("Static Spark", Elements.LIGHTNING.name, 40, "SINGLE", 20, 4)
        ],
        AOE: [
            new MagicSpell("Thunder Spear", Elements.LIGHTNING.name, 40, "AOE", 15, 4)
        ]
    }
}