// Example frontend controller snippet linking UI clicks to the GameDirector's input manager
class UIController {
    constructor(gameDirector) {
        this.gameDirector = gameDirector;
    }

    promptPlayerAction(actor, grid, enemies) {
        // Render action menu for the active hero (e.g., Attack, Spell, Reload, Move)
        console.log(`Waiting for player input for ${actor.name}`);
        
        // Example event listener attached to an attack button in your DOM:
        document.getElementById("attack-btn").onclick = async () => {
            const selectedWeapon = actor.weapon; // or chosen weapon from loadout
            const chosenTarget = enemies[0];     // captured from grid click
            
            // Hand off to input manager to trigger minigames and package the action
            await this.gameDirector.inputManager.resolvePlayerTurn(
                actor, 
                selectedWeapon, 
                chosenTarget, 
                grid, 
                enemies, 
                { rounds: 1, mode: "fire" }
            );
        };
    }
}