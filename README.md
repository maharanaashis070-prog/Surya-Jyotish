# Surya — Vedic Jyotish, rooted in Odisha

A 100% free, no-account, no-server Vedic astrology (Jyotish) web app: kundli
chart, six varga charts, Shadbala strength, the full Vimshottari dasha tree,
classical yogas, dated transit predictions, life-area probabilities, and an
adaptive guidance dashboard — all computed by the provided calculation
engines and rendered in a visual language drawn from Odisha's temple art
(the Konark Sun Temple's 24-spoke wheel, the Jagannath palette, Pattachitra
border work, and Sambalpuri weave textures).

No paid API, no API key, no ads, no account, no server required to use it.

## The fastest way to run it

Open **`run/index.html`** by double-clicking it. That's it — it's a single
self-contained HTML file with everything (JS, CSS, fonts fallback) inlined,
so it works straight from disk (`file://`), no install, no server, no
internet required for the core app (an internet connection only improves the
display font via Google Fonts, and is optional).

> Saved profiles and feedback use your browser's `localStorage`. This works
> when opening the file directly in Chrome, Edge, and Firefox. If your
> browser restricts storage for local files (some strict configurations do),
> the app still works fully in that session — it just won't remember saved
> profiles after you close the tab. For guaranteed persistence on every
> browser, serve the folder instead of double-clicking it:
> ```
> cd run
> npx serve .
> # or: python3 -m http.server 8080
> ```
> then open the printed `http://localhost:...` address.

## Running from source (for development / customization)

```bash
npm install
npm run dev       # dev server with hot reload
npm run build     # produces dist/index.html — a fresh single-file build
npm run lint      # oxlint
```

## What's real vs. what's decorative

Every number in this app — planet positions, house placements, dasha
periods, yoga detections, transit dates, shadbala scores, life-area
probabilities, and guidance decisions — comes directly from the provided
calculation engines in `src/engines/`, untouched. The only new code is UI,
state management, routing, and the adapter functions in `src/lib/adapters.js`
that reshape one engine's output into the next engine's expected input
(documented inline — no astrology formula was re-derived or approximated).

The one deliberately-fake-and-labeled exception is the **Cosmic Oracle**
card at the bottom of the Guidance page: it draws one of a handful of
pre-written generic readings from `ai-offline-engine/offlineOracle.js` and is
always visibly badged "general reading, not calculated from your chart."
This app does not call any paid AI API (Claude or otherwise) for readings —
that would require an API key and stop being free — so this generic card is
offered purely for fun, clearly separated from the real, chart-based screens.

## Two calculation tracks

- **Track A (default, always on):** pure JavaScript, runs entirely in the
  browser, Lahiri ayanamsha, Meeus-series planetary positions (~1 arcminute
  accuracy). Powers every screen.
- **Track B (optional "Precision Mode"):** a local Python + Swiss Ephemeris
  backend (`server/astro-python-backend/`) for higher precision. It does not
  compute Vimshottari Dasha, so per the engine's own contract, Kundli, Dasha,
  Yogas, and Transits always use Track A; turning Precision Mode on only
  upgrades the planetary positions fed into the Life-Area Probability engine.
  To run it locally:
  ```bash
  cd server/astro-python-backend
  pip install flask flask-cors pyswisseph --break-system-packages
  python app.py
  ```
  Then enable "Precision Mode" in Settings (default backend URL:
  `http://localhost:3001`). If the backend isn't running, the app detects
  this, tells you, and keeps working on Track A — it never fails silently.

## Geocoding & timezones — also offline, also free

Birthplace search uses a bundled offline city list (`src/lib/cities.js`,
~210 places worldwide, weighted toward Odisha and India) — no geocoding API,
no key, no rate limit. The UTC offset for a birth date is derived from
latitude/longitude via `tz-lookup` (an offline IANA timezone dataset) plus
the browser's own `Intl` timezone database, which correctly accounts for
historical DST-rule changes rather than using a single fixed offset.

## Privacy

Saved birth profiles, app settings, and the adaptive guidance engine's
feedback/learning data are all stored only in `localStorage` on this device
— there is no account, no server, and no cross-device sync. The guidance
engine's feedback pool is shared across all profiles saved in one browser
(that's how the provided engine itself stores it), which is disclosed in
Settings.

## Project layout

```
src/engines/         the provided calculation engines — untouched
src/lib/              adapters, offline city/timezone data, storage, i18n
src/context/          React state: settings, saved profiles, computed chart
src/components/       chart wheel, layout, common UI, guidance widgets
src/pages/            the 11 screens
server/astro-python-backend/   optional Track B backend (run separately)
run/                  the double-click-ready single-file build
```
