import { Elements } from "./elements";
import { MiniGameSystem } from "./minigame";

export const EchoForms = {
    BASE: {
        formName: "Base Form",
        elements: Elements.PHYSICAL.name,
        statWeight: { strength: 1.0, defense: 1.0, magic: 1.0, ward: 1.0, speed: 1.0 },
        executeMiniGame: null
    },
    ACE: {
        formName: "Blade Form",
        statWeight: { strength: 1.3, defense: 1.2, magic: 0.5, ward: 0.9, speed: 0.6 },
        executeMiniGame: (container, cb) => MiniGameSystem.runSliderMiniGame(container, cb)
    },
    BLAZE: {
        formName: "Range Form",
        statWeight: { strength: 0.8, defense: 1.1, magic: 0.7, ward: 1.1, speed: 0.8 },
        executeMiniGame: (accuracy, cover) => MiniGameSystem.runRNGHitCheck(accuracy, cover)
    },
    FLOW: {
        formName: "Flow Form",
        statWeight: { strength: 0.6, defense: 0.7, magic: 1.3, ward: 0.9, speed: 1.0 },
        executeMiniGame: (pos, tStart, tEnd, pStart, pEnd) => MiniGameSystem.resolveTimingBar(pos, tStart, tEnd, pStart, pEnd)
    },
    SPEED: {
        formName: "Speed Form",
        statWeight: { strength: 0.9, defense: 0.8, magic: 0.7, ward: 0.8, speed: 1.3 },
        executeMiniGame: (clicks, target) => MiniGameSystem.runSpamClick(clicks, target)
    }
};