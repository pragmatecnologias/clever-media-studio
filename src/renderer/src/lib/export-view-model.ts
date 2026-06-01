import type { CampaignState } from './store';
import type { CampaignResponseDto, ExportDownloadInfo, ExportManifestFile } from './api';
import { PRESETS } from './presets';
import {
  humanize,
  labelCampaignGoal,
  labelCampaignType,
} from './labels';
import { selectCampaignViewModel } from './campaign-view-model';

export type ExportAvailability = 'downloadable' | 'included' | 'unavailable';

export interface ExportFileViewModel {
  key: string;
  label: string;
  fileName: string;
  path: string;
  format: string;
  availability: ExportAvailability;
  note: string;
}

export interface CampaignExportViewModel {
  title: string;
  selectedPackageLabel: string;
  visualStyleLabel: string;
  slideCount: number;
  socialAssetCount: number;
  captionCount: number;
  totalGeneratedFiles: number;
  selectedExportFormats: string[];
  availableExportFiles: ExportFileViewModel[];
  exportStatus: string;
  exportStatusLabel: string;
  exportReadinessLabel: string;
  exportErrorMessage: string;
  manifestAvailable: boolean;
  downloadId: string;
  downloadDir: string | null;
  zipFilePath: string | null;
  lastGeneratedAt: string | null;
  sourceIncluded: boolean;
}

function resolvePresetLabel(campaign: CampaignState): string {
  const preset = PRESETS.find((item) => item.id === campaign.presetId)
    || PRESETS.find((item) => item.campaignType === campaign.campaignType && item.campaignGoal === campaign.campaignGoal);
  return preset?.name || `${labelCampaignType(campaign.campaignType)} / ${labelCampaignGoal(campaign.campaignGoal)}` || 'Custom';
}

function sanitizeFilename(name: string): string {
  const sanitized = String(name || 'campaign')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return sanitized || 'campaign';
}

function manifestFiles(manifest?: ExportDownloadInfo['manifest']): ExportManifestFile[] {
  return Array.isArray(manifest?.fileList)
    ? manifest.fileList
    : Array.isArray(manifest?.files)
      ? manifest.files
      : [];
}

function fallbackFiles(campaign: CampaignState, selectedExportFormats: string[], exportReady: boolean): ExportFileViewModel[] {
  const base = sanitizeFilename(campaign.title || 'campaign');
  const files: ExportFileViewModel[] = [];

  if (selectedExportFormats.includes('zip')) {
    files.push({
      key: 'zip',
      label: 'ZIP Package',
      fileName: `${base}.zip`,
      path: `${base}.zip`,
      format: 'zip',
      availability: exportReady ? 'downloadable' : 'unavailable',
      note: exportReady ? 'Downloadable from export folder' : 'Not generated yet',
    });
  }

  if (selectedExportFormats.includes('pptx')) {
    files.push({
      key: 'pptx',
      label: 'PPTX',
      fileName: `${base}.pptx`,
      path: `campaign/${base}.pptx`,
      format: 'pptx',
      availability: exportReady ? 'included' : 'unavailable',
      note: exportReady ? 'Included in ZIP' : 'Not generated yet',
    });
  }

  if (selectedExportFormats.includes('pdf')) {
    files.push({
      key: 'pdf',
      label: 'PDF',
      fileName: `${base}.pdf`,
      path: `campaign/${base}.pdf`,
      format: 'pdf',
      availability: exportReady ? 'included' : 'unavailable',
      note: exportReady ? 'Included in ZIP' : 'Not generated yet',
    });
  }

  if (selectedExportFormats.includes('png')) {
    files.push({
      key: 'png',
      label: 'PNG Images',
      fileName: 'slides-png/',
      path: 'campaign/deck/slides-png',
      format: 'png',
      availability: exportReady ? 'included' : 'unavailable',
      note: exportReady ? 'Included in ZIP as slide image folder' : 'Not generated yet',
    });
  }

  if (selectedExportFormats.includes('captions_json')) {
    files.push({
      key: 'captions_json',
      label: 'Captions JSON',
      fileName: 'captions.json',
      path: 'campaign/captions/captions.json',
      format: 'json',
      availability: exportReady ? 'included' : 'unavailable',
      note: exportReady ? 'Included in ZIP' : 'Not generated yet',
    });
  }

  if (selectedExportFormats.includes('captions_txt')) {
    files.push({
      key: 'captions_txt',
      label: 'Captions TXT',
      fileName: 'captions.txt',
      path: 'campaign/captions/captions.txt',
      format: 'txt',
      availability: exportReady ? 'included' : 'unavailable',
      note: exportReady ? 'Included in ZIP' : 'Not generated yet',
    });
  }

  if (selectedExportFormats.includes('source_txt')) {
    files.push({
      key: 'source_txt',
      label: 'Source TXT',
      fileName: 'source.txt',
      path: 'campaign/source/source.txt',
      format: 'txt',
      availability: exportReady ? 'included' : 'unavailable',
      note: exportReady ? 'Included in ZIP' : 'Not generated yet',
    });
  }

  return files;
}

