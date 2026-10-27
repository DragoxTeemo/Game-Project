/**
 * ---------------------------------------------------------------------------
 * GAME NARRATIVE & SCRIPT ARCHITECTURE
 * ---------------------------------------------------------------------------
 * 
 * [CONTEXT]
 * Can be integrated into either the campfire dialogue system or the visual 
 * novel opening act. The VN introduction establishes the world-building tone 
 * starting with the hook line: "High school is over... What should I do?"
 * 
 * [OPENING CHOICE NODES (Visual Novel Intro)]
 * Player is presented with the following hub options:
 * - Visit Ethan
 * - Visit Rebecca
 * - Visit Kira
 * - Visit JJ
 * - (Call Alice)
 * - Go to Digital World Today
 * 
 * ---------------------------------------------------------------------------
 * CAMPFIRE CHARACTER MOMENTS (Optional/Conditional Flag)
 * ---------------------------------------------------------------------------
 * 
 * [SCENE: Rebecca & Alice Crafting Bullets]
 * Alice: "Say, is this legal to do back in Georgia?"
 * Rebecca:   "Oy gevalt, I'm 16, my grandma would kill me if she sees me 
 *           anywhere near a gun."
 * Alice: "Wait but you fight monsters, why are you afraid of your grandma?"
 * Rebecca: "It's not she's scary, I just don't like seeing her...disappointed."
 * 
 * [SCENE: Kira & JJ Sibling Conversation]
 * Kira:    Asks JJ what it's like to have siblings.
 * JJ:      Explains he has 2 older brothers, 1 older sister, and a younger sister.
 * Kira:    *Shakes her head, unable to imagine living with that much chaos.*
 * 
 * [SCENE: Ethan & Alice Heart-to-Heart]
 * Ethan:   "So... you're Alice?"
 * Alice:   "It's so confusing. The real Alice died 7 years ago when she was 7. 
 *           I'm a reconstruction of her, but I don't have all her memories."
 * Ethan:   "Well, don't let your 'dad' tell you what you are. You are yourself 
 *           and Star."
 * Alice:   "Yeah, I am." [Trigger: Alice sprite smiles]
 * 
 * ---------------------------------------------------------------------------
 * DIGITAL WORLD TRANSITION & DIALOGUE SUB-SYSTEM
 * ---------------------------------------------------------------------------
 * 
 * [TONE NOTE]
 * There is no strict "evil/rude" route; hostile choices are interpreted 
 * by the cast as dry sarcasm rather than genuine malice.
 * 
 * [PROMPT: Ethan Departure]
 * Ethan: "Ready for the Digital World?"
 * 
 * Option A: "Hell yeah!" 
 *   -> Ethan Response: "Let's go!"
 * Option B: "What do you think?" 
 *   -> Ethan Response: "Man, you're pumped!"
 * 
 * [WORLD-BUILDING VIGNETTES (Character Check-ins)]
 * 
 * Cody -> Rebecca:
 *   Cody: "What's up with you?"
 *   Rebecca: "My brother is still in recovery after being turned into a Virus. 
 *             I hope he's fine. Never mind that, I think I need to clear my 
 *             head by shooting the Viruses."
 * 
 * Cody -> Kira:
 *   Cody: "You holding up?"
 *   Kira: "Well, I have Office Aid in the morning, then drive to SU 
 *          (Swiftview Uni) for my quiz... and I have violin practice. 
 *          So yes, I'm holding up."
 * 
 * JJ (Age 10) -> Cody:
 *   JJ: "Cody! Let's get ready to go!"
 *   Cody: "Don't slow down when we're fighting."
 * 
 * Ethan -> Cody:
 *   Ethan: "I need to capture some photographs..."
 *   Cody: "What's happening?"
 *   Ethan: "The newspaper club needs me to capture photos of us or 
 *           monsters again..."
 * 
 * 
 * JJ -> Rebecca and Kira:
 *  JJ: "Woah is that sushi?"
 *  Kira: "This is Gimbap, sushi is fish, my gimbap has beef."
 *  Rebecca: "It's sooo good, I remember trying it for the first time, it was addicting!"
 *  Kira: "Not as addicting as your Bubbe's latkes. I typically use pork, but I wanted to make some for Rebecca to eat."
 *  
 * Kira -> Cody (Rebecca Joins):
 *  "Cody you want to learn the recipie to make gimbap? It's not too hard."
 *  "Dude, if you can replicate my Bubbe's latkes, that would be awesome."
 *  <print text: [Cody has unlocked the recipe to make Gimbap] 
 *              [Cody has unlocked the recipie to make Latkes]
 * TODO: Add text notification -> [Cody has unlocked recipe to make x]
 * TODO: Continuing after defeat: e.g. "I won't mess up this time."
 * TODO: Preparing to enter the dungeon entry for the first time: "Let us begin", "Let's do this!"
 * 
 * ---------------------------------------------------------------------------
 */
