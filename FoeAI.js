const FoeArchetypes = {
    VIRION: "Virions",
    CYTOPATH: "Cytopaths",
    AIRBORNE: "Airbornes"
};

const player = {
    x : 340,
    y: 300,
    isAttacking: false,
    attackType: null

}

const visualRanges = {
    [FoeArchetypes.VIRION]: 80,
    [FoeArchetypes.CYTOPATH]: 80,
    [FoeArchetypes.AIRBORNE]: 200
};

export class FoeAI {
    constructor(archetype) {
        this.archetype = archetype;
        this.visualRange = visualRanges[archetype] ?? visualRanges[FoeArchetypes.VIRION];
        this.rangedRange = archetype === FoeArchetypes.AIRBORNE ? 150 : Infinity;
        this.magazineSize = archetype === FoeArchetypes.AIRBORNE ? 3 : Infinity;
        this.ammo = this.magazineSize;
        this.reloadTurns = 0;
        this.state = "GUARDING";
    }

    canTakeTurn() {
        if (this.reloadTurns <= 0) {
            return true;
        }

        this.reloadTurns -= 1;
        if (this.reloadTurns === 0) {
            this.ammo = this.magazineSize;
        }
        this.state = "RELOADING";
        return false;
    }

    getVisibleTargets(observer, targets) {
        const visibleTargets = targets.filter(target => {
            if (!target || target.isVisible === false) {
                return false;
            }

            const observerPosition = observer?.position ?? observer;
            const targetPosition = target.position ?? target;
            const hasCoordinates = Number.isFinite(observerPosition?.x)
                && Number.isFinite(observerPosition?.y)
                && Number.isFinite(targetPosition?.x)
                && Number.isFinite(targetPosition?.y);

            if (!hasCoordinates) {
                return true;
            }

            const dx = targetPosition.x - observerPosition.x;
            const dy = targetPosition.y - observerPosition.y;
            return Math.hypot(dx, dy) <= this.visualRange;
        });

        this.state = visibleTargets.length > 0 ? "ATTACKING" : "GUARDING";
        return visibleTargets;
    }

    getAttackableTargets(observer, targets) {
        if (this.archetype !== FoeArchetypes.AIRBORNE) {
            return targets;
        }

        const observerPosition = observer?.position ?? observer;
        const attackableTargets = targets.filter(target => {
            const targetPosition = target.position ?? target;
            const hasCoordinates = Number.isFinite(observerPosition?.x)
                && Number.isFinite(observerPosition?.y)
                && Number.isFinite(targetPosition?.x)
                && Number.isFinite(targetPosition?.y);

            if (!hasCoordinates) {
                return true;
            }

            return Math.hypot(
                targetPosition.x - observerPosition.x,
                targetPosition.y - observerPosition.y
            ) <= this.rangedRange;
        });

        if (targets.length > 0 && attackableTargets.length === 0) {
            this.state = "CHASING";
        }
        return attackableTargets;
    }

    recordSuccessfulAttack() {
        if (this.archetype !== FoeArchetypes.AIRBORNE) {
            return;
        }

        this.ammo -= 1;
        if (this.ammo <= 0) {
            this.reloadTurns = 1;
            this.state = "RELOADING";
        }
    }
}

const antagonist = {
        x : 100,
        y : 100,
        guardX: 100,
        guardY: 100,
        speed: 2.5,
        archetype: FoeArchetypes.AIRBORNE,
        state: 'GUARDING',

    attackRange: 40,
    rangedRange: 150,
    magazineSize: 3,
    ammo: 3,

    health: 100,
    counterChance: 6.0,
    cooldowns: {
        attack: 0,
        counter: 0,
        reload: 0
    }
};


