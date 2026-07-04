// adapters.js — the "thin glue" layer described in the build brief: it wires
// the provided calculation engines together and reshapes their outputs so
// the *next* engine in the pipeline can consume them. No astrology formula
// lives in this file — every number still comes from the engine functions.
import {
  calcKundli, calcDasha, calcShadbala, calcVarga, calcDignity,
} from '../engines/chart-engine/chartCalculationEngine.js';
import { detectYogas } from '../engines/prediction-engine/yogaDetectionEngine.js';
import { buildPredictions } from '../engines/prediction-engine/transitPredictionEngine.js';
import { predictEvents } from '../engines/prediction-engine/probabilityPredictionEngine.js';
import { JYOTISH_ENGINE } from '../engines/prediction-engine/decisionAdaptiveEngine.js';
import { buildSuryaChartPacket } from '../engines/chart-engine/suryaChartPacket.js';

/**
 * Whole-sign Sun house, above/below horizon.
 * The bundled JS chart engine does not expose sunrise/sunset (only the
 * optional Python/Swiss-Ephemeris backend does), so Kala Bala's day/night
 * input is derived from the Sun's own quadrant (Sripati) house — houses
 * 7-12 sit on the Midheaven side of the chart (above the horizon = day),
 * houses 1-6 sit on the IC side (below the horizon = night). This reuses
 * the engine's own house math rather than introducing new astronomy.
 */
export function isDayBirth(structured) {
  const sun = structured.planets.find(p => p.name === 'Sun');
  if (!sun) return true;
  const house = sun.bhavaChalit ?? sun.bhavaRashi;
  return house >= 7 && house <= 12;
}

/** Object.values(calcShadbala()) minus the internal `_aspects` bag, per the engine's documented usage. */
export function shadbalaToArray(shadbala) {
  return Object.entries(shadbala || {}).filter(([k]) => k !== '_aspects').map(([, v]) => v);
}

/**
 * Current Mahadasha / Antardasha lord names. Includes both `antara` and
 * `antar` keys since probabilityPredictionEngine reads the former (with the
 * latter as its own fallback) while suryaChartPacket reads the latter —
 * populating both means one adapter serves both engines correctly.
 */
export function currentDashaLords(dashas) {
  const maha = (dashas || []).find(d => d.isCurrent) || dashas?.[0] || null;
  if (!maha) return { maha: null, antara: null, antar: null };
  const antarObj = maha.bhuktis?.find(b => b.isCurrent) || null;
  const antarLord = antarObj ? antarObj.lord : null;
  return { maha: maha.lord, antara: antarLord, antar: antarLord };
}

/**
 * Reshapes chartCalculationEngine's `structured.planets` array into the
 * `{ PlanetName: { sign, house, degree, retrograde, speed } }` dictionary
 * that probabilityPredictionEngine.adaptChart() expects (that engine was
 * originally written against the Python backend's dict-shaped response —
 * this makes Track A speak the same shape, using the same field names
 * Track B already returns).
 */
export function structuredToEngineChartData(structured) {
  const planets = {};
  structured.planets.forEach(p => {
    planets[p.name] = {
      sign: p.rashi.name,             // Sanskrit name; probabilityPredictionEngine normalizes it
      house: p.bhavaRashi,            // whole-sign house from Lagna — same convention the Python backend uses
      degree: p.sidereal.decimal,     // full 0-360 sidereal longitude (needed for combustion orb math)
      retrograde: !!p.isRetro,
      speed: p.dailyMotion ?? undefined,
      nakshatra: p.nakshatra,
      pada: p.pada,
    };
  });
  return { planets };
}

/** Same shape as above, plus a `lagna` block — the exact input buildSuryaChartPacket() expects. */
export function structuredToPacketChartData(structured) {
  const base = structuredToEngineChartData(structured);
  return {
    ...base,
    lagna: {
      sign: structured.lagna.rashi,
      degree: structured.lagna.degree, // already 0-30 (degree within sign)
      nakshatra: structured.lagna.nakshatra,
      pada: structured.lagna.pada,
    },
  };
}

/**
 * Runs the ENTIRE provided pipeline for one birth profile and returns every
 * piece of data the screens need. This is the only place all six engine
 * files are called together.
 *
 * @param {{year,month,day,hour,minute,lat,lon,tzOffset}} birth
 * @param {string} userId - stable id for this saved profile (adaptive learning + outcome history)
 * @param {object|null} trackBChartData - optional Swiss-Ephemeris response (Track B); when present its
 *        planet positions feed the probability engine while dasha still comes from Track A (per contract).
 */
export function computeFullChart(birth, userId, trackBChartData = null) {
  const { year, month, day, hour, minute, lat, lon, tzOffset } = birth;

  const kundli = calcKundli(year, month, day, hour, minute, lat, lon, tzOffset);
  const structured = kundli.structured;

  const dashas = calcDasha(kundli, `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  const isDay = isDayBirth(structured);
  const shadbala = calcShadbala(kundli, isDay);
  const yogas = detectYogas(structured.planets, structured.lagna.rashiIdx);
  const transits = buildPredictions(structured.planets, dashas);

  const dashaForProbability = currentDashaLords(dashas);
  const chartDataForProbability = trackBChartData || structuredToEngineChartData(structured);
  const predictions = predictEvents(chartDataForProbability, dashaForProbability);

  const strengthsArray = shadbalaToArray(shadbala);
  const guidance = JYOTISH_ENGINE.runPipeline(dashas, transits, yogas, strengthsArray, userId);

  return {
    kundli, structured, dashas, isDay, shadbala, yogas, transits,
    predictions, guidance, trackB: !!trackBChartData,
    computedAt: Date.now(),
  };
}

/** Full plain-text natal chart summary (for the "view full text reading" export/share feature). */
export function generateChartSummaryText(structured, dashas) {
  const chartData = structuredToPacketChartData(structured);
  const dashaForPacket = currentDashaLords(dashas);
  return buildSuryaChartPacket(chartData, dashaForPacket);
}

export { calcVarga, calcDignity };
