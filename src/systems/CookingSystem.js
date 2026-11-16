/**
 * Ingredient Definitions with base drop rates and inherent healing percentages.
 */
export const Ingredients = {
    POTATO: { name: "Potato", category: "BASE", dropRate: 0.25, baseHealing: 0.03 },
    RICE: { name: "Rice", category: "BASE", dropRate: 0.20, baseHealing: 0.05 },
    FISH: { name: "Fish", category: "BASE", dropRate: 0.16, baseHealing: 0.08 },
    MEAT: { name: "Meat", category: "BASE", dropRate: 0.15, baseHealing: 0.10 },
    MILK: { name: "Milk", category: "FLAVOR", dropRate: 0.10, baseHealing: 0.02 },
    ONION: { name: "Onion", category: "FLAVOR", dropRate: 0.14, baseHealing: 0.01 }
};

/**
 * Curated 2-Ingredient Recipes yielding specialized bonuses and higher healing.
 */
export const CraftedRecipes = {
    "POTATO_ONION": { name: "Latkes", healing: 0.06, description: "Crispy potato pancakes with onion." },
    "POTATO_POTATO": { name: "French Fries", healing: 0.03, description: "Simple, salted potato strips." },
    "POTATO_MILK": { name: "Mashed Potatoes", healing: 0.05, description: "Creamy comfort food." },
    "RICE_ONION": { name: "Fried Rice", healing: 0.08, description: "Savory seasoned rice." },
    "RICE_MEAT": { name: "Rice and Meat", healing: 0.15, description: "A hearty, protein-packed meal." },
    "RICE_FISH": { name: "Sushi", healing: 0.13, description: "Fresh fish draped over seasoned rice." }
};

export class CookingSystem {
    /**
     * Attempts to cook two ingredients together.
     * Order-independent sorting ensures "POTATO_ONION" matches "ONION_POTATO".
     */
    static cook(ingredientKey1, ingredient2Key) {
        const item1 = Ingredients[ingredientKey1];
        const item2 = Ingredients[ingredient2Key];

        if (!item1 || !item2) {
            return { success: false, message: "Invalid ingredients provided." };
        }

        // Sort keys alphabetically to standardize pairing checks
        const recipeKey = [ingredientKey1, ingredient2Key].sort().join("_");
        
        // 1. Check if a curated recipe exists
        if (CraftedRecipes[recipeKey]) {
            const recipe = CraftedRecipes[recipeKey];
            return {
                success: true,
                isSpecial: false,
                name: recipe.name,
                healingPercent: recipe.healing,
                description: recipe.description
            };
        }

        // 2. Fallback: "Cody's Special" for unvetted or weird edge-case pairs (e.g., Milk + Onion)
        const combinedHealing = Number((item1.baseHealing + item2.baseHealing).toFixed(2));
        return {
            success: true,
            isSpecial: true,
            name: "Cody's Special",
               healingPercent: combinedHealing,
            description: `An experimental mixture of ${item1.name} and ${item2.name}. Edible, but questionable.`
        };
    }
}