(function () {
    'use strict';

    // --- CONFIGURATION ---
    const SCAN_INTERVAL_MS = 1000;    // Scan slowly for ads
    const AD_MODE_INTERVAL_MS = 50;   // Check fast when skipping
    const SPEED_MULTIPLIER = 16.0;
    const MAX_AD_DURATION_SEC = 180;  // Ignore timers > 3 mins
    const SCREEN_SEARCH_AREA = 0.30;  // Only check top 30% of screen (ignores bottom player bar)
    const MAX_SKIP_TIME_MS = 60000;   // EMERGENCY BRAKE: Never skip more than 60s continuously

    // --- STATE ---
    let suspectElements = new Map();
    let isAdMode = false;
    let loopId = null;
    let skipStartTime = 0; // To track how long we've been skipping

    // Helper: Parse "0:10" into number. Returns NULL if text is not a timer.
    function parseTime(str) {
        if (!str) return null;
        // Strict match: "0:10", "00:05"
        const match = str.trim().match(/^-?0?0:(\d{2})$/);
        if (match) {
            return parseInt(match[1], 10);
        }
        return null;
    }

    function gameLoop() {
        const video = document.querySelector('video');
        let nextTick = SCAN_INTERVAL_MS;

        if (video) {
            // ==========================================
            // PHASE 1: AD MODE (THE "FAST" LOOP)
            // ==========================================
            if (isAdMode) {
                nextTick = AD_MODE_INTERVAL_MS;

                // 1. EMERGENCY BRAKE Check
                if (Date.now() - skipStartTime > MAX_SKIP_TIME_MS) {
                    console.log("[Ad Hunter] Emergency Brake! Skipping ran too long.");
                    stopSkipping(video);
                    return; // Restart loop next tick
                }

                // 2. VALIDATE THE TIMER
                // Check if our detected timer is still VALID (Visible AND still looks like a time)
                let adTimerIsValid = false;

                for (let [element, data] of suspectElements) {
                    if (data.confirmedAd) {
                        // CHECK A: Is it still in the DOM?
                        if (!element.isConnected) continue;

                        // CHECK B: Is it actually visible? (offsetParent is null if hidden)
                        if (element.offsetParent === null) continue;

                        // CHECK C: Does it still contain a number? 
                        // If it changed to "Skip Intro" or empty string, it's not an ad timer anymore.
                        const currentTime = parseTime(element.textContent);
                        if (currentTime === null) continue;

                        // If we passed all checks, the Ad is still active.
                        adTimerIsValid = true;
                        break;
                    }
                }

                if (!adTimerIsValid) {
                    // The timer is gone/hidden/changed. Ad is over.
                    stopSkipping(video);
                    nextTick = SCAN_INTERVAL_MS; // Slow down
                } else {
                    // Ad is still happening. Enforce speed.
                    if (video.playbackRate !== SPEED_MULTIPLIER) {
                        video.playbackRate = SPEED_MULTIPLIER;
                    }
                }
            }

            // ==========================================
            // PHASE 2: SCAN MODE (THE "SLOW" LOOP)
            // ==========================================
            else {
                const allElements = document.querySelectorAll('div, span');
                const windowHeight = window.innerHeight;

                allElements.forEach(el => {
                    // Optimization
                    if (!el.textContent || el.textContent.length > 8) return;

                    // Filter: Top 30% of screen only
                    const rect = el.getBoundingClientRect();
                    if (rect.top > windowHeight * SCREEN_SEARCH_AREA) return;

                    const currentSeconds = parseTime(el.textContent);

                    if (currentSeconds !== null && currentSeconds < MAX_AD_DURATION_SEC) {
                        if (!suspectElements.has(el)) {
                            suspectElements.set(el, { lastTime: currentSeconds, confirmedAd: false });
                        } else {
                            const data = suspectElements.get(el);

                            // IF TIME DROPPED (10 -> 9), IT IS A TIMER
                            if (currentSeconds < data.lastTime) {
                                console.log(`[Ad Hunter] Ad Detected! Speeding up.`);
                                data.confirmedAd = true;
                                startSkipping(video);
                                nextTick = AD_MODE_INTERVAL_MS;
                            }
                            data.lastTime = currentSeconds;
                        }
                    }
                });

                // Cleanup map
                for (let [key, val] of suspectElements) {
                    if (!key.isConnected) suspectElements.delete(key);
                }
            }
        }

        loopId = setTimeout(gameLoop, nextTick);
    }

    // --- ACTIONS ---
    function startSkipping(video) {
        isAdMode = true;
        skipStartTime = Date.now();
        video.playbackRate = SPEED_MULTIPLIER;
        video.muted = true;
    }

    function stopSkipping(video) {
        console.log("[Ad Hunter] Restoring normal playback.");
        isAdMode = false;
        video.playbackRate = 1.0;
        video.muted = false;
        suspectElements.clear(); // Clear suspects to avoid "ghost" timers
    }

    // Start
    gameLoop();
    console.log("[Ad Hunter] v1.2 Loaded - Strict Mode");

})();