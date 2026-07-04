import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import LoadingScreen from '../components/common/LoadingScreen.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import { useChart } from '../context/ChartContext.jsx';
import { useProfiles } from '../context/ProfileContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { SIGN_NAMES } from '../engines/chart-engine/chartCalculationEngine.js';
import { planetCode } from '../components/chart/planetGlyphs.js';

const VARGAS = [
  { key: 'D1', label: 'D1 · Rasi', desc: 'The main birth chart — physical body, overall life.' },
  { key: 'D9', label: 'D9 · Navamsa', desc: 'Marriage, dharma, and the inner strength of every planet.' },
  { key: 'D10', label: 'D10 · Dashamsa', desc: 'Career, profession, and public standing.' },
  { key: 'D12', label: 'D12 · Dwadasamsa', desc: 'Parents and ancestry.' },
];

export default function VargaPage() {
  const { activeProfile } = useProfiles();
  const { status, data, error, refresh } = useChart();
  const { t } = useSettings();
  const [active, setActive] = useState('D9');

  if (!activeProfile) return <EmptyState title={t('empty_no_profile')} subtitle={t('empty_no_profile_sub')} action={<Link to="/onboarding" className="mt-2 rounded-md bg-laterite text-ivory px-4 py-2 text-sm font-medium">{t('btn_add_profile')}</Link>} />;
  if (status === 'loading' || status === 'idle') return <LoadingScreen label={t('loading_chart')} />;
  if (status === 'error') return <ErrorBanner message={error} onRetry={refresh} />;

  const { structured } = data;
  const meta = VARGAS.find(v => v.key === active);

  // Group planets by their varga sign, for a compact house-like grid readout.
  const bySign = {};
  for (let i = 0; i < 12; i++) bySign[i] = [];
  structured.planets.forEach(p => {
    const v = p.varga[active];
    bySign[v.sign].push({ ...p, vargaDegree: v.degree });
  });

  return (
    <div>
      <PageHeader title="Divisional Charts (Varga)" subtitle={meta.desc} />
      <div className="flex gap-2 mb-5 flex-wrap">
        {VARGAS.map(v => (
          <button key={v.key} onClick={() => setActive(v.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${active === v.key ? 'bg-gold/20 border-gold text-laterite font-medium' : 'border-ink/15 text-ink/60'}`}>
            {v.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SIGN_NAMES.map((sign, idx) => (
          <Card key={sign} className={`min-h-[92px] ${bySign[idx].length ? '' : 'opacity-60'}`}>
            <p className="text-xs uppercase tracking-wide text-gold-dark mb-1.5">{idx + 1}. {sign}</p>
            {bySign[idx].length === 0 ? (
              <p className="text-xs text-ink/35">—</p>
            ) : (
              <ul className="space-y-0.5">
                {bySign[idx].map(p => (
                  <li key={p.name} className="text-sm text-ink flex justify-between">
                    <span>{planetCode(p.name)} {p.name}{p.isRetro ? ' (R)' : ''}</span>
                    <span className="text-ink/45">{p.vargaDegree.toFixed(1)}°</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
