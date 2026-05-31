import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient } from '../lib/api';

interface SocialAssetData {
  id: string;
  platform: string;
  format: string;
  width: number;
  height: number;
  role: string;
  layoutFamily: string;
  imageRole: string;
  imageUrl?: string;
  headline: string;
  caption: string;
  cta: string;
  qualityScore: number;
  warnings: string[];
  status: 'draft' | 'generating' | 'ready';
}

const platformMeta: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  facebook:  { label: 'Facebook',  color: '#1877F2', bg: 'from-blue-900/30 to-blue-800/20', icon: 'f' },
  instagram: { label: 'Instagram', color: '#E4405F', bg: 'from-pink-900/30 to-rose-800/20', icon: '◉' },
  youtube:   { label: 'YouTube',   color: '#FF0000', bg: 'from-red-900/30 to-rose-800/20',  icon: '▶' },
  whatsapp:  { label: 'WhatsApp',  color: '#25D366', bg: 'from-green-900/30 to-emerald-800/20', icon: '☏' },
  x:         { label: 'X',         color: '#1DA1F2', bg: 'from-sky-900/30 to-blue-800/20',   icon: '𝕏' },
};

const dimensionLabels: Record<string, string> = {
  '1200×630': 'Landscape (FB/YT)',
  '1080×1350': 'Portrait (IG Feed)',
  '1080×1920': 'Story (IG/WA)',
  '1280×720': 'Thumbnail (YT)',
};

function buildAssetDataFromCampaign(campaign: any, apiAssets?: any[]): SocialAssetData[] {
  const captionResults = (campaign.captionResults || []) as any[];
  const socialResults = campaign.socialResults as any;
  const assetIds: string[] = socialResults?.assetIds || [];

  // Use actual asset specs from generation results when available
  const backendSpecs: any[] = socialResults?.assetSpecs || campaign.socialPackPlan?.assets || [];

  // Build asset specs from backend data, falling back to generic specs
  const allSpecs = backendSpecs.length > 0
    ? backendSpecs.map((s: any) => ({
        platform: s.platform || 'instagram',
        format: `${s.width || 1080}×${s.height || 1350}`,
        width: s.width || 1080,
        height: s.height || 1350,
        role: s.assetRole || s.role || 'social_asset',
        layoutFamily: s.layoutFamily || 'devotional_centerpiece',
        imageRole: s.imageRole || 'worship backdrop',
      }))
    : [
        // Fallback specs when backend hasn't stored detailed asset data
        { platform: 'instagram', format: '1080×1350', width: 1080, height: 1350, role: 'main_invitation', layoutFamily: 'invitation_card', imageRole: 'worship space' },
        { platform: 'instagram', format: '1080×1920', width: 1080, height: 1920, role: 'quote_teaser', layoutFamily: 'quote_centerpiece', imageRole: 'warm backdrop' },
        { platform: 'instagram', format: '1080×1920', width: 1080, height: 1920, role: 'story_invitation', layoutFamily: 'story_vertical_hero', imageRole: 'vertical hero' },
        { platform: 'instagram', format: '1080×1350', width: 1080, height: 1350, role: 'engagement_question', layoutFamily: 'story_vertical_hero', imageRole: 'reflective backdrop' },
        { platform: 'whatsapp',  format: '1080×1920', width: 1080, height: 1920, role: 'whatsapp_invite', layoutFamily: 'quote_card_minimal', imageRole: 'clean vertical' },
        { platform: 'youtube',   format: '1280×720',  width: 1280, height: 720,  role: 'youtube_thumbnail', layoutFamily: 'bold_thumbnail', imageRole: 'cinematic subject' },
      ];

  // Build a map from API data for image URLs
  const apiAssetMap = new Map<string, any>();
  if (apiAssets) {
    apiAssets.forEach((a: any) => apiAssetMap.set(a.id, a));
  }

  // Use caption data as primary source
  if (captionResults.length > 0) {
    return captionResults.map((caption: any, i: number) => {
      const spec = allSpecs[i % allSpecs.length];
      const preview = caption.captionPreview || '';
      const lines = preview.split('\n').filter((l: string) => l.trim());
      const assetId = assetIds[i] || `asset-${i}`;
      const apiData = apiAssetMap.get(assetId);
      return {
        id: assetId.slice(0, 8),
        platform: spec.platform,
        format: spec.format,
        width: spec.width,
        height: spec.height,
        role: spec.role,
        layoutFamily: spec.layoutFamily,
        imageRole: spec.imageRole,
        headline: lines[0]?.slice(0, 80) || campaign.title || `Asset ${i + 1}`,
        imageUrl: apiData?.imageUrl || undefined,
        caption: caption.longCaption || preview || '',
        cta: caption.cta || '',
        qualityScore: campaign.qualityResults?.score || 85,
        warnings: campaign.qualityResults?.warnings || [],
        status: apiData?.status === 'ready' ? 'ready' : 'draft',
      };
    });
  }

  if (assetIds.length === 0) return [];

  return assetIds.map((id: string, i: number) => {
    const spec = allSpecs[i % allSpecs.length];
    return {
      id: id.slice(0, 8),
      platform: spec.platform,
      format: spec.format,
      width: spec.width,
      height: spec.height,
      role: spec.role,
      layoutFamily: spec.layoutFamily,
      imageRole: spec.imageRole,
      headline: campaign.title || `Asset ${i + 1}`,
      caption: '',
      cta: '',
      qualityScore: campaign.qualityResults?.score || 85,
      warnings: campaign.qualityResults?.warnings || [],
      status: 'draft',
    };
  });
}

