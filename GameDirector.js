import { MaskedRiderRegistry } from "./riderConfig";
import { MaskedRider } from "./MaskedRider";
import { EncounterDirector, calculateGroupAverageLevel, distributeAdjustedEXP } from "./EncounterDirector";

export class GameDirector {
    constructor() {
        this.party = [];
        this.activeEnemies = [];
        this.sharedMana = 100; 
        this.maxSharedMana = 100;
        this.currentGroupLevel = 1; 
        this.gameState = "MAP_EXPLORATION"; // MAP_EXPLORATION, COMBAT, CUTSCENE
    }

    initializeParty(riderKeys) {
        this.party = riderKeys.map(key => {
            let registryData = MaskedRiderRegistry[key];
            return new MaskedRider(key, registryData);
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
        this.updateGroupLevel();

        this.activeEnemies = EncounterDirector.generateRoomEncounter(this.currentGroupLevel);

        console.log(`Combat initiated! Group Level: ${this.currentGroupLevel}`, this.activeEnemies.map(e => `${e.tier} ${e.archetype} (Lvl ${e.level})`));
    }

    resolveCombatVictory() {
        if (this.activeEnemies.length === 0) return;
        let totalXpPool = this.activeEnemies.reduce((sum, enemy) => sum + (enemy.xpReward || 0), 0);    

        distributeAdjustedEXP(this.party, totalXpPool);
        
        console.log(`Victory! Distributed total pool of ${totalXpPool} XP across party.`);

        this.activeEnemies = [];
        this.gameState = "MAP_EXPLORATION";
        this.updateGroupLevel();
    }
    checkPartyDefeatState() {
        let allUnconscious = this.party.every(rider => rider.hp <= 0 || rider.isDefeated);
        if (allUnconscious) {
            this.triggerRescueCutscene();
        }
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
            console.log("Party recovered at safe zone. Resuming exploration.");
        }, 3000);
    }

    consumeSharedMana(amount) {
        if (this.sharedMana >= amount) {
            this.sharedMana -= amount;
            return true;
        }
        console.warn("Insufficient shared mana for action!");
        return false;
    }

    regenerateSharedMana(amount) {
        this.sharedMana = Math.min(this.maxSharedMana, this.sharedMana + amount);
    }
    checkEnemyDefeatState() {
        let allEnemiesDown = this.activeEnemies.every(enemy => enemy.hp <= 0 || enemy.isDefeated);
        if (allEnemiesDown && this.activeEnemies.length > 0) {
            this.triggerRiderFinisher();
        }
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