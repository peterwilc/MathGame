# Times Table Trainer

A lightweight browser game focused on times-table memorization.

## What it does
- Focuses only on these tables: **3s, 4s, 5s, 6s, 7s, 8s, 9s, 12s**
- Uses direct **number input** (no multiple choice)
- Gives an **8-second timer** for every question
- Tracks score and streak
- Uses adaptive weighting to show missed facts more often and mastered facts less often
- Shows an end-of-round reward (mini-game prompt / meme / mastery badge)

## Adaptive learning model
Each multiplication fact has its own learning profile:
- Correct answers increase proficiency and slightly lower frequency
- Incorrect or timed-out answers lower proficiency and increase frequency
- New or weak facts receive higher selection weights

This creates a basic AI-style personalized drill loop.

## Run locally
Because it's plain HTML/CSS/JS, you can open `index.html` directly or run a local server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.
