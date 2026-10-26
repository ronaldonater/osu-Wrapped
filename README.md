# osu! wrapped 2026

**Version 1.1.21**

A Netlify-ready fan app that turns an osu! profile into a 2026 review, an interactive slideshow, and a downloadable recap card. Supports osu!, osu!taiko, osu!catch, and osu!mania. The demo works without OAuth credentials. The dashboard and demo work without a database; community club percentages optionally use Neon.


## v1.1.21 updates

- Allow users with eligible 2026 uploads and no eligible scores to access mapping-only Wrapped.
- Add a focused mapping dashboard, slideshow path, and dedicated recap without empty score-based sections.
- Tighten mapping recap spacing and frame the mapping club logo to match the dashboard.
- Users with neither eligible scores nor uploads remain blocked. No database migration is required.

## v1.1.20 updates

- Fixed mapping club colors on the live website by replacing inline styles with CSP-safe CSS classes.
- Badges, legend entries, and community percentages now use consistent club accent colors without changing the security policy.

## v1.1.19 updates

- Added six independent mapping clubs with qualification criteria, shared vector logos, and a themed legend panel.
- Added mapping community percentages backed by a separate Neon table, counting each mapper once across all game modes.
- Refined mapping club cards and recap exports, including the club logo, motto, criteria, and most-played 2026 upload.
- Omit mapping sections from the slideshow and recap when no eligible 2026 uploads exist.
- Added Replay Society as a primary or secondary playstyle club, with a logarithmic strength scale based on replay views received in 2026.
- Improved club legend descriptions, consistent accent colors, and mapping button styling.
- Deployment: existing databases must run `scripts/sql/club-community-v8.sql` for Replay Society and `scripts/sql/mapping-community.sql` for mapping tracking. Existing Netlify database variables are reused.

## v1.1.18 updates

- Added a blueprint-themed mapping panel at the bottom of personal stats. It counts hosted mapsets first submitted in 2026 (UTC), the currently ranked subset, and combined all-time plays on those mapsets across all modes.
- Added a mapping slide after the club reveal. It showcases the most-played 2026 submission with cover artwork, title, artist, lifetime playcount, and a mapset link, and plays its complete audio preview. The slide is skipped when there are no qualifying mapsets or mapping data is unavailable.
- Recap cards include mapping counts and grow to fit the added section. Medal artwork now retains its original aspect ratio.
- Artist photos fall back to a matching beatmap background on the dashboard, slideshow, and recap card, then to an initial if both images fail.
- Mapping data uses paginated osu! profile catalogues with a 15-minute cache. Incomplete or failed fetches show unavailable. Upload counters need no database; community tracking requires the SQL setup described below. No new OAuth scopes are required.
- Replaced the elongated dash in the recap card date range with a regular hyphen.
- Standardized the website introduction credit to lowercase `ronaldonater`.
- On desktop, the five visible genre rows expand to fill the space beside the mod rankings, with remaining genres scrollable. Mobile retains compact rows.
- Genre rankings now cover all currently ranked mapsets with a 2026 ranked date in the selected native gamemode, instead of only the 25 most-played mapsets. Each unique mapset counts once; missing genre metadata is counted as Unknown genre.
- The global genre panel lists every genre in a keyboard-accessible scroll list with five entries visible initially. The slideshow shows only the top five genres.
- The genre slide appears immediately after "New patterns. More ways to play." (the total mapsets ranked in 2026 slide).
- Genre counts and percentages refresh through the existing daily ranked-catalogue GitHub Actions workflow. No new secrets or workflow settings are required; the refreshed snapshot is included.
- Centered the full-width All-Rounder legend heading and simplified the One Shot Society requirement wording.
- Added One Shot Society for SD/PF players: at least 40% of selected scores, with a 40-55 base strength and support as a primary or secondary club.
- Community tracking supports 21 playstyle clubs under assignment rules `2026-v15`. Existing databases use `scripts/sql/club-community-v8.sql`; fresh databases use `scripts/sql/club-community.sql`. Mapping tracking uses its own SQL table.
- Personal Wrapped requires an eligible 2026 score from the selected mode's current top 200 or a hosted mapset first submitted in 2026. Users with uploads but no scores receive mapping-only Wrapped; users with neither see an explanation and can switch modes.
- Slides automatically scale to fit the available screen space while playback and navigation controls remain full-size.
- Keyboard arrow navigation survives slide content changes without requiring another click, and yields to other open panels.
- Removed the arrow from the “Click the play to view score” hint.
- All 21 clubs can be primary or secondary. Every qualifying signal is ranked; the strongest becomes primary and the next distinct match becomes secondary.
- Evidence weighting reduces the influence of small samples. One selected score remains eligible; reviews with fewer than 20 selected scores display a provisional note. Score-based signals reach full weight at 20 evidence scores, using valid passed scores for accuracy. Activity signals reach full weight at six available months.
- Mapper Loyalists requires three matching scores across at least two distinct mapsets. Balanced All-Rounder considers mod, mapper, and artist variety rather than mods alone.
- The legend displays personal Match strength in the top-right, separately from community primary-club percentages anchored at the bottom. Selected scores are defined once in the panel.
- Recap cards, story slides, and the dashboard support any secondary club with its own emblem, color, and explanation.
- The provisional club slide uses tighter spacing. The medal card has centered content, a framed medal, and a subtle glow.