// Colors follow each Rider's element (Ace = Ice, BlazE = Lightning, etc.)
// Sprites for character art
export const Characters = {
    Cody:    { codename: "Echo",   color: "#000000", sprites: {} },
    Ethan:   { codename: "Ace",    color: "#4ea8de", sprites: {} },
    Rebecca: { codename: "BlazE",  color: "#ffb703", sprites: {} },
    Kira:    { codename: "Rose",   color: "#ff4500", sprites: {} },
    JJ:      { codename: "Strike", color: "#38b000", sprites: {} },
    Alice:   { codename: "Star",   color: "#7209b7", sprites: {} },
};

// Swap color for image once backgrounds exist
export const Backgrounds = {
    school_gate:   { color: "#1f2a44", label: "Swiftview High, front gate (afternoon)" },
    phone_call:    { color: "#1a1530", label: "Phone call" },
    meetup:        { color: "#13213a", label: "The usual meetup spot" },
};

// Hub options disappear once visited; this checks whether all five are done
const visitedEveryone = (f) =>
    f.visited_ethan && f.visited_rebecca && f.visited_kira && f.visited_jj && f.visited_alice;

export const Scenes = {
    /* ===================================================================== */
    /*  OPENING                                                              */
    /* ===================================================================== */
    intro_opening: [
        { bg: "school_gate" },
        { text: "The last bell of the day rings out across Swiftview High." },
        { show: "Cody", pos: "center" },
        { speaker: "Cody", text: "High school is over... What should I do?" },
        { speaker: "Cody", text: "The Digital World isn't going anywhere. Probably." },
        { speaker: "Cody", text: "Maybe I should check in on everyone first." },
        { hide: "Cody" },
        { goto: "intro_hub" },
    ],

    intro_hub: [
        { bg: "school_gate" },
        { if: visitedEveryone, text: "That's everyone. Time to head out." },
        {
            prompt: "Where to?",
            choice: [
                { text: "Visit Ethan",   if: "!visited_ethan",   goto: "visit_ethan" },
                { text: "Visit Rebecca", if: "!visited_rebecca", goto: "visit_rebecca" },
                { text: "Visit Kira",    if: "!visited_kira",    goto: "visit_kira" },
                { text: "Visit JJ",      if: "!visited_jj",      goto: "visit_jj" },
                { text: "Call Alice",    if: "!visited_alice",   goto: "visit_alice" },
                { text: "Go to the Digital World", goto: "intro_departure" },
            ],
        },
    ],

    /* ===================================================================== */
    /*  VISITS                                                               */
    /* ===================================================================== */
    visit_ethan: [
        { bg: "school_gate" },
        { show: "Ethan"},
        { speaker: "Ethan", text: "Cody! Perfect timing. Which one of these is less blurry?" },
        { text: "Every photo is a smear of claws and static. One of them might be a Virus. One of them might be a thumb." },
        {
            choice: [
                {
                    text: "The second one, I guess?",
                    then: [
                        { speaker: "Ethan", text: "That's what I said! The editor said it looks like a smudge with anger issues." },
                    ],
                },
                {
                    text: "They're all garbage.",
                    then: [
                        { speaker: "Ethan", text: "Wow. Brutal." },
                        { speaker: "Ethan", text: "...Accurate, but brutal. You try framing a shot while something's trying to eat you." },
                    ],
                },
            ],
        },
        { speaker: "Ethan", text: "The club wants real footage of the Digital World. Like I can just ask the monsters to hold still." },
        { speaker: "Ethan", text: "Whatever. If we're heading in later, I'm bringing the good camera. And a better strap. RIP the last one." },
        { set: { visited_ethan: true } },
        { hide: "Ethan" },
        { goto: "intro_hub" },
    ],

    visit_rebecca: [
        { bg: "school_gate" },
        { text: "Rebecca is sitting on the front steps, staring at her phone." },
        { show: "Rebecca"},
        { speaker: "Cody", text: "Hey. You good?" },
        { speaker: "Rebecca", text: "Hm? Oh, hey Cody. Yeah. Just texting my mom." },
        { speaker: "Rebecca", text: "The doctors say my brother's stable." },
        { speaker: "Rebecca", text: "Which is good! It's good. I just hope he wakes up soon." },
        {
            choice: [
                {
                    text: "He's tough. He'll pull through.",
                    then: [
                        { speaker: "Rebecca", text: "Yeah. He is. Annoyingly tough, honestly." },
                    ],
                },
                {
                    text: "He'll be fine. Next thing you know he'll be back to his antics and pissing everyone off.",
                    then: [
                        { speaker: "Rebecca", text: "Okay, that's fair. I don't miss his pestering." },
                    ],
                },
            ],
        },
        { speaker: "Rebecca", text: "Anyway. If we're going in later, count me in. I could use something to aim at." },
        { set: { visited_rebecca: true } },
        { hide: "Rebecca" },
        { goto: "intro_hub" },
    ],

    visit_kira: [
        { bg: "school_gate" },
        { text: "Kira is crossing the parking lot with a violin case, a stack of textbooks, and an iced coffee. Somehow none of it is falling." },
        { show: "Kira" },
        { speaker: "Kira", text: "Cody. What's up? I have four minutes." },
        { speaker: "Cody", text: "Four minutes?" },
        { speaker: "Kira", text: "Quiz at SU this afternoon, then violin practice. I'm listening to the lecture recording on the drive." },
        {
            choice: [
                {
                    text: "How are you even alive?",
                    then: [
                        { speaker: "Kira", expr: "smirk", text: "Iced coffee and spite. Mostly coffee." },
                    ],
                },
                {
                    text: "Sounds like you're having a great time.",
                    then: [
                        { speaker: "Kira", text: "Oh, extremely. I'm basically on vacation." },
                        { speaker: "Kira", text: "Don't make me laugh, I'll spill this." },
                    ],
                },
            ],
        },
        { speaker: "Kira", text: "If you're going into the Digital World tonight, text me. I'll come after practice." },
        { speaker: "Kira", text: "Somebody has to stop you guys from charging in blind." },
        { set: { visited_kira: true } },
        { hide: "Kira" },
        { goto: "intro_hub" },
    ],

    visit_jj: [
        // { bg: "school_gate" },
        { show: "JJ" },
        { speaker: "JJ", text: "CODY! Help! My sister took the TV and my brothers are being SO annoying." },
        { speaker: "Cody", text: "Which sister?" },
        { speaker: "JJ", text: "The little one! She's tiny and she's a dictator." },
        {
            choice: [
                {
                    text: "Sounds rough, buddy.",
                    then: [
                        { speaker: "JJ", expr: "pout", text: "It's SO rough. Nobody in this house respects me." },
                    ],
                },
                {
                    text: "Maybe you're the annoying one.",
                    then: [
                        { speaker: "JJ", text: "Wow. WOW. I thought you were on my side!" },
                        { speaker: "JJ", text: "...Okay, sometimes. But not today!" },
                    ],
                },
            ],
        },
        { speaker: "JJ", text: "Are we going to the Digital World? Please say yes. Please please please." },
        { speaker: "Cody", text: "MAYBE I'll bring you. Just don't cause me any trouble." },
        { set: { visited_jj: true } },
        { hide: "JJ" },
        { goto: "intro_hub" },
    ],

    visit_alice: [
        { bg: "phone_call" },
        { text: "Cody taps Alice's name. The line crackles with static for a second." },
        { show: "Alice", pos: "center" },
        { speaker: "Alice", text: "Cody? Hi! Sorry, I was in the middle of reading something." },
        { speaker: "Cody", text: "What are you reading?" },
        { speaker: "Alice", text: "My dad's old notes. The ones I can open, anyway. Half are locked and the other half are just math." },
        { speaker: "Alice", text: "I keep thinking I'll find something that explains me." },
        {
            choice: [
                {
                    text: "Find anything good?",
                    then: [
                        { speaker: "Alice", text: "No nothing helpful at all." },
                    ],
                },
                {
                    text: "Sounds boring.",
                    then: [
                        { speaker: "Alice", text: "It is SO boring! Thank you. Everyone else keeps saying it sounds interesting." },
                    ],
                },
            ],
        },
        { speaker: "Alice", text: "Are you all coming in today?" },
        { speaker: "Cody", text: "Yeah. Soon." },
        { set: { visited_alice: true } },
        { hide: "Alice" },
        { goto: "intro_hub" },
    ],

    /* ===================================================================== */
    /*  DEPARTURE                                                            */
    /* ===================================================================== */
    intro_departure: [
        { bg: "meetup" },
        { text: "Everyone meets up at the usual spot." },
        { show: "Ethan", pos: "center" },
        { speaker: "Ethan", text: "Ready for the Digital World?" },
        {
            choice: [
                {
                    text: "Hell yeah!",
                    then: [{ speaker: "Ethan", text: "Let's go!" }],
                },
                {
                    text: "What do you think?",
                    then: [{ speaker: "Ethan", text: "Man, you're pumped!" }],
                },
            ],
        },
        { set: { intro_complete: true } },
        { end: "digital_world" },
    ],

};

export const RescueDialogue = {
    Echo: {
        defeated: [

        ],
        benchedSaving: [

        ]
    },
    Ace: {
        defeated: [

        ],
        benchedSaving: [
            
        ]
    },
    BlazE: {
        defeated: [
            "I didn't see them...?"
        ],
        benchedSaving: [
            "Get down!"
        ],
        specificSaving: {
            Rose: "KIRA!!!!"
        }  
    },
    Rose: {
        defeated: [
            "I'm sorry...",
            "They were too strong for me...",
            "They outmaneuvered me?"
        ],
        benchedSaving: [
            "I got you!",
            "Hold Tight!",

        ],
        specificSaving: {
            BlazE: "REBECCA!!!"
        }
    },
    Strike: {
        defeated: [
            "FUCK!!!"
        ],
        benchedSaving: [
            
        ]
    },
    Star: {
        defeated: [
            "We took too many heavy hits",
            "I- I'm scared"
        ],
        benchedSaving: [
            
        ],
        specificSaving: {
            Echo: "I got you! Please don't leave me!"
        }
    },
}

export const DialogueSystem = {
    activeBox: null,

    init() {
        if(!document.getElementById('dialogueBox')) {
            this.activeBox = document.createElement('div');
            this.activeBox.id = 'dialogueBox';
            this.activeBox.style.cssText = `
            position: absolute; bottom: 20px; left: 20px; right: 20px;
            background: rgba(0, 0, 0, 0.88); color: #fff; padding: 18px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            border: 2px solid #4ea8de; border-radius: 6px; z-index: 100;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: none;
            `;
            document.body.appendChild(this.activeBox);
        } else {
            this.activeBox = document.getElementById('dialogueBox');
        }
    }, 

    showAliceQuote(textKey) {
        if (!this.activeBox) this.init();
        
        const quotes = {
            level_40: `"Careful... as we get stronger, so do they. The 'Digital World' is reacting to us getting stronger... how did my dad program this?"`,
            condensed: `"The world feels condensed... these boundaries are keeping something out, or keeping us locked in."`
        };

        let message = quotes[textKey] || textKey;
        this.activeBox.innerHTML = `<strong style="color: #4ea8de; font-size: 1.1em;">Alice:</strong> ${message}`;
        this.activeBox.style.display = "block";
    },
    getConditionalScript(benchedCodename, activeCodename, category) {
        let characterPool = RescueDialogue[benchedCodename];
        if (!characterPool) return "Let's Move!";
        
        // Check if a specific dynamic line exists for this pairing under benchedSaving
        if (category === "benchedSaving" && characterPool.specificSaving && characterPool.specificSaving[activeCodename]) {
            if (Math.random() < 0.5) {
                return characterPool.specificSaving[activeCodename];
            } 
        }

        let linePool = characterPool[category] || characterPool.benchedSaving;
        let randomIndex = Math.floor(Math.random() * linePool.length);
        return linePool[randomIndex];
    },

    hide() {
        if (this.activeBox) {
            this.activeBox.style.display = "none";
        }
    }
};