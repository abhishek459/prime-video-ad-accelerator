# ⏩ Prime Video Ad Accelerator

> **Bypass Prime Video ads without "blocking" them.** > A heuristic-based browser extension that detects ad countdown timers and speeds up playback to 16x.

![Version](https://img.shields.io/badge/version-1.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🧐 How It Works
Traditional ad blockers try to block network requests, which often causes Amazon to break the video player or display a "disable ad blocker" warning.

**This extension takes a different approach:**
1.  **Passive Observation:** It scans the DOM for elements that "behave" like countdown timers (e.g., numbers dropping from `0:15` to `0:14`).
2.  **Heuristic Detection:** It ignores class names (which Amazon randomizes) and focuses on **behavior** and **screen position** (ignoring the main player bar).
3.  **Playback Manipulation:** When an ad is confirmed, it sets the HTML5 video playback rate to **16.0x** (the browser maximum) and mutes audio.
4.  **Auto-Resume:** As soon as the ad timer vanishes or changes to static text, it instantly restores 1.0x speed and un-mutes.

**Result:** A 30-second ad plays in ~1.8 seconds. Amazon registers the ad as "watched," and you get back to your movie immediately.

## ✨ Features
* **Behavioral Targeting:** Does not rely on hardcoded CSS class names that break weekly.
* **Dynamic Heartbeat:** Scans slowly (1s) during movies to save CPU, but checks rapidly (50ms) during ads to prevent skipping actual content.
* **Safety Brakes:** Includes logic to ignore the "Time Remaining" bar and a 60-second emergency cutoff to prevent runaway skipping.
* **Stealth Mode:** Does not inject obvious "Skip" buttons that Amazon can easily detect.

## 🚀 Installation (Developer Mode)
Since this is a custom script, you must install it as an "Unpacked Extension."

1.  **Download** or `git clone` this repository.
2.  Open your browser (Chrome, Edge, or Brave).
3.  Navigate to `chrome://extensions` (or `edge://extensions`).
4.  Toggle **Developer Mode** (top right corner) to **ON**.
5.  Click **Load Unpacked** (top left).
6.  Select the folder where you cloned this repo.
7.  **Done!** Open Prime Video and enjoy.

## 🛠 Technical Details
The core logic resides in `content.js`. It uses a `setTimeout` loop that adjusts its own frequency:
* **Idle Mode:** Checks every 1000ms.
* **Ad Mode:** Checks every 50ms.

It filters potential false positives by:
1.  **Location:** Ignoring the bottom 70% of the screen.
2.  **Duration:** Ignoring timers longer than 180 seconds.
3.  **Visibility:** Checking `offsetParent` to ensure the timer is actually visible to the user.

## ⚠️ Disclaimer
This project is for **educational purposes only**. It demonstrates how DOM manipulation and heuristic analysis can interact with HTML5 media elements.
* I am not responsible for any banned accounts (though unlikely, as this does not modify network traffic).
* Use at your own risk.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
