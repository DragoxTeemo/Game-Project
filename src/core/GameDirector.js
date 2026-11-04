import { MaskedRiderRegistry } from "../data/riderConfig.js";
import { MaskedRider } from "../entities/MaskedRider.js";
import { EncounterDirector, calculateGroupAverageLevel, distributeAdjustedEXP } from "./EncounterDirector.js";
import { SharedManaPool } from "./ManaSystem.js";
import { executeWeaponAttack } from "../combat/weaponExecutionEngine.js";
import { executeSpellCast } from "../combat/SpellExecutionEngine.js";
import { executeFirearmAction, executeBasicAttack } from "./combat/firearmEngine.js";
import { getFoeBasicActions } from "../data/foeConfig.js";
import { getReachableTiles, movementBudget } from "../combat/Pathfinding.js";
import { createOpenGrid, placeUnits } from "../combat/placement.js";
import { isAlive } from "../data/UnitState.js";

export class GameDirector {
    constructor() {
        this.party = [];
        this.benchedParty = [];
        this.activeEnemies = [];
        this.grid = null;
        this.heroMana = new SharedManaPool(20, 100);
        this.villainMana = new SharedManaPool(20, 100);
        this.currentRound = 0;
        this.turnQueue = [];
        this.combatEnded = false;
        this.currentGroupLevel = 1;
        this.gameState = "MAP_EXPLORATION"; // MAP_EXPLORATION, COMBAT, CUTSCENE, FINISHER
        this.rescueTimerId = null;
        this.finisherTimerId = null;
    }
 
    initializeParty(riderKeys) {
        this.party = riderKeys.map(key => {
            const rider = new MaskedRider(key, MaskedRiderRegistry[key]);
            rider.faction = "hero";
            rider.x = 0; rider.y = 0;
            return rider;
        });
        this.updateGroupLevel();
    }

    updateGroupLevel() { 
        this.currentGroupLevel = calculateGroupAverageLevel(this.party); 
    }

    // grid: a micro map from the world generator (grid[x][y]); falls back to an open 15x15
    transitionToCombat(roomNode, grid = null) {
        clearTimeout(this.rescueTimerId);
        clearTimeout(this.finisherTimerId);
        this.gameState = "COMBAT";
        this.currentRound = 0;
        this.combatEnded = false;
        this.heroMana.reset();
        this.villainMana.reset();
        this.updateGroupLevel();
        this.grid = grid ?? createOpenGrid(15, 15);
        this.activeEnemies = EncounterDirector.generateRoomEncounter(this.currentGroupLevel);
        this.activeEnemies.forEach(e => { e.faction = "villain"; });
        placeUnits(this.grid, this.party, this.activeEnemies);
        this.advanceRound();
    }

    advanceRound() {
        this.currentRound++;
        this.heroMana.advanceRound();
        this.villainMana.advanceRound();
        this.turnQueue = this.buildTurnQueue();
    }

    // Strict Speed-based turn order: every conscious combatant from both sides acts once per round, 
    // highest speed first. On a tied speed, hero always goes before villain.
    buildTurnQueue() {
        return [...this.party, ...this.activeEnemies].filter(isAlive).sort((a, b) => {
            const d = (b.speed || 0) - (a.speed || 0);
            if (d !== 0) return d;
            return a.faction === b.faction ? 0 : a.faction === "hero" ? -1 : 1;
        });
    }

    getNextActor() {
        while (this.turnQueue.length) {
            const a = this.turnQueue.shift();
            if (isAlive(a)) return a;
        }
        return null;
    }

    processNextTurn() {
        if (this.combatEnded) return null;
        let actor = this.getNextActor();
        if (!actor) { this.advanceRound(); actor = this.getNextActor(); }
        if (!actor) return null;
 
        this.dispatchActorTurn(actor);
 
        if (this.checkPartyDefeatState()) { this.combatEnded = true; return actor; }
        if (this.checkEnemyDefeatState()) this.combatEnded = true;
        return actor;
    }

    // Move only to a tile inside the unit's budget; prevents UI or AI from teleporting.
    moveUnit(unit, dest) {
        if (!dest) return false;
        const units = [...this.party, ...this.activeEnemies].filter(isAlive);
        const ok = getReachableTiles(this.grid, unit, unitMovePoints(unit), units, unit)
            .some(t => t.x === dest.x && t.y === dest.y);
        if (ok) { unit.x = dest.x; unit.y = dest.y; }
        return ok;
    }

