import { Elements } from "./elements";


/**
 * To prevent the generalist class overlapping with the specialist classes, Star will have a statWeight total of 4.8 to give the idea she is the 6th Ranger of the Team
 * Princess is the exception as that is her base form
 */
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
        statWeight: { strength: 0.5, defense: 0.8, magic: 1.4, ward: 0.9, speed: 1.2}
    },
    UNICORN: {
        formName: "Unicorn", 
        elements: Elements.LIGHT.name,
        statWeight: { strength: 0.7, defense: 0.8, magic: 1.1, ward: 0.8, speed: 1.4}
    }, 
    PIXIE: {
        formName: "Pixie",
        elements: Elements.WIND.name,
        statWeight: { strength: 1.1, defense: 0.8, magic: 0.9, ward: 0.8, speed: 1.2}
    }, 
    PEACOCK: {
        formName: "Peacock",
        elements: Elements.SHADOW.name,
        statWeight: { strength: 0.7, defense: 0.9, magic: 1.2, ward: 1.1, speed: 0.9}
    }
};
