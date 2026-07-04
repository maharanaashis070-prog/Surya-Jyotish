import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import SectionDivider from '../components/common/SectionDivider.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import LoadingScreen from '../components/common/LoadingScreen.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import FeedbackButtons from '../components/guidance/FeedbackButtons.jsx';
import CosmicOracleCard from '../components/guidance/CosmicOracleCard.jsx';
import { useChart } from '../context/ChartContext.jsx';
import { useProfiles } from '../context/ProfileContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const JD_EPOCH = 2440587.5;
function jdToDate(jd) { return new Date((jd - JD_EPOCH) * 86400000); }
function fmt(d) { return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

const LEVEL_TONE = { favorable: 'gold', challenging: 'laterite', neutral: 'neutral' };

export default function GuidancePage() {
  const { activeProfile } = useProfiles();
  const { status, data, error, refresh } = useChart();
  const { t } = useSettings();

  if (!activeProfile) return <EmptyState title={t('empty_no_profile')} subtitle={t('empty_no_profile_sub')} action={<Link to="/onboarding" className="mt-2 rounded-md bg-laterite text-ivory px-4 py-2 text-sm font-medium">{t('btn_add_profile')}</Link>} />;
  if (status === 'loading' || status === 'idle') return <LoadingScreen label={t('loading_chart')} />;
  if (status === 'error') return <ErrorBanner message={error} onRetry={refresh} />;

  const { guidance } = data;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader title="Guidance & Alerts" subtitle="Favourable/unfavourable windows, alerts, and per-domain decisions — this engine learns from your feedback, stored in this browser." />

      {guidance.alerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {guidance.alerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm ${a.type === 'opportunity' ? 'border-teal/40 bg-teal/10 text-teal' : 'border-laterite/40 bg-laterite/10 text-laterite'}`}>
              {a.type === 'opportunity' ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
              <span>{a.message}</span>
              <span className="ml-auto text-xs opacity-70">{fmt(jdToDate(a.window[0]))} – {fmt(jdToDate(a.window[1]))}</span>
            </div>
          ))}
        </div>
      )}

      <SectionDivider label="Per-domain decisions" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
        {guidance.decisions.map(d => (
          <Card key={d.domain}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg text-indigo capitalize">{d.domain}</h3>
              <Badge tone={LEVEL_TONE[d.level]}>{d.level}</Badge>
            </div>
            <p className="text-sm text-ink/70 mb-3">{d.advice}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink/40">score {d.score.toFixed(1)}</span>
              <FeedbackButtons predictionId={`${activeProfile.id}-${d.domain}-${todayStr}`} domain={d.domain} />
            </div>
          </Card>
        ))}
      </div>

      <SectionDivider label="Scored dasha × transit windows" />
      {guidance.windows.length === 0 ? (
        <EmptyState title="No overlapping windows found" subtitle="No scanned transit event falls inside the current dasha structure — an honest empty result, not a bug." />
      ) : (
        <Card pattern={false} className="p-2 sm:p-3">
          <ul className="divide-y divide-ink/5">
            {guidance.windows.slice(0, 20).map((w, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-2.5 py-2 text-sm">
                <span className="text-ink">{w.dasha} Dasha</span>
                <span className="text-ink/45 text-xs hidden sm:inline">{fmt(jdToDate(w.start))} – {fmt(jdToDate(w.end))}</span>
                <span className={`font-display ${w.score >= 0 ? 'text-teal' : 'text-laterite'}`}>{w.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <SectionDivider label="For fun" />
      <CosmicOracleCard />
    </div>
  );
}
