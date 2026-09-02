# 2026 Fantasy Draft Board

Mobile draft board for a 10-team half-PPR Yahoo league, drafting from slot 3.

**Live:** https://anara-ai.github.io/2026-nfl-fantasy/

## Files
- `index.html` — the app. Four tabs: Board, My team, Plan, Intel.
- `data.js` — all rankings, news flags, handcuffs, plan copy. This is the file that gets updated.
- `sw.js` / `manifest.json` — offline caching and home-screen install.

## Data
Consensus of seven boards: Yahoo (half-PPR, the league host), NFLFantasyEdge ADP,
FantasyFootballCalculator ADP, CBS consensus, Jamey Eisenberg, Draft Sharks, and Austin Swaim.
See the Intel tab for full sourcing and method.

Draft state lives in browser localStorage under `draft2026.v1`, separate from the ranking
data, so updates to `data.js` never wipe your picks.
