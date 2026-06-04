import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import CampaignCard from '../components/CampaignCard';
import { createApiClient } from '../lib/api';

export default function WelcomeScreen() {
  const {
    setScreen, updateCampaign, resetCampaign, campaigns,
    loadCampaign, deleteCampaign, duplicateCampaign, backendUrl, saveCampaign,
    reconcileBackendCampaigns,
  } = useAppStore();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [backendMeta, setBackendMeta] = useState<{ storeMode?: string; version?: string; databaseConnected?: boolean } | null>(null);

  useEffect(() => {
    const api = createApiClient(backendUrl);
    api.getHealth()
      .then((health) => {
        setConnected(true);
        setBackendMeta({
          storeMode: health.storeMode,
          version: health.version,
          databaseConnected: health.database.connected,
        });
        // Reconcile campaign history with backend once connected
        reconcileBackendCampaigns();
      })
      .catch(() => {
        setConnected(false);
        setBackendMeta(null);
      });
  }, [backendUrl]);

  const recent = campaigns.slice(0, 12);

  return (
    <div className="max-w-5xl mx-auto mt-12 space-y-10 px-6">
      {/* Hero + quick start */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
          Campaign Studio
        </h1>
        <p className="text-base text-gray-400 max-w-lg mx-auto leading-relaxed">
          Create slides, social graphics, and captions for your sermons, events, and ministry messages.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => { resetCampaign(); setScreen('import'); }}
            className="px-8 py-3.5 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded-xl text-base transition-all shadow-lg shadow-purple-500/20">
            New Campaign
          </button>
          <button onClick={() => {
            navigator.clipboard.readText().then(t => { if (t) { resetCampaign(); updateCampaign({ sourceText: t }); setScreen('import'); } }).catch(() => {});
          }}
            className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm transition-all border border-white/10">
            Paste from Clipboard
          </button>
          <button onClick={async () => {
            const api = (window as any).electronAPI;
            if (api?.importFile) { const f = await api.importFile(); if (f) { resetCampaign(); updateCampaign({ sourceText: f.content, sourceName: f.name }); setScreen('import'); } }
          }}
            className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm transition-all border border-white/10">
            Import File
          </button>
        </div>
      </div>

      {/* Quick-start templates */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Quick Start</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '🙏', title: 'Sermon Invitation', desc: 'Slides, social invites, captions for weekly worship', cta: 'Create', type: 'sermon' },
            { icon: '📅', title: 'Church Event', desc: 'Event graphics, invites, reminder posts', cta: 'Create', type: 'church_event' },
            { icon: '📖', title: 'Devotional Social', desc: 'Quote graphics, reflection stories, devotional posts', cta: 'Create', type: 'devotional' },
            { icon: '🔥', title: 'Youth Program', desc: 'Youth invites, story posts, social graphics', cta: 'Create', type: 'youth_program' },
          ].map(tpl => (
            <button key={tpl.type} onClick={() => { resetCampaign(); updateCampaign({ campaignType: tpl.type, quickStart: tpl.type }); setScreen('import'); }}
              className="text-left p-4 bg-white/3 border border-white/10 rounded-xl hover:border-purple-500/30 hover:bg-white/5 transition-all group">
              <span className="text-2xl block mb-2">{tpl.icon}</span>
              <p className="text-sm font-semibold text-gray-200 group-hover:text-purple-300 transition-colors">{tpl.title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{tpl.desc}</p>
              <span className="inline-block mt-2 text-[10px] text-purple-400/60 group-hover:text-purple-400 transition-colors">{tpl.cta} →</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recent Campaigns</h2>
          <span className="text-xs text-gray-600">{campaigns.length} saved</span>
        </div>

        {recent.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {recent.map(c => (
              <CampaignCard key={c.localId} campaign={c}
                onOpen={() => loadCampaign(c.localId)}
                onDuplicate={() => duplicateCampaign(c.localId)}
                onDelete={() => { if (confirm('Delete this campaign?')) deleteCampaign(c.localId); }} />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl py-16 text-center space-y-2">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-400 text-sm font-medium">No campaigns yet</p>
            <p className="text-gray-600 text-xs max-w-sm mx-auto">
              Paste a sermon, event, devotional, or announcement to create your first media package.
            </p>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between text-xs text-gray-600 pb-8 pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : connected === false ? 'bg-red-400' : 'bg-gray-600'}`} />
            {connected ? 'Backend connected' : connected === false ? 'Backend offline' : 'Checking...'}
          </span>
          <span className="text-gray-700">·</span>
          <span>{backendUrl}</span>
          {backendMeta?.storeMode ? <span className="text-gray-700">·</span> : null}
          {backendMeta?.storeMode ? <span>{backendMeta.storeMode}</span> : null}
          {backendMeta?.databaseConnected !== undefined ? <span className="text-gray-700">·</span> : null}
          {backendMeta?.databaseConnected !== undefined ? <span>{backendMeta.databaseConnected ? 'DB connected' : 'DB disconnected'}</span> : null}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen('settings')} className="hover:text-gray-400 transition-colors">Settings</button>
          <span className="text-gray-700">·</span>
          <span>{backendMeta?.version || 'v1.0'}</span>
        </div>
      </div>
    </div>
  );
}
