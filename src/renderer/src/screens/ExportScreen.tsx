import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient } from '../lib/api';
import { selectCampaignViewModel } from '../lib/campaign-view-model';

const formats = [
  { key: 'pptx', label: 'PPTX', desc: 'PowerPoint presentation' },
  { key: 'pdf', label: 'PDF', desc: 'Portable document' },
  { key: 'png', label: 'PNG Images', desc: 'Slides as PNG files' },
  { key: 'jpg', label: 'JPG Images', desc: 'Slides as JPG files' },
  { key: 'captions_json', label: 'Captions JSON', desc: 'Structured captions data' },
  { key: 'captions_txt', label: 'Captions TXT', desc: 'Plain text captions' },
  { key: 'zip', label: 'ZIP Package', desc: 'Full export package' },
];

function FileRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 font-mono">{name}</span>
      <span className="text-gray-700">—</span>
      <span className="text-gray-600">{desc}</span>
    </div>
  );
}

export default function ExportScreen() {
  const { setScreen, campaign, backendUrl } = useAppStore();
  const view = selectCampaignViewModel(campaign);
  const [selected, setSelected] = useState<string[]>(['pptx', 'pdf', 'png', 'zip']);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportId, setExportId] = useState('');

  const toggle = (key: string) => {
    setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const handleExport = async () => {
    if (!campaign.campaignId) return;
    setExporting(true);
    try {
      const api = createApiClient(backendUrl);
      const result = await api.exportCampaign(campaign.campaignId, selected);
      setExportId(result.exportJobId);
      setExportDone(true);
    } catch (err: any) {
      console.warn('Export failed:', err?.message);
    } finally {
      setExporting(false);
    }
  };

  // Build export summary from campaign data
  const slideCount = view.summary.counts.slides;
  const assetCount = view.summary.counts.socialAssets;
  const captionCount = view.summary.counts.captions;
  const assetIds = view.generatedMedia.socialPack?.assets?.map((asset) => asset.id) || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Export Center</h2>

      {/* Export summary of what will be in the package */}
      <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Package Contents</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-gray-300">Deck: {slideCount > 0 ? `${slideCount} slides` : 'None'}</span>
            {slideCount > 0 && <span className="text-[10px] text-gray-600">(PPTX + PDF + PNG)</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-300">Social: {assetCount > 0 ? `${assetCount} images` : 'None'}</span>
            {assetCount > 0 && <span className="text-[10px] text-gray-600">({assetIds.length} files)</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-300">Captions: {captionCount > 0 ? `${captionCount} captions` : 'None'}</span>
            {captionCount > 0 && <span className="text-[10px] text-gray-600">(JSON + TXT + MD)</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-300">Source text: {campaign.sourceText ? 'Included' : 'None'}</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-600">
          Formats: {selected.map(s => s.toUpperCase()).join(', ')}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Export Formats</p>
        {formats.map((fmt) => (
          <label key={fmt.key} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selected.includes(fmt.key) ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}>
            <input type="checkbox" checked={selected.includes(fmt.key)} onChange={() => toggle(fmt.key)} className="w-4 h-4 accent-purple-500" />
            <div>
              <p className="text-sm font-semibold text-gray-200">{fmt.label}</p>
              <p className="text-xs text-gray-400">{fmt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {exportDone && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-lg">✓</span>
            <div>
              <p className="text-sm font-semibold text-green-300">Export Complete</p>
              <p className="text-xs text-green-400/80">{new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Export summary */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-gray-500">ZIP filename</p>
              <p className="text-gray-200 font-mono">{view.summary.title?.replace(/\s+/g, '-').toLowerCase() || 'campaign'}-export.zip</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-gray-500">Files</p>
              <p className="text-gray-200">{slideCount + assetCount + captionCount + 5} items</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-gray-500">Saved to</p>
              <p className="text-gray-200 font-mono text-[11px]">uploads/exports/</p>
            </div>
          </div>

          {/* Direct file actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const api = (window as any).electronAPI;
                if (api?.openPath) api.openPath('/Users/admin/CascadeProjects/clever-church/services/clever-slides-backend/uploads/exports');
              }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold transition-all">
              Open Export Folder
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText('/Users/admin/CascadeProjects/clever-church/services/clever-slides-backend/uploads/exports').catch(() => {});
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-xs transition-all">
              Copy Path
            </button>
            <button onClick={() => setExportDone(false)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-all border border-white/10">
              Export Again
            </button>
          </div>

          {/* Collapsed file listing */}
          <details className="text-xs">
            <summary className="text-gray-500 cursor-pointer hover:text-gray-300">View file list ({slideCount + assetCount + captionCount + 5} files)</summary>
            <div className="bg-black/20 rounded-lg p-4 space-y-2 mt-2">
              {slideCount > 0 && (
                <div className="space-y-0.5">
                  <p className="text-[10px] text-purple-400 uppercase tracking-wider">Slides</p>
                  <div className="pl-3 space-y-0.5">
                    <FileRow name="presentation.pptx" desc="PowerPoint" />
                    <FileRow name="presentation.pdf" desc="PDF" />
                    {Array.from({length: Math.min(slideCount, 6)}, (_, i) => (
                      <FileRow key={i} name={`slide-${String(i+1).padStart(2,'0')}.png`} desc="Slide image" />
                    ))}
                  </div>
                </div>
              )}
              {assetCount > 0 && (
                <div className="space-y-0.5">
                  <p className="text-[10px] text-amber-400 uppercase tracking-wider">Social ({assetCount})</p>
                  <div className="pl-3 space-y-0.5">
                    {Array.from({length: Math.min(assetCount, 6)}, (_, i) => (
                      <FileRow key={i} name={`social-${String(i+1).padStart(2,'0')}.jpg`} desc="Social image" />
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-0.5">
                <p className="text-[10px] text-green-400 uppercase tracking-wider">Captions</p>
                <div className="pl-3 space-y-0.5">
                  <FileRow name="captions.json" desc="Data" />
                  <FileRow name="captions.txt" desc="Text" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-blue-400 uppercase tracking-wider">Metadata</p>
                <div className="pl-3 space-y-0.5">
                  <FileRow name="campaign.json" desc="Campaign data" />
                  <FileRow name="source.txt" desc="Original text" />
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setScreen('review')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10">Back</button>
        <button onClick={handleExport} disabled={exporting || selected.length === 0}
          className="px-6 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-semibold transition-all">
          {exporting ? 'Exporting...' : exportDone ? 'Export Again' : 'Export Package'}
        </button>
      </div>
    </div>
  );
}
