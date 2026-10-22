# osu! wrapped 2026

A complete Netlify-ready fan app: osu! OAuth, four rulesets, responsive dashboard, monthly activity chart, score rankings, mapper/artist rankings, PNG recap and JSON export. Demo runs without credentials. No database required. No passwords or OAuth secrets reach browser JavaScript.

## Run

Use Node 22 or newer. Run `npm install`, then `npm run dev` for the frontend/demo at http://localhost:5173. For working OAuth and API routes, copy `.env.example` to `.env`, configure the values below, and run `npm run dev:netlify` at http://localhost:8888. Register that exact local callback separately for local testing. `npm test` runs aggregation and session-security tests; `npm run build` creates `dist`.

## Deploy to Netlify

1. Push this directory to your Git provider and import the repository in Netlify. The included `netlify.toml` sets build, functions, routing, Node version and security headers. Do not deploy only `dist` by drag and drop: the OAuth backend needs Netlify Functions.
2. On https://osu.ppy.sh/home/account/edit, create an OAuth application. Register `https://YOUR-SITE.netlify.app/api/auth/callback` as its callback (use your custom domain if applicable).
3. Add `OSU_CLIENT_ID`, `OSU_CLIENT_SECRET`, `OSU_REDIRECT_URI`, and `SESSION_SECRET` to Netlify environment variables, available to Functions. `OSU_REDIRECT_URI` must match the registered URL exactly. Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never prefix these variables with `VITE_`.
4. Deploy/redeploy after configuring variables. Open the site and click Get my Wrapped. Verify official osu! authorization redirects back to your site, mode switching, export, and sign out.

The app requests `identify public` permissions. Sessions use AES-256-GCM authenticated encryption in HttpOnly, SameSite=Lax cookies (Secure on HTTPS), OAuth state verification and an expiry bounded by the provider access-token lifetime or 24 hours. It intentionally stores no refresh token; users sign in again on expiry. Sign out clears the local session; connected-app access can also be revoked in osu! account settings. Tokens and raw API responses are not logged. Results are not persisted server-side. Exported PNG/JSON files are user-controlled. The API fetches only the authenticated user's data and has bounded requests and timeouts. No paid services are required beyond hosting terms.

## What the API can actually tell us

Official reference: https://osu.ppy.sh/docs/index.html (Get Own Data, Get User Scores, User).

| Requested feature | Implemented interpretation |
| --- | --- |
| Yearly playcount | Sum of returned 2026 monthly profile counts, across modes. Missing history is explicitly disclosed. |
| Yearly accuracy | Unweighted mean of passed scores in the available 2026 sample. **Not** lifetime profile accuracy or a complete annual average. |
| Highest combo | Highest combo in sampled passed 2026 scores. |
| Highest PP / top 25 | 2026 scores in the current top 200 best plays sorted by PP, up to 25; recent scores are excluded; not guaranteed the true historical annual top 25. |
| Medals | Profile achievements with a 2026 achieved_at timestamp, across modes. |
| Replays watched | Sum of returned 2026 monthly replay-watch counts, across modes. |
| Favorite mappers / artists | Top 10 by deduplicated scores in the current top 200 best plays from 2026, not true annual playcounts. Mapper uses mapset creator, which may differ from guest difficulty creator. |

Each review scans up to 200 current best scores for the selected mode using two pages of 100 (offsets 0 and 100), then keeps only 2026 scores. This single source supplies accuracy, combo, PP rankings, and mapper/artist rankings. Recent scores are never fetched or included. Current best scores can displace earlier records. The API does not expose a complete annual per-user attempt ledger through these endpoints. A zero from a returned monthly array means no counted activity in the returned history, not proof of complete archival coverage. Missing fields show unavailable rather than fabricated numbers. No lifetime most-played counts are relabeled as yearly data. An exact full annual review would require an authorized complete historical source or a tracker running throughout the year; even periodic recent-score polling can miss attempts. The app deliberately does not claim that capability.

Year boundaries use UTC. Before January 1, 2027, results represent 2026 year to date. Example data is prominently marked fictional. The demo has no external image/font dependency. Charts, artwork, and recap are generated locally.

## Structure

`src/main.js`: UI and export; `src/summary.js`: shared aggregation; `src/demo.js`: fictional sample; `src/style.css`: responsive design; `netlify/functions/api.mjs`: OAuth and osu! API; `netlify/functions/lib/security.mjs`: encrypted sessions; `tests`: automated checks.

## Live verification still required

You must supply your own osu! OAuth credentials and deployed domain to exercise a real login. These cannot be bundled in source. Test that flow on your actual Netlify site before announcing it. Profile history availability is controlled by osu!. This project is independent and is not affiliated with ppy/osu!.


## Security review

See [security findings, fixes, and remaining deployment checks](docs/SECURITY-REVIEW.md). API entrypoints now use the Netlify Fetch API; the shared handler is in netlify/functions/lib/api-handler.mjs. Re-authenticate after deploying the purpose-tagged session changes.

## Local runner compatibility

`npm run dev:netlify` now runs `scripts/dev.mjs`: Vite plus the actual Fetch API function at http://localhost:8888, loading the root .env. This bypasses a Netlify CLI 27.14.1 proxy crash on normal GET requests without Content-Type. Stop other servers on port 8888 first. OAuth uses the same localhost callback as before. This runner does not emulate Netlify edge headers or distributed rate limits; those require deployment checks. Production deployment still uses netlify.toml and the same hardened Netlify functions.

## Embedded replay viewer

Top-score Watch replay buttons open a sandboxed ReplayViewer panel. The backend authorizes the current player and verifies score ownership before downloading a replay; only the replay bytes are passed to https://www.replayviewer.com/?embed using its replayviewer:load interface. No osu! token is sent to that site. Downloads are bounded to 4 MiB and use no-store; image downloads remain bounded to 2 MiB. The CSP allows only that viewer as a frame source. Closing the panel aborts pending downloads and removes its message listener/frame. Missing replays and upstream download quotas may prevent playback. ReplayViewer currently lists no lazer-mod support. Full third-party playback requires live verification; this repository does not control that service. No OAuth client change or additional environment variable is required.

## Wrapped experience

Successful first-login data loading opens a nine-slide animated story. Seen state is localStorage keyed by player ID and year, so changing game mode does not replay it automatically. The Replay Experience button opens it anytime, including in the demo. Closing/skipping counts as seen; different browsers/devices or cleared storage may show it again. If storage is blocked, seen state lasts only for the current page. This is an animated web experience, not an exported video, and uses no autoplay audio. Controls support pause/play, previous/next, slide selection, swipe and Escape. Reduced-motion starts paused and disables entrance/counting animations. Hiding the browser tab pauses progress. No OAuth or environment-variable change is required.
