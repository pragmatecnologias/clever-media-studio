import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient } from '../lib/api';
import appPackage from '../../../../package.json';

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 text-right">{value || '—'}</span>
    </div>
  );
}

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export default function SettingsScreen() {
  const { backendUrl, setBackendUrl, appSettings, updateAppSettings, clearCampaignHistory, campaigns, setScreen } = useAppStore();
  const [testing, setTesting] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'connected' | 'failed'>('idle');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState('');
  const [logoLoadError, setLogoLoadError] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const churchKit = appSettings.churchKit || {};
  const updateChurchKit = (partial: Record<string, unknown>) => {
    updateAppSettings({
      churchKit: {
        ...churchKit,
        ...partial,
      },
    });
    setSaveStatus('dirty');
  };

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    setSaveError('');
    try {
      updateAppSettings({
        churchKit: { ...appSettings.churchKit },
        churchName: appSettings.churchName,
        churchShortName: appSettings.churchShortName,
        defaultLanguage: appSettings.defaultLanguage,
      });
      setSaveStatus('saved');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err?.message || 'Save failed');
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateChurchKit({ logoPath: String(reader.result || '') });
      setLogoLoadError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    updateChurchKit({ logoPath: '', logoAssetId: '' });
    setLogoLoadError(false);
  };

  const logoPath = churchKit.logoPath || '';
  const socialHandles = churchKit.socialHandles || {};

  const updateSocialHandle = (platform: string, value: string) => {
    updateChurchKit({
      socialHandles: {
        ...socialHandles,
        [platform]: value,
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Settings</h2>
        <div className="flex items-center gap-3">
          {saveStatus === 'dirty' ? (
            <span className="text-xs text-amber-400">Unsaved changes</span>
          ) : saveStatus === 'saving' ? (
            <span className="text-xs text-gray-400">Saving...</span>
          ) : saveStatus === 'saved' ? (
            <span className="text-xs text-green-400">✓ Saved</span>
          ) : saveStatus === 'error' ? (
            <span className="text-xs text-red-400">{saveError || 'Save failed'}</span>
          ) : null}
          <button
            onClick={handleSaveSettings}
            disabled={saveStatus === 'saving'}
            data-testid="settings-save-button"
            className="px-5 py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-all"
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

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
          onChange={(e) => updateAppSettings({
            churchName: e.target.value,
            churchKit: { ...churchKit, churchName: e.target.value },
          })}
          placeholder="Church name"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
        />
        <input
          value={appSettings.churchShortName}
          onChange={(e) => updateAppSettings({
            churchShortName: e.target.value,
            churchKit: { ...churchKit, shortName: e.target.value },
          })}
          placeholder="Short name / abbreviation"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Church Kit</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={churchKit.address || ''}
            onChange={(e) => updateChurchKit({ address: e.target.value })}
            placeholder="Address"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={churchKit.website || ''}
            onChange={(e) => updateChurchKit({ website: e.target.value })}
            placeholder="Website"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={churchKit.phone || ''}
            onChange={(e) => updateChurchKit({ phone: e.target.value })}
            placeholder="Phone"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={churchKit.livestreamUrl || ''}
            onChange={(e) => updateChurchKit({ livestreamUrl: e.target.value })}
            placeholder="Livestream URL"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={churchKit.defaultServiceTime || ''}
            onChange={(e) => updateChurchKit({ defaultServiceTime: e.target.value })}
            placeholder="Default service time"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={churchKit.defaultCTA || ''}
            onChange={(e) => updateChurchKit({ defaultCTA: e.target.value })}
            placeholder="Default CTA"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={churchKit.typographyPreset || ''}
            onChange={(e) => updateChurchKit({ typographyPreset: e.target.value })}
            placeholder="Typography preset"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
        </div>

        {/* Logo section */}
        <div className="space-y-2">
          <label className="block text-xs text-gray-500">Logo</label>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-32 h-32 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
              {logoPath && !logoLoadError ? (
                <img
                  src={logoPath}
                  alt="Church logo"
                  className="max-w-full max-h-full object-contain"
                  onError={() => setLogoLoadError(true)}
                />
              ) : logoLoadError ? (
                <span className="text-xs text-red-400 text-center px-2">Logo preview unavailable</span>
              ) : (
                <span className="text-xs text-gray-600 text-center px-2">No logo uploaded</span>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="block">
                <span className="text-[10px] text-gray-500">Upload logo file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleLogoUpload(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-gray-200 hover:file:bg-white/15"
                />
              </label>
              <input
                value={logoPath}
                onChange={(e) => { updateChurchKit({ logoPath: e.target.value }); setLogoLoadError(false); }}
                placeholder="Or paste logo data URL / path"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300"
              />
              {logoPath ? (
                <button
                  onClick={handleRemoveLogo}
                  className="text-xs text-red-400 hover:text-red-300 self-start"
                >
                  Remove logo
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={String(churchKit.brandColors?.primary || '')}
            onChange={(e) => updateChurchKit({ brandColors: { ...(churchKit.brandColors || {}), primary: e.target.value } })}
            placeholder="Primary color"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={String(churchKit.brandColors?.secondary || '')}
            onChange={(e) => updateChurchKit({ brandColors: { ...(churchKit.brandColors || {}), secondary: e.target.value } })}
            placeholder="Secondary color"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={String(churchKit.brandColors?.accent || '')}
            onChange={(e) => updateChurchKit({ brandColors: { ...(churchKit.brandColors || {}), accent: e.target.value } })}
            placeholder="Accent color"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
        </div>
      </section>

      {/* Social Links */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Social Links</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={socialHandles.instagram || ''}
            onChange={(e) => updateSocialHandle('instagram', e.target.value)}
            placeholder="Instagram (@handle or URL)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={socialHandles.facebook || ''}
            onChange={(e) => updateSocialHandle('facebook', e.target.value)}
            placeholder="Facebook (URL or page name)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={socialHandles.youtube || ''}
            onChange={(e) => updateSocialHandle('youtube', e.target.value)}
            placeholder="YouTube (channel URL)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
          <input
            value={socialHandles.x || ''}
            onChange={(e) => updateSocialHandle('x', e.target.value)}
            placeholder="X / Twitter (handle or URL)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
          />
        </div>
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

      <div className="flex justify-between pt-4">
        <button onClick={() => setScreen('welcome')}
          className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400">
          Back to Home
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={saveStatus === 'saving'}
          data-testid="settings-save-button-bottom"
          className="px-5 py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-all"
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
