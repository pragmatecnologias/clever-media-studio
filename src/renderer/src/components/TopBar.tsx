import React from 'react';
import { useAppStore } from '../lib/store';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', analyzed: 'Analyzed', ready_to_generate: 'Ready',
  generating: 'Generating', generated: 'Generated',
  needs_review: 'Needs Review', exported: 'Exported', failed: 'Failed',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  analyzed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  generating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  generated: 'bg-green-500/10 text-green-400 border-green-500/20',
  exported: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function TopBar() {
  const { setScreen, campaign, saveCampaign, toggleDrawer, drawerOpen } = useAppStore();
  const status = campaign.status || 'draft';
  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.draft;

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-gray-900/50">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { saveCampaign(); setScreen('welcome'); }}
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          ← Home
        </button>
        <span className="text-gray-600">|</span>
        <h2 className="text-sm font-semibold text-gray-200 truncate max-w-md">
          {campaign.title || 'Untitled Campaign'}
        </h2>
        <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={saveCampaign}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-xs transition-all">
          Save
        </button>
        <button onClick={toggleDrawer}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
            drawerOpen ? 'bg-purple-500/20 text-purple-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}>
          ⚙ Advanced
        </button>
      </div>
    </div>
  );
}
