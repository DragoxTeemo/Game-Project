import { GameDirector } from "./GameDirector.js";

const MOVEMENT_KEYS = {
	arrowup: { x: 0, y: -1 },
	w: { x: 0, y: -1 },
	arrowdown: { x: 0, y: 1 },
	s: { x: 0, y: 1 },
	arrowleft: { x: -1, y: 0 },
	a: { x: -1, y: 0 },
	arrowright: { x: 1, y: 0 },
	d: { x: 1, y: 0 }
};

const DEFAULT_ACTION_KEYS = {
	interact: ["e", "enter", " "],
	communicate: ["c"],
	openSettings: ["escape"],
	usePower: ["q"],
	useWeapon: ["f"]
};


//GameplayController manages player movement and interaction within a defined area.
// It listens for keyboard input to move the player and interact with nearby objects. 
// The controller can be attached to a specific event target (like the window) to handle key events, 
// and it maintains a set of interactable objects that the player can interact with when in range.
export class GameplayController {
	constructor({ player = null, director = null, startPosition = { x: 0, y: 0 }, bounds = null, interactionRange = 1, onMove = () => {}, onInteract = () => {}, onCommunicate = null, onOpenSettings = null, onUsePower = null, onUseWeapon = null, actionKeys = {} } = {}) {
		this.director = director;
		player = player || director?.party?.[0];
		if (!player) {
			throw new TypeError("GameplayController requires a player.");
		}

		this.player = player;
		this.position = { ...startPosition };
		this.bounds = bounds;
		this.interactionRange = interactionRange;
		this.onMove = onMove;
		this.onInteract = onInteract;
		this.actionHandlers = { onCommunicate, onOpenSettings, onUsePower, onUseWeapon };
		this.actionKeys = Object.fromEntries(Object.entries({ ...DEFAULT_ACTION_KEYS, ...actionKeys }).map(([action, keys]) => [
			action,
			new Set((Array.isArray(keys) ? keys : [keys]).map(key => String(key).toLowerCase()))
		]));
		this.interactables = new Set();
		this.enabled = true;
		this.eventTarget = null;
		this.keyHandler = event => this.handleKeyDown(event);
	}

	attach(target = globalThis.window) {
		if (!target?.addEventListener || this.eventTarget === target) {
			return false;
		}

		this.detach();
		this.eventTarget = target;
		target.addEventListener("keydown", this.keyHandler);
		return true;
	}

	detach() {
		if (!this.eventTarget) {
			return false;
		}

		this.eventTarget.removeEventListener("keydown", this.keyHandler);
		this.eventTarget = null;
		return true;
	}
// handleKeyDown processes keyboard events to control player movement and interactions.
	handleKeyDown(event) {
		if (!this.enabled || !event?.key) {
			return false;
		}

		const key = event.key.toLowerCase();
		const direction = MOVEMENT_KEYS[key];
		if (direction) {
			event.preventDefault?.();
			return this.move(direction.x, direction.y);
		}

		if (this.actionKeys.interact?.has(key)) {
			event.preventDefault?.();
			if (!event.repeat) {
				return Boolean(this.interact());
			}
			return false;
		}

		const actions = {
			communicate: () => this.communicate(event),
			openSettings: () => this.openSettings(event),
			usePower: () => this.usePower(event),
			useWeapon: () => this.useWeapon(event)
		};
		for (const [action, run] of Object.entries(actions)) {
			if (this.actionKeys[action]?.has(key)) {
				event.preventDefault?.();
				return event.repeat ? false : Boolean(run());
			}
		}

		return false;
	}
// move updates the player's position based on the provided delta values, ensuring movement is within bounds and notifying listeners of the change.
	move(deltaX, deltaY) {
		if (!this.enabled || Math.abs(deltaX) + Math.abs(deltaY) !== 1) {
			return false;
		}

		const nextPosition = {
			x: this.position.x + deltaX,
			y: this.position.y + deltaY
		};

		if (this.bounds && (
			nextPosition.x < 0 || nextPosition.y < 0 ||
			nextPosition.x >= this.bounds.width || nextPosition.y >= this.bounds.height
		)) {
			return false;
		}

		this.position = nextPosition;
		this.player.position = { ...nextPosition };
		this.player.move?.({ ...nextPosition });
		this.onMove({ ...nextPosition }, this.player);
		return true;
	}

	registerInteractable(interactable) {
		if (!interactable || typeof interactable !== "object") {
			throw new TypeError("Interactables must be objects.");
		}

		this.interactables.add(interactable);
		return interactable;
	}

	unregisterInteractable(interactable) {
		return this.interactables.delete(interactable);
	}

	interact() {
		if (!this.enabled) {
			return null;
		}

		let nearest = null;
		let nearestDistance = Infinity;

		for (const interactable of this.interactables) {
			const position = interactable.position || interactable;
			const distance = Math.abs(position.x - this.position.x) + Math.abs(position.y - this.position.y);

			if (interactable.enabled === false || distance > this.interactionRange || distance >= nearestDistance) {
				continue;
			}

			nearest = interactable;
			nearestDistance = distance;
		}

		if (!nearest) {
			return null;
		}

		const result = nearest.interact?.(this.player, this);
		this.onInteract(nearest, this.player, result);
		return nearest;
	}

	communicate(event) {
		if (!this.enabled) {
			return false;
		}

		let nearest = null;
		let nearestDistance = Infinity;
		for (const interactable of this.interactables) {
			const position = interactable.position || interactable;
			const distance = Math.abs(position.x - this.position.x) + Math.abs(position.y - this.position.y);
			if (interactable.enabled === false || typeof interactable.communicate !== "function" || distance > this.interactionRange || distance >= nearestDistance) {
				continue;
			}
			nearest = interactable;
			nearestDistance = distance;
		}

		if (nearest) {
			const result = nearest.communicate(this.player, this);
			this.actionHandlers.onCommunicate?.(nearest, this.player, this, event, result);
			return result ?? nearest;
		}

		const handler = this.actionHandlers.onCommunicate;
		if (typeof handler === "function") {
			return handler(null, this.player, this, event) ?? true;
		}
		if (typeof this.player.communicate !== "function") {
			return false;
		}
		return this.player.communicate(this, event) ?? true;
	}

	openSettings(event) {
		return this.runAction("onOpenSettings", "openSettings", event);
	}

	usePower(event) {
		return this.runAction("onUsePower", "usePower", event);
	}

useWeapon(event) {
		if (typeof this.actionHandlers.onUseWeapon !== "function" && typeof this.director?.queuePlayerAction === "function") {
			return this.director.queuePlayerAction(this.player, this.player.equippedWeapon);
		}
		return this.runAction("onUseWeapon", "useWeapon", event);
	}

	runAction(handlerName, playerMethod, event) {
		if (!this.enabled) {
			return false;
		}

		const handler = this.actionHandlers[handlerName];
		if (typeof handler === "function") {
			return handler(this.player, this, event) ?? true;
		}

		if (typeof this.player[playerMethod] !== "function") {
			return false;
		}

		return this.player[playerMethod](this, event) ?? true;
	}
}

export function createGameplaySession(riderKeys, controllerOptions = {}) {
	const director = new GameDirector();
	director.initializeParty(riderKeys);
	const controller = new GameplayController({ ...controllerOptions, director });
	return { director, controller };
}
