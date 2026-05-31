import React, { useEffect, useMemo, useState } from 'react';
import { useAppStore, type CampaignState } from '../lib/store';
import { createApiClient, type CampaignResponseDto } from '../lib/api';
import { PRESETS } from '../lib/presets';
import { selectCampaignViewModel } from '../lib/campaign-view-model';
import {
  humanize,
  labelCampaignGoal,
  labelCampaignStatus,
  labelCampaignType,
  labelLanguage,
  labelLayoutFamily,
  labelSocialAssetRole,
  labelSocialPlatform,
} from '../lib/labels';

type ReviewTab = 'overview' | 'slides' | 'social' | 'captions' | 'exports' | 'warnings';
type ItemStatus = 'draft' | 'ready' | 'approved' | 'regenerating' | 'failed' | 'generating';

type CaptionDraft = {
  cta: string;
  caption: string;
  hashtagsText: string;
};

const tabs: Array<{ id: ReviewTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'slides', label: 'Slides' },
  { id: 'social', label: 'Social Pack' },
  { id: 'captions', label: 'Captions' },
  { id: 'exports', label: 'Exports' },
  { id: 'warnings', label: 'Warnings' },
];

const itemStatusStyles: Record<ItemStatus, string> = {
  draft: 'bg-white/5 text-gray-300 border-white/10',
  ready: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  regenerating: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  generating: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  failed: 'bg-red-500/10 text-red-300 border-red-500/20',
};

const severityStyles: Record<'info' | 'warning' | 'error', string> = {
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-200',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-200',
  error: 'bg-red-500/10 border-red-500/20 text-red-200',
};

function statusLabel(status: string): string {
  return humanize(status || 'draft');
}

function normalizeHashtags(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
}

function formatCount(value: number): string {
  return value > 0 ? String(value) : '0';
}

function resolvePreset(campaign: CampaignState) {
  return PRESETS.find((preset) => preset.id === campaign.presetId)
    || PRESETS.find((preset) => preset.campaignType === campaign.campaignType && preset.campaignGoal === campaign.campaignGoal)
    || null;
}

function classifyWarning(message: string): 'info' | 'warning' | 'error' {
  const text = message.toLowerCase();
  if (text.includes('failed') || text.includes('not found') || text.includes('missing') || text.includes('error')) return 'error';
  if (text.includes('warn') || text.includes('only') || text.includes('incomplete') || text.includes('uncertain')) return 'warning';
  return 'info';
}

