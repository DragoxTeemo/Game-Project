import { addReserve } from "../combat/weapons";

export const PlayerInventory = {
    scrap: 0,
    recipes: [],
    ammo: {
        RIFLE: 0,
        SHOTGUN: 0
    },
    ingredients: {
        /**Potato common (25%) (3% healing): (latkes (+onions (+3%)), french fries (potato only, 3% healing only), mashed potatoes (+ milk +2% healing))
         * Rice (20%):  (5% healing): fried rice (+onions (+3% healing)), rice and meat (+meat (10% healing)), sushi (fish +8%)
         * Fish (16%)
         * Meat (15%)
        */ 
    },

    unlockRecipes(recipeName) {
        if (!this.recipes.includes(recipeName)) {
            this.recipes.push(recipeName);
            return true;
        }
        return false;
    },
    addScrap(amount) {
        this.scrap += amount;
    },
    addIngredient(itemKey, quantity = 1) {
        this.ingredients[itemKey] = (this.ingredients[itemKey] || 0) + quantity;
    },
    consumeIngredient(itemKey, quantity = 1) {
        if ((this.ingredients[itemKey] || 0) >= quantity) {
            this.ingredients[itemKey] -= quantity;
            return true;
        }
        return false;
    }
};