import React, { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient, type CampaignResponseDto, type ExportDownloadInfo } from '../lib/api';
import { selectCampaignExportViewModel } from '../lib/export-view-model';
import { labelOutput } from '../lib/labels';

const exportFormats = [
  { key: 'pptx', label: 'PPTX', desc: 'Presentation deck file' },
  { key: 'pdf', label: 'PDF', desc: 'Portable document' },
  { key: 'png', label: 'PNG Images', desc: 'Slide image folder' },
  { key: 'captions_json', label: 'Captions JSON', desc: 'Structured caption data' },
  { key: 'captions_txt', label: 'Captions TXT', desc: 'Plain text caption data' },
  { key: 'source_txt', label: 'Source TXT', desc: 'Original source text' },
  { key: 'zip', label: 'ZIP Package', desc: 'Export archive' },
];

function statusClass(status: string) {
  if (status === 'ready') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  if (status === 'failed') return 'bg-red-500/10 text-red-300 border-red-500/20';
  if (status === 'running' || status === 'queued') return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  return 'bg-white/5 text-gray-300 border-white/10';
}

function availabilityClass(value: string) {
  if (value === 'downloadable') return 'text-emerald-300';
  if (value === 'included') return 'text-blue-300';
  return 'text-gray-500';
}

function matchesFormat(file: { key: string; fileName: string; format: string }, formatKey: string): boolean {
  const normalized = formatKey.toLowerCase();
  const key = file.key.toLowerCase();
  const name = file.fileName.toLowerCase();
  const format = file.format.toLowerCase();

  if (key === normalized || format === normalized) return true;
  if (normalized === 'captions_json') return name.includes('captions') && name.endsWith('.json');
  if (normalized === 'captions_txt') return name.includes('captions') && name.endsWith('.txt');
  if (normalized === 'source_txt') return name.includes('source') && name.endsWith('.txt');
  if (normalized === 'pptx') return name.endsWith('.pptx');
  if (normalized === 'pdf') return name.endsWith('.pdf');
  if (normalized === 'png') return name.includes('png');
  if (normalized === 'zip') return name.endsWith('.zip');
  return name.includes(normalized);
}

function normalizeRequestError(err: any, fallback: string): string {
  const message = err?.response?.data?.message || err?.message || '';
  if (/ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|Network Error|connect\s+ECONNREFUSED/i.test(message)) {
    return fallback;
  }
  return message || fallback;
}

