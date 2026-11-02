export class CraftingSystem {
    static getCraftingRecipes() {
        return {
            RIFLE_AMMO: { name: "Rifle Rounds", baseYield: 8, scrapCost: 20 },
            SHOTGUN_SHELL: { name: "Shotgun Shells", baseYield: 3, scrapCost: 35 }
        };
    }

    static getStarDiceSides(level) {
        if (level >= 75) return 12; // d12 (Level 75-99)
        if (level >= 50) return 10; // d10 (Level 50-74)
        if (level >= 25) return 8;  // d8  (Level 25-49)
        return 6;                   // d6  (Level 1-24)
    }

    static cooperativeCrafting(recipeKey, blazE, star, currentScrapPool) {
        let recipe = this.getCraftingRecipes()[recipeKey];
        if (!recipe || currentScrapPool < recipe.scrapCost) {
            return { success: false, yieldedAmmo: 0, remainingScrap: currentScrapPool };
        } 

        let blazeBonus = Math.floor(blazE.level / 10);
        let diceSides = this.getStarDiceSides(star.level);
        let starRoll = Math.floor(Math.random() * diceSides) + 1;
        let starBonus = Math.floor(starRoll/3);

        let totalYield = recipe.baseYield + blazeBonus + starBonus;

        return {
            success: true,
            yieldedAmmo: totalYield,
            remainingScrap: currentScrapPool - recipe.scrapCost,
            breakdown: {base: recipe.baseYield, blazeAdded: blazeBonus, diceUsed: `d${diceSides}`, starRoll: starRoll, starAdded: starBonus}
        };
    }
    
}