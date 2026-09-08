# Personal room and editorial update

Historical record: the subsequent owner request in `channels_name_motion.md` removes the projects and episode tiles, makes publishing channels equal, and changes the initial Playbill state. That newer spec controls the current site.

Jingheng’s September 8, 2026 follow-ups supersede the earlier instruction to keep visible Broadway recording details and the intermediate request to remove projects entirely. The final request keeps three meaningful projects, removes redundant metadata and external links, and makes the illustrated rooms and Broadway collection more personal. Review and publication gates are unchanged.

## Content and navigation

The home navigation now offers Projects, Journal, Music, Films, Books and Broadway. A single desktop row becomes a three-column, two-row grid beside the home mark on narrow screens, with 44px minimum targets. Channels follow the hero, then Journal, a compact project shelf, and the existing taste collections. Skip and invitation links go to Channels; there is no dead Work anchor.

Project descriptions are grounded in public source code. LinkedIn’s projects page could not be retrieved, so no LinkedIn-only role, date or achievement was inferred:

- [Duber README](https://github.com/shenxingy/duke-duber/blob/main/README.md) and [Matty-7’s location work](https://github.com/shenxingy/duke-duber/commit/1722428415d703319ff37b20fca0d744fec6171c) support shared rides, location search and mapped routes for the Duke community. Environmental rewards are project features, not measured environmental outcomes.
- [MealMates events](https://github.com/shenxingy/MealMates/blob/main/packages/api/src/router/event.ts) and [the authored/coauthored implementation](https://github.com/shenxingy/MealMates/commit/893d314f776586a9a0b6f4362ca5ee1ca3ae4f90) support creating and joining restaurant meetups. It is not a meal-recipe or nutrition product, and no sole-authorship claim is made.
- [Tennis main flow](https://github.com/Matty-7/CS302-ComputerVision/blob/main/Tennis/main.py) and [bounce detection](https://github.com/Matty-7/CS302-ComputerVision/blob/main/Tennis/bounce_detector.py) support tracking and mapping ball bounces. Automatic in/out decisions, accuracy and real-time performance are unverified and are not claimed.

Film and book mood notes, visible edition details and edition links are removed from the homepage; source data stays intact. Film titles retain year/director; books retain author; songs retain artist. Podcast episodes show titles without subtitle, date or duration. The passive music instruction is removed; genuine error/end messages, timing, the Play preview label and working full-song link remain. Six labelled footer icons replace text links. GitHub, Instagram and YouTube paths come from [Simple Icons](https://github.com/simple-icons/simple-icons/tree/develop/icons) under CC0; LinkedIn is a local outline mark, and Podcast and Journal use the existing Lucide icons. Douban and the full-playlist link are omitted. The film-diary link is also removed. No approved essay text or publication metadata changes.

## Broadway fan

The owner explicitly identifies these five shows as ones he has seen and his current top five. Their existing sequence is not presented as a numeric ranking. Five complete Playbill images form a hand of cards; selecting a cover or its named control lifts and enlarges it in front. Native buttons preserve keyboard activation and visible focus, and a polite live title identifies the selection. Focused cover buttons rise above overlapping cards so the focus indicator remains visible. The stage reserves enough height for the selected full portrait; no automatic cycling, drag requirement or new dependency is introduced. Reduced motion removes the transitions while keeping the selected state visible.

All Broadway arrows, recording/cast details and external links, including View this Playbill, are removed as requested. The recording metadata remains in its source file but is no longer imported by this section. Cover provenance remains in `content/playbills.json`.

## Illustrated details

The left hero frames now contain an untitled abstract cinema print and a decorative Manhattan map. The right painting’s composition is retained. Neither frame duplicates a Top Ten film or includes a home address, invented movie credit or location pin. This is illustrative map artwork, not a navigational map. The imagegen edit preserves object positions with slight rendering variation; it is not pixel-identical outside the frames.

The closing terminal now has thin bezels and two adjacent central silver mounts extending left and right. The slim colored keyboard stays in place. Two small brick-built desk ornaments depict the Statue of Liberty and a generic Duke basketball figure, without claiming a particular real player. Both images remain 1672 × 941, encoded as WebP. The existing masked screen effects stay inside the panels and hero animation remains registered to its coffee and record positions.

Verification uses asset inspection, source-coordinate arithmetic, lint, TypeScript, publication tests, content checks and a production build. No browser, screenshot, DOM or interaction tests were performed.
