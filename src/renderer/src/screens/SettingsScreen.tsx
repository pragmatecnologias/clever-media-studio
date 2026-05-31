import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient } from '../lib/api';

export default function SettingsScreen() {
  const { backendUrl, setBackendUrl, appSettings, updateAppSettings, clearCampaignHistory, campaigns, setScreen } = useAppStore();
  const [testing, setTesting] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'connected' | 'failed'>('idle');

  const testConnection = async () => {
    setTesting(true);
    try {
      const api = createApiClient(backendUrl);
      await api.getJobStatus('0');
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
        {/* Provider status */}
        <div className="flex items-center gap-3 text-xs pt-1">
          <span className="text-gray-500">Providers:</span>
          <span className="flex items-center gap-1.5 text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> FAL.AI
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" /> OpenAI
          </span>
          <span className="flex items-center gap-1.5 text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Local
          </span>
        </div>
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
