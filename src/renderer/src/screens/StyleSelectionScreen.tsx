import React from 'react';
import { useAppStore } from '../lib/store';

const visualStyles = [
  { key: 'auto', label: 'Auto (Match Content)', desc: 'Automatically selects the best style based on campaign type' },
  { key: 'reverent_worship', label: 'Reverent Worship', desc: 'Calm, sacred, worship-service invitation, balanced typography' },
  { key: 'warm_pastoral', label: 'Warm Pastoral', desc: 'Comforting, personal, hopeful, good for pastoral encouragement' },
  { key: 'evangelistic_invitation', label: 'Evangelistic Invitation', desc: 'Clear invitation, welcoming language, simple public-facing CTA' },
  { key: 'hopeful_prophecy', label: 'Hopeful Prophecy', desc: 'Bold but non-sensational, gospel-centered, worship/endurance language' },
  { key: 'bible_study_clean', label: 'Bible Study Clean', desc: 'Minimal, scripture-centered, educational, uncluttered' },
  { key: 'youth_modern', label: 'Youth Modern', desc: 'Shorter copy, bold type, modern contrast, energetic CTA' },
  { key: 'spanish_church_warm', label: 'Spanish Church Warm', desc: 'Spanish-first tone, warm family/church invitation' },
  { key: 'modern_church', label: 'Modern Church', desc: 'Contemporary, clean, bright, minimal with strong imagery' },
  { key: 'minimal_clean', label: 'Minimal Clean', desc: 'Ultra-clean, typography-first, minimal decoration' },
];

export default function StyleSelectionScreen() {
  const { setScreen, updateCampaign, campaign } = useAppStore();
  const [selected, setSelected] = React.useState(campaign.tone || 'auto');

  const handleContinue = () => {
    updateCampaign({ tone: selected });
    setScreen('outputs');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Choose Visual Style</h2>
      <p className="text-gray-400 text-sm">
        Style affects copy tone, layout, typography, image motifs, and CTA style across all generated assets.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {visualStyles.map((style) => (
          <button
            key={style.key}
            onClick={() => setSelected(style.key)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selected === style.key
                ? 'border-purple-500/40 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                : 'border-white/10 bg-white/5 hover:bg-white/8'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected === style.key ? 'border-purple-400 bg-purple-500' : 'border-white/20'}`} />
              <div>
                <p className="text-sm font-semibold">{style.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{style.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setScreen('outputs')} className="px-4 py-2 bg-white/5 rounded-lg text-sm">Skip</button>
        <button onClick={handleContinue} className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold">Continue</button>
      </div>
    </div>
  );
}
