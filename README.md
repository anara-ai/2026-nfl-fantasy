# 2026 Fantasy Draft Board

Mobile draft board for a 10-team half-PPR Yahoo league, drafting from slot 3.

**Live:** [Draft Room](https://anara-ai.github.io/2026-nfl-fantasy/)

## Files
- `index.html` — the existing mobile app: Board, Search, My team, Plan, Brief.
- `data.js` — rankings, Yahoo prices/status, linked research, and the 14-round plan.
- `RESEARCH.md` — assumptions, draft strategy, source limitations and complete scoring.
- `verify.mjs` — data integrity and draft-state regression checks (`node verify.mjs`).
- `sw.js` / `manifest.json` — offline caching and home-screen install.

## Data
September 5, 2026 snapshot: FantasyPros half-PPR ECR is the ranking baseline;
Yahoo's public **All Drafts ADP** is the separate market signal. The app contains
343 searchable players/teams, including all 32 defenses. Targeted reporting
checks inform injury and role notes. See Brief → About and individual player
profiles for source links and limits. This is not a live feed.

The league has nine starters and five bench spots: **14 rounds**, with picks
3, 18, 23, 38, 43, 58, 63, 78, 83, 98, 103, 118, 123 and 138.
The plan assumes redraft, ordinary snake and no keepers. Confirm any league-specific
draft-to-IR behavior; two IR slots do not automatically create extra picks.

Draft state lives in browser localStorage under `draft2026.v1`, separate from the ranking
data, so updates to `data.js` never wipe your picks.
All original 234 player IDs are retained. New names use new IDs. Never reassign
an existing ID to a different player. Open the app online and check its visible
research date before draft night; offline mode can only use the last cached snapshot.
