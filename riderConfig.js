import { Elements } from "./elements";
import { StarForms } from "./aliceForms";
import { EchoForms } from "./echoForms";

export const MaskedRiderRegistry = {
    ECHO: {
        name: "Cody",
        codename: "Echo",
        coefficients: {a: 1.0, b: 14, c: 25},
        elements: Elements.PHYSICAL.name,
        forms: EchoForms,
        allowedElements: [
            Elements.FIRE.name,
            Elements.ICE.name,
            Elements.WIND.name,
            Elements.LIGHTNING.name
        ]
    },
    ACE: {
        name: "Ethan",
        codename: "Ace",
        coefficients: { a: 1.2, b: 15, c: 10 },
        elements: Elements.ICE.name,
        statweight: { strength: 1.4, defense: 1.3, magic: 0.6, ward: 1.0, speed: 0.7 }
    },
    BLAZE: {
        name: "Rebecca",
        codename: "BlazE", 
        coefficients: { a: 0.7, b: 12, c: 40},
        elements: Elements.LIGHTNING.name,
        statweight: { strength: 0.9, defense: 1.2, magic: 0.8, ward: 1.3, speed: 0.8}
    },
    ROSE: {
        name: "Kira",
        codename: "Rose",
        coefficients: { a: 0.8, b: 13, c: 30},
        elements: Elements.FIRE.name,
        statweight: {strength: 0.7, defense: 0.6, magic: 1.5, ward: 0.9, speed: 1.3 },
    },
    STRIKE: {
        name: "JJ",
        codename: "Strike",
        coefficients: { a: 0.65, b: 11, c: 50},
        elements: Elements.WIND.name,
        statweight: { strength: 0.9, defense: 0.8, magic: 0.7, ward: 0.8, speed: 1.3}
    },
    STAR: {
        name: "Alice",
        codename: "Star",
        coefficients: { a: 1.5, b: 16, c: 10},
        elements: Elements.LIGHTNING.name,
        forms: StarForms
    }
}