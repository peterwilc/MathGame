# Long Division Lab

A lightweight browser game focused on long-division fluency.

## What it does
- Runs quick rounds (5-30 questions)
- Generates long-division problems across 3 difficulty levels
- Expects answers in `quotient r remainder` format
- Tracks score + streak
- Gives a random reward modal at the end for motivation

## Run locally
Because it's plain HTML/CSS/JS, you can open `index.html` directly or run a tiny local server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Next step ideas
- Add guided step mode (divide, multiply, subtract, bring down)
- Add support for multi-digit divisors
- Add per-student progress tracking over time
