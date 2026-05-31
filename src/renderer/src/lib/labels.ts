export const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  sermon: 'Sermon',
  church_event: 'Church Event',
  bible_study: 'Bible Study',
  devotional: 'Devotional',
  announcement: 'Announcement',
  youth_program: 'Youth Program',
  prayer_meeting: 'Prayer Meeting',
  evangelistic_meeting: 'Evangelistic Meeting',
  funeral_memorial: 'Funeral / Memorial',
  wedding_family: 'Wedding / Family',
  community_outreach: 'Community Outreach',
  general_campaign: 'General Message',
  custom: 'Custom',
  auto: 'Auto-detect',
};

export const CAMPAIGN_GOAL_LABELS: Record<string, string> = {
  invite_attendance: 'Invite People to Attend',
  promote_livestream: 'Promote Livestream',
  share_devotional: 'Share a Devotional',
  announce_event: 'Announce an Event',
  recap_event: 'Recap an Event',
  teach_topic: 'Teach a Topic',
  encourage_response: 'Encourage Response',
  custom: 'Custom',
  auto: 'Auto-detect',
};

export const SOCIAL_MODE_LABELS: Record<string, string> = {
  invitation_campaign: 'Invitation Campaign',
  devotional_pack: 'Devotional Pack',
  announcement_pack: 'Announcement Pack',
  recap_pack: 'Recap Pack',
};

const KNOWN_PREFIXES = ['Title:', 'Topic:', 'Message:', 'Goal:', 'Type:', 'Passage:', 'Main Message:', 'CTA:', 'Audience:', 'Speaker:', 'Event:', 'Date:', 'Time:', 'Location:'];

export function stripLabelPrefix(value: string): string {
  if (!value) return '';
  for (const prefix of KNOWN_PREFIXES) {
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
  { value: 'devotional', label: 'Devotional' },
  { value: 'bible_study', label: 'Bible Study' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'youth_program', label: 'Youth Program' },
  { value: 'prayer_meeting', label: 'Prayer Meeting' },
  { value: 'evangelistic_meeting', label: 'Evangelistic Meeting' },
];

export const ASSET_ROLE_LABELS: Record<string, string> = {
  main_invitation: 'Main Invitation',
  quote_teaser: 'Quote Teaser',
  story_invitation: 'Story Invitation',
  engagement_question: 'Engagement Question',
  whatsapp_invite: 'WhatsApp Invite',
  whatsapp_forward: 'WhatsApp Forward',
  youtube_thumbnail: 'YouTube Thumbnail',
  devotional_quote: 'Devotional Quote',
  reflection_question: 'Reflection Question',
  encouragement_card: 'Encouragement Card',
  scripture_reminder: 'Scripture Reminder',
  whatsapp_share: 'WhatsApp Share',
  recap_highlight: 'Recap Highlight',
  event_poster: 'Event Poster',
  announcement_card: 'Announcement Card',
};

export const OUTPUT_LABELS: Record<string, string> = {
  presentationDeck: 'Slides',
  presentation_deck: 'Presentation Deck',
  socialPack: 'Social Pack',
  social_pack: 'Social Pack',
  captionPack: 'Captions',
  caption_pack: 'Caption Pack',
  thumbnail: 'Thumbnail',
};

export const LAYOUT_FAMILY_LABELS: Record<string, string> = {
  title_cinematic: 'Title Slide',
  scripture_focus: 'Scripture Slide',
  big_idea_statement: 'Big Idea',
  point_declaration: 'Main Point',
  split_tension: 'Contrast Point',
  application_steps: 'Application',
  appeal_invitation: 'Invitation',
  closing_blessing: 'Closing',
  story_moment: 'Story Moment',
  reflection_question: 'Reflection',
  devotional_centerpiece: 'Devotional Center',
  bold_thumbnail: 'Thumbnail',
  story_vertical_hero: 'Story Graphic',
  invitation_card: 'Invitation Card',
  quote_card_minimal: 'Quote Card',
  quote_centerpiece: 'Quote Center',
};

export const GOAL_OPTIONS = [
  { value: 'invite_attendance', label: 'Invite People to Attend' },
  { value: 'share_devotional', label: 'Share a Devotional' },
  { value: 'announce_event', label: 'Announce an Event' },
  { value: 'promote_livestream', label: 'Promote Livestream' },
  { value: 'teach_topic', label: 'Teach a Topic' },
  { value: 'encourage_response', label: 'Encourage Response' },
  { value: 'recap_event', label: 'Recap an Event' },
];