    // Branches on actor.faction. Heroes pull from a queued player choice (stubbed - no
    // input system exists yet); villains call Virus.chooseAction directly against the
    // spells available to their archetype. Either path routes into resolveAction() with
    // the correct shared mana pool for that side.
    dispatchActorTurn(actor) {
        if (actor.faction === "hero") {
            const q = this.getQueuePlayerAction(actor);
            if (!q) return; // waiting on input
            if (q.moveTo) this.moveUnit(actor, q.moveTo);
            if (q.item) this.resolveAction(actor, q.item, q.target, this.heroMana, this.activeEnemies, q);
            return;
        }
        const plan = actor.takeTurn({
            grid: this.grid,
            party: this.party,
            allies: this.activeEnemies,
            availableActions: getFoeBasicActions(actor.archetype), // + foe spells once foeSpells.js exists
            manaPool: this.villainMana
        });
        if (plan.moveTo) { actor.x = plan.moveTo.x; actor.y = plan.moveTo.y; } // AI only picks reachable tiles
        if (plan.action) this.resolveAction(actor, plan.action, plan.target, this.villainMana, this.party, {});
    }

    
    // Input handler should return { item, target, rounds, mode: "fire"|"reload", moveTo?, aimDirection? }.
    // BlazE's rifle needs no target. Reload is { item: firearm, mode: "reload" }.
    getQueuePlayerAction(actor) { 
        return null; 
    }
    
    // Shared routing between the two execution engines: a MagicSpell always carries
    // magicCost (even 0 is a defined number), a CharacterWeapon never does - that's
    // the distinguishing field used to pick the engine.
    resolveAction(actor, item, target, manaPool, targetPool, extra = {}) {
        if (!item) return { success: false, reason: "No action item provided." };
        if (item.type === "Magic") return executeSpellCast(actor, target, item, manaPool, targetPool);
        if (item.type === "FIREARM") {
            return executeFirearmAction(actor, item, { mode: extra.mode, target, rounds: extra.rounds, grid: this.grid, enemies: targetPool });
        }
        if (item.minigameType) {
            return executeWeaponAttack(actor, target, item, [], this.grid, targetPool, extra.aimDirection ?? null);
        }
        return executeBasicAttack(actor, item, target, this.grid);
    }

    resolveCombatVictory() {
        if (!this.activeEnemies.length) return;
        const pool = this.activeEnemies.reduce((s, e) => s + (e.xpReward || 0), 0);
        distributeAdjustedEXP(this.party, this.benchedParty, pool);
        this.activeEnemies = [];
        this.gameState = "MAP_EXPLORATION";
        this.currentRound = 0;
        this.turnQueue = [];
        this.combatEnded = false;
        this.heroMana.reset();
        this.villainMana.reset();
        this.updateGroupLevel();
    }
 
    checkPartyDefeatState() {
        if (this.party.length > 0 && this.party.every(r => !isAlive(r))) {
            this.triggerRescueCutscene();
            return true;
        }
        return false;
    }

    /**
     * Character dialogue will occur after awakening from the campfire, active members who lost will state:
     * (Rose and Star): "Sorry for not being strong enough"
     * (Ace and BlazE): "I won't mess up this time."
     * Echo: "Sorry for failing y'all"
     * Strike: "I want payback!"
     */
    triggerRescueCutscene() {
        this.gameState = "CUTSCENE";
        this.activeEnemies = [];
        this.turnQueue = [];
        this.rescueTimerId = setTimeout(() => {
            this.party.forEach(r => { r.hp = Math.floor(r.maxHp * 0.25); r.isDefeated = false; });
            this.gameState = "MAP_EXPLORATION";
            this.combatEnded = false;
            this.rescueTimerId = null;
        }, 3000);
    }

    checkEnemyDefeatState() {
        if (this.activeEnemies.length > 0 && this.activeEnemies.every(e => !isAlive(e))) {
            this.triggerRiderFinisher();
            return true;
        }
        return false;
    }
 
    triggerRiderFinisher() {
        this.gameState = "FINISHER";
        this.finisherTimerId = setTimeout(() => {
            this.activeEnemies.forEach(e => { e.hp = 0; e.isDefeated = true; });
            this.finisherTimerId = null;
            this.resolveCombatVictory();
        }, 2000);
    }
}