### Current base strength ranges

| Signal | Base strength |
| --- | --- |
| High / low accuracy | 70-100 |
| Map age / popular maps | 68-96 |
| Mapper Loyalists | 60-95 |
| The Wanderers | 60-85 |
| Balanced All-Rounder | 60-80 |
| The Repeat Offenders | 55-80 |
| Quality Over Quantity | 55-80 |
| Replay Society | 55-80 (logarithmic replay views received) |
| Choke Artists | 65-90 |
| Stable Loyalists / Lazer Pioneers | 62 |
| Mod preferences | 40-55 |
| Fallback All-Rounder | 0 |

These are base weights, not probabilities. Actual Match strength applies evidence weighting. Qualification thresholds are unchanged unless described above. Exact ties use evidence coverage, then a deterministic order. Community percentages count primary clubs only.

Current assignment rules: `2026-v15`. Existing databases must apply `scripts/sql/club-community-v8.sql` before deployment. Fresh databases use `scripts/sql/club-community.sql`. Mapping tracking additionally requires `scripts/sql/mapping-community.sql`. Returning participants refresh their assignment; keep the database credentials and tracking secret unchanged.

## Features

- Responsive stats dashboard with monthly activity, average accuracy and its letter grade, highest combo, medals unlocked, and replay views.
- Favorite Mod with official colored SVG icons, visible score percentages, a clickable full mod breakdown, a personal mod rankings slide, and tie handling. Individual mods are counted separately, CL is excluded, and CL-only or unmodded scores count as No Mod.
- Top 25 selected PP scores with artwork, grades, dates, mapper credits, exact PP tooltips, score links, and replay viewing where available.
- Top mapper and artist rankings with profile pictures where available. Artist pictures use TheAudioDB, falling back to a matching beatmap background and then initials.
- Rarest medal earned in 2026, including artwork, award date, and a current Osekai rarity estimate. Visible percentages truncate to two decimal places; the full value is available on hover.
- An interactive story with music, song previews, animated intro and finale, mapper/artist guessing games, and sound effects.
- Twenty-one playstyle clubs with a legend panel, animated reveal, and primary/secondary archetypes on the recap card.
- Global PP, popular mapset, mod, genre, and mapper rankings with mode-aware links and embedded viewers.
- PNG recap export, JSON export, recap preview, and a share panel with Twitter/X and Bluesky links, an editable message, image/message copying, downloads, and native file sharing where supported.

The initial mode follows the user's preferred mode on osu!. Users can switch modes manually.

## Run locally

Use Node.js 22 or newer.

~~~sh
npm install
npm run dev
~~~

This starts the frontend and demo at http://localhost:5173. OAuth and backend routes require the full local runner:

