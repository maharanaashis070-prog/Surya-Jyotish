# Surya Jyotish — Core Engines (pure calc, zero UI/API)

No server, no routes, no keys, no chat UI, no 3D/SVG rendering. Import these
modules straight into your new app.

```
chart-engine/
  chartCalculationEngine.js     ⭐ MAIN — pure JS, zero deps. Planets, houses,
                                 dasha, shadbala, varga charts. ~1 arcmin accurate.
  suryaChartPacket.js           — formats a calculated chart into readable text
  astro-python-backend/         — optional: Swiss Ephemeris precision (higher
    app.py                        than Meeus JS above, esp. for retrograde stations)
    ephe/                        — required ephemeris data files, do not delete

prediction-engine/
  yogaDetectionEngine.js        — classical yoga (planetary combination) detection
  transitPredictionEngine.js    — dated transit-to-natal event predictions
  decisionAdaptiveEngine.js     — scoring/timeline/alerts + self-learning weights
  probabilityPredictionEngine.js— event-probability model (marriage/career/etc)

ai-offline-engine/
  offlineOracle.js              — no-network fallback text generator
```

## Honest flag on `ai-offline-engine`

You asked for the "AI offline prediction engine" so it's in here — but check
what it actually does before you build precision features on top of it:
`offlineOracle.js` picks **one of 4 hardcoded generic reading templates at
random**. It does not read the chart data you pass it, doesn't compute
anything, and returns the same 4 blocks of text to every user. It's a
network-outage placeholder, not a prediction engine. The real prediction
logic — the part that's actually computed from someone's chart — lives
entirely in `prediction-engine/`. Don't route final predictions through
`offlineOracle.js` if precision is the goal.

## Two tracks for chart calculation — pick one

**Track A (recommended default).** No install, runs in-browser/Node directly.
```js
import { calcKundli, calcDasha, calcShadbala } from './chart-engine/chartCalculationEngine.js';
import { detectYogas }      from './prediction-engine/yogaDetectionEngine.js';
import { buildPredictions } from './prediction-engine/transitPredictionEngine.js';
import { JYOTISH_ENGINE }   from './prediction-engine/decisionAdaptiveEngine.js';

const kundli   = calcKundli(1990, 5, 14, 10, 30, 28.6139, 77.2090, 5.5); // y,m,d,h,min,lat,lon,tzOffset
const dashas   = calcDasha(kundli, '1990-05-14');
const shadbala = calcShadbala(kundli, true); // true = daytime birth
const yogas    = detectYogas(kundli.structured.planets, kundli.structured.lagna.rashiIdx);
const transits = buildPredictions(kundli.structured.planets, dashas);

const result = JYOTISH_ENGINE.runPipeline(
  dashas, transits, yogas,
  Object.entries(shadbala).filter(([k]) => k !== '_aspects').map(([, v]) => v),
  userId
);
// -> { windows, alerts, decisions }

JYOTISH_ENGINE.feedback.collectFeedback(predictionId, 1, 'career'); // learn from outcomes
```

**Track B (higher raw precision).** Needs Python running alongside your app.
```bash
cd chart-engine/astro-python-backend
pip install pyswisseph --break-system-packages
python3 app.py    # serves POST /calculate on :3001 — this is a calc process, not a public API
```
```js
import { predictEvents, formatPredictionBlock } from './prediction-engine/probabilityPredictionEngine.js';
import { buildSuryaChartPacket } from './chart-engine/suryaChartPacket.js';

const chartData = await fetch('http://localhost:3001/calculate', {
  method: 'POST',
  body: JSON.stringify({ year:1990, month:5, day:14, hour:10, minute:30, lat:28.6139, lon:77.2090, tzOffset:5.5 })
}).then(r => r.json());

const predictions   = predictEvents(chartData, chartData.dasha);
const readableBlock = formatPredictionBlock(predictions);
const chartPacket   = buildSuryaChartPacket(chartData);
```

**Don't mix outputs from A and B directly — different data shapes.**
`astro-python-backend/app.py` computes planets/Panchang but **not** Vimshottari
Dasha; only Track A's `calcDasha()` has that. If you want Track B's raw
precision + real dasha, call `calcDasha()` from Track A and feed its output
into Track B's `predictEvents(chartData, dashaFromTrackA)`.

## Accuracy notes

- `chartCalculationEngine.js`: Lahiri ayanamsha, full Meeus series + topocentric
  correction — accurate to ~1 arcmin. Real Vimshottari proportions, real
  Parashari varga rules, real classical yoga definitions (not placeholders).
- `astro-python-backend/app.py` (Swiss Ephemeris/Moshier): more precise still,
  especially near retrograde stations. Requires the `ephe/` data files — keep
  them next to `app.py`.
- `transitPredictionEngine.js` projects transits using **mean daily motion**
  (constant speed), fine for Jupiter/Saturn, looser for Moon/Mercury. For
  tighter accuracy call `chartCalculationEngine.js`'s planet functions at each
  candidate date instead of extrapolating.
- `decisionAdaptiveEngine.js`'s feedback/learning (Phase 9) persists to
  `localStorage` in-browser, in-memory elsewhere — swap in a real DB if you
  need weights to survive reinstalls.

## Left out on purpose

3D solar-system visualization, chart SVG drawing, audio engine, chat/oracle
UI, all paid/free LLM provider routing (Cerebras/Gemini/Groq/HuggingFace/
Ollama/OpenRouter/Pollinations), `aiRouter.js`, `server.js`, rate-limiting/auth
middleware. None of that is calculation logic — build UI and API routing
fresh around these engines.
