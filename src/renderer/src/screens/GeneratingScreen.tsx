import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient, type GenerationJob } from '../lib/api';
import { selectCampaignViewModel } from '../lib/campaign-view-model';

const stepLabels: Record<string, string> = {
  'Analyze campaign': 'Analyzing campaign',
  'Plan presentation deck': 'Planning deck layout',
  'Generate slides': 'Writing slide content',
  'Plan social pack': 'Planning social assets',
  'Generate social assets': 'Creating social graphics',
  'Write captions': 'Writing captions',
  'Validate quality': 'Checking quality',
  'Package exports': 'Packaging exports',
};

const phaseNames = [
  { label: 'Queued', range: [0, 9] },
  { label: 'Planning deck', range: [10, 39] },
  { label: 'Creating social assets', range: [40, 69] },
  { label: 'Writing captions', range: [70, 89] },
  { label: 'Finalizing', range: [90, 99] },
  { label: 'Ready', range: [100, 100] },
];

export default function GeneratingScreen() {
  const { setScreen, campaign, backendUrl, updateCampaign, saveCampaign } = useAppStore();
  const view = selectCampaignViewModel(campaign);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const pollCount = useRef(0);
  const MAX_POLLS = 120; // 4 minutes max

  useEffect(() => {
    if (!campaign.generationJobId) { setScreen('outputs'); return; }

    const poll = setInterval(async () => {
      pollCount.current++;
      try {
        const api = createApiClient(backendUrl);
        const status = await api.getJobStatus(campaign.generationJobId!);
        setJob(status);

        if (status.status === 'complete') {
          setDone(true);
          clearInterval(poll);
          updateCampaign({
            deckResults: status.deckResults || null,
            socialResults: status.socialResults || null,
            captionResults: status.captionResults || null,
          });
          // Also try to fetch from campaign endpoint for richer data
          if (campaign.campaignId) {
            try {
              const fc = await api.getCampaign(campaign.campaignId);
              updateCampaign({
                deckResults: fc.generatedMedia?.deck || status.deckResults,
                socialResults: fc.generatedMedia?.socialPack || status.socialResults,
                captionResults: fc.generatedMedia?.captions || status.captionResults,
              });
            } catch {}
          }
          return;
        }

        if (status.status === 'failed') {
          setFailed(true);
          setErrorMsg((status as any).error || 'Generation failed');
          clearInterval(poll);
          return;
        }

        if (pollCount.current >= MAX_POLLS) {
          setFailed(true);
          setErrorMsg('Generation timed out. Check your backend connection and try again.');
          clearInterval(poll);
        }
      } catch {
        if (pollCount.current >= MAX_POLLS) {
          setFailed(true);
          setErrorMsg('Lost connection to backend during generation.');
          clearInterval(poll);
        }
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [campaign.generationJobId, campaign.campaignId]);

  const progress = job?.progress || 0;
  const steps = job?.steps || [];
  const currentPhase = phaseNames.find(p => progress >= p.range[0] && progress <= p.range[1]) || phaseNames[0];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Generating Media</h2>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
          done ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          failed ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
          'bg-purple-500/10 text-purple-300 border border-purple-500/20 animate-pulse'
        }`}>
          {done ? 'Ready' : failed ? 'Failed' : currentPhase.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              failed ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-amber-500'
            }`}
            style={{ width: `${failed ? 100 : progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{progress}%</span>
          {!done && !failed && <span>Poll #{pollCount.current}/{MAX_POLLS}</span>}
        </div>
      </div>

      {/* Step list */}
      {steps.length > 0 && (
        <div className="space-y-1 bg-white/3 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Pipeline Steps</p>
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm py-1">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                step.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                step.status === 'running' ? 'bg-purple-500/20 text-purple-400 animate-pulse' :
                'bg-white/5 text-gray-600'
              }`}>
                {step.status === 'complete' ? '✓' : step.status === 'running' ? '◉' : '○'}
              </span>
              <span className={`flex-1 ${step.status === 'pending' ? 'text-gray-600' : step.status === 'running' ? 'text-purple-200 font-medium' : 'text-gray-300'}`}>
                {stepLabels[step.name] || step.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Failure state */}
      {failed && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-lg font-bold">!</span>
            <div>
              <p className="text-sm font-semibold text-red-300">Generation Failed</p>
              <p className="text-xs text-red-400/80">{errorMsg}</p>
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p>Backend: <span className="text-gray-400 font-mono">{backendUrl}</span></p>
            <p>Job: <span className="text-gray-400 font-mono">{(campaign.generationJobId || '').slice(0, 12)}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setFailed(false); setErrorMsg(''); pollCount.current = 0; setScreen('configure'); }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold">
              Retry Generation
            </button>
            <button onClick={() => setScreen('settings')} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-sm">
              Open Settings
            </button>
            <button onClick={() => setScreen('import')} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm border border-white/10">
              Back to Import
            </button>
            <button onClick={() => {
              const info = `Error: ${errorMsg}\nBackend: ${backendUrl}\nJob: ${campaign.generationJobId}\nTime: ${new Date().toISOString()}`;
              navigator.clipboard.writeText(info).catch(() => {});
            }}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-500 rounded-lg text-xs border border-white/10">
              Copy Diagnostic Info
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {done && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
            <div>
              <p className="text-sm font-semibold text-green-300">Media pack generated successfully</p>
              <p className="text-xs text-green-400/80">Slides, social assets, and captions are ready for review.</p>
            </div>
          </div>
          <button
            onClick={() => {
              updateCampaign({
                status: 'generated',
                deckResults: view.generatedMedia.deck || campaign.deckResults,
                socialResults: view.generatedMedia.socialPack || campaign.socialResults,
                captionResults: view.generatedMedia.captions || campaign.captionResults,
              });
              saveCampaign();
              setScreen('workspace');
            }}
            className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-semibold transition-all"
          >
            Review Generated Media
          </button>
        </div>
      )}

      {/* Job ID for debugging */}
      {campaign.generationJobId && (
        <p className="text-xs text-gray-700 text-center">Job: {campaign.generationJobId.slice(0, 8)}</p>
      )}
    </div>
  );
}
