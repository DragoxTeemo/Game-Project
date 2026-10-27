import { DialogueSystem } from "./dialogue.js";
import { generateValidatedMacroMap, drawMacroMapVisual } from "./WorldGeneration.js";
import { generateMicroMap, drawMicroMapVisual } from "./microMapGenerator.js";
import { createNoise2D } from 'https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/+esm';

// Initialize narrative system on load
DialogueSystem.init();

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('statusText');
const macroBtn = document.getElementById('macroBtn');
const microBtn = document.getElementById('microBtn');

function handleMacroGeneration(averageGroupLevel) {
    let macroWorld = generateValidatedMacroMap(averageGroupLevel);
    drawMacroMapVisual(macroWorld, canvas, ctx); 

    let statusMsg = `Rendered Macro Network (Level ${averageGroupLevel} | Rooms: ${macroWorld.allNodes.size})`;
    
    if (averageGroupLevel === 40) {
        DialogueSystem.showAliceQuote("level_40");
    } else {
        DialogueSystem.hide();
    }
    
    statusText.innerText = statusMsg;
}

// --- UNIFIED EVENT LISTENERS ---
microBtn.addEventListener('click', () => {
    statusText.textContent = "Generating Micro Map...";
    let microMap = generateMicroMap(15, 15);
    drawMicroMapVisual(microMap, canvas, ctx);
    statusText.innerText = "Rendered Micro Map (Abundant Floors, Splotchy Mud, Rare Scrap)";
});

macroBtn.addEventListener('click', () => {
    statusText.textContent = "Generating Macro Map...";
    let testGroupLevel = 40; // Toggle to 1 for standard scaling, 40 for Alice's Milestone quote
    handleMacroGeneration(testGroupLevel);
});

// Initial render on script load
let initialMicro = generateMicroMap(15, 15);
drawMicroMapVisual(initialMicro, canvas, ctx);

let initialMacroData = generateValidatedMacroMap(1);
drawMacroMapVisual(initialMacroData, canvas, ctx);