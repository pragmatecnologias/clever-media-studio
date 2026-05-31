export {
  CAMPAIGN_GOAL_LABELS,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  LANGUAGE_LABELS,
  LAYOUT_FAMILY_LABELS,
  OUTPUT_LABELS,
  SOCIAL_ASSET_ROLE_LABELS,
  SOCIAL_MODE_LABELS,
  SOCIAL_PLATFORM_LABELS,
  humanize,
  labelCampaignGoal,
  labelCampaignStatus,
  labelCampaignType,
  labelLanguage,
  labelLayoutFamily,
  labelOutput,
  labelSocialAssetRole,
  labelSocialMode,
  labelSocialPlatform,
} from '../../../../../../shared/campaign-normalized.contract';

export function stripLabelPrefix(value: string): string {
  if (!value) return '';
  const prefixes = ['Title:', 'Topic:', 'Message:', 'Goal:', 'Type:', 'Passage:', 'Main Message:', 'CTA:', 'Audience:', 'Speaker:', 'Event:', 'Date:', 'Time:', 'Location:'];
  for (const prefix of prefixes) {
    if (value.toLowerCase().startsWith(prefix.toLowerCase())) {
      return value.slice(prefix.length).trim();
    }
  }
  return value.trim();
}

export function cleanFieldValues(record: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(record)) {
    cleaned[key] = typeof val === 'string' ? stripLabelPrefix(val) : val;
  }
  return cleaned;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return 'text-green-400 bg-green-500/10 border-green-500/20';
  if (confidence >= 0.4) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.7) return 'High confidence';
  if (confidence >= 0.4) return 'Medium confidence';
  return 'Low confidence — please verify';
}

export const TYPE_OPTIONS = [
  { value: 'sermon', label: 'Sermon' },
  { value: 'church_event', label: 'Church Event' },
  { value: 'bible_study', label: 'Bible Study' },
  { value: 'devotional', label: 'Devotional' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'youth_program', label: 'Youth Program' },
  { value: 'prayer_meeting', label: 'Prayer Meeting' },
  { value: 'evangelistic_meeting', label: 'Evangelistic Meeting' },
  { value: 'funeral_memorial', label: 'Funeral / Memorial' },
  { value: 'wedding_family', label: 'Wedding / Family' },
  { value: 'community_outreach', label: 'Community Outreach' },
  { value: 'general_campaign', label: 'General Message' },
  { value: 'custom', label: 'Custom' },
];

export const GOAL_OPTIONS = [
  { value: 'invite_attendance', label: 'Invite People to Attend' },
  { value: 'promote_livestream', label: 'Promote Livestream' },
  { value: 'share_devotional', label: 'Share a Devotional' },
  { value: 'announce_event', label: 'Announce an Event' },
  { value: 'recap_event', label: 'Recap an Event' },
  { value: 'teach_topic', label: 'Teach a Topic' },
  { value: 'encourage_response', label: 'Encourage Response' },
  { value: 'custom', label: 'Custom' },
];
