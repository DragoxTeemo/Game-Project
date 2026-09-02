# Between Worlds: Digital Paradise - The Game
A narrative-driven, top-down pixel art dungeon crawler blending deep strategic party composition, high-skill execution mechanics, and a character-focused visual novel narrative.

## Game Overview
Players command a roster of six characters, deploying an active combat party while the remaining members sit on the bench. After every second round, the bench party performs supportive actions that directly benefit the active team as they navigate a two-tiered, procedurally generated world.
- **Macro-Level Node Map:** Players explore a randomized node network branching out from the main hub. Each node encounter introduces strategic choices, including combat encounters, rest campfires, and reward chests. All maps are algorithmically validated to guarantee complete path accessibility before generation.
- **Macro-Level Terrain Generation:** Action spaces feature dynamic micro-grids—such as expansive 15x15 combat rooms versus tight 7x7 safe zones—populated with environmental hazards and tactical barriers.

# Roster & Character Systems
- **The Roster Loop:** 3 Active Combatants + 3 Bench Support. Active units gain full XP, while benched characters perform automated passive support/buffs and earn 30–50% XP (available in late development).
- **Active-Input Playstyle:**
  - **Cody (Echo):** Kamen Rider Kuuga/W hybrid featuring a 16-form element-swap mechanic. His forms serve as built-in tutorials for team mechanics and copy ally actions with added elemental damage scaling.
  - **Ethan (Ace):** Employs a drag-slider minigame for heavy Titan Greatsword swings and terrain destruction (clears breakable scrap).
  - **Rebecca (BlazE):** Relies on percentage-based sharpshooting, impacted by cover modifiers (e.g., -10% accuracy when targets are behind scrap).
  - **Kira (Rose):** Requires precision timing windows (Undertale/Deltarune style) for dagger and whip combos.
  - **JJ (Strike):** Centers on rapid combo execution via spam-clicking.
  - **Alice (Star):** Leverages stat-altering form shifts (mystic changes affecting spells and stats modeled after teammates) and status-altering form shifts.


# Game Narrative & Script Architecture
## Visual Novel Opening Act
The game begins with a character-focused narrative framework starting with the opening hook line: "High school is over... What should I do?

### Opening Choice Nodes (Hub Options):
- Visit Ethan
- Visit Rebecca
- Visit Kira
- Visit JJ
- (Call Alice)
- Go to the Digital World

Going to the Digital World skips character dialogue. Allowing players the freedom to play however they want.


### Tone Note & Dialogue Dynamics
The narrative features a dry sarcasm philosophy: there is no strict "evil/rude" route, and hostile dialogue choices are interpreted by the cast as dry wit rather than genuine malice.

### Campfire Character Dialogue
When entering a campfire, the player can save their game.
When resting in the campfire, the player has the option to interact with characters as another mean to learn more of the characters or leave and continue playing.


# Core Systems & Technical Architecture
## Level Scaling Formula
Character level scaling follows a cubic polynomial floor function: level x = ax^3 + bx^2 + cx
