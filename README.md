# Sizzle & Serve — Rush Hour Kitchen

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/emafajriana/best-cooking-game-20261125-0137-entry/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/emafajriana/best-cooking-game-20261125-0137-entry/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original cooking game for the [make.fun best cooking game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137): run a one-chef kitchen through a 150-second lunch rush. Take orders from the board, chop vegetables on the board, grill patties (take them off before they burn), build each dish on a plate, and serve it before the timer runs out. Serve fast for tips, chain serves into combos, and don't let 5 orders expire.

## How to play

- **WASD / Arrows** — move the chef; **E / Space** — grab, chop, grill, plate, serve
- **Click a station** to walk over and use it
- 4 recipes: Garden Salad, Classic Burger, Cheese Melt, Veggie Stack
- The rush ramps up: orders arrive faster and expire sooner as the shift goes on

## Play it

Static files under `game/` — no build step, no network. Serve the folder with any
static server (`node serve.ts` serves it on http://localhost:8080) and open
`game/index.html` in desktop Chrome.

## Layout

- `game/index.html` — the page, canvas only
- `game/src/config.js` — field, speeds, timings, station layout
- `game/src/recipes.js` — ingredients, recipes, order difficulty
- `game/src/rng.js` — seeded random numbers
- `game/src/world.js` — the rules: chef, stations, grill, chopping, orders, scoring
- `game/src/input.js` — keyboard and mouse input
- `game/src/audio.js` — synthesised WebAudio sound effects (no files)
- `game/src/render.js` — everything drawn: kitchen, food, HUD, screens
- `game/src/autopilot.js` — plays the real game forward to stage screenshots
- `game/src/main.js` — bootstrap and game loop
- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — 4 real renders of the game's own code: cover (rush), mid-game, title, results

## Screenshots

`?shot=start|play|rush|end` stages a scene from a fixed seed and renders one
frame — the screenshots in `screenshots/` were taken that way in headless
Chromium. The autopilot's best full shift (seed 20261138) serves 6 dishes for
$187, 3 stars.
