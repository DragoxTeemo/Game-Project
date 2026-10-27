// elements.js
export const Elements = {
    FIRE:      { name: "Fire",      color: "#ff4500", damage_multiplier: 1.2, crit_multiplier: 2.0 },
    ICE:       { name: "Ice",       color: "#4ea8de", damage_multiplier: 1.2, crit_multiplier: 2.0 },
    LIGHTNING: { name: "Lightning", color: "#ffb703", damage_multiplier: 1.2, crit_multiplier: 2.0 },
    WIND:      { name: "Wind",      color: "#38b000", damage_multiplier: 1.2, crit_multiplier: 2.0 },
    LIGHT:     { name: "Light",     color: "#ffffff", damage_multiplier: 1.2, crit_multiplier: 2.0 },
    SHADOW:    { name: "Shadow",    color: "#7209b7", damage_multiplier: 1.2, crit_multiplier: 2.0 },
    PHYSICAL:  { name: "Physical",  color: "#adb5bd", damage_multiplier: 1.0, crit_multiplier: 2.5 }
};

Object.freeze(Elements); // Prevents accidental runtime mutation

// This is the cyclic elemental weaknesses
export const ElementCycles = {
    "Fire": "Ice", 
    "Ice": "Fire",
    "Wind": "Lightning",
    "Lightning": "Wind",
    "Light": "Shadow",
    "Shadow": "Light"
};