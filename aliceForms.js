import { Elements } from "./elements";

export const StarForms = {
    PRINCESS: {
        formName: "Princess",
        elements: Elements.LIGHTNING.name, 
        statWeight: { strength: 0.9, defense: 0.9, magic: 1.2, ward: 1.0, speed: 1.0}
    },
    DRAGON: {
        formName: "Dragon",
        elements: Elements.ICE.name,
        statWeight: { strength: 1.3, defense: 1.4, magic: 0.6, ward: 0.8, speed: 0.7}
    },
    PHOENIX: {
        formName: "Phoenix",
        elements: Elements.FIRE.name,
        statWeight: { strength: 0.7, defense: 0.8, magic: 1.5, ward: 1.3, speed: 1.2}
    },
    UNICORN: {
        formName: "Unicorn", 
        elements: Elements.LIGHT.name,
        statWeight: { strength: 0.9, defense: 1.1, magic: 1.2, ward: 1.2, speed: 1.6}
    }, 
    PIXIE: {
        formName: "Pixie",
        elements: Elements.WIND.name,
        statWeight: { strength: 0.5, defense: 0.7, magic: 1.3, ward: 1.0, speed: 1.3}
    }, 
    PEACOCK: {
        formName: "Peacock",
        elements: Elements.SHADOW.name,
        statWeight: { strength: 0.7, defense: 1.0, magic: 1.6, ward: 1.4, speed: 1.0}
    }
};
