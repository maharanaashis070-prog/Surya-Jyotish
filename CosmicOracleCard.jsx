import { useState } from 'react';
import { Moon, RefreshCw } from 'lucide-react';
import Card from '../common/Card.jsx';
import Badge from '../common/Badge.jsx';
import { offlineOracleGenerate } from '../../engines/ai-offline-engine/offlineOracle.js';

function parseOracleText(raw) {
  const [narrativeRaw, rest] = raw.split('PREDICTION_JSON:');
  const narrative = narrativeRaw.trim();
  let scores = null;
  if (rest) {
    const match = rest.match(/\{[\s\S]*?\}/);
    if (match) {
      try { scores = JSON.parse(match[0]); } catch { scores = null; }
    }
  }
  return { narrative, scores };
}

const SCORE_LABELS = {
  career_growth: 'Career growth', financial_gain: 'Financial gain', relationship_harmony: 'Relationship harmony',
  health_stability: 'Health stability', mental_clarity: 'Mental clarity', spiritual_progress: 'Spiritual progress',
  risk_factor: 'Risk factor', favorable_period_days: 'Favorable days',
};

export default function CosmicOracleCard() {
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const raw = await offlineOracleGenerate();
    setReading(parseOracleText(raw));
    setLoading(false);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Moon size={16} className="text-indigo" />
          <h3 className="font-display text-lg text-indigo">Cosmic Oracle</h3>
        </div>
        <Badge tone="neutral">{'Offline mode — general reading, not calculated from your chart'}</Badge>
      </div>
      <p className="text-xs text-ink/50 mb-3">
        This app doesn't include a live, per-person AI oracle — that would require a paid API key, and the goal here is to stay 100% free.
        This card instead draws one of a few pre-written general readings for reflection and entertainment. Your real, chart-based results
        are the Kundli, Dasha, Yogas, Transits, and Probabilities elsewhere in this app.
      </p>
      {!reading ? (
        <button onClick={generate} disabled={loading} className="rounded-md bg-indigo text-ivory px-4 py-2 text-sm font-medium hover:bg-indigo-light transition-colors disabled:opacity-60">
          {loading ? 'Drawing a reading…' : 'Draw a reading'}
        </button>
      ) : (
        <div>
          <p className="text-sm text-ink/75 whitespace-pre-line leading-relaxed">{reading.narrative}</p>
          {reading.scores && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {Object.entries(reading.scores).filter(([k]) => SCORE_LABELS[k]).map(([k, v]) => (
                <div key={k} className="rounded-md bg-indigo/5 border border-indigo/10 px-2.5 py-2">
                  <p className="text-[10px] text-ink/45 uppercase tracking-wide">{SCORE_LABELS[k]}</p>
                  <p className="font-display text-indigo">{v}{typeof v === 'number' && k !== 'favorable_period_days' ? '%' : ''}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-ink/40 mt-3">Generic sample values — not derived from your birth data.</p>
          <button onClick={generate} disabled={loading} className="mt-3 flex items-center gap-1.5 text-xs text-teal underline underline-offset-2">
            <RefreshCw size={12} /> Draw another
          </button>
        </div>
      )}
    </Card>
  );
}
