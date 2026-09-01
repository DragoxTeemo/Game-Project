import { DialogueSystem } from "./dialogue.js";
import { generateValidatedMacroMap } from "./worldGenerator.js";
// Initialize narrative system on load
DialogueSystem.init();

function handleMacroGeneration(averageGroupLevel) {
    let macroWorld = generateValidatedMacroMap(averageGroupLevel);
    drawMacroMapVisual(macroWorld); 

    let statusMsg = `Rendered Macro Network (Level ${averageGroupLevel} | Rooms: ${macroWorld.allNodes.size})`;
    
    if (averageGroupLevel === 40) {
        DialogueSystem.showAliceQuote("level_40");
    } else {
        DialogueSystem.hide();
    }
    
    document.getElementById('statusText').innerText = statusMsg;
}

// --- UNIFIED EVENT LISTENERS ---
document.getElementById('microBtn').addEventListener('click', () => {
    let microMap = generateMicroMap(15, 15); // Make sure generateMicroMap is exported or kept in scope
    drawMicroMapVisual(microMap);
    document.getElementById('statusText').innerText = "Rendered Micro Map (Abundant Floors, Splotchy Mud, Rare Scrap)";
});

document.getElementById('macroBtn').addEventListener('click', () => {
    let testGroupLevel = 40; // Toggle to 1 for standard scaling, 40 for Alice's Milestone quote
    handleMacroGeneration(testGroupLevel);
});