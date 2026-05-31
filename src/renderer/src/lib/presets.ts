import type { CampaignState } from './store';

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  outputSelections: CampaignState['outputSelections'];
  campaignType: string;
  campaignGoal: string;
  socialPackMode: string;
  recommendedFor: string[];
}

export const PRESETS: Preset[] = [
  {
    id: 'sermon-invitation',
    name: 'Sermon Invitation',
    description: 'Slides, social invitations, story graphics, WhatsApp invite, captions',
    icon: '🙏',
    outputSelections: { presentationDeck: true, socialPack: true, captionPack: true, thumbnail: false },
    campaignType: 'sermon',
    campaignGoal: 'invite_attendance',
    socialPackMode: 'invitation_campaign',
    recommendedFor: ['sermon', 'evangelistic_meeting'],
  },
  {
    id: 'church-event',
    name: 'Church Event',
    description: 'Event graphics, invitation posts, reminder stories, captions',
    icon: '📅',
    outputSelections: { presentationDeck: false, socialPack: true, captionPack: true, thumbnail: false },
    campaignType: 'church_event',
    campaignGoal: 'invite_attendance',
    socialPackMode: 'invitation_campaign',
    recommendedFor: ['church_event', 'community_outreach', 'announcement'],
  },
  {
    id: 'devotional-social',
    name: 'Devotional Social',
    description: 'Quote graphics, reflection stories, scripture reminders, devotional captions',
    icon: '📖',
    outputSelections: { presentationDeck: false, socialPack: true, captionPack: true, thumbnail: false },
    campaignType: 'devotional',
    campaignGoal: 'share_devotional',
    socialPackMode: 'devotional_pack',
    recommendedFor: ['devotional', 'bible_study'],
  },
  {
    id: 'youth-program',
    name: 'Youth Program',
    description: 'Youth invitation graphics, story posts, social graphics, captions',
    icon: '🔥',
    outputSelections: { presentationDeck: true, socialPack: true, captionPack: false, thumbnail: false },
    campaignType: 'youth_program',
    campaignGoal: 'invite_attendance',
    socialPackMode: 'invitation_campaign',
    recommendedFor: ['youth_program'],
  },
  {
    id: 'full-package',
    name: 'Full Media Package',
    description: 'Everything: slides, social, captions, and thumbnail',
    icon: '📦',
    outputSelections: { presentationDeck: true, socialPack: true, captionPack: true, thumbnail: true },
    campaignType: 'sermon',
    campaignGoal: 'invite_attendance',
    socialPackMode: 'invitation_campaign',
    recommendedFor: ['*'],
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Choose exactly what you need',
    icon: '⚙️',
    outputSelections: { presentationDeck: false, socialPack: false, captionPack: false, thumbnail: false },
    campaignType: 'general_campaign',
    campaignGoal: 'share_devotional',
    socialPackMode: 'devotional_pack',
    recommendedFor: [],
  },
];
