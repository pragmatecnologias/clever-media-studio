import type { CampaignState } from './store';

export type CampaignStatus =
  | 'draft'
  | 'analyzed'
  | 'ready_to_generate'
  | 'generating'
  | 'generated'
  | 'needs_review'
  | 'exported'
  | 'failed';

export interface CampaignRecord {
  localId: string;
  title: string;
  type: string;
  goal: string;
  status: CampaignStatus;
  updatedAt: string;
  createdAt: string;
  backendCampaignId: string | null;
  generationJobId: string | null;
  snapshot: CampaignState;
}

export interface AdvancedSettings {
  strategyNotes: string;
  deckType: string;
  targetSlideCount: number | 'auto';
  brandingMode: 'none' | 'logo_only' | 'short_name' | 'full_name_prominent';
  showLogo: boolean;
  showAddress: boolean;
  showWebsite: boolean;
  showPhone: boolean;
  showServiceTime: boolean;
  socialPackMode: SocialPackMode;
  platforms: string[];
  imageProvider: 'auto' | 'openai' | 'fal' | 'local';
  visualStyle: string;
  exportFormats: string[];
  includeSource: boolean;
  includeMetadata: boolean;
}

export type SocialPackMode = 'invitation_campaign' | 'devotional_pack' | 'announcement_pack' | 'recap_pack';

export interface AppSettings {
  defaultLanguage: 'en' | 'es';
  churchName: string;
  churchShortName: string;
  brandColor: string;
  exportFolder: string;
}

export function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
