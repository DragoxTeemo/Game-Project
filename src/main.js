import { DialogueSystem } from "./dialogue/dialogue.js";
import { generateValidatedMacroMap, drawMacroMapVisual, generateMicroMap, drawMicroMapVisual } from "./world/WorldGeneration.js";

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("statusText");

DialogueSystem.init();

function showMacro(level) {
    const macro = generateValidatedMacroMap(level);
    drawMacroMapVisual(macro, canvas, ctx);
    if (level === 40) DialogueSystem.showAliceQuote("level_40"); else DialogueSystem.hide();
    statusText.textContent = `Macro map (Level ${level} | Rooms: ${macro.allNodes.size} | Valid: ${macro.success})`;
}

function showMicro() {
    drawMicroMapVisual(generateMicroMap(15, 15), canvas, ctx);
    statusText.textContent = "Micro map (15x15)";
}

document.getElementById("macroBtn").addEventListener("click", () => showMacro(40)); // Average level 40 triggers Alice's quote
document.getElementById("microBtn").addEventListener("click", showMicro);

showMacro(1); // initial render