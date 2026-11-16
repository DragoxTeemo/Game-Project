import { Elements } from "./elements.js";
import { MiniGameSystem } from "./minigame.js";

// Echo's combat forms share access to these four core elements
const ECHO_COMBAT_ELEMENTS = [
    Elements.FIRE.name,
    Elements.ICE.name,
    Elements.WIND.name,
    Elements.LIGHTNING.name
];

export const EchoForms = {
    BASE: {
        formName: "Base Form",
        elements: Elements.PHYSICAL.name,
        allowedElements: [], // Base form lacks elemental selection
        statWeight: { strength: 1.0, defense: 1.0, magic: 1.0, ward: 1.0, speed: 1.0 },
        executeMiniGame: null
    },
    BLADE: {
        formName: "Blade Form",
        allowedElements: ECHO_COMBAT_ELEMENTS,
        statWeight: { strength: 1.3, defense: 1.2, magic: 0.5, ward: 0.9, speed: 0.6 },
        executeMiniGame: (container, cb) => MiniGameSystem.runSliderMiniGame(container, cb)
    },
    RANGE: {
        formName: "Range Form",
        allowedElements: ECHO_COMBAT_ELEMENTS,
        statWeight: { strength: 0.8, defense: 1.1, magic: 0.7, ward: 1.1, speed: 0.8 },
        executeMiniGame: (accuracy, cover) => MiniGameSystem.runRNGHitCheck(accuracy, cover)
    },
    FLOW: {
        formName: "Flow Form",
        allowedElements: ECHO_COMBAT_ELEMENTS,
        statWeight: { strength: 0.6, defense: 0.7, magic: 1.3, ward: 0.9, speed: 1.0 },
        executeMiniGame: (pos, tStart, tEnd, pStart, pEnd) => MiniGameSystem.resolveTimingBar(pos, tStart, tEnd, pStart, pEnd)
    },
    SPEED: {
        formName: "Speed Form",
        allowedElements: ECHO_COMBAT_ELEMENTS,
        statWeight: { strength: 0.9, defense: 0.8, magic: 0.7, ward: 0.8, speed: 1.3 },
        executeMiniGame: (clicks, target) => MiniGameSystem.runSpamClick(clicks, target)
    }
};