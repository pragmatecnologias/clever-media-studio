import React, { useState } from 'react';
import { useAppStore, type AppScreen } from '../lib/store';
import { SOCIAL_MODE_LABELS, CAMPAIGN_TYPE_LABELS, CAMPAIGN_GOAL_LABELS, ASSET_ROLE_LABELS, OUTPUT_LABELS } from '../lib/labels';

type ReviewTab = 'overview' | 'slides' | 'social' | 'captions' | 'exports' | 'warnings';

const tabs: { key: ReviewTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'slides', label: 'Slides' },
  { key: 'social', label: 'Social Pack' },
  { key: 'captions', label: 'Captions' },
  { key: 'exports', label: 'Exports' },
  { key: 'warnings', label: 'Warnings' },
];

export default function ReviewScreen() {
  const { setScreen, campaign } = useAppStore();
  const [tab, setTab] = useState<ReviewTab>('overview');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Review Dashboard</h2>

      <div className="flex gap-1 border-b border-white/5 pb-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-t-lg transition-all ${tab === t.key ? 'bg-white/5 text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-64">
        {tab === 'overview' && <OverviewTab campaign={campaign} />}
        {tab === 'slides' && <SlidesTab setScreen={setScreen} campaign={campaign} />}
        {tab === 'social' && <SocialTab setScreen={setScreen} campaign={campaign} />}
        {tab === 'captions' && <CaptionsTab campaign={campaign} />}
        {tab === 'exports' && <ExportsTab setScreen={setScreen} campaign={campaign} />}
        {tab === 'warnings' && <WarningsTab campaign={campaign} />}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setScreen('generating')} className="px-4 py-2 bg-white/5 rounded-lg text-sm">Back</button>
        <button onClick={() => setScreen('export')} className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold">Go to Export</button>
      </div>
    </div>
  );
}

function OverviewTab({ campaign }: { campaign: any }) {
  const typeLabel = CAMPAIGN_TYPE_LABELS[campaign.campaignType] || campaign.campaignType;
  const goalLabel = CAMPAIGN_GOAL_LABELS[campaign.campaignGoal] || campaign.campaignGoal;
  const items = [
    ['Campaign Type', typeLabel],
    ['Goal', goalLabel],
    ['Title', campaign.title],
    ['Main Message', campaign.mainMessage],
    ['Language', campaign.language === 'en' ? 'English' : 'Español'],
    ['Tone', campaign.tone || '—'],
    ['CTA', campaign.cta || '—'],
    ['Outputs', Object.entries(campaign.outputSelections || {}).filter(([,v]) => v).map(([k]) => OUTPUT_LABELS[k] || k).join(', ') || '—'],
    ['Event Date', campaign.eventDetails?.date || '—'],
    ['Location', campaign.eventDetails?.locationName || '—'],
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map(([label, value]) => (
        <div key={label}>
          <label className="text-xs text-gray-500 uppercase tracking-wider block">{label}</label>
          <p className="text-sm text-gray-200 mt-1">{String(value || '—')}</p>
        </div>
      ))}
    </div>
  );
}

