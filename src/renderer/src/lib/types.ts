import type { CampaignState } from './store';

export interface ChurchKit {
  churchName?: string;
  shortName?: string;
  logoPath?: string;
  logoAssetId?: string;
  address?: string;
  website?: string;
  phone?: string;
  livestreamUrl?: string;
  defaultServiceDay?: string;
  defaultServiceTime?: string;
  timezone?: string;
  socialHandles?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    x?: string;
  };
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  typographyPreset?: string;
  language?: 'en' | 'es';
  defaultCTA?: string;
  logoDisplayPreference?: 'show' | 'hide' | 'footer_only';
  contactDisplayPreference?: 'show_address' | 'show_website' | 'show_phone' | 'minimal';
}

export interface DesignVariantSelection {
  variantId?: string;
  targetType?: string;
  targetId?: string;
  layoutKey?: string;
  typographyPreset?: string;
  visualStyle?: string;
}

export interface CampaignDesignVariant {
  variantId: string;
  campaignId: string;
  targetType: string;
  targetId?: string;
  sourceDesignSpecId?: string;
  designSpec?: Record<string, unknown>;
  layoutKey: string;
  typographyPreset: string;
  visualStyle: string;
  qualityResult?: Record<string, unknown>;
  createdAt: string;
  selected: boolean;
  strategy: string;
  label: string;
  description: string;
}

export interface LayoutTemplateDto {
  layoutKey: string;
  layoutFamily: string;
  platform: 'slide' | 'instagram' | 'facebook' | 'whatsapp' | 'youtube' | 'x';
  format: string;
  purpose: string;
  label: string;
  description: string;
  textZone: 'left' | 'right' | 'center' | 'top' | 'bottom';
  focalPoint: 'left' | 'right' | 'center' | 'top' | 'bottom';
  overlayType: 'gradient' | 'dark_scrim' | 'light_scrim' | 'blur_panel' | 'solid_panel';
  overlayOpacity: number;
  minFontSize: number;
  maxFontSize: number;
  maxTitleLines: number;
  maxBodyLines: number;
  source: 'slide' | 'social';
}

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
  preferredLayoutKey?: string;
  preferredTypographyPreset?: string;
  designVariant?: DesignVariantSelection | null;
  selectedDesignVariantId?: string | null;
  selectedDesignVariant?: DesignVariantSelection | null;
  designVariants?: CampaignDesignVariant[];
  layoutTemplates?: LayoutTemplateDto[];
  churchKit: ChurchKit;
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
  churchKit: ChurchKit;
}

export function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
