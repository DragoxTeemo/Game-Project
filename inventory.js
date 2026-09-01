export const PlayerInventory = {
    recipes: [],

    unlockRecipes(recipeName) {
        if (!this.recipeName.includes(recipeName)) {
            this.recipes.push(recipeName);
            return true;
        }
        return false;
    }
};