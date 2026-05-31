import React from 'react';
import type { CampaignRecord } from '../lib/types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', analyzed: 'Analyzed', ready_to_generate: 'Ready',
  generating: 'Generating', generated: 'Generated', needs_review: 'Needs Review',
  exported: 'Exported', failed: 'Failed',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  analyzed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ready_to_generate: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  generating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  generated: 'bg-green-500/10 text-green-400 border-green-500/20',
  needs_review: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  exported: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TYPE_LABELS: Record<string, string> = {
  sermon: 'Sermon', church_event: 'Event', bible_study: 'Bible Study',
  devotional: 'Devotional', announcement: 'Announcement', youth_program: 'Youth',
  general_campaign: 'General', custom: 'Custom',
};

const GOAL_LABELS: Record<string, string> = {
  invite_attendance: 'Invitation', promote_livestream: 'Livestream',
  share_devotional: 'Devotional', announce_event: 'Announcement',
  teach_topic: 'Teaching', custom: 'Custom',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface Props {
  campaign: CampaignRecord;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function CampaignCard({ campaign, onOpen, onDuplicate, onDelete }: Props) {
  const statusColor = STATUS_COLORS[campaign.status] || STATUS_COLORS.draft;
  const snap = campaign.snapshot;
  const deckResults = snap?.deckResults as any;
  const socialResults = snap?.socialResults as any;
  const captionResults = snap?.captionResults as any;
  const slideCount = deckResults?.slideCount || 0;
  const socialCount = socialResults?.assetCount || socialResults?.assetIds?.length || 0;
  const captionCount = captionResults?.length || 0;
  const hasOutputs = slideCount > 0 || socialCount > 0 || captionCount > 0;

  return (
    <div
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 hover:bg-white/8 transition-all cursor-pointer group"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColor}`}>
          {STATUS_LABELS[campaign.status] || campaign.status}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-100 mb-1.5 line-clamp-2">{campaign.title}</h3>

      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {campaign.type && campaign.type !== 'auto' && (
          <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
            {TYPE_LABELS[campaign.type] || campaign.type}
          </span>
        )}
        {campaign.goal && campaign.goal !== 'auto' && (
          <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
            {GOAL_LABELS[campaign.goal] || campaign.goal}
          </span>
        )}
      </div>

      {/* Output counts */}
      {hasOutputs && (
        <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500">
          {slideCount > 0 && <span>🎞 {slideCount}</span>}
          {socialCount > 0 && <span>📱 {socialCount}</span>}
          {captionCount > 0 && <span>✏️ {captionCount}</span>}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-600">{timeAgo(campaign.updatedAt)}</p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-200 rounded hover:bg-purple-500/30 transition-colors">
            Open
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="text-[10px] px-2 py-1 bg-white/10 text-gray-400 rounded hover:bg-white/20 transition-colors">
            Copy
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) onDelete(); }}
            className="text-[10px] px-2 py-1 bg-white/10 text-gray-500 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
