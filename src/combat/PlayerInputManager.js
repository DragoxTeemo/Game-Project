import { act } from "react";

let queuedAction = null;

export class PlayerInputManager {
    constructor() {
        this.pendingAction = null;
        this.isWaitingForInput = false;
    }
    /**
     * Triggered by the UI when the player clicks an action button and selects a target.
     */
    async resolvePlayerTurn(actor, weapon, target, grid, enemies, extraParams = {}) {
        this.isWaitingForInput = true;
        
        // This awaits minigames (slider, timing, spam) and builds the fully populated action object
        const actionPayload = await buildPlayerAction(actor, weapon, target, grid, enemies, extraParams);
        
        this.pendingAction = actionPayload;
        this.isWaitingForInput = false;
    }

    /**
     * Consumes and clears the queued action when GameDirector polls for it.
     */
    consumeAction() {
        const action = this.pendingAction;
        this.pendingAction = null;
        return action;
    }
}