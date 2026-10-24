# osu! wrapped 2026

**Version 1.1.4**

A Netlify-ready fan app that turns an osu! profile into a 2026 review, an interactive slideshow, and a downloadable recap card. Supports osu!, osu!taiko, osu!catch, and osu!mania. The demo works without OAuth credentials. No database is required.

## Features

- Responsive stats dashboard with monthly activity, average accuracy and its letter grade, highest combo, medals unlocked, and replay views.
- Favorite Mod with official colored SVG icons, visible score percentages, a clickable full mod breakdown, a personal mod rankings slide, and tie handling. Individual mods are counted separately, CL is excluded, and CL-only or unmodded scores count as No Mod.
- Top 25 selected PP scores with artwork, grades, dates, mapper credits, exact PP tooltips, score links, and replay viewing where available.
- Top mapper and artist rankings with profile pictures where available. Artist pictures use TheAudioDB, with initials when no exact match exists.
- Rarest medal earned in 2026, including artwork, award date, and a current Osekai rarity estimate. Visible percentages truncate to two decimal places; the full value is available on hover.
- An interactive story with music, song previews, animated intro and finale, mapper/artist guessing games, and sound effects.
- Nine playstyle clubs with a legend panel, animated reveal, and primary/secondary archetypes on the recap card.
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
| Replay views | Sum of available 2026 monthly replay-watch counts, across modes. |

Year boundaries use UTC. Before January 1, 2027, this is a year-to-date review. Missing data is shown as unavailable. Demo scores and counts are fictional. Current best scores can displace earlier plays, and profile history may be incomplete.

## Slideshow and audio

First successful sign-in automatically opens the story once per player and year in that browser. Replay Experience opens it again anytime. Seen state is stored in localStorage; another browser, cleared storage, or blocked storage can cause it to appear again.

The full story includes up to 27 slides when both quizzes have enough candidates. Controls support pause/play, mute, previous/next, slide selection, swipe, and Escape. Reduced-motion starts paused and skips the animated opening sequences. Mobile uses lighter effects; desktop keeps the full animation treatment.

The opening uses cYsmix - Triangles and the finale uses nekodex - circles!. The top-play and artist slides use looping osu! beatmap previews where available. Quiz/mapper slides use an original ambient loop. Audio fades between sections and follows pause, visibility, and mute controls. Browsers may require pressing Play before allowing audio.

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
| src/global.js | Global rankings and mode-aware genre/mapset links |
| src/medals.js, src/mod-icons.js | Medal display and local mod artwork |
| netlify/functions/api.mjs | Netlify Fetch API entrypoint |
| netlify/functions/lib/ | OAuth, security, artwork, and rarity services |
| tests/ | Automated regression checks |

## Security and verification

OAuth requests identify public. Sessions are encrypted with AES-256-GCM and stored in HttpOnly, SameSite=Lax cookies, with Secure on HTTPS. No refresh token is stored; sign in again when the session expires. Private OAuth credentials stay on the backend. Signing out clears the session; access can also be revoked in osu! account settings.

No database stores user reviews or replay files. Third-party artist and rarity data is cached as described above. Exported files are controlled by the user. Verify real OAuth, browser audio, sharing, and replay playback on the deployed site before release. See the [security review](docs/SECURITY-REVIEW.md) for remaining deployment checks.

Independent fan project. Not affiliated with ppy or osu!. [osu! API documentation](https://osu.ppy.sh/docs/).


## Global stats

The Your Stats / Global Stats selector preserves the selected gamemode. The full experience has up to **27 slides** when both quizzes have enough candidates.

Global panels include:

- Up to 25 recorded 2026 PP plays from the current official top 1,000, plus player appearance rankings.
- The 25 most-played mapsets ranked in 2026, ordered by lifetime mapset plays. Links open the most-played native difficulty for the selected mode.
- Individual mod usage across the global top 25 PP plays, showing counts and percentages. CL is excluded and ties share a rank.
- Up to ten genres across the popular top 25 mapsets, counting each unique mapset once. Missing metadata is labeled Unknown genre. Genre links open osu! searches filtered to the selected mode; the story shows the top five genres.
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

One available 2026 score is enough to receive a club. The nine clubs are:

| Club | Qualifying signal |
| --- | --- |
| Overdrive | DT or NC on at least 40% of selected scores. |
| HR Headquarters | HR on at least 40%; excluded as a defining club for mania. |
| Afterdark | HD or FL on at least 50%. |
| No Mod, No Problem | Unmodified scores on at least 60%. |
| Precision Society | At least ten passed scores averaging 99% in osu!/taiko, 99.5% in catch, or 98% in mania. |
| The Repeat Offenders | At least 10,000 recorded 2026 plays and six months with at least 500 plays each. |
| Mapper Loyalists | At least 25% of selected scores under one mapset host. |
| The Wanderers | At least ten distinct hosts and ten artists; each unique-name count is at least half the score count. |
| All-Rounder | Fallback when no other qualifying signal takes priority. |

Mod preferences use percentages of the deduplicated selected-mode 2026 score sample from the current top 200, excluding CL. The largest qualifying mod share wins; ties use Overdrive, HR Headquarters, Afterdark, then No Mod. Otherwise priority is precision, regular activity, mapper loyalty, exploration, then All-Rounder. Repeat Offenders uses available monthly profile playcounts (across modes), not inferred retries. These are playful descriptions of available data, not complete play histories.

Users qualifying for precision alongside another primary club receive the **Precision-minded** secondary archetype. The dashboard opens a scrollable legend of all nine clubs with the current club highlighted. The story uses a click-triggered evolution reveal with sound effects; text selection is disabled until the entrance animations finish. Reduced motion and mute are supported.

Recap PNGs include the club emblem, color, name, motto, and assignment reason. When earned, the secondary archetype appears on the right with a central divider. Clubs are computed per review: no database stores assignments or community club percentages.