function AssetCard({ asset }: { asset: SocialAssetData }) {
  const meta = platformMeta[asset.platform] || platformMeta.instagram;
  const isVertical = asset.height > asset.width;
  const isStory = isVertical && asset.height >= 1920;
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCaption = () => {
    if (asset.caption) {
      navigator.clipboard.writeText(asset.caption).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all hover:border-white/20 hover:bg-white/8 flex flex-col">
      {/* Image preview - platform-aware sizing */}
      <div
        className={`relative bg-gradient-to-br ${meta.bg} overflow-hidden flex items-center justify-center`}
        style={isStory
          ? { aspectRatio: '9/16', maxHeight: 480, minHeight: 360 }
          : { aspectRatio: `${asset.width}/${asset.height}`, maxHeight: isVertical ? 380 : 240 }
        }
      >
        {asset.imageUrl ? (
          <img
            src={`http://localhost:3001${asset.imageUrl}`}
            alt={asset.headline}
            className={`w-full h-full ${isStory ? 'object-cover' : 'object-contain'}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-4xl opacity-15 mb-3">{meta.icon}</p>
              <p className="text-xs opacity-25" style={{ color: meta.color }}>
                {asset.width}×{asset.height}
              </p>
            </div>
          </div>
        )}
        {/* Platform badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold z-10"
          style={{ background: meta.color + '88', color: '#fff', border: `1px solid ${meta.color}` }}>
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
        </div>
        {/* Format badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] bg-black/60 text-white uppercase tracking-wider z-10">
          {asset.format}
        </div>
      </div>

      {/* Info + Actions */}
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-200 capitalize">{asset.role.replace(/_/g, ' ')}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${asset.status === 'ready' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'}`}>
            {asset.status === 'ready' ? 'Ready' : 'Draft'}
          </span>
        </div>
        <p className="text-xs text-gray-300 line-clamp-2">{asset.headline}</p>
        {asset.cta && (
          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full text-purple-300 bg-purple-500/10 w-fit">{asset.cta}</span>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-1.5 pt-2 mt-auto border-t border-white/5">
          <button onClick={handleCopyCaption} disabled={!asset.caption}
            className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
            title="Copy caption">{copied ? 'Copied!' : 'Copy Caption'}</button>
          <button className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Regenerate image">Regenerate</button>
          <button onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors ml-auto"
            title="More info">{showDetails ? 'Less' : 'More'}</button>
          <button className="text-[10px] px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 transition-colors font-medium"
            title="Approve this asset">Approve</button>
        </div>

        {showDetails && (
          <div className="space-y-1.5 pt-1 border-t border-white/5 text-[10px]">
            {asset.caption && <p className="text-gray-400"><span className="text-gray-500">Caption: </span>{asset.caption.slice(0, 200)}</p>}
            <p className="text-gray-600">Image: {asset.imageRole} · {asset.width}×{asset.height} · Q: {asset.qualityScore}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SocialPackPreviewScreen() {
  const { setScreen, campaign, backendUrl } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [socialData, setSocialData] = useState<any>(null);

  const socialResults = campaign.socialResults as any;
  const hasSocial = campaign.outputSelections?.socialPack && (socialResults?.assetCount > 0 || socialResults?.assetIds?.length > 0);

  useEffect(() => {
    if (!campaign.campaignId || !hasSocial) return;
    const api = createApiClient(backendUrl);
    api.getCampaignSocialAssets(campaign.campaignId)
      .then(setSocialData)
      .catch(() => {});
  }, [campaign.campaignId, hasSocial, backendUrl]);

  const apiAssets = (socialData as any)?.assets || [];
  const assets = buildAssetDataFromCampaign(campaign, apiAssets);
  const platforms = [...new Set(assets.map(a => a.platform))];
  const filtered = activeTab === 'all' ? assets : assets.filter(a => a.platform === activeTab);
  const mode = socialResults?.mode || (socialData as any)?.mode || 'devotional_pack';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Pack Preview</h2>
          <p className="text-sm text-gray-500 mt-1">
            {assets.length > 0
              ? `${assets.length} assets · ${mode.replace(/_/g, ' ')} · ${platforms.length} platforms`
              : 'Fetching social assets...'}
          </p>
        </div>
        {assets.length > 0 && (
          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20 uppercase tracking-wider">
            Generated
          </span>
        )}
      </div>

      {/* Platform filter tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all font-medium ${
            activeTab === 'all'
              ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40'
              : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/8'
          }`}>
          All ({assets.length})
        </button>
        {platforms.map(p => {
          const m = platformMeta[p] || { label: p, color: '#888' };
          return (
            <button key={p} onClick={() => setActiveTab(p)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all capitalize ${
                activeTab === p
                  ? 'border text-white'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/8'
              }`}
              style={activeTab === p ? { background: m.color + '22', borderColor: m.color + '44' } : {}}>
              {m.label} ({assets.filter(a => a.platform === p).length})
            </button>
          );
        })}
      </div>

      {/* Asset grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl flex items-center justify-center py-16">
          <p className="text-gray-600">
            {assets.length === 0 ? 'No social assets generated. Enable Social Pack in Outputs.' : 'No assets match this filter.'}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={() => setScreen('review')}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-all">
          Back to Review
        </button>
        <button onClick={() => setScreen('review')}
          className="px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-500/20">
          Approve All
        </button>
      </div>
    </div>
  );
}
