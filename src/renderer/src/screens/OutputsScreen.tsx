import React from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient } from '../lib/api';
import { PRESETS } from '../lib/presets';

export default function OutputsScreen() {
  const { setScreen, campaign, updateCampaign, backendUrl } = useAppStore();
  const [generating, setGenerating] = React.useState(false);

  const outputs = campaign.outputSelections;

  const toggle = (key: keyof typeof outputs) => {
    updateCampaign({ outputSelections: { ...outputs, [key]: !outputs[key] } });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const api = createApiClient(backendUrl);
      const createResult = await api.createCampaign(
        campaign,
        campaign.analysis as any,
      );
      updateCampaign({ campaignId: createResult.campaignId });
      const genResult = await api.generateMediaPack(createResult.campaignId, {
        outputs: {
          presentationDeck: { enabled: outputs.presentationDeck },
          socialPack: { enabled: outputs.socialPack },
          captionPack: { enabled: outputs.captionPack },
        },
        visualStyle: 'auto',
      });
      updateCampaign({ generationJobId: genResult.jobId });
      setScreen('generating');
    } catch (err: any) {
      console.warn('Generation failed:', err?.message);
    } finally {
      setGenerating(false);
    }
  };

  const deckTypes = ['sermon_presentation','teaching_deck','event_announcement','campaign_pitch','devotional_deck'];
  const slideCounts = ['Auto','6','8','10','12','15'];
  const [deckType, setDeckType] = React.useState('auto');
  const [slideCount, setSlideCount] = React.useState('Auto');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Select Outputs</h2>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map(p => (
          <button key={p.id}
            onClick={() => { updateCampaign({ outputSelections: { ...p.outputSelections }, presetId: p.id }); }}
            className={`text-left p-3 rounded-lg border transition-all ${
              campaign.presetId === p.id ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'
            }`}>
            <p className="text-base mb-0.5">{p.icon}</p>
            <p className="text-xs font-semibold text-gray-200">{p.name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{p.description}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Toggle label="Presentation Deck" description="Generate slides for your campaign" checked={outputs.presentationDeck} onChange={() => toggle('presentationDeck')} />
        {outputs.presentationDeck && (
          <div className="ml-8 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Deck Type</label>
              <select value={deckType} onChange={(e) => setDeckType(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm">
                <option value="auto">Auto (based on campaign)</option>
                {deckTypes.map(dt => <option key={dt} value={dt}>{dt.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Slide Count</label>
              <select value={slideCount} onChange={(e) => setSlideCount(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm">
                {slideCounts.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>
          </div>
        )}
        <Toggle label="Social Pack" description="Generate social invitation or devotional assets" checked={outputs.socialPack} onChange={() => toggle('socialPack')} />
        <Toggle label="Caption Package" description="Generate platform-ready captions" checked={outputs.captionPack} onChange={() => toggle('captionPack')} />
        <Toggle label="YouTube Thumbnail" description="Generate a video thumbnail" checked={outputs.thumbnail} onChange={() => toggle('thumbnail')} />
      </div>
      <div className="flex gap-3">
        <button onClick={() => setScreen('details')} className="px-4 py-2 bg-white/5 rounded-lg text-sm">Back</button>
        <button onClick={handleGenerate} disabled={generating} className="px-6 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-700 text-white rounded-lg text-sm font-semibold">
          {generating ? 'Starting...' : 'Generate Media Pack'}
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
      checked
        ? 'border-purple-500 bg-purple-500/10 shadow-sm shadow-purple-500/10'
        : 'border-white/10 bg-white/5 hover:bg-white/8'
    }`}>
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
        checked ? 'bg-purple-500 border-purple-500' : 'border-gray-600 bg-transparent'
      }`}>
        {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-200">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
        checked ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-600'
      }`}>
        {checked ? 'ON' : 'OFF'}
      </span>
    </label>
  );
}
