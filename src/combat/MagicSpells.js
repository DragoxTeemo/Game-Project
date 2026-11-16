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
            new MagicSpell("Da", Elements.ICE.name, 40, "SINGLE", 15, 4)
        ],
        AOE: [
            new MagicSpell("Nada", Elements.ICE.name, 40, "AOE", 35, 2)
        ]
    },
    BLAZE: {
        SINGLE: [
            new MagicSpell("Rom", Elements.LIGHTNING.name, 40, "SINGLE", 15, 2)
        ],
        AOE: [
            new MagicSpell("Narom", Elements.LIGHTNING.name, 45, "AOE", 35, 5)
        ]
    },
    ROSE: {
        SINGLE: [
            new MagicSpell("Lua", Elements.FIRE.name, 40, "SINGLE", 15, 4)
        ],
        AOE: [
            new MagicSpell("Nalua", Elements.FIRE.name, 40, "AOE", 35, 5)
        ]
    },
    STRIKE: {
        SINGLE: [
            new MagicSpell("Zo", Elements.WIND.name, 40, "SINGLE", 10, 4)
        ],
        AOE: [
            new MagicSpell("Nazo", Elements.WIND.name, 40, "AOE", 20, 5)
        ]
    }
};

export const StarSpells = {
    PRINCESS: {
        SINGLE: [
            new MagicSpell("Rom", Elements.LIGHTNING.name, 35, "SINGLE", 15, 4)
        ],
        AOE: [
            new MagicSpell("Narom", Elements.LIGHTNING.name, 40, "AOE", 25, 4)
        ]
    },
    DRAGON: {
        SINGLE: [
            new MagicSpell("Da", Elements.ICE.name, 45, "SINGLE", 20, 2)
        ],
        AOE: [
            new MagicSpell("Nada", Elements.ICE.name, 50, "AOE", 35, 3)
        ]
    },
    PHOENIX: {
        SINGLE: [
            new MagicSpell("Lua", Elements.FIRE.name, 40, "SINGLE", 15, 5)
        ],
        AOE: [
            new MagicSpell("Nalua", Elements.FIRE.name, 55, "AOE", 40, 6)
        ]
    },
    UNICORN: {
        SINGLE: [
            new MagicSpell("Sang", Elements.LIGHT.name, 35, "SINGLE", 10, 5)
        ],
        AOE: [
            new MagicSpell("Nasang", Elements.LIGHT.name, 40, "AOE", 30, 5)
        ]
    },
    PIXIE: {
        SINGLE: [
            new MagicSpell("Zo", Elements.WIND.name, 25, "SINGLE", 10, 6)
        ],
        AOE: [
            new MagicSpell("Nazo", Elements.WIND.name, 35, "AOE", 20, 5)
        ]
    },
    PEACOCK: {
        SINGLE: [
            new MagicSpell("Toi", Elements.SHADOW.name, 35, "SINGLE", 15, 4)
        ],
        AOE: [
            new MagicSpell("Natoi", Elements.SHADOW.name, 45, "AOE", 30, 5)
        ]
    }
};

export const EchoSpells = {
    ECHO_FIRE: {
        SINGLE: [
            new MagicSpell("Lua", Elements.FIRE.name, 40, "SINGLE", 15, 4)
        ],
        AOE: [
            new MagicSpell("Nalua", Elements.FIRE.name, 40, "AOE", 30, 4)
        ]    
    },
    ECHO_ICE: {
        SINGLE: [
            new MagicSpell("Da", Elements.ICE.name, 20, "SINGLE", 10, 1)
        ],
        AOE: [
            new MagicSpell("Nada", Elements.ICE.name, 40, "AOE", 25, 5)
        ]
    },
    ECHO_WIND: {
        SINGLE: [
            new MagicSpell("Zo", Elements.WIND.name, 20, "SINGLE", 15, 6)
        ],
        AOE: [
            new MagicSpell("Nazo", Elements.WIND.name, 50, "AOE", 30, 5)
        ]
    },
    ECHO_LIGHTNING: {
        SINGLE: [
            new MagicSpell("Rom", Elements.LIGHTNING.name, 40, "SINGLE", 20, 4)
        ],
        AOE: [
            new MagicSpell("Narom", Elements.LIGHTNING.name, 40, "AOE", 15, 4)
        ]
    }
};