function updateAntagonistAI (deltaTime, hasLineOfSight = true){

    if (antagonist.cooldowns.attack > 0) antagonist.cooldowns.attack -= deltaTime;
    if (antagonist.cooldowns.counter > 0) antagonist.cooldowns.counter -= deltaTime;
    if (antagonist.cooldowns.reload > 0) antagonist.cooldowns.reload -= deltaTime;

    const dx = player.x - antagonist.x;
    const dy = player.y - antagonist.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    const visualRange = visualRanges[antagonist.archetype] ?? 80;
    const canSeePlayer = hasLineOfSight && distanceToPlayer <= visualRange;

if (canSeePlayer && player.isAttacking && distanceToPlayer <= antagonist.attackRange && antagonist.cooldowns.counter <= 0) {
        if (Math.random() < antagonist.counterChance) {
            antagonist.state = 'COUNTERING';
            executeCounterAttack();
            return;
        }
    }


     switch (antagonist.state) {
        case 'GUARDING':
            // Move back to guard station if away
            moveTowards(antagonist.guardX, antagonist.guardY);
            
            // Spot player trigger
            if (canSeePlayer) {
                antagonist.state = 'CHASING';
            }
            break;

        case 'CHASING':
            if (!canSeePlayer) {
                antagonist.state = 'GUARDING';
                break;
            }

            if (antagonist.archetype === FoeArchetypes.AIRBORNE) {
                if (distanceToPlayer > antagonist.rangedRange) {
                    moveTowards(player.x, player.y);
                } else {
                    antagonist.state = 'ATTACKING';
                }
                break;
            }

            // Target and approach player
            moveTowards(player.x, player.y);
            
            // Loose sight trigger
            if (distanceToPlayer <= antagonist.attackRange) {
                antagonist.state = 'ATTACKING';
            }
            break;

        case 'ATTACKING':
            if (antagonist.archetype === FoeArchetypes.AIRBORNE) {
                if (!canSeePlayer) {
                    antagonist.state = 'GUARDING';
                } else if (distanceToPlayer > antagonist.rangedRange) {
                    antagonist.state = 'CHASING';
                } else if (antagonist.ammo <= 0) {
                    antagonist.state = 'RELOADING';
                    antagonist.cooldowns.reload = 1500;
                } else if (antagonist.cooldowns.attack <= 0) {
                    executeRangedAttack();
                }
                break;
            }

            if (distanceToPlayer > antagonist.attackRange) {
                // Player moved out of strike distance, chase again
                antagonist.state = 'CHASING';
            } else if (antagonist.cooldowns.attack <= 0) {
                executeStandardAttack();
            }
            break;

        case 'RELOADING':
            if (antagonist.cooldowns.reload <= 0) {
                antagonist.ammo = antagonist.magazineSize;
                antagonist.state = canSeePlayer ? 'CHASING' : 'GUARDING';
            }
            break;
            
        case 'COUNTERING':
            // Handled immediately above; reset state smoothly after execution
            antagonist.state = 'CHASING';
            break;
    }
}

function moveTowards(targetX, targetY){
    const dx = targetX - antagonist.x;
    const dy = targetY - antagonist.y;
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance>2){
        antagonist.x += (dx/distance) * antagonist.speed;
        antagonist.y += (dy/distance) * antagonist.speed;
    }

}

function executeStandardAttack () {
    console.log ();
    antagonist.cooldowns.attack = 1000;

}

function executeRangedAttack() {
    console.log("Airborne fires at the player!");
    antagonist.ammo -= 1;
    antagonist.cooldowns.attack = 1000;
    if (antagonist.ammo <= 0) {
        antagonist.state = 'RELOADING';
        antagonist.cooldowns.reload = 1500;
    }
}

// Execute the counter attack

function executeCounterAttack() {
    console.log("Antagonist PARRIED and executed a Counter-Attack!");
    antagonist.cooldowns.counter = 2000; // Prevent counter-spamming
    antagonist.cooldowns.attack = 500;   // Briefly reset main swing loop
    
    // Usually inflicts amplified dynamic damage or hit-stun on player
}