function SlidesTab({ setScreen, campaign }: { setScreen: (s: AppScreen) => void; campaign: any }) {
  const hasDeck = campaign.outputSelections?.presentationDeck;
  const deckResults = campaign.deckResults as any;
  const slideCount = deckResults?.slideCount || 0;
  const layouts = deckResults?.layouts || 0;
  const deckQuality = deckResults?.quality;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-400">
          {hasDeck ? (slideCount > 0 ? `${slideCount} slides with ${layouts} layout families` : 'Deck generation in progress...') : 'Presentation deck was not selected.'}
        </p>
        {hasDeck && slideCount > 0 && <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Generated</span>}
      </div>
      {hasDeck && slideCount > 0 && (
        <button onClick={() => setScreen('slidePreview' as AppScreen)} className="px-4 py-2 bg-purple-500/20 text-purple-200 border border-purple-400/40 rounded-lg text-sm hover:bg-purple-500/30">
          Open Full Slide Preview
        </button>
      )}
      {deckQuality && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-gray-400">
          Quality score: {deckQuality.score} — {deckQuality.passed ? 'Passed' : 'Needs review'}
          {deckQuality.warnings?.length ? ` — ${deckQuality.warnings.length} warning(s)` : ''}
        </div>
      )}
      <div className="grid grid-cols-4 gap-2">
        {slideCount > 0 && deckResults?.slides ? (
          deckResults.slides.map((s: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">{s.index || i+1}</p>
              <p className="text-xs text-gray-300 truncate">{s.headline || 'slide'}</p>
            </div>
          ))
        ) : slideCount > 0 ? (
          Array.from({ length: slideCount }, (_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">{i+1}</p>
              <p className="text-xs text-gray-600 truncate">slide</p>
            </div>
          ))
        ) : (
          ['title_cinematic','scripture_focus','big_idea_statement','point_declaration','split_tension','application_steps','appeal_invitation','closing_blessing'].map((l, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">{i+1}</p>
              <p className="text-xs text-gray-600 truncate">{l.replace(/_/g, ' ')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SocialTab({ setScreen, campaign }: { setScreen: (s: AppScreen) => void; campaign: any }) {
  const hasSocial = campaign.outputSelections?.socialPack;
  const socialResults = campaign.socialResults as any;
  const assetCount = socialResults?.assetCount || 0;
  const socialMode = socialResults?.mode || 'unknown';
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-400">
          {hasSocial ? (assetCount > 0 ? `${assetCount} assets · ${SOCIAL_MODE_LABELS[socialMode] || socialMode}` : 'Social pack generation in progress...') : 'Social pack was not selected.'}
        </p>
        {hasSocial && assetCount > 0 && <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Generated</span>}
      </div>
      {hasSocial && assetCount > 0 && (
        <button onClick={() => setScreen('socialPreview' as AppScreen)} className="px-4 py-2 bg-purple-500/20 text-purple-200 border border-purple-400/40 rounded-lg text-sm hover:bg-purple-500/30">
          Open Full Social Pack Preview
        </button>
      )}
      <div className="grid grid-cols-3 gap-2">
        {(() => {
          const specs = socialResults?.assetSpecs as any[] | undefined;
          const displaySpecs = (specs && specs.length > 0) ? specs : (
            campaign.campaignGoal === 'invite_attendance' || campaign.campaignGoal === 'promote_livestream' || campaign.campaignGoal === 'announce_event'
              ? [
                  { assetRole: 'main_invitation', platform: 'facebook', format: 'wide_banner' },
                  { assetRole: 'quote_teaser', platform: 'instagram', format: 'feed_portrait' },
                  { assetRole: 'story_invitation', platform: 'instagram', format: 'story' },
                  { assetRole: 'engagement_question', platform: 'instagram', format: 'story' },
                  { assetRole: 'youtube_thumbnail', platform: 'youtube', format: 'thumbnail' },
                  { assetRole: 'whatsapp_invite', platform: 'whatsapp', format: 'status' },
                ]
              : [
                  { assetRole: 'devotional_quote', platform: 'instagram', format: 'feed_portrait' },
                  { assetRole: 'reflection_question', platform: 'instagram', format: 'story' },
                  { assetRole: 'encouragement_card', platform: 'instagram', format: 'story' },
                  { assetRole: 'scripture_reminder', platform: 'instagram', format: 'feed_portrait' },
                  { assetRole: 'whatsapp_share', platform: 'whatsapp', format: 'status' },
                ]
          );
          return displaySpecs.slice(0, Math.max(assetCount || displaySpecs.length, 6)).map((s: any, i: number) => {
            const roleLabel = ASSET_ROLE_LABELS[s.assetRole] || (s.assetRole || 'asset').replace(/_/g, ' ');
            const platformIcon: Record<string, string> = { instagram: '📱', facebook: '📘', youtube: '▶️', whatsapp: '💬' };
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2.5 space-y-1 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{platformIcon[s.platform] || ''} {s.platform}</span>
                  <span className="text-[9px] bg-green-500/10 text-green-400 px-1 rounded">Ready</span>
                </div>
                <p className="text-xs text-gray-300 font-medium capitalize">{roleLabel}</p>
                <p className="text-[10px] text-gray-600">{s.format?.replace(/_/g, ' ') || ''}</p>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

function CaptionsTab({ campaign }: { campaign: any }) {
  const captionResults = campaign.captionResults as any[];
  const hasCaptions = captionResults && captionResults.length > 0;
  const [copiedIdx, setCopiedIdx] = useState(-1);

  const copyCaption = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(-1), 2000);
    }).catch(() => {});
  };

  const roles = ['Main Invitation', 'Quote Teaser', 'Story Invitation', 'Engagement Question'];
  const platforms = ['Facebook/Instagram', 'Instagram', 'Instagram Story', 'Instagram Story'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-400">
          {hasCaptions ? `Caption Package — ${captionResults.length} captions` : 'No captions generated'}
        </p>
        {hasCaptions && <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Generated</span>}
      </div>
      {hasCaptions ? (
        <div className="grid grid-cols-2 gap-3">
          {captionResults.map((c: any, i: number) => {
            const role = roles[i] || `Caption ${i + 1}`;
            const platform = platforms[i] || 'Social';
            const caption = c.longCaption || c.caption || '';
            const cta = c.cta || campaign.cta || '';
            const hashtags = c.hashtags || [];
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-200">{role}</p>
                    <p className="text-[10px] text-gray-500">{platform}</p>
                  </div>
                  <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">Ready</span>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{caption}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {cta && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300">{cta}</span>}
                  {hashtags.slice(0, 4).map((h: string, j: number) => (
                    <span key={j} className="text-[10px] text-blue-400/70">{h}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                  <button onClick={() => copyCaption(caption, i)}
                    className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    {copiedIdx === i ? 'Copied!' : 'Copy Caption'}
                  </button>
                  <button className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">Regenerate</button>
                  <button className="text-[10px] px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors ml-auto">Approve</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-amber-300/80">Captions were not generated for this campaign.</p>
        </div>
      )}
    </div>
  );
}

function ExportsTab({ setScreen, campaign }: { setScreen: (s: AppScreen) => void; campaign: any }) {
  const deckResults = campaign.deckResults as any;
  const socialResults = campaign.socialResults as any;
  const slideCount = deckResults?.slideCount || 0;
  const assetCount = socialResults?.assetCount || 0;
  const captionCount = (campaign.captionResults as any[])?.length || 0;
  const totalFiles = slideCount + assetCount + captionCount + 5;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-400">Export package ready — {totalFiles} files</p>
        <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Ready</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {slideCount > 0 && <div className="bg-white/5 border border-white/10 rounded-lg p-2"><span className="text-purple-400">{slideCount}</span> <span className="text-gray-500">slides</span></div>}
        {assetCount > 0 && <div className="bg-white/5 border border-white/10 rounded-lg p-2"><span className="text-amber-400">{assetCount}</span> <span className="text-gray-500">social assets</span></div>}
        {captionCount > 0 && <div className="bg-white/5 border border-white/10 rounded-lg p-2"><span className="text-green-400">{captionCount}</span> <span className="text-gray-500">captions</span></div>}
        <div className="bg-white/5 border border-white/10 rounded-lg p-2"><span className="text-blue-400">ZIP</span> <span className="text-gray-500">PPTX + PDF + PNG</span></div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setScreen('export')} className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold transition-all">
          Export Package
        </button>
        <button onClick={() => setScreen('export')} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-all border border-white/10">
          View Files
        </button>
      </div>
    </div>
  );
}

function WarningsTab({ campaign }: { campaign: any }) {
  const warnings: string[] = [];
  if (!campaign.title) warnings.push('Campaign has no title');
  if (!campaign.cta && campaign.campaignGoal === 'invite_attendance') warnings.push('Invitation campaign has no CTA — invitation copy may be weak');
  if (!campaign.eventDetails?.date && campaign.campaignGoal === 'invite_attendance') warnings.push('No event date set — assets will show generic invitation text');
  if (warnings.length === 0) warnings.push('No warnings — campaign looks good!');
  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <div key={i} className={`p-3 rounded-lg text-sm ${w.includes('No warnings') ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-amber-500/5 border border-amber-500/20 text-amber-300'}`}>
          {w.includes('No warnings') ? '✓ ' : '• '}{w}
        </div>
      ))}
    </div>
  );
}
