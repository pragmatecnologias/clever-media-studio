import React from 'react';
import type { CampaignExportViewModel, ExportFileViewModel } from '../../lib/export-view-model';
import { labelOutput } from '../../lib/labels';

export function ExportSummaryPanel({ exportView }: { exportView: CampaignExportViewModel }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Package Contents</p>
          <h3 className="text-lg font-semibold text-gray-100 mt-1">Real export state</h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded border ${exportView.exportStatus === 'ready' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : exportView.exportStatus === 'failed' ? 'bg-red-500/10 text-red-300 border-red-500/20' : exportView.exportStatus === 'running' || exportView.exportStatus === 'queued' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-white/5 text-gray-300 border-white/10'}`}>
          {exportView.exportStatusLabel}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InfoCard label="Deck" value={`${exportView.slideCount} slides`} />
        <InfoCard label="Social" value={`${exportView.socialAssetCount} images`} />
        <InfoCard label="Captions" value={`${exportView.captionCount} captions`} />
        <InfoCard label="Source text" value={exportView.sourceIncluded ? 'Included' : 'Not included'} />
        <InfoCard label="Manifest" value={exportView.manifestAvailable ? 'Available' : 'Not available'} />
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
    </div>
  );
}

export function ExportActionBar({
  exportView,
  onExport,
  onOpenFolder,
  onOpenZip,
  onCopyPath,
  exportButtonLabel,
}: {
  exportView: CampaignExportViewModel;
  onExport: () => void;
  onOpenFolder: () => void;
  onOpenZip: () => void;
  onCopyPath: () => void;
  exportButtonLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {exportView.downloadDir ? (
        <button
          onClick={onOpenFolder}
          className="px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-sm text-purple-200 hover:bg-purple-500/20"
        >
          Open Folder
        </button>
      ) : null}
      {exportView.zipFilePath ? (
        <button
          onClick={onOpenZip}
          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
        >
          Open ZIP
        </button>
      ) : null}
      {exportView.zipFilePath || exportView.downloadDir ? (
        <button
          onClick={onCopyPath}
          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
        >
          Copy Path
        </button>
      ) : null}
      <button
        onClick={onExport}
        className="px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-sm text-purple-200 hover:bg-purple-500/20"
      >
        {exportButtonLabel}
      </button>
    </div>
  );
}

export function ExportFileGrid({ files }: { files: ExportFileViewModel[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => (
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
