import { Elements } from "./elements";
import { MiniGameSystem } from ".minigame";

export const EchoForms = {
    BASE: {
        formName: "Base Form",
        elements: Elements.PHYSICAL.name,
        statWeight: { strength: 1.0, defense: 1.0, magic: 1.0, ward: 1.0, speed: 1.0},
        executeMiniGame: null
    },
    BLADE: {
        formName: "Blade Form",
        elements: Elements.name,
        statWeight: { strength: 1.4, defense: 1.4, magic: 0.5, ward: 0.9, speed: 0.6 },
        executeMiniGame: (container, cb) => MiniGameSystem.
    }
}