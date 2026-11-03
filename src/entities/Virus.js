// Virus.js
import { Elements } from "./elements";
import { FoeArchetypes, FoeTiers, MasterFoeRegistry } from "./foeConfig"; 
import { FoeAIController } from "./foeAI.js"; 

export class Virus {
    constructor(title, archetype, tier, groupLevel, villainMana = null) {
        this.title = title;
        this.archetype = archetype; 
        this.tier = tier;           
        this.level = this.calculateScaledLevel(groupLevel, tier);

        this.faction = "villain";
        this.isDefeated = false;
        this.villainMana = villainMana; 

        this.applyArchetypeScaling();
        this.applyElementalProfile();
        this.xpReward = this.calculateStaticXpReward();
    }

    calculateScaledLevel(groupLevel, tier) {
        let tierBonus = { 
            [FoeTiers.RED]: 0, 
            [FoeTiers.BLUE]: Math.floor(groupLevel * 0.2), 
            [FoeTiers.BLACK]: Math.floor(groupLevel * 0.3),
            [FoeTiers.SILVER]: Math.floor(groupLevel * 0.5)
        }[tier] || 0;
        return Math.min(99, Math.max(1, groupLevel + tierBonus));
    }

    applyArchetypeScaling() {
        const entry = MasterFoeRegistry[this.archetype] || MasterFoeRegistry[FoeArchetypes.VIRION];
        const tierData = entry.tiers[this.tier] || entry.tiers[FoeTiers.RED];
        let mod = entry.baseStats;
        let tierMult = tierData.tierMult;

        this.maxHP = Math.floor((30 + (this.level * 5.5)) * mod.hp * tierMult);
        this.hp = this.maxHP;

        this.strength = Math.floor((4 + (this.level * 0.55)) * mod.str * tierMult);
        this.defense  = Math.floor((4 + (this.level * 0.50)) * mod.def * tierMult);
        this.magic    = Math.floor((4 + (this.level * 0.50)) * mod.mag * tierMult);
        this.ward     = Math.floor((4 + (this.level * 0.45)) * mod.wrd * tierMult);
        this.speed    = Math.floor((5 + (this.level * 0.60)) * mod.spd * tierMult);
    }
    
    calculateStaticXpReward() {
        const entry = MasterFoeRegistry[this.archetype] || MasterFoeRegistry[FoeArchetypes.VIRION]; 
        const tierData = entry.tiers[this.tier] || entry.tiers[FoeTiers.RED];

        const archetypeMultipliers = {
            [FoeArchetypes.VIRION]: 1.0,
            [FoeArchetypes.CYTOPATH]: 1.2,
            [FoeArchetypes.AIRBORNE]: 1.5
        };

        let multiplier = archetypeMultipliers[this.archetype] || 1.0;
        let randomBase = Math.floor(Math.random() * (tierData.xpMax - tierData.xpMin + 1)) + tierData.xpMin;
        return Math.floor(randomBase * multiplier);
    }

    applyElementalProfile() {
        const entry = MasterFoeRegistry[this.archetype] || MasterFoeRegistry[FoeArchetypes.VIRION];
        const tierData = entry.tiers[this.tier] || entry.tiers[FoeTiers.RED];

        this.weaknesses = tierData.profile.weak;
        this.resistances = tierData.profile.resist;
        this.immunities = tierData.profile.immune;
    }

    evaluateElementalEffect(incomingElement) {
        if (this.immunities.includes(incomingElement)) {
            return {type: "IMMUNE", multiplier: 0.0, message: "Blocked"};
        }
        if (this.resistances.includes(incomingElement)) {
            return {type: "RESIST", multiplier: 0.5, message: "Resisted" };
        }
        if (this.weaknesses.includes(incomingElement)) {
            return {type: "WEAK", multiplier: 1.5, message: "Weak"};
        }
        return {type: "NORMAL", multiplier: 1.0, message: ""};
    }
    
    // Delegates choice calculation to our modular FoeAIController
    chooseAction(party, allies, availableActions) {
        return FoeAIController.chooseAction(this, party, allies, availableActions);
    }
}