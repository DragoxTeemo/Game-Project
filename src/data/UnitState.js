// Single definition of "still in the fight". 
export const isAlive = u => !!u && u.hp > 0 && !u.isDefeated;