export default function ReviewScreen() {
  const { campaign, backendUrl, setScreen, updateCampaign } = useAppStore();
  const api = useMemo(() => createApiClient(backendUrl), [backendUrl]);
  const [backendCampaign, setBackendCampaign] = useState<CampaignResponseDto | null>(null);
  const [activeTab, setActiveTab] = useState<ReviewTab>('overview');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [screenError, setScreenError] = useState('');
  const [exportInfo, setExportInfo] = useState<{ campaignId: string; exportId: string; exportDir?: string; status: string; campaignName?: string } | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, CaptionDraft>>({});

  const view = useMemo(() => selectCampaignViewModel(campaign, backendCampaign), [campaign, backendCampaign]);
  const preset = resolvePreset(campaign);
  const slides = view.generatedMedia.deck?.slides || [];
  const socialAssets = view.generatedMedia.socialPack?.assets || [];
  const captions = view.generatedMedia.captions || [];
  const summary = view.summary;
  const exportJobId = backendCampaign?.exportJobId || campaign.generationJobId || '';

  useEffect(() => {
    let cancelled = false;

    async function loadCampaign() {
      if (!campaign.campaignId) return;
      setScreenError('');
      try {
        const data = await api.getCampaign(campaign.campaignId);
        if (cancelled) return;
        setBackendCampaign(data);
        updateCampaign({
          status: data.summary.status,
          deckResults: data.generatedMedia.deck || campaign.deckResults,
          socialResults: data.generatedMedia.socialPack || campaign.socialResults,
          captionResults: data.generatedMedia.captions || campaign.captionResults,
        });

        if (data.exportJobId) {
          try {
            const info = await api.getExportDownloadInfo(campaign.campaignId, data.exportJobId);
            if (!cancelled) setExportInfo(info);
          } catch {
            if (!cancelled) setExportInfo(null);
          }
        } else if (!cancelled) {
          setExportInfo(null);
        }
      } catch (err: any) {
        if (!cancelled) setScreenError(err?.message || 'Unable to load campaign details.');
      }
    }

    void loadCampaign();
    return () => {
      cancelled = true;
    };
  }, [api, campaign.campaignId, updateCampaign]);

  useEffect(() => {
    if (!editingCaptionId) return;
    const caption = captions.find((item) => item.id === editingCaptionId);
    if (!caption) return;
    setCaptionDrafts((prev) => {
      if (prev[caption.id]) return prev;
      return {
        ...prev,
        [caption.id]: {
          cta: caption.cta || '',
          caption: caption.caption || '',
          hashtagsText: (caption.hashtags || []).join(' '),
        },
      };
    });
  }, [captions, editingCaptionId]);

  const syncFromBackend = async () => {
    if (!campaign.campaignId) return;
    const data = await api.getCampaign(campaign.campaignId);
    setBackendCampaign(data);
    updateCampaign({
      status: data.summary.status,
      deckResults: data.generatedMedia.deck || campaign.deckResults,
      socialResults: data.generatedMedia.socialPack || campaign.socialResults,
      captionResults: data.generatedMedia.captions || campaign.captionResults,
    });
    if (data.exportJobId) {
      try {
        const info = await api.getExportDownloadInfo(campaign.campaignId, data.exportJobId);
        setExportInfo(info);
      } catch {
        setExportInfo(null);
      }
    } else {
      setExportInfo(null);
    }
  };

  const runAction = async (key: string, action: () => Promise<void>) => {
    setBusyKey(key);
    setScreenError('');
    try {
      await action();
      await syncFromBackend();
    } catch (err: any) {
      setScreenError(err?.response?.data?.message || err?.message || 'Request failed.');
    } finally {
      setBusyKey(null);
    }
  };

  const approveSlide = (slideId: string) => runAction(`slide:${slideId}`, async () => {
    if (!campaign.campaignId) return;
    await api.approveSlide(campaign.campaignId, slideId);
  });

  const regenerateSlide = (slideId: string) => runAction(`slide-regenerate:${slideId}`, async () => {
    if (!campaign.campaignId) return;
    await api.regenerateSlide(campaign.campaignId, slideId);
  });

  const approveSocialAsset = (assetId: string) => runAction(`social:${assetId}`, async () => {
    if (!campaign.campaignId) return;
    await api.approveSocialAsset(campaign.campaignId, assetId);
  });

  const regenerateSocialAsset = (assetId: string) => runAction(`social-regenerate:${assetId}`, async () => {
    if (!campaign.campaignId) return;
    await api.regenerateSocialAsset(campaign.campaignId, assetId);
  });

  const approveCaption = (captionId: string) => runAction(`caption:${captionId}`, async () => {
    if (!campaign.campaignId) return;
    await api.approveCaption(campaign.campaignId, captionId);
  });

  const regenerateCaption = (captionId: string) => runAction(`caption-regenerate:${captionId}`, async () => {
    if (!campaign.campaignId) return;
    await api.regenerateCaption(campaign.campaignId, captionId);
  });

  const approveAll = async (kind: 'slides' | 'social' | 'captions') => {
    if (!campaign.campaignId) return;
    const action = kind === 'slides'
      ? api.approveAllSlides
      : kind === 'social'
        ? api.approveAllSocialAssets
        : api.approveAllCaptions;
    await runAction(`bulk:${kind}`, async () => {
      await action(campaign.campaignId);
    });
  };

  const regenerateAll = async (kind: 'slides' | 'social' | 'captions') => {
    if (!campaign.campaignId) return;
    const action = kind === 'slides'
      ? api.regenerateAllSlides
      : kind === 'social'
        ? api.regenerateAllSocialAssets
        : api.regenerateAllCaptions;
    await runAction(`bulk-regenerate:${kind}`, async () => {
      await action(campaign.campaignId);
    });
  };

  const saveCaption = async (captionId: string) => {
    if (!campaign.campaignId) return;
    const draft = captionDrafts[captionId];
    const current = captions.find((item) => item.id === captionId);
    if (!draft || !current) return;

    const updatedCaptions = captions.map((item) => {
      if (item.id !== captionId) return item;
      return {
        ...item,
        cta: draft.cta,
        caption: draft.caption,
        hashtags: normalizeHashtags(draft.hashtagsText),
        status: 'ready',
      };
    });

    await runAction(`caption-save:${captionId}`, async () => {
      const data = await api.updateCampaign(campaign.campaignId!, { captionResults: updatedCaptions });
      setBackendCampaign(data);
      setEditingCaptionId(null);
      setCaptionDrafts((prev) => {
        const next = { ...prev };
        delete next[captionId];
        return next;
      });
    });
  };

  const exportPackage = async () => {
    if (!campaign.campaignId) return;
    await runAction('export', async () => {
      const result = await api.exportCampaign(campaign.campaignId!, campaign.advancedSettings.exportFormats || ['pptx', 'pdf', 'png', 'zip']);
      const info = await api.getExportDownloadInfo(campaign.campaignId!, result.exportJobId);
      setExportInfo(info);
      const data = await api.getCampaign(campaign.campaignId!);
      setBackendCampaign(data);
    });
  };

  const warnings = useMemo(() => {
    const items: Array<{ category: string; message: string; severity: 'info' | 'warning' | 'error' }> = [];
    const pushMessages = (category: string, messages: unknown[]) => {
      messages.filter((message): message is string => typeof message === 'string' && message.trim().length > 0)
        .forEach((message) => {
          items.push({ category, message, severity: classifyWarning(message) });
        });
    };

    pushMessages('Summary', summary.warnings || []);
    pushMessages('Deck', slides.flatMap((slide) => slide.quality?.warnings || []));
    pushMessages('Social', socialAssets.flatMap((asset) => asset.quality?.warnings || []));
    pushMessages('Captions', captions.flatMap((caption) => ((caption as any).warnings || [])));

    if (exportInfo && exportInfo.status !== 'ready') {
      items.push({ category: 'Export', message: `Export package is ${exportInfo.status}.`, severity: 'warning' });
    }

    return items;
  }, [captions, exportInfo, slides, socialAssets, summary.warnings]);

  const exportReady = summary.counts.slides > 0 || summary.counts.socialAssets > 0 || summary.counts.captions > 0;
  const packageName = preset?.name || 'Custom package';
  const visualStyle = campaign.advancedSettings.visualStyle || 'auto';
  const topError = screenError || '';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight">{summary.title || 'Untitled Campaign'}</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${itemStatusStyles.ready}`}>
              {labelCampaignStatus(summary.status)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <span>{labelCampaignType(summary.type)}</span>
            <span className="text-gray-700">•</span>
            <span>{labelCampaignGoal(summary.goal)}</span>
            <span className="text-gray-700">•</span>
            <span>{labelLanguage(summary.language)}</span>
            {summary.passageOrTopic ? <><span className="text-gray-700">•</span><span>{summary.passageOrTopic}</span></> : null}
          </div>
          {topError ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-200">
              {topError}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setScreen('workspace')} className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10">
            Workspace
          </button>
          <button
            onClick={() => setScreen('slidePreview')}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
          >
            Open Slides
          </button>
          <button
            onClick={() => setScreen('socialPreview')}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
          >
            Open Social
          </button>
          <button
            onClick={() => setScreen('export')}
            className="px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-sm text-purple-200 hover:bg-purple-500/20"
          >
            Export Screen
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-100'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Overview</p>
                <h3 className="text-lg font-semibold text-gray-100 mt-1">Campaign summary</h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${itemStatusStyles.ready}`}>
                {exportReady ? 'Ready for export' : 'Waiting for outputs'}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard label="Title" value={summary.title || 'Untitled'} />
              <InfoCard label="Preset" value={packageName} />
              <InfoCard label="Visual style" value={humanize(visualStyle)} />
              <InfoCard label="Selected package" value={preset?.description || 'Custom configuration'} />
              <InfoCard label="Type" value={summary.typeLabel} />
              <InfoCard label="Goal" value={summary.goalLabel} />
              <InfoCard label="Status" value={summary.statusLabel} />
              <InfoCard label="Language" value={summary.languageLabel} />
              <InfoCard label="Passage / topic" value={summary.passageOrTopic || '—'} />
              <InfoCard label="CTA" value={summary.cta || '—'} />
              <InfoCard label="Main message" value={summary.mainMessage || '—'} />
              <InfoCard label="Warnings" value={String(warnings.length)} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Counts</p>
              <h3 className="text-lg font-semibold text-gray-100 mt-1">Generated outputs</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Slides" value={formatCount(summary.counts.slides)} />
              <MetricCard label="Social assets" value={formatCount(summary.counts.socialAssets)} />
              <MetricCard label="Captions" value={formatCount(summary.counts.captions)} />
              <MetricCard label="Exports" value={formatCount(summary.counts.exports)} />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Quality score</span>
                <span className="text-sm font-semibold text-emerald-300">{summary.quality.score ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Export readiness</span>
                <span className="text-sm font-semibold text-gray-100">{exportReady ? 'Ready' : 'Not ready'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Export job</span>
                <span className="text-sm font-mono text-gray-400">{exportJobId || '—'}</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'slides' && (
        <section className="space-y-4">
          <TabHeader
            title="Slides"
            subtitle={`${slides.length} slide${slides.length === 1 ? '' : 's'} in the normalized deck`}
            actions={(
              <>
                <ActionButton onClick={() => approveAll('slides')} busy={busyKey === 'bulk:slides'} label="Approve all" />
                <ActionButton onClick={() => regenerateAll('slides')} busy={busyKey === 'bulk-regenerate:slides'} label="Regenerate all" />
              </>
            )}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {slides.map((slide) => (
              <div key={slide.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">Slide {slide.index}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${itemStatusStyles[(slide.status as ItemStatus) || 'draft']}`}>
                        {statusLabel(slide.status)}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-100 mt-2">{slide.headline || 'Untitled slide'}</h4>
                    <p className="text-sm text-gray-400">
                      {slide.roleLabel} · {labelLayoutFamily(slide.layoutFamily)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Quality</p>
                    <p className="text-gray-200 text-sm">{slide.quality?.score ?? '—'}</p>
                  </div>
                </div>
                {slide.scriptureReference ? <p className="text-sm text-amber-200">{slide.scriptureReference}</p> : null}
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
                  {slide.bodyLines?.length ? (
                    slide.bodyLines.map((line, index) => (
                      <p key={`${slide.id}-${index}`} className="text-sm text-gray-300">{line}</p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No body copy.</p>
                  )}
                </div>
                {slide.quality?.warnings?.length ? (
                  <div className="space-y-2">
                    {slide.quality.warnings.map((warning, index) => (
                      <p key={`${slide.id}-warning-${index}`} className="text-xs text-amber-300">{warning}</p>
                    ))}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setScreen('slidePreview')} className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300 hover:bg-white/10">
                    Preview
                  </button>
                  <ActionButton onClick={() => regenerateSlide(slide.id)} busy={busyKey === `slide-regenerate:${slide.id}`} label="Regenerate" />
                  <ActionButton onClick={() => approveSlide(slide.id)} busy={busyKey === `slide:${slide.id}`} label="Approve" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'social' && (
        <section className="space-y-4">
          <TabHeader
            title="Social pack"
            subtitle={`${socialAssets.length} social asset${socialAssets.length === 1 ? '' : 's'} in the normalized pack`}
            actions={(
              <>
                <ActionButton onClick={() => approveAll('social')} busy={busyKey === 'bulk:social'} label="Approve all" />
                <ActionButton onClick={() => regenerateAll('social')} busy={busyKey === 'bulk-regenerate:social'} label="Regenerate all" />
              </>
            )}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {socialAssets.map((asset) => (
              <div key={asset.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">{labelSocialPlatform(asset.platform)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${itemStatusStyles[(asset.status as ItemStatus) || 'draft']}`}>
                        {statusLabel(asset.status)}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-100 mt-2">{asset.roleLabel || labelSocialAssetRole(asset.role)}</h4>
                    <p className="text-sm text-gray-400">{asset.width} x {asset.height} · {asset.format}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Quality</p>
                    <p className="text-gray-200 text-sm">{asset.quality?.score ?? '—'}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
                  <p className="text-sm text-gray-200">{asset.caption || 'No caption text.'}</p>
                  {asset.cta ? <p className="text-xs text-purple-200">CTA: {asset.cta}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setScreen('socialPreview')} className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300 hover:bg-white/10">
                    Open Preview
                  </button>
                  <button
                    onClick={() => asset.caption && navigator.clipboard.writeText(asset.caption).catch(() => {})}
                    className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300 hover:bg-white/10"
                  >
                    Copy Caption
                  </button>
                  <ActionButton onClick={() => regenerateSocialAsset(asset.id)} busy={busyKey === `social-regenerate:${asset.id}`} label="Regenerate" />
                  <ActionButton onClick={() => approveSocialAsset(asset.id)} busy={busyKey === `social:${asset.id}`} label="Approve" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'captions' && (
        <section className="space-y-4">
          <TabHeader
            title="Captions"
            subtitle={`${captions.length} caption${captions.length === 1 ? '' : 's'} ready to edit, approve, or regenerate`}
            actions={(
              <>
                <ActionButton onClick={() => approveAll('captions')} busy={busyKey === 'bulk:captions'} label="Approve all" />
                <ActionButton onClick={() => regenerateAll('captions')} busy={busyKey === 'bulk-regenerate:captions'} label="Regenerate all" />
              </>
            )}
          />
          <div className="space-y-4">
            {captions.map((caption) => {
              const draft = captionDrafts[caption.id] || {
                cta: caption.cta || '',
                caption: caption.caption || '',
                hashtagsText: (caption.hashtags || []).join(' '),
              };
              const isEditing = editingCaptionId === caption.id;

              return (
                <div key={caption.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400">{labelSocialAssetRole(caption.role)} · {labelSocialPlatform(caption.platform)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${itemStatusStyles[(caption.status as ItemStatus) || 'draft']}`}>
                          {statusLabel(caption.status)}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-100 mt-2">{caption.cta || 'Caption copy'}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => navigator.clipboard.writeText(caption.caption || '').catch(() => {})}
                        className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300 hover:bg-white/10"
                      >
                        Copy
                      </button>
                      <ActionButton onClick={() => regenerateCaption(caption.id)} busy={busyKey === `caption-regenerate:${caption.id}`} label="Regenerate" />
                      <ActionButton onClick={() => approveCaption(caption.id)} busy={busyKey === `caption:${caption.id}`} label="Approve" />
                      <button
                        onClick={() => {
                          setEditingCaptionId(caption.id);
                          setCaptionDrafts((prev) => ({
                            ...prev,
                            [caption.id]: {
                              cta: caption.cta || '',
                              caption: caption.caption || '',
                              hashtagsText: (caption.hashtags || []).join(' '),
                            },
                          }));
                        }}
                        className="px-3 py-2 rounded-lg border border-purple-500/20 bg-purple-500/10 text-xs text-purple-200 hover:bg-purple-500/20"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <label className="block space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Caption text</span>
                        <textarea
                          value={draft.caption}
                          onChange={(e) => setCaptionDrafts((prev) => ({
                            ...prev,
                            [caption.id]: { ...draft, caption: e.target.value },
                          }))}
                          className="min-h-36 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-100 outline-none focus:border-purple-500/40"
                        />
                      </label>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="block space-y-1">
                          <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500">CTA</span>
                          <input
                            value={draft.cta}
                            onChange={(e) => setCaptionDrafts((prev) => ({
                              ...prev,
                              [caption.id]: { ...draft, cta: e.target.value },
                            }))}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-100 outline-none focus:border-purple-500/40"
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Hashtags</span>
                          <input
                            value={draft.hashtagsText}
                            onChange={(e) => setCaptionDrafts((prev) => ({
                              ...prev,
                              [caption.id]: { ...draft, hashtagsText: e.target.value },
                            }))}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-100 outline-none focus:border-purple-500/40"
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => saveCaption(caption.id)}
                          className="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-200 hover:bg-emerald-500/20"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCaptionId(null);
                            setCaptionDrafts((prev) => {
                              const next = { ...prev };
                              delete next[caption.id];
                              return next;
                            });
                          }}
                          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{caption.caption || 'No caption text.'}</p>
                      </div>
                      {caption.hashtags?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {caption.hashtags.map((tag) => (
                            <span key={`${caption.id}-${tag}`} className="px-2 py-1 rounded-full bg-purple-500/10 text-xs text-purple-200 border border-purple-500/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === 'exports' && (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <TabHeader
              title="Exports"
              subtitle="Package the normalized outputs with manifest and sanitized filenames."
              actions={(
                <ActionButton onClick={exportPackage} busy={busyKey === 'export'} label={exportInfo?.status === 'ready' ? 'Re-export' : 'Export package'} />
              )}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <MetricCard label="Slides" value={String(summary.counts.slides)} />
              <MetricCard label="Social assets" value={String(summary.counts.socialAssets)} />
              <MetricCard label="Captions" value={String(summary.counts.captions)} />
              <MetricCard label="Formats" value={(campaign.advancedSettings.exportFormats || []).join(', ').toUpperCase()} />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
              <p className="text-sm text-gray-300">Selected formats are exported with the current edited captions and normalized counts.</p>
              <p className="text-xs text-gray-500">Manifest: `manifest.json` and `metadata/asset-manifest.json`</p>
              <p className="text-xs text-gray-500">Files are sanitized to avoid invalid filenames on disk.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Latest export</p>
              <h3 className="text-lg font-semibold text-gray-100 mt-1">Download info</h3>
            </div>
            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
              <InfoRow label="Export id" value={exportInfo?.exportId || exportJobId || '—'} />
              <InfoRow label="Status" value={exportInfo?.status || (exportJobId ? 'queued' : 'not started')} />
              <InfoRow label="Path" value={exportInfo?.exportDir || '—'} monospace />
            </div>
            <div className="flex flex-wrap gap-2">
              {exportInfo?.exportDir ? (
                <button
                  onClick={() => {
                    const api = (window as any).electronAPI;
                    if (api?.openPath) {
                      api.openPath(exportInfo.exportDir);
                    }
                  }}
                  className="px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-sm text-purple-200 hover:bg-purple-500/20"
                >
                  Open export folder
                </button>
              ) : null}
              <button
                onClick={() => setScreen('export')}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10"
              >
                Open export screen
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'warnings' && (
        <section className="space-y-4">
          <TabHeader title="Warnings" subtitle={`${warnings.length} issue${warnings.length === 1 ? '' : 's'} across summary, media, and export flow`} />
          {warnings.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-emerald-200">
              No warnings. The current review set is clean.
            </div>
          ) : (
            <div className="space-y-3">
              {warnings.map((warning, index) => (
                <div key={`${warning.category}-${index}`} className={`rounded-2xl border p-4 ${severityStyles[warning.severity]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] opacity-80">{warning.category}</p>
                      <p className="text-sm mt-1">{warning.message}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-current/20">
                      {warning.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function TabHeader(props: { title: string; subtitle: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{props.title}</p>
        <h3 className="text-lg font-semibold text-gray-100 mt-1">{props.subtitle}</h3>
      </div>
      {props.actions ? <div className="flex items-center gap-2 flex-wrap">{props.actions}</div> : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-100 break-words">{value || '—'}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-100 break-words">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, monospace }: { label: string; value: string; monospace?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-400">{label}</span>
      <span className={monospace ? 'font-mono text-xs text-gray-300 text-right break-all' : 'text-gray-200 text-right break-words'}>{value}</span>
    </div>
  );
}

function ActionButton({ label, onClick, busy }: { label: string; onClick: () => void; busy?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {busy ? 'Working...' : label}
    </button>
  );
}
