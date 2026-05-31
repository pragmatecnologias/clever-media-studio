import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient } from '../lib/api';
import { PRESETS } from '../lib/presets';
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_GOAL_LABELS, TYPE_OPTIONS, GOAL_OPTIONS } from '../lib/labels';

const VISUAL_STYLES = [
  { key: 'auto', label: 'Auto', desc: 'Best match', emoji: '🎨' },
  { key: 'warm_pastoral', label: 'Warm Pastoral', desc: 'Inviting, traditional', emoji: '🕊️' },
  { key: 'modern_clean', label: 'Modern Clean', desc: 'Minimalist, bold', emoji: '✨' },
  { key: 'youth_modern', label: 'Youth Modern', desc: 'Energetic, vibrant', emoji: '🔥' },
  { key: 'bible_study_clean', label: 'Bible Study', desc: 'Calm, focused', emoji: '📖' },
  { key: 'spanish_church_warm', label: 'Iglesia', desc: 'Warm, bilingual', emoji: '🙌' },
];

export default function ConfigureScreen() {
  const { setScreen, campaign, updateCampaign, backendUrl } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [visualStyle, setVisualStyle] = useState('auto');
  const outputs = campaign.outputSelections;

  // Auto-select best preset based on campaign type if none selected yet
  useEffect(() => {
    if (!campaign.presetId && campaign.campaignType) {
      const bestPreset = PRESETS.find(p => p.campaignType === campaign.campaignType)
        || PRESETS.find(p => p.recommendedFor?.includes(campaign.campaignType));
      if (bestPreset) {
        updateCampaign({
          presetId: bestPreset.id,
          campaignType: bestPreset.campaignType,
          campaignGoal: bestPreset.campaignGoal,
          outputSelections: { ...bestPreset.outputSelections },
          advancedSettings: { ...campaign.advancedSettings, socialPackMode: bestPreset.socialPackMode as any },
        });
      }
    }
  }, [campaign.campaignType, campaign.presetId]);

  const toggle = (key: keyof typeof outputs) => {
    updateCampaign({ outputSelections: { ...outputs, [key]: !outputs[key] } });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const api = createApiClient(backendUrl);
      const createResult = await api.createCampaign(campaign, campaign.analysis as any);
      updateCampaign({ campaignId: createResult.campaignId });
      const adv = campaign.advancedSettings;
      const genResult = await api.generateMediaPack(createResult.campaignId, {
        outputs: {
          presentationDeck: { enabled: outputs.presentationDeck },
          socialPack: { enabled: outputs.socialPack },
          captionPack: { enabled: outputs.captionPack },
        },
        visualStyle: adv.visualStyle || visualStyle,
        socialPackMode: adv.socialPackMode,
        platforms: adv.platforms,
        imageProvider: adv.imageProvider,
        targetSlideCount: adv.targetSlideCount !== 'auto' ? Number(adv.targetSlideCount) : undefined,
        deckType: adv.deckType !== 'auto' ? adv.deckType : undefined,
        branding: {
          mode: adv.brandingMode,
          showLogo: adv.showLogo,
          showAddress: adv.showAddress,
          showWebsite: adv.showWebsite,
          showPhone: adv.showPhone,
          showServiceTime: adv.showServiceTime,
        },
        exportFormats: adv.exportFormats,
        includeSource: adv.includeSource,
        includeMetadata: adv.includeMetadata,
      });
      updateCampaign({ generationJobId: genResult.jobId, status: 'generating' });
      setScreen('generating');
    } catch (err: any) {
      console.warn('Generation failed:', err?.message);
    } finally {
      setGenerating(false);
    }
  };

  const pickedPreset = campaign.presetId;
  const activeOutputs = [outputs.presentationDeck, outputs.socialPack, outputs.captionPack, outputs.thumbnail].filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configure & Generate</h2>
          <p className="text-sm text-gray-500 mt-1">
            {campaign.title ? campaign.title : 'Review and finalize your campaign'}
          </p>
        </div>
        <button onClick={handleGenerate} disabled={generating || activeOutputs === 0}
          className="px-8 py-3 bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-base transition-all shadow-lg shadow-purple-500/20">
          {generating ? 'Generating...' : 'Generate Media Pack'}
        </button>
      </div>

      {/* 1. Campaign Details */}
      <Section title="Campaign Details" number={1}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" value={campaign.title} onChange={v => updateCampaign({ title: v })} />
          <Field label="Passage / Topic" value={campaign.passageOrTopic} onChange={v => updateCampaign({ passageOrTopic: v })} />
          <Field label="Main Message" value={campaign.mainMessage} onChange={v => updateCampaign({ mainMessage: v })} />
          <Field label="Tone" value={campaign.tone} onChange={v => updateCampaign({ tone: v })} />
          <Field label="CTA" value={campaign.cta} onChange={v => updateCampaign({ cta: v })} />
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Type</label>
            <select value={campaign.campaignType}
              onChange={e => updateCampaign({ campaignType: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-200">
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* 2. Visual Style */}
      <Section title="Visual Style" number={2}>
        <div className="grid grid-cols-3 gap-2">
          {VISUAL_STYLES.map(s => (
            <button key={s.key} onClick={() => setVisualStyle(s.key)}
              className={`text-left p-3 rounded-lg border transition-all ${
                visualStyle === s.key ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'
              }`}>
              <p className="text-lg mb-1">{s.emoji}</p>
              <p className="text-xs font-semibold text-gray-200">{s.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* 3. Package Presets */}
      <Section title="Choose Package" number={3}>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => {
              updateCampaign({
                outputSelections: { ...p.outputSelections },
                presetId: p.id,
                campaignType: p.campaignType,
                campaignGoal: p.campaignGoal,
                advancedSettings: { ...campaign.advancedSettings, socialPackMode: p.socialPackMode as any },
              });
            }}
            className={`text-left p-3 rounded-lg border transition-all ${
              pickedPreset === p.id ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'
            }`}>
              <p className="text-lg mb-1">{p.icon}</p>
              <p className="text-xs font-semibold text-gray-200">{p.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{p.description}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <ToggleChip label="Slides" checked={outputs.presentationDeck} onChange={() => toggle('presentationDeck')} />
          <ToggleChip label="Social Pack" checked={outputs.socialPack} onChange={() => toggle('socialPack')} />
          <ToggleChip label="Captions" checked={outputs.captionPack} onChange={() => toggle('captionPack')} />
          <ToggleChip label="Thumbnail" checked={outputs.thumbnail} onChange={() => toggle('thumbnail')} />
        </div>
      </Section>

      {/* Generate button bottom */}
      <div className="flex justify-center pt-4 pb-8">
        <button onClick={handleGenerate} disabled={generating || activeOutputs === 0}
          className="px-10 py-4 bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-lg transition-all shadow-lg shadow-purple-500/20">
          {generating ? 'Generating...' : 'Generate Media Pack'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, number, children }: { title: string; number: number; children: React.ReactNode }) {
  return (
    <section className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center">{number}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:border-purple-500/40 focus:outline-none" />
    </div>
  );
}

function ToggleChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
        checked ? 'bg-purple-500/20 text-purple-200 border-purple-500/40' : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/8'
      }`}>
      {checked ? '✓' : ''} {label}
    </button>
  );
}
