import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { JYOTISH_ENGINE } from '../../engines/prediction-engine/decisionAdaptiveEngine.js';

export default function FeedbackButtons({ predictionId, domain }) {
  const [submitted, setSubmitted] = useState(null); // 1 | -1 | null

  function submit(rating) {
    try {
      JYOTISH_ENGINE.feedback.collectFeedback(predictionId, rating, domain);
      setSubmitted(rating);
    } catch (e) {
      console.error('[FeedbackButtons] collectFeedback failed', e);
    }
  }

  if (submitted != null) {
    return <span className="flex items-center gap-1.5 text-xs text-teal"><Check size={13} /> Thanks — noted for this browser's learning</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink/45">Useful?</span>
      <button onClick={() => submit(1)} aria-label="Helpful" className="p-1.5 rounded-md border border-ink/15 hover:border-teal hover:text-teal text-ink/50">
        <ThumbsUp size={13} />
      </button>
      <button onClick={() => submit(-1)} aria-label="Not helpful" className="p-1.5 rounded-md border border-ink/15 hover:border-laterite hover:text-laterite text-ink/50">
        <ThumbsDown size={13} />
      </button>
    </div>
  );
}
