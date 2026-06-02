import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient } from '../lib/api';
import appPackage from '../../../../package.json';

export default function SettingsScreen() {
  const { backendUrl, setBackendUrl, appSettings, updateAppSettings, clearCampaignHistory, campaigns, setScreen } = useAppStore();
  const [testing, setTesting] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'connected' | 'failed'>('idle');
  const [health, setHealth] = useState<{
    version?: string;
    storeMode?: 'memory' | 'database';
    database?: { configured: boolean; connected: boolean; name: string };
    queue?: { configured: boolean; connected: boolean; name: string };
    providers?: { fal: boolean; openai: boolean; local: boolean };
    image?: { defaultProvider: string; paidProvidersEnabled: boolean; mockMode: boolean; inpaintEnabled: boolean };
  } | null>(null);

  useEffect(() => {
    const api = createApiClient(backendUrl);
    api.getHealth().then((data) => {
      setHealth(data);
      setConnStatus('connected');
    }).catch(() => {
      setHealth(null);
      setConnStatus('failed');
    });
  }, [backendUrl]);

  const testConnection = async () => {
    setTesting(true);
    try {
      const api = createApiClient(backendUrl);
      const data = await api.getHealth();
      setHealth(data);
      setConnStatus('connected');
    } catch {
      setConnStatus('failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-8 p-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Backend */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Backend Connection</h3>
        <div className="flex gap-2">
          <input
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="http://localhost:3001"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <button onClick={testConnection} disabled={testing}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-xs transition-all disabled:opacity-50">
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${connStatus === 'connected' ? 'bg-green-400' : connStatus === 'failed' ? 'bg-red-400' : 'bg-gray-600'}`} />
            {connStatus === 'connected' ? 'Connected' : connStatus === 'failed' ? 'Connection failed' : 'Not tested'}
          </span>
        </div>
        <div className="grid gap-2 text-xs pt-1 md:grid-cols-2">
          <StatusRow label="App version" value={health?.version || appPackage.version} />
          <StatusRow label="Store mode" value={health?.storeMode || 'unknown'} />
          <StatusRow label="Database" value={health?.database?.connected ? `connected · ${health.database.name}` : health?.database?.configured ? 'configured · disconnected' : 'not configured'} />
          <StatusRow label="Queue" value={health?.queue?.connected ? `connected · ${health.queue.name}` : health?.queue?.configured ? 'configured · disconnected' : 'not configured'} />
          <StatusRow label="Image provider" value={health?.image ? `${health.image.defaultProvider}${health.image.mockMode ? ' · mock' : ''}` : 'unknown'} />
          <StatusRow label="Paid providers" value={health?.image ? (health.image.paidProvidersEnabled ? 'enabled' : 'disabled') : 'unknown'} />
          <StatusRow label="FAL" value={health ? (health.providers?.fal ? 'configured' : 'missing') : 'unknown'} />
          <StatusRow label="OpenAI" value={health ? (health.providers?.openai ? 'configured' : 'missing') : 'unknown'} />
          <StatusRow label="Local fallback" value={health?.providers?.local ? 'available' : 'unknown'} />
        </div>
        {health?.storeMode === 'memory' ? (
          <p className="text-[11px] text-amber-300/80">
            Memory mode is for development only. Campaign history will not survive backend restart.
          </p>
        ) : null}
      </section>

      {/* Church Profile */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Church Profile</h3>
        <input
          value={appSettings.churchName}
          onChange={(e) => updateAppSettings({ churchName: e.target.value })}
          placeholder="Church name"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
        />
        <input
          value={appSettings.churchShortName}
          onChange={(e) => updateAppSettings({ churchShortName: e.target.value })}
          placeholder="Short name / abbreviation"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
        />
      </section>

      {/* Language */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Default Language</h3>
        <select
          value={appSettings.defaultLanguage}
          onChange={(e) => updateAppSettings({ defaultLanguage: e.target.value as 'en' | 'es' })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </section>

      {/* Data */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Data Management</h3>
        <p className="text-xs text-gray-500">{campaigns.length} saved campaigns</p>
        <button
          onClick={() => { if (confirm('Delete all campaign history? This cannot be undone.')) clearCampaignHistory(); }}
          className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20"
        >
          Clear Local History
        </button>
      </section>

      {/* About */}
      <section className="space-y-2 pt-4 border-t border-white/5">
        <p className="text-xs text-gray-600">Clever Campaign Studio v1.0</p>
        <p className="text-xs text-gray-600">Backend: clever-slides-backend</p>
      </section>

      <button onClick={() => setScreen('welcome')}
        className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400">
        Back to Home
      </button>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 text-right">{value}</span>
    </div>
  );
}
