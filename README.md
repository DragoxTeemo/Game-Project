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
Character level scaling follows a cubic polynomial floor function: stat(x) = ⌊ax^3 + bx^2 + cx⌋

Where x represents the character level milestone, and the floor operation guarantees clean integers:
- Coefficient a: Late-game scaling curve around level 50-100.
- Coefficient b: Mid-game scaling curve after the tutorial.
- Coefficient c: Early Game scaling.

## Campfire Economy:
Resting at campfires provides dynamic, group-level recovery and logistical preparation:
- Rest Recovery: Restores a percentage of HP and Mana scaling dynamically with the active party's average level.
- Ammo Crafting (Alice & Rebecca): Alice utilizes downtime to craft ammunition for Rebecca, scaled by character mastery tiers:
  - Rifle Ammo: Baseline yield of 8–10 rounds, scaling upward with mastery rank.
  - Shotgun Ammo: Baseline yield of 3–4 shells, scaling upward with mastery rank.
 
 ## Combat & Modifiers:
 - Rider Finishers: Triggered automatically when all active threats are knocked down. The character responsible for the final knockdown executes a cinematic finisher dealing massive localized damage, clearing remaining foes to accelerate pacing and prevent combat drag.
 - Line of Sight & Targeting: Utilizes Bresenham's algorithm to compute grid-based raycasts, evaluating flat cover penalties for ranged physical attacks (e.g., BlazE and Echo's Range Form).

## Dialogue: 
DOM-Based Engine: Manages narrative overlays, dynamic character quotes, and story pacing, serving as the bridge between visual novel segments and tactical gameplay.

# 4-Month Development Roadmap (MoSCoW)
- Month 1–2 (Must-Have): Core Functional Loop
  - Player movement and basic grid/AABB collision.
  - Macro map generation + BFS accessibility validation.
  - Micro map rendering (15x15 action rooms vs. 7x7 safe rooms).
  - Basic enemy AI (Zelda-style tracking/movement) and XP drops.
  - Game state manager (Title → Macro Map → Micro Room → Game Over).
  - Base form implementation for active characters & 3-active / 3-bench roster loop.
- Month 3 (Should-Have): Polish & Identity
  - DOM-based text boxes for Alice's dialogue pools (3+ lines) and visual novel hub.
  - Kamen Rider-inspired static hero art and high-contrast enemy sprites.
  - Canvas juice (screen shakes, hit flashes, cone particle effects, radial campfire lighting, chest open shine effect).
  - Campfire crafting UI (ammo/potion loop using 5-part conversion rules and recipe tracking).
- Month 4 (Could-Have): Expansion
  - Campfire interaction mechanics (talking with companions during rest, unlocking recipes).
  - Mini-boss implementation at fixed macro-node milestones.
  - Walking/attack animation frames for hero and enemy sprites.
- Strictly Out of Scope (Won't-Have):
  - Isometric sorting, voice acting, complex branching dialogue trees, dynamic lighting engines, infinite/endless scrolling modes, or 16 individual fully unique form sub-engines (relying on base forms and shared modular logic instead).
