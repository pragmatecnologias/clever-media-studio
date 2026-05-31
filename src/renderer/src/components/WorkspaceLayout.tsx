import React from 'react';
import { useAppStore } from '../lib/store';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import SettingsDrawer from './SettingsDrawer';
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_GOAL_LABELS } from '../lib/labels';
import SlidePreviewScreen from '../screens/SlidePreviewScreen';
import SocialPackPreviewScreen from '../screens/SocialPackPreviewScreen';
import ExportScreen from '../screens/ExportScreen';

function SummaryPanel() {
  const { campaign } = useAppStore();
  const analysis = campaign.analysis as any;
  const deckResults = campaign.deckResults as any;
  const socialResults = campaign.socialResults as any;
  const captionResults = campaign.captionResults as any;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Campaign Summary</h3>
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="Title" value={campaign.title || 'Untitled'} />
        <InfoCard label="Type" value={CAMPAIGN_TYPE_LABELS[campaign.campaignType] || campaign.campaignType || 'Not set'} />
        <InfoCard label="Goal" value={CAMPAIGN_GOAL_LABELS[campaign.campaignGoal] || campaign.campaignGoal || 'Not set'} />
        <InfoCard label="Status" value={campaign.status || 'draft'} />
        <InfoCard label="Passage" value={campaign.passageOrTopic || '—'} />
        <InfoCard label="Tone" value={campaign.tone || '—'} />
        <InfoCard label="CTA" value={campaign.cta || '—'} />
        <InfoCard label="Language" value={campaign.language === 'en' ? 'English' : 'Español'} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Slides" value={deckResults?.slideCount || 0} />
        <StatCard label="Social Assets" value={socialResults?.assetCount || socialResults?.assetIds?.length || 0} />
        <StatCard label="Captions" value={(captionResults?.length) || 0} />
      </div>

      {campaign.mainMessage && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Main Message</p>
          <p className="text-sm text-gray-300">{campaign.mainMessage.slice(0, 300)}</p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-200 truncate">{value}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
      <p className="text-2xl font-bold text-purple-300">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function SourcePanel() {
  const { campaign } = useAppStore();
  const wordCount = (campaign.sourceText || '').split(/\s+/).filter(Boolean).length;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Source Text</h3>
        <span className="text-xs text-gray-500">{wordCount} words · {campaign.language}</span>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
        <pre className="text-xs text-gray-400 whitespace-pre-wrap font-sans">{campaign.sourceText}</pre>
      </div>
    </div>
  );
}

function ConfigurePanel() {
  const { campaign, updateCampaign } = useAppStore();
  return (
    <div className="space-y-4 max-w-xl">
      <h3 className="text-lg font-semibold">Configure Campaign</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title" value={campaign.title} onChange={(v) => updateCampaign({ title: v })} />
        <Field label="Passage / Topic" value={campaign.passageOrTopic} onChange={(v) => updateCampaign({ passageOrTopic: v })} />
        <Field label="Main Message" value={campaign.mainMessage} onChange={(v) => updateCampaign({ mainMessage: v })} />
        <Field label="Tone" value={campaign.tone} onChange={(v) => updateCampaign({ tone: v })} />
        <Field label="CTA" value={campaign.cta} onChange={(v) => updateCampaign({ cta: v })} />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <label className="flex items-center gap-2">
          <Toggle checked={campaign.outputSelections.presentationDeck}
            onChange={() => updateCampaign({ outputSelections: { ...campaign.outputSelections, presentationDeck: !campaign.outputSelections.presentationDeck } })} />
          <span className="text-xs text-gray-400">Slides</span>
        </label>
        <label className="flex items-center gap-2">
          <Toggle checked={campaign.outputSelections.socialPack}
            onChange={() => updateCampaign({ outputSelections: { ...campaign.outputSelections, socialPack: !campaign.outputSelections.socialPack } })} />
          <span className="text-xs text-gray-400">Social</span>
        </label>
        <label className="flex items-center gap-2">
          <Toggle checked={campaign.outputSelections.captionPack}
            onChange={() => updateCampaign({ outputSelections: { ...campaign.outputSelections, captionPack: !campaign.outputSelections.captionPack } })} />
          <span className="text-xs text-gray-400">Captions</span>
        </label>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-200" />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`w-8 h-4 rounded-full transition-colors relative ${checked ? 'bg-purple-500' : 'bg-white/20'}`}>
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
    </button>
  );
}

function WarningsPanel() {
  const { campaign } = useAppStore();
  const analysis = campaign.analysis as any;
  const warnings: string[] = analysis?.warnings || [];
  const qualityWarnings: string[] = (campaign.deckResults as any)?.quality?.warnings || [];

  const allWarnings = [
    ...warnings.map((w) => ({ cat: 'Analysis', msg: w })),
    ...qualityWarnings.map((w) => ({ cat: 'Quality', msg: w })),
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Warnings</h3>
      {allWarnings.length === 0 ? (
        <p className="text-sm text-gray-500">No warnings</p>
      ) : (
        <div className="space-y-2">
          {allWarnings.map((w, i) => (
            <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">⚠</span>
              <div>
                <span className="text-[10px] text-amber-500/70 uppercase block">{w.cat}</span>
                <p className="text-xs text-amber-300">{w.msg}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkspaceLayout() {
  const { workspaceTab } = useAppStore();

  const renderPanel = () => {
    switch (workspaceTab) {
      case 'summary': return <SummaryPanel />;
      case 'source': return <SourcePanel />;
      case 'configure': return <ConfigurePanel />;
      case 'slides': return <SlidePreviewScreen />;
      case 'social': return <SocialPackPreviewScreen />;
      case 'captions': return <CaptionsPanel />;
      case 'exports': return <ExportScreen />;
      case 'warnings': return <WarningsPanel />;
      default: return <SummaryPanel />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPanel()}
        </main>
      </div>
      <SettingsDrawer />
    </div>
  );
}

function CaptionsPanel() {
  const { campaign } = useAppStore();
  const captionResults = (campaign.captionResults || []) as any[];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Captions</h3>
      {captionResults.length === 0 ? (
        <p className="text-sm text-gray-500">No captions generated yet.</p>
      ) : (
        <div className="space-y-3">
          {captionResults.map((caption: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Caption {i + 1}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">{caption.cta || 'No CTA'}</span>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{caption.longCaption || caption.captionPreview}</p>
              {caption.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {caption.hashtags.map((tag: string) => (
                    <span key={tag} className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              )}
              <button onClick={() => navigator.clipboard.writeText(caption.longCaption || caption.captionPreview || '')}
                className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
                Copy caption
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
