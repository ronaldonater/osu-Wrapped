# osu! Wrapped 2026

**Version 1.1.50** | [Changelog](CHANGELOG.md) | [Detailed guide](docs/FEATURE-GUIDE.md)

An independent fan app that turns your osu! profile into a 2026 review, an interactive slideshow, and shareable recap cards. Supports osu!, osu!taiko, osu!catch, and osu!mania.

## Features

- Personal activity, top plays, mods, mappers, artists, medals, average beatmap statistics, and community-tagged skillsets.
- Playstyle and mapping clubs with explanations, primary/secondary traits, and optional community percentages.
- Personal mapping statistics and mapping-only Wrapped for eligible uploaders without eligible scores.
- Global score, popular-map, mod, genre, and mapper rankings with replay and beatmap viewers.
- Animated, music-backed slideshow and portrait/landscape recap cards with sharing, image zoom, downloads, and JSON export.
- A bundled demo for all four modes, with saved statistics and bundled artwork. Demo data opens without OAuth, Neon, or the profile queue; slideshow song previews are bundled too.
- Persistent profile queuing, resumable loading, shared encrypted caching, and automatic retries when Neon is configured.

## Run locally

Use Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173) for the frontend and demo. For OAuth and backend routes:

1. Copy [.env.example](.env.example) to an uncommitted `.env`.
2. Create an osu! OAuth application in [osu! account settings](https://osu.ppy.sh/home/account/edit).
3. Register `http://localhost:8888/api/auth/callback` as its callback.
4. Set `OSU_CLIENT_ID`, `OSU_CLIENT_SECRET`, `OSU_REDIRECT_URI`, and `SESSION_SECRET`. The redirect URI must match the registered callback exactly.
5. Run `npm run dev:netlify` and open [localhost:8888](http://localhost:8888).

Generate a session secret with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Keep credentials on the backend. Never commit `.env` or expose secrets through `VITE_` variables.

## Deploy to Netlify

Import the complete repository; [netlify.toml](netlify.toml) supplies the build, Functions, redirects, and headers. Configure the same four private environment variables for Functions, register your production `/api/auth/callback` URL, and redeploy. Verify sign-in, slideshow audio, recap exports, and sign-out on the deployed domain.

The release gate opens November 29, 2026 at 00:00 UTC. Before release, the owner and approved admins can sign in early. Personal endpoints remain authenticated after release.

### Optional Neon setup

Set private `DATABASE_URL` and `CLUB_TRACKING_SECRET` variables, then apply the scripts relevant to your installation:

| Purpose | SQL script |
| --- | --- |
| Fresh playstyle community database | [club-community.sql](scripts/sql/club-community.sql) |
| Upgrade an existing playstyle community database | [club-community-v13.sql](scripts/sql/club-community-v13.sql) |
| Mapping community percentages | [mapping-community.sql](scripts/sql/mapping-community.sql) |
| Shared osu! API pacing | [api-budget.sql](scripts/sql/api-budget.sql) |
| Persistent profile queue and shared cache | [review-queue.sql](scripts/sql/review-queue.sql) |
| Early-access admin management | [admin-allowlist.sql](scripts/sql/admin-allowlist.sql) |

Run these in the existing Neon database before deploying the corresponding feature. No database is needed for the demo. See [community setup](docs/CLUB-COMMUNITY.md) and the [queue/cache guide](docs/FEATURE-GUIDE.md#persistent-profile-queue-and-shared-cache) for configuration, expiry, and cleanup details.

If Neon becomes unavailable, profiles fall back to the previous staged loader and community percentages show as unavailable. Local request pacing and rate-limit cooldowns continue, but cross-instance coordination is unavailable during the outage.

## Data scope and privacy

Score-based statistics use deduplicated 2026 scores found in the selected mode's **current top 200 best plays**, not a complete annual score archive. Monthly activity and medal history are profile-wide. Personal uploads use hosted mapsets first submitted in 2026; ranked status and playcounts are current. Skillset tags describe map patterns, not measured proficiency.

A personal review requires at least one eligible score or eligible 2026 upload. Required review data finishes loading before the profile is displayed. Confirmed missing data and supported image fallbacks count as completed results.

OAuth credentials stay on the server; sessions use encrypted HttpOnly cookies. With Neon configured, pseudonymous club assignments and temporary encrypted response/review caches are stored for tracking and loading. Access tokens and replay files are not stored in the database. See the [security review](docs/SECURITY-REVIEW.md) and [detailed guide](docs/FEATURE-GUIDE.md).

## Checks and maintenance

```sh
npm test
npm run build
```

Demo refresh scripts, ranked-catalogue updates, source layout, audio behavior, and detailed stat calculations are documented in the [feature and operations guide](docs/FEATURE-GUIDE.md). Release history lives in [CHANGELOG.md](CHANGELOG.md).

## Credits

Data and assets come from osu! / ppy, beatmap creators, Osekai, and TheAudioDB. Music and sound credits include cYsmix, nekodex, pola[r]is, and Aireu. ReplayViewer and JoSu provide embedded viewers.

The in-app **Credits & Thanks** panel contains the full attributions and special thanks; its source is [src/credits.js](src/credits.js). An independent fan project, not affiliated with ppy or osu!. All assets remain the property of their respective owners.

For the daily catalogue workflow, set the GitHub Actions repository secret `DATABASE_URL` to the live app's existing Neon connection string, alongside its existing osu! OAuth secrets. Rerun [api-budget.sql](scripts/sql/api-budget.sql) before deploying the shared player/snapshot scheduler. See the [feature guide](docs/FEATURE-GUIDE.md#shared-budget-for-daily-catalogue-refreshes).