export default function ExportScreen() {
  const { setScreen, campaign, backendUrl, updateCampaign } = useAppStore();
  const [backendCampaign, setBackendCampaign] = useState<CampaignResponseDto | null>(null);
  const [exportInfo, setExportInfo] = useState<ExportDownloadInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const api = useMemo(() => createApiClient(backendUrl), [backendUrl]);
  const exportView = useMemo(
    () => selectCampaignExportViewModel(campaign, backendCampaign, exportInfo, errorMessage),
    [backendCampaign, campaign, errorMessage, exportInfo],
  );

  const selectedFormats = campaign.advancedSettings.exportFormats || [];

  const loadExportState = async () => {
    if (!campaign.campaignId) return;
    setRefreshing(true);
    setErrorMessage('');
    try {
      const data = await api.getCampaign(campaign.campaignId);
      setBackendCampaign(data);
      updateCampaign({
        status: data.summary.status,
        deckResults: data.generatedMedia.deck || campaign.deckResults,
        socialResults: data.generatedMedia.socialPack || campaign.socialResults,
        captionResults: data.generatedMedia.captions || campaign.captionResults,
        exportResults: data.generatedMedia.exports?.[0] || campaign.exportResults,
      });

      if (data.exportJobId) {
        const info = await api.getExportDownloadInfo(campaign.campaignId, data.exportJobId);
        setExportInfo(info);
      } else {
        setExportInfo(null);
      }
    } catch (err: any) {
      setErrorMessage(normalizeRequestError(err, 'Backend disconnected'));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadExportState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign.campaignId, backendUrl]);

  const toggleFormat = (key: string) => {
    const next = selectedFormats.includes(key)
      ? selectedFormats.filter((format) => format !== key)
      : [...selectedFormats, key];
    updateCampaign({
      advancedSettings: {
        ...campaign.advancedSettings,
        exportFormats: next,
      },
    });
  };

  const handleExport = async () => {
    if (!campaign.campaignId) return;
    setExporting(true);
    setErrorMessage('');
    try {
      const result = await api.exportCampaign(campaign.campaignId, selectedFormats);
      const data = await api.getCampaign(campaign.campaignId);
      setBackendCampaign(data);
      const info = await api.getExportDownloadInfo(campaign.campaignId, result.exportJobId);
      setExportInfo(info);
      setBackendCampaign(data);
      updateCampaign({
        exportResults: data.generatedMedia.exports?.[0] || campaign.exportResults,
      });
    } catch (err: any) {
      setErrorMessage(normalizeRequestError(err, 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const openExportFolder = () => {
    if (!exportView.downloadDir) return;
    const apiBridge = (window as any).electronAPI;
    if (apiBridge?.openPath) {
      apiBridge.openPath(exportView.downloadDir).then((result: string) => {
        if (result) {
          setErrorMessage(`Open Folder failed: ${result}`);
        }
      }).catch(() => {
        setErrorMessage('Open Folder failed.');
      });
    }
  };

  const openExportZip = () => {
    if (!exportView.zipFilePath) return;
    const apiBridge = (window as any).electronAPI;
    if (apiBridge?.openPath) {
      apiBridge.openPath(exportView.zipFilePath).then((result: string) => {
        if (result) {
          setErrorMessage(`Open ZIP failed: ${result}`);
        }
      }).catch(() => {
        setErrorMessage('Open ZIP failed.');
      });
    }
  };

  const copyExportPath = async () => {
    const pathToCopy = exportView.zipFilePath || exportView.downloadDir;
    if (!pathToCopy) return;
    const apiBridge = (window as any).electronAPI;
    if (apiBridge?.copyText) {
      await apiBridge.copyText(pathToCopy);
    }
  };

  const manifestState = exportView.manifestAvailable ? 'Available' : 'Not available';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Export Center</p>
          <h2 className="text-2xl font-bold">{exportView.title || 'Untitled Campaign'}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <span>{exportView.selectedPackageLabel}</span>
            <span className="text-gray-700">•</span>
            <span>{exportView.visualStyleLabel}</span>
            <span className="text-gray-700">•</span>
            <span>{exportView.exportReadinessLabel}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setScreen('review')}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
          >
            Back to Review
          </button>
          <button
            onClick={loadExportState}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Export Status'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-sm text-purple-200 hover:bg-purple-500/20 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : exportView.exportStatus === 'ready' ? 'Export Again' : errorMessage ? 'Retry Export' : 'Export Package'}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Package Contents</p>
              <h3 className="text-lg font-semibold text-gray-100 mt-1">Real export state</h3>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${statusClass(exportView.exportStatus)}`}>
              {exportView.exportStatusLabel}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <InfoCard label="Deck" value={`${exportView.slideCount} slides`} />
            <InfoCard label="Social" value={`${exportView.socialAssetCount} images`} />
            <InfoCard label="Captions" value={`${exportView.captionCount} captions`} />
            <InfoCard label="Source text" value={exportView.sourceIncluded ? 'Included' : 'Not included'} />
            <InfoCard label="Manifest" value={manifestState} />
            <InfoCard label="Generated files" value={String(exportView.totalGeneratedFiles)} />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Export job</span>
              <span className="font-mono text-xs text-gray-400">{exportView.downloadId || 'Not generated yet'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Last generated</span>
              <span className="text-sm text-gray-100">{exportView.lastGeneratedAt ? new Date(exportView.lastGeneratedAt).toLocaleString() : 'Unavailable'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Export path</span>
              <span className="font-mono text-[11px] text-gray-400 break-all text-right">{exportView.downloadDir || 'Not exported yet'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">ZIP file</span>
              <span className="font-mono text-[11px] text-gray-400 break-all text-right">{exportView.zipFilePath || 'Not generated yet'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {exportView.downloadDir ? (
              <button
                onClick={openExportFolder}
                className="px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-sm text-purple-200 hover:bg-purple-500/20"
              >
                Open Folder
              </button>
            ) : null}
            {exportView.zipFilePath ? (
              <button
                onClick={openExportZip}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
              >
                Open ZIP
              </button>
            ) : null}
            {exportView.zipFilePath || exportView.downloadDir ? (
              <button
                onClick={copyExportPath}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
              >
                Copy Path
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Formats</p>
            <h3 className="text-lg font-semibold text-gray-100 mt-1">Selected formats</h3>
          </div>
          <div className="space-y-2">
            {exportFormats.map((format) => {
              const selected = selectedFormats.includes(format.key);
              const file = exportView.availableExportFiles.find((item) => matchesFormat(item, format.key));
              return (
                <label
                  key={format.key}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selected ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/10 bg-black/20 hover:bg-white/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleFormat(format.key)}
                    className="mt-1 h-4 w-4 accent-purple-500"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-100">{format.label}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${selected ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                        {selected ? 'Selected' : 'Not selected'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{format.desc}</p>
                    <p className={`text-xs ${availabilityClass(file?.availability || 'unavailable')}`}>
                      {file ? `${file.fileName} · ${file.note}` : exportView.exportReadinessLabel}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Available files</p>
            <h3 className="text-lg font-semibold text-gray-100 mt-1">What the backend actually created</h3>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {exportView.availableExportFiles.map((file) => (
            <div key={file.key} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-100">{file.label}</p>
                  <p className="text-[11px] text-gray-500">{labelOutput(file.key)}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${file.availability === 'downloadable' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : file.availability === 'included' ? 'border-blue-500/20 bg-blue-500/10 text-blue-200' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                  {file.availability === 'downloadable' ? 'Downloadable' : file.availability === 'included' ? 'Included in ZIP' : 'Unavailable'}
                </span>
              </div>
              <p className="font-mono text-[11px] text-gray-400 break-all">{file.fileName}</p>
              <p className="text-xs text-gray-500 break-words">{file.note}</p>
              <p className="text-[11px] text-gray-600 break-all">{file.path}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-100">{value}</p>
    </div>
  );
}
