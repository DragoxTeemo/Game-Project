import { MaskedRiderRegistry } from "./riderConfig";
import { MaskedRider } from "./MaskedRider";
import { EncounterDirector, calculateGroupAverageLevel, distributeAdjustedEXP } from "./EncounterDirector";
import { SharedManaPool } from "./manaSystem";
import { executeWeaponAttack } from "./weaponExecutionEngine";
import { executeSpellCast } from "./spellExecutionEngine";
import { getFoeAvailableActions } from "./foeSpells";



export class GameDirector {
    constructor() {
        this.party = [];
        this.activeEnemies = [];
        this.heroMana = new SharedManaPool(20, 100);
        this.villainMana = new SharedManaPool(20, 100);
        this.currentRound = 0; 
        this.turnQueue = [];
        this.combatEnded = false; 
        this.currentGroupLevel = 1; 
        this.gameState = "MAP_EXPLORATION"; // MAP_EXPLORATION, COMBAT, CUTSCENE
    }

    initializeParty(riderKeys) {
        this.party = riderKeys.map(key => {
            let registryData = MaskedRiderRegistry[key];
            let rider = new MaskedRider(key, registryData);
            rider.faction = "hero"; // buildTurnQueue's tie-break and by the dispatcher
            return rider;
        });
        
        // Ensure group level is calculated right after party creation
        this.updateGroupLevel();
        console.log("Party successfully initialized:", this.party.map(p => p.codename), `(Group Level: ${this.currentGroupLevel})`);
    }

    updateGroupLevel() {
        this.currentGroupLevel = calculateGroupAverageLevel(this.party);
    }

    transitionToCombat(roomNode) {
        this.gameState = "COMBAT";
        this.currentRound = 0;
        this.combatEnded = false; 
        this.heroMana.reset();
        this.villainMana.reset();
        this.updateGroupLevel();
        this.activeEnemies = EncounterDirector.generateRoomEncounter(this.currentGroupLevel);
        this.activeEnemies.forEach(enemy => {enemy.faction = "villain"});
        this.advanceRound();

        console.log(`Combat initiated! Group Level: ${this.currentGroupLevel}`, this.activeEnemies.map(e => `${e.tier} ${e.archetype} (Lvl ${e.level})`));
    }

    advanceRound() {
        this.currentRound++;
        let heroTotal = this.heroMana.advanceRound();
        let villainTotal = this.villainMana.advanceRound();
        this.turnQueue = this.buildTurnQueue();
        console.log(`Round ${this.currentRound} - Hero Mana: ${heroTotal}/${this.heroMana.cap} | Villain Mana: ${villainTotal}/${this.villainMana.cap}`);
        console.log(`Turn order:`, this.turnQueue.map(u => `${u.codename || u.title} (SPD ${u.speed})`));
    }

    // Strict Speed-based turn order: every conscious combatant from both sides acts once per round, 
    // highest speed first. On a tied speed, hero always goes before villain.
    buildTurnQueue() {
        let combatants = [...this.party, ...this.activeEnemies].filter(unit => !unit.isDefeated && unit.hp > 0);
        return combatants.sort((a, b) => {
            let speedDiff = (b.speed || 0) - (a.speed || 0);
            if (speedDiff !== 0) return speedDiff;
            if (a.faction === b.faction) return 0;
            return a.faction === "hero" ? -1 : 1;
        });
    }

    getNextActor() {
        return this.turnQueue.length > 0 ? this.turnQueue.shift() : null;
    }

    processNextTurn() {
        if (this.combatEnded) return null;
 
        let actor = this.getNextActor();
        if (!actor) {
            this.advanceRound();
            actor = this.getNextActor();
        }
        if (!actor) return null;
 
        this.dispatchActorTurn(actor);
 
        let partyDown = this.checkPartyDefeatState();
        let enemiesDown = this.checkEnemyDefeatState();
        if (partyDown || enemiesDown) {
            this.combatEnded = true;
        }
 
        return actor;
    }