export function selectCampaignExportViewModel(
  campaign: CampaignState,
  backendCampaign?: CampaignResponseDto | null,
  exportDownloadInfo?: ExportDownloadInfo | null,
  exportErrorMessage = '',
): CampaignExportViewModel {
  const view = selectCampaignViewModel(campaign, backendCampaign);
  const summary = view.summary;
  const selectedExportFormats = campaign.advancedSettings.exportFormats || [];
  const exportResults = backendCampaign?.generatedMedia.exports?.[0] || null;
  const manifest = exportDownloadInfo?.manifest || (exportResults as any)?.manifest || null;
  const files = manifestFiles(manifest);
  const exportStatus = exportDownloadInfo?.status || exportResults?.status || (campaign.generationJobId ? 'queued' : 'not_generated');
  const exportReady = exportStatus === 'ready';
  const downloadDir = exportDownloadInfo?.exportDir || (exportResults as any)?.filePath || null;
  const manifestAvailable = Boolean(downloadDir && exportReady);

  const availableExportFiles = files.length > 0
    ? files.map((file) => ({
      key: file.name,
      label: file.label || humanize(file.name),
      fileName: file.name,
      path: file.path,
      format: file.format,
      availability: file.downloadable ? 'downloadable' : exportReady ? 'included' : 'unavailable',
      note: file.downloadable ? 'Downloadable from export folder' : exportReady ? 'Included in ZIP' : 'Not generated yet',
    }))
    : fallbackFiles(campaign, selectedExportFormats, exportReady);

  return {
    title: summary.title,
    selectedPackageLabel: resolvePresetLabel(campaign),
    visualStyleLabel: humanize(campaign.advancedSettings.visualStyle || 'auto'),
    slideCount: summary.counts.slides,
    socialAssetCount: summary.counts.socialAssets,
    captionCount: summary.counts.captions,
    totalGeneratedFiles: typeof manifest?.counts?.filesGenerated === 'number'
      ? manifest.counts.filesGenerated
      : summary.counts.slides + summary.counts.socialAssets + summary.counts.captions,
    selectedExportFormats,
    availableExportFiles,
    exportStatus,
    exportStatusLabel: exportReady ? 'Export ready' : exportStatus === 'failed' ? 'Export failed' : exportStatus === 'running' || exportStatus === 'queued' ? 'Generating export' : 'Not generated yet',
    exportReadinessLabel: exportErrorMessage
      ? 'Export failed'
      : exportReady
        ? 'Export ready'
        : exportDownloadInfo?.exportDir
          ? 'Export available'
          : 'Not generated yet',
    exportErrorMessage,
    manifestAvailable,
    downloadId: exportDownloadInfo?.exportId || exportResults?.exportId || campaign.generationJobId || '',
    downloadDir,
    zipFilePath: exportDownloadInfo?.zipFilePath || (exportResults as any)?.zipFilePath || null,
    lastGeneratedAt: manifest?.generatedAt || (exportResults as any)?.createdAt || view.summary.updatedAt || null,
    sourceIncluded: Boolean(campaign.sourceText),
  };
}
