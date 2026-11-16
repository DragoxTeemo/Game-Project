export class CraftingSystem {
    static getCraftingRecipes() {
        return {
            // Ammo Recipes
            RIFLE_AMMO: { type: "AMMO", name: "Rifle Rounds", baseYield: 8, scrapCost: 20, target: "RIFLE" },
            SHOTGUN_SHELL: { type: "AMMO", name: "Shotgun Shells", baseYield: 3, scrapCost: 35, target: "SHOTGUN" },
            
            // Future Food Recipes Example
            HEALING_STEW: { 
                type: "FOOD", 
                name: "Vitality Stew", 
                scrapCost: 10, 
                ingredientsRequired: { MUSHROOM: 2, HERB: 1 },
                effect: { hpHeal: 50 } 
            }
        };
    }

    static getStarDiceSides(level) {
        if (level >= 75) return 12;
        if (level >= 50) return 10;
        if (level >= 25) return 8;
        return 6;
    }

    /**
     * Universal crafting dispatcher handling both combat ammo and food recipes.
     */
    static executeCrafting(recipeKey, inventory, blazeArsenal = null, blazE = null, star = null) {
        const recipes = this.getCraftingRecipes();
        const recipe = recipes[recipeKey];

        if (!recipe) return { success: false, message: "Unknown recipe." };

        // Validate Scrap Cost
        if (inventory.scrap < recipe.scrapCost) {
            return { success: false, message: "Not enough scrap." };
        }

        //  Validate Ingredient Costs (if it's food or advanced gear)
        if (recipe.ingredientsRequired) {
            for (const [item, qty] of Object.entries(recipe.ingredientsRequired)) {
                if ((inventory.ingredients[item] || 0) < qty) {
                    return { success: false, message: `Missing ingredient: ${item}` };
                }
            }
        }

        // Deduct Scrap & Ingredients
        inventory.scrap -= recipe.scrapCost;
        if (recipe.ingredientsRequired) {
            for (const [item, qty] of Object.entries(recipe.ingredientsRequired)) {
                inventory.consumeIngredient(item, qty);
            }
        }

        // Handle AMMO crafting (uses BlazE & Star cooperative scaling)
        if (recipe.type === "AMMO") {
            let blazeBonus = Math.floor(blazE.level / 10);
            let diceSides = this.getStarDiceSides(star.level);
            let starRoll = Math.floor(Math.random() * diceSides) + 1;
            let starBonus = Math.floor(starRoll / 3);
            let totalYield = recipe.baseYield + blazeBonus + starBonus;

            // Wire into arsenal and inventory tracking
            if (blazeArsenal && blazeArsenal[recipe.target]) {
                blazeArsenal[recipe.target] = addReserve(blazeArsenal[recipe.target], totalYield);
            }
            inventory.ammo[recipe.target] = (inventory.ammo[recipe.target] || 0) + totalYield;

            return {
                success: true,
                type: "AMMO",
                yielded: totalYield,
                breakdown: { base: recipe.baseYield, blazeAdded: blazeBonus, diceUsed: `d${diceSides}`, starRoll, starAdded: starBonus }
            };
        }

        // Handle FOOD crafting
        if (recipe.type === "FOOD") {
            // Add cooked food item to inventory or apply effect
            return {
                success: true,
                type: "FOOD",
                message: `Successfully cooked ${recipe.name}!`
            };
        }

        return { success: false, message: "Invalid recipe type." };
    }
}