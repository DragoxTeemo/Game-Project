// Virus.js
import { FoeArchetypes, FoeTiers, MasterFoeRegistry } from "../data/foeConfig.js";
import { FoeAIController } from "../combat/FoeAI.js";
import { movementBudget } from "../combat/Pathfinding.js";
 
export class Virus {
    constructor(title, archetype, tier, groupLevel) {
        this.title = title;
        this.archetype = archetype;
        this.tier = tier;
        this.level = this.calculateScaledLevel(groupLevel, tier);
 
        this.faction = "villain";
        this.isDefeated = false;
        this.isImmuneToMud = false;
        this.x = 0; // tile coordinates, set by placeUnits()
        this.y = 0;
 
        this.applyArchetypeScaling();
        this.applyElementalProfile();
        this.xpReward = this.calculateStaticXpReward();
    }
    get movePoints() { 
        return movementBudget(this.speed); 
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
    
    _tierData() {
        const entry = MasterFoeRegistry[this.archetype] || MasterFoeRegistry[FoeArchetypes.VIRION];
        return {
            entry, tierData: entry.tiers[this.tier] || entry.tiers[FoeTiers.RED]
        }
    }

    applyArchetypeScaling() {
        const { entry, tierData } = this._tierData();
        const mod = entry.baseStats, m = tierData.tierMult;
        this.maxHp = Math.floor((30 + this.level * 5.5) * mod.hp * m);
        this.maxHP = this.maxHp; // legacy alias; remove once nothing reads it
        this.hp = this.maxHp;
        this.strength = Math.floor((4 + this.level * 0.55) * mod.str * m);
        this.defense  = Math.floor((4 + this.level * 0.50) * mod.def * m);
        this.magic    = Math.floor((4 + this.level * 0.50) * mod.mag * m);
        this.ward     = Math.floor((4 + this.level * 0.45) * mod.wrd * m);
        this.speed    = Math.floor((5 + this.level * 0.60) * mod.spd * m);
    }
    
    calculateStaticXpReward() {
        const { tierData } = this._tierData();
        const mult = {
            [FoeArchetypes.VIRION]: 1.0,
            [FoeArchetypes.AIRBORNE]: 1.2,
            [FoeArchetypes.CYTOPATH]: 1.5
        }[this.archetype] || 1.0;
        const base = Math.floor(Math.random() * (tierData.xpMax - tierData.xpMin + 1)) + tierData.xpMin;
        return Math.floor(base * mult);
    }

    applyElementalProfile() {
        const { profile } = this._tierData().tierData;
        this.weaknesses = profile.weak;
        this.resistances = profile.resist;
        this.immunities = profile.immune;
    }

    evaluateElementalEffect(el) {
        if (this.immunities.includes(el))  return { type: "IMMUNE", multiplier: 0.0, message: "Blocked" };
        if (this.resistances.includes(el)) return { type: "RESIST", multiplier: 0.5, message: "Resisted" };
        if (this.weaknesses.includes(el))  return { type: "WEAK",   multiplier: 1.5, message: "Weak" };
        return { type: "NORMAL", multiplier: 1.0, message: "" };
    }
    
    takeTurn(ctx) { return FoeAIController.takeTurn(this, ctx); }
}