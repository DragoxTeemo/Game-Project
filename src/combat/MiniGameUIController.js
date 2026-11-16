import { MiniGameSystem } from "./minigame";

export class MiniGameUIController {
    /**
     * Spawns an interactive DOM slider minigame and returns a Promise 
     * resolving to the final multiplier once the player clicks stop.
     */
    static promptSlider(containerElement) {
        return new Promise((resolve) => {
            // Create DOM elements for slider track and moving handle
            containerElement.innerHTML = `
                <div class="minigame-slider-track">
                    <div class="minigame-sweet-spot" style="left: 60%; width: 20%;"></div>
                    <div class="minigame-handle" style="left: 0%;"></div>
                </div>
                <button class="minigame-stop-btn">STOP</button>
            `;

            let position = 0;
            let direction = 1;
            let active = true;

            //Animation loop
            const interval = setInterval(() => {
                if (!active) return;
                position += direction * 2;
                if (position >= 100 || position <= 0) direction *= -1;
                containerElement.querySelector('.minigame-handle').style.left = `${position}%`;
            }, 20);

            containerElement.querySelector('.minigame-stop-btn').onclick = () => {
                active = false;
                clearInterval(interval);
                
                // Evaluate final position against sweet spot (e.g., 60 to 80)
                const result = MiniGameSystem.resolveSliderStop(position, { start: 60, end: 80 });
                containerElement.innerHTML = ''; // Clean up DOM
                resolve(result);
            };
        });
    }

    static promptTimingBar(containerElement, weaponZones) {
        return new Promise((resolve) => {
            containerElement.innerHTML = `
                <div class="minigame-timing-track" style="position:relative; width:300px; height:20px; background:#333;">
                    <!-- Visual zones rendering based on weaponZones -->
                    <div class="timing-cursor" style="position:absolute; left:0%; width:4px; height:100%; background:white;"></div>
                </div>
                <button class="timing-hit-btn">ATTACK!</button>
            `;

            let pos = 0;
            let direction = 1;
            let active = true;

            const interval = setInterval(() => {
                if (!active) return;
                pos += direction * 1.5;
                if (pos >= 100 || pos <= 0) direction *= -1;
                containerElement.querySelector('.timing-cursor').style.left = `${pos}%`;
            }, 15);

            containerElement.querySelector('.timing-hit-btn').onclick = () => {
                active = false;
                clearInterval(interval);
                
                // Evaluate using MiniGameSystem
                const result = MiniGameSystem.resolveTimingBar(
                    pos, 
                    weaponZones.tStart, weaponZones.tEnd, 
                    weaponZones.pStart, weaponZones.pEnd
                );
                containerElement.innerHTML = '';
                resolve(result);
            };
        });
    }
    static promptSpamClick(containerElement, targetClickNeeded) {
        return new Promise((resolve) => {
            containerElement.innerHTML = `
                <div class="spam-container">
                    <h3 class="spam-timer">Time Left: 3.0s</h3>
                    <button class="spam-punch-btn">PUNCH!</button>
                </div>
            `;

            let clickCount = 0;
            let timeLeft = 3.0;
            let active = true;

            containerElement.querySelector('.spam-punch-btn').onclick = () => {
                if (active) clickCount++;
            };

            const timerInterval = setInterval(() => {
                timeLeft -= 0.1;
                const timerEl = containerElement.querySelector('.spam-timer');
                if (timerEl) timerEl.textContent = `Time Left: ${Math.max(0, timeLeft).toFixed(1)}s`;

                if (timeLeft <= 0) {
                    active = false;
                    clearInterval(timerInterval);

                    const result = MiniGameSystem.runSpamClick(clickCount, targetClickNeeded);
                    containerElement.innerHTML = '';
                    resolve(result);
                }
            }, 100);
        });
    }
}