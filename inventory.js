export const PlayerInventory = {
    recipes: [],

    unlockRecipes(recipeName) {
        if (!this.recipes.includes(recipeName)) {
            this.recipes.push(recipeName);
            return true;
        }
        return false;
    }
};