    // Branches on actor.faction. Heroes pull from a queued player choice (stubbed - no
    // input system exists yet); villains call Virus.chooseAction directly against the
    // spells available to their archetype. Either path routes into resolveAction() with
    // the correct shared mana pool for that side.
    dispatchActorTurn(actor) {
        let manaPool = actor.faction === "hero" ? this.heroMana : this.villainMana;
        if (actor.faction === "hero") {
            let queueAction = this.getQueuePlayerAction(actor);
            if (!queueAction) {
                console.log(`${actor.codename} is waiting on a player action (input handler not yet wired up).`);
                return;
            }
            this.resolveAction(actor, queuedAction.item, queuedAction.target, manaPool, queuedAction.targetPool);
        } else {
            let availableActions = getFoeAvailableActions(actor.archetype);
            let choice = actor.chooseAction(this.party, this.activeEnemies, availableActions);
            if (!choice || !choice.action) {
                console.log(`${actor.title} has no valid action this turn.`);
                return;
            }

            // chooseAction returns { action: { action: spell, elements }, target } - unwrap
            // the inner spell to match the contract getFoeAvailableActions builds it with.
            let spell = choice.action.action;
            this.resolveAction(actor, spell, choice.target, manaPool, this.party);
        }
    }
    
    // PLACEHOLDER: no player input system exists yet. Should eventually return
    // { item, target, targetPool } sourced from a UI-queued choice for this hero.
    // Returns null until that's built, which is why hero turns currently no-op.

    getQueuePlayerAction(actor) {
        return null;
    }


    // Shared routing between the two execution engines: a MagicSpell always carries
    // magicCost (even 0 is a defined number), a CharacterWeapon never does - that's
    // the distinguishing field used to pick the engine.
    resolveAction(actor, item, target, manaPool, targetPool) {
        if (!item) 
            return { 
                success: false, 
                reason: "No action item provided."
        };
        if (item.magicCost !== undefined) {
            return executeSpellCast(actor, target, item, manaPool, targetPool);
        }
        // NOTE: obstacles/grid/aimDirection aren't threaded through processNextTurn yet,
        // so AOE_CONE weapon attacks (Ace's greatsword) will no-op here until they are.
        return executeWeaponAttack(actor, target, item, [], null, targetPool, null);
    }  

    resolveCombatVictory() {
        if (this.activeEnemies.length === 0) return;
        let totalXpPool = this.activeEnemies.reduce((sum, enemy) => sum + (enemy.xpReward || 0), 0);    

        distributeAdjustedEXP(this.party, totalXpPool);
        
        console.log(`Victory! Distributed total pool of ${totalXpPool} XP across party.`);

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
        let allUnconscious = this.party.every(rider => rider.hp <= 0 || rider.isDefeated);
        if (allUnconscious) {
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
        console.log("All active Masked Riders defeated! Benched allies arrive to carry the team away...");
        // Reset party HP to a safe threshold, move party to nearest campfire node, restore state
        setTimeout(() => {
            this.party.forEach(rider => {
                rider.hp = Math.floor(rider.maxHp * 0.25);
                rider.isDefeated = false;
            });
            this.gameState = "MAP_EXPLORATION";
            this.combatEnded = false;
            console.log("Party recovered at safe zone. Resuming exploration.");
        }, 3000);
    }

    checkEnemyDefeatState() {
        let allEnemiesDown = this.activeEnemies.every(enemy => enemy.hp <= 0 || enemy.isDefeated);
        if (allEnemiesDown && this.activeEnemies.length > 0) {
            this.triggerRiderFinisher();
            return true;
        }
        return false;
    }

    triggerRiderFinisher() {
        this.gameState = "FINISHER";
        console.log("All threats neutralized! Executing universal Rider Finisher...");
        
        // Brief cinematic pause before awarding XP and returning to exploration
        setTimeout(() => {
            this.activeEnemies.forEach(enemy => {
                enemy.hp = 0;
                enemy.isDefeated = true;
            });
            this.resolveCombatVictory();
        }, 2000);
    }
}