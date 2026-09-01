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
 * 
 * ---------------------------------------------------------------------------
 */

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

    hide() {
        if (this.activeBox) {
            this.activeBox.style.display = "none";
        }
    }
};