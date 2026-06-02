import type { CampaignState } from './store';

export interface PresetLike {
  id: string;
  outputSelections: CampaignState['outputSelections'];
  campaignType: string;
  campaignGoal: string;
  recommendedFor: string[];
  socialPackMode: string;
}

export interface GenerateMediaPackRequestLike {
  outputs: {
    presentationDeck: { enabled: boolean };
    socialPack: { enabled: boolean };
    captionPack: { enabled: boolean };
    thumbnail: { enabled: boolean };
  };
  visualStyle: string;
  socialPackMode?: string;
  platforms?: string[];
  imageProvider?: string;
  targetSlideCount?: number;
  deckType?: string;
  branding: {
    mode?: string;
    showLogo?: boolean;
    showAddress?: boolean;
    showWebsite?: boolean;
    showPhone?: boolean;
    showServiceTime?: boolean;
  };
  exportFormats?: string[];
  includeSource?: boolean;
  includeMetadata?: boolean;
  eventDetails?: Record<string, unknown>;
}

export declare function countEnabledOutputs(outputSelections: CampaignState['outputSelections']): number;
export declare function getResolvedCampaignType(campaign: CampaignState): string;
export declare function getResolvedCampaignGoal(campaign: CampaignState): string;
export declare function resolveBestPreset(campaign: CampaignState, presets: PresetLike[]): PresetLike | null;
export declare function isInvitationCampaign(campaign: CampaignState): boolean;
export declare function buildGenerateMediaPackRequest(campaign: CampaignState, visualStyleOverride?: string): GenerateMediaPackRequestLike;
