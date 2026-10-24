# osu! wrapped 2026

A Netlify-ready fan app that turns an osu! profile into a 2026 review, an interactive slideshow, and a downloadable recap card. Supports osu!, osu!taiko, osu!catch, and osu!mania. The demo works without OAuth credentials. No database is required.

## Features

- Responsive stats dashboard with monthly activity, average accuracy and its letter grade, highest combo, medals unlocked, and replay views.
- Favorite Mod with official colored SVG icons, score counts, and tie handling. Individual mods are counted separately, CL is excluded, and CL-only or unmodded scores count as No Mod.
- Top 25 selected PP scores with artwork, grades, dates, mapper credits, exact PP tooltips, score links, and replay viewing where available.
- Top mapper and artist rankings with profile pictures where available. Artist pictures use TheAudioDB, with initials when no exact match exists.
- Rarest medal earned in 2026, including artwork, award date, and a current Osekai rarity estimate.
- An interactive story with music, song previews, animated intro and finale, mapper/artist guessing games, and sound effects.
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

Keep .env private and never prefix backend secrets with VITE_. Restart the local runner after changing backend modules or environment variables. Frontend edits reload through Vite.

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

The full story includes 13 slides when both quizzes have enough candidates. Controls support pause/play, mute, previous/next, slide selection, swipe, and Escape. Reduced-motion starts paused and skips the animated opening sequences. Mobile uses lighter effects; desktop keeps the full animation treatment.

The opening uses cYsmix - Triangles and the finale uses nekodex - circles!. The top-play and artist slides use looping osu! beatmap previews where available. Quiz/mapper slides use an original ambient loop. Audio fades between sections and follows pause, visibility, and mute controls. Browsers may require pressing Play before allowing audio.

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
| src/replay.js | Embedded replay viewer |
| src/medals.js, src/mod-icons.js | Medal display and local mod artwork |
| netlify/functions/api.mjs | Netlify Fetch API entrypoint |
| netlify/functions/lib/ | OAuth, security, artwork, and rarity services |
| tests/ | Automated regression checks |

## Security and verification

OAuth requests identify public. Sessions are encrypted with AES-256-GCM and stored in HttpOnly, SameSite=Lax cookies, with Secure on HTTPS. No refresh token is stored; sign in again when the session expires. Private OAuth credentials stay on the backend. Signing out clears the session; access can also be revoked in osu! account settings.

No database stores user reviews or replay files. Third-party artist and rarity data is cached as described above. Exported files are controlled by the user. Verify real OAuth, browser audio, sharing, and replay playback on the deployed site before release. See the [security review](docs/SECURITY-REVIEW.md) for remaining deployment checks.

Independent fan project. Not affiliated with ppy or osu!. [osu! API documentation](https://osu.ppy.sh/docs/).


## Global stats

A sliding Your Stats / Global Stats selector switches the dashboard scope while preserving the selected ruleset. The slideshow adds an animated global introduction and a top-five recorded-play slide after personal rankings and before the finale. Full stories now contain 13 slides when both quizzes are available.

The global endpoint reads the official osu! top plays rankings, including player names, beatmap details, mods, PP, and direct score IDs. It scans up to ten pages (1,000 plays) until it finds 25 unique eligible 2026 plays, and caches results for 15 minutes per warm instance. No additional credentials or user permissions are required. Failed global requests preserve personal stats and may return previously cached global data with a stale-data notice.

This leaderboard shows 2026 plays within osu!’s current top 1,000 PP rankings, not a complete annual archive. Only the highest-PP play per player and difficulty is shown. The dashboard shows up to 25 results and the slideshow shows five. Each entry links directly to its official score page. Global registrations, annual concurrency peaks, and ban counts are not included. Source: https://osu.ppy.sh/rankings/top-plays/osu

Restart the local backend after updating; deploy both frontend and functions for the live site.

### Ranked mapper leaderboard

Global stats includes the top ten mapset hosts by unique currently ranked sets with a 2026 ranked date (UTC), filtered to native gamemodes. Each set counts once per matching mode, with guest difficulties excluded as separate credits. Ties share rank and are ordered by name. The UI displays snapshot time and catalogue coverage.

Refresh locally with `node scripts/update-ranked-mappers.mjs`. The script uses existing osu! app credentials from the environment or `.env`, scans the complete catalogue with cursor pagination and rate limiting, and replaces the snapshot only on successful completion.

The `Refresh ranked mapper leaderboard` GitHub Actions workflow refreshes daily at 08:23 UTC and supports manual runs. Add repository Actions secrets `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET` (use the existing Wrapped app credentials) and allow Actions to write repository contents. Push the workflow and snapshot to the default branch to enable scheduled runs. Deploy the updated snapshot to publish refreshed counts.

### Playstyle clubs

Personal stats now include one of nine explainable clubs: Overdrive, Precision Society, HR Headquarters, Afterdark, Mapper Loyalists, The Wanderers, No Mod No Problem, All-Rounder, and The Repeat Offenders. Repeat Offenders uses recorded 2026 monthly activity: at least 10,000 plays and six months with at least 500 plays each, after mod and precision preferences. Clubs are assigned from the deduplicated selected-mode 2026 score sample, require at least one score, exclude CL, and use percentage-based mod preferences. Accuracy thresholds vary by mode. The card explains the deciding signal and full assignment rules; the slideshow reveals the club with an animated emblem and supports pause and reduced motion. Clubs are a playful sample-based summary, not a complete play-history classification.