1. Copy .env.example to .env.
2. Create an osu! OAuth application in [osu! account settings](https://osu.ppy.sh/home/account/edit).
3. Register http://localhost:8888/api/auth/callback as its callback.
4. Set OSU_CLIENT_ID, OSU_CLIENT_SECRET, OSU_REDIRECT_URI, and SESSION_SECRET in .env. The redirect URI must exactly match the registered callback.
5. Run npm run dev:netlify and open http://localhost:8888.

Generate a session secret with:

~~~sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
~~~

Keep .env private and never prefix backend secrets with VITE_. Backend modules reload through the local runner; restart it after changing environment variables. Frontend edits reload through Vite.

The local runner uses scripts/dev.mjs to serve Vite and the actual Fetch API function. It bypasses a Netlify CLI proxy compatibility issue, but does not emulate deployed security headers or distributed rate limits.

## Deploy to Netlify

1. Import this repository in Netlify. The included netlify.toml defines the build, functions, redirects, and security headers.
2. Register https://YOUR-DOMAIN/api/auth/callback in your osu! OAuth client.
3. Set OSU_CLIENT_ID, OSU_CLIENT_SECRET, OSU_REDIRECT_URI, and SESSION_SECRET in Netlify, available to Functions.
4. Deploy or redeploy, then verify sign-in, mode switching, exports, and sign-out on your actual domain.

Deploy the full project, rather than uploading only dist: OAuth and image/replay routes require Netlify Functions. TheAudioDB and Osekai integrations need no additional environment variables.

The personal website integration uses /osu-wrapped/ and /api/osu-wrapped/, with WRAPPED_OSU_CLIENT_ID, WRAPPED_OSU_CLIENT_SECRET, WRAPPED_OSU_REDIRECT_URI, and WRAPPED_SESSION_SECRET. Its production callback is https://ronaldonater.com/api/osu-wrapped/auth/callback. See the website repository's docs/OSU-WRAPPED-SETUP.md for that deployment.

## Data scope

Each review requests up to 200 current best scores for the selected mode, using two pages of 100, then filters and deduplicates scores dated in 2026. Recent scores are not fetched. This is a sample of current best scores, not a complete historical archive of the user's year.

| Stat | Calculation |
| --- | --- |
| Plays | Sum of available 2026 monthly profile counts, across modes. |
| Average accuracy | Unweighted average of passed scores in the selected 2026 sample. |
| Accuracy grade | SS: 100%; S: 95% to below 100%; A: 90% to below 95%; B: 85% to below 90%; C: 70% to below 85%; D: below 70%. Calculated from the unrounded average. |
| Highest combo | Maximum combo among sampled passed 2026 scores, linked to its source score. |
| Top PP plays | Up to 25 passed scores sorted by PP from the selected 2026 sample. |
| Favorite Mod | Most common individual mod in the deduplicated 2026 sample. Each mod counts once per score; ties are shown. CL is excluded. |
| Mappers and artists | Top 10 by score count in the selected sample. Mapper credits use the mapset creator and may differ from the guest difficulty's creator. |
| Medals unlocked | Profile achievements with a 2026 award timestamp, across modes. |
| Rarest medal | Lowest available Osekai ownership percentage among medals earned in 2026. Incomplete matches are labeled accordingly. |
| Replay views | Sum of valid available 2026 monthly views received on the user's replays by others, across modes. |

Year boundaries use UTC. Before January 1, 2027, this is a year-to-date review. Missing data is shown as unavailable. Demo scores and counts are fictional. Current best scores can displace earlier plays, and profile history may be incomplete.

## Slideshow and audio

First successful sign-in automatically opens the story once per player and year in that browser. Replay Experience opens it again anytime. Seen state is stored in localStorage; another browser, cleared storage, or blocked storage can cause it to appear again.

The full story includes up to 28 slides when both quizzes have enough candidates. Controls support pause/play, mute, previous/next, slide selection, swipe, and Escape. Reduced-motion starts paused and skips the animated opening sequences. Mobile uses lighter effects; desktop keeps the full animation treatment.

The opening uses cYsmix - Triangles and the finale uses nekodex - circles!. The top-play and artist slides use looping osu! beatmap previews where available. Quiz/mapper slides use the ambient loop credited to nekodex. The optional personal mapping slide plays the full preview of the most-played 2026 upload. Audio fades between sections and follows pause, visibility, and mute controls. Browsers may require pressing Play before allowing audio.

Navigating to another slide while paused immediately shows its completed counters, grades, club reveal, and contextual panels. Skipped entrance sound effects do not replay when playback resumes. Pausing an animation already in progress preserves its current state.

Saving a recap keeps the slideshow open. Opening its share panel pauses playback and resumes it on close only if the panel caused that pause. Close, Done, and Escape use the closing sound and fade.

## Sharing and replay viewing

Twitter/X and Bluesky share links prefill the message, including the app link, but do not automatically attach the card. Users can copy the PNG, download it, or use the device share sheet where supported. Clipboard and native sharing depend on browser permissions and support.

Watch replay opens a sandboxed [ReplayViewer](https://www.replayviewer.com/) panel. The backend verifies the signed-in user's score ownership before downloading a replay. Only replay bytes are sent to the viewer; the osu! token is not. Replays are not permanently stored, downloads are limited to 4 MiB, and closing the panel aborts pending requests. Missing replays, upstream quotas, and viewer mod support can limit playback.

## External artwork and rarity

- [TheAudioDB](https://www.theaudiodb.com/free_music_api): exact-name artist lookups using its shared free key. Results use bounded image downloads, browser/CDN caching, and a small warm-instance cache. Free API limits and missing artwork can result in initials. The local request guard is per function instance, not a global traffic guarantee. See [artist image notes](docs/ARTIST-IMAGES.md).
- [Osekai](https://osekai.net/): medal metadata and current rarity estimates, cached for 24 hours per warm instance. These are estimates from Osekai's tracked population, not official global statistics or rarity at award time. See [medal rarity notes](docs/MEDAL-RARITY.md).
- Official osu! mod SVGs are bundled locally with category colors. Source and upstream licence are included in public/images/mods/.

Artwork and data attribution are included in the UI and exported card. External images/previews require network access; demo data itself does not require OAuth.

## Checks and source layout

~~~sh
npm test
npm run build
~~~

The build outputs dist. Tests cover aggregation, preferred modes, mod counts, medal selection, artwork validation and caching, replay authorization, OAuth, and session security.

| Path | Purpose |
| --- | --- |
| src/main.js, src/style.css | Dashboard and responsive UI |
| src/summary.js, src/mods.js, src/accuracy.js | Score aggregation and stat calculations |
| src/experience.js | Interactive story and audio |
| src/recap.js, src/share.js | PNG generation and sharing |
| src/replay.js, src/beatmap-viewer.js | Embedded replay and beatmap viewers |
| src/clubs.js, src/mod-breakdown.js | Club assignment, legend, and personal mod rankings |
| src/mapping.js, src/mapping-clubs.js | Personal uploads, mapping clubs, and mapping legend |
| netlify/functions/lib/mapping-stats.mjs, netlify/functions/lib/mapping-community.mjs | Upload catalogue and separate mapping tracking |
| src/global.js | Global rankings and mode-aware genre/mapset links |
| src/medals.js, src/mod-icons.js | Medal display and local mod artwork |
| netlify/functions/api.mjs | Netlify Fetch API entrypoint |
| netlify/functions/lib/ | OAuth, security, artwork, and rarity services |
| tests/ | Automated regression checks |

## Security and verification

OAuth requests identify public. Sessions are encrypted with AES-256-GCM and stored in HttpOnly, SameSite=Lax cookies, with Secure on HTTPS. No refresh token is stored; sign in again when the session expires. Private OAuth credentials stay on the backend. Signing out clears the session; access can also be revoked in osu! account settings.

No database stores full user reviews or replay files. Optional Neon tracking stores pseudonymous club assignments only, when configured. Third-party artist and rarity data is cached as described above. Exported files are controlled by the user. Verify real OAuth, browser audio, sharing, and replay playback on the deployed site before release. See the [security review](docs/SECURITY-REVIEW.md) for remaining deployment checks.

Independent fan project. Not affiliated with ppy or osu!. [osu! API documentation](https://osu.ppy.sh/docs/).


## Global stats

The Your Stats / Global Stats selector preserves the selected gamemode. The full experience has up to **28 slides** when both quizzes have enough candidates.

Global panels include:

- Up to 25 recorded 2026 PP plays from the current official top 1,000, plus player appearance rankings.
- The 25 most-played mapsets ranked in 2026, ordered by lifetime mapset plays. Links open the most-played native difficulty for the selected mode.
- Individual mod usage across the global top 25 PP plays, showing counts and percentages. CL is excluded and ties share a rank.
- All genres across all currently ranked mapsets with a 2026 ranked date in the selected native mode, counting each set once. The scroll list initially displays five entries; the story shows the top five immediately after the ranked-mapset-total slide. Missing metadata is Unknown genre. Links preserve the selected mode.
- Ranked mapper totals and the number of unique mapsets ranked in 2026, from the catalogue snapshot described below.

Community slides also show approximate new accounts, peak concurrent users with OhnePixel context, and over 1.7 billion ranked plays submitted. These community figures are separate from the selected-mode score sample; source and coverage notes appear on their slides. Restriction counts are not included.

The global backend scans up to ten official ranking pages until it finds 25 eligible unique 2026 plays. Only the highest-PP play per player and difficulty is retained. This is not a complete annual archive. Results are cached for 15 minutes per warm instance; upstream failures preserve personal stats and may return stale cached results. Popular-mapset searches use the existing osu! application's public client credentials, with no additional service account or database.

### Beatmap and replay panels

Watch beatmap opens the embedded [JoSu beatmap viewer](https://preview.tryz.id.vn/), using the most-played native difficulty for the selected mode. Buttons are enabled for all four modes; viewer support can vary. Global Watch replay verifies that the requested score belongs to the returned global top 25 before downloading it for the signed-in user. Personal replay downloads still require score ownership. Tokens are never sent to either viewer.

### Ranked mapper leaderboard

Global stats includes the top ten mapset hosts by unique currently ranked sets with a 2026 ranked date (UTC), filtered to native gamemodes. Each set counts once per matching mode, with guest difficulties excluded as separate credits. Ties share rank and are ordered by name. The UI displays snapshot time and catalogue coverage.

Refresh locally with `node scripts/update-ranked-mappers.mjs`. The script uses existing osu! app credentials from the environment or `.env`, scans the complete catalogue with cursor pagination and rate limiting, and replaces the snapshot only on successful completion.

The `Refresh ranked mapper leaderboard` GitHub Actions workflow refreshes daily at 08:23 UTC and supports manual runs. Add repository Actions secrets `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET` (use the existing Wrapped app credentials) and allow Actions to write repository contents. Push the workflow and snapshot to the default branch to enable scheduled runs. Deploy the updated snapshot to publish refreshed counts.

### Playstyle clubs

One available 2026 score is enough to receive a club. The 21 clubs are:

| Club | Qualifying signal |
| --- | --- |
| Overdrive | DT or NC on at least 40% of selected scores. |
| HR Headquarters | HR on at least 40%; excluded as a defining club for mania. |
| Afterdark | HD or FL on at least 50%. |
| No Mod, No Problem | Unmodified scores on at least 60%. |
| Precision Society | At least ten passed scores averaging 99% in osu!/taiko, 99.5% in catch, or 98% in mania. |
| The Repeat Offenders | At least 10,000 recorded 2026 plays and six months with at least 500 plays each. |
| Mapper Loyalists | At least 25% under one host, with three matching scores across two distinct mapsets. |
| The Wanderers | At least ten distinct hosts and ten artists; each unique-name count is at least half the score count. |
| EZ Does It | EZ on at least 40% of selected scores. |
| Close Enough Club | At least ten passed scores below 90% mean accuracy (95% in catch); competes by strength. |
| Safety Net Society | SO/NF on at least 50% (NF only outside osu!); no inference of deranking intent. |
| Quality Over Quantity | 1-99 recorded 2026 profile plays across available months (all modes); competes by strength with other qualifying signals. |
| Time Capsule | At least 60% of all eligible 2026 scores in the current top 200 are on mapsets ranked in 2016 or earlier; at least five scores. |
| Class of 2026 | At least 60% of all eligible 2026 scores in the current top 200 are on mapsets ranked in 2026; at least five scores. |
| Crowd Favorites | At least 40% of all eligible 2026 scores in the current top 200 overlap the selected mode’s popular 2026 top 25 mapsets, spanning at least three distinct sets and five eligible scores. |
| Stable Loyalists | 100% confirmed osu!stable scores in the eligible 2026 top-200 sample. |
| Lazer Pioneers | 100% confirmed osu!lazer scores in the eligible 2026 top-200 sample. |
| One Shot Society | SD/PF on at least 40% of selected scores. |
| Choke Artists | At least five selected scores, three qualifying passes and a 30% share: exactly one miss, or standard passes with no misses and exactly one reported slider combo-break event. |
| Replay Society | At least 500 replay views received by others in available 2026 monthly history across modes. |
| All-Rounder | At least three mod combinations, five hosts and five artists, with every mod family below 40%; also the fallback when no signal qualifies. |

All qualifying signals are ranked by strength rather than by first-match priority. Every club can be primary or secondary; the top two distinct matches are selected. Client exclusivity and playcount no longer automatically override stronger playstyle signals. All-Rounder can represent a balanced mod mix and remains the fallback. See the club ranking guide for weights, thresholds, and tie-breaking. These are playful descriptions of available data, not complete play histories.

Every qualifying club is eligible for either role: the strongest signal becomes primary and the next distinct match becomes secondary. The precision-only badge has been replaced by the generic secondary archetype. The dashboard opens a scrollable legend of all 21 clubs with the current club highlighted. The story uses a click-triggered evolution reveal with sound effects; text selection is disabled until the entrance animations finish. Reduced motion and mute are supported.

Recap PNGs include the club emblem, color, name, motto, and assignment reason. When earned, the secondary archetype appears on the right with a central divider. Clubs are computed per review: optional Neon tracking stores pseudonymous assignments to calculate participant percentages; see the community setup guide.

## Community database setup

The database is optional for reviews, slides and exports. It enables community primary-club percentages after one participant. Demos are never recorded; failed tracking does not block the review. Aggregates cache for one minute.

- Fresh playstyle database: run `scripts/sql/club-community.sql`.
- Existing playstyle database: run `scripts/sql/club-community-v8.sql`. It directly upgrades earlier schemas and retains existing rows.
- Mapping community: additionally run `scripts/sql/mapping-community.sql` in the same database and branch. It creates `wrapped_mapping_club_assignments` independently of `wrapped_club_assignments`.
- Earlier v6/v7 files may remain as historical migrations; they are not prerequisites for v8.
- Standalone Functions variables: `DATABASE_URL`, `CLUB_TRACKING_SECRET`.
- Website Functions variables: `WRAPPED_DATABASE_URL`, `WRAPPED_CLUB_TRACKING_SECRET`.

Playstyle assignments count once per participant/year/mode under `2026-v15`. Mapping assignments count once per mapper/year across modes under `mapping-2026-v1`. Only current-rule assignments enter percentages; returning users refresh existing records. Keep the secret stable. Neither table stores raw osu! IDs, usernames, tokens, full reviews, or replay files. See [community setup](docs/CLUB-COMMUNITY.md).

## Evidence and ranking

All 21 playstyle clubs can be primary or secondary. Strongest evidence-adjusted signal wins, followed by the next distinct match. Exact ties use supporting coverage, then definition order. Score evidence uses `0.5 + 0.5 * min(evidenceScores / 20, 1)`; accuracy uses valid passed scores. Activity evidence uses `0.75 + 0.25 * min(availableMonths / 6, 1)`, using replay-history months for Replay Society. One eligible score remains enough; fewer than 20 scores receive a provisional note. These are design weights, not probabilities. See [ranking guide](docs/CLUB-RANKING.md).

## Personal mapping and recap

Hosted mapsets first submitted in 2026 (UTC) are counted across all modes, deduplicated by set ID. The service paginates ranked, loved, pending and graveyard catalogues with a 15-minute cache. Guest difficulties hosted by others, deleted sets and unsubmitted maps are excluded. Ranked status is current. Missing/incomplete data is unavailable rather than zero.

The panel shows submissions, their currently ranked subset, combined all-time plays, a mapping club, and the most-played upload. Club criteria and matching accent colors appear on the badge; a button opens the themed legend. Community share appears on the right on desktop and stacks on mobile. The legend shows scope, then the primary community summary, then all six clubs.

The mapping slide follows the playstyle reveal and precedes global community statistics. It plays the most-played upload's complete audio preview. The recap shows three counters, then a divided row with club logo/name/motto/criteria and the most-played upload's cover/title/artist/playcount. Both slide and recap are omitted without a valid positive 2026 submission count, including unavailable data; no extra recap space is reserved. Zero counts can still appear on the dashboard.

## Demo data

Each mode includes real public metadata for ten native-mode mapsets from at least ten distinct hosts, including artwork and previews. Scores, PP, dates, activity, mapping totals and medal award dates remain fictional and labeled. Silver S/SS grades require HD or FL. The example medal displays a dated Osekai ownership snapshot. Demo community tracking is disabled. Refresh fixtures with `node scripts/update-demo-beatmaps.mjs` using local app credentials; no runtime credentials are needed for demos.

### Mapping clubs

Mapping clubs have separate assignments and community percentages from playstyle clubs. The mapping panel includes a six-club legend; the mapping slide and recap feature the first qualifying club in this order:

1. Community Soundtrack: at least 100,000 combined lifetime plays on 2026 submissions.
2. Ranked & Recognized: at least 3 currently ranked 2026 submissions.
3. Ranked Debut: at least 1 currently ranked 2026 submission, regardless of earlier ranked mapsets.
4. Pattern Factory: at least 10 mapsets submitted in 2026.
5. Hidden Gems: at least 5 submissions, none currently ranked.
6. First Draft Society: at least 1 submission in 2026, regardless of earlier mapping history.

All qualifying clubs are marked in the legend. First Draft Society covers every eligible mapper not assigned a higher-priority club. Statistics cover hosted mapsets first submitted in 2026 (UTC), across all modes. Multi-Mode Architects is excluded. Community tracking setup is described below.

### Mapping club community tracking

Run `scripts/sql/mapping-community.sql` in the Neon SQL Editor before deploying. This creates a separate table and leaves existing playstyle data intact. Reuse the existing private database and tracking-secret variables: `DATABASE_URL` / `CLUB_TRACKING_SECRET` for the standalone app, or `WRAPPED_DATABASE_URL` / `WRAPPED_CLUB_TRACKING_SECRET` for the website integration. No new secrets are required.

Authenticated Wrapped requests register one primary mapping club per mapper per year, across all modes. Only users with an eligible 2026 upload qualify; demos and unavailable mapping data are excluded. Revisiting updates an existing assignment. Percentages describe participating mappers, not all osu! users, and appear after one participant. Aggregates cache for one minute. Tracking stores a domain-separated HMAC key, year, all-mode scope, club ID, rule version and timestamps; no raw user IDs or usernames. Missing database configuration disables tracking; database failures leave Wrapped usable. Keep the tracking secret stable to avoid duplicate participant keys. Mapping ranking changes require a new mapping rules version.

### Replay Society

Replay Society - "Your plays deserve another look." Requires at least 500 views received on the user's replays in available 2026 monthly profile history (all modes). This measures views by others, not replays the user watched, and not unique viewers. Source: https://osu.ppy.sh/docs/ (UserStatistics.replays_watched_by_others); monthly history uses replays_watched_counts.

500 per year is a provisional, deliberately substantial design threshold (about 42 per month over a full year), not a verified percentile or population average. No reliable population distribution was available during implementation. Base strength is 55 + 25 * clamp(log10(views / 500) / 2, 0, 1): 55 at 500, 67.5 at 5,000, 80 at 50,000+. Apply the same activity confidence multiplier as other activity clubs: 0.75 + 0.25 * min(available replay-history months / 6, 1). No annualization of partial-year data; missing or invalid history cannot qualify. It can be a primary or secondary trait.

Playstyle assignment rules are `2026-v15`. Replay Society uses the existing playstyle community table and v8 migration; mapping tracking remains independent.

## Mapping-only Wrapped

Users with no eligible 2026 scores in the selected mode can still participate when they have at least one hosted mapset first submitted in 2026 across all modes. Their dashboard focuses on uploads, mapping club and mapping community percentages. The slideshow includes the opening, personal mapping slide with preview, community section and finale; it skips personal score, mod, accuracy, favorite mapper/artist, quizzes and playstyle club slides. The dedicated compact recap includes upload counters, mapping club and most-played upload, with no empty score sections. Save/share/JSON and first-login playback remain available. Users with neither eligible scores nor uploads remain blocked; unavailable mapping data does not grant eligibility. No SQL changes